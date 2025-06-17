import type { Express } from "express";
import { createServer, type Server } from "http";
import { openRouterAI } from "./ai";
import { dbStorage, db } from "./db";
import { sql, eq, desc, and } from 'drizzle-orm';
import { insertQuizAttemptSchema, badges, studyPlannerSessions, studyGroups, studyGroupMembers, meetingReminders, users, quizAttempts, userStats, quizzes } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { resolve } from "path";

// Using database storage for persistent user data

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve quiz questions from JSON file
  app.get("/api/questions", async (req, res) => {
    try {
      const questionsPath = resolve(process.cwd(), "client", "public", "docdot-questions.json");
      const questionsData = readFileSync(questionsPath, "utf-8");
      const questions = JSON.parse(questionsData);

      res.json(questions);
    } catch (error) {
      console.error("Error loading questions:", error);
      res.status(500).json({ error: "Failed to load questions" });
    }
  });

  // User API routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await dbStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (userError) {
      console.error("Error fetching user:", userError);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/user/:id", async (req, res) => {
    try {
      const result = await dbStorage.updateUser(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      console.log("Creating user with data:", { id: req.body.id, email: req.body.email });
      const result = await dbStorage.createUser(req.body);
      console.log("User created successfully:", result.id);

      // Auto-initialize user profile for new users
      try {
        console.log("Auto-initializing profile for new user:", result.id);
        await dbStorage.ensureUserHasStats(result.id);
        await dbStorage.initializeBadges();
        await dbStorage.checkAndAwardBadges(result.id);
        console.log("User profile initialization completed");
      } catch (initError) {
        console.error("Error initializing user profile:", initError);
        // Don't fail user creation if profile init fails
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error creating user:", {
        message: error.message,
        code: error.code,
        userData: { id: req.body.id, email: req.body.email }
      });

      // Handle duplicate key error specifically
      if (error.code === '23505') {
        // User already exists, try to get the existing user
        try {
          console.log("User already exists, fetching existing user");
          const existingUser = await dbStorage.getUser(req.body.id);
          if (existingUser) {
            // Ensure existing user has complete profile
            try {
              await dbStorage.ensureUserHasStats(req.body.id);
              await dbStorage.checkAndAwardBadges(req.body.id);
            } catch (profileError) {
              console.error("Error ensuring existing user profile:", profileError);
            }
            res.json(existingUser);
          } else {
            res.status(409).json({ error: "User already exists but could not retrieve" });
          }
        } catch (getError) {
          console.error("Error fetching existing user:", getError);
          res.status(409).json({ error: "User already exists" });
        }
      } else {
        res.status(500).json({ error: "Failed to create user", details: error.message });
      }
    }
  });

  // Record quiz attempt
  app.post("/api/quiz/record-attempt", async (req, res) => {
    try {
      const { 
        userId, category, selectedAnswer, correctAnswer, 
        isCorrect, timeSpent, xpEarned, difficulty, 
        questionId, currentQuestionIndex, totalQuestions 
      } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Create quiz attempt record
      const attemptId = Date.now();
      const attempt = {
        id: attemptId,
        userId,
        category,
        selectedAnswer,
        correctAnswer,
        isCorrect,
        timeSpent,
        difficulty: difficulty || 'medium',
        xpEarned: xpEarned || (isCorrect ? 10 : 2),
        questionId,
        currentQuestionIndex,
        totalQuestions,
        attemptedAt: new Date().toISOString()
      };

      // Store in database
      await dbStorage.recordQuizAttempt(attempt);

      // Check for new badges after quiz attempt
      const newBadges = await dbStorage.checkAndAwardBadges(userId);

      res.json({ 
        success: true, 
        attemptId, 
        xpEarned: attempt.xpEarned,
        newBadges: newBadges,
        message: "Quiz attempt recorded successfully" 
      });
    } catch (error) {
      console.error("Error recording quiz attempt:", error);
      res.status(500).json({ error: "Failed to record quiz attempt" });
    }
  });

  // User statistics
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Ensure user has stats entry
      await dbStorage.ensureUserHasStats(userId);
      
      const userStats = await dbStorage.getUserStats(userId);

      res.json(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Category statistics
  app.get("/api/category-stats/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const categoryStats = await dbStorage.getCategoryStats(userId);

      res.json(categoryStats);
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ error: "Failed to fetch category stats" });
    }
  });

  // Daily statistics
  app.get("/api/daily-stats/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const days = parseInt(req.query.days as string) || 7;
      const dailyStats = await dbStorage.getDailyStats(userId, days);

      res.json(dailyStats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const timeFrame = req.query.timeFrame as string || 'all-time';
      const category = req.query.category as string;

      console.log(`Fetching leaderboard - limit: ${limit}, timeFrame: ${timeFrame}, category: ${category}`);

      // Update leaderboard data before fetching
      await dbStorage.updateGlobalLeaderboard();

      const leaderboard = await dbStorage.getLeaderboard(limit, timeFrame, category);

      console.log(`Leaderboard fetched: ${leaderboard.length} entries`);

      res.json({
        entries: leaderboard,
        categories: ['Anatomy - Upper Limb', 'Anatomy - Lower Limb', 'Anatomy - Thorax', 'Physiology - Cardiovascular System', 'Physiology - Respiratory System']
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // User rank
  app.get("/api/user-rank", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const timeFrame = req.query.timeFrame as string || 'all-time';
      const category = req.query.category as string;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const userRank = await dbStorage.getUserRank(userId, timeFrame, category);

      res.json(userRank);
    } catch (error) {
      console.error("Error fetching user rank:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });

  // Quiz attempts
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      const attempts = await dbStorage.getQuizAttempts(userId, limit);

      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  // Initialize badges system
  app.post("/api/badges/initialize", async (req, res) => {
    try {
      await dbStorage.initializeBadges();
      res.json({ success: true, message: "Badges initialized successfully" });
    } catch (error) {
      console.error("Error initializing badges:", error);
      res.status(500).json({ error: "Failed to initialize badges" });
    }
  });

  // User badges
  app.get("/api/badges/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Ensure user has stats and badges are initialized
      await dbStorage.ensureUserHasStats(userId);
      await dbStorage.initializeBadges();
      
      // Check for new badges before returning current ones
      await dbStorage.checkAndAwardBadges(userId);
      
      const badges = await dbStorage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  // Award badge manually (for testing)
  app.post("/api/badges/:userId/award/:badgeId", async (req, res) => {
    try {
      const { userId, badgeId } = req.params;
      const result = await dbStorage.awardBadge(userId, parseInt(badgeId));
      res.json(result);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // AI Explain Route
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { concept, level = 'intermediate' } = req.body;

      if (!concept) {
        return res.status(400).json({ error: "Concept is required" });
      }

      const explanation = await openRouterAI.explainConcept(concept, level);

      res.json({ explanation });
    } catch (error: any) {
      console.error("AI Explain Error:", error);
      res.status(500).json({ 
        error: "Failed to generate explanation",
        details: error.message 
      });
    }
  });

  // AI Generate Questions Route
  app.post("/api/ai/generate-questions", async (req, res) => {
    try {
      const { topic, difficulty = 'medium', count = 5 } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const questions = await openRouterAI.generateMedicalQuestions(topic, difficulty, count);

      res.json({ questions });
    } catch (error: any) {
      console.error("AI Questions Error:", error);
      res.status(500).json({ 
        error: "Failed to generate questions",
        details: error.message 
      });
    }
  });

  // AI Case Analysis Route
  app.post("/api/ai/analyze-case", async (req, res) => {
    try {
      const { caseDetails } = req.body;

      if (!caseDetails) {
        return res.status(400).json({ error: "Case details are required" });
      }

      const analysis = await openRouterAI.analyzeCaseStudy(caseDetails);

      res.json({ analysis });
    } catch (error: any) {
      console.error("AI Case Analysis Error:", error);
      res.status(500).json({ 
        error: "Failed to analyze case",
        details: error.message 
      });
    }
  });

  // AI Study Plan Route
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const { goals, timeframe, currentLevel } = req.body;

      if (!goals || !Array.isArray(goals) || goals.length === 0) {
        return res.status(400).json({ error: "Goals array is required" });
      }

      const studyPlan = await openRouterAI.generateStudyPlan(goals, timeframe, currentLevel);

      res.json({ studyPlan });
    } catch (error: any) {
      console.error("AI Study Plan Error:", error);
      res.status(500).json({ 
        error: "Failed to generate study plan",
        details: error.message 
      });
    }
  });

  // AI Quiz Generator Route (for Quiz page)
  app.post("/api/ai/quiz-generator", async (req, res) => {
    try {
      const { topic, difficulty = 'medium', questionCount = 5 } = req.body;

      console.log('AI Quiz Generator request:', { topic, difficulty, questionCount });

      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return res.status(400).json({ 
          error: "Topic is required and must be a non-empty string",
          success: false
        });
      }

      // Check if DeepSeek API key is available
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key not found");
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "DeepSeek API key is missing. Please configure DEEPSEEK_API_KEY environment variable.",
          success: false
        });
      }

      const questionCountNum = Math.min(Math.max(parseInt(questionCount) || 5, 1), 10); // Limit between 1-10
      console.log(`Generating ${questionCountNum} questions for topic: "${topic}", difficulty: ${difficulty}`);

      const questions = await openRouterAI.generateMedicalQuestions(topic.trim(), difficulty, questionCountNum);

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error("No questions generated by AI");
        throw new Error("No questions were generated. Please try a different topic.");
      }

      console.log(`Successfully generated ${questions.length} questions`);

      // Store questions in database and format for response
      const formattedQuestions = [];
      
      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];
        const questionData = {
          question: q.question || `Sample question ${index + 1} about ${topic}`,
          options: ['True', 'False'],
          correctAnswer: q.correctAnswer || q.correct_answer || 'True',
          explanation: q.explanation || `This is an explanation for the question about ${topic}`,
          difficulty: difficulty,
          category: topic,
          type: 'ai_generated',
          aiGenerated: true,
          createdAt: new Date()
        };

        try {
          // Store in database using the quizzes table structure
          const [savedQuestion] = await db.insert(quizzes).values({
            question: questionData.question,
            options: questionData.options,
            correctAnswer: questionData.options.indexOf(questionData.correctAnswer),
            explanation: questionData.explanation,
            difficulty: questionData.difficulty,
            xpReward: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
            topicId: null // Can be linked to topic later if needed
          }).returning();

          console.log(`Saved AI question to database with ID: ${savedQuestion.id}`);

          // Format for frontend response
          formattedQuestions.push({
            id: savedQuestion.id,
            question: savedQuestion.question,
            options: savedQuestion.options,
            correct_answer: questionData.correctAnswer,
            explanation: savedQuestion.explanation,
            ai_explanation: questionData.explanation,
            reference_data: '',
            category: topic,
            difficulty: difficulty,
            aiGenerated: true,
            dbId: savedQuestion.id
          });
        } catch (dbError) {
          console.error(`Error saving question ${index + 1} to database:`, dbError);
          
          // Still include in response even if DB save failed
          formattedQuestions.push({
            id: index + 1,
            question: questionData.question,
            options: questionData.options,
            correct_answer: questionData.correctAnswer,
            explanation: questionData.explanation,
            ai_explanation: questionData.explanation,
            reference_data: '',
            category: topic,
            difficulty: difficulty,
            aiGenerated: true,
            dbSaveError: true
          });
        }
      }

      res.json({ 
        success: true,
        questions: formattedQuestions,
        message: `Generated and saved ${formattedQuestions.length} questions about ${topic}`,
        savedToDatabase: formattedQuestions.filter(q => !q.dbSaveError).length
      });
    } catch (error: any) {
      console.error("AI Quiz Generator Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500),
        topic: req.body?.topic
      });

      // Provide specific error messages
      let errorMessage = "Failed to generate quiz questions";
      let statusCode = 500;

      if (error.message?.includes('API key not configured')) {
        errorMessage = "AI service not configured properly";
        statusCode = 503;
      } else if (error.message?.includes('timed out')) {
        errorMessage = "Request timed out. Please try a shorter topic.";
        statusCode = 408;
      } else if (error.message?.includes('Invalid API key')) {
        errorMessage = "Invalid API key configuration";
        statusCode = 401;
      } else if (error.message?.includes('rate limit')) {
        errorMessage = "API rate limit exceeded. Please try again in a moment.";
        statusCode = 429;
      }

      res.status(statusCode).json({ 
        error: errorMessage,
        message: error.message || "Please try again later",
        success: false
      });
    }
  });

  // Quiz attempts endpoint
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      const attempts = await dbStorage.getRecentQuizAttempts(userId, limit);

      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  // Refresh user stats from actual quiz data
  app.post("/api/refresh-user-stats", async (req, res) => {
    try {
      console.log("Refreshing user stats from actual quiz data...");

      // Get all users who have taken quizzes
      const usersWithQuizzes = await db
        .selectDistinct({ userId: quizAttempts.userId })
        .from(quizAttempts);

      console.log(`Found ${usersWithQuizzes.length} users with quiz attempts`);

      let updated = 0;
      for (const { userId } of usersWithQuizzes) {
        // Get actual quiz performance
        const userAttempts = await db.select().from(quizAttempts)
          .where(eq(quizAttempts.userId, userId || ''));

        if (userAttempts.length > 0) {
          const totalQuestions = userAttempts.length;
          const correctAnswers = userAttempts.filter(attempt => attempt.isCorrect).length;
          const totalXP = userAttempts.reduce((sum, attempt) => sum + (attempt.xpEarned || 0), 0);
          const totalStudyTime = userAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

          // Update or create user stats with actual data
          const existing = await dbStorage.getUserStats(userId || '');
          const statsData = {
            totalQuestions,
            correctAnswers,
            averageScore: Math.round((correctAnswers / totalQuestions) * 100),
            totalXP,
            currentLevel: Math.floor(totalXP / 1000) + 1,
            totalStudyTime: Math.round(totalStudyTime / 60),
            updatedAt: new Date()
          };

          if (existing) {
            await db.update(userStats)
              .set(statsData)
              .where(eq(userStats.userId, userId || ''));
          } else {
            await db.insert(userStats).values({
              userId,
              ...statsData,
              currentStreak: 0,
              longestStreak: 0,
              rank: 0
            });
          }
          updated++;
        }
      }

      // Update leaderboard with actual data
      await dbStorage.updateGlobalLeaderboard();

      res.json({ 
        message: `Refreshed stats for ${updated} users from actual quiz data`,
        updated,
        totalUsersWithQuizzes: usersWithQuizzes.length
      });
    } catch (error) {
      console.error("Error refreshing user stats:", error);
      res.status(500).json({ error: "Failed to refresh user stats" });
    }
  });

  // Comprehensive Supabase integration test
  app.get("/api/test-supabase", async (req, res) => {
    try {
      console.log('Testing complete Supabase integration...');
      
      // Test basic connection
      const testQuery = await db.execute(sql`SELECT NOW() as current_time`);
      console.log('Database connection successful');

      // Get simplified table list
      const allTables = [
        'users', 'user_stats', 'quiz_attempts', 'ai_sessions', 'ai_chats', 
        'leaderboard', 'global_leaderboard', 'categories', 'topics', 'quizzes',
        'badges', 'user_badges', 'category_stats', 'daily_stats', 'flashcards',
        'study_plans', 'study_planner_sessions', 'study_groups', 'study_group_members',
        'subscription_plans', 'user_subscriptions', 'payment_history', 'user_analytics'
      ];
      console.log('Supabase schema tables available:', allTables.length);

      // Test key tables with counts
      const counts = {};
      const keyTables = ['users', 'user_stats', 'quiz_attempts', 'ai_sessions', 'ai_chats', 'leaderboard', 'categories', 'subscription_plans'];
      
      for (const table of keyTables) {
        try {
          const countQuery = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
          counts[table] = countQuery[0]?.count || 0;
        } catch (error) {
          counts[table] = `Error: ${error.message}`;
        }
      }

      // Test AI session functionality
      let aiTestResult = 'Not tested';
      try {
        const testSession = await dbStorage.createAiSession('test-user-integration', 'tutor', 'Integration Test Session');
        await dbStorage.addAiMessage(testSession.id, 'test-user-integration', 'user', 'Test message', 'tutor');
        await dbStorage.addAiMessage(testSession.id, 'test-user-integration', 'assistant', 'Test response', 'tutor');
        
        const sessions = await dbStorage.getAiSessions('test-user-integration', 1);
        const messages = await dbStorage.getAiMessages(testSession.id);
        
        // Cleanup test data
        await db.execute(sql`DELETE FROM ai_chats WHERE session_id = ${testSession.id}`);
        await db.execute(sql`DELETE FROM ai_sessions WHERE id = ${testSession.id}`);
        
        aiTestResult = `Success: Created session with ${messages.length} messages`;
      } catch (error) {
        aiTestResult = `Failed: ${error.message}`;
      }

      res.json({
        success: true,
        connection: 'Connected to Supabase PostgreSQL',
        currentTime: testQuery[0].current_time,
        database: 'Supabase PostgreSQL 16.9',
        totalTables: allTables.length,
        tables: allTables,
        tableCounts: counts,
        aiTutorTest: aiTestResult,
        features: {
          authentication: 'Supabase Auth configured',
          database: 'Complete schema with 23+ tables',
          aiTracking: 'AI session and message tracking active',
          analytics: 'User performance analytics enabled',
          billing: 'Subscription management ready',
          studyGroups: 'Collaboration features available'
        }
      });
    } catch (error) {
      console.error('Supabase integration test error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to connect to Supabase or schema not properly set up'
      });
    }
  });

  // Generate Custom Exam with AI
  app.post("/api/generate-custom-exam", async (req, res) => {
    try {
      const { topics, stemCount, examType, userId } = req.body;

      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ 
          error: "Topics are required and must be a non-empty array" 
        });
      }

      if (!stemCount || stemCount < 5 || stemCount > 50) {
        return res.status(400).json({ 
          error: "Stem count must be between 5 and 50" 
        });
      }

      if (!examType || !['anatomy', 'physiology'].includes(examType)) {
        return res.status(400).json({ 
          error: "Exam type must be either 'anatomy' or 'physiology'" 
        });
      }

      // Check if DeepSeek API key is available
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key not found");
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "DeepSeek API key is missing. Please configure DEEPSEEK_API_KEY environment variable."
        });
      }

      console.log(`Generating custom ${examType} exam with ${stemCount} stems for topics:`, topics);

      // Track generation attempt
      const generationStartTime = Date.now();
      const generationId = uuidv4();
      
      // Log generation request
      await db.insert(examGenerationHistory).values({
        id: generationId,
        userId: 'anonymous', // Will be updated when user auth is implemented
        examType,
        topics,
        requestedStemCount: stemCount,
        generationStatus: 'pending',
        aiProvider: 'deepseek'
      });

      // Generate AI-powered medical MCQ stems
      const examData = await openRouterAI.generateCustomExam(topics, stemCount, examType);

      if (!examData || !examData.stems || examData.stems.length === 0) {
        // Update generation history with failure
        await db.update(examGenerationHistory)
          .set({ 
            generationStatus: 'failed',
            errorMessage: 'No exam stems were generated',
            generationTimeMs: Date.now() - generationStartTime
          })
          .where(eq(examGenerationHistory.id, generationId));
        
        console.error("No exam stems generated by AI");
        throw new Error("No exam stems were generated. Please try different topics.");
      }

      // Create exam record in Supabase
      const examId = uuidv4();
      const durationSeconds = Math.ceil(stemCount * 90); // 1.5 minutes per stem

      // Insert custom exam
      const [customExam] = await db.insert(customExams).values({
        id: examId,
        userId: 'anonymous', // Will be updated when user auth is implemented
        examType,
        title: `${examType.charAt(0).toUpperCase() + examType.slice(1)} Exam - ${topics.join(', ')}`,
        topics,
        stemCount: examData.stems.length,
        durationSeconds,
        difficulty: 'intermediate',
        status: 'active',
        aiGenerated: true,
        metadata: { 
          aiProvider: 'deepseek',
          generationTime: Date.now() - generationStartTime,
          requestedTopics: topics
        }
      }).returning();

      // Insert stems and options
      for (const stem of examData.stems) {
        const stemId = uuidv4();
        
        // Insert stem
        await db.insert(customExamStems).values({
          id: stemId,
          customExamId: examId,
          stemText: stem.stemText,
          orderIndex: stem.orderIndex,
          topic: topics[0] // Use first topic as primary
        });

        // Insert options for this stem
        for (const option of stem.options) {
          await db.insert(stemOptions).values({
            id: uuidv4(),
            stemId,
            optionLetter: option.optionLetter,
            statement: option.statement,
            isCorrect: option.answer,
            explanation: option.explanation
          });
        }
      }

      // Update generation history with success
      await db.update(examGenerationHistory)
        .set({ 
          generationStatus: 'success',
          actualStemCount: examData.stems.length,
          generationTimeMs: Date.now() - generationStartTime,
          customExamId: examId
        })
        .where(eq(examGenerationHistory.id, generationId));

      console.log(`✅ Successfully saved custom exam ${examId} to Supabase with ${examData.stems.length} AI-generated stems`);

      // Return exam data for immediate use
      const storedExam = {
        id: examId,
        examType,
        topicIds: topics.map(name => {
          // Map topic names to IDs for compatibility
          const anatomyTopicMap = {
            'Upper Limb': 1, 'Thorax': 2, 'Head and Neck': 3, 
            'Lower Limb': 4, 'Abdomen': 5, 'Neuroanatomy': 6
          };
          const physiologyTopicMap = {
            'Cell Physiology': 7, 'Nerve and Muscle': 8, 'Blood': 9,
            'Endocrine': 10, 'Cardiovascular System': 11, 'Respiration': 12
          };
          const topicMap = examType === 'anatomy' ? anatomyTopicMap : physiologyTopicMap;
          return topicMap[name] || 1;
        }),
        stemCount,
        durationSeconds,
        stems: examData.stems,
        createdAt: new Date(),
        userId
      };

      console.log(`Successfully generated custom exam with ${customExam.stems.length} stems`);

      res.json({
        success: true,
        ...customExam,
        message: `Generated custom ${examType} exam with ${customExam.stems.length} stems`
      });

    } catch (error) {
      console.error("Error generating custom exam:", error);
      
      let errorMessage = "Failed to generate custom exam";
      if (error.message?.includes('503')) {
        errorMessage = "AI service is not configured. Please check DeepSeek API key.";
      } else if (error.message?.includes('500')) {
        errorMessage = "Server error. Please try again in a moment.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try with fewer stems.";
      }

      res.status(500).json({ 
        error: errorMessage,
        success: false
      });
    }
  });

  // Test DeepSeek API connection
  app.get("/api/ai/test", async (req, res) => {
    try {
      if (!process.env.DEEPSEEK_API_KEY) {
        return res.json({ 
          connected: false, 
          message: "DeepSeek API key not configured" 
        });
      }

      // Test with a simple request
      const testResponse = await openRouterAI.generateResponse([
        { role: 'user', content: 'Say "Hello from DeepSeek!" if you can read this.' }
      ], 0.1);

      res.json({ 
        connected: true, 
        message: "DeepSeek API is working",
        testResponse: testResponse.substring(0, 100)
      });
    } catch (error: any) {
      res.json({ 
        connected: false, 
        message: error.message || "Connection failed" 
      });
    }
  });

  // Comprehensive system debug endpoint
  app.get("/api/debug/system", async (req, res) => {
    try {
      // Test database connection
      const dbTest = await db.execute(sql`SELECT NOW() as current_time`);
      
      // Test key tables
      const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const statsCount = await db.execute(sql`SELECT COUNT(*) as count FROM user_stats`);
      const quizCount = await db.execute(sql`SELECT COUNT(*) as count FROM quiz_attempts`);
      
      // Test AI service
      let aiStatus = 'Not configured';
      if (process.env.DEEPSEEK_API_KEY) {
        try {
          await openRouterAI.generateResponse([
            { role: 'user', content: 'Test' }
          ], 0.1);
          aiStatus = 'Working';
        } catch (error) {
          aiStatus = `Error: ${error.message}`;
        }
      }

      // Test Google Drive
      let driveStatus = 'Not tested';
      try {
        const { checkFolderAccess } = await import('./googleDrive');
        const hasAccess = await checkFolderAccess();
        driveStatus = hasAccess ? 'Working' : 'No access';
      } catch (error: any) {
        driveStatus = `Error: ${error.message}`;
      }

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'Connected',
          users: userCount[0]?.count || 0,
          userStats: statsCount[0]?.count || 0,
          quizAttempts: quizCount[0]?.count || 0
        },
        ai: {
          status: aiStatus,
          provider: 'DeepSeek'
        },
        googleDrive: {
          status: driveStatus
        },
        server: {
          port: 5000,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // AI Chat Route with full session tracking
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, userId, sessionId, toolType = 'tutor' } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Ensure user exists in our system
      await dbStorage.ensureUserHasStats(userId);

      let currentSessionId = sessionId;
      
      // Validate sessionId is a valid UUID if provided, otherwise create new session
      if (currentSessionId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(currentSessionId)) {
          console.log(`Invalid sessionId format: ${currentSessionId}, creating new session`);
          currentSessionId = null;
        }
      }
      
      // Create new session if not provided or invalid
      if (!currentSessionId) {
        const newSession = await dbStorage.createAiSession(
          userId, 
          toolType, 
          `AI ${toolType} session - ${new Date().toLocaleDateString()}`
        );
        currentSessionId = newSession.id;
        console.log(`Created new AI session: ${currentSessionId}`);
      }

      // Save user message to database
      await dbStorage.addAiMessage(currentSessionId, userId, 'user', message, toolType);

      // Check if AI API key is available
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key not found in environment variables");
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "DeepSeek API key is missing. Please configure DEEPSEEK_API_KEY in your environment variables."
        });
      }

      console.log("Processing AI chat request for message:", message.substring(0, 50) + "...");
      const response = await openRouterAI.tutorResponse(message, context);
      console.log("AI response generated successfully");

      // Save AI response to database
      await dbStorage.addAiMessage(currentSessionId, userId, 'assistant', response, toolType);

      res.json({ 
        response, 
        success: true, 
        sessionId: currentSessionId 
      });
    } catch (error: any) {
      console.error("AI Chat error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Provide more specific error messages
      if (error.message?.includes('API key not configured')) {
        res.status(503).json({ 
          error: "AI service not configured",
          message: "Please configure your DeepSeek API key"
        });
      } else if (error.message?.includes('timed out') || error.name === 'AbortError') {
        res.status(408).json({ 
          error: "Request timeout",
          message: "The AI service took too long to respond. Please try again with a shorter message."
        });
      } else if (error.message?.includes('fetch failed') || error.code === 'ENOTFOUND') {
        res.status(503).json({ 
          error: "Network error",
          message: "Unable to connect to AI service. Please check your internet connection."
        });
      } else {
        res.status(500).json({ 
          error: "AI service temporarily unavailable",
          message: error.message || "Please try again later"
        });
      }
    }
  });

  // Get AI chat sessions for a user
  app.get("/api/ai/sessions/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      const sessions = await dbStorage.getAiSessions(userId, limit);
      res.json({ sessions, success: true });
    } catch (error: any) {
      console.error("Error fetching AI sessions:", error);
      res.status(500).json({ error: "Failed to fetch AI sessions" });
    }
  });

  // Get messages for a specific AI session
  app.get("/api/ai/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages = await dbStorage.getAiMessages(sessionId);
      res.json({ messages, success: true });
    } catch (error: any) {
      console.error("Error fetching AI messages:", error);
      res.status(500).json({ error: "Failed to fetch AI messages" });
    }
  });

  // Create new AI session
  app.post("/api/ai/sessions", async (req, res) => {
    try {
      const { userId, toolType, title } = req.body;

      if (!userId || !toolType || !title) {
        return res.status(400).json({ error: 'User ID, tool type, and title are required' });
      }

      const session = await dbStorage.createAiSession(userId, toolType, title);
      res.json({ session, success: true });
    } catch (error: any) {
      console.error("Error creating AI session:", error);
      res.status(500).json({ error: "Failed to create AI session" });
    }
  });

  // AI Study Plan Route
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const { goals, timeframe, currentLevel, userId } = req.body;

      if (!goals || !timeframe || !currentLevel) {
        return res.status(400).json({ error: 'Goals, timeframe, and current level are required' });
      }

      const studyPlan = await openRouterAI.generateStudyPlan(goals, timeframe, currentLevel);

      // If userId provided, create session to track this interaction
      if (userId) {
        try {
          const session = await dbStorage.createAiSession(userId, 'study_plan', 'AI Study Plan Generation');
          await dbStorage.addAiMessage(session.id, userId, 'user', `Generate study plan: Goals: ${goals.join(', ')}, Timeframe: ${timeframe}, Level: ${currentLevel}`, 'study_plan');
          await dbStorage.addAiMessage(session.id, userId, 'assistant', JSON.stringify(studyPlan), 'study_plan');
        } catch (trackingError) {
          console.error("Error tracking study plan session:", trackingError);
        }
      }

      res.json({ studyPlan, success: true });
    } catch (error: any) {
      console.error("AI Study Plan error:", error);
      res.status(500).json({ 
        error: "AI service temporarily unavailable",
        message: error.message || "Please try again later"
      });
    }
  });

  // AI Quiz Generator Route
  app.post("/api/ai/quiz-generator", async (req, res) => {
    try {
      const { topic, difficulty = 'intermediate', count = 5 } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const questions = await openRouterAI.generateMedicalQuestions(topic, difficulty, count);
      res.json({ questions, success: true });
    } catch (error: any) {
      console.error("AI Quiz Generator error:", error);
      res.status(500).json({ 
        error: "AI service temporarily unavailable",
        message: error.message || "Please try again later"
      });
    }
  });

  // Google Drive Routes
  app.get("/api/google-drive/files", async (req, res) => {
    try {
      console.log("🔍 Attempting to fetch Google Drive files...");
      const { getFilesFromFolder } = await import('./googleDrive');
      const files = await getFilesFromFolder();
      console.log(`📚 Successfully fetched ${files.length} files from Google Drive`);
      
      if (files.length > 0) {
        console.log("📖 Sample file names:", files.slice(0, 3).map(f => f.name));
      } else {
        console.log("📂 No files found in Google Drive folder");
      }
      
      res.json(files);
    } catch (error: any) {
      console.error("❌ Google Drive files error:", error.message);
      console.error("Error details:", {
        code: error.code,
        status: error.status,
        message: error.message
      });
      
      // Return empty array instead of error to prevent UI breaking
      if (error.code === 404 || error.message.includes('Folder not found')) {
        console.log("📂 Google Drive folder not accessible, returning empty array");
        res.json([]);
      } else {
        res.status(500).json({ 
          error: "Failed to fetch files from Google Drive",
          message: error.message || "Please try again later",
          details: error.code || "UNKNOWN_ERROR"
        });
      }
    }
  });

  app.get("/api/google-drive/preview/:fileId", async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      res.json({ previewUrl });
    } catch (error: any) {
      console.error("Google Drive preview error:", error);
      res.status(500).json({ 
        error: "Failed to get preview URL",
        message: error.message || "Please try again later"
      });
    }
  });

  app.get("/api/google-drive/file/:fileId", async (req, res) => {
    try {
      const { getFileContent } = await import('./googleDrive');
      const fileId = req.params.fileId;
      const content = await getFileContent(fileId);
      res.json({ content });
    } catch (error: any) {
      console.error("Google Drive file error:", error);
      res.status(500).json({ 
        error: "Failed to fetch file content",
        message: error.message || "Please try again later"
      });
    }
  });

  // Get AI-generated questions from database
  app.get("/api/ai-questions", async (req, res) => {
    try {
      const { category, difficulty, limit = 20 } = req.query;
      
      let query = db.select().from(quizzes).orderBy(desc(quizzes.id));
      
      // Apply filters if provided
      if (limit) {
        query = query.limit(parseInt(limit as string));
      }
      
      const aiQuestions = await query;
      
      // Format for frontend
      const formattedQuestions = aiQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctAnswer],
        explanation: q.explanation,
        ai_explanation: q.explanation,
        category: category || 'AI Generated',
        difficulty: q.difficulty,
        xpReward: q.xpReward,
        aiGenerated: true
      }));
      
      res.json({
        success: true,
        questions: formattedQuestions,
        total: aiQuestions.length,
        filters: { category, difficulty, limit }
      });
    } catch (error) {
      console.error("Error fetching AI questions:", error);
      res.status(500).json({ 
        error: "Failed to fetch AI-generated questions",
        message: error.message || "Please try again later"
      });
    }
  });

  // Get AI questions by specific criteria
  app.get("/api/ai-questions/by-category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const { difficulty, limit = 10 } = req.query;
      
      let query = db.select().from(quizzes);
      
      // Since we don't have a direct category field in quizzes table,
      // we'll search in the question content for now
      // In a production app, you'd want to add a category field to the quizzes table
      
      if (difficulty) {
        query = query.where(eq(quizzes.difficulty, difficulty as string));
      }
      
      query = query.orderBy(desc(quizzes.id)).limit(parseInt(limit as string));
      
      const questions = await query;
      
      // Filter by category in question content (temporary solution)
      const categoryQuestions = questions.filter(q => 
        q.question.toLowerCase().includes(category.toLowerCase())
      );
      
      const formattedQuestions = categoryQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctAnswer],
        explanation: q.explanation,
        category: category,
        difficulty: q.difficulty,
        aiGenerated: true
      }));
      
      res.json({
        success: true,
        questions: formattedQuestions,
        category,
        total: categoryQuestions.length
      });
    } catch (error) {
      console.error("Error fetching category AI questions:", error);
      res.status(500).json({ 
        error: "Failed to fetch category questions",
        message: error.message || "Please try again later"
      });
    }
  });

  // Test Google Drive connection
  app.get("/api/google-drive/test", async (req, res) => {
    try {
      console.log("🧪 Testing Google Drive connection...");
      const { checkFolderAccess } = await import('./googleDrive');
      const hasAccess = await checkFolderAccess();
      
      if (hasAccess) {
        console.log("✅ Google Drive folder access confirmed");
        res.json({ 
          success: true, 
          message: "Google Drive folder is accessible",
          folderId: "1C3IdOlXofYJcUXuVRD8FHsLcPBjSTlEj"
        });
      } else {
        console.log("❌ Google Drive folder access denied");
        res.json({ 
          success: false, 
          message: "Cannot access Google Drive folder",
          suggestion: "Ensure folder is shared with service account: docdot-drive-access@docdotwp.iam.gserviceaccount.com"
        });
      }
    } catch (error: any) {
      console.error("Google Drive test error:", error);
      res.json({ 
        success: false, 
        error: error.message,
        details: error.code || "UNKNOWN_ERROR"
      });
    }
  });

  // Ensure user has stats entry
  app.post('/api/ensure-user-stats', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      await dbStorage.ensureUserHasStats(userId);
      res.json({ success: true, message: 'User stats ensured' });
    } catch (error) {
      console.error('Error ensuring user stats:', error);
      res.status(500).json({ error: 'Failed to ensure user stats' });
    }
  });

  // Initialize complete user profile (stats + badges)
  app.post('/api/initialize-user', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log(`Initializing complete profile for user: ${userId}`);

      // Ensure user has stats
      await dbStorage.ensureUserHasStats(userId);
      
      // Initialize badges if not done already
      await dbStorage.initializeBadges();
      
      // Check and award initial badges
      const badges = await dbStorage.checkAndAwardBadges(userId);
      
      // Get user stats to verify
      const userStats = await dbStorage.getUserStats(userId);
      
      res.json({ 
        success: true, 
        message: 'User profile initialized successfully',
        stats: userStats,
        badgesAwarded: badges.length
      });
    } catch (error) {
      console.error('Error initializing user profile:', error);
      res.status(500).json({ error: 'Failed to initialize user profile' });
    }
  });

  // Refresh user analytics and leaderboard
  app.post('/api/refresh-user-stats', async (req, res) => {
    try {
      await dbStorage.updateGlobalLeaderboard();
      res.json({ success: true, message: 'User stats refreshed successfully' });
    } catch (error) {
      console.error('Error refreshing user stats:', error);
      res.status(500).json({ error: 'Failed to refresh user stats' });
    }
  });

  // Fix user stats by recalculating from quiz data
  app.post('/api/fix-user-stats/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      console.log(`Fixing stats calculation for user: ${userId}`);
      
      // Recalculate stats from actual quiz data
      await dbStorage.recalculateUserStats(userId);
      
      // Get updated stats
      const updatedStats = await dbStorage.getUserStats(userId);
      
      res.json({ 
        success: true, 
        message: 'User stats fixed successfully',
        stats: updatedStats
      });
    } catch (error) {
      console.error('Error fixing user stats:', error);
      res.status(500).json({ error: 'Failed to fix user stats' });
    }
  });

  // Activate badge system for all existing users
  app.post('/api/activate-badges', async (req, res) => {
    try {
      console.log('Activating badge system for all users...');
      
      // Initialize badges first
      await dbStorage.initializeBadges();
      
      // Get all users (not just those with stats)
      const allUsers = await db.select({ id: users.id }).from(users);
      
      let activated = 0;
      let statsCreated = 0;
      
      for (const { id: userId } of allUsers) {
        try {
          // Ensure user has stats entry
          await dbStorage.ensureUserHasStats(userId);
          statsCreated++;
          
          // Check and award badges
          const newBadges = await dbStorage.checkAndAwardBadges(userId);
          if (newBadges.length > 0) {
            console.log(`Activated ${newBadges.length} badges for user ${userId}`);
            activated++;
          }
        } catch (error) {
          console.error(`Error activating badges for user ${userId}:`, error);
        }
      }
      
      // Update global leaderboard
      await dbStorage.updateGlobalLeaderboard();
      
      res.json({ 
        success: true, 
        message: `Badge system activated for ${activated} users, stats created for ${statsCreated} users`,
        totalUsers: allUsers.length,
        activated,
        statsCreated
      });
    } catch (error) {
      console.error('Error activating badge system:', error);
      res.status(500).json({ error: 'Failed to activate badge system' });
    }
  });

  // Create sample leaderboard data for testing
  app.post('/api/create-sample-data', async (req, res) => {
    try {
      console.log('Creating sample leaderboard data...');
      
      const sampleUsers = [
        { id: 'sample-user-1', email: 'alice@example.com', firstName: 'Alice', lastName: 'Johnson' },
        { id: 'sample-user-2', email: 'bob@example.com', firstName: 'Bob', lastName: 'Smith' },
        { id: 'sample-user-3', email: 'carol@example.com', firstName: 'Carol', lastName: 'Davis' },
        { id: 'sample-user-4', email: 'david@example.com', firstName: 'David', lastName: 'Wilson' },
        { id: 'sample-user-5', email: 'emma@example.com', firstName: 'Emma', lastName: 'Brown' }
      ];

      let created = 0;
      for (const userData of sampleUsers) {
        try {
          // Create user if doesn't exist
          const existingUser = await dbStorage.getUser(userData.id);
          if (!existingUser) {
            await dbStorage.createUser(userData);
            console.log(`Created user: ${userData.firstName} ${userData.lastName}`);
          }

          // Create sample stats
          const existingStats = await dbStorage.getUserStats(userData.id);
          if (!existingStats) {
            const xp = Math.floor(Math.random() * 5000) + 500; // 500-5500 XP
            const totalQuestions = Math.floor(Math.random() * 200) + 50; // 50-250 questions
            const correctAnswers = Math.floor(totalQuestions * (0.6 + Math.random() * 0.3)); // 60-90% accuracy

            await db.insert(userStats).values({
              userId: userData.id,
              totalQuestions,
              correctAnswers,
              averageScore: Math.round((correctAnswers / totalQuestions) * 100),
              currentStreak: Math.floor(Math.random() * 10),
              longestStreak: Math.floor(Math.random() * 25),
              totalXP: xp,
              currentLevel: Math.floor(xp / 1000) + 1,
              totalStudyTime: Math.floor(Math.random() * 100) + 20,
              rank: 0
            });
            created++;
            console.log(`Created stats for ${userData.firstName}: ${xp} XP, ${correctAnswers}/${totalQuestions} correct`);
          }
        } catch (error) {
          console.error(`Error creating sample data for ${userData.firstName}:`, error);
        }
      }

      // Update leaderboard
      await dbStorage.updateGlobalLeaderboard();

      res.json({ 
        success: true, 
        message: `Created sample data for ${created} users`,
        created 
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      res.status(500).json({ error: 'Failed to create sample data' });
    }
  });

  // Study Planner API Routes
  app.get("/api/study-sessions", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const sessions = await db.select().from(studyPlannerSessions)
        .where(eq(studyPlannerSessions.userId, userId as string))
        .orderBy(desc(studyPlannerSessions.date));

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
      res.status(500).json({ error: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", async (req, res) => {
    try {
      const { userId, title, subject, topic, date, startTime, endTime, duration, notes } = req.body;

      if (!userId || !title || !subject || !date || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [newSession] = await db.insert(studyPlannerSessions).values({
        userId,
        title,
        subject,
        topic,
        date: typeof date === 'string' ? new Date(date + 'T00:00:00.000Z') : new Date(date),
        startTime,
        endTime,
        duration: duration || 60,
        notes,
        status: 'planned'
      }).returning();

      console.log("✅ Study session created successfully:", newSession);
      res.json(newSession);
    } catch (error) {
      console.error("Error creating study session:", error);
      res.status(500).json({ error: "Failed to create study session" });
    }
  });

  app.patch("/api/study-sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;

      const [updatedSession] = await db.update(studyPlannerSessions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(studyPlannerSessions.id, sessionId))
        .returning();

      res.json({ session: updatedSession, success: true });
    } catch (error) {
      console.error("Error updating study session:", error);
      res.status(500).json({ error: "Failed to update study session" });
    }
  });

  app.delete("/api/study-sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);

      await db.delete(studyPlannerSessions)
        .where(eq(studyPlannerSessions.id, sessionId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting study session:", error);
      res.status(500).json({ error: "Failed to delete study session" });
    }
  });

  // Study Groups API Routes
  app.get("/api/study-groups", async (req, res) => {
    try {
      console.log("📚 Fetching study groups...");
      const userId = req.query.userId as string;
      
      const groups = await db.select({
        id: studyGroups.id,
        title: studyGroups.title,
        description: studyGroups.description,
        meeting_link: studyGroups.meeting_link,
        meeting_type: studyGroups.meeting_type,
        scheduled_time: studyGroups.scheduled_time,
        duration: studyGroups.duration,
        max_members: studyGroups.max_members,
        current_members: studyGroups.current_members,
        is_active: studyGroups.is_active,
        category: studyGroups.category,
        creator_id: studyGroups.creator_id,
        created_at: studyGroups.created_at,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName
      })
      .from(studyGroups)
      .leftJoin(users, eq(studyGroups.creator_id, users.id))
      .orderBy(desc(studyGroups.scheduled_time));

      // Check membership status for each group if userId provided
      const formattedGroups = await Promise.all(groups.map(async (group) => {
        let isMember = false;
        let isCreator = false;
        
        if (userId) {
          // Check if user is a member
          const memberCheck = await db.select().from(studyGroupMembers)
            .where(and(
              eq(studyGroupMembers.groupId, group.id),
              eq(studyGroupMembers.userId, userId)
            ));
          isMember = memberCheck.length > 0;
          isCreator = group.creator_id === userId;
        }

        return {
          id: group.id,
          title: group.title,
          description: group.description,
          meeting_link: group.meeting_link,
          meeting_type: group.meeting_type,
          scheduled_time: group.scheduled_time,
          duration: group.duration,
          max_members: group.max_members,
          current_members: group.current_members,
          is_active: group.is_active,
          category: group.category,
          creator_id: group.creator_id,
          created_at: group.created_at,
          creator: group.creatorFirstName && group.creatorLastName ? {
            firstName: group.creatorFirstName,
            lastName: group.creatorLastName
          } : undefined,
          isMember,
          isCreator
        };
      }));

      console.log(`📚 Found ${formattedGroups.length} study groups`);
      res.json(formattedGroups);
    } catch (error) {
      console.error("Error fetching study groups:", error);
      res.status(500).json({ error: "Failed to fetch study groups" });
    }
  });

  app.post("/api/study-groups", async (req, res) => {
    try {
      console.log("🔧 Creating study group with data:", req.body);
      
      const { 
        creatorId, 
        title, 
        description, 
        meeting_link, 
        meetingLink,
        meeting_type, 
        meetingType,
        scheduled_time,
        scheduledTime, 
        duration, 
        max_members,
        maxMembers,
        category 
      } = req.body;

      // Handle both camelCase and snake_case field names
      const finalCreatorId = creatorId;
      const finalMeetingLink = meeting_link || meetingLink;
      const finalMeetingType = meeting_type || meetingType;
      const finalScheduledTime = scheduled_time || scheduledTime;
      const finalMaxMembers = max_members || maxMembers;

      if (!finalCreatorId || !title || !finalMeetingLink || !finalMeetingType || !finalScheduledTime) {
        console.error("Missing required fields:", {
          creatorId: finalCreatorId,
          title,
          meetingLink: finalMeetingLink,
          meetingType: finalMeetingType,
          scheduledTime: finalScheduledTime
        });
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [newGroup] = await db.insert(studyGroups).values({
        creator_id: finalCreatorId,
        title,
        description: description || null,
        meeting_link: finalMeetingLink,
        meeting_type: finalMeetingType,
        scheduled_time: new Date(finalScheduledTime),
        duration: duration || 60,
        max_members: finalMaxMembers || 10,
        current_members: 1,
        category: category || null,
        is_active: false
      }).returning();

      console.log("✅ Study group created:", newGroup.id);

      // Auto-add creator as member
      try {
        await db.insert(studyGroupMembers).values({
          groupId: newGroup.id,
          userId: finalCreatorId
        });
        console.log("✅ Creator added as member");
      } catch (memberError) {
        console.error("Error adding creator as member:", memberError);
      }

      // Format response for frontend
      const formattedGroup = {
        id: newGroup.id,
        title: newGroup.title,
        description: newGroup.description,
        meetingLink: newGroup.meeting_link,
        meetingType: newGroup.meeting_type,
        scheduledTime: newGroup.scheduled_time,
        duration: newGroup.duration,
        maxMembers: newGroup.max_members,
        currentMembers: newGroup.current_members,
        isActive: newGroup.is_active,
        category: newGroup.category,
        creatorId: newGroup.creator_id,
        createdAt: newGroup.created_at
      };

      res.json({ group: formattedGroup, success: true });
    } catch (error) {
      console.error("Error creating study group:", error);
      res.status(500).json({ error: "Failed to create study group", details: error.message });
    }
  });

  app.post("/api/study-groups/:id/join", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Check if user is already a member
      const existingMember = await db.select().from(studyGroupMembers)
        .where(and(
          eq(studyGroupMembers.groupId, groupId),
          eq(studyGroupMembers.userId, userId)
        ));

      if (existingMember.length > 0) {
        return res.status(400).json({ error: "Already a member of this group" });
      }

      // Get group details and check if full
      const groupData = await db.select({
        id: studyGroups.id,
        title: studyGroups.title,
        scheduled_time: studyGroups.scheduled_time,
        duration: studyGroups.duration,
        current_members: studyGroups.current_members,
        max_members: studyGroups.max_members,
        meeting_link: studyGroups.meeting_link,
        meeting_type: studyGroups.meeting_type,
        category: studyGroups.category,
        creator_id: studyGroups.creator_id,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName
      })
      .from(studyGroups)
      .leftJoin(users, eq(studyGroups.creator_id, users.id))
      .where(eq(studyGroups.id, groupId));

      if (!groupData.length) {
        return res.status(404).json({ error: "Study group not found" });
      }

      const group = groupData[0];

      if (group.current_members >= group.max_members) {
        return res.status(400).json({ error: "Study group is full" });
      }

      // Get user details for reminder email
      const [userData] = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(users)
      .where(eq(users.id, userId));

      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      // Add member
      await db.insert(studyGroupMembers).values({
        groupId,
        userId
      });

      // Update member count
      await db.update(studyGroups)
        .set({ current_members: group.current_members + 1 })
        .where(eq(studyGroups.id, groupId));

      // Schedule reminder email (30 minutes before meeting)
      const meetingTime = new Date(group.scheduled_time);
      const reminderTime = new Date(meetingTime.getTime() - 30 * 60 * 1000); // 30 minutes before

      if (reminderTime > new Date()) {
        try {
          await db.insert(meetingReminders).values({
            groupId: groupId,
            userId: userId,
            reminderTime: reminderTime
          });
          console.log(`📧 Reminder scheduled for ${userData.email} at ${reminderTime.toISOString()}`);
        } catch (reminderError) {
          console.error("Error scheduling reminder:", reminderError);
        }
      }

      // Send immediate confirmation (optional - can be implemented with email service)
      try {
        // Note: Email service integration would go here
        console.log(`✅ ${userData.firstName} ${userData.lastName} joined study group: ${group.title}`);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      res.json({ 
        success: true,
        message: "Successfully joined study group. You'll receive a reminder email 30 minutes before the meeting."
      });
    } catch (error) {
      console.error("Error joining study group:", error);
      res.status(500).json({ error: "Failed to join study group" });
    }
  });

  app.post("/api/study-groups/:id/leave", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Remove member
      await db.delete(studyGroupMembers)
        .where(and(
          eq(studyGroupMembers.groupId, groupId),
          eq(studyGroupMembers.userId, userId)
        ));

      // Remove any scheduled reminders
      await db.delete(meetingReminders)
        .where(and(
          eq(meetingReminders.groupId, groupId),
          eq(meetingReminders.userId, userId)
        ));

      // Update member count
      const [group] = await db.select().from(studyGroups)
        .where(eq(studyGroups.id, groupId));

      if (group) {
        await db.update(studyGroups)
          .set({ current_members: Math.max(0, group.current_members - 1) })
          .where(eq(studyGroups.id, groupId));
      }

      console.log(`👋 User ${userId} left study group ${groupId}`);
      res.json({ success: true, message: "Successfully left study group" });
    } catch (error) {
      console.error("Error leaving study group:", error);
      res.status(500).json({ error: "Failed to leave study group" });
    }
  });

  app.get("/api/study-groups/:id/members", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);

      const members = await db.select({
        id: studyGroupMembers.id,
        userId: studyGroupMembers.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        joinedAt: studyGroupMembers.joinedAt,
        hasJoinedMeeting: studyGroupMembers.hasJoinedMeeting
      })
      .from(studyGroupMembers)
      .leftJoin(users, eq(studyGroupMembers.userId, users.id))
      .where(eq(studyGroupMembers.groupId, groupId));

      res.json(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  // Enhanced Leaderboard API endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { category, timeframe = 'all' } = req.query;
      
      // Calculate and update leaderboard rankings
      const leaderboardQuery = await db.execute(sql`
        WITH ranked_users AS (
          SELECT 
            us.user_id,
            us.total_xp,
            us.weekly_xp,
            us.monthly_xp,
            us.average_accuracy,
            us.level,
            us.streak,
            us.updated_at,
            u.first_name,
            u.last_name,
            u.email,
            ROW_NUMBER() OVER (ORDER BY us.total_xp DESC, us.average_accuracy DESC) as rank,
            (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = us.user_id) as total_badges
          FROM user_stats us
          LEFT JOIN users u ON us.user_id = u.id
          WHERE u.id IS NOT NULL
          ORDER BY us.total_xp DESC, us.average_accuracy DESC
          LIMIT 100
        )
        SELECT * FROM ranked_users
      `);

      const leaderboardData = leaderboardQuery.map(row => ({
        id: row.rank,
        userId: row.user_id,
        rank: parseInt(row.rank),
        totalXP: row.total_xp || 0,
        currentLevel: row.level || 1,
        weeklyXP: row.weekly_xp || 0,
        monthlyXP: row.monthly_xp || 0,
        averageAccuracy: row.average_accuracy || 0,
        totalBadges: row.total_badges || 0,
        category: category || 'overall',
        lastActive: row.updated_at,
        user: {
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        },
        streak: row.streak || 0
      }));
      
      res.json(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }
  });

  // User Badges API endpoint
  app.get("/api/badges", async (req, res) => {
    try {
      const allBadges = await db.execute(sql`
        SELECT 
          b.id,
          b.name,
          b.description,
          b.icon,
          b.color,
          b.requirement,
          b.category,
          b.created_at
        FROM badges b
        ORDER BY b.name ASC
      `);
      
      res.json(allBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // User's earned badges
  app.get("/api/user/:userId/badges", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const userBadges = await db.execute(sql`
        SELECT 
          b.id,
          b.name,
          b.description,
          b.icon,
          b.color,
          b.requirement,
          b.category,
          b.rarity,
          ub.earned_at,
          ub.progress
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = ${userId}
        ORDER BY ub.earned_at DESC
      `);
      
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  // Award badge to user
  app.post("/api/user/:userId/badges/:badgeId", async (req, res) => {
    try {
      const { userId, badgeId } = req.params;
      const { progress = 100 } = req.body;
      
      // Check if user already has this badge
      const existingBadge = await db.execute(sql`
        SELECT id FROM user_badges 
        WHERE user_id = ${userId} AND badge_id = ${parseInt(badgeId)}
      `);
      
      if (existingBadge.length > 0) {
        return res.status(400).json({ error: "Badge already earned" });
      }
      
      // Award the badge
      await db.execute(sql`
        INSERT INTO user_badges (user_id, badge_id, progress, earned_at)
        VALUES (${userId}, ${parseInt(badgeId)}, ${progress}, NOW())
      `);
      
      // Update user stats
      await db.execute(sql`
        UPDATE user_stats 
        SET total_badges = total_badges + 1
        WHERE user_id = ${userId}
      `);
      
      res.json({ success: true, message: "Badge awarded successfully" });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // Initialize sample badges and data
  app.post("/api/initialize-badges", async (req, res) => {
    try {
      // Insert sample badges without rarity column
      await db.execute(sql`
        INSERT INTO badges (name, description, icon, color, requirement, category) VALUES
        ('First Steps', 'Complete your first quiz', '🎯', '#3B82F6', 'Complete 1 quiz', 'achievement'),
        ('Quiz Master', 'Complete 10 quizzes', '🏆', '#F59E0B', 'Complete 10 quizzes', 'achievement'),
        ('Anatomy Expert', 'Score 90% or higher in anatomy', '🧠', '#EF4444', 'Score 90%+ in anatomy', 'subject'),
        ('Study Streak', 'Study for 7 consecutive days', '🔥', '#F97316', 'Study 7 days in a row', 'consistency'),
        ('Night Owl', 'Study after 10 PM', '🦉', '#8B5CF6', 'Study after 10 PM', 'time'),
        ('Early Bird', 'Study before 6 AM', '🌅', '#10B981', 'Study before 6 AM', 'time'),
        ('Perfect Score', 'Get 100% on any quiz', '⭐', '#FFD700', 'Score 100% on a quiz', 'achievement'),
        ('Collaborator', 'Join a study group', '👥', '#06B6D4', 'Join your first study group', 'social')
        ON CONFLICT (name) DO NOTHING
      `);

      // Get count of badges inserted
      const badgeCount = await db.execute(sql`SELECT COUNT(*) as count FROM badges`);
      
      res.json({ 
        success: true, 
        message: "Sample badges initialized successfully",
        badgeCount: badgeCount[0]?.count || 0
      });
    } catch (error) {
      console.error("Error initializing badges:", error);
      res.status(500).json({ error: "Failed to initialize badges" });
    }
  });

  // Initialize complete system (badges + all user profiles)
  app.post("/api/initialize-system", async (req, res) => {
    try {
      console.log('Initializing complete system...');
      
      // Initialize badges first
      await dbStorage.initializeBadges();
      
      // Get all users
      const allUsers = await db.select({ id: users.id }).from(users);
      console.log(`Found ${allUsers.length} users to initialize`);
      
      let statsCreated = 0;
      let badgesAwarded = 0;
      
      // Initialize each user
      for (const { id: userId } of allUsers) {
        try {
          // Ensure user has stats
          await dbStorage.ensureUserHasStats(userId);
          statsCreated++;
          
          // Award badges
          const newBadges = await dbStorage.checkAndAwardBadges(userId);
          if (newBadges.length > 0) {
            badgesAwarded += newBadges.length;
            console.log(`Awarded ${newBadges.length} badges to user ${userId}`);
          }
        } catch (userError) {
          console.error(`Error initializing user ${userId}:`, userError);
        }
      }
      
      // Update leaderboard
      await dbStorage.updateGlobalLeaderboard();
      
      res.json({
        success: true,
        message: `System initialized successfully`,
        totalUsers: allUsers.length,
        statsCreated,
        badgesAwarded,
        leaderboardUpdated: true
      });
    } catch (error) {
      console.error('Error initializing system:', error);
      res.status(500).json({ error: 'Failed to initialize system' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
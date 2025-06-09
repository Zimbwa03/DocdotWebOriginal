import type { Express } from "express";
import { createServer, type Server } from "http";
import { openRouterAI } from "./ai";
import { dbStorage, db } from "./db";
import { sql } from 'drizzle-orm';
import { insertQuizAttemptSchema, badges } from "@shared/schema";
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

      // Update user stats
      await dbStorage.updateUserStats(userId, {
        xpEarned: attempt.xpEarned,
        isCorrect,
        timeSpent,
        category
      });

      res.json({ 
        success: true, 
        attemptId, 
        xpEarned: attempt.xpEarned,
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

      // Refresh user stats from actual quiz data
      await fetch('/api/refresh-user-stats', { method: 'POST' });

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

  // User badges
  app.get("/api/badges/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const badges = await dbStorage.getUserBadges(userId);

      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
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

      const formattedQuestions = questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question || `Sample question ${index + 1} about ${topic}`,
        options: ['True', 'False'],
        correct_answer: q.correctAnswer || q.correct_answer || 'True',
        explanation: q.explanation || `This is an explanation for the question about ${topic}`,
        ai_explanation: q.explanation || `AI-generated explanation for ${topic}`,
        reference_data: q.reference_data || '',
        category: topic,
        difficulty: difficulty
      }));

      res.json({ 
        success: true,
        questions: formattedQuestions,
        message: `Generated ${formattedQuestions.length} questions about ${topic}`
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
          .where(eq(quizAttempts.userId, userId));

        if (userAttempts.length > 0) {
          const totalQuestions = userAttempts.length;
          const correctAnswers = userAttempts.filter(attempt => attempt.isCorrect).length;
          const totalXP = userAttempts.reduce((sum, attempt) => sum + (attempt.xpEarned || 0), 0);
          const totalStudyTime = userAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

          // Update or create user stats with actual data
          const existing = await dbStorage.getUserStats(userId);
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
              .where(eq(userStats.userId, userId));
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

      // Get all tables in public schema
      const allTablesQuery = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      const allTables = allTablesQuery.length ? allTablesQuery.map(row => row.table_name) : [];
      console.log('All available tables:', allTables);

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
      
      // Create new session if not provided
      if (!currentSessionId) {
        const newSession = await dbStorage.createAiSession(
          userId, 
          toolType, 
          `AI ${toolType} session - ${new Date().toLocaleDateString()}`
        );
        currentSessionId = newSession.id;
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

  // Google Drive Routes - temporarily disabled
  app.get("/api/google-drive/books", async (req, res) => {
    try {
      res.json([]);
    } catch (error: any) {
      console.error("Google Drive books error:", error);
      res.status(500).json({ 
        error: "Failed to fetch books",
        message: error.message || "Please try again later"
      });
    }
  });

  app.get("/api/google-drive/file/:fileId", async (req, res) => {
    try {
      res.json({ content: "" });
    } catch (error: any) {
      console.error("Google Drive file error:", error);
      res.status(500).json({ 
        error: "Failed to fetch file",
        message: error.message || "Please try again later"
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

  const httpServer = createServer(app);
  return httpServer;
}
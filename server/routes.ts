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

  // User profile management API routes
  
  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await dbStorage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Create or update user profile (upsert)
  app.post("/api/user", async (req, res) => {
    try {
      const userData = req.body;
      const user = await dbStorage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error upserting user:", error);
      res.status(500).json({ error: "Failed to save user" });
    }
  });

  // Update user profile
  app.put("/api/user/:id", async (req, res) => {
    try {
      const updates = req.body;
      const updatedUser = await dbStorage.updateUser(req.params.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // User stats endpoints
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userStats = await dbStorage.getUserStats(userId);
      
      if (!userStats) {
        // Initialize stats for new user
        await dbStorage.updateUserStats(userId, true, 0, 0);
        const newStats = await dbStorage.getUserStats(userId);
        return res.json(newStats || { totalXp: 0, level: 1, currentStreak: 0, averageAccuracy: 0, totalQuizzes: 0, totalTimeSpent: 0 });
      }
      
      res.json(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Update user stats
  app.post("/api/user-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { isCorrect, xpEarned, timeSpent } = req.body;
      
      await dbStorage.updateUserStats(userId, isCorrect, xpEarned || 10, timeSpent || 0);
      const updatedStats = await dbStorage.getUserStats(userId);
      
      res.json(updatedStats);
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ error: "Failed to update user stats" });
    }
  });

  // Quiz attempts endpoints
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const attempts = await dbStorage.getRecentQuizAttempts(userId, limit);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  // Record quiz attempt
  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const attemptData = req.body;
      const result = await dbStorage.recordQuizAttempt(attemptData);
      
      // Update user stats based on quiz performance
      await dbStorage.updateUserStats(
        attemptData.userId, 
        attemptData.isCorrect, 
        attemptData.isCorrect ? 10 : 0, 
        attemptData.timeSpent || 0
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error recording quiz attempt:", error);
      res.status(500).json({ error: "Failed to record quiz attempt" });
    }
  });

  // Badges endpoints
  app.get("/api/badges/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Initialize badges if not exists
      await dbStorage.initializeBadges();
      
      const badges = await dbStorage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Check and award badges
  app.post("/api/badges/:userId/check", async (req, res) => {
    try {
      const { userId } = req.params;
      await dbStorage.checkBadgeProgress(userId);
      const badges = await dbStorage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error checking badges:", error);
      res.status(500).json({ error: "Failed to check badges" });
    }
  });

  // Leaderboard endpoints
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string;
      const timeFrame = req.query.timeFrame as string || 'all-time';
      
      const leaderboard = await dbStorage.getEnhancedLeaderboard(limit, category, timeFrame);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // User rank endpoint
  app.get("/api/user-rank", async (req, res) => {
    try {
      const { userId } = req.query;
      const category = req.query.category as string;
      const timeFrame = req.query.timeFrame as string || 'all-time';
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const rank = await dbStorage.getUserRank(userId as string, category, timeFrame);
      res.json({ rank });
    } catch (error) {
      console.error("Error fetching user rank:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });

  // Update leaderboard
  app.post("/api/leaderboard/:userId/update", async (req, res) => {
    try {
      const { userId } = req.params;
      await dbStorage.updateLeaderboard(userId);
      await dbStorage.updateLeaderboardRanks();
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      res.status(500).json({ error: "Failed to update leaderboard" });
    }
  });

  // Initialize user gamification data with sample analytics
  app.post("/api/initialize-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user already has stats
      let userStats = await dbStorage.getUserStats(userId);
      
      if (!userStats) {
        // Create comprehensive initial user stats to demonstrate the system
        await dbStorage.updateUserStats(userId, true, 100, 600); // Correct answer, 100 XP, 10 minutes
        await dbStorage.updateUserStats(userId, true, 75, 450); // Correct answer, 75 XP, 7.5 minutes
        await dbStorage.updateUserStats(userId, false, 0, 300); // Wrong answer, 0 XP, 5 minutes
        await dbStorage.updateUserStats(userId, true, 120, 720); // Correct answer, 120 XP, 12 minutes
        await dbStorage.updateUserStats(userId, true, 90, 540); // Correct answer, 90 XP, 9 minutes
        
        // Update category stats for different subjects
        await dbStorage.updateCategoryStats(userId, 'Anatomy', true, 360);
        await dbStorage.updateCategoryStats(userId, 'Physiology', true, 300);
        await dbStorage.updateCategoryStats(userId, 'Pathology', false, 240);
        await dbStorage.updateCategoryStats(userId, 'Pharmacology', true, 420);
        
        // Update daily stats for the past few days
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          await dbStorage.updateDailyStats(userId, 'General', i % 2 === 0, 80);
        }
        
        userStats = await dbStorage.getUserStats(userId);
      }
      
      // Initialize badges system
      await dbStorage.initializeBadges();
      await dbStorage.checkBadgeProgress(userId);
      
      // Update leaderboard position
      await dbStorage.updateLeaderboard(userId);
      
      const badges = await dbStorage.getUserBadges(userId);
      const rank = await dbStorage.getUserRank(userId);
      
      res.json({
        stats: userStats,
        badges: badges || [],
        rank: rank || { rank: 1, totalXP: userStats?.totalXP || 0, averageAccuracy: userStats?.averageScore || 0 },
        initialized: true,
        message: "User data initialized with sample analytics"
      });
    } catch (error) {
      console.error("Error initializing user:", error);
      res.status(500).json({ error: "Failed to initialize user data" });
    }
  });

  // AI-powered endpoints
  
  // Get AI chat sessions for user (disabled for now)
  // app.get("/api/ai/sessions/:userId", async (req, res) => {
  //   try {
  //     const { userId } = req.params;
  //     const sessions = await db
  //       .select()
  //       .from(aiSessions)
  //       .where(eq(aiSessions.userId, userId))
  //       .orderBy(desc(aiSessions.updatedAt));
  //     res.json({ sessions });
  //   } catch (error) {
  //     console.error("Get sessions error:", error);
  //     res.status(500).json({ error: "Failed to fetch sessions" });
  //   }
  // });

  // Get chat history for a session (disabled for now)
  // app.get("/api/ai/chat/:sessionId", async (req, res) => {
  //   try {
  //     const { sessionId } = req.params;
  //     const messages = await db
  //       .select()
  //       .from(aiChats)
  //       .where(eq(aiChats.sessionId, sessionId))
  //       .orderBy(aiChats.createdAt);
  //     res.json({ messages });
  //   } catch (error) {
  //     console.error("Get chat history error:", error);
  //     res.status(500).json({ error: "Failed to fetch chat history" });
  //   }
  // });

  // Test OpenRouter API directly
  app.post("/api/ai/test", async (req, res) => {
    try {
      const { message = "What is myocardial infarction?" } = req.body;
      console.log("Testing OpenRouter API with message:", message);
      
      // Direct API test without any database dependencies
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OpenRouter API key not configured" });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://docdot.app',
          'X-Title': 'Docdot Medical Learning Platform'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'system', content: 'You are a medical education expert. Provide clear, accurate medical information.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        return res.status(500).json({ error: `OpenRouter API error: ${response.status} - ${errorText}` });
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response generated';
      
      res.json({ response: aiResponse, success: true });
    } catch (error: any) {
      console.error("OpenRouter test error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Tutor Chat with history
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, userId, sessionId, toolType = 'tutor' } = req.body;
      
      console.log("Received AI chat request:", { message, context, userId, toolType });
      
      // Direct OpenRouter API call (bypassing the ai.ts service for now)
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OpenRouter API key not configured" });
      }

      const systemPrompt = `You are an expert medical tutor with deep knowledge in anatomy, physiology, pathology, pharmacology, and clinical medicine. 
Your goal is to help medical students learn effectively through clear explanations, examples, and educational guidance.

CRITICAL FORMATTING RULES:
- Never use markdown formatting (**, *, _, etc.)
- Never use emojis or special characters
- Write in plain text only
- Use professional medical language
- Structure responses with clear paragraphs
- Use numbered lists for steps or multiple points

Guidelines:
- Provide accurate, evidence-based medical information
- Use clear, educational language appropriate for medical students
- Include relevant examples and mnemonics when helpful
- Encourage critical thinking
- Always emphasize the importance of clinical correlation
- If unsure about specific clinical recommendations, advise consulting current medical literature
- Give direct, comprehensive answers without asking for clarification unless absolutely necessary

${context ? `Context: ${context}` : ''}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://docdot.app',
          'X-Title': 'Docdot Medical Learning Platform'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        return res.status(500).json({ error: `AI service error: ${response.status}` });
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      
      res.json({ response: aiResponse, sessionId: sessionId || uuidv4() });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: error.message || "AI service unavailable" });
    }
  });

  // Generate Medical Questions
  app.post("/api/ai/generate-questions", async (req, res) => {
    try {
      const { topic, difficulty, count = 5 } = req.body;
      
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OpenRouter API key not configured" });
      }

      const systemPrompt = `You are an expert medical educator. Generate ${count} multiple-choice questions about ${topic} at ${difficulty} difficulty level. 
Each question should be medically accurate and educational.

CRITICAL FORMATTING RULES:
- Return ONLY valid JSON format
- No markdown formatting or special characters
- No explanatory text outside the JSON

Return a JSON array with this exact format:
[
  {
    "question": "Question text here",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "explanation": "Detailed explanation of why this is correct",
    "category": "${topic}",
    "difficulty": "${difficulty}"
  }
]`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://docdot.app',
          'X-Title': 'Docdot Medical Learning Platform'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate ${count} medical questions about ${topic}` }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        return res.status(500).json({ error: "Question generation failed" });
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '[]';
      
      try {
        const questions = JSON.parse(aiResponse);
        res.json({ questions });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        res.json({ questions: [] });
      }
    } catch (error: any) {
      console.error("Question generation error:", error);
      res.status(500).json({ error: "Question generation failed" });
    }
  });

  // Explain Medical Concept
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { concept, level = 'intermediate' } = req.body;
      
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OpenRouter API key not configured" });
      }

      const systemPrompt = `You are a medical educator explaining complex concepts clearly. 
Explain the concept at ${level} level with:
- Clear definition
- Key points
- Clinical relevance
- Memory aids if applicable
- Related concepts

CRITICAL FORMATTING RULES:
- Never use markdown formatting (**, *, _, etc.)
- Never use emojis or special characters
- Write in plain text only
- Use professional medical language
- Structure responses with clear paragraphs
- Use numbered lists for steps or multiple points`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://docdot.app',
          'X-Title': 'Docdot Medical Learning Platform'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Explain: ${concept}` }
          ],
          temperature: 0.6,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        return res.status(500).json({ error: "Explanation generation failed" });
      }

      const data = await response.json();
      const explanation = data.choices[0]?.message?.content || 'Unable to generate explanation.';
      
      res.json({ explanation });
    } catch (error: any) {
      console.error("Concept explanation error:", error);
      res.status(500).json({ error: "Explanation generation failed" });
    }
  });

  // Generate Study Plan
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const { goals, timeframe, currentLevel } = req.body;
      const studyPlan = await openRouterAI.generateStudyPlan(goals, timeframe, currentLevel);
      res.json({ studyPlan });
    } catch (error) {
      console.error("Study plan generation error:", error);
      res.status(500).json({ error: "Study plan generation failed" });
    }
  });

  // Case Study Analysis
  app.post("/api/ai/analyze-case", async (req, res) => {
    try {
      const { caseDetails } = req.body;
      const analysis = await openRouterAI.analyzeCaseStudy(caseDetails);
      res.json({ analysis });
    } catch (error) {
      console.error("Case analysis error:", error);
      res.status(500).json({ error: "Case analysis failed" });
    }
  });

  // Personalized Learning Recommendations
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { weakAreas, strengths, learningStyle } = req.body;
      const recommendations = await openRouterAI.getPersonalizedRecommendations(weakAreas, strengths, learningStyle);
      res.json({ recommendations });
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Recommendations generation failed" });
    }
  });

  // Analytics and User Stats API Routes
  
  // Record quiz attempt with comprehensive stats tracking
  app.post("/api/quiz/attempt", async (req, res) => {
    try {
      const attemptData = req.body;
      console.log('Recording quiz attempt for user:', attemptData.userId);
      
      // Use the XP calculation from frontend (includes streak bonus)
      const xpEarned = attemptData.xpEarned || (attemptData.isCorrect ? 10 : 2);
      
      const quizAttempt = await dbStorage.recordQuizAttempt({
        userId: attemptData.userId,
        quizId: attemptData.quizId || null,
        category: attemptData.category,
        selectedAnswer: attemptData.selectedAnswer,
        correctAnswer: attemptData.correctAnswer,
        isCorrect: attemptData.isCorrect,
        timeSpent: attemptData.timeSpent || 0,
        difficulty: attemptData.difficulty || 'medium',
        xpEarned: xpEarned
      });
      
      console.log('Quiz attempt recorded successfully:', quizAttempt.id);
      res.json({ success: true, attempt: quizAttempt, xpEarned });
    } catch (error) {
      console.error("Error recording quiz attempt:", error);
      res.status(500).json({ error: "Failed to record quiz attempt", details: error.message });
    }
  });

  // Get user statistics - Enhanced with comprehensive analytics
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userStats = await dbStorage.getUserStats(userId);
      
      if (!userStats) {
        // Return default stats for new users
        return res.json({
          totalXp: 0,
          level: 1,
          currentStreak: 0,
          averageAccuracy: 0,
          totalQuizzes: 0,
          totalTimeSpent: 0,
          rank: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          longestStreak: 0
        });
      }
      
      res.json(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  });

  // Get category-specific statistics
  app.get("/api/category-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const categoryStats = await dbStorage.getCategoryStats(userId);
      res.json(categoryStats);
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ error: "Failed to fetch category statistics" });
    }
  });

  // Get daily performance statistics
  app.get("/api/daily-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const days = parseInt(req.query.days as string) || 7;
      const dailyStats = await dbStorage.getDailyStats(userId, days);
      res.json(dailyStats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ error: "Failed to fetch daily statistics" });
    }
  });

  // Get recent quiz attempts
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // This would typically come from database, but for now using in-memory storage
      const attempts = await dbStorage.getRecentQuizAttempts(userId, limit);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  // Get leaderboard data
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const leaderboard = await dbStorage.getLeaderboard(limit, category);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Enhanced quiz attempt recording with detailed analytics
  app.post("/api/quiz/record-attempt", async (req, res) => {
    try {
      const attemptData = req.body;
      console.log('Recording detailed quiz attempt:', attemptData);
      
      const userId = attemptData.userId;
      const category = attemptData.category;
      const isCorrect = attemptData.isCorrect;
      const timeSpent = attemptData.timeSpent || 0;
      const xpEarned = attemptData.xpEarned || (isCorrect ? 10 : 2);
      
      // Ensure user exists in database before recording attempt
      try {
        const existingUser = await dbStorage.getUser(userId);
        if (!existingUser) {
          // Create user with minimal data if they don't exist
          await dbStorage.createUser({
            id: userId,
            email: `user_${userId}@temp.com`, // Temporary email
            firstName: 'User',
            lastName: 'Student'
          });
          console.log('Created user record for:', userId);
        }
      } catch (userError) {
        console.log('User creation error (may already exist):', userError);
      }
      
      // Record the quiz attempt (quizId set to null since we're using JSON questions)
      const quizAttempt = await dbStorage.recordQuizAttempt({
        userId,
        quizId: null, // Set to null since questions come from JSON files, not quizzes table
        questionIdentifier: attemptData.questionIdentifier || attemptData.questionId,
        category,
        selectedAnswer: attemptData.selectedAnswer,
        correctAnswer: attemptData.correctAnswer,
        isCorrect,
        timeSpent,
        difficulty: attemptData.difficulty || 'medium',
        xpEarned
      });
      
      console.log('Quiz attempt recorded with enhanced analytics:', quizAttempt.id);
      res.json({ 
        success: true, 
        attempt: quizAttempt, 
        xpEarned,
        message: 'Quiz attempt recorded with comprehensive analytics'
      });
    } catch (error: any) {
      console.error("Error recording enhanced quiz attempt:", error);
      res.status(500).json({ 
        error: "Failed to record quiz attempt with analytics", 
        details: error.message 
      });
    }
  });

  // Get comprehensive analytics dashboard data
  app.get("/api/analytics-dashboard/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Fetch all analytics data in parallel
      const [userStats, categoryStats, dailyStats, recentAttempts, leaderboard] = await Promise.all([
        dbStorage.getUserStats(userId),
        dbStorage.getCategoryStats(userId),
        dbStorage.getDailyStats(userId, 30),
        dbStorage.getRecentQuizAttempts(userId, 20),
        dbStorage.getLeaderboard(10)
      ]);
      
      // Calculate additional metrics
      const analytics = {
        userStats: userStats || {
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalXP: 0,
          currentLevel: 1,
          totalStudyTime: 0,
          rank: 0
        },
        categoryBreakdown: categoryStats,
        performanceTrends: dailyStats,
        recentActivity: recentAttempts,
        leaderboardPosition: leaderboard,
        weakestAreas: categoryStats
          .filter((cat: any) => cat.questionsAttempted >= 3)
          .sort((a: any, b: any) => a.averageScore - b.averageScore)
          .slice(0, 3),
        strongestAreas: categoryStats
          .filter((cat: any) => cat.questionsAttempted >= 3)
          .sort((a: any, b: any) => b.averageScore - a.averageScore)
          .slice(0, 3)
      };
      
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics dashboard:", error);
      res.status(500).json({ error: "Failed to fetch analytics dashboard" });
    }
  });

  // Get category performance stats
  app.get("/api/user/:userId/category-stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const categoryStats = await dbStorage.getCategoryStats(userId);
      res.json(categoryStats);
    } catch (error) {
      console.error("Error getting category stats:", error);
      res.status(500).json({ error: "Failed to get category stats" });
    }
  });

  // Get daily performance stats
  app.get("/api/user/:userId/daily-stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const { days = 7 } = req.query;
      const dailyStats = await dbStorage.getDailyStats(userId, parseInt(days as string));
      res.json(dailyStats);
    } catch (error) {
      console.error("Error getting daily stats:", error);
      res.status(500).json({ error: "Failed to get daily stats" });
    }
  });



  // Quiz attempts route to match frontend expectations
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;
      
      // Get recent quiz attempts for user
      const attempts = []; // This should fetch from database
      res.json(attempts);
    } catch (error) {
      console.error("Error getting quiz attempts:", error);
      res.status(500).json({ error: "Failed to get quiz attempts" });
    }
  });

  // Category stats route to match frontend expectations
  app.get("/api/category-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const categoryStats = await dbStorage.getCategoryStats(userId);
      res.json(categoryStats);
    } catch (error) {
      console.error("Error getting category stats:", error);
      res.status(500).json({ error: "Failed to get category stats" });
    }
  });

  // Daily stats route to match frontend expectations
  app.get("/api/daily-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { days = 7 } = req.query;
      const dailyStats = await dbStorage.getDailyStats(userId, parseInt(days as string));
      res.json(dailyStats);
    } catch (error) {
      console.error("Error getting daily stats:", error);
      res.status(500).json({ error: "Failed to get daily stats" });
    }
  });

  // Get leaderboard with enhanced features
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { category, timeFrame = 'all-time', limit = 50 } = req.query;
      const leaderboard = await dbStorage.getEnhancedLeaderboard(
        parseInt(limit as string), 
        category as string,
        timeFrame as string
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Get user rank
  app.get("/api/user-rank", async (req, res) => {
    try {
      const { userId, category, timeFrame = 'all-time' } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const rank = await dbStorage.getUserRank(userId as string, category as string, timeFrame as string);
      res.json(rank);
    } catch (error) {
      console.error("Error getting user rank:", error);
      res.status(500).json({ error: "Failed to get user rank" });
    }
  });

  // Study Guide API Routes
  app.get('/api/study-guide/sections', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM study_guide_sections 
        WHERE is_active = true 
        ORDER BY order_index, title
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching study guide sections:', error);
      res.status(500).json({ error: 'Failed to fetch study guide sections' });
    }
  });

  app.get('/api/study-guide/topics/:sectionId', async (req, res) => {
    try {
      const { sectionId } = req.params;
      const { userId } = req.query;
      
      const result = await db.execute(sql`
        SELECT 
          t.*,
          COALESCE(p.completion_percentage, 0) as completion_percentage,
          COALESCE(p.is_bookmarked, false) as is_bookmarked,
          p.notes,
          p.last_accessed
        FROM study_guide_topics t
        LEFT JOIN study_guide_progress p ON t.id = p.topic_id AND p.user_id = ${userId}
        WHERE t.section_id = ${sectionId}
        ORDER BY t.order_index, t.title
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching study guide topics:', error);
      res.status(500).json({ error: 'Failed to fetch study guide topics' });
    }
  });

  app.get('/api/study-guide/topic/:topicId', async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId } = req.query;
      
      const result = await db.execute(sql`
        SELECT 
          t.*,
          s.title as section_title,
          COALESCE(p.completion_percentage, 0) as completion_percentage,
          COALESCE(p.is_bookmarked, false) as is_bookmarked,
          p.notes,
          p.last_accessed
        FROM study_guide_topics t
        JOIN study_guide_sections s ON t.section_id = s.id
        LEFT JOIN study_guide_progress p ON t.id = p.topic_id AND p.user_id = ${userId}
        WHERE t.id = ${topicId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      // Update last accessed time
      if (userId) {
        await db.execute(sql`
          INSERT INTO study_guide_progress (user_id, topic_id, last_accessed)
          VALUES (${userId}, ${topicId}, NOW())
          ON CONFLICT (user_id, topic_id)
          DO UPDATE SET last_accessed = NOW()
        `);
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching study guide topic:', error);
      res.status(500).json({ error: 'Failed to fetch study guide topic' });
    }
  });

  app.post('/api/study-guide/progress', async (req, res) => {
    try {
      const { userId, topicId, completionPercentage, notes, isBookmarked } = req.body;
      
      if (!userId || !topicId) {
        return res.status(400).json({ error: 'User ID and topic ID required' });
      }

      await db.execute(sql`
        INSERT INTO study_guide_progress (
          user_id, topic_id, completion_percentage, notes, is_bookmarked, last_accessed
        )
        VALUES (${userId}, ${topicId}, ${completionPercentage || 0}, ${notes || ''}, ${isBookmarked || false}, NOW())
        ON CONFLICT (user_id, topic_id)
        DO UPDATE SET 
          completion_percentage = ${completionPercentage || 0},
          notes = ${notes || ''},
          is_bookmarked = ${isBookmarked || false},
          last_accessed = NOW()
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating study guide progress:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  });

  app.get('/api/study-guide/user-progress/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT p.topic_id) as topics_started,
          COUNT(DISTINCT CASE WHEN p.completion_percentage >= 100 THEN p.topic_id END) as topics_completed,
          COUNT(DISTINCT CASE WHEN p.is_bookmarked THEN p.topic_id END) as bookmarked_topics,
          AVG(p.completion_percentage) as average_progress
        FROM study_guide_progress p
        WHERE p.user_id = ${userId}
      `);
      
      res.json(result.rows[0] || {
        topics_started: 0,
        topics_completed: 0,
        bookmarked_topics: 0,
        average_progress: 0
      });
    } catch (error) {
      console.error('Error fetching user study progress:', error);
      res.status(500).json({ error: 'Failed to fetch user progress' });
    }
  });

  // Get badges for user
  app.get("/api/badges/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const badges = await dbStorage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error getting user badges:", error);
      res.status(500).json({ error: "Failed to get user badges" });
    }
  });

  // Get user badges
  app.get("/api/badges/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Initialize badges if they don't exist
      await dbStorage.initializeBadges();
      
      // Get user's earned badges
      const earnedBadges = await dbStorage.getUserBadges(userId);
      
      // Get all available badges
      const allBadges = await db.select().from(badges);
      
      // Calculate progress for each badge
      const availableBadges = [];
      for (const badge of allBadges) {
        const isEarned = Array.isArray(earnedBadges) && earnedBadges.some((eb: any) => eb.badgeId === badge.id);
        if (!isEarned) {
          const progress = await dbStorage.calculateBadgeProgress(userId, badge);
          availableBadges.push({
            ...badge,
            progress,
            earned: false
          });
        }
      }
      
      // Add earned status to earned badges
      const earnedWithDetails = Array.isArray(earnedBadges) ? earnedBadges.map((earned: any) => {
        const badge = allBadges.find(b => b.id === earned.badgeId);
        return {
          ...badge,
          ...earned,
          earned: true,
          progress: badge?.requirement || 0
        };
      }) : [];
      
      res.json({
        earned: earnedWithDetails,
        available: availableBadges
      });
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Award badge to user
  app.post("/api/badges/:userId/award", async (req, res) => {
    try {
      const { userId } = req.params;
      const { badgeId, progress } = req.body;
      
      const result = await dbStorage.awardBadge(userId, badgeId, progress);
      res.json(result);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // Check and update badge progress
  app.post("/api/badges/:userId/check-progress", async (req, res) => {
    try {
      const { userId } = req.params;
      const newBadges = await dbStorage.checkBadgeProgress(userId);
      res.json({ newBadges });
    } catch (error) {
      console.error("Error checking badge progress:", error);
      res.status(500).json({ error: "Failed to check badge progress" });
    }
  });

  const httpServer = createServer(app);

  // Study Groups API Routes
  app.get('/api/study-groups', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          sg.*,
          u.first_name as "creatorFirstName",
          u.last_name as "creatorLastName",
          (
            SELECT COUNT(*) 
            FROM study_group_members sgm 
            WHERE sgm.group_id = sg.id
          ) as current_members,
          CASE 
            WHEN sg.scheduled_time <= NOW() AND sg.scheduled_time > NOW() - INTERVAL '1 hour'
            THEN true 
            ELSE false 
          END as is_active
        FROM study_groups sg
        LEFT JOIN users u ON sg.creator_id = u.id
        ORDER BY sg.scheduled_time ASC
      `);
      
      const groups = result.rows.map((row: any) => ({
        ...row,
        creator: {
          firstName: row.creatorFirstName,
          lastName: row.creatorLastName
        }
      }));
      
      res.json(groups);
    } catch (error) {
      console.error('Error fetching study groups:', error);
      res.status(500).json({ error: 'Failed to fetch study groups' });
    }
  });

  app.post('/api/study-groups', async (req, res) => {
    try {
      const groupData = req.body;
      const result = await db.execute(sql`
        INSERT INTO study_groups (
          creator_id, title, description, meeting_link, meeting_type,
          scheduled_time, duration, max_members, category
        ) VALUES (
          ${groupData.creatorId}, ${groupData.title}, ${groupData.description},
          ${groupData.meetingLink}, ${groupData.meetingType}, 
          ${groupData.scheduledTime}, ${groupData.duration}, 
          ${groupData.maxMembers}, ${groupData.category}
        ) RETURNING *
      `);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating study group:', error);
      res.status(500).json({ error: 'Failed to create study group' });
    }
  });

  app.post('/api/study-groups/:groupId/join', async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      
      // Check if user is already a member
      const existingMember = await db.execute(sql`
        SELECT id FROM study_group_members 
        WHERE group_id = ${groupId} AND user_id = ${userId}
      `);
      
      if (existingMember.rows.length > 0) {
        return res.status(400).json({ error: 'User is already a member' });
      }
      
      // Add user to group
      await db.execute(sql`
        INSERT INTO study_group_members (group_id, user_id)
        VALUES (${groupId}, ${userId})
      `);
      
      // Update current members count
      await db.execute(sql`
        UPDATE study_groups 
        SET current_members = current_members + 1
        WHERE id = ${groupId}
      `);
      
      res.json({ success: true, message: 'Successfully joined study group' });
    } catch (error) {
      console.error('Error joining study group:', error);
      res.status(500).json({ error: 'Failed to join study group' });
    }
  });

  // Study Planner Sessions API Routes
  app.get('/api/study-planner-sessions', async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM study_planner_sessions 
        WHERE user_id = ${userId}
        ORDER BY date DESC, start_time ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      res.status(500).json({ error: 'Failed to fetch study sessions' });
    }
  });

  app.post('/api/study-planner-sessions', async (req, res) => {
    try {
      const sessionData = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO study_planner_sessions (
          user_id, title, subject, topic, date, start_time, 
          end_time, duration, notes
        ) VALUES (
          ${sessionData.userId}, ${sessionData.title}, ${sessionData.subject},
          ${sessionData.topic}, ${sessionData.date}, ${sessionData.startTime},
          ${sessionData.endTime}, ${sessionData.duration}, ${sessionData.notes}
        ) RETURNING *
      `);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating study session:', error);
      res.status(500).json({ error: 'Failed to create study session' });
    }
  });

  app.put('/api/study-planner-sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      const result = await db.execute(sql`
        UPDATE study_planner_sessions 
        SET 
          title = ${updates.title},
          subject = ${updates.subject},
          topic = ${updates.topic},
          date = ${updates.date},
          start_time = ${updates.startTime},
          end_time = ${updates.endTime},
          duration = ${updates.duration},
          notes = ${updates.notes},
          status = ${updates.status},
          updated_at = NOW()
        WHERE id = ${sessionId}
        RETURNING *
      `);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating study session:', error);
      res.status(500).json({ error: 'Failed to update study session' });
    }
  });

  // Google Drive API Routes
  app.get('/api/google-drive/files', async (req, res) => {
    try {
      // This would connect to Google Drive API
      // For now, return a message asking for Google Drive credentials
      res.status(401).json({ 
        error: 'Google Drive not connected',
        message: 'Please provide Google Drive API credentials to access your files'
      });
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  app.get('/api/google-drive/auth', async (req, res) => {
    try {
      res.json({
        authUrl: 'https://accounts.google.com/oauth/authorize',
        message: 'Google Drive integration requires API credentials'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get authorization URL' });
    }
  });

  app.get('/api/google-drive/status', async (req, res) => {
    try {
      res.json({ connected: false });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check connection status' });
    }
  });

  return httpServer;
}

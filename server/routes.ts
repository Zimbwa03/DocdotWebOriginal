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
      const user = await dbStorage.getUser(req.params.id);
      res.json(user);
    } catch (userError) {
      console.error("Error fetching user:", userError);
      res.status(404).json({ error: "User not found" });
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
      const result = await dbStorage.createUser(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Handle duplicate key error specifically
      if (error.code === '23505') {
        // User already exists, try to get the existing user
        try {
          const existingUser = await dbStorage.getUser(req.body.id);
          res.json(existingUser);
        } catch (getError) {
          res.status(409).json({ error: "User already exists" });
        }
      } else {
        res.status(500).json({ error: "Failed to create user" });
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
      
      // Update leaderboard data before fetching
      await dbStorage.updateGlobalLeaderboard();
      
      const leaderboard = await dbStorage.getLeaderboard(limit, timeFrame, category);
      
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

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const questions = await openRouterAI.generateMedicalQuestions(topic, difficulty, parseInt(questionCount));
      
      res.json({ 
        success: true,
        questions: questions.map((q: any, index: number) => ({
          id: index + 1,
          question: q.question,
          options: q.options || ['True', 'False'],
          correct_answer: q.correctAnswer || q.correct_answer,
          explanation: q.explanation,
          category: topic,
          difficulty: difficulty
        }))
      });
    } catch (error: any) {
      console.error("AI Quiz Generator Error:", error);
      res.status(500).json({ 
        error: "Failed to generate quiz questions",
        details: error.message 
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

  // AI Chat Route for general chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      // Check if DeepSeek API key is available
      if (!process.env.DEEPSEEK_API_KEY) {
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "DeepSeek API key is missing. Please configure DEEPSEEK_API_KEY in your environment variables."
        });
      }

      const response = await openRouterAI.tutorResponse(message, context);
      res.json({ response, success: true });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      
      // Provide more specific error messages
      if (error.message.includes('API key not configured')) {
        res.status(503).json({ 
          error: "AI service not configured",
          message: "Please configure your DeepSeek API key"
        });
      } else if (error.message.includes('timed out')) {
        res.status(408).json({ 
          error: "Request timeout",
          message: "The AI service took too long to respond. Please try again."
        });
      } else {
        res.status(500).json({ 
          error: "AI service temporarily unavailable",
          message: error.message || "Please try again later"
        });
      }
    }
  });

  // AI Study Plan Route
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const { goals, timeframe, currentLevel } = req.body;
      
      if (!goals || !timeframe || !currentLevel) {
        return res.status(400).json({ error: 'Goals, timeframe, and current level are required' });
      }

      const studyPlan = await openRouterAI.generateStudyPlan(goals, timeframe, currentLevel);
      
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

  const httpServer = createServer(app);
  return httpServer;
}


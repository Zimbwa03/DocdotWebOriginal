import type { Express } from "express";
import { createServer, type Server } from "http";
import { openRouterAI } from "./ai";
import { dbStorage } from "./db";
import { insertQuizAttemptSchema } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { resolve } from "path";

// Temporary in-memory storage for user profiles
const userProfiles = new Map<string, any>();

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
      const user = userProfiles.get(req.params.id);
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
      const existingUser = userProfiles.get(userData.id);
      
      const user = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
        createdAt: existingUser?.createdAt || new Date(),
        profileCompleted: existingUser?.profileCompleted || false,
        xp: existingUser?.xp || 0,
        level: existingUser?.level || 1,
        streak: existingUser?.streak || 0,
        subscriptionTier: existingUser?.subscriptionTier || 'free',
        fullName: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : userData.firstName || userData.lastName || existingUser?.fullName
      };
      
      userProfiles.set(userData.id, user);
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
      const existingUser = userProfiles.get(req.params.id);
      
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = {
        ...existingUser,
        ...updates,
        updatedAt: new Date(),
        fullName: updates.firstName && updates.lastName 
          ? `${updates.firstName} ${updates.lastName}` 
          : updates.firstName || updates.lastName || existingUser.fullName
      };
      
      userProfiles.set(req.params.id, updatedUser);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
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

  // Get user statistics
  app.get("/api/user/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await dbStorage.getUserStats(userId);
      
      if (!stats) {
        return res.json({
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalXP: 0,
          currentLevel: 1,
          totalStudyTime: 0,
          rank: 0
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ error: "Failed to get user stats" });
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

  // Alternative user stats route to match frontend expectations
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await dbStorage.getUserStats(userId);
      
      if (!stats) {
        return res.json({
          totalXp: 0,
          level: 1,
          currentStreak: 0,
          averageAccuracy: 0,
          totalQuizzes: 0,
          totalTimeSpent: 0,
          rank: 0
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });

  // Quiz attempts route to match frontend expectations
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;
      
      // Get recent quiz attempts for user
      const attempts = await dbStorage.getUserQuizAttempts(userId, 10);
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

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { category, limit = 10 } = req.query;
      const leaderboard = await dbStorage.getLeaderboard(
        parseInt(limit as string), 
        category as string
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

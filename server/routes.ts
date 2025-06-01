import type { Express } from "express";
import { createServer, type Server } from "http";
import { openRouterAI } from "./ai";
// import { db } from "./db";
// import { aiSessions, aiChats } from "../shared/schema";
// import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary in-memory storage for user profiles and quiz data
const userProfiles = new Map<string, any>();
const quizAttempts = new Map<string, any[]>(); // userId -> attempts
const quizSessions = new Map<string, any[]>(); // userId -> sessions

// Load MCQ database
let mcqDatabase: any[] = [];
try {
  const mcqData = fs.readFileSync(path.join(__dirname, 'mcq-data.json'), 'utf8');
  mcqDatabase = JSON.parse(mcqData);
  console.log(`Loaded ${mcqDatabase.length} MCQ questions`);
} catch (error) {
  console.error('Failed to load MCQ database:', error);
  mcqDatabase = [];
}

// Helper function to normalize answer format
function normalizeAnswer(answer: any): string {
  if (typeof answer === 'string') {
    return answer.toLowerCase() === 'true' ? 'True' : 'False';
  }
  return answer === 1 ? 'True' : 'False';
}

// Helper function to get questions by category
function getQuestionsByCategory(category: string, limit: number = 10): any[] {
  const categoryQuestions = mcqDatabase.filter(q => 
    q.category && q.category.toLowerCase() === category.toLowerCase()
  );
  
  // Randomize and limit
  const shuffled = categoryQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  // MCQ True/False Quiz System
  
  // Get available categories
  app.get("/api/quiz/categories", (req, res) => {
    try {
      const categorySet = new Set<string>();
      mcqDatabase.forEach(q => categorySet.add(q.category));
      const categories = Array.from(categorySet);
      const categoriesWithCount = categories.map(category => ({
        name: category,
        count: mcqDatabase.filter(q => q.category === category).length
      }));
      res.json({ categories: categoriesWithCount });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Start quiz session for a category
  app.post("/api/quiz/start", (req, res) => {
    try {
      const { category, userId, questionCount = 10 } = req.body;
      
      if (!category || !userId) {
        return res.status(400).json({ error: "Category and userId required" });
      }

      const questions = getQuestionsByCategory(category, questionCount);
      
      if (questions.length === 0) {
        return res.status(404).json({ error: "No questions found for this category" });
      }

      const sessionId = uuidv4();
      const session = {
        id: sessionId,
        userId,
        category,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          // Don't send the answer to frontend
        })),
        startTime: new Date(),
        currentQuestionIndex: 0,
        answers: [],
        completed: false
      };

      // Store session temporarily (in production, use database)
      if (!quizSessions.has(userId)) {
        quizSessions.set(userId, []);
      }
      quizSessions.get(userId)?.push(session);

      res.json({ 
        sessionId,
        category,
        totalQuestions: questions.length,
        currentQuestion: {
          id: questions[0].id,
          question: questions[0].question,
          questionNumber: 1
        }
      });
    } catch (error) {
      console.error("Start quiz error:", error);
      res.status(500).json({ error: "Failed to start quiz" });
    }
  });

  // Submit answer for current question
  app.post("/api/quiz/answer", (req, res) => {
    try {
      const { sessionId, userId, questionId, userAnswer, timeSpent } = req.body;
      
      if (!sessionId || !userId || !questionId || !userAnswer) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Find session
      const userSessions = quizSessions.get(userId) || [];
      const session = userSessions.find(s => s.id === sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Find the question in the original database
      const question = mcqDatabase.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Check if answer is correct
      const correctAnswer = normalizeAnswer(question.answer);
      const isCorrect = userAnswer === correctAnswer;

      // Store attempt
      const attempt = {
        sessionId,
        questionId,
        userAnswer,
        correctAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
        category: question.category,
        attemptedAt: new Date()
      };

      if (!quizAttempts.has(userId)) {
        quizAttempts.set(userId, []);
      }
      quizAttempts.get(userId)?.push(attempt);

      // Add to session answers
      session.answers.push(attempt);
      session.currentQuestionIndex++;

      // Check if quiz is complete
      const isComplete = session.currentQuestionIndex >= session.questions.length;
      let nextQuestion = null;
      
      if (!isComplete) {
        const nextQ = mcqDatabase.find(q => q.id === session.questions[session.currentQuestionIndex].id);
        nextQuestion = {
          id: nextQ.id,
          question: nextQ.question,
          questionNumber: session.currentQuestionIndex + 1
        };
      } else {
        session.completed = true;
        session.endTime = new Date();
      }

      res.json({
        isCorrect,
        correctAnswer,
        explanation: question.explanation,
        aiExplanation: question.ai_explanation,
        references: question.reference_json ? JSON.parse(question.reference_json) : null,
        isComplete,
        nextQuestion,
        progress: {
          current: session.currentQuestionIndex,
          total: session.questions.length,
          accuracy: Math.round((session.answers.filter((a: any) => a.isCorrect).length / session.answers.length) * 100)
        }
      });
    } catch (error) {
      console.error("Submit answer error:", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  // Get quiz results and analytics
  app.get("/api/quiz/results/:sessionId", (req, res) => {
    try {
      const { sessionId } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }

      const userSessions = quizSessions.get(userId as string) || [];
      const session = userSessions.find(s => s.id === sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const correctAnswers = session.answers.filter((a: any) => a.isCorrect).length;
      const totalQuestions = session.answers.length;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      const totalTime = session.endTime ? 
        Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000) : 0;

      res.json({
        sessionId,
        category: session.category,
        totalQuestions,
        correctAnswers,
        accuracy,
        totalTime,
        answers: session.answers.map((a: any) => ({
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          correctAnswer: a.correctAnswer,
          isCorrect: a.isCorrect,
          timeSpent: a.timeSpent
        }))
      });
    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Get user analytics and performance stats
  app.get("/api/quiz/analytics/:userId", (req, res) => {
    try {
      const { userId } = req.params;
      
      const userAttempts = quizAttempts.get(userId) || [];
      const userSessions = quizSessions.get(userId) || [];
      const completedSessions = userSessions.filter((s: any) => s.completed);
      
      if (userAttempts.length === 0) {
        return res.json({
          totalQuestions: 0,
          totalCorrect: 0,
          overallAccuracy: 0,
          categoriesAttempted: 0,
          sessionsCompleted: 0,
          categoryPerformance: [],
          recentSessions: []
        });
      }

      const totalQuestions = userAttempts.length;
      const totalCorrect = userAttempts.filter((a: any) => a.isCorrect).length;
      const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100);
      
      // Category performance
      const categoryStats = new Map();
      userAttempts.forEach((attempt: any) => {
        if (!categoryStats.has(attempt.category)) {
          categoryStats.set(attempt.category, { total: 0, correct: 0 });
        }
        const stats = categoryStats.get(attempt.category);
        stats.total++;
        if (attempt.isCorrect) stats.correct++;
      });

      const categoryPerformance = Array.from(categoryStats.entries()).map(([category, stats]: [string, any]) => ({
        category,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        questionsAttempted: stats.total,
        correctAnswers: stats.correct
      }));

      // Recent sessions
      const recentSessions = completedSessions
        .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
        .slice(0, 10)
        .map((session: any) => ({
          sessionId: session.id,
          category: session.category,
          accuracy: Math.round((session.answers.filter((a: any) => a.isCorrect).length / session.answers.length) * 100),
          questionsAnswered: session.answers.length,
          completedAt: session.endTime
        }));

      res.json({
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        categoriesAttempted: categoryStats.size,
        sessionsCompleted: completedSessions.length,
        categoryPerformance,
        recentSessions
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
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

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { openRouterAI } from "./ai";
import { dbStorage, db } from "./db";
import { sql, eq, desc, and } from 'drizzle-orm';
import { insertQuizAttemptSchema, badges, userBadges, studyPlannerSessions, studyGroups, studyGroupMembers, meetingReminders, users, quizAttempts, userStats, quizzes, customExams, customExamStems, stemOptions, examGenerationHistory } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available categories for debugging
  app.get('/api/categories', async (req, res) => {
    try {
      const questionsPath = resolve(process.cwd(), 'client', 'public', 'docdot-questions.json');

      if (!existsSync(questionsPath)) {
        return res.status(404).json({ error: 'Questions file not found' });
      }

      const questionsData = JSON.parse(readFileSync(questionsPath, 'utf8'));

      if (!Array.isArray(questionsData)) {
        return res.status(500).json({ error: 'Invalid questions data format' });
      }

      // Get unique categories
      const categories = Array.from(new Set(questionsData.map((q: any) => q.category).filter(Boolean)));

      console.log('Available categories:', categories);
      console.log('Total questions:', questionsData.length);

      res.json({ 
        categories, 
        totalQuestions: questionsData.length,
        questionsByCategory: categories.reduce((acc: any, cat: string) => {
          acc[cat] = questionsData.filter((q: any) => q.category === cat).length;
          return acc;
        }, {})
      });
    } catch (error: any) {
      console.error('Error reading categories:', error);
      res.status(500).json({ error: 'Failed to read categories' });
    }
  });

  // Get questions by category
  app.get('/api/questions', async (req, res) => {
    try {
      const { category, difficulty, count } = req.query;
      const questionsPath = resolve(process.cwd(), 'client', 'public', 'docdot-questions.json');

      if (!existsSync(questionsPath)) {
        return res.status(404).json({ error: 'Questions file not found' });
      }

      const questionsData = JSON.parse(readFileSync(questionsPath, 'utf8'));

      if (!Array.isArray(questionsData)) {
        return res.status(500).json({ error: 'Invalid questions data format' });
      }

      let filteredQuestions = questionsData;

      // Filter by category if provided
      if (category && category !== 'all') {
        filteredQuestions = filteredQuestions.filter((q: any) => q.category === category);
      }

      // Filter by difficulty if provided
      if (difficulty && difficulty !== 'all') {
        filteredQuestions = filteredQuestions.filter((q: any) => q.difficulty === difficulty);
      }

      // Shuffle and limit questions if count is specified
      if (count) {
        const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
        filteredQuestions = shuffled.slice(0, parseInt(count as string));
      }

      console.log(`Serving ${filteredQuestions.length} questions for category: ${category || 'all'}`);
      res.json(filteredQuestions);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Database connection test endpoint
  app.get('/api/test-connection', async (req, res) => {
    try {
      const testQuery = await db.execute(sql`SELECT NOW() as current_time`);
      console.log('Database connection successful');

      res.json({
        success: true,
        connection: 'Connected to Supabase PostgreSQL',
        currentTime: testQuery[0].current_time,
        database: 'Supabase PostgreSQL 16.9',
        message: 'Database connection is working properly'
      });
    } catch (error: any) {
      console.error('Database connection failed:', error);
      res.status(500).json({
        success: false,
        error: 'Database connection failed',
        message: error.message
      });
    }
  });

  // Basic quiz attempt recording
  app.post('/api/quiz-attempts', async (req, res) => {
    try {
      const validatedData = insertQuizAttemptSchema.parse(req.body);
      const attempt = await dbStorage.recordQuizAttempt(validatedData);
      res.json({ success: true, attempt });
    } catch (error: any) {
      console.error('Error recording quiz attempt:', error);
      res.status(500).json({ error: 'Failed to record quiz attempt' });
    }
  });

  // User statistics endpoint
  app.get('/api/stats/user', async (req, res) => {
    try {
      const { userId } = req.query;
      const stats = await dbStorage.getUserStats(userId as string);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

  // Leaderboard endpoint
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await dbStorage.getLeaderboard();
      res.json(leaderboard);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Basic server setup
  const server = createServer(app);
  return server;
}
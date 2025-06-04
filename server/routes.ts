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
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // User statistics
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      res.json({
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        totalStudyTime: 0,
        averageScore: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        longestStreak: 0
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Quiz attempts
  app.get("/api/quiz-attempts", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  // AI Chat Route
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      const response = await openRouterAI.tutorResponse(message, context);
      res.json({ response, success: true });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        error: "AI service temporarily unavailable",
        message: error.message || "Please try again later"
      });
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

  // Google Drive Routes
  app.get("/api/google-drive/books", async (req, res) => {
    try {
      const books = await googleDriveService.listBooksInFolder();
      res.json(books);
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
      const { fileId } = req.params;
      const fileContent = await googleDriveService.getFileContent(fileId);
      res.json({ content: fileContent });
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


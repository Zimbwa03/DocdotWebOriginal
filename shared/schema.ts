import { pgTable, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - integrated with Supabase auth
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Supabase user ID
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  specialization: text("specialization"),
  institution: text("institution"),
  phone: text("phone"),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  learningStyle: text("learning_style"), // visual, auditory, kinesthetic
  goals: json("goals"), // Array of learning goals
  schedule: json("schedule"), // Study schedule preferences
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, starter, premium
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical categories and topics
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
});

export const topics = pgTable("topics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // gross_anatomy, histology, embryology
  content: text("content"),
  accessTier: text("access_tier").notNull().default("free"), // free, starter, premium
});

// Quiz system
export const quizzes = pgTable("quizzes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  topicId: integer("topic_id").references(() => topics.id),
  question: text("question").notNull(),
  options: json("options").notNull(), // Array of answer options
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  xpReward: integer("xp_reward").notNull().default(10),
});

// User quiz attempts with comprehensive tracking
export const quizAttempts = pgTable("quiz_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  category: text("category").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  difficulty: text("difficulty"),
  xpEarned: integer("xp_earned").notNull().default(0),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// User statistics and performance tracking
export const userStats = pgTable("user_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id).unique(),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  averageScore: integer("average_score").notNull().default(0), // percentage
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalXP: integer("total_xp").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  totalStudyTime: integer("total_study_time").notNull().default(0), // in minutes
  rank: integer("rank").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Category-specific performance
export const categoryStats = pgTable("category_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  category: text("category").notNull(),
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  averageScore: integer("average_score").notNull().default(0),
  averageTime: integer("average_time").notNull().default(0), // in seconds
  lastAttempted: timestamp("last_attempted"),
  mastery: integer("mastery").notNull().default(0), // 0-100
});

// Daily performance tracking
export const dailyStats = pgTable("daily_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  date: timestamp("date").notNull(),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  studyTime: integer("study_time").notNull().default(0), // in minutes
  xpEarned: integer("xp_earned").notNull().default(0),
  categoriesStudied: json("categories_studied"), // Array of categories
});

// Leaderboard entries
export const leaderboard = pgTable("leaderboard", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  category: text("category"), // null for overall leaderboard
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  accuracy: integer("accuracy").notNull(), // percentage
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flashcards
export const flashcards = pgTable("flashcards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  topicId: integer("topic_id").references(() => topics.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  mnemonic: text("mnemonic"),
  difficulty: text("difficulty").notNull().default("medium"),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study planner
export const studyPlans = pgTable("study_plans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  topics: json("topics").notNull(), // Array of topic IDs
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study sessions
export const studySessions = pgTable("study_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  topicId: integer("topic_id").references(() => topics.id),
  duration: integer("duration").notNull(), // in minutes
  completedAt: timestamp("completed_at").defaultNow(),
});

// AI chat history with sessions
export const aiSessions = pgTable("ai_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  toolType: text("tool_type").notNull(), // 'tutor', 'explain', 'questions', etc.
  title: text("title").notNull(),
  lastMessage: text("last_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiChats = pgTable("ai_chats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").references(() => aiSessions.id),
  userId: text("user_id").references(() => users.id),
  role: text("role").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  toolType: text("tool_type").notNull(),
  context: json("context"), // Additional context data
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  fullName: true,
  specialization: true,
  institution: true,
  phone: true,
  learningStyle: true,
  goals: true,
  schedule: true,
});

export const insertCategorySchema = createInsertSchema(categories);
export const insertTopicSchema = createInsertSchema(topics);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ 
  id: true, 
  attemptedAt: true 
});
export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true, updatedAt: true });
export const insertCategoryStatsSchema = createInsertSchema(categoryStats).omit({ id: true });
export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({ id: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ id: true, updatedAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards);
export const insertStudyPlanSchema = createInsertSchema(studyPlans);
export const insertAiSessionSchema = createInsertSchema(aiSessions);
export const insertAiChatSchema = createInsertSchema(aiChats);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type InsertCategoryStats = z.infer<typeof insertCategoryStatsSchema>;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type CategoryStats = typeof categoryStats.$inferSelect;
export type DailyStats = typeof dailyStats.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type AiSession = typeof aiSessions.$inferSelect;
export type AiChat = typeof aiChats.$inferSelect;

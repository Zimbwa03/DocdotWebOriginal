import { pgTable, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - integrated with Supabase auth
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Supabase user ID
  email: text("email").unique().notNull(),
  fullName: text("full_name"),
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

// User quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  attemptedAt: timestamp("attempted_at").defaultNow(),
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

// AI chat history
export const aiChats = pgTable("ai_chats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  context: json("context"), // Topic context for better responses
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  fullName: true,
});

export const insertCategorySchema = createInsertSchema(categories);
export const insertTopicSchema = createInsertSchema(topics);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertFlashcardSchema = createInsertSchema(flashcards);
export const insertStudyPlanSchema = createInsertSchema(studyPlans);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type AiChat = typeof aiChats.$inferSelect;

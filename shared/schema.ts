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

// MCQ Database - True/False Questions
export const mcqQuestions = pgTable("mcq_questions", {
  id: integer("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(), // "True", "False", 1, 0
  category: text("category").notNull(),
  explanation: text("explanation").notNull(),
  aiExplanation: text("ai_explanation"),
  referenceData: text("reference_data"),
  referenceJson: text("reference_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User quiz attempts for MCQs
export const mcqAttempts = pgTable("mcq_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => mcqQuestions.id),
  userAnswer: text("user_answer").notNull(), // "True" or "False"
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  category: text("category").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// Quiz sessions for tracking performance
export const quizSessions = pgTable("quiz_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  category: text("category").notNull(),
  questionsCount: integer("questions_count").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalTime: integer("total_time"), // in seconds
  accuracy: integer("accuracy"), // percentage
  completedAt: timestamp("completed_at").defaultNow(),
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
export const insertMcqQuestionSchema = createInsertSchema(mcqQuestions);
export const insertMcqAttemptSchema = createInsertSchema(mcqAttempts);
export const insertQuizSessionSchema = createInsertSchema(quizSessions);
export const insertFlashcardSchema = createInsertSchema(flashcards);
export const insertStudyPlanSchema = createInsertSchema(studyPlans);
export const insertAiSessionSchema = createInsertSchema(aiSessions);
export const insertAiChatSchema = createInsertSchema(aiChats);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type McqQuestion = typeof mcqQuestions.$inferSelect;
export type McqAttempt = typeof mcqAttempts.$inferSelect;
export type QuizSession = typeof quizSessions.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type AiSession = typeof aiSessions.$inferSelect;
export type AiChat = typeof aiChats.$inferSelect;

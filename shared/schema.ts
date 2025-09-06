
import { pgTable, text, integer, timestamp, boolean, json, unique, real, uuid } from "drizzle-orm/pg-core";
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
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g. "upperlimb", "thorax"
  description: text("description"),
  type: text("type").notNull(), // gross_anatomy, histology, embryology
  content: text("content"),
  accessTier: text("access_tier").notNull().default("free"), // free, starter, premium
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Exam System - AI Generated Medical Exams
export const customExams = pgTable("custom_exams", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").notNull().references(() => users.id),
  examType: text("exam_type").notNull(), // 'anatomy', 'physiology'
  title: text("title").notNull(),
  topics: text("topics").array().notNull(), // Array of topic names
  stemCount: integer("stem_count").notNull().default(5),
  durationSeconds: integer("duration_seconds").notNull().default(450),
  difficulty: text("difficulty").default("intermediate"),
  status: text("status").default("active"), // 'active', 'completed', 'archived'
  aiGenerated: boolean("ai_generated").default(true),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customExamStems = pgTable("custom_exam_stems", {
  id: text("id").primaryKey(), // UUID
  customExamId: text("custom_exam_id").notNull().references(() => customExams.id, { onDelete: "cascade" }),
  stemText: text("stem_text").notNull(),
  orderIndex: integer("order_index").notNull(),
  topic: text("topic"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueStemOrder: unique().on(table.customExamId, table.orderIndex),
}));

export const stemOptions = pgTable("stem_options", {
  id: text("id").primaryKey(), // UUID
  stemId: text("stem_id").notNull().references(() => customExamStems.id, { onDelete: "cascade" }),
  optionLetter: text("option_letter").notNull(), // 'A' or 'B'
  statement: text("statement").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueOptionPerStem: unique().on(table.stemId, table.optionLetter),
}));

export const customExamAttempts = pgTable("custom_exam_attempts", {
  id: text("id").primaryKey(), // UUID
  customExamId: text("custom_exam_id").notNull().references(() => customExams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpentSeconds: integer("time_spent_seconds"),
  totalStems: integer("total_stems").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  incorrectAnswers: integer("incorrect_answers").default(0),
  scorePercentage: integer("score_percentage"), // Using integer for percentage (0-100)
  answers: json("answers").default({}),
  xpEarned: integer("xp_earned").default(0),
  status: text("status").default("in_progress"), // 'in_progress', 'completed', 'abandoned'
});

export const examGenerationHistory = pgTable("exam_generation_history", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").notNull().references(() => users.id),
  examType: text("exam_type").notNull(),
  topics: text("topics").array().notNull(),
  requestedStemCount: integer("requested_stem_count").notNull(),
  actualStemCount: integer("actual_stem_count"),
  generationStatus: text("generation_status").default("pending"), // 'pending', 'success', 'failed'
  aiProvider: text("ai_provider").default("deepseek"),
  generationTimeMs: integer("generation_time_ms"),
  errorMessage: text("error_message"),
  customExamId: text("custom_exam_id").references(() => customExams.id),
  createdAt: timestamp("created_at").defaultNow(),
});


// Quiz system (existing)  
export const quizzes = pgTable("quizzes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  topicId: integer("topic_id").references(() => topics.id),
  question: text("question").notNull(),
  options: json("options").notNull(), // Array of answer options
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  xpReward: integer("xp_reward").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

// MCQ Questions table for topical questions
export const mcqQuestions = pgTable("mcq_questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  question: text("question").notNull(),
  answer: boolean("answer").notNull(), // True/False answer
  explanation: text("explanation").notNull(),
  aiExplanation: text("ai_explanation").notNull(),
  referenceSnell: text("reference_snell"),
  referenceGrays: text("reference_grays"),
  referenceMoore: text("reference_moore"),
  category: text("category").notNull(), // e.g., 'Upper Limb'
  topic: text("topic").notNull(), // e.g., 'Pectoral Region', 'Arm', 'Cubital Fossa', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// User quiz attempts with comprehensive tracking
export const quizAttempts = pgTable("quiz_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  questionIdentifier: text("question_identifier"), // For tracking questions from JSON files
  category: text("category").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // seconds
  difficulty: text("difficulty"),
  xpEarned: integer("xp_earned").default(0),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// User statistics and progress tracking
export const userStats = pgTable("user_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id).unique(),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalXp: integer("total_xp").default(0),
  currentLevel: integer("current_level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  averageScore: integer("average_score").default(0), // percentage
  totalStudyTime: integer("total_study_time").default(0), // minutes
  rank: integer("rank").default(0),
  weeklyXp: integer("weekly_xp").default(0),
  monthlyXp: integer("monthly_xp").default(0),
  averageAccuracy: integer("average_accuracy").default(0),
  level: integer("level").default(1),
  streak: integer("streak").default(0),
  totalBadges: integer("total_badges").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Category-specific performance tracking
export const categoryStats = pgTable("category_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  categoryName: text("category_name").notNull(),
  questionsAnswered: integer("questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  accuracy: integer("accuracy").default(0), // percentage
  xpEarned: integer("xp_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily study statistics
export const dailyStats = pgTable("daily_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  category: text("category"),
  questionsAnswered: integer("questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  xpEarned: integer("xp_earned").default(0),
  studyTime: integer("study_time").default(0), // minutes
  topicsStudied: json("topics_studied"), // Array of topic names
  createdAt: timestamp("created_at").defaultNow(),
});

// Global leaderboard table
export const globalLeaderboard = pgTable("global_leaderboard", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id).unique(),
  totalXp: integer("total_xp").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  rank: integer("rank").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leaderboard system
export const leaderboard = pgTable("leaderboard", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id).unique(),
  rank: integer("rank").notNull(),
  xp: integer("xp").notNull(),
  level: integer("level").notNull(),
  streak: integer("streak").notNull(),
  fullName: text("full_name"),
  institution: text("institution"),
  category: text("category"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Badge and achievement system
export const badges = pgTable("badges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // achievement, streak, xp, quiz
  tier: text("tier").default("bronze"), // bronze, silver, gold, platinum
  requirement: integer("requirement").notNull(), // numeric requirement
  requirementType: text("requirement_type").notNull(), // questions, accuracy, streak, xp
  xpReward: integer("xp_reward").default(0),
  color: text("color").default("#3B82F6"),
  isSecret: boolean("is_secret").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  badgeId: integer("badge_id").references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0), // Current progress towards earning
  requirement: integer("requirement"), // Cached requirement value
  xpReward: integer("xp_reward").default(0), // Cached XP reward
  name: text("name"), // Cached badge name
  description: text("description"), // Cached badge description
});

// AI tutoring system
export const aiSessions = pgTable("ai_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  sessionType: text("session_type").notNull(), // tutor, quiz_explanation, study_help
  title: text("title"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  totalMessages: integer("total_messages").default(0),
  tokensUsed: integer("tokens_used").default(0),
  metadata: json("metadata"),
});

export const aiChats = pgTable("ai_chats", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").references(() => aiSessions.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata"),
});

// Study planner sessions
export const studyPlannerSessions = pgTable("study_planner_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject"),
  topic: text("topic"),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  duration: integer("duration").default(60), // minutes
  notes: text("notes"),
  status: text("status").default("planned"), // planned, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Study groups and collaboration
export const studyGroups = pgTable("study_groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  creator_id: text("creator_id").references(() => users.id),
  meeting_link: text("meeting_link"),
  meeting_type: text("meeting_type"), // 'zoom', 'meet'
  scheduled_time: timestamp("scheduled_time"),
  duration: integer("duration").default(60), // minutes
  max_members: integer("max_members").default(10),
  current_members: integer("current_members").default(1),
  category: text("category"),
  is_active: boolean("is_active").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const studyGroupMembers = pgTable("study_group_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer("group_id").references(() => studyGroups.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  hasJoinedMeeting: boolean("has_joined_meeting").default(false),
  reminderSent: boolean("reminder_sent").default(false),
});

export const meetingReminders = pgTable("meeting_reminders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer("group_id").references(() => studyGroups.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  reminderTime: timestamp("reminder_time").notNull(),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lecture Recording System
export const lectures = pgTable("lectures", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  module: text("module").notNull(),
  topic: text("topic"),
  lecturer: text("lecturer"),
  date: timestamp("date").notNull().defaultNow(),
  duration: integer("duration").default(0), // seconds
  status: text("status").notNull().default("recording"), // recording, processing, completed, failed
  audioUrl: text("audio_url"), // URL to stored audio file
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lectureTranscripts = pgTable("lecture_transcripts", {
  id: text("id").primaryKey(), // UUID
  lectureId: text("lecture_id").notNull().references(() => lectures.id, { onDelete: "cascade" }),
  rawTranscript: text("raw_transcript"), // Original mixed-language transcript
  unifiedTranscript: text("unified_transcript"), // English-only transcript
  languageDetected: text("language_detected"), // detected languages
  confidence: real("confidence"), // transcription confidence score
  createdAt: timestamp("created_at").defaultNow(),
});

export const lectureNotes = pgTable("lecture_notes", {
  id: text("id").primaryKey(), // UUID
  lectureId: text("lecture_id").notNull().references(() => lectures.id, { onDelete: "cascade" }),
  liveNotes: text("live_notes"), // Real-time generated notes
  finalNotes: text("final_notes"), // Post-lecture processed notes
  summary: text("summary"), // AI-generated summary
  keyPoints: json("key_points"), // Array of key points
  medicalTerms: json("medical_terms"), // Extracted medical terminology
  researchContext: text("research_context"), // Additional research context
  processingStatus: text("processing_status").default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lectureProcessingLogs = pgTable("lecture_processing_logs", {
  id: text("id").primaryKey(), // UUID
  lectureId: text("lecture_id").notNull().references(() => lectures.id, { onDelete: "cascade" }),
  step: text("step").notNull(), // transcription, translation, note_generation, summarization
  status: text("status").notNull(), // started, completed, failed
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // milliseconds
  errorMessage: text("error_message"),
  metadata: json("metadata"), // Additional processing metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ 
  id: true, 
  attemptedAt: true 
});
export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true, updatedAt: true });
export const insertCategoryStatsSchema = createInsertSchema(categoryStats).omit({ id: true });
export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({ id: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ id: true, updatedAt: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, createdAt: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const insertAiSessionSchema = createInsertSchema(aiSessions);
export const insertAiChatSchema = createInsertSchema(aiChats);
export const insertStudyPlannerSessionSchema = createInsertSchema(studyPlannerSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudyGroupSchema = createInsertSchema(studyGroups).omit({ id: true, created_at: true, current_members: true, is_active: true });
export const insertStudyGroupMemberSchema = createInsertSchema(studyGroupMembers).omit({ id: true, joinedAt: true, hasJoinedMeeting: true, reminderSent: true });
export const insertMeetingReminderSchema = createInsertSchema(meetingReminders).omit({ id: true, createdAt: true, emailSent: true });

// Lecture recording schemas
export const insertLectureSchema = createInsertSchema(lectures).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLectureTranscriptSchema = createInsertSchema(lectureTranscripts).omit({ id: true, createdAt: true });
export const insertLectureNotesSchema = createInsertSchema(lectureNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLectureProcessingLogSchema = createInsertSchema(lectureProcessingLogs).omit({ id: true, createdAt: true });

// Custom exam schemas
export const insertCustomExamSchema = createInsertSchema(customExams).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomExamStemSchema = createInsertSchema(customExamStems).omit({ id: true, createdAt: true });
export const insertStemOptionSchema = createInsertSchema(stemOptions).omit({ id: true, createdAt: true });
export const insertCustomExamAttemptSchema = createInsertSchema(customExamAttempts).omit({ id: true, startedAt: true });
export const insertExamGenerationHistorySchema = createInsertSchema(examGenerationHistory).omit({ id: true, createdAt: true });

// Lecture insert types
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type InsertLectureTranscript = z.infer<typeof insertLectureTranscriptSchema>;
export type InsertLectureNotes = z.infer<typeof insertLectureNotesSchema>;
export type InsertLectureProcessingLog = z.infer<typeof insertLectureProcessingLogSchema>;

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type InsertCategoryStats = z.infer<typeof insertCategoryStatsSchema>;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type InsertCustomExam = z.infer<typeof insertCustomExamSchema>;
export type InsertCustomExamStem = z.infer<typeof insertCustomExamStemSchema>;
export type InsertStemOption = z.infer<typeof insertStemOptionSchema>;
export type InsertCustomExamAttempt = z.infer<typeof insertCustomExamAttemptSchema>;
export type InsertExamGenerationHistory = z.infer<typeof insertExamGenerationHistorySchema>;

// Lecture select types
export type Lecture = typeof lectures.$inferSelect;
export type LectureTranscript = typeof lectureTranscripts.$inferSelect;
export type LectureNotes = typeof lectureNotes.$inferSelect;
export type LectureProcessingLog = typeof lectureProcessingLogs.$inferSelect;

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type CustomExam = typeof customExams.$inferSelect;
export type CustomExamStem = typeof customExamStems.$inferSelect;
export type StemOption = typeof stemOptions.$inferSelect;
export type CustomExamAttempt = typeof customExamAttempts.$inferSelect;
export type ExamGenerationHistory = typeof examGenerationHistory.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type McqQuestion = typeof mcqQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type CategoryStats = typeof categoryStats.$inferSelect;
export type DailyStats = typeof dailyStats.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type AiSession = typeof aiSessions.$inferSelect;
export type AiChat = typeof aiChats.$inferSelect;
export type StudyGroup = typeof studyGroups.$inferSelect;
export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;
export type MeetingReminder = typeof meetingReminders.$inferSelect;
export type StudyPlannerSession = typeof studyPlannerSessions.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Lecture = typeof lectures.$inferSelect;
export type LectureTranscript = typeof lectureTranscripts.$inferSelect;
export type LectureNotes = typeof lectureNotes.$inferSelect;
export type LectureProcessingLog = typeof lectureProcessingLogs.$inferSelect;

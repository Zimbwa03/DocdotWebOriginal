import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, userStats, categoryStats, dailyStats, leaderboard, quizAttempts, badges, userBadges,
  globalLeaderboard, userAnalytics, aiSessions, aiChats, studyPlannerSessions, studyGroups, studyGroupMembers,
  type User, type InsertUser, type UserStats, type CategoryStats, 
  type DailyStats, type LeaderboardEntry, type QuizAttempt,
  type InsertQuizAttempt, type InsertUserStats, type InsertCategoryStats,
  type InsertDailyStats, type InsertLeaderboard
} from '@shared/schema';
import { eq, desc, sql, and, gte, isNotNull, lte, gt, lt, count, sum, avg } from 'drizzle-orm';

// Supabase PostgreSQL connection
const connectionString = process.env.DATABASE_URL!;

console.log('Database connection details:');
console.log('- URL configured:', !!connectionString);
console.log('- URL starts with postgres:', connectionString?.startsWith('postgres'));

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
export const db = drizzle(client);

export class DatabaseStorage {
  async getUser(userId: string): Promise<User | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser & { id: string }): Promise<User> {
    try {
      const result = await db.insert(users).values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        specialization: userData.specialization,
        institution: userData.institution,
        phone: userData.phone,
        learningStyle: userData.learningStyle,
        goals: userData.goals,
        schedule: userData.schedule,
        profileCompleted: false,
        xp: 0,
        level: 1,
        streak: 0,
        subscriptionTier: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db.update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async upsertUser(userData: { id: string; email: string; firstName?: string; lastName?: string }): Promise<User> {
    try {
      const existingUser = await this.getUser(userData.id);

      if (existingUser) {
        const updated = await this.updateUser(userData.id, {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.firstName || userData.lastName
        });
        return updated!;
      } else {
        return await this.createUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.firstName || userData.lastName
        });
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async recordQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt> {
    try {
      const insertData = {
        userId: attemptData.userId!,
        quizId: attemptData.quizId || null,
        questionIdentifier: attemptData.questionIdentifier || null,
        category: attemptData.category,
        selectedAnswer: attemptData.selectedAnswer,
        correctAnswer: attemptData.correctAnswer,
        isCorrect: attemptData.isCorrect,
        timeSpent: attemptData.timeSpent || 0,
        difficulty: attemptData.difficulty || 'medium',
        xpEarned: attemptData.xpEarned || 0
      };

      const result = await db.insert(quizAttempts).values(insertData).returning();
      const attempt = result[0];

      await this.updateUserStats(insertData.userId, insertData.isCorrect, insertData.xpEarned, insertData.timeSpent);
      await this.updateCategoryStats(insertData.userId, insertData.category, insertData.isCorrect, insertData.timeSpent);
      await this.updateDailyStats(insertData.userId, insertData.category, insertData.isCorrect, insertData.xpEarned);
      await this.updateLeaderboard(insertData.userId);

      return attempt;
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    try {
      const result = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      return undefined;
    }
  }

  async updateUserStats(userId: string, isCorrect: boolean, xpEarned: number, timeSpent: number): Promise<void> {
    try {
      const existing = await this.getUserStats(userId);

      if (existing) {
        const newTotalQuestions = existing.totalQuestions + 1;
        const newCorrectAnswers = existing.correctAnswers + (isCorrect ? 1 : 0);
        const newAverageScore = Math.round((newCorrectAnswers / newTotalQuestions) * 100);
        const newStreak = isCorrect ? existing.currentStreak + 1 : 0;
        const newLongestStreak = Math.max(existing.longestStreak, newStreak);
        const newTotalXP = existing.totalXP + xpEarned;
        const newLevel = Math.floor(newTotalXP / 1000) + 1;

        await db.update(userStats)
          .set({
            totalQuestions: newTotalQuestions,
            correctAnswers: newCorrectAnswers,
            averageScore: newAverageScore,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            totalXP: newTotalXP,
            currentLevel: newLevel,
            totalStudyTime: existing.totalStudyTime + Math.round(timeSpent / 60),
            updatedAt: new Date()
          })
          .where(eq(userStats.userId, userId));
      } else {
        await db.insert(userStats).values({
          userId,
          totalQuestions: 1,
          correctAnswers: isCorrect ? 1 : 0,
          averageScore: isCorrect ? 100 : 0,
          currentStreak: isCorrect ? 1 : 0,
          longestStreak: isCorrect ? 1 : 0,
          totalXP: xpEarned,
          currentLevel: Math.floor(xpEarned / 1000) + 1,
          totalStudyTime: Math.round(timeSpent / 60),
          rank: 0
        });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  async updateCategoryStats(userId: string, category: string, isCorrect: boolean, timeSpent: number): Promise<void> {
    try {
      const existing = await db.select().from(categoryStats)
        .where(and(eq(categoryStats.userId, userId), eq(categoryStats.category, category)))
        .limit(1);

      if (existing.length > 0) {
        const stats = existing[0];
        const newQuestionsAttempted = stats.questionsAttempted + 1;
        const newCorrectAnswers = stats.correctAnswers + (isCorrect ? 1 : 0);
        const newAverageScore = Math.round((newCorrectAnswers / newQuestionsAttempted) * 100);
        const newAverageTime = Math.round(((stats.averageTime * stats.questionsAttempted) + timeSpent) / newQuestionsAttempted);
        const newMastery = Math.min(100, Math.max(0, newAverageScore - (newAverageTime > 30 ? 10 : 0)));

        await db.update(categoryStats)
          .set({
            questionsAttempted: newQuestionsAttempted,
            correctAnswers: newCorrectAnswers,
            averageScore: newAverageScore,
            averageTime: newAverageTime,
            mastery: newMastery,
            lastAttempted: new Date()
          })
          .where(and(eq(categoryStats.userId, userId), eq(categoryStats.category, category)));
      } else {
        await db.insert(categoryStats).values({
          userId,
          category,
          questionsAttempted: 1,
          correctAnswers: isCorrect ? 1 : 0,
          averageScore: isCorrect ? 100 : 0,
          averageTime: timeSpent,
          mastery: isCorrect ? Math.max(0, 100 - (timeSpent > 30 ? 10 : 0)) : 0,
          lastAttempted: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating category stats:', error);
    }
  }

  async updateDailyStats(userId: string, category: string, isCorrect: boolean, xpEarned: number): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await db.select().from(dailyStats)
        .where(and(eq(dailyStats.userId, userId), gte(dailyStats.date, today)))
        .limit(1);

      if (existing.length > 0) {
        const stats = existing[0];
        const newQuestionsAnswered = stats.questionsAnswered + 1;
        const newCorrectAnswers = stats.correctAnswers + (isCorrect ? 1 : 0);
        const categoriesStudied = Array.from(new Set([...(stats.categoriesStudied as string[] || []), category]));

        await db.update(dailyStats)
          .set({
            questionsAnswered: newQuestionsAnswered,
            correctAnswers: newCorrectAnswers,
            xpEarned: stats.xpEarned + xpEarned,
            categoriesStudied: categoriesStudied
          })
          .where(eq(dailyStats.id, stats.id));
      } else {
        await db.insert(dailyStats).values({
          userId,
          date: today,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          studyTime: 0,
          xpEarned,
          categoriesStudied: [category]
        });
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  async updateLeaderboard(userId: string): Promise<void> {
    try {
      const userStatsData = await this.getUserStats(userId);
      if (!userStatsData) return;

      const existingEntry = await db.select()
        .from(leaderboard)
        .where(and(eq(leaderboard.userId, userId), sql`${leaderboard.category} IS NULL`))
        .limit(1);

      if (existingEntry.length > 0) {
        await db.update(leaderboard)
          .set({
            score: userStatsData.totalXP,
            totalQuestions: userStatsData.totalQuestions,
            accuracy: userStatsData.averageScore,
            updatedAt: new Date()
          })
          .where(eq(leaderboard.id, existingEntry[0].id));
      } else {
        await db.insert(leaderboard).values({
          userId,
          category: null,
          rank: 0,
          score: userStatsData.totalXP,
          totalQuestions: userStatsData.totalQuestions,
          accuracy: userStatsData.averageScore
        });
      }

      await this.updateLeaderboardRanks();
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  async updateLeaderboardRanks(): Promise<void> {
    try {
      const entries = await db.select().from(leaderboard)
        .where(sql`${leaderboard.category} IS NULL`)
        .orderBy(desc(leaderboard.score));

      for (let i = 0; i < entries.length; i++) {
        await db.update(leaderboard)
          .set({ rank: i + 1 })
          .where(eq(leaderboard.id, entries[i].id));
      }
    } catch (error) {
      console.error('Error updating leaderboard ranks:', error);
    }
  }

  async ensureUserHasStats(userId: string): Promise<void> {
    try {
      const existingStats = await this.getUserStats(userId);
      
      if (!existingStats) {
        console.log(`Creating initial stats for new user: ${userId}`);
        
        await db.insert(userStats).values({
          userId,
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
    } catch (error) {
      console.error('Error ensuring user has stats:', error);
    }
  }

  async getLeaderboard(limit: number = 10, category?: string): Promise<LeaderboardEntry[]> {
    try {
      const query = db.select().from(leaderboard)
        .orderBy(desc(leaderboard.score))
        .limit(limit);

      if (category) {
        return await query.where(eq(leaderboard.category, category));
      } else {
        return await query.where(sql`${leaderboard.category} IS NULL`);
      }
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getCategoryStats(userId: string): Promise<CategoryStats[]> {
    try {
      return await db.select().from(categoryStats)
        .where(eq(categoryStats.userId, userId))
        .orderBy(desc(categoryStats.lastAttempted));
    } catch (error) {
      console.error('Error getting category stats:', error);
      return [];
    }
  }

  async getDailyStats(userId: string, days: number = 7): Promise<DailyStats[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await db.select().from(dailyStats)
        .where(and(eq(dailyStats.userId, userId), gte(dailyStats.date, startDate)))
        .orderBy(desc(dailyStats.date));
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return [];
    }
  }

  async getRecentQuizAttempts(userId: string, limit: number = 10): Promise<QuizAttempt[]> {
    try {
      const attempts = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, userId))
        .orderBy(desc(quizAttempts.attemptedAt))
        .limit(limit);

      return attempts;
    } catch (error) {
      console.error('Error getting recent quiz attempts:', error);
      return [];
    }
  }

  async getQuizAttempts(userId: string, limit: number = 20): Promise<QuizAttempt[]> {
    try {
      return await this.getRecentQuizAttempts(userId, limit);
    } catch (error) {
      console.error('Error getting quiz attempts:', error);
      return [];
    }
  }

  // Enhanced leaderboard with time frame support
  async getEnhancedLeaderboard(limit: number = 50, category?: string, timeFrame: string = 'all-time') {
    try {
      const query = db
        .select({
          id: userStats.id,
          userId: userStats.userId,
          rank: userStats.rank,
          totalXP: userStats.totalXP,
          currentLevel: userStats.currentLevel,
          weeklyXP: sql`0`.as('weeklyXP'),
          monthlyXP: sql`0`.as('monthlyXP'),
          averageAccuracy: userStats.averageScore,
          totalBadges: sql`0`.as('totalBadges'),
          lastActive: sql`NOW()`.as('lastActive')
        })
        .from(userStats)
        .orderBy(desc(userStats.totalXP))
        .limit(limit);

      return await query;
    } catch (error) {
      console.error('Error getting enhanced leaderboard:', error);
      return [];
    }
  }

  // AI session management
  async createAiSession(userId: string, toolType: string, title: string): Promise<any> {
    try {
      const sessionId = crypto.randomUUID();
      const result = await db.insert(aiSessions).values({
        id: sessionId,
        userId,
        toolType,
        title,
        totalMessages: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating AI session:', error);
      throw error;
    }
  }

  async addAiMessage(sessionId: string, userId: string, role: string, content: string, toolType: string): Promise<any> {
    try {
      const result = await db.insert(aiChats).values({
        sessionId,
        userId,
        role,
        content,
        toolType,
        createdAt: new Date()
      }).returning();

      // Update session
      await db.update(aiSessions)
        .set({ 
          lastMessage: content.substring(0, 100),
          updatedAt: new Date() 
        })
        .where(eq(aiSessions.id, sessionId));

      return result[0];
    } catch (error) {
      console.error('Error adding AI message:', error);
      throw error;
    }
  }

  async getAiSessions(userId: string, limit: number = 10): Promise<any[]> {
    try {
      return await db.select()
        .from(aiSessions)
        .where(eq(aiSessions.userId, userId))
        .orderBy(desc(aiSessions.updatedAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting AI sessions:', error);
      return [];
    }
  }

  async getAiMessages(sessionId: string): Promise<any[]> {
    try {
      return await db.select()
        .from(aiChats)
        .where(eq(aiChats.sessionId, sessionId))
        .orderBy(aiChats.createdAt);
    } catch (error) {
      console.error('Error getting AI messages:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
export const dbStorage = storage;
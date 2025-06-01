import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, userStats, categoryStats, dailyStats, leaderboard, quizAttempts,
  type User, type InsertUser, type UserStats, type CategoryStats, 
  type DailyStats, type LeaderboardEntry, type QuizAttempt,
  type InsertQuizAttempt, type InsertUserStats, type InsertCategoryStats,
  type InsertDailyStats, type InsertLeaderboard
} from '@shared/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
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
      // Try to get existing user
      const existingUser = await this.getUser(userData.id);
      
      if (existingUser) {
        // Update existing user
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
        // Create new user
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

  // Quiz Analytics Methods
  async recordQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt> {
    try {
      // Validate required fields
      if (!attemptData.userId || !attemptData.category || !attemptData.selectedAnswer || !attemptData.correctAnswer) {
        throw new Error('Missing required fields for quiz attempt');
      }

      const insertData: InsertQuizAttempt = {
        userId: attemptData.userId,
        quizId: attemptData.quizId || null,
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
      
      // Update user stats after recording attempt
      await this.updateUserStats(insertData.userId, insertData.isCorrect, insertData.xpEarned, insertData.timeSpent);
      
      // Update category stats
      await this.updateCategoryStats(insertData.userId, insertData.category, insertData.isCorrect, insertData.timeSpent);
      
      // Update daily stats
      await this.updateDailyStats(insertData.userId, insertData.category, insertData.isCorrect, insertData.xpEarned);
      
      // Update leaderboard
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
      
      // Update overall leaderboard
      await db.insert(leaderboard).values({
        userId,
        category: null,
        rank: 0,
        score: userStatsData.totalXP,
        totalQuestions: userStatsData.totalQuestions,
        accuracy: userStatsData.averageScore
      }).onConflictDoUpdate({
        target: [leaderboard.userId, leaderboard.category],
        set: {
          score: userStatsData.totalXP,
          totalQuestions: userStatsData.totalQuestions,
          accuracy: userStatsData.averageScore,
          updatedAt: new Date()
        }
      });
      
      // Update ranks for all users
      await this.updateLeaderboardRanks();
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  async updateLeaderboardRanks(): Promise<void> {
    try {
      const entries = await db.select().from(leaderboard)
        .where(eq(leaderboard.category, null))
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

  async getUserQuizAttempts(userId: string, limit: number = 10): Promise<QuizAttempt[]> {
    try {
      return await db.select()
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, userId))
        .orderBy(desc(quizAttempts.attemptedAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting user quiz attempts:', error);
      return [];
    }
  }
}

export const dbStorage = new DatabaseStorage();
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, userStats, categoryStats, dailyStats, leaderboard, quizAttempts, badges, userBadges,
  type User, type InsertUser, type UserStats, type CategoryStats, 
  type DailyStats, type LeaderboardEntry, type QuizAttempt,
  type InsertQuizAttempt, type InsertUserStats, type InsertCategoryStats,
  type InsertDailyStats, type InsertLeaderboard
} from '@shared/schema';
import { eq, desc, sql, and, gte, isNotNull, lte, gt, lt, count, sum, avg } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export class DatabaseStorage {
  private users = new Map<string, any>();
  private quizAttempts = new Map<string, any>();
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
      // First, ensure we have all required fields
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

      // Check if leaderboard entry exists
      const existingEntry = await db.select()
        .from(leaderboard)
        .where(and(eq(leaderboard.userId, userId), sql`${leaderboard.category} IS NULL`))
        .limit(1);

      if (existingEntry.length > 0) {
        // Update existing entry
        await db.update(leaderboard)
          .set({
            score: userStatsData.totalXP,
            totalQuestions: userStatsData.totalQuestions,
            accuracy: userStatsData.averageScore,
            updatedAt: new Date()
          })
          .where(eq(leaderboard.id, existingEntry[0].id));
      } else {
        // Insert new entry
        await db.insert(leaderboard).values({
          userId,
          category: null,
          rank: 0,
          score: userStatsData.totalXP,
          totalQuestions: userStatsData.totalQuestions,
          accuracy: userStatsData.averageScore
        });
      }

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
          weeklyXP: sql`0`.as('weeklyXP'), // Default for now
          monthlyXP: sql`0`.as('monthlyXP'), // Default for now
          averageAccuracy: userStats.averageScore,
          totalBadges: sql`0`.as('totalBadges'), // Default for now
          category: sql`null`.as('category'),
          lastActive: userStats.updatedAt,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(userStats)
        .leftJoin(users, eq(userStats.userId, users.id))
        .where(sql`${userStats.totalXP} > 0`)
        .orderBy(desc(userStats.totalXP))
        .limit(limit);

      const entries = await query;

      // Add rank numbers and category list
      const rankedEntries = entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        rankChange: 0 // Default for now
      }));

      // Get available categories from categoryStats
      const categoriesResult = await db
        .selectDistinct({ category: categoryStats.category })
        .from(categoryStats);

      return {
        entries: rankedEntries,
        categories: categoriesResult.map(c => c.category).filter(Boolean)
      };
    } catch (error) {
      console.error('Error getting enhanced leaderboard:', error);
      return { entries: [], categories: [] };
    }
  }

  // Get user rank and position
  async getUserRank(userId: string, category?: string, timeFrame: string = 'all-time') {
    try {
      // First get user's stats
      const currentUserStats = await this.getUserStats(userId);
      if (!currentUserStats) {
        return { rank: 0, totalXP: 0, averageAccuracy: 0, currentLevel: 1 };
      }

      // Calculate rank by counting users with higher XP
      const rankResult = await db
        .select({
          rank: sql`COUNT(*) + 1`.as('rank')
        })
        .from(userStats)
        .where(sql`${userStats.totalXP} > ${currentUserStats.totalXP}`);

      const rank = parseInt(rankResult[0]?.rank as string) || 1;

      return {
        rank,
        totalXP: currentUserStats.totalXP,
        averageAccuracy: currentUserStats.averageScore,
        currentLevel: currentUserStats.currentLevel
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return { rank: 0, totalXP: 0, averageAccuracy: 0, currentLevel: 1 };
    }
  }

  // Get user badges with progress
  async getUserBadges(userId: string) {
    try {
      // Get all available badges
      const allBadges = await this.initializeBadges();

      // Get user's earned badges
      const earnedBadges = await db
        .select({
          badgeId: userBadges.badgeId,
          earnedAt: userBadges.earnedAt,
          progress: userBadges.progress
        })
        .from(userBadges)
        .where(eq(userBadges.userId, userId));

      const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

      // Calculate progress for available badges
      const badgesWithProgress = await Promise.all(
        allBadges.map(async (badge) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          const earnedBadge = earnedBadges.find(b => b.badgeId === badge.id);

          let progress = 0;
          if (!isEarned) {
            progress = await this.calculateBadgeProgress(userId, badge);
          }

          return {
            ...badge,
            earned: isEarned,
            progress: isEarned ? badge.requirement : progress,
            earnedAt: earnedBadge?.earnedAt?.toISOString()
          };
        })
      );

      const earned = badgesWithProgress.filter(b => b.earned);
      const available = badgesWithProgress.filter(b => !b.earned);

      return { earned, available };
    } catch (error) {
      console.error('Error getting user badges:', error);
      return { earned: [], available: [] };
    }
  }

  // Initialize badges if they don't exist
  async initializeBadges() {
    try {
      const existingBadges = await db.select().from(badges);

      if (existingBadges.length === 0) {
        const defaultBadges = [
          {
            name: "First Steps",
            description: "Complete your first quiz",
            icon: "Trophy",
            category: "performance",
            tier: "bronze",
            requirement: 1,
            requirementType: "quizzes_completed",
            xpReward: 50,
            color: "#CD7F32",
            isSecret: false
          },
          {
            name: "Quiz Master",
            description: "Complete 10 quizzes",
            icon: "Crown",
            category: "performance", 
            tier: "silver",
            requirement: 10,
            requirementType: "quizzes_completed",
            xpReward: 200,
            color: "#C0C0C0",
            isSecret: false
          },
          {
            name: "Accuracy Expert",
            description: "Achieve 90% accuracy on 5 quizzes",
            icon: "Target",
            category: "performance",
            tier: "gold",
            requirement: 5,
            requirementType: "high_accuracy_quizzes",
            xpReward: 300,
            color: "#FFD700",
            isSecret: false
          },
          {
            name: "Study Streak",
            description: "Study for 7 consecutive days",
            icon: "Flame",
            category: "streak",
            tier: "bronze",
            requirement: 7,
            requirementType: "consecutive_days",
            xpReward: 150,
            color: "#FF4500",
            isSecret: false
          },
          {
            name: "Speed Demon",
            description: "Complete a quiz in under 2 minutes",
            icon: "Zap",
            category: "time",
            tier: "silver",
            requirement: 1,
            requirementType: "fast_completion",
            xpReward: 100,
            color: "#FFD700",
            isSecret: false
          },
          {
            name: "Perfectionist",
            description: "Get 100% on any quiz",
            icon: "Star",
            category: "performance",
            tier: "gold",
            requirement: 1,
            requirementType: "perfect_score",
            xpReward: 250,
            color: "#FFD700",
            isSecret: false
          }
        ];

        await db.insert(badges).values(defaultBadges);
        return await db.select().from(badges);
      }

      return existingBadges;
    } catch (error) {
      console.error('Error initializing badges:', error);
      return [];
    }
  }

  // Calculate badge progress for a user
  async calculateBadgeProgress(userId: string, badge: any): Promise<number> {
    try {
      switch (badge.requirementType) {
        case 'quizzes_completed':
          const quizCount = await db
            .select({ count: sql`count(*)`.as('count') })
            .from(quizAttempts)
            .where(eq(quizAttempts.userId, userId));
          return parseInt(quizCount[0]?.count as string) || 0;

        case 'high_accuracy_quizzes':
          const highAccuracyCount = await db
            .select({ count: sql`count(*)`.as('count') })
            .from(quizAttempts)
            .where(and(
              eq(quizAttempts.userId, userId),
              gte(quizAttempts.score, 90)
            ));
          return parseInt(highAccuracyCount[0]?.count as string) || 0;

        case 'perfect_score':
          const perfectCount = await db
            .select({ count: sql`count(*)`.as('count') })
            .from(quizAttempts)
            .where(and(
              eq(quizAttempts.userId, userId),
              eq(quizAttempts.score, 100)
            ));
          return parseInt(perfectCount[0]?.count as string) || 0;

        case 'consecutive_days':
          // This would require more complex logic to track consecutive days
          return 0;

        case 'fast_completion':
          const fastCount = await db
            .select({ count: sql`count(*)`.as('count') })
            .from(quizAttempts)
            .where(and(
              eq(quizAttempts.userId, userId),
              lte(quizAttempts.timeSpent, 120) // 2 minutes in seconds
            ));
          return parseInt(fastCount[0]?.count as string) || 0;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return 0;
    }
  }

  // Award badge to user
  async awardBadge(userId: string, badgeId: number, progress?: number) {
    try {
      const existing = await db
        .select()
        .from(userBadges)
        .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, message: "Badge already earned" };
      }

      await db.insert(userBadges).values({
        userId,
        badgeId,
        progress: progress || 0
      });

      return { success: true, message: "Badge awarded successfully" };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return { success: false, message: "Failed to award badge" };
    }
  }

  // Check and award new badges based on progress
  async checkBadgeProgress(userId: string) {
    try {
      const allBadges = await this.initializeBadges();
      const newBadges = [];

      for (const badge of allBadges) {
        const progress = await this.calculateBadgeProgress(userId, badge);

        if (progress >= badge.requirement) {
          const result = await this.awardBadge(userId, badge.id, progress);
          if (result.success) {
            newBadges.push(badge);
          }
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badge progress:', error);
      return [];
    }
  }

  async getLeaderboard(limit: number = 10, timeFrame: string = 'all-time', category?: string): Promise<any[]> {
    try {
      // First, refresh the leaderboard data
      await this.updateGlobalLeaderboard();

      let baseQuery = db
        .select({
          id: userStats.id,
          userId: userStats.userId,
          rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userStats.totalXP} DESC)`.as('rank'),
          totalXP: userStats.totalXP,
          currentLevel: userStats.currentLevel,
          weeklyXP: sql<number>`COALESCE(${userStats.totalXP}, 0)`.as('weeklyXP'),
          monthlyXP: sql<number>`COALESCE(${userStats.totalXP}, 0)`.as('monthlyXP'),
          averageAccuracy: userStats.averageScore,
          totalBadges: sql<number>`0`.as('totalBadges'),
          lastActive: userStats.updatedAt,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(userStats)
        .leftJoin(users, eq(userStats.userId, users.id))
        .where(gt(userStats.totalQuestions, 0))
        .orderBy(desc(userStats.totalXP))
        .limit(limit);

      const results = await baseQuery;

      return results.map((result, index) => ({
        ...result,
        rank: index + 1,
        rankChange: 0 // Could implement change tracking later
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId: string, timeFrame: string = 'all-time', category?: string): Promise<any> {
    try {
      // Get user's current stats
      const userStatsData = await this.getUserStats(userId);
      if (!userStatsData) {
        return { rank: 'Unranked', totalXP: 0, averageAccuracy: 0 };
      }

      // Count users with higher XP to determine rank
      const rankQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(userStats)
        .where(and(
          gt(userStats.totalXP, userStatsData.totalXP),
          gt(userStats.totalQuestions, 0)
        ));

      const rankResult = await rankQuery;
      const rank = (rankResult[0]?.count || 0) + 1;

      return {
        rank,
        totalXP: userStatsData.totalXP,
        averageAccuracy: userStatsData.averageScore
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return { rank: 'Unranked', totalXP: 0, averageAccuracy: 0 };
    }
  }
}

export const dbStorage = new DatabaseStorage();
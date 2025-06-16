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

// Use Supabase connection string - prioritize SUPABASE_DATABASE_URL
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('Database connection string not found. Please set SUPABASE_DATABASE_URL or DATABASE_URL environment variable.');
}

console.log('Database connection details:');
console.log('- URL configured:', !!connectionString);
console.log('- URL starts with postgres:', connectionString.startsWith('postgres://'));
console.log('- Using Supabase:', connectionString.includes('supabase.co'));

// Configure postgres client with proper timeout and SSL settings for Supabase
const client = postgres(connectionString, {
  ssl: 'require',
  connect_timeout: 60,
  socket_timeout: 60,
  idle_timeout: 60,
  max: 10,
  onnotice: () => {} // Suppress notices
});

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
        
        // Calculate streak: increment if correct, reset if wrong
        const newStreak = isCorrect ? existing.currentStreak + 1 : 0;
        const newLongestStreak = Math.max(existing.longestStreak, newStreak);
        
        const newTotalXP = existing.totalXP + (xpEarned || 0);
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
            totalStudyTime: existing.totalStudyTime + Math.round((timeSpent || 0) / 60),
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
          totalXP: xpEarned || 0,
          currentLevel: Math.floor((xpEarned || 0) / 1000) + 1,
          totalStudyTime: Math.round((timeSpent || 0) / 60),
          rank: 0
        });
      }

      console.log(`Updated stats for user ${userId}: ${newTotalQuestions} questions, ${newCorrectAnswers} correct, ${newAverageScore}% accuracy, ${newTotalXP} XP, Level ${newLevel}, Streak ${newStreak}`);
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
      } else {
        // Recalculate stats from actual quiz data to ensure accuracy
        await this.recalculateUserStats(userId);
      }
    } catch (error) {
      console.error('Error ensuring user has stats:', error);
    }
  }

  async recalculateUserStats(userId: string): Promise<void> {
    try {
      console.log(`Recalculating stats for user ${userId} from quiz attempts...`);
      
      // Get all quiz attempts for this user
      const attempts = await db.select().from(quizAttempts)
        .where(eq(quizAttempts.userId, userId))
        .orderBy(quizAttempts.attemptedAt);

      if (attempts.length === 0) {
        console.log(`No quiz attempts found for user ${userId}`);
        return;
      }

      // Calculate actual stats from attempts
      const totalQuestions = attempts.length;
      const correctAnswers = attempts.filter(attempt => attempt.isCorrect).length;
      const averageScore = Math.round((correctAnswers / totalQuestions) * 100);
      const totalXP = attempts.reduce((sum, attempt) => sum + (attempt.xpEarned || 0), 0);
      const currentLevel = Math.floor(totalXP / 1000) + 1;
      const totalStudyTime = Math.round(attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / 60);

      // Calculate current streak (consecutive correct answers from the end)
      let currentStreak = 0;
      for (let i = attempts.length - 1; i >= 0; i--) {
        if (attempts[i].isCorrect) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      for (const attempt of attempts) {
        if (attempt.isCorrect) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Update user stats with calculated values
      await db.update(userStats)
        .set({
          totalQuestions,
          correctAnswers,
          averageScore,
          currentStreak,
          longestStreak,
          totalXP,
          currentLevel,
          totalStudyTime,
          updatedAt: new Date()
        })
        .where(eq(userStats.userId, userId));

      console.log(`Recalculated stats for user ${userId}: ${totalQuestions} questions, ${correctAnswers} correct (${averageScore}%), ${totalXP} XP, Level ${currentLevel}, Streak ${currentStreak}/${longestStreak}`);
    } catch (error) {
      console.error('Error recalculating user stats:', error);
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

  // Enhanced leaderboard with time frame support and user data
  async getLeaderboard(limit: number = 50, timeFrame: string = 'all-time', category?: string) {
    try {
      console.log(`Getting leaderboard: limit=${limit}, timeFrame=${timeFrame}, category=${category}`);
      
      const query = db
        .select({
          id: userStats.id,
          userId: userStats.userId,
          rank: userStats.rank,
          totalXP: userStats.totalXP,
          currentLevel: userStats.currentLevel,
          weeklyXP: sql<number>`0`.as('weeklyXP'),
          monthlyXP: sql<number>`0`.as('monthlyXP'),
          averageAccuracy: userStats.averageScore,
          totalBadges: sql<number>`0`.as('totalBadges'),
          lastActive: userStats.updatedAt,
          // User data
          firstName: users.firstName,
          lastName: users.lastName,
          fullName: users.fullName,
          email: users.email
        })
        .from(userStats)
        .leftJoin(users, eq(userStats.userId, users.id))
        .where(gt(userStats.totalXP, 0)) // Only users with XP
        .orderBy(desc(userStats.totalXP), desc(userStats.averageScore))
        .limit(limit);

      const results = await query;
      
      console.log(`Leaderboard query returned ${results.length} entries`);
      
      // Format for frontend
      return results.map((entry, index) => ({
        id: entry.id,
        userId: entry.userId,
        rank: index + 1, // Calculate rank based on order
        totalXP: entry.totalXP,
        currentLevel: entry.currentLevel,
        weeklyXP: entry.weeklyXP,
        monthlyXP: entry.monthlyXP,
        averageAccuracy: entry.averageAccuracy,
        totalBadges: entry.totalBadges,
        lastActive: entry.lastActive?.toISOString() || new Date().toISOString(),
        user: {
          firstName: entry.firstName,
          lastName: entry.lastName,
          fullName: entry.fullName,
          email: entry.email
        }
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId: string, timeFrame: string = 'all-time', category?: string) {
    try {
      console.log(`Getting user rank for ${userId}`);
      
      const userStatsData = await this.getUserStats(userId);
      if (!userStatsData) {
        console.log(`No stats found for user ${userId}`);
        return null;
      }

      // Count users with higher XP to determine rank
      const [rankResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userStats)
        .where(gt(userStats.totalXP, userStatsData.totalXP));

      const rank = (rankResult?.count || 0) + 1;

      return {
        rank,
        totalXP: userStatsData.totalXP,
        currentLevel: userStatsData.currentLevel,
        averageAccuracy: userStatsData.averageScore,
        totalQuestions: userStatsData.totalQuestions,
        correctAnswers: userStatsData.correctAnswers
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  async updateGlobalLeaderboard(): Promise<void> {
    try {
      console.log('Updating global leaderboard...');
      
      // Get all users with stats ordered by XP
      const allUsers = await db
        .select({
          userId: userStats.userId,
          totalXP: userStats.totalXP,
          currentLevel: userStats.currentLevel,
          averageScore: userStats.averageScore
        })
        .from(userStats)
        .where(gt(userStats.totalXP, 0))
        .orderBy(desc(userStats.totalXP), desc(userStats.averageScore));

      console.log(`Found ${allUsers.length} users to rank`);

      // Update ranks in userStats table
      for (let i = 0; i < allUsers.length; i++) {
        await db.update(userStats)
          .set({ rank: i + 1 })
          .where(eq(userStats.userId, allUsers[i].userId));
      }

      // Update global leaderboard table
      await db.delete(globalLeaderboard); // Clear existing entries

      if (allUsers.length > 0) {
        const leaderboardEntries = allUsers.map((user, index) => ({
          userId: user.userId,
          totalXP: user.totalXP,
          currentLevel: user.currentLevel,
          rank: index + 1,
          updatedAt: new Date()
        }));

        await db.insert(globalLeaderboard).values(leaderboardEntries);
      }

      console.log(`Global leaderboard updated with ${allUsers.length} entries`);
    } catch (error) {
      console.error('Error updating global leaderboard:', error);
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

  // Badge System Implementation
  async initializeBadges(): Promise<void> {
    try {
      console.log('Initializing badge system...');
      
      // Check if badges already exist
      const existingBadges = await db.select().from(badges).limit(1);
      
      if (existingBadges.length === 0) {
        console.log('Creating default badges...');
        
        const defaultBadges = [
          {
            name: "First Steps",
            description: "Complete your first quiz",
            icon: "Trophy",
            category: "performance",
            tier: "bronze",
            requirement: 1,
            requirementType: "questions",
            xpReward: 50,
            color: "#CD7F32",
            isSecret: false
          },
          {
            name: "Quick Learner", 
            description: "Answer 10 questions correctly",
            icon: "Zap",
            category: "performance",
            tier: "bronze", 
            requirement: 10,
            requirementType: "questions",
            xpReward: 100,
            color: "#CD7F32",
            isSecret: false
          },
          {
            name: "Streak Master",
            description: "Maintain a 7-day study streak",
            icon: "Flame",
            category: "streak",
            tier: "silver",
            requirement: 7,
            requirementType: "streak",
            xpReward: 200,
            color: "#C0C0C0",
            isSecret: false
          },
          {
            name: "Accuracy Expert",
            description: "Achieve 90% accuracy in 50+ questions",
            icon: "Target", 
            category: "mastery",
            tier: "gold",
            requirement: 90,
            requirementType: "accuracy",
            xpReward: 500,
            color: "#FFD700",
            isSecret: false
          },
          {
            name: "Study Marathon",
            description: "Study for 10 hours total",
            icon: "Clock",
            category: "time",
            tier: "silver",
            requirement: 600, // 10 hours in minutes
            requirementType: "time",
            xpReward: 300,
            color: "#C0C0C0",
            isSecret: false
          },
          {
            name: "Knowledge Seeker",
            description: "Earn 1000 XP",
            icon: "Star",
            category: "performance",
            tier: "gold",
            requirement: 1000,
            requirementType: "xp",
            xpReward: 1000,
            color: "#FFD700",
            isSecret: false
          },
          {
            name: "Perfect Score",
            description: "Get 100% on any quiz",
            icon: "Award",
            category: "mastery",
            tier: "gold",
            requirement: 100,
            requirementType: "perfect",
            xpReward: 250,
            color: "#FFD700",
            isSecret: false
          },
          {
            name: "Persistent Learner",
            description: "Answer 100 questions",
            icon: "BookOpen",
            category: "performance",
            tier: "silver",
            requirement: 100,
            requirementType: "questions",
            xpReward: 300,
            color: "#C0C0C0",
            isSecret: false
          }
        ];

        await db.insert(badges).values(defaultBadges);
        console.log(`Created ${defaultBadges.length} default badges`);
      }
      
      console.log('Badge system initialized successfully');
    } catch (error) {
      console.error('Error initializing badges:', error);
      throw error;
    }
  }

  async checkAndAwardBadges(userId: string): Promise<any[]> {
    try {
      // Ensure badges are initialized
      await this.initializeBadges();
      
      const userStatsData = await this.getUserStats(userId);
      if (!userStatsData) {
        await this.ensureUserHasStats(userId);
        return [];
      }

      const allBadges = await db.select().from(badges);
      const earnedBadges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
      const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));
      
      const newBadges = [];

      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue; // Already earned

        const progress = await this.calculateBadgeProgress(userId, badge, userStatsData);
        
        if (progress >= badge.requirement) {
          console.log(`Awarding badge "${badge.name}" to user ${userId}`);
          
          // Award the badge
          await db.insert(userBadges).values({
            userId,
            badgeId: badge.id,
            progress: badge.requirement,
            earnedAt: new Date()
          });

          // Add XP reward
          if (badge.xpReward > 0) {
            await db.update(userStats)
              .set({ 
                totalXP: userStatsData.totalXP + badge.xpReward,
                currentLevel: Math.floor((userStatsData.totalXP + badge.xpReward) / 1000) + 1,
                updatedAt: new Date()
              })
              .where(eq(userStats.userId, userId));
          }

          newBadges.push(badge);
        }
      }

      if (newBadges.length > 0) {
        console.log(`Awarded ${newBadges.length} new badges to user ${userId}`);
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return [];
    }
  }

  async calculateBadgeProgress(userId: string, badge: any, userStatsData?: any): Promise<number> {
    try {
      if (!userStatsData) {
        userStatsData = await this.getUserStats(userId);
      }
      
      if (!userStatsData) return 0;

      switch (badge.requirementType) {
        case 'questions':
          return userStatsData.totalQuestions;
          
        case 'accuracy':
          if (userStatsData.totalQuestions >= 50) {
            return userStatsData.averageScore;
          }
          return 0;
          
        case 'streak':
          return userStatsData.currentStreak;
          
        case 'time':
          return userStatsData.totalStudyTime;
          
        case 'xp':
          return userStatsData.totalXP;
          
        case 'perfect':
          // Check for perfect scores in quiz attempts
          const perfectScores = await db.select({ count: sql<number>`count(*)` })
            .from(quizAttempts)
            .where(and(
              eq(quizAttempts.userId, userId),
              eq(quizAttempts.isCorrect, true)
            ));
          
          // Simple check: if they have any correct answers, consider it progress toward perfect
          const correctCount = parseInt(perfectScores[0]?.count as string) || 0;
          return correctCount > 0 ? 100 : 0;
          
        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return 0;
    }
  }

  async getUserBadges(userId: string): Promise<{ earned: any[], available: any[] }> {
    try {
      // Ensure badges are initialized
      await this.initializeBadges();
      
      const allBadges = await db.select().from(badges);
      const earnedBadges = await db.select({
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        progress: userBadges.progress,
        name: badges.name,
        description: badges.description,
        icon: badges.icon,
        category: badges.category,
        tier: badges.tier,
        xpReward: badges.xpReward,
        color: badges.color
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

      const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));
      
      const userStatsData = await this.getUserStats(userId);

      const availableBadges = await Promise.all(
        allBadges
          .filter(badge => !earnedBadgeIds.has(badge.id))
          .map(async (badge) => {
            const progress = await this.calculateBadgeProgress(userId, badge, userStatsData);
            return {
              ...badge,
              progress,
              earned: false
            };
          })
      );

      const earned = earnedBadges.map(badge => ({
        ...badge,
        earned: true,
        earnedAt: badge.earnedAt?.toISOString()
      }));

      return { earned, available: availableBadges };
    } catch (error) {
      console.error('Error getting user badges:', error);
      return { earned: [], available: [] };
    }
  }

  async awardBadge(userId: string, badgeId: number): Promise<{ success: boolean, message: string }> {
    try {
      // Check if badge already earned
      const existing = await db.select()
        .from(userBadges)
        .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, message: "Badge already earned" };
      }

      // Get badge details
      const badge = await db.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
      if (!badge.length) {
        return { success: false, message: "Badge not found" };
      }

      // Award badge
      await db.insert(userBadges).values({
        userId,
        badgeId,
        progress: badge[0].requirement,
        earnedAt: new Date()
      });

      // Add XP reward
      if (badge[0].xpReward > 0) {
        const userStatsData = await this.getUserStats(userId);
        if (userStatsData) {
          await db.update(userStats)
            .set({ 
              totalXP: userStatsData.totalXP + badge[0].xpReward,
              currentLevel: Math.floor((userStatsData.totalXP + badge[0].xpReward) / 1000) + 1,
              updatedAt: new Date()
            })
            .where(eq(userStats.userId, userId));
        }
      }

      return { success: true, message: `Badge "${badge[0].name}" awarded successfully!` };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return { success: false, message: "Failed to award badge" };
    }
  }
}

export const storage = new DatabaseStorage();
export const dbStorage = storage;
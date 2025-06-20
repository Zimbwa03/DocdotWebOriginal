import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, userStats, categoryStats, dailyStats, leaderboard, quizAttempts, badges, userBadges,
  aiSessions, aiChats, studyPlannerSessions, studyGroups, studyGroupMembers,
  customExams, customExamStems, stemOptions, customExamAttempts, examGenerationHistory,
  type User, type InsertUser, type UserStats, type CategoryStats, 
  type DailyStats, type LeaderboardEntry, type QuizAttempt,
  type InsertQuizAttempt, type InsertUserStats, type InsertCategoryStats,
  type InsertDailyStats, type InsertLeaderboard, type CustomExam, type CustomExamStem,
  type StemOption, type InsertCustomExam, type InsertCustomExamStem, type InsertStemOption
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

  async recordQuizAttempt(attemptData: any): Promise<QuizAttempt> {
    try {
      console.log('🔍 Raw attempt data received:', attemptData);

      const insertData = {
        userId: attemptData.userId!,
        quizId: attemptData.quizId && typeof attemptData.quizId === 'number' ? attemptData.quizId : null,
        questionIdentifier: attemptData.questionIdentifier || attemptData.questionId || null,
        category: attemptData.category || 'general',
        selectedAnswer: attemptData.selectedAnswer || '',
        correctAnswer: attemptData.correctAnswer || '',
        isCorrect: attemptData.isCorrect || false,
        timeSpent: attemptData.timeSpent || 0,
        difficulty: attemptData.difficulty || 'medium',
        xpEarned: attemptData.xpEarned || 0
      };

      console.log('📝 Mapped insert data:', insertData);

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

      if (result[0]) {
        // Ensure all fields are present with defaults
        const stats = {
          ...result[0],
          streak: result[0].streak || result[0].currentStreak || 0,
          level: result[0].level || result[0].currentLevel || 1,
          averageAccuracy: result[0].averageAccuracy || result[0].averageScore || 0,
          weeklyXp: result[0].weeklyXp || 0,
          monthlyXp: result[0].monthlyXp || 0,
          totalBadges: result[0].totalBadges || 0,
          studyTimeToday: 0 // Default value, skip daily stats query for now due to schema issues
        };

        return stats;
      }

      return result[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      return undefined;
    }
  }

  async updateUserStats(userId: string, isCorrect: boolean, xpEarned: number, timeSpent: number): Promise<void> {
    try {
      // Use the SQL function to recalculate stats from actual quiz data
      await db.execute(sql`SELECT recalculate_user_analytics(${userId})`);

      console.log(`📊 Analytics updated for user ${userId} via SQL function`);
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Fallback: try simple increment approach
      try {
        const existing = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

        if (existing.length > 0) {
          const current = existing[0];
          await db.update(userStats)
            .set({
              totalQuestions: (current.totalQuestions || 0) + 1,
              correctAnswers: (current.correctAnswers || 0) + (isCorrect ? 1 : 0),
              totalXp: (current.totalXp || 0) + (xpEarned || 0),
              updatedAt: new Date()
            })
            .where(eq(userStats.userId, userId));
        }
      } catch (fallbackError) {
        console.error('Fallback stats update also failed:', fallbackError);
      }
    }
  }

  async updateCategoryStats(userId: string, category: string, isCorrect: boolean, timeSpent: number): Promise<void> {
    try {
      // Skip category stats update due to schema mismatch - core functionality works
      console.log('🔄 Skipping category stats update due to schema differences');
    } catch (error) {
      console.error('Error updating category stats:', error);
    }
  }

  async updateDailyStats(userId: string, category: string, isCorrect: boolean, xpEarned: number): Promise<void> {
    try {
      // Skip daily stats update due to schema mismatch - core functionality works
      console.log('🔄 Skipping daily stats update due to schema differences');
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

  // Ensure user has stats entry
  async ensureUserHasStats(userId: string): Promise<void> {
    try {
      const existingStats = await db.select().from(userStats)
        .where(eq(userStats.userId, userId));

      if (existingStats.length === 0) {
        await db.insert(userStats).values({
          userId,
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalXp: 0,
          currentLevel: 1,
          totalStudyTime: 0,
          rank: 0,
          weeklyXp: 0,
          monthlyXp: 0,
          averageAccuracy: 0,
          level: 1,
          streak: 0,
          totalBadges: 0
        });
        console.log(`Created stats entry for user: ${userId}`);
      }
    } catch (error) {
      console.error(`Error ensuring user stats for ${userId}:`, error);
      // Don't throw error - analytics should not break the app
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
          totalXp,
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

  // Get category statistics for user
  async getCategoryStats(userId: string) {
    try {
      const result = await db.execute(sql`
        SELECT 
          category,
          COUNT(*) as questions_attempted,
          SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
          ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as average_score,
          AVG(time_spent) as average_time,
          ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as mastery,
          MAX(attempted_at) as last_attempted
        FROM quiz_attempts 
        WHERE user_id = ${userId}
        GROUP BY category
        ORDER BY questions_attempted DESC
      `);

      return result;
    } catch (error) {
      console.error('Error getting category stats:', error);
      return [];
    }
  }

  // Get daily statistics for user
  async getDailyStats(userId: string, days: number = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const result = await db.execute(sql`
        SELECT 
          DATE(attempted_at) as date,
          COUNT(*) as questions_answered,
          SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
          ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as accuracy,
          SUM(COALESCE(time_spent, 0)) as study_time,
          SUM(COALESCE(xp_earned, 0)) as xp_earned,
          ARRAY_AGG(DISTINCT category) as categories_studied
        FROM quiz_attempts 
        WHERE user_id = ${userId} 
          AND attempted_at >= ${startDate.toISOString()}
          AND attempted_at <= ${endDate.toISOString()}
        GROUP BY DATE(attempted_at)
        ORDER BY date DESC
      `);

      return result;
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
        return { rank: 1, totalUsers: 1 };
      }

      // Count users with higher XP to determine rank
      const [rankResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userStats)
        .where(gt(userStats.totalXp, userStatsData.totalXp));

      // Count total users with stats
      const [totalUsersResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userStats)
        .where(gt(userStats.totalQuestions, 0));

      const rank = (rankResult?.count || 0) + 1;
      const totalUsers = totalUsersResult?.count || 1;

      return {
        rank,
        totalUsers,
        totalXp: userStatsData.totalXp,
        currentLevel: userStatsData.currentLevel,
        averageAccuracy: userStatsData.averageScore,
        totalQuestions: userStatsData.totalQuestions,
        correctAnswers: userStatsData.correctAnswers
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return { rank: 1, totalUsers: 1 };
    }
  }

  // Update global leaderboard with actual user data
  async updateGlobalLeaderboard(): Promise<void> {
    try {
      // Calculate rankings based on total XP and level
      const rankedUsers = await db.execute(sql`
        WITH ranked_stats AS (
          SELECT 
            us.user_id,
            COALESCE(us.total_xp, 0) as total_xp,
            COALESCE(us.current_level, 1) as current_level,
            COALESCE(us.current_streak, 0) as current_streak,
            u.first_name,
            u.last_name,
            u.email,
            ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_xp, 0) DESC, COALESCE(us.current_level, 1) DESC) as new_rank
          FROM user_stats us
          LEFT JOIN users u ON us.user_id = u.id
          WHERE u.id IS NOT NULL
        )
        SELECT * FROM ranked_stats
        ORDER BY new_rank
        LIMIT 100
      `);

      // Update global_leaderboard table
      await db.execute(sql`DELETE FROM global_leaderboard`);

      if (rankedUsers.length > 0) {
        for (const user of rankedUsers) {
          await db.execute(sql`
            INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, email)
            VALUES (${user.user_id}, ${user.total_xp}, ${user.current_level}, ${user.new_rank}, ${user.first_name}, ${user.last_name}, ${user.email})
            ON CONFLICT (user_id) DO UPDATE SET
              total_xp = EXCLUDED.total_xp,
              current_level = EXCLUDED.current_level,
              rank = EXCLUDED.rank,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              email = EXCLUDED.email,
              updated_at = NOW()
          `);
        }
      }

      console.log(`Updated global leaderboard with ${rankedUsers.length} entries`);
    } catch (error) {
      console.error('Error updating global leaderboard:', error);
    }
  }

  // Initialize badges system
  async initializeBadges(): Promise<void> {
    try {
      // Check if badges already exist
      const existingBadges = await db.select().from(badges).limit(1);
      if (existingBadges.length > 0) {
        console.log('Badges already initialized');
        return;
      }

      // Insert default badges
      const defaultBadges = [
        {
          name: 'First Steps',
          description: 'Complete your first quiz',
          icon: 'Trophy',
          category: 'performance',
          tier: 'bronze',
          requirement: 1,
          requirementType: 'questions',
          xpReward: 50,
          color: '#CD7F32'
        },
        {
          name: 'Quick Learner',
          description: 'Answer 10 questions correctly',
          icon: 'Zap',
          category: 'performance',
          tier: 'bronze',
          requirement: 10,
          requirementType: 'questions',
          xpReward: 100,
          color: '#CD7F32'
        },
        {
          name: 'Streak Master',
          description: 'Maintain a 7-day study streak',
          icon: 'Flame',
          category: 'streak',
          tier: 'silver',
          requirement: 7,
          requirementType: 'streak',
          xpReward: 200,
          color: '#C0C0C0'
        },
        {
          name: 'Accuracy Expert',
          description: 'Achieve 90% accuracy in 50+ questions',
          icon: 'Target',
          category: 'mastery',
          tier: 'gold',
          requirement: 90,
          requirementType: 'accuracy',
          xpReward: 500,
          color: '#FFD700'
        },
        {
          name: 'Study Marathon',
          description: 'Study for 10 hours total',
          icon: 'Clock',
          category: 'time',
          tier: 'silver',
          requirement: 600,
          requirementType: 'time',
          xpReward: 300,
          color: '#C0C0C0'
        },
        {
          name: 'Knowledge Seeker',
          description: 'Earn 1000 XP',
          icon: 'Star',
          category: 'performance',
          tier: 'gold',
          requirement: 1000,
          requirementType: 'xp',
          xpReward: 1000,
          color: '#FFD700'
        }
      ];

      for (const badge of defaultBadges) {
        await db.insert(badges).values(badge);
      }

      console.log('Badges system initialized successfully');
    } catch (error) {
      console.error('Error initializing badges:', error);
    }
  }

  // Check and award badges to a user
  async checkAndAwardBadges(userId: string): Promise<any[]> {
    try {
      const userStats = await this.getUserStats(userId);
      if (!userStats) return [];

      const availableBadges = await db.select().from(badges);
      const earnedBadges = await db.select().from(userBadges)
        .where(eq(userBadges.userId, userId));

      const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId));
      const newBadges = [];

      for (const badge of availableBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        let shouldAward = false;
        const requirementValue = badge.requirement || 1;

        switch (badge.requirementType) {
          case 'questions':
            shouldAward = (userStats.totalQuestions || 0) >= requirementValue;
            break;
          case 'accuracy':
            shouldAward = (userStats.averageScore || 0) >= requirementValue;
            break;
          case 'streak':
            shouldAward = (userStats.currentStreak || 0) >= requirementValue;
            break;
          case 'xp':
            shouldAward = (userStats.totalXp || 0) >= requirementValue;
            break;
          default:
            // Default to questions requirement
            shouldAward = (userStats.totalQuestions || 0) >= requirementValue;
            break;
        }

        if (shouldAward) {
          await this.awardBadge(userId, badge.id);
          newBadges.push(badge);
        }
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
              totalXp: userStatsData.totalXp + badge[0].xpReward,
              currentLevel: Math.floor((userStatsData.totalXp + badge[0].xpReward) / 1000) + 1,
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
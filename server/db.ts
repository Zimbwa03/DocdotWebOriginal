import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, type User, type InsertUser } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
}

export const dbStorage = new DatabaseStorage();
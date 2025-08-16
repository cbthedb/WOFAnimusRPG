import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, gameStates, User, GameState, InsertUser, InsertGameState } from "@shared/schema";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  // Game state management
  createGameState(gameState: InsertGameState): Promise<GameState>;
  getGameState(id: string): Promise<GameState | undefined>;
  getGameStatesByUserId(userId: string): Promise<GameState[]>;
  updateGameState(id: string, gameState: Partial<InsertGameState>): Promise<GameState>;
  deleteGameState(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createGameState(gameState: InsertGameState): Promise<GameState> {
    const result = await db.insert(gameStates).values({
      ...gameState,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async getGameState(id: string): Promise<GameState | undefined> {
    const result = await db.select().from(gameStates).where(eq(gameStates.id, id));
    return result[0];
  }

  async getGameStatesByUserId(userId: string): Promise<GameState[]> {
    const result = await db.select().from(gameStates).where(eq(gameStates.userId, userId));
    return result;
  }

  async updateGameState(id: string, gameState: Partial<InsertGameState>): Promise<GameState> {
    const result = await db.update(gameStates)
      .set({
        ...gameState,
        updatedAt: new Date()
      })
      .where(eq(gameStates.id, id))
      .returning();
    return result[0];
  }

  async deleteGameState(id: string): Promise<void> {
    await db.delete(gameStates).where(eq(gameStates.id, id));
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
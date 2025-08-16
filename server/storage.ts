import { type User, type InsertUser, type GameState, type InsertGameState } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameState(id: string): Promise<GameState | undefined>;
  getGameStateByUserId(userId: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: string, gameState: Partial<InsertGameState>): Promise<GameState>;
  deleteGameState(id: string): Promise<void>;
}

// Using DatabaseStorage now, keeping MemStorage for reference
class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameStates: Map<string, GameState>;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGameState(id: string): Promise<GameState | undefined> {
    return this.gameStates.get(id);
  }

  async getGameStateByUserId(userId: string): Promise<GameState | undefined> {
    return Array.from(this.gameStates.values()).find(
      (gameState) => gameState.userId === userId,
    );
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = randomUUID();
    const now = new Date();
    const gameState: GameState = {
      ...insertGameState,
      id,
      createdAt: now,
      updatedAt: now,
      userId: insertGameState.userId || null,
      turn: insertGameState.turn || 1,
      location: insertGameState.location || "Jade Mountain Academy",
    };
    this.gameStates.set(id, gameState);
    return gameState;
  }

  async updateGameState(id: string, updateData: Partial<InsertGameState>): Promise<GameState> {
    const existing = this.gameStates.get(id);
    if (!existing) {
      throw new Error("Game state not found");
    }
    
    const updated: GameState = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.gameStates.set(id, updated);
    return updated;
  }

  async deleteGameState(id: string): Promise<void> {
    this.gameStates.delete(id);
  }
}

// Database imports commented out since we're using MemStorage
// import { db } from "./db";
// import { gameStates } from "@shared/schema";
// import { eq } from "drizzle-orm";

// DatabaseStorage commented out since we're using MemStorage
// export class DatabaseStorage implements IStorage {
//   async getUser(id: string): Promise<User | undefined> {
//     // User functionality not implemented yet
//     return undefined;
//   }

//   async getUserByUsername(username: string): Promise<User | undefined> {
//     // User functionality not implemented yet
//     return undefined;
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     // User functionality not implemented yet
//     throw new Error("User functionality not implemented");
//   }

//   async getGameState(id: string): Promise<GameState | undefined> {
//     const [gameState] = await db.select().from(gameStates).where(eq(gameStates.id, id));
//     return gameState || undefined;
//   }

//   async getGameStateByUserId(userId: string): Promise<GameState | undefined> {
//     const [gameState] = await db.select().from(gameStates).where(eq(gameStates.userId, userId));
//     return gameState || undefined;
//   }

//   async createGameState(insertGameState: InsertGameState): Promise<GameState> {
//     const [gameState] = await db
//       .insert(gameStates)
//       .values(insertGameState)
//       .returning();
//     return gameState;
//   }

//   async updateGameState(id: string, updateData: Partial<InsertGameState>): Promise<GameState> {
//     const [gameState] = await db
//       .update(gameStates)
//       .set(updateData)
//       .where(eq(gameStates.id, id))
//       .returning();
//     return gameState;
//   }

//   async deleteGameState(id: string): Promise<void> {
//     await db.delete(gameStates).where(eq(gameStates.id, id));
//   }
// }

export const storage = new MemStorage();

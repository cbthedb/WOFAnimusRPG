import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameStates = pgTable("game_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  characterData: jsonb("character_data").notNull(),
  gameData: jsonb("game_data").notNull(),
  turn: integer("turn").notNull().default(1),
  location: text("location").notNull().default("Jade Mountain Academy"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;

// Game-specific types
export interface Character {
  name: string;
  tribe: string;
  age: number;
  soulPercentage: number;
  sanityPercentage: number;
  strength: number;
  intelligence: number;
  charisma: number;
  wisdom: number;
  mother: string;
  father: string;
  siblings: string[];
  traits: string[];
  avatar: string;
  isAnimus: boolean;
  tribalPowers: string[];
  specialPowers: string[];
}

export interface GameData {
  turn: number;
  location: string;
  timeInfo: string;
  currentScenario: Scenario;
  history: GameEvent[];
  relationships: Record<string, number>;
  inventory: string[];
  reputation: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  narrativeText: string[];
  choices: Choice[];
  type: 'mundane' | 'extraordinary' | 'magical' | 'tribal' | 'prophetic';
  location: string;
  timeOfDay: string;
  weather: string;
}

export interface Choice {
  id: string;
  text: string;
  description: string;
  soulCost: number;
  sanityCost: number;
  consequences: string[];
  requirements?: string[];
  corruption?: boolean;
}

export interface GameEvent {
  turn: number;
  scenario: string;
  choice: string;
  consequences: string[];
  soulLoss: number;
  sanityLoss: number;
}

export interface MagicSpell {
  name: string;
  category: 'minor' | 'moderate' | 'dangerous';
  soulCost: [number, number]; // min, max
  description: string;
  examples: string[];
}

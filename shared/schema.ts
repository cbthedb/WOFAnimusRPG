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
  hybridTribes?: string[]; // For hybrid dragons
  age: number;
  yearsSurvived: number;
  currentSeason: "Spring" | "Summer" | "Fall" | "Winter";
  soulPercentage: number;
  sanityPercentage: number;
  soulCorruptionStage: "Normal" | "Frayed" | "Twisted" | "Broken";
  strength: number;
  intelligence: number;
  charisma: number;
  wisdom: number;
  mother: string;
  father: string;
  siblings: string[];
  mate?: string;
  dragonets: Dragonet[];
  traits: string[];
  avatar: string;
  isAnimus: boolean;
  tribalPowers: string[];
  specialPowers: string[];
  relationships: Record<string, Relationship>;
  achievements: string[];
  isAIControlled: boolean;
  lifeEvents: LifeEvent[];
  romanticHistory: RomanticEvent[];
}

export interface Dragonet {
  name: string;
  age: number;
  tribe: string;
  hybridTribes?: string[];
  inheritedTraits: string[];
  isAnimus: boolean;
  parentage: "biological" | "adopted";
  personality: string;
}

export interface Relationship {
  name: string;
  type: "friend" | "rival" | "enemy" | "neutral" | "romantic" | "mate" | "ex_mate" | "family";
  strength: number;
  history: string[];
  isAlive: boolean;
}

export interface RomanticEvent {
  partnerName: string;
  eventType: "courtship" | "mating" | "breakup" | "loss";
  turnOccurred: number;
  outcome: string;
  hasOffspring: boolean;
}

export interface LifeEvent {
  turn: number;
  category: "birth" | "death" | "political" | "war" | "discovery" | "romance" | "achievement" | "corruption";
  description: string;
  impact: "positive" | "negative" | "neutral";
}

export interface GameData {
  turn: number;
  location: string;
  timeInfo: string;
  currentScenario: Scenario;
  history: GameEvent[];
  relationships: Record<string, number>;
  inventory: InventoryItem[];
  reputation: number;
  politicalEvents: PoliticalEvent[];
  warStatus: WarStatus;
  explorationLog: ExplorationEvent[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "enchanted_object" | "treasure" | "scroll" | "weapon" | "tool" | "magical_artifact";
  enchantments: string[];
  soulCostToCreate?: number;
  turnCreated?: number;
  isActive: boolean;
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
  category: 'minor' | 'moderate' | 'major' | 'catastrophic';
  soulCost: [number, number]; // min, max
  description: string;
  examples: string[];
  type: "enchantment" | "combat" | "healing" | "weather" | "curse" | "summoning";
}

export interface CustomSpell {
  id: string;
  targetObject: string;
  enchantmentDescription: string;
  estimatedSoulCost: number;
  spellType: "enchantment" | "combat" | "healing" | "weather" | "curse" | "summoning";
  complexity: "simple" | "moderate" | "complex" | "catastrophic";
  turnCast: number;
}

export interface PoliticalEvent {
  type: "succession" | "civil_war" | "queen_demand" | "alliance" | "betrayal";
  tribes: string[];
  description: string;
  playerChoice?: string;
  consequences: string;
}

export interface WarStatus {
  isAtWar: boolean;
  warringTribes: string[];
  warCause: string;
  playerInvolvement: "forced_fighter" | "enchanter" | "neutral" | "deserter";
}

export interface ExplorationEvent {
  location: string;
  discovery: "ruins" | "scroll" | "treasure" | "enemy" | "ally" | "mystery";
  description: string;
  consequences: string[];
}

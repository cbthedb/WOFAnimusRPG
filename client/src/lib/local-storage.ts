import { GameState, InsertGameState, Character, GameData } from "@shared/schema";

// Local storage keys
const GAME_STATES_KEY = "wof-rpg-game-states";
const CURRENT_GAME_KEY = "wof-rpg-current-game";

export interface LocalGameState {
  id: string;
  userId: string | null;
  characterData: Character;
  gameData: GameData;
  turn: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export class LocalGameStorage {
  private static getGameStates(): Record<string, LocalGameState> {
    try {
      const stored = localStorage.getItem(GAME_STATES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading game states from localStorage:", error);
      return {};
    }
  }

  private static setGameStates(gameStates: Record<string, LocalGameState>): void {
    try {
      localStorage.setItem(GAME_STATES_KEY, JSON.stringify(gameStates));
    } catch (error) {
      console.error("Error saving game states to localStorage:", error);
    }
  }

  static getGameState(id: string): LocalGameState | undefined {
    const gameStates = this.getGameStates();
    return gameStates[id];
  }

  static getGameStateByUserId(userId: string): LocalGameState | undefined {
    const gameStates = this.getGameStates();
    return Object.values(gameStates).find(gameState => gameState.userId === userId);
  }

  static createGameState(insertGameState: InsertGameState): LocalGameState {
    const id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    const gameState: LocalGameState = {
      id,
      createdAt: now,
      updatedAt: now,
      userId: insertGameState.userId || null,
      turn: insertGameState.turn || 1,
      location: insertGameState.location || "Jade Mountain Academy",
      characterData: insertGameState.characterData as Character,
      gameData: insertGameState.gameData as GameData,
    };

    const gameStates = this.getGameStates();
    gameStates[id] = gameState;
    this.setGameStates(gameStates);

    // Set as current game
    this.setCurrentGameId(id);

    return gameState;
  }

  static updateGameState(id: string, updateData: Partial<InsertGameState>): LocalGameState {
    const gameStates = this.getGameStates();
    const existingGameState = gameStates[id];
    
    if (!existingGameState) {
      throw new Error("Game state not found");
    }

    const updatedGameState: LocalGameState = {
      ...existingGameState,
      ...(updateData as Partial<LocalGameState>),
      updatedAt: new Date().toISOString(),
    };

    gameStates[id] = updatedGameState;
    this.setGameStates(gameStates);

    return updatedGameState;
  }

  static deleteGameState(id: string): void {
    const gameStates = this.getGameStates();
    delete gameStates[id];
    this.setGameStates(gameStates);

    // Clear current game if it was deleted
    if (this.getCurrentGameId() === id) {
      this.clearCurrentGameId();
    }
  }

  static getAllGameStates(): LocalGameState[] {
    const gameStates = this.getGameStates();
    return Object.values(gameStates).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static setCurrentGameId(gameId: string): void {
    try {
      localStorage.setItem(CURRENT_GAME_KEY, gameId);
    } catch (error) {
      console.error("Error setting current game ID:", error);
    }
  }

  static getCurrentGameId(): string | null {
    try {
      return localStorage.getItem(CURRENT_GAME_KEY);
    } catch (error) {
      console.error("Error getting current game ID:", error);
      return null;
    }
  }

  static clearCurrentGameId(): void {
    try {
      localStorage.removeItem(CURRENT_GAME_KEY);
    } catch (error) {
      console.error("Error clearing current game ID:", error);
    }
  }

  static getCurrentGame(): LocalGameState | undefined {
    const currentId = this.getCurrentGameId();
    return currentId ? this.getGameState(currentId) : undefined;
  }

  // Utility methods for backup and restore
  static exportGameData(): string {
    const gameStates = this.getGameStates();
    const currentGameId = this.getCurrentGameId();
    
    return JSON.stringify({
      gameStates,
      currentGameId,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    }, null, 2);
  }

  static importGameData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.gameStates) {
        this.setGameStates(data.gameStates);
      }
      
      if (data.currentGameId) {
        this.setCurrentGameId(data.currentGameId);
      }
      
      return true;
    } catch (error) {
      console.error("Error importing game data:", error);
      return false;
    }
  }

  // Clear all data (for testing or reset)
  static clearAllData(): void {
    try {
      localStorage.removeItem(GAME_STATES_KEY);
      localStorage.removeItem(CURRENT_GAME_KEY);
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  }
}
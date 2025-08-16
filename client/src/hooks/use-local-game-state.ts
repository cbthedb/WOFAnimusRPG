import { useState, useEffect, useCallback } from "react";
import { LocalGameStorage, LocalGameState } from "@/lib/local-storage";
import { InsertGameState, Character, GameData } from "@shared/schema";

export function useLocalGameState() {
  const [currentGame, setCurrentGame] = useState<LocalGameState | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Load current game on hook initialization
  useEffect(() => {
    const game = LocalGameStorage.getCurrentGame();
    setCurrentGame(game);
    setIsLoading(false);
  }, []);

  const createGame = useCallback((gameData: InsertGameState): LocalGameState => {
    const newGame = LocalGameStorage.createGameState(gameData);
    setCurrentGame(newGame);
    return newGame;
  }, []);

  const updateGame = useCallback((id: string, updateData: Partial<InsertGameState>): LocalGameState => {
    const updatedGame = LocalGameStorage.updateGameState(id, updateData);
    setCurrentGame(updatedGame);
    return updatedGame;
  }, []);

  const deleteGame = useCallback((id: string): void => {
    LocalGameStorage.deleteGameState(id);
    if (currentGame?.id === id) {
      setCurrentGame(undefined);
    }
  }, [currentGame?.id]);

  const loadGame = useCallback((id: string): void => {
    const game = LocalGameStorage.getGameState(id);
    if (game) {
      LocalGameStorage.setCurrentGameId(id);
      setCurrentGame(game);
    }
  }, []);

  const getAllGames = useCallback((): LocalGameState[] => {
    return LocalGameStorage.getAllGameStates();
  }, []);

  const exportData = useCallback((): string => {
    return LocalGameStorage.exportGameData();
  }, []);

  const importData = useCallback((jsonData: string): boolean => {
    const success = LocalGameStorage.importGameData(jsonData);
    if (success) {
      // Refresh current game
      const game = LocalGameStorage.getCurrentGame();
      setCurrentGame(game);
    }
    return success;
  }, []);

  const clearAllData = useCallback((): void => {
    LocalGameStorage.clearAllData();
    setCurrentGame(undefined);
  }, []);

  return {
    currentGame,
    isLoading,
    createGame,
    updateGame,
    deleteGame,
    loadGame,
    getAllGames,
    exportData,
    importData,
    clearAllData,
  };
}

// Simplified hook for just getting/setting current character and game data
export function useCurrentGameData() {
  const { currentGame, updateGame } = useLocalGameState();

  const updateCharacter = useCallback((character: Character): void => {
    if (currentGame) {
      updateGame(currentGame.id, { characterData: character });
    }
  }, [currentGame, updateGame]);

  const updateGameData = useCallback((gameData: GameData): void => {
    if (currentGame) {
      updateGame(currentGame.id, { gameData: gameData });
    }
  }, [currentGame, updateGame]);

  const updateBoth = useCallback((character: Character, gameData: GameData): void => {
    if (currentGame) {
      updateGame(currentGame.id, { 
        characterData: character, 
        gameData: gameData 
      });
    }
  }, [currentGame, updateGame]);

  return {
    character: currentGame?.characterData,
    gameData: currentGame?.gameData,
    gameId: currentGame?.id,
    updateCharacter,
    updateGameData,
    updateBoth,
    hasGame: !!currentGame,
  };
}
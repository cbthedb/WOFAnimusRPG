import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateCharacter } from "@/lib/character-generator";
import { generateScenario, generateTimeInfo } from "@/lib/scenario-generator-final";
import { Character, GameData, InsertGameState } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);

  const createGameMutation = useMutation({
    mutationFn: async (gameState: InsertGameState) => {
      const response = await apiRequest("POST", "/api/game", gameState);
      return response.json();
    },
    onSuccess: (gameState) => {
      setLocation(`/game/${gameState.id}`);
    },
  });

  const handleNewGame = () => {
    setIsCreating(true);
    
    const character = generateCharacter();
    const gameData: GameData = {
      turn: 1,
      location: "Jade Mountain Academy",
      timeInfo: generateTimeInfo(),
      currentScenario: generateScenario(character, {} as GameData),
      history: [],
      relationships: {},
      inventory: [],
      reputation: 0
    };

    const gameState: InsertGameState = {
      userId: null, // No user system for now
      characterData: character,
      gameData: gameData,
      turn: 1,
      location: gameData.location
    };

    createGameMutation.mutate(gameState);
  };

  return (
    <div className="min-h-screen bg-dragon-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/20 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl">🐉</div>
          </div>
          <CardTitle className="text-4xl font-fantasy text-purple-300 mb-2">
            Animus: Wings of Fire RPG
          </CardTitle>
          <CardDescription className="text-purple-200 text-lg font-narrative">
            A text-based RPG where you play as an animus dragon, wielding the most dangerous magic in Pyrrhia. 
            Every spell costs a piece of your soul—lose too much, and the darkness will consume you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">🎭 Dynamic Storytelling</h3>
              <p>Every playthrough is unique with randomly generated characters, families, and scenarios.</p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">🌟 Soul-Loss Mechanics</h3>
              <p>Using animus magic corrupts your soul. Lose control as darkness takes over.</p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">⚔️ Meaningful Choices</h3>
              <p>Every decision has consequences that ripple through your dragon's story.</p>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">🔮 AI Corruption</h3>
              <p>When your soul is lost, the game makes increasingly dark choices for you.</p>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button 
              size="lg" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-fantasy text-lg py-6"
              onClick={handleNewGame}
              disabled={isCreating || createGameMutation.isPending}
            >
              {isCreating || createGameMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2">⚡</div>
                  Generating Your Dragon...
                </>
              ) : (
                <>
                  🐲 Begin Your Journey
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
              disabled
            >
              📚 Load Saved Game (Coming Soon)
            </Button>
          </div>

          <div className="text-center text-xs text-purple-400 pt-4 border-t border-purple-700">
            <p>Inspired by the Wings of Fire series by Tui T. Sutherland</p>
            <p className="mt-1">⚠️ Warning: Contains themes of moral corruption and difficult choices</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

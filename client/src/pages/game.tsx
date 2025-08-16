import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Character, GameData, GameState, Choice } from "@shared/schema";
import { GameEngine } from "@/lib/game-engine";
import CharacterPanel from "@/components/character-panel";
import GameplayArea from "@/components/gameplay-area";
import MagicModal from "@/components/magic-modal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Save, Settings } from "lucide-react";

export default function Game() {
  const { gameId } = useParams();
  const { toast } = useToast();
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [aiControlMessage, setAiControlMessage] = useState<string | null>(null);

  const { data: gameState, isLoading } = useQuery({
    queryKey: ["/api/game", gameId],
    enabled: !!gameId,
  });

  const updateGameMutation = useMutation({
    mutationFn: async (updates: { characterData: Character; gameData: GameData; turn: number; location: string }) => {
      const response = await apiRequest("PATCH", `/api/game/${gameId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game", gameId] });
    },
  });

  useEffect(() => {
    if (gameState?.characterData) {
      const corruptionLevel = GameEngine.getCorruptionLevel(gameState.characterData.soulPercentage);
      if (corruptionLevel === 'corrupted' || corruptionLevel === 'lost') {
        setAiControlMessage(GameEngine.getCorruptionMessage(corruptionLevel));
      } else {
        setAiControlMessage(null);
      }
    }
  }, [gameState]);

  const handleChoice = (choice: Choice) => {
    if (!gameState) return;

    const character = gameState.characterData as Character;
    const gameData = gameState.gameData as GameData;

    // Check if AI should intervene
    const aiChoice = GameEngine.getAIChoice(character, gameData.currentScenario);
    const actualChoice = aiChoice || choice;

    if (aiChoice) {
      toast({
        title: "Corruption Takes Control",
        description: "Your corrupted soul compels you to make a darker choice...",
        variant: "destructive",
      });
    }

    const { newCharacter, newGameData } = GameEngine.processChoice(
      character,
      gameData,
      actualChoice,
      gameData.currentScenario
    );

    updateGameMutation.mutate({
      characterData: newCharacter,
      gameData: newGameData,
      turn: newGameData.turn,
      location: newGameData.location,
    });
  };

  const handleSave = () => {
    toast({
      title: "Game Saved",
      description: "Your progress has been automatically saved.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dragon-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐉</div>
          <p className="text-slate-300 font-narrative text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-dragon-gradient flex items-center justify-center">
        <div className="text-center text-slate-300">
          <h2 className="text-2xl font-fantasy mb-4">Game Not Found</h2>
          <p>The requested game could not be loaded.</p>
        </div>
      </div>
    );
  }

  const character = gameState.characterData as Character;
  const gameData = gameState.gameData as GameData;

  return (
    <div className="min-h-screen bg-dragon-gradient text-slate-100">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-fantasy text-3xl font-bold text-purple-300">
              <span className="mr-3">🐉</span>
              Animus: Wings of Fire RPG
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-purple-300 hover:bg-purple-500/20"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:bg-purple-500/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Corruption Warning */}
      {aiControlMessage && (
        <div className="bg-red-900/90 border-b border-red-500 p-4">
          <div className="container mx-auto">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-300 mb-1">Soul Corruption Warning</h4>
                <p className="text-sm text-red-200">{aiControlMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          <CharacterPanel character={character} />
          <GameplayArea
            character={character}
            gameData={gameData}
            onChoice={handleChoice}
            onShowMagic={() => setShowMagicModal(true)}
            isProcessing={updateGameMutation.isPending}
          />
        </div>
      </div>

      <MagicModal
        isOpen={showMagicModal}
        onClose={() => setShowMagicModal(false)}
        character={character}
      />
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCharacter } from "@/lib/character-generator";
import { generateScenario, generateTimeInfo } from "@/lib/scenario-generator-final";
import { Character, GameData, InsertGameState } from "@shared/schema";
import CharacterCreator from "@/components/character-creator";
import { User, Sparkles, GamepadIcon, Save } from "lucide-react";
import { useLocalGameState } from "@/hooks/use-local-game-state";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const { createGame, getAllGames, loadGame } = useLocalGameState();

  const handleNewGame = () => {
    setIsCreating(true);
    
    const character = generateCharacter();
    createGameWithCharacter(character);
  };

  const createGameWithCharacter = (character: Character) => {
    const gameData: GameData = {
      turn: 1,
      location: "Jade Mountain Academy",
      timeInfo: generateTimeInfo(),
      currentScenario: generateScenario(character, {} as GameData),
      history: [],
      relationships: {},
      inventory: [],
      reputation: 0,
      politicalEvents: [],
      warStatus: { isAtWar: false, warringTribes: [], warCause: "", playerInvolvement: "neutral" },
      explorationLog: []
    };

    const gameState: InsertGameState = {
      userId: null,
      characterData: character,
      gameData: gameData,
      turn: 1,
      location: gameData.location
    };

    try {
      const newGame = createGame(gameState);
      setLocation(`/game/${newGame.id}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    }
  };

  const handleCustomCharacter = (character: Character) => {
    setShowCharacterCreator(false);
    setIsCreating(true);
    createGameWithCharacter(character);
  };

  const handleLoadGame = (gameId: string) => {
    loadGame(gameId);
    setLocation(`/game/${gameId}`);
  };

  const savedGames = getAllGames();

  if (showCharacterCreator) {
    return (
      <CharacterCreator 
        onCreateCharacter={handleCustomCharacter}
        onCancel={() => setShowCharacterCreator(false)}
      />
    );
  }

  if (isCreating) {
    return (
      <div className="min-h-screen bg-dragon-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐉</div>
          <p className="text-slate-300 font-narrative text-lg">Creating your dragon adventure...</p>
        </div>
      </div>
    );
  }

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
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin mr-2">⚡</div>
                  Generating Your Dragon...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Quick Start (Random Dragon)
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
              onClick={() => setShowCharacterCreator(true)}
              disabled={isCreating}
            >
              <User className="w-5 h-5 mr-2" />
              Create Custom Dragon
            </Button>

            {savedGames.length > 0 && (
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-green-400/50 text-green-300 hover:bg-green-500/10"
                onClick={() => setShowLoadMenu(true)}
                disabled={isCreating}
              >
                <Save className="w-5 h-5 mr-2" />
                Load Saved Game ({savedGames.length})
              </Button>
            )}
          </div>

          <div className="text-center text-xs text-purple-400 pt-4 border-t border-purple-700">
            <p>Inspired by the Wings of Fire series by Tui T. Sutherland</p>
            <p className="mt-1">⚠️ Warning: Contains themes of moral corruption and difficult choices</p>
          </div>
        </CardContent>
      </Card>

      {/* Load Game Modal */}
      {showLoadMenu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-black/90 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-purple-300">Load Saved Game</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30 cursor-pointer hover:bg-purple-800/40 transition-colors"
                    onClick={() => {
                      handleLoadGame(game.id);
                      setShowLoadMenu(false);
                    }}
                  >
                    <div className="font-semibold text-purple-200">
                      {game.characterData.name} the {game.characterData.tribe}
                    </div>
                    <div className="text-xs text-purple-400">
                      Turn {game.turn} • {game.location}
                    </div>
                    <div className="text-xs text-purple-500">
                      Soul: {game.characterData.soulPercentage}% • 
                      Stage: {game.characterData.soulCorruptionStage}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLoadMenu(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

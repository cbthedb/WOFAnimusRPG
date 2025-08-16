import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Character, GameData, Choice, CustomSpell, InventoryItem } from "@shared/schema";
import { EnhancedGameEngine } from "@/lib/enhanced-game-engine";
import CharacterPanel from "@/components/character-panel";
import GameplayArea from "@/components/gameplay-area";
import MagicModal from "@/components/magic-modal";
import TribalPowersModal from "@/components/tribal-powers-modal";
import SpecialPowerModal from "@/components/special-power-modal";
import CustomActionModal from "@/components/custom-action-modal";
import ConversationModal from "@/components/conversation-modal";
import { MockAIService } from "@/lib/mock-ai-service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Save, Home, Skull, Eye } from "lucide-react";
import { useLocalGameState } from "@/hooks/use-local-game-state";
import { LocalGameStorage } from "@/lib/local-storage";

export default function Game() {
  const { gameId } = useParams();
  const { toast } = useToast();
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [showTribalPowersModal, setShowTribalPowersModal] = useState(false);
  const [showSpecialPowerModal, setShowSpecialPowerModal] = useState(false);
  const [showCustomActionModal, setShowCustomActionModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [specialPowerType, setSpecialPowerType] = useState<'prophecy' | 'mindreading' | 'future' | null>(null);
  const [conversationData, setConversationData] = useState<{topic: string, otherDragon: string} | null>(null);
  const [aiControlMessage, setAiControlMessage] = useState<string | null>(null);
  const [gameOverState, setGameOverState] = useState<{ isGameOver: boolean; reason?: string; allowContinue?: boolean } | null>(null);
  const [gameState, setGameState] = useState<{ characterData: Character; gameData: GameData } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { updateGame } = useLocalGameState();

  useEffect(() => {
    if (gameId) {
      const loadedGame = LocalGameStorage.getGameState(gameId);
      if (loadedGame) {
        setGameState({
          characterData: loadedGame.characterData,
          gameData: loadedGame.gameData
        });
      }
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (gameState?.characterData) {
      const character = gameState.characterData;
      const stage = character.soulCorruptionStage;
      
      if (stage !== 'Normal') {
        setAiControlMessage(EnhancedGameEngine.getCorruptionMessage(stage));
      } else {
        setAiControlMessage(null);
      }

      // Check for game over conditions - but allow continuation for corrupted souls
      const gameOverCheck = EnhancedGameEngine.checkGameOver(character);
      if (gameOverCheck.isGameOver) {
        const allowContinue = character.soulPercentage <= 0; // Allow AI takeover for corrupted souls
        setGameOverState({ ...gameOverCheck, allowContinue });
      } else {
        setGameOverState(null);
      }
    }
  }, [gameState]);

  const handleCastSpell = (spell: CustomSpell) => {
    if (!gameState || !gameId || gameOverState?.isGameOver) return;

    const character = gameState.characterData;
    const gameData = gameState.gameData;

    // Check if character has enough soul
    if (character.soulPercentage < spell.estimatedSoulCost) {
      toast({
        title: "Insufficient Soul",
        description: "You don't have enough soul remaining to cast this spell.",
        variant: "destructive",
      });
      return;
    }

    // Apply soul cost
    const newCharacter = { ...character };
    newCharacter.soulPercentage = Math.max(0, character.soulPercentage - spell.estimatedSoulCost);
    newCharacter.soulCorruptionStage = {
      "Normal": character.soulPercentage >= 75 ? "Normal" : character.soulPercentage >= 50 ? "Frayed" : character.soulPercentage >= 25 ? "Twisted" : "Broken",
      "Frayed": character.soulPercentage >= 50 ? "Frayed" : character.soulPercentage >= 25 ? "Twisted" : "Broken",
      "Twisted": character.soulPercentage >= 25 ? "Twisted" : "Broken",
      "Broken": "Broken"
    }[character.soulCorruptionStage] as any;

    // Create enchanted item and add to inventory
    const newItem: InventoryItem = {
      id: `item_${Date.now()}`,
      name: `Enchanted ${spell.targetObject}`,
      description: spell.enchantmentDescription,
      type: "enchanted_object",
      enchantments: [spell.enchantmentDescription],
      soulCostToCreate: spell.estimatedSoulCost,
      turnCreated: gameData.turn,
      isActive: true
    };

    const newGameData = { ...gameData };
    newGameData.inventory.push(newItem);

    try {
      const updatedGame = updateGame(gameId, {
        characterData: newCharacter,
        gameData: newGameData,
        turn: newGameData.turn,
        location: newGameData.location,
      });
      
      setGameState({
        characterData: updatedGame.characterData,
        gameData: updatedGame.gameData
      });

      toast({
        title: "Spell Cast Successfully!",
        description: `You enchanted ${spell.targetObject}. Soul cost: ${spell.estimatedSoulCost}%`,
      });

      setShowMagicModal(false);
    } catch (error) {
      toast({
        title: "Spell Failed",
        description: "Something went wrong casting your spell.",
        variant: "destructive",
      });
    }
  };

  const handleChoice = (choice: Choice) => {
    if (!gameState || !gameId || gameOverState?.isGameOver) return;

    const character = gameState.characterData;
    const gameData = gameState.gameData;

    // Check if AI should intervene
    const aiChoice = EnhancedGameEngine.getAIChoice(character, gameData.currentScenario);
    const actualChoice = aiChoice || choice;

    if (aiChoice) {
      toast({
        title: "Corruption Takes Control",
        description: "Your corrupted soul compels you to make a darker choice...",
        variant: "destructive",
      });
    }

    const { newCharacter, newGameData } = EnhancedGameEngine.processChoice(
      character,
      gameData,
      actualChoice,
      gameData.currentScenario
    );

    try {
      const updatedGame = updateGame(gameId, {
        characterData: newCharacter,
        gameData: newGameData,
        turn: newGameData.turn,
        location: newGameData.location,
      });
      
      setGameState({
        characterData: updatedGame.characterData,
        gameData: updatedGame.gameData
      });

      toast({
        title: "Choice Made",
        description: "Your decision shapes your destiny...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your choice. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleUsePower = (power: string, scenario?: string) => {
    if (!gameState || !gameId) return;

    // Generate AI description for the power usage
    const aiResponse = MockAIService.generateRandomEvent(
      gameState.characterData, 
      { turn: gameState.gameData.turn, power, scenario }
    );

    toast({
      title: "Power Used", 
      description: scenario ? `${scenario} - ${aiResponse.content.slice(0, 100)}...` : `You use your ${power} ability!`,
    });
    setShowTribalPowersModal(false);
  };

  const handleSpecialPower = (powerType: 'prophecy' | 'mindreading' | 'future') => {
    setSpecialPowerType(powerType);
    setShowSpecialPowerModal(true);
  };

  const handleSpecialPowerUse = (power: string, result: string) => {
    if (!gameState || !gameId) return;

    // Special powers cost soul energy like animus magic
    const soulCost = specialPowerType === 'future' ? 5 : specialPowerType === 'mindreading' ? 3 : 2;
    const newCharacter = { ...gameState.characterData };
    newCharacter.soulPercentage = Math.max(0, newCharacter.soulPercentage - soulCost);
    newCharacter.soulCorruptionStage = EnhancedGameEngine.getCorruptionLevel(newCharacter.soulPercentage);

    try {
      const updatedGame = updateGame(gameId, {
        characterData: newCharacter,
        gameData: gameState.gameData,
        turn: gameState.gameData.turn,
        location: gameState.gameData.location,
      });
      
      setGameState({
        characterData: updatedGame.characterData,
        gameData: updatedGame.gameData
      });

      toast({
        title: power,
        description: result.slice(0, 150) + "...",
      });
    } catch (error) {
      toast({
        title: "Vision Failed",
        description: "The mystical energies resist your attempt.",
        variant: "destructive",
      });
    }
    
    setShowSpecialPowerModal(false);
  };

  const handleCustomAction = (action: string, result: string, itemUsed?: InventoryItem) => {
    if (!gameState || !gameId) return;

    // Custom actions can trigger conversations or scenarios
    if (result.toLowerCase().includes('conversation') || result.toLowerCase().includes('talk') || result.toLowerCase().includes('speak')) {
      const dragonName = extractDragonName(result) || "Unknown Dragon";
      setConversationData({ topic: action, otherDragon: dragonName });
      setShowConversationModal(true);
    } else {
      toast({
        title: "Custom Action",
        description: `${action} - ${result.slice(0, 100)}...`,
      });
    }
    
    setShowCustomActionModal(false);
  };

  const handleConversationEnd = (outcome: string, relationship: string) => {
    toast({
      title: "Conversation Ended",
      description: `${outcome} - Relationship: ${relationship}`,
    });
    setShowConversationModal(false);
    setConversationData(null);
  };

  const extractDragonName = (text: string): string | null => {
    const patterns = [
      /talks? (?:to|with) ([A-Z][a-z]+)/i,
      /speaks? (?:to|with) ([A-Z][a-z]+)/i,
      /approaches? ([A-Z][a-z]+)/i,
      /meets? ([A-Z][a-z]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const continueAsCorrupted = () => {
    if (!gameState || !gameId) return;
    
    // Mark character as AI controlled and continue
    const newCharacter = { ...gameState.characterData };
    newCharacter.isAIControlled = true;
    
    try {
      const updatedGame = updateGame(gameId, {
        characterData: newCharacter,
        gameData: gameState.gameData,
        turn: gameState.gameData.turn,
        location: gameState.gameData.location,
      });
      
      setGameState({
        characterData: updatedGame.characterData,
        gameData: updatedGame.gameData
      });
      
      setGameOverState(null);
      
      toast({
        title: "Soul Lost",
        description: "The darkness takes control. Watch as your corrupted dragon wreaks havoc...",
        variant: "destructive"
      });
    } catch (error) {
      console.error("Failed to continue as corrupted:", error);
    }
  };

  const handleUseInventoryItem = (item: InventoryItem) => {
    if (!gameState || !gameId) return;

    // Generate AI description for the item usage
    const itemDescription = MockAIService.generateObjectDescription(item.name, { 
      turn: gameState.gameData.turn,
      enchantments: item.enchantments 
    });

    toast({
      title: "Item Used",
      description: `${item.name}: ${itemDescription.content}`,
    });
  };

  const handleSaveGame = () => {
    toast({
      title: "Game Saved",
      description: "Your progress is automatically saved to your browser.",
    });
  };

  const handleBackHome = () => {
    window.location.href = '/';
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
          <p className="mb-4">The requested game could not be loaded.</p>
          <Button onClick={handleBackHome} className="bg-purple-600 hover:bg-purple-700">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const character = gameState.characterData;
  const gameData = gameState.gameData;

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
                onClick={handleSaveGame}
                className="text-purple-300 hover:bg-purple-500/20"
                data-testid="button-save-game"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackHome}
                className="text-purple-300 hover:bg-purple-500/20"
                data-testid="button-back-home"
              >
                <Home className="w-4 h-4" />
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
          <CharacterPanel 
            character={character} 
            inventory={gameData?.inventory || []}
            onShowTribalPowers={() => setShowTribalPowersModal(true)}
            onUseInventoryItem={handleUseInventoryItem}
          />
          <GameplayArea
            character={character}
            gameData={gameData}
            onChoice={handleChoice}
            onShowMagic={() => setShowMagicModal(true)}
            onShowSpecialPower={handleSpecialPower}
            onShowTribalPowers={() => setShowTribalPowersModal(true)}
            onCustomAction={() => setShowCustomActionModal(true)}
            isProcessing={false}
          />
        </div>
      </div>

      <MagicModal
        isOpen={showMagicModal}
        onClose={() => setShowMagicModal(false)}
        character={character}
        inventory={gameData?.inventory || []}
        onCastSpell={handleCastSpell}
      />

      <TribalPowersModal
        character={character}
        isOpen={showTribalPowersModal}
        onClose={() => setShowTribalPowersModal(false)}
        onUsePower={handleUsePower}
      />

      <SpecialPowerModal
        character={character}
        powerType={specialPowerType}
        isOpen={showSpecialPowerModal}
        onClose={() => setShowSpecialPowerModal(false)}
        onUsePower={handleSpecialPowerUse}
      />

      <CustomActionModal
        character={character}
        gameData={gameData}
        inventory={gameData?.inventory || []}
        isOpen={showCustomActionModal}
        onClose={() => setShowCustomActionModal(false)}
        onExecuteAction={handleCustomAction}
      />

      {conversationData && (
        <ConversationModal
          character={character}
          conversationTopic={conversationData.topic}
          otherDragon={conversationData.otherDragon}
          isOpen={showConversationModal}
          onClose={() => setShowConversationModal(false)}
          onConversationEnd={handleConversationEnd}
        />
      )}

      {/* Enhanced Game Over Modal */}
      {gameOverState?.isGameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-purple-900/90 border border-purple-500 rounded-lg p-8 max-w-md mx-4 text-center">
            {gameOverState.allowContinue ? (
              <>
                <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center justify-center">
                  <Skull className="w-6 h-6 mr-2" />
                  Soul Corrupted
                </h2>
                <p className="text-red-200 mb-6">
                  Your soul has been completely consumed by darkness. The animus magic has taken control of your mind and body.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={continueAsCorrupted}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Watch AI Control Your Corrupted Dragon
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    variant="outline"
                    className="w-full"
                  >
                    Return Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Restart Game
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-400 mb-4">Game Over</h2>
                <p className="text-purple-200 mb-6">{gameOverState.reason}</p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Return Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Restart Game
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [aiInterval, setAiInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameOverState, setGameOverState] = useState<{ isGameOver: boolean; reason?: string; allowContinue?: boolean } | null>(null);
  const [gameState, setGameState] = useState<{ characterData: Character; gameData: GameData } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [corruptionWhisper, setCorruptionWhisper] = useState<string | null>(null);
  const [showCorruptionPopup, setShowCorruptionPopup] = useState(false);

  const { updateGame } = useLocalGameState();

  const generateCorruptionWhisper = (character: Character) => {
    try {
      const whisper = EnhancedGameEngine.generateCorruptionWhisper(character);
      setCorruptionWhisper(whisper);
      setShowCorruptionPopup(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowCorruptionPopup(false);
        setCorruptionWhisper(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to generate corruption whisper:", error);
    }
  };

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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (aiInterval) {
        clearInterval(aiInterval);
      }
    };
  }, [aiInterval]);

  useEffect(() => {
    if (gameState?.characterData) {
      const character = gameState.characterData;
      const stage = character.soulCorruptionStage;
      
      if (stage !== 'Normal') {
        setAiControlMessage(EnhancedGameEngine.getCorruptionMessage(stage));
      } else {
        setAiControlMessage(null);
        // Stop AI control if character is no longer corrupted
        if (aiInterval) {
          clearInterval(aiInterval);
          setAiInterval(null);
        }
      }

      // Show corruption whispers for souls below 15%
      if (EnhancedGameEngine.shouldShowCorruptionPopup(character)) {
        if (Math.random() < 0.3) { // 30% chance per turn
          generateCorruptionWhisper(character);
        }
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
  }, [gameState, aiInterval]);

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

    const { characterData: character, gameData } = gameState;
    let newCharacter = { ...character };

    // Apply power usage costs and effects
    const sanityCost = Math.floor(Math.random() * 5) + 2;
    newCharacter.sanityPercentage = Math.max(0, newCharacter.sanityPercentage - sanityCost);

    // Generate AI description for the power usage with current scenario context
    const powerContext = {
      turn: gameData.turn,
      power,
      scenario: scenario || gameData.currentScenario.description,
      currentSituation: gameData.currentScenario.narrativeText.join(' ')
    };
    
    const aiResponse = MockAIService.generateRandomEvent(character, powerContext);
    const result = scenario ? `${scenario} - ${aiResponse.content}` : aiResponse.content;

    // Process the power use as a choice to advance the storyline
    const { newCharacter: updatedCharacter, newGameData } = EnhancedGameEngine.processChoice(
      newCharacter,
      gameData,
      {
        id: `tribal_power_${Date.now()}`,
        text: `Use ${power}`,
        description: result,
        soulCost: 0,
        sanityCost: sanityCost,
        consequences: [result]
      },
      gameData.currentScenario
    );

    try {
      const updatedGame = updateGame(gameId, {
        characterData: updatedCharacter,
        gameData: newGameData,
        turn: newGameData.turn,
        location: newGameData.location,
      });
      
      setGameState({
        characterData: updatedGame.characterData,
        gameData: updatedGame.gameData
      });

      toast({
        title: "Power Used",
        description: result.slice(0, 150) + "...",
      });
    } catch (error) {
      toast({
        title: "Power Failed",
        description: "Your power usage had unexpected results.",
        variant: "destructive",
      });
    }
    
    setShowTribalPowersModal(false);
  };

  const handleSpecialPower = (powerType: 'prophecy' | 'mindreading' | 'future') => {
    setSpecialPowerType(powerType);
    setShowSpecialPowerModal(true);
  };

  const handleSpecialPowerUse = (power: string, result: string) => {
    if (!gameState || !gameId) return;

    // Special powers cost sanity for non-animus, soul energy for animus
    const { characterData: character, gameData } = gameState;
    const newCharacter = { ...character };
    
    if (character.isAnimus) {
      const soulCost = specialPowerType === 'future' ? 5 : specialPowerType === 'mindreading' ? 3 : 2;
      newCharacter.soulPercentage = Math.max(0, newCharacter.soulPercentage - soulCost);
      newCharacter.soulCorruptionStage = EnhancedGameEngine.getCorruptionLevel(newCharacter.soulPercentage);
    } else {
      const sanityCost = specialPowerType === 'future' ? 8 : specialPowerType === 'mindreading' ? 5 : 3;
      newCharacter.sanityPercentage = Math.max(0, newCharacter.sanityPercentage - sanityCost);
    }

    // Generate a new scenario based on the power use result
    const { newCharacter: updatedCharacter, newGameData } = EnhancedGameEngine.processChoice(
      newCharacter,
      gameData,
      {
        id: `power_${specialPowerType}`,
        text: `Use ${power}`,
        description: result,
        soulCost: 0,
        sanityCost: 0,
        consequences: [result]
      },
      gameData.currentScenario
    );

    try {
      const updatedGame = updateGame(gameId, {
        characterData: updatedCharacter,
        gameData: newGameData,
        turn: newGameData.turn,
        location: newGameData.location,
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

    const { characterData: character, gameData } = gameState;
    let newCharacter = { ...character };

    // Handle enchanted item usage with storyline progression
    if (itemUsed && itemUsed.enchantments.length > 0) {
      // Apply enchantment effects based on the description
      const enchantment = itemUsed.enchantments[0];
      
      // Check for major enchantments that should trigger story events
      if (enchantment.toLowerCase().includes('darkstalker') || 
          enchantment.toLowerCase().includes('resurrection') ||
          enchantment.toLowerCase().includes('immortal') ||
          enchantment.toLowerCase().includes('time') ||
          enchantment.toLowerCase().includes('reality')) {
        
        // Major enchantments cost soul for animus dragons
        if (character.isAnimus) {
          newCharacter.soulPercentage = Math.max(0, newCharacter.soulPercentage - 15);
          newCharacter.soulCorruptionStage = EnhancedGameEngine.getCorruptionLevel(newCharacter.soulPercentage);
        }
      }
    }

    // Process the action as a choice to advance the storyline
    const { newCharacter: updatedCharacter, newGameData } = EnhancedGameEngine.processChoice(
      newCharacter,
      gameData,
      {
        id: `custom_${Date.now()}`,
        text: action,
        description: result,
        soulCost: 0,
        sanityCost: Math.floor(Math.random() * 3),
        consequences: [result]
      },
      gameData.currentScenario
    );

    // Check if action triggers conversation
    if (result.toLowerCase().includes('conversation') || result.toLowerCase().includes('talk') || result.toLowerCase().includes('speak')) {
      const dragonName = extractDragonName(result) || "Unknown Dragon";
      setConversationData({ topic: action, otherDragon: dragonName });
      setShowConversationModal(true);
    }

    try {
      const updatedGame = updateGame(gameId, {
        characterData: updatedCharacter,
        gameData: newGameData,
        turn: newGameData.turn,
        location: newGameData.location,
      });
      
      setGameState({
        characterData: updatedGame.characterData,
        gameData: updatedGame.gameData
      });

      toast({
        title: "Action Completed",
        description: `${action} - ${result.slice(0, 100)}...`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Something went wrong. Try again.",
        variant: "destructive",
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

      // Start AI control sequence after a brief delay
      setTimeout(() => {
        startAIControlSequence();
      }, 1000);
    } catch (error) {
      console.error("Failed to continue as corrupted:", error);
    }
  };

  const startAIControlSequence = () => {
    if (!gameId) return;

    // Show AI taking control message
    setAiControlMessage("The AI has taken control of your corrupted dragon. Evil choices are being made automatically...");

    // Clear any existing interval
    if (aiInterval) {
      clearInterval(aiInterval);
    }

    // Set up interval for AI to make choices automatically
    const newInterval = setInterval(() => {
      // Get fresh game state each time
      const currentGameState = LocalGameStorage.getGameState(gameId);
      if (!currentGameState?.characterData?.isAIControlled) {
        clearInterval(newInterval);
        setAiInterval(null);
        return;
      }

      const currentScenario = currentGameState.gameData.currentScenario;
      if (!currentScenario || !currentScenario.choices || currentScenario.choices.length === 0) return;

      // Use the enhanced game engine's AI choice logic
      const aiChoice = EnhancedGameEngine.getAIChoice(currentGameState.characterData, currentScenario);
      const choiceToMake = aiChoice || currentScenario.choices[Math.floor(Math.random() * currentScenario.choices.length)];

      console.log("AI making choice:", choiceToMake.text);
      
      toast({
        title: "AI Choice Made",
        description: `Your corrupted dragon chose: ${choiceToMake.text}`,
        variant: "destructive"
      });
      
      // Make the choice immediately
      handleChoice(choiceToMake);

    }, 4000); // AI makes a choice every 4 seconds

    setAiInterval(newInterval);
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

      {/* Corruption Whisper Popup */}
      {showCorruptionPopup && corruptionWhisper && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-pulse">
          <div className="bg-black/90 border border-red-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👁️</span>
              <div>
                <h4 className="font-semibold text-red-300 mb-2">Dark Whisper</h4>
                <p className="text-sm text-red-200 italic">{corruptionWhisper}</p>
              </div>
              <button 
                onClick={() => setShowCorruptionPopup(false)}
                className="text-red-300 hover:text-red-100 text-lg"
              >
                ×
              </button>
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
            isProcessing={character.isAIControlled}
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
        currentScenario={gameData.currentScenario.description}
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

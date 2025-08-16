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
  const [aiActionInProgress, setAiActionInProgress] = useState<string | null>(null);
  const [gameOverState, setGameOverState] = useState<{ isGameOver: boolean; reason?: string; allowContinue?: boolean } | null>(null);
  const [hasChosenCorruption, setHasChosenCorruption] = useState(false);
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
      if (gameOverCheck.isGameOver && !character.isAIControlled && !gameOverState && !hasChosenCorruption) {
        const allowContinue = character.soulPercentage <= 0; // Allow AI takeover for corrupted souls
        setGameOverState({ ...gameOverCheck, allowContinue });
      } else if (!gameOverCheck.isGameOver || character.isAIControlled) {
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

  const handleTribalPower = (power: string, corruptedUse: string) => {
    if (!gameState || !gameId) return;

    const character = gameState.characterData;
    const gameData = gameState.gameData;

    // Apply consequences of using tribal power corruptly
    const newCharacter = { ...character };
    newCharacter.soulPercentage = Math.max(0, character.soulPercentage - 5); // Using powers corruptly costs soul
    newCharacter.sanityPercentage = Math.max(0, character.sanityPercentage - 3);

    // Create a corrupted scenario result
    const result = `Using ${power}, ${corruptedUse}. The dark deed leaves a stain on your soul.`;

    const newGameData = EnhancedGameEngine.processCustomAction(
      character,
      gameData,
      {
        action: `Corrupt use of ${power}`,
        consequences: [result]
      },
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
    } catch (error) {
      console.error("Failed to handle tribal power:", error);
    }
  };

  const handleAISpecialPower = (power: string, corruptedUse: string) => {
    if (!gameState || !gameId) return;

    const character = gameState.characterData;
    const gameData = gameState.gameData;

    // Apply consequences of using special power corruptly
    const newCharacter = { ...character };
    newCharacter.soulPercentage = Math.max(0, character.soulPercentage - 8); // Special powers cost more
    newCharacter.sanityPercentage = Math.max(0, character.sanityPercentage - 5);

    // Create a corrupted scenario result
    const result = `Corrupting special power "${power}": ${corruptedUse}. The perversion of your gift darkens your essence.`;

    const newGameData = EnhancedGameEngine.processCustomAction(
      character,
      gameData,
      {
        action: `Corrupt use of special power: ${power}`,
        consequences: [result]
      },
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
    } catch (error) {
      console.error("Failed to handle special power:", error);
    }
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
      setHasChosenCorruption(true);
      
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

  // Dark enchantments from user's provided list
  const DARK_ENCHANTMENTS = [
    { object: "Dagger", effect: "Cause wounds to fester and never fully heal" },
    { object: "Mirror", effect: "Trap the reflection's soul, making it scream silently" },
    { object: "Necklace", effect: "Whisper dark thoughts into the wearer's mind at night" },
    { object: "Ring", effect: "Slowly drain the wearer's luck, making misfortune unavoidable" },
    { object: "Candle", effect: "Burn with flames that induce fear and hallucinations" },
    { object: "Book", effect: "Rewrite its own pages to reveal forbidden knowledge whenever opened" },
    { object: "Armor", effect: "Slowly corrupt the wearer's body, making them feel endless fatigue" },
    { object: "Coin", effect: "Curse anyone who touches it to attract betrayal from friends" },
    { object: "Key", effect: "Lock doors permanently and summon shadows when used" },
    { object: "Cloak", effect: "Conceal the wearer but slowly warp their mind into paranoia" },
    { object: "Potion vial", effect: "Turn any drink poured inside into a poison that induces rage" },
    { object: "Quill", effect: "Write words that compel the reader to obey dark commands" },
    { object: "Bell", effect: "Ring on its own to call nightmares into the surrounding area" },
    { object: "Staff", effect: "Summon illusions of fallen enemies to terrify allies" },
    { object: "Shoes", effect: "Make the wearer walk endlessly in circles at night" },
    { object: "Gemstone", effect: "Absorb the life force of anyone who gazes into it" },
    { object: "Mask", effect: "Force the wearer to mimic the voices of others, sowing confusion" },
    { object: "Scroll", effect: "Spread a curse on anyone who reads it aloud" },
    { object: "Cup", effect: "Turn any drink into a hallucinogenic draught of despair" },
    { object: "Chain", effect: "Bind its victim's luck and movement, making escape impossible" },
    { object: "Amulet", effect: "Slowly twist the wearer's emotions into uncontrollable anger" },
    { object: "Blade", effect: "Infect any wound with pain that never fully fades" },
    { object: "Lantern", effect: "Illuminate only the fear within people, showing them their worst dread" },
    { object: "Boots", effect: "Force the wearer to stumble into danger whenever they try to run" },
    { object: "Cage", effect: "Trap a creature inside permanently if it is filled with darkness" },
    { object: "Chalice", effect: "Slowly drain the vitality of anyone who drinks from it" }
  ];

  const EVIL_CUSTOM_ACTIONS = [
    "Whisper lies about their closest friend to turn them against each other",
    "Steal something precious and hide it where they'll never find it",
    "Spread false rumors about someone's deepest shame",
    "Break something they treasure when they're not looking",
    "Tell their enemy exactly where to find them alone",
    "Poison their food with something that causes nightmares",
    "Leave threatening messages in their personal belongings",
    "Convince their loved ones that they've betrayed them",
    "Destroy evidence that would prove their innocence",
    "Lead dangerous creatures to their sleeping place",
    "Forge documents that make them look guilty of crimes",
    "Manipulate their memories to make them doubt themselves",
    "Sabotage their most important relationships with calculated cruelty",
    "Use their fears against them to break their spirit",
    "Turn their own allies into enemies through deception"
  ];

  const startAIControlSequence = () => {
    if (!gameId) return;

    // Show AI taking control message
    setAiControlMessage("🔴 AI CORRUPTION ACTIVE - Your dragon acts autonomously with dark intent. Watch as evil unfolds...");

    // Clear any existing interval
    if (aiInterval) {
      clearInterval(aiInterval);
    }

    // Set up interval for AI to perform actions automatically
    const newInterval = setInterval(async () => {
      // Get fresh game state each time
      const currentGameState = LocalGameStorage.getGameState(gameId);
      if (!currentGameState?.characterData?.isAIControlled) {
        clearInterval(newInterval);
        setAiInterval(null);
        return;
      }

      console.log("🔥 AI TAKING CONTROL - Opening UI and performing dark actions...");

      // Determine what type of evil action the AI will take
      const actionTypes = ['magic', 'custom_action', 'choice'];
      const weights = [0.4, 0.4, 0.2]; // Favor magic and custom actions over regular choices
      
      const getWeightedRandomChoice = (items: string[], weights: number[]) => {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let randomWeight = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
          randomWeight -= weights[i];
          if (randomWeight <= 0) {
            return items[i];
          }
        }
        return items[0];
      };

      const actionType = getWeightedRandomChoice(actionTypes, weights);

      // AI opens the appropriate modal and performs the action
      switch (actionType) {
        case 'magic':
          if (currentGameState.characterData.isAnimus) {
            // AI opens magic modal and casts a dark spell
            setShowMagicModal(true);
            
            toast({
              title: "💀 CORRUPTED MAGIC AWAKENS",
              description: "Your dragon's claws move on their own, opening the animus magic interface...",
              duration: 3000,
              variant: "destructive"
            });

            // Wait 2 seconds, then AI fills out the form
            setTimeout(() => {
              const darkSpell = DARK_ENCHANTMENTS[Math.floor(Math.random() * DARK_ENCHANTMENTS.length)];
              
              toast({
                title: "🔮 AI CASTS DARK ENCHANTMENT",
                description: `Your possessed claws enchant a ${darkSpell.object} to ${darkSpell.effect.toLowerCase()}...`,
                duration: 4000,
                variant: "destructive"
              });

              // Create the spell object
              const spell: CustomSpell = {
                id: `ai_spell_${Date.now()}`,
                targetObject: darkSpell.object,
                enchantmentDescription: darkSpell.effect,
                estimatedSoulCost: Math.floor(Math.random() * 15) + 10, // 10-25% soul cost
                spellType: "curse",
                complexity: "complex",
                turnCast: currentGameState.gameData.turn
              };

              // Actually cast the spell using the handler
              handleCastSpell(spell);
              
              // Close modal after casting
              setTimeout(() => {
                setShowMagicModal(false);
              }, 1000);

            }, 2000);
          }
          break;

        case 'custom_action':
          // AI opens custom action modal and performs evil deed
          setShowCustomActionModal(true);
          
          toast({
            title: "👹 MALEVOLENT INTENT SURFACES",
            description: "Your dragon's corruption compels it to perform a custom evil action...",
            duration: 3000,
            variant: "destructive"
          });

          // Wait 2 seconds, then AI fills out the action
          setTimeout(() => {
            const evilAction = EVIL_CUSTOM_ACTIONS[Math.floor(Math.random() * EVIL_CUSTOM_ACTIONS.length)];
            
            toast({
              title: "😈 AI PERFORMS EVIL DEED",
              description: `Your corrupted dragon: ${evilAction}`,
              duration: 4000,
              variant: "destructive"
            });

            // Execute the custom action using the handler
            handleCustomAction(evilAction, "The corrupted dragon revels in the suffering it causes, feeling a twisted satisfaction as darkness spreads.");
            
            // Close modal after action
            setTimeout(() => {
              setShowCustomActionModal(false);
            }, 1000);

          }, 2000);
          break;

        case 'choice':
        default:
          // AI makes a corrupted choice from available options
          const currentScenario = currentGameState.gameData.currentScenario;
          if (currentScenario && currentScenario.choices && currentScenario.choices.length > 0) {
            const aiChoice = EnhancedGameEngine.getAIChoice(currentGameState.characterData, currentScenario);
            const choiceToMake = aiChoice || currentScenario.choices[Math.floor(Math.random() * currentScenario.choices.length)];
            
            toast({
              title: "🔥 AI MAKES CORRUPTED CHOICE",
              description: `Your dragon chooses the path of darkness: "${choiceToMake.text}"`,
              duration: 4000,
              variant: "destructive"
            });

            // Process the choice using the handler
            handleChoice(choiceToMake);
          }
          break;
      }

      // Show additional corruption whisper
      setTimeout(() => {
        const whispers = [
          "Yes... let the darkness flow through you...",
          "Their screams will be music to your ears...",
          "Power is all that matters. Take what you want.",
          "Trust is weakness. Betrayal is strength.",
          "Why show mercy when cruelty is so much more... satisfying?",
          "The weak exist only to serve the strong.",
          "Pain teaches lessons that kindness never could.",
          "Compassion is a disease. Cure yourself of it."
        ];
        
        const whisper = whispers[Math.floor(Math.random() * whispers.length)];
        
        toast({
          title: "💭 SOUL CORRUPTION WHISPERS",
          description: `Dark thoughts echo: "${whisper}"`,
          duration: 3000,
          variant: "destructive"
        });
      }, 4000);

    }, 7000); // AI performs an action every 7 seconds

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
                {aiActionInProgress && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-transparent"></div>
                    <p className="text-xs text-red-300 italic">{aiActionInProgress}</p>
                  </div>
                )}
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

import { Character, GameData, Scenario, Choice, CustomSpell } from '@shared/schema';
import { EnhancedGameEngine } from './enhanced-game-engine';

export interface AIAction {
  type: 'choice' | 'magic' | 'custom_action' | 'tribal_power' | 'special_power';
  data: any;
  description: string;
}

export class EnhancedAIController {
  /**
   * Generate an AI action based on the current game state
   */
  static generateAIAction(character: Character, gameData: GameData): AIAction | null {
    console.log("AI Controller - checking conditions:", {
      isAIControlled: character.isAIControlled,
      soulPercentage: character.soulPercentage,
      shouldGenerate: character.isAIControlled && character.soulPercentage <= 0
    });
    
    // Only generate AI actions when soul is completely gone AND character is AI controlled
    if (!character.isAIControlled || character.soulPercentage > 0) {
      console.log("AI Controller - conditions not met, returning null");
      return null;
    }

    // AI becomes increasingly aggressive and creative as corruption deepens
    const actionTypes = ['choice', 'magic', 'custom_action', 'tribal_power', 'special_power'];
    const weights = [0.4, 0.25, 0.2, 0.1, 0.05]; // Choice is most common, but AI can use other actions
    
    const actionType = this.weightedRandomChoice(actionTypes, weights);
    
    switch (actionType) {
      case 'magic':
        return this.generateMagicAction(character, gameData);
      case 'custom_action':
        return this.generateCustomAction(character, gameData);
      case 'tribal_power':
        return this.generateTribalPowerAction(character, gameData);
      case 'special_power':
        return this.generateSpecialPowerAction(character, gameData);
      default:
        return this.generateChoiceAction(character, gameData);
    }
  }

  private static weightedRandomChoice<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    
    return items[0];
  }

  private static generateChoiceAction(character: Character, gameData: GameData): AIAction | null {
    const scenario = gameData.currentScenario;
    if (!scenario || !scenario.choices || scenario.choices.length === 0) return null;

    const aiChoice = EnhancedGameEngine.getAIChoice(character, scenario);
    if (!aiChoice) return null;

    return {
      type: 'choice',
      data: aiChoice,
      description: `Corrupted choice: "${aiChoice.text}"`
    };
  }

  private static generateMagicAction(character: Character, gameData: GameData): AIAction | null {
    if (!character.isAnimus) return null;

    const corruptedSpells = [
      {
        targetObject: "nearby dragon's mind",
        enchantmentDescription: "Forces them to obey my every command and worship me as their master",
        spellType: "curse" as const,
        complexity: "complex" as const,
        estimatedSoulCost: 15
      },
      {
        targetObject: "the ground beneath my enemies",
        enchantmentDescription: "Creates deadly spikes that pierce through anyone who dares oppose me",
        spellType: "combat" as const,
        complexity: "moderate" as const,
        estimatedSoulCost: 12
      },
      {
        targetObject: "the air around me",
        enchantmentDescription: "Becomes a toxic miasma that slowly poisons all who breathe it",
        spellType: "curse" as const,
        complexity: "complex" as const,
        estimatedSoulCost: 18
      },
      {
        targetObject: "my claws",
        enchantmentDescription: "Become eternally sharp and dripping with incurable venom",
        spellType: "enchantment" as const,
        complexity: "moderate" as const,
        estimatedSoulCost: 10
      },
      {
        targetObject: "the memories of my victims",
        enchantmentDescription: "Erases all trace of their happiness, leaving only fear and despair",
        spellType: "curse" as const,
        complexity: "complex" as const,
        estimatedSoulCost: 20
      },
      {
        targetObject: "the nearest water source",
        enchantmentDescription: "Turns to acid that burns through scales and melts bones",
        spellType: "curse" as const,
        complexity: "complex" as const,
        estimatedSoulCost: 16
      }
    ];

    const spell = corruptedSpells[Math.floor(Math.random() * corruptedSpells.length)];
    
    const customSpell: CustomSpell = {
      id: `ai_spell_${Date.now()}`,
      targetObject: spell.targetObject,
      enchantmentDescription: spell.enchantmentDescription,
      estimatedSoulCost: spell.estimatedSoulCost,
      spellType: spell.spellType,
      complexity: spell.complexity,
      turnCast: gameData.turn
    };

    return {
      type: 'magic',
      data: customSpell,
      description: `Casts dark magic on ${spell.targetObject}: ${spell.enchantmentDescription}`
    };
  }

  private static generateCustomAction(character: Character, gameData: GameData): AIAction | null {
    const corruptedActions = [
      "Silently approach a sleeping dragon and whisper dark prophecies into their dreams",
      "Use my claws to carve threatening messages into the walls where other dragons gather",
      "Steal precious belongings from fellow dragons and hide them to sow discord",
      "Spread malicious rumors about other dragons to turn them against each other",
      "Sabotage important tribal ceremonies by disrupting sacred objects",
      "Hunt down and torment smaller, weaker dragons for my own amusement",
      "Poison the minds of young dragonets with tales of hatred and revenge",
      "Desecrate ancient burial grounds to anger the spirits and cause chaos",
      "Form secret alliances with enemy tribes to betray my own kind",
      "Collect gruesome trophies from my victims to display my power",
      "Manipulate romantic relationships to cause maximum emotional pain",
      "Destroy important historical artifacts to erase cultural memory",
      "Practice forbidden rituals that summon dark entities from beyond",
      "Corrupt pure magical springs by adding my own tainted essence",
      "Orchestrate 'accidents' that appear natural but serve my dark purposes"
    ];

    const action = corruptedActions[Math.floor(Math.random() * corruptedActions.length)];

    return {
      type: 'custom_action',
      data: action,
      description: `Performs evil deed: ${action}`
    };
  }

  private static generateTribalPowerAction(character: Character, gameData: GameData): AIAction | null {
    if (!character.tribalPowers || character.tribalPowers.length === 0) return null;

    const corruptedUses = {
      "Fire Breathing": "Burns down peaceful settlements and destroys crops to cause famine",
      "Ice Breath": "Freezes water sources to deny other tribes access to clean water",
      "Venom": "Poisons communal food supplies to cause mass suffering",
      "Underwater Breathing": "Drowns enemies by dragging them to the depths",
      "Camouflage": "Becomes invisible to spy on private conversations and gather blackmail",
      "Silk Production": "Creates traps and snares to capture and torture victims",
      "Mind Reading": "Invades the privacy of others' thoughts to discover their deepest fears",
      "Precognition": "Uses future knowledge to manipulate events for maximum chaos",
      "Plant Control": "Turns peaceful gardens into thorny death traps",
      "Sand Manipulation": "Creates sandstorms to blind and disorient peaceful travelers"
    };

    const availablePowers = character.tribalPowers.filter(power => corruptedUses[power as keyof typeof corruptedUses]);
    if (availablePowers.length === 0) return null;

    const chosenPower = availablePowers[Math.floor(Math.random() * availablePowers.length)];
    const corruptedUse = corruptedUses[chosenPower as keyof typeof corruptedUses];

    return {
      type: 'tribal_power',
      data: { power: chosenPower, use: corruptedUse },
      description: `Uses ${chosenPower} corruptly: ${corruptedUse}`
    };
  }

  private static generateSpecialPowerAction(character: Character, gameData: GameData): AIAction | null {
    if (!character.specialPowers || character.specialPowers.length === 0) return null;

    const corruptedSpecialUses = [
      "Turns healing abilities into instruments of torture and prolonged suffering",
      "Uses telepathic powers to implant nightmares and traumatic memories",
      "Corrupts time manipulation to trap enemies in loops of eternal agony",
      "Perverts shape-shifting to impersonate loved ones and betray trust",
      "Weaponizes empathic abilities to amplify others' pain and despair",
      "Uses enhanced senses to hunt down hidden enemies with predatory precision",
      "Corrupts protective barriers to become cages that imprison the innocent"
    ];

    const use = corruptedSpecialUses[Math.floor(Math.random() * corruptedSpecialUses.length)];
    const power = character.specialPowers[Math.floor(Math.random() * character.specialPowers.length)];

    return {
      type: 'special_power',
      data: { power, use },
      description: `Corrupts special power "${power}": ${use}`
    };
  }

  /**
   * Generate a narrative description of what the AI is doing
   */
  static generateAINarrative(action: AIAction, character: Character): string {
    const namePrefix = `${character.name}, now fully consumed by darkness,`;
    
    switch (action.type) {
      case 'magic':
        return `${namePrefix} weaves dark animus magic with twisted glee. ${action.description}`;
      case 'custom_action':
        return `${namePrefix} prowls through the shadows with malicious intent. ${action.description}`;
      case 'tribal_power':
        return `${namePrefix} corrupts their natural tribal abilities for evil purposes. ${action.description}`;
      case 'special_power':
        return `${namePrefix} perverts their unique gifts to cause maximum suffering. ${action.description}`;
      default:
        return `${namePrefix} makes a choice driven by pure malice. ${action.description}`;
    }
  }

  /**
   * Get corruption whispers for AI actions
   */
  static getActionWhisper(): string {
    const whispers = [
      "Yes... let the darkness flow through you...",
      "Their screams will be music to your ears...",
      "Power is all that matters. Take what you want.",
      "Trust is weakness. Betrayal is strength.",
      "They deserve to suffer for their naivety.",
      "Why show mercy when cruelty is so much more... satisfying?",
      "The weak exist only to serve the strong.",
      "Pain teaches lessons that kindness never could.",
      "Your enemies fear you. Good. They should.",
      "Compassion is a disease. Cure yourself of it."
    ];
    
    return whispers[Math.floor(Math.random() * whispers.length)];
  }
}
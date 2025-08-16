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
    // Only generate AI actions when soul is completely gone AND character is AI controlled
    if (!character.isAIControlled || character.soulPercentage > 0) return null;

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
      // From the provided spell lists
      { targetObject: "Dagger", enchantmentDescription: "Cause wounds to fester and never fully heal", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 12 },
      { targetObject: "Mirror", enchantmentDescription: "Trap the reflection's soul, making it scream silently", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 18 },
      { targetObject: "Necklace", enchantmentDescription: "Whisper dark thoughts into the wearer's mind at night", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 14 },
      { targetObject: "Ring", enchantmentDescription: "Slowly drain the wearer's luck, making misfortune unavoidable", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 15 },
      { targetObject: "Candle", enchantmentDescription: "Burn with flames that induce fear and hallucinations", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 13 },
      { targetObject: "Book", enchantmentDescription: "Rewrite its own pages to reveal forbidden knowledge whenever opened", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 20 },
      { targetObject: "Armor", enchantmentDescription: "Slowly corrupt the wearer's body, making them feel endless fatigue", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 16 },
      { targetObject: "Coin", enchantmentDescription: "Curse anyone who touches it to attract betrayal from friends", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 14 },
      { targetObject: "Key", enchantmentDescription: "Lock doors permanently and summon shadows when used", spellType: "summoning" as const, complexity: "complex" as const, estimatedSoulCost: 17 },
      { targetObject: "Cloak", enchantmentDescription: "Conceal the wearer but slowly warp their mind into paranoia", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 18 },
      { targetObject: "Potion vial", enchantmentDescription: "Turn any drink poured inside into a poison that induces rage", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 13 },
      { targetObject: "Quill", enchantmentDescription: "Write words that compel the reader to obey dark commands", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 19 },
      { targetObject: "Bell", enchantmentDescription: "Ring on its own to call nightmares into the surrounding area", spellType: "summoning" as const, complexity: "complex" as const, estimatedSoulCost: 17 },
      { targetObject: "Staff", enchantmentDescription: "Summon illusions of fallen enemies to terrify allies", spellType: "summoning" as const, complexity: "complex" as const, estimatedSoulCost: 16 },
      { targetObject: "Shoes", enchantmentDescription: "Make the wearer walk endlessly in circles at night", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 12 },
      { targetObject: "Gemstone", enchantmentDescription: "Absorb the life force of anyone who gazes into it", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 20 },
      { targetObject: "Mask", enchantmentDescription: "Force the wearer to mimic the voices of others, sowing confusion", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 14 },
      { targetObject: "Scroll", enchantmentDescription: "Spread a curse on anyone who reads it aloud", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 15 },
      { targetObject: "Cup", enchantmentDescription: "Turn any drink into a hallucinogenic draught of despair", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 13 },
      { targetObject: "Chain", enchantmentDescription: "Bind its victim's luck and movement, making escape impossible", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 18 },
      { targetObject: "Amulet", enchantmentDescription: "Slowly twist the wearer's emotions into uncontrollable anger", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 14 },
      { targetObject: "Blade", enchantmentDescription: "Infect any wound with pain that never fully fades", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 15 },
      { targetObject: "Lantern", enchantmentDescription: "Illuminate only the fear within people, showing them their worst dread", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 17 },
      { targetObject: "Boots", enchantmentDescription: "Force the wearer to stumble into danger whenever they try to run", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 12 },
      { targetObject: "Potion", enchantmentDescription: "Turn any drink into a liquid that causes uncontrollable trembling", spellType: "curse" as const, complexity: "moderate" as const, estimatedSoulCost: 13 },
      { targetObject: "Cage", enchantmentDescription: "Trap a creature inside permanently if it is filled with darkness", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 19 },
      { targetObject: "Chalice", enchantmentDescription: "Slowly drain the vitality of anyone who drinks from it", spellType: "curse" as const, complexity: "complex" as const, estimatedSoulCost: 16 }
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
      "Orchestrate 'accidents' that appear natural but serve my dark purposes",
      "Stalk through the shadows, observing others to gather blackmail material",
      "Convince innocent dragons to make terrible mistakes through subtle manipulation",
      "Create false evidence to frame rivals for crimes they didn't commit",
      "Burn down libraries and schools to spread ignorance and fear",
      "Torture captured enemies for information, then dispose of them cruelly",
      "Corrupt healing herbs and medicines to make them cause harm instead",
      "Impersonate trusted figures to gain access to restricted areas",
      "Start fights between different dragon tribes by provoking ancient grievances",
      "Kidnap dragonets and hold them hostage to control their parents",
      "Destroy food supplies during times of scarcity to cause starvation",
      "Spread disease by contaminating water sources with infected materials",
      "Turn loyal friends against each other through carefully planted lies",
      "Recruit desperate dragons into a cult of darkness and despair",
      "Burn down homes and shelters, leaving others exposed to the elements",
      "Practice mind control techniques on weaker-willed dragons"
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
import { Character, GameData, Choice, GameEvent, Scenario } from "@shared/schema";
import { AIDungeonMaster } from "./ai-dungeon-master";
import { SoulCorruptionManager } from "./enhanced-magic-system";
import { generateScenario, generateTimeInfo } from "./scenario-generator-final";

export class EnhancedGameEngine {
  static processChoice(
    character: Character,
    gameData: GameData,
    choice: Choice,
    scenario: Scenario
  ): { newCharacter: Character; newGameData: GameData; event: GameEvent } {
    const newCharacter = { ...character };
    const newGameData = { ...gameData };

    // Apply soul loss and update corruption stage
    if (choice.soulCost > 0) {
      const actualSoulLoss = this.calculateSoulLoss(choice.soulCost);
      newCharacter.soulPercentage = Math.max(0, character.soulPercentage - actualSoulLoss);
      newCharacter.soulCorruptionStage = SoulCorruptionManager.getSoulCorruptionStage(newCharacter.soulPercentage);
    }

    // Apply sanity changes
    if (choice.sanityCost !== 0) {
      const actualSanityChange = this.calculateSanityChange(choice.sanityCost);
      newCharacter.sanityPercentage = Math.max(0, Math.min(100, character.sanityPercentage - actualSanityChange));
    }

    // Age progression and season changes
    this.progressTime(newCharacter, newGameData);

    // Handle relationships based on choice
    this.updateRelationships(newCharacter, choice, scenario);

    // Check for achievements
    this.checkAchievements(newCharacter, choice, scenario);

    // Generate next scenario using AI dungeon master
    const nextScenario = this.generateNextScenario(newCharacter, newGameData);

    // Create game event
    const event: GameEvent = {
      turn: gameData.turn,
      scenario: scenario.id,
      choice: choice.id,
      consequences: choice.consequences,
      soulLoss: choice.soulCost,
      sanityLoss: choice.sanityCost
    };

    // Update game data
    newGameData.turn += 1;
    newGameData.currentScenario = nextScenario;
    newGameData.history.push(event);

    // Check if AI should take control
    if (SoulCorruptionManager.shouldAITakeControl(newCharacter)) {
      newCharacter.isAIControlled = true;
    }

    return { newCharacter, newGameData, event };
  }

  static generateNextScenario(character: Character, gameData: GameData): Scenario {
    // 30% chance for AI-driven events
    if (Math.random() < 0.3) {
      const eventType = Math.random();
      if (eventType < 0.4) {
        return AIDungeonMaster.generateMoralDilemma(character, gameData);
      } else if (eventType < 0.7) {
        return AIDungeonMaster.generateRandomDisaster(character, gameData);
      } else {
        // Generate political/war events
        return this.generatePoliticalScenario(character, gameData);
      }
    }

    // Otherwise use regular scenario generation
    return generateScenario(character, gameData);
  }

  static generatePoliticalScenario(character: Character, gameData: GameData): Scenario {
    const politicalEvent = AIDungeonMaster.generateTribePolitics(character);
    
    return {
      id: `political_${Date.now()}`,
      title: `${politicalEvent.type.replace('_', ' ').toUpperCase()}: ${politicalEvent.tribes.join(' vs ')}`,
      description: "Political turmoil threatens the stability of your tribe",
      narrativeText: [
        politicalEvent.description,
        "Your position as an animus dragon makes you valuable to all sides.",
        "How will you navigate these treacherous political waters?"
      ],
      choices: [
        {
          id: "political_support",
          text: "Support the traditional power structure",
          description: "Stand with established authority",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["Your loyalty is noted by those in power..."]
        },
        {
          id: "political_rebel",
          text: "Support the rebels/challengers",
          description: "Side with those seeking change",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 5),
          consequences: ["Revolution comes with risks..."]
        },
        {
          id: "political_neutral",
          text: "Remain neutral and protect yourself",
          description: "Stay out of the conflict",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Neutrality may be seen as cowardice..."]
        }
      ],
      type: 'extraordinary',
      location: gameData.location,
      timeOfDay: "political crisis",
      weather: "tense"
    };
  }

  static progressTime(character: Character, gameData: GameData): void {
    // Advance seasons every 10 turns
    if (gameData.turn % 10 === 0) {
      const seasons: ("Spring" | "Summer" | "Fall" | "Winter")[] = ["Spring", "Summer", "Fall", "Winter"];
      const currentIndex = seasons.indexOf(character.currentSeason);
      character.currentSeason = seasons[(currentIndex + 1) % seasons.length];
      
      // Age up every 4 seasons (1 year)
      if (character.currentSeason === "Spring") {
        character.age += 1;
        character.yearsSurvived += 1;
      }
    }
  }

  static updateRelationships(character: Character, choice: Choice, scenario: Scenario): void {
    // Build relationships based on choices
    if (choice.consequences.some(c => c.includes("friend"))) {
      const friendName = `Dragon_${Math.random().toString(36).substr(2, 9)}`;
      character.relationships[friendName] = {
        name: friendName,
        type: "friend",
        strength: Math.floor(Math.random() * 30) + 20
      };
    }

    if (choice.corruption) {
      // Corrupt choices strain relationships
      Object.keys(character.relationships).forEach(key => {
        if (character.relationships[key].type === "friend") {
          character.relationships[key].strength -= Math.floor(Math.random() * 10) + 5;
          if (character.relationships[key].strength < 0) {
            character.relationships[key].type = "neutral";
          }
        }
      });
    }
  }

  static checkAchievements(character: Character, choice: Choice, scenario: Scenario): void {
    const achievements = [];

    // Soul corruption achievements
    if (character.soulPercentage <= 50 && !character.achievements.includes("Soul Fractured")) {
      achievements.push("Soul Fractured");
    }
    if (character.soulPercentage <= 10 && !character.achievements.includes("Soul Broken")) {
      achievements.push("Soul Broken");
    }

    // Age achievements
    if (character.age >= 10 && !character.achievements.includes("Decade Dragon")) {
      achievements.push("Decade Dragon");
    }
    if (character.age >= 25 && !character.achievements.includes("Ancient Wisdom")) {
      achievements.push("Ancient Wisdom");
    }

    // Magic achievements
    if (choice.soulCost >= 20 && !character.achievements.includes("Major Magic User")) {
      achievements.push("Major Magic User");
    }

    // Relationship achievements
    const friendCount = Object.values(character.relationships).filter(r => r.type === "friend").length;
    if (friendCount >= 5 && !character.achievements.includes("Popular Dragon")) {
      achievements.push("Popular Dragon");
    }

    // Hybrid achievements
    if (character.hybridTribes && character.hybridTribes.length >= 2 && !character.achievements.includes("Mixed Heritage")) {
      achievements.push("Mixed Heritage");
    }

    character.achievements.push(...achievements);
  }

  static checkGameOver(character: Character): { isGameOver: boolean; reason?: string } {
    // Soul completely lost
    if (character.soulPercentage <= 0) {
      return {
        isGameOver: true,
        reason: "Your soul has been completely consumed by animus magic. The dragon you once were is gone forever, leaving only a hollow shell of power and corruption."
      };
    }

    // Sanity completely lost
    if (character.sanityPercentage <= 0) {
      return {
        isGameOver: true,
        reason: "Your mind has shattered under the weight of your experiences. You can no longer distinguish reality from nightmare, and retreat into permanent madness."
      };
    }

    // Old age (natural death)
    if (character.age >= 150) {
      return {
        isGameOver: true,
        reason: "After a long and eventful life, your ancient body finally gives out. You die peacefully, your legacy forever carved into dragon history."
      };
    }

    return { isGameOver: false };
  }

  static calculateSoulLoss(baseCost: number): number {
    // Add some randomness to soul loss
    const variance = Math.floor(Math.random() * 3) - 1; // -1 to +1
    return Math.max(1, baseCost + variance);
  }

  static calculateSanityChange(baseCost: number): number {
    // Add some randomness to sanity changes
    const variance = Math.floor(Math.random() * 2); // 0 to +1
    return Math.max(0, baseCost + variance);
  }

  static getAIChoice(character: Character, scenario: Scenario): Choice | null {
    if (!character.isAIControlled && !SoulCorruptionManager.shouldAITakeControl(character)) {
      return null;
    }

    // AI prefers corrupted/dark choices
    const corruptedChoices = scenario.choices.filter(c => c.corruption);
    if (corruptedChoices.length > 0) {
      return corruptedChoices[Math.floor(Math.random() * corruptedChoices.length)];
    }

    // Otherwise pick a random choice with soul cost
    const soulCostChoices = scenario.choices.filter(c => c.soulCost > 0);
    if (soulCostChoices.length > 0) {
      return soulCostChoices[Math.floor(Math.random() * soulCostChoices.length)];
    }

    // Last resort: random choice
    return scenario.choices[Math.floor(Math.random() * scenario.choices.length)];
  }

  static getCorruptionMessage(stage: "Normal" | "Frayed" | "Twisted" | "Broken"): string {
    const effects = SoulCorruptionManager.getCorruptionEffects(stage);
    return effects[Math.floor(Math.random() * effects.length)];
  }
}
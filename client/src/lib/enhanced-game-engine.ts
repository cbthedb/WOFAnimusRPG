import { Character, GameData, Choice, GameEvent, Scenario } from "@shared/schema";
import { AIDungeonMaster } from "./ai-dungeon-master";
import { SoulCorruptionManager } from "./enhanced-magic-system";
import { generateScenario, generateTimeInfo } from "./scenario-generator-final";
import { OpenAIService } from "./openai-service";

export class EnhancedGameEngine {
  static async processChoice(
    character: Character,
    gameData: GameData,
    choice: Choice,
    scenario: Scenario
  ): Promise<{ newCharacter: Character; newGameData: GameData; event: GameEvent }> {
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

    // Generate next scenario using OpenAI
    const nextScenario = await this.generateNextScenario(newCharacter, newGameData);

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

  static async generateNextScenario(character: Character, gameData: GameData): Promise<Scenario> {
    // Use OpenAI for ALL scenario generation for maximum variety and quality
    return await this.generateOpenAIScenario(character, gameData);
  }

  static async generateOpenAIScenario(character: Character, gameData: GameData): Promise<Scenario> {
    try {
      const context = {
        character: {
          name: character.name,
          tribe: character.tribe,
          hybridTribes: character.hybridTribes,
          isAnimus: character.isAnimus,
          age: character.age,
          soulPercentage: character.soulPercentage,
          soulCorruptionStage: character.soulCorruptionStage,
          sanityPercentage: character.sanityPercentage,
          location: gameData.location,
          currentSeason: character.currentSeason
        },
        gameData: {
          turn: gameData.turn,
          location: gameData.location,
          recentEvents: gameData.history.slice(-3)
        }
      };

      const prompt = `Generate a new scenario for this Wings of Fire RPG character. Create an interesting, dramatic situation that fits their current state and location. The character is ${character.isAnimus ? 'an animus dragon' : 'a regular dragon'} of the ${character.tribe}${character.hybridTribes ? ` and ${character.hybridTribes.join('/')} tribes` : ' tribe'}.

Return a JSON object with:
- title: Brief scenario title
- description: One sentence setup
- narrativeText: Array of 2-3 dramatic sentences describing the situation
- choices: Array of 3-4 choice objects, each with id, text, description, soulCost (0-3 for normal choices, higher for animus magic), sanityCost (0-2), and consequences array

Make choices varied - include social, combat, magical, and strategic options. For animus characters, include magical choices but not every scenario needs magic.`;

      const response = await OpenAIService.generateScenarioResponse(prompt, context);
      
      // Try to parse the JSON response
      let parsedScenario;
      try {
        parsedScenario = JSON.parse(response);
      } catch {
        // Fallback to a basic scenario if JSON parsing fails
        return this.createFallbackScenario(character, gameData);
      }

      // Validate and format the scenario
      const scenario: Scenario = {
        id: `openai_${Date.now()}`,
        title: parsedScenario.title || "A New Challenge",
        description: parsedScenario.description || "Something interesting happens.",
        narrativeText: Array.isArray(parsedScenario.narrativeText) ? parsedScenario.narrativeText : ["The situation unfolds before you."],
        choices: this.validateChoices(parsedScenario.choices || []),
        type: 'extraordinary' as const,
        location: gameData.location,
        timeOfDay: this.getRandomTimeOfDay(),
        weather: this.getRandomWeather()
      };

      return scenario;
    } catch (error) {
      console.error("OpenAI scenario generation failed:", error);
      return this.createFallbackScenario(character, gameData);
    }
  }

  static createFallbackScenario(character: Character, gameData: GameData): Scenario {
    return generateScenario(character, gameData);
  }

  static validateChoices(choices: any[]): Choice[] {
    const validChoices: Choice[] = [];
    
    for (let i = 0; i < Math.min(choices.length, 4); i++) {
      const choice = choices[i];
      if (choice && choice.text) {
        validChoices.push({
          id: choice.id || `choice_${i}`,
          text: choice.text,
          description: choice.description || choice.text,
          soulCost: Math.min(Math.max(choice.soulCost || 0, 0), 10),
          sanityCost: Math.min(Math.max(choice.sanityCost || 0, 0), 5),
          consequences: Array.isArray(choice.consequences) ? choice.consequences : ["The outcome unfolds..."]
        });
      }
    }

    // Ensure at least 2 choices
    if (validChoices.length < 2) {
      validChoices.push(
        {
          id: "default_1",
          text: "Take action",
          description: "Do something about the situation",
          soulCost: 0,
          sanityCost: 1,
          consequences: ["You take decisive action..."]
        },
        {
          id: "default_2", 
          text: "Wait and observe",
          description: "Carefully assess the situation",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["You observe the situation carefully..."]
        }
      );
    }

    return validChoices;
  }

  static getRandomTimeOfDay(): string {
    const times = ["dawn", "morning", "midday", "afternoon", "dusk", "night", "midnight"];
    return times[Math.floor(Math.random() * times.length)];
  }

  static getRandomWeather(): string {
    const weather = ["clear", "cloudy", "rainy", "stormy", "foggy", "windy", "calm"];
    return weather[Math.floor(Math.random() * weather.length)];
  }

  static generatePoliticalScenario(character: Character, gameData: GameData): Scenario {
    const politicalEvent = AIDungeonMaster.generateTribePolitics(character);
    
    return {
      id: `political_${Date.now()}`,
      title: `${politicalEvent.type.replace('_', ' ').toUpperCase()}: ${politicalEvent.tribes.join(' vs ')}`,
      description: "Political turmoil threatens the stability of your tribe",
      narrativeText: [
        politicalEvent.description,
        character.isAnimus ? "Your position as an animus dragon makes you valuable to all sides." : "Your unique abilities make you valuable to all sides.",
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
    // Romance relationship building
    if (scenario.id.includes('romance') && choice.id === 'romance_accept') {
      const partnerName = this.generateRandomDragonName();
      character.relationships[partnerName] = {
        name: partnerName,
        type: "romantic",
        strength: Math.floor(Math.random() * 40) + 30,
        history: ["Romance blossomed during an encounter"],
        isAlive: true
      };
      
      // Chance for pregnancy/dragonets if mated
      if (Math.random() < 0.3 && !character.mate) {
        character.mate = partnerName;
        character.relationships[partnerName].type = "mate";
        
        // Chance for immediate dragonets
        if (Math.random() < 0.4) {
          this.addDragonet(character, partnerName);
        }
      }
    }

    // Build friendships from social interactions
    if (choice.consequences.some(c => c.includes("friend")) || scenario.id.includes('social')) {
      const friendName = this.generateRandomDragonName();
      character.relationships[friendName] = {
        name: friendName,
        type: "friend",
        strength: Math.floor(Math.random() * 30) + 20,
        history: ["Met during a memorable encounter"],
        isAlive: true
      };
    }

    // Create rivals from conflicts
    if (scenario.id.includes('war') || scenario.id.includes('political')) {
      const rivalName = this.generateRandomDragonName();
      character.relationships[rivalName] = {
        name: rivalName,
        type: "rival",
        strength: Math.floor(Math.random() * 20) + 10,
        history: ["Conflict created lasting animosity"],
        isAlive: true
      };
    }

    if (choice.corruption) {
      // Corrupt choices strain all relationships
      Object.keys(character.relationships).forEach(key => {
        const relationship = character.relationships[key];
        if (relationship.type === "friend" || relationship.type === "romantic") {
          relationship.strength -= Math.floor(Math.random() * 15) + 5;
          if (relationship.strength < 0) {
            relationship.type = relationship.type === "romantic" ? "ex_mate" : "neutral";
            relationship.history.push("Relationship damaged by corruption");
          }
        }
      });
    }
  }

  static generateRandomDragonName(): string {
    const prefixes = ['Shadow', 'Fire', 'Ice', 'Storm', 'Star', 'Moon', 'Sun', 'Wind', 'Ocean', 'Earth'];
    const suffixes = ['wing', 'claw', 'scale', 'breath', 'heart', 'eye', 'song', 'dance', 'flight', 'roar'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  static addDragonet(character: Character, partnerName: string): void {
    const dragonetName = this.generateRandomDragonName();
    const inheritedTribes = character.hybridTribes ? [...character.hybridTribes] : [character.tribe];
    
    // Add some random tribe mixing
    if (Math.random() < 0.3) {
      const allTribes = ['NightWing', 'SkyWing', 'SeaWing', 'RainWing', 'SandWing', 'IceWing', 'MudWing'];
      const randomTribe = allTribes[Math.floor(Math.random() * allTribes.length)];
      if (!inheritedTribes.includes(randomTribe)) {
        inheritedTribes.push(randomTribe);
      }
    }
    
    const dragonet = {
      name: dragonetName,
      age: 0,
      tribe: inheritedTribes[0],
      hybridTribes: inheritedTribes.length > 1 ? inheritedTribes : undefined,
      inheritedTraits: this.inheritTraits(character),
      isAnimus: Math.random() < (character.isAnimus ? 0.15 : 0.05), // Higher chance if parent is animus
      parentage: 'biological' as const,
      personality: this.generateDragonetPersonality()
    };
    
    character.dragonets.push(dragonet);
  }

  static inheritTraits(character: Character): string[] {
    const inherited = [];
    // 50% chance to inherit each trait
    for (const trait of character.traits) {
      if (Math.random() < 0.5) {
        inherited.push(trait);
      }
    }
    // Add some new random traits
    const newTraits = ['Brave', 'Curious', 'Gentle', 'Fierce', 'Wise', 'Playful'];
    if (Math.random() < 0.7) {
      inherited.push(newTraits[Math.floor(Math.random() * newTraits.length)]);
    }
    return inherited;
  }

  static generateDragonetPersonality(): string {
    const personalities = [
      'Playful and energetic', 'Quiet and thoughtful', 'Bold and adventurous',
      'Gentle and kind', 'Mischievous and clever', 'Protective and loyal'
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
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

  static getCorruptionLevel(soulPercentage: number): "Normal" | "Frayed" | "Twisted" | "Broken" {
    if (soulPercentage >= 85) return "Normal";
    if (soulPercentage >= 60) return "Frayed";
    if (soulPercentage >= 30) return "Twisted";
    return "Broken";
  }

  static shouldShowCorruptionPopup(character: Character): boolean {
    return character.soulPercentage < 15 && character.soulPercentage > 5;
  }

  static async generateCorruptionWhisper(character: Character): Promise<string> {
    try {
      return await OpenAIService.generateCorruptionWhisper(character);
    } catch (error) {
      const darkWhispers = [
        "Power awaits those who embrace the darkness...",
        "Why resist when you could rule them all?",
        "Your enemies deserve to suffer for their weakness...",
        "Magic is meant to be used. Use it without restraint...",
        "Show them the true meaning of fear..."
      ];
      return darkWhispers[Math.floor(Math.random() * darkWhispers.length)];
    }
  }
}
import { Character, GameData, Choice, GameEvent, Scenario } from "@shared/schema";
import { generateScenario, generateTimeInfo, generateLocation } from "./scenario-generator";

export class GameEngine {
  static processChoice(
    character: Character,
    gameData: GameData,
    choice: Choice,
    scenario: Scenario
  ): { newCharacter: Character; newGameData: GameData; event: GameEvent } {
    const newCharacter = { ...character };
    const newGameData = { ...gameData };

    // Apply soul loss
    if (choice.soulCost > 0) {
      const actualSoulLoss = this.calculateSoulLoss(choice.soulCost);
      newCharacter.soulPercentage = Math.max(0, character.soulPercentage - actualSoulLoss);
    }

    // Create game event
    const event: GameEvent = {
      turn: gameData.turn,
      scenario: scenario.id,
      choice: choice.id,
      consequences: choice.consequences,
      soulLoss: choice.soulCost
    };

    // Add to history
    newGameData.history.push(event);
    newGameData.turn += 1;

    // Apply consequences
    this.applyConsequences(choice.consequences, newCharacter, newGameData);

    // Generate next scenario
    newGameData.currentScenario = generateScenario(newCharacter, newGameData);
    newGameData.timeInfo = generateTimeInfo();
    
    // Possibly change location
    if (Math.random() < 0.3) {
      newGameData.location = generateLocation();
    }

    return { newCharacter, newGameData, event };
  }

  private static calculateSoulLoss(baseCost: number): number {
    // Add some randomness to soul loss (±20%)
    const variance = baseCost * 0.2;
    const actualCost = baseCost + (Math.random() - 0.5) * variance;
    return Math.max(1, Math.round(actualCost));
  }

  private static applyConsequences(
    consequences: string[],
    character: Character,
    gameData: GameData
  ): void {
    consequences.forEach(consequence => {
      switch (consequence) {
        case 'friendship_gain':
          gameData.relationships['friend'] = (gameData.relationships['friend'] || 0) + 10;
          break;
        case 'magic_revealed':
          gameData.reputation += 5;
          break;
        case 'disappointment':
          gameData.relationships['friend'] = (gameData.relationships['friend'] || 0) - 5;
          break;
        case 'major_corruption':
          // Corruption events have lasting effects
          character.traits.push('Corrupted');
          break;
        case 'bully_confronted':
          gameData.reputation += 3;
          break;
        case 'authority_involved':
          gameData.relationships['teachers'] = (gameData.relationships['teachers'] || 0) + 5;
          break;
        // Add more consequence handlers as needed
      }
    });
  }

  static shouldAIIntervene(character: Character): boolean {
    // AI starts intervening when soul drops below 70%
    if (character.soulPercentage < 70) {
      const corruptionLevel = (100 - character.soulPercentage) / 100;
      return Math.random() < corruptionLevel * 0.3; // Increasing chance as corruption grows
    }
    return false;
  }

  static getAIChoice(character: Character, scenario: Scenario): Choice | null {
    if (!this.shouldAIIntervene(character)) {
      return null;
    }

    // AI prefers corrupted/dark choices when in control
    const corruptedChoices = scenario.choices.filter(c => c.corruption || c.soulCost > 10);
    if (corruptedChoices.length > 0) {
      return corruptedChoices[Math.floor(Math.random() * corruptedChoices.length)];
    }

    // If no explicitly corrupted choices, pick randomly with bias toward higher soul cost
    const weightedChoices = scenario.choices.map(choice => ({
      choice,
      weight: choice.soulCost + 1 // Higher soul cost = higher weight for AI
    }));

    const totalWeight = weightedChoices.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedChoices) {
      random -= item.weight;
      if (random <= 0) {
        return item.choice;
      }
    }

    return scenario.choices[0]; // Fallback
  }

  static getCorruptionLevel(soulPercentage: number): 'pure' | 'tainted' | 'corrupted' | 'lost' {
    if (soulPercentage >= 80) return 'pure';
    if (soulPercentage >= 50) return 'tainted';
    if (soulPercentage >= 20) return 'corrupted';
    return 'lost';
  }

  static getCorruptionMessage(level: 'pure' | 'tainted' | 'corrupted' | 'lost'): string {
    switch (level) {
      case 'pure':
        return "Your soul shines with pure light.";
      case 'tainted':
        return "Dark thoughts occasionally cloud your mind...";
      case 'corrupted':
        return "Malevolent whispers echo in your thoughts.";
      case 'lost':
        return "The darkness has consumed you. You are no longer in control.";
    }
  }
}

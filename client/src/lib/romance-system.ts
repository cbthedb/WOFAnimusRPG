import { Character, Dragonet, RomanticEvent, Relationship } from "@shared/schema";

export class RomanceSystem {
  // Names for dragon partners
  private static readonly DRAGON_NAMES = [
    "Ember", "Frostbite", "Coral", "Sandstorm", "Viper", "Rainbow", "Shadow", "Moonbeam",
    "Thunder", "Starlight", "Clay", "Ruby", "Sapphire", "Crystal", "Storm", "Breeze",
    "Phoenix", "Galaxy", "Mist", "Flame", "Glacier", "Opal", "Onyx", "Jade"
  ];

  static getRandomPartnerName(): string {
    return this.DRAGON_NAMES[Math.floor(Math.random() * this.DRAGON_NAMES.length)];
  }

  static canHaveRomance(character: Character): boolean {
    return character.age >= 7 && character.soulCorruptionStage !== "Broken";
  }

  static generateRomanticEncounter(character: Character): {
    partnerName: string;
    partnerTribe: string;
    scenario: string;
    isHybrid: boolean;
  } {
    const partnerName = this.getRandomPartnerName();
    const partnerTribe = this.getRandomTribe(character.tribe);
    const isHybrid = Math.random() < 0.3; // 30% chance of hybrid partner
    
    const scenarios = [
      `You meet ${partnerName}, a charming ${partnerTribe} dragon at Jade Mountain Academy.`,
      `${partnerName} saves your life during a dangerous expedition, and you feel drawn to them.`,
      `You and ${partnerName} bond over shared interests and similar experiences.`,
      `${partnerName} challenges you to a friendly competition, and sparks fly.`,
      `You encounter ${partnerName} during a diplomatic mission between tribes.`
    ];

    return {
      partnerName,
      partnerTribe,
      scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
      isHybrid
    };
  }

  private static getRandomTribe(excludeTribe: string): string {
    const tribes = ["MudWing", "SandWing", "SkyWing", "SeaWing", "IceWing", "RainWing", "NightWing", "SilkWing", "HiveWing", "LeafWing"];
    const availableTribes = tribes.filter(tribe => tribe !== excludeTribe);
    return availableTribes[Math.floor(Math.random() * availableTribes.length)];
  }

  static developRomance(character: Character, partnerName: string, partnerTribe: string): void {
    // Add romantic relationship
    character.relationships[partnerName] = {
      name: partnerName,
      type: "romantic",
      strength: Math.floor(Math.random() * 40) + 30, // 30-70 strength
      history: ["First romantic encounter"],
      isAlive: true
    };

    // Add to romantic history
    const romanticEvent: RomanticEvent = {
      partnerName,
      eventType: "courtship",
      turnOccurred: character.age,
      outcome: "developing relationship",
      hasOffspring: false
    };

    if (!character.romanticHistory) {
      character.romanticHistory = [];
    }
    character.romanticHistory.push(romanticEvent);
  }

  static canMate(character: Character, partnerName: string): boolean {
    const relationship = character.relationships[partnerName];
    return relationship && 
           relationship.type === "romantic" && 
           relationship.strength >= 60 &&
           character.age >= 8;
  }

  static attemptMating(character: Character, partnerName: string): boolean {
    if (!this.canMate(character, partnerName)) return false;

    const relationship = character.relationships[partnerName];
    const success = Math.random() < 0.7; // 70% success rate

    if (success) {
      // Update relationship to mate
      relationship.type = "mate";
      relationship.strength = Math.min(100, relationship.strength + 20);
      relationship.history.push("Became mates");
      character.mate = partnerName;

      // Add mating event
      const romanticEvent: RomanticEvent = {
        partnerName,
        eventType: "mating",
        turnOccurred: character.age,
        outcome: "successful bonding",
        hasOffspring: false
      };
      character.romanticHistory.push(romanticEvent);

      return true;
    }

    return false;
  }

  static generateOffspring(character: Character, partnerName: string, partnerTribe: string): Dragonet | null {
    if (!character.mate || character.mate !== partnerName) return null;
    if (Math.random() > 0.6) return null; // 60% chance of offspring

    const relationship = character.relationships[partnerName];
    const isHybrid = character.tribe !== partnerTribe;
    
    // Generate name
    const dragonetNames = ["Pebble", "Spark", "Brook", "Ember", "Frost", "Leaf", "Sky", "Ocean"];
    const dragonetName = dragonetNames[Math.floor(Math.random() * dragonetNames.length)];

    // Determine tribe (hybrid or pure)
    let dragonetTribe = character.tribe;
    let hybridTribes = undefined;

    if (isHybrid) {
      dragonetTribe = Math.random() < 0.5 ? character.tribe : partnerTribe;
      hybridTribes = [character.tribe, partnerTribe];
    }

    // Inherit animus magic (rare)
    const inheritAnimus = (character.isAnimus && Math.random() < 0.3) || 
                         (Math.random() < 0.1); // 30% from animus parent, 10% random

    // Inherit traits
    const inheritedTraits = [];
    if (character.traits.length > 0 && Math.random() < 0.5) {
      inheritedTraits.push(character.traits[Math.floor(Math.random() * character.traits.length)]);
    }

    const personalities = ["brave", "shy", "curious", "fierce", "gentle", "mischievous", "wise", "playful"];

    const dragonet: Dragonet = {
      name: dragonetName,
      age: 0,
      tribe: dragonetTribe,
      hybridTribes,
      inheritedTraits,
      isAnimus: inheritAnimus,
      parentage: "biological",
      personality: personalities[Math.floor(Math.random() * personalities.length)]
    };

    // Add to character's dragonets
    if (!character.dragonets) {
      character.dragonets = [];
    }
    character.dragonets.push(dragonet);

    // Update romantic event
    const lastEvent = character.romanticHistory[character.romanticHistory.length - 1];
    if (lastEvent && lastEvent.partnerName === partnerName) {
      lastEvent.hasOffspring = true;
    }

    return dragonet;
  }

  static ageDragonets(character: Character): void {
    if (!character.dragonets) return;

    character.dragonets.forEach(dragonet => {
      dragonet.age += 1;
    });
  }

  static getRelationshipAdvice(character: Character, partnerName: string): string[] {
    const relationship = character.relationships[partnerName];
    if (!relationship) return ["No relationship exists with this dragon."];

    const advice = [];
    
    if (relationship.strength < 30) {
      advice.push("Your relationship is struggling. Consider spending more quality time together.");
    } else if (relationship.strength < 60) {
      advice.push("Your relationship is developing well. Keep building trust and understanding.");
    } else {
      advice.push("You have a strong bond. This relationship could last a lifetime.");
    }

    if (relationship.type === "romantic" && character.age >= 8) {
      advice.push("You might consider taking your relationship to the next level.");
    }

    if (character.soulCorruptionStage !== "Normal") {
      advice.push("Your soul corruption may affect your relationships. Be mindful of how you treat loved ones.");
    }

    return advice;
  }
}

export default RomanceSystem;
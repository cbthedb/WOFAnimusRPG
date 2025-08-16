import { Character, Dragonet } from "@shared/schema";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: "magic" | "soul" | "relationships" | "survival" | "exploration" | "political" | "family";
  rarity: "common" | "rare" | "legendary";
  check: (character: Character) => boolean;
  reward?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Magic Achievements
  {
    id: "first_spell",
    name: "First Steps",
    description: "Cast your first animus spell",
    category: "magic",
    rarity: "common",
    check: (character) => character.soulPercentage < 100
  },
  {
    id: "major_magic",
    name: "Power Unleashed",
    description: "Cast a spell that costs 20+ soul percentage",
    category: "magic", 
    rarity: "rare",
    check: (character) => character.soulPercentage <= 75
  },
  {
    id: "catastrophic_magic",
    name: "World Shaker",
    description: "Cast a catastrophic spell (40+ soul cost)",
    category: "magic",
    rarity: "legendary",
    check: (character) => character.soulPercentage <= 50
  },

  // Soul Corruption Achievements
  {
    id: "soul_frayed",
    name: "Cracks in the Foundation",
    description: "Reach Frayed soul corruption stage",
    category: "soul",
    rarity: "common",
    check: (character) => character.soulCorruptionStage !== "Normal"
  },
  {
    id: "soul_twisted",
    name: "Darkness Creeping",
    description: "Reach Twisted soul corruption stage",
    category: "soul",
    rarity: "rare",
    check: (character) => character.soulCorruptionStage === "Twisted" || character.soulCorruptionStage === "Broken"
  },
  {
    id: "soul_broken",
    name: "Point of No Return",
    description: "Reach Broken soul corruption stage",
    category: "soul",
    rarity: "legendary",
    check: (character) => character.soulCorruptionStage === "Broken"
  },
  {
    id: "soul_guardian",
    name: "Pure of Heart", 
    description: "Survive 50 turns with Normal soul stage",
    category: "soul",
    rarity: "rare",
    check: (character) => character.age >= 15 && character.soulCorruptionStage === "Normal"
  },

  // Relationship Achievements
  {
    id: "first_friend",
    name: "Not Alone",
    description: "Make your first friend",
    category: "relationships",
    rarity: "common",
    check: (character) => Object.values(character.relationships || {}).some(r => r.type === "friend")
  },
  {
    id: "popular_dragon",
    name: "Social Butterfly",
    description: "Have 5 or more friendships",
    category: "relationships",
    rarity: "rare",
    check: (character) => Object.values(character.relationships || {}).filter(r => r.type === "friend").length >= 5
  },
  {
    id: "first_love",
    name: "Heart's Awakening",
    description: "Experience your first romance",
    category: "relationships",
    rarity: "common",
    check: (character) => (character.romanticHistory || []).length > 0
  },
  {
    id: "true_mate",
    name: "Eternal Bond",
    description: "Find a lifelong mate",
    category: "relationships",
    rarity: "rare",
    check: (character) => !!character.mate
  },
  {
    id: "heartbreaker",
    name: "Love and Loss",
    description: "Experience 3 different romantic relationships",
    category: "relationships",
    rarity: "rare",
    check: (character) => (character.romanticHistory || []).length >= 3
  },

  // Family Achievements
  {
    id: "first_dragonet",
    name: "New Life",
    description: "Have your first dragonet",
    category: "family",
    rarity: "common",
    check: (character) => (character.dragonets || []).length > 0
  },
  {
    id: "big_family",
    name: "Dragon Dynasty",
    description: "Have 3 or more dragonets",
    category: "family",
    rarity: "rare",
    check: (character) => (character.dragonets || []).length >= 3
  },
  {
    id: "animus_bloodline",
    name: "Legacy of Power",
    description: "Have an animus dragonet",
    category: "family",
    rarity: "legendary",
    check: (character) => (character.dragonets || []).some(d => d.isAnimus)
  },
  {
    id: "hybrid_offspring",
    name: "Mixed Heritage",
    description: "Have a hybrid dragonet",
    category: "family",
    rarity: "rare",
    check: (character) => (character.dragonets || []).some(d => d.hybridTribes && d.hybridTribes.length > 1)
  },

  // Survival Achievements
  {
    id: "decade_dragon",
    name: "Veteran Survivor",
    description: "Survive to age 15",
    category: "survival",
    rarity: "common",
    check: (character) => character.age >= 15
  },
  {
    id: "ancient_dragon",
    name: "Elder Wisdom",
    description: "Survive to age 50",
    category: "survival",
    rarity: "rare",
    check: (character) => character.age >= 50
  },
  {
    id: "legendary_dragon",
    name: "Living Legend",
    description: "Survive to age 100",
    category: "survival",
    rarity: "legendary",
    check: (character) => character.age >= 100
  },

  // Political Achievements
  {
    id: "political_player",
    name: "Court Intrigue",
    description: "Get involved in tribal politics",
    category: "political",
    rarity: "common",
    check: (character) => (character.lifeEvents || []).some(e => e.category === "political")
  },
  {
    id: "war_veteran",
    name: "Battle Scarred",
    description: "Survive a tribal war",
    category: "political",
    rarity: "rare",
    check: (character) => (character.lifeEvents || []).some(e => e.category === "war")
  },

  // Special Hybrid Achievements
  {
    id: "mixed_heritage",
    name: "Between Worlds",
    description: "Be born as a hybrid dragon",
    category: "exploration",
    rarity: "rare",
    check: (character) => character.hybridTribes && character.hybridTribes.length >= 2
  },
  {
    id: "tribal_unity",
    name: "Bridge Builder",
    description: "Have friends from 3+ different tribes",
    category: "relationships",
    rarity: "rare",
    check: (character) => {
      const friendTribes = new Set();
      Object.values(character.relationships || {}).forEach(r => {
        if (r.type === "friend") {
          // In a real implementation, you'd track friend tribes
          friendTribes.add("tribe"); // Placeholder
        }
      });
      return friendTribes.size >= 3;
    }
  }
];

export class AchievementSystem {
  static checkAchievements(character: Character): string[] {
    const newAchievements: string[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!character.achievements.includes(achievement.id) && achievement.check(character)) {
        character.achievements.push(achievement.id);
        newAchievements.push(achievement.name);
      }
    });

    return newAchievements;
  }

  static getAchievement(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
  }

  static getCharacterAchievements(character: Character): Achievement[] {
    return character.achievements
      .map(id => this.getAchievement(id))
      .filter((a): a is Achievement => a !== undefined);
  }

  static getAchievementsByCategory(category: Achievement["category"]): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
  }

  static calculateAchievementScore(character: Character): number {
    const achievements = this.getCharacterAchievements(character);
    let score = 0;
    
    achievements.forEach(achievement => {
      switch (achievement.rarity) {
        case "common": score += 10; break;
        case "rare": score += 25; break;
        case "legendary": score += 50; break;
      }
    });

    return score;
  }

  static getProgressTowardsAchievements(character: Character): Array<{achievement: Achievement, progress: string}> {
    const progress: Array<{achievement: Achievement, progress: string}> = [];
    
    // Examples of progress tracking
    const unlockedIds = new Set(character.achievements);
    
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedIds.has(achievement.id)) return;
      
      let progressText = "";
      
      // Age-based achievements
      if (achievement.id === "decade_dragon") {
        progressText = `${character.age}/15 years old`;
      } else if (achievement.id === "ancient_dragon") {
        progressText = `${character.age}/50 years old`;
      } else if (achievement.id === "legendary_dragon") {
        progressText = `${character.age}/100 years old`;
      }
      // Relationship achievements
      else if (achievement.id === "popular_dragon") {
        const friends = Object.values(character.relationships || {}).filter(r => r.type === "friend").length;
        progressText = `${friends}/5 friends`;
      }
      // Family achievements
      else if (achievement.id === "big_family") {
        const dragonets = (character.dragonets || []).length;
        progressText = `${dragonets}/3 dragonets`;
      }

      if (progressText) {
        progress.push({ achievement, progress: progressText });
      }
    });

    return progress;
  }
}

export default AchievementSystem;
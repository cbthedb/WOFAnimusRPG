import { Character } from "@shared/schema";
import { AchievementSystem } from "./expanded-achievements";

export interface GameEnding {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: "victory" | "tragic" | "neutral" | "legendary";
  rarity: "common" | "rare" | "legendary";
  check: (character: Character) => boolean;
  achievementPoints: number;
}

export const GAME_ENDINGS: GameEnding[] = [
  // Victory Endings
  {
    id: "pure_heart_victory",
    title: "The Pure Heart",
    description: "You maintained your pure soul throughout a long life, inspiring generations.",
    longDescription: "Despite having the power to reshape the world, you chose restraint and wisdom. Your soul remained untainted by corruption, and your example inspired countless dragons to resist the temptations of dark magic. You lived to see great peace across the tribes, knowing you helped build a better world.",
    category: "victory",
    rarity: "legendary",
    check: (character) => character.age >= 80 && character.soulCorruptionStage === "Normal",
    achievementPoints: 1000
  },
  {
    id: "wise_elder_victory",
    title: "The Wise Elder",
    description: "You became a revered elder, sharing wisdom gained through many trials.",
    longDescription: "Your long life was filled with both triumphs and sorrows, but you learned from every experience. In your final years, dragons from all tribes sought your counsel. Your wisdom helped prevent wars, heal ancient wounds, and guide the young away from the same mistakes you once made.",
    category: "victory",
    rarity: "rare",
    check: (character) => character.age >= 100 && character.achievements.length >= 15,
    achievementPoints: 800
  },
  {
    id: "family_legacy_victory",
    title: "The Great Parent",
    description: "Your greatest achievement was the loving family you raised.",
    longDescription: "While others sought power or glory, you found meaning in family. Your dragonets grew to be exceptional dragons, carrying forward your values and love. Your bloodline became known across Pyrrhia for their kindness, strength, and wisdom. In raising them well, you achieved true immortality.",
    category: "victory",
    rarity: "rare",
    check: (character) => (character.dragonets || []).length >= 5 && !!character.mate && character.age >= 50,
    achievementPoints: 750
  },
  {
    id: "reformed_soul_victory",
    title: "Soul's Redemption",
    description: "After walking in darkness, you found your way back to the light.",
    longDescription: "Your soul bore the scars of corruption, but you fought against the darkness within. Through tremendous willpower and the love of those who believed in you, you managed to halt your soul's decay. Though forever changed, you proved that even the corrupted could choose good.",
    category: "victory",
    rarity: "legendary",
    check: (character) => character.soulCorruptionStage === "Twisted" && character.age >= 60 && (character.dragonets || []).length > 0,
    achievementPoints: 900
  },

  // Tragic Endings
  {
    id: "soul_consumed_tragedy",
    title: "Consumed by Power",
    description: "Your soul was devoured by animus magic, leaving only darkness.",
    longDescription: "The power was too tempting, the corruption too seductive. Spell by spell, choice by choice, you fed your soul to the hungry magic until nothing remained of who you once were. In the end, you became exactly what the ancient warnings feared - an animus dragon lost to darkness.",
    category: "tragic",
    rarity: "common",
    check: (character) => character.soulPercentage <= 0,
    achievementPoints: 100
  },
  {
    id: "isolation_tragedy",
    title: "Alone in the Dark",
    description: "Your corruption drove away everyone you loved, leaving you utterly alone.",
    longDescription: "As your soul darkened, so did your relationships. Friends abandoned you, family feared you, and even your mate couldn't bear to stay. You spent your final years in bitter solitude, surrounded by magical power but having no one to share it with. Your greatest treasure became your greatest curse.",
    category: "tragic",
    rarity: "rare",
    check: (character) => character.soulCorruptionStage === "Broken" && Object.values(character.relationships || {}).filter(r => r.isAlive).length === 0,
    achievementPoints: 200
  },
  {
    id: "war_casualty_tragedy",
    title: "Price of War",
    description: "You died fighting for what you believed in.",
    longDescription: "When the tribes went to war, you couldn't stand aside. Whether fighting for justice, defending the innocent, or protecting your homeland, you gave your life for the cause. Though your story ended in tragedy, you're remembered as a hero who stood up when it mattered most.",
    category: "tragic",
    rarity: "rare", 
    check: (character) => character.age <= 30 && (character.lifeEvents || []).some(e => e.category === "war"),
    achievementPoints: 400
  },

  // Neutral Endings
  {
    id: "quiet_life_neutral",
    title: "The Quiet Life",
    description: "You lived a peaceful, unremarkable existence.",
    longDescription: "You never sought great power or fame, preferring the simple pleasures of daily life. While others changed the world, you tended your garden, raised your dragonets, and found contentment in small moments. There's something to be said for a life well-lived in peace.",
    category: "neutral",
    rarity: "common",
    check: (character) => character.age >= 40 && character.soulPercentage > 50 && character.achievements.length < 10,
    achievementPoints: 300
  },
  {
    id: "wanderer_neutral",
    title: "Roads Not Taken",
    description: "You spent your life exploring and discovering new places and experiences.",
    longDescription: "The call of adventure was stronger than any desire to settle down. You saw distant lands, met dragons from every tribe, and collected stories like treasures. Your life was a tapestry of experiences, each thread a different color, creating something beautiful and unique.",
    category: "neutral",
    rarity: "rare",
    check: (character) => (character.lifeEvents || []).filter(e => e.category === "discovery").length >= 5,
    achievementPoints: 500
  },

  // Legendary Endings
  {
    id: "world_changer_legendary",
    title: "World Shaper",
    description: "Your actions fundamentally changed dragon society.",
    longDescription: "You didn't just live through history - you made it. Through your choices, your magic, and your influence, you reshaped the world itself. Future generations will study your decisions, debate your methods, and live with the consequences of your vision. For better or worse, you left an indelible mark on Pyrrhia.",
    category: "legendary",
    rarity: "legendary",
    check: (character) => character.age >= 50 && character.achievements.length >= 20 && character.soulPercentage >= 25,
    achievementPoints: 1200
  },
  {
    id: "sacrifice_legendary",
    title: "Ultimate Sacrifice", 
    description: "You gave everything to save others.",
    longDescription: "When the moment came to choose between your own life and the lives of others, you didn't hesitate. Your sacrifice saved countless dragons, ended a great war, or prevented a terrible catastrophe. Though your story ended, your name became legend, inspiring dragons for generations to come.",
    category: "legendary",
    rarity: "legendary",
    check: (character) => character.age <= 50 && character.soulPercentage <= 10 && (character.dragonets || []).length > 0,
    achievementPoints: 1000
  },
  {
    id: "transcendence_legendary",
    title: "The Transcendent",
    description: "You achieved something beyond ordinary dragon existence.",
    longDescription: "Through your mastery of animus magic, profound wisdom, or extraordinary experiences, you transcended the normal boundaries of dragon existence. Whether you became something more than mortal or achieved a perfect balance between power and purity, you reached a state few dragons have ever imagined.",
    category: "legendary",
    rarity: "legendary",
    check: (character) => character.age >= 120 && character.soulCorruptionStage === "Normal" && character.achievements.length >= 25,
    achievementPoints: 1500
  }
];

export class EndingSystem {
  static determineEnding(character: Character): GameEnding | null {
    // Check for applicable endings, prioritizing by rarity and category
    const applicableEndings = GAME_ENDINGS.filter(ending => ending.check(character));
    
    if (applicableEndings.length === 0) return null;

    // Sort by priority: legendary > rare > common, victory > neutral > tragic
    const priority = (ending: GameEnding): number => {
      let score = 0;
      
      // Rarity bonus
      switch (ending.rarity) {
        case "legendary": score += 100; break;
        case "rare": score += 50; break;
        case "common": score += 10; break;
      }
      
      // Category bonus
      switch (ending.category) {
        case "legendary": score += 40; break;
        case "victory": score += 30; break;
        case "neutral": score += 20; break;
        case "tragic": score += 10; break;
      }
      
      return score;
    };

    // Return the highest priority ending
    return applicableEndings.sort((a, b) => priority(b) - priority(a))[0];
  }

  static getEndingSummary(character: Character, ending: GameEnding): {
    ending: GameEnding;
    finalStats: {
      age: number;
      soulPercentage: number;
      achievements: number;
      achievementScore: number;
      relationships: number;
      dragonets: number;
    };
    lifeSummary: string;
  } {
    const achievementScore = AchievementSystem.calculateAchievementScore(character);
    const relationships = Object.values(character.relationships || {}).filter(r => r.isAlive).length;
    
    let lifeSummary = `${character.name} the ${character.tribe}`;
    if (character.hybridTribes && character.hybridTribes.length > 1) {
      lifeSummary += ` (${character.hybridTribes.join("-")} Hybrid)`;
    }
    lifeSummary += ` lived ${character.age} years.`;
    
    if (character.mate) {
      lifeSummary += ` Bonded with ${character.mate}.`;
    }
    
    if (character.dragonets && character.dragonets.length > 0) {
      lifeSummary += ` Raised ${character.dragonets.length} dragonet${character.dragonets.length > 1 ? 's' : ''}.`;
    }

    return {
      ending,
      finalStats: {
        age: character.age,
        soulPercentage: character.soulPercentage,
        achievements: character.achievements.length,
        achievementScore,
        relationships,
        dragonets: character.dragonets ? character.dragonets.length : 0
      },
      lifeSummary
    };
  }

  static getAllPossibleEndings(): GameEnding[] {
    return GAME_ENDINGS;
  }

  static getEndingsByCategory(category: GameEnding["category"]): GameEnding[] {
    return GAME_ENDINGS.filter(e => e.category === category);
  }
}

export default EndingSystem;
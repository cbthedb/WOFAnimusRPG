import { MagicSpell, Character } from "@shared/schema";

export const ENHANCED_MAGIC_SPELLS: MagicSpell[] = [
  // Enchantment Spells
  {
    name: "Object Enchantment",
    category: "minor",
    type: "enchantment",
    soulCost: [1, 5],
    description: "Imbue objects with magical properties",
    examples: [
      "Make a pouch that never empties of coins",
      "Create a torch that burns without fuel",
      "Enchant armor to be lighter than air",
      "Make a scroll that rewrites itself"
    ]
  },
  {
    name: "Greater Enchantments", 
    category: "moderate",
    type: "enchantment",
    soulCost: [8, 15],
    description: "Create powerful magical artifacts",
    examples: [
      "Forge a sword that cuts through any material",
      "Create a crown that grants mind-reading",
      "Enchant a cloak of perfect invisibility",
      "Make a map that shows any location in real-time"
    ]
  },

  // Combat Magic
  {
    name: "Combat Enhancement",
    category: "minor", 
    type: "combat",
    soulCost: [2, 6],
    description: "Enhance fighting abilities temporarily",
    examples: [
      "Make your claws razor-sharp for one battle",
      "Grant yourself super-strength for an hour",
      "Create protective scales that deflect attacks",
      "Enhance your speed to blur-fast movement"
    ]
  },
  {
    name: "Battlefield Control",
    category: "major",
    type: "combat", 
    soulCost: [15, 25],
    description: "Control entire battlefields",
    examples: [
      "Create an army of animated stone warriors",
      "Turn enemy weapons against their wielders",
      "Summon walls of fire to divide armies",
      "Make the ground itself fight for you"
    ]
  },

  // Healing Magic
  {
    name: "Healing Touch",
    category: "minor",
    type: "healing",
    soulCost: [1, 4],
    description: "Cure injuries and ailments",
    examples: [
      "Instantly heal broken bones",
      "Cure diseases with a touch",
      "Restore lost blood and energy",
      "Heal mental trauma and nightmares"
    ]
  },
  {
    name: "Resurrection Magic",
    category: "catastrophic",
    type: "healing",
    soulCost: [40, 60],
    description: "Bring back the dead - ultimate taboo",
    examples: [
      "Restore life to a recently deceased dragon",
      "Resurrect ancient dragons from bones",
      "Create undead servants from corpses",
      "Grant immortality to yourself or others"
    ]
  },

  // Weather Control
  {
    name: "Weather Manipulation",
    category: "moderate",
    type: "weather",
    soulCost: [5, 12],
    description: "Control local weather patterns",
    examples: [
      "Summon lightning storms",
      "Create protective fog banks",
      "Bring rain to drought-stricken lands",
      "Freeze entire lakes solid"
    ]
  },
  {
    name: "Climate Control",
    category: "major",
    type: "weather", 
    soulCost: [20, 35],
    description: "Alter climate across vast regions",
    examples: [
      "End a kingdom-wide drought permanently",
      "Create endless winter across continents",
      "Summon hurricanes that last for years",
      "Make deserts bloom with eternal spring"
    ]
  },

  // Curse Magic
  {
    name: "Minor Curses",
    category: "minor",
    type: "curse",
    soulCost: [3, 8],
    description: "Inflict misfortune on enemies",
    examples: [
      "Make someone's words come out backwards",
      "Curse them to always tell the truth",
      "Give them nightmares every night",
      "Make their food taste like ash"
    ]
  },
  {
    name: "Devastating Curses",
    category: "major",
    type: "curse",
    soulCost: [18, 30],
    description: "Destroy lives with dark magic",
    examples: [
      "Curse an entire bloodline with madness",
      "Make someone age rapidly until death",
      "Turn enemies into mindless beasts",
      "Trap souls in eternal torment"
    ]
  },

  // Summoning Magic
  {
    name: "Creature Summoning",
    category: "moderate",
    type: "summoning",
    soulCost: [6, 14],
    description: "Call forth magical beings",
    examples: [
      "Summon a storm of deadly insects",
      "Create phantom dragons to fight for you",
      "Call forth spirits of the dead",
      "Manifest your fears as physical beings"
    ]
  },
  {
    name: "Planar Summoning",
    category: "catastrophic",
    type: "summoning",
    soulCost: [35, 50],
    description: "Tear holes between dimensions",
    examples: [
      "Summon demons from other realms",
      "Open portals to parallel worlds",
      "Call forth ancient cosmic entities",
      "Merge different realities together"
    ]
  }
];

export class SoulCorruptionManager {
  static getSoulCorruptionStage(soulPercentage: number): "Normal" | "Frayed" | "Twisted" | "Broken" {
    if (soulPercentage >= 75) return "Normal";
    if (soulPercentage >= 50) return "Frayed";
    if (soulPercentage >= 25) return "Twisted";
    return "Broken";
  }

  static getCorruptionEffects(stage: "Normal" | "Frayed" | "Twisted" | "Broken"): string[] {
    switch (stage) {
      case "Normal":
        return ["Your soul remains pure and unmarked by corruption."];
      case "Frayed":
        return [
          "Small cracks appear in your moral foundation.",
          "You occasionally have dark thoughts you never had before.",
          "Other dragons notice you seem more irritable lately."
        ];
      case "Twisted":
        return [
          "Your sense of right and wrong becomes murky.",
          "You find yourself enjoying others' pain.",
          "Friends begin to avoid you, sensing something wrong.",
          "You actively seek ways to gain power over others."
        ];
      case "Broken":
        return [
          "Your soul is beyond redemption.",
          "Cruelty and manipulation feel natural and right.",
          "You actively seek to corrupt other dragons.",
          "The AI will increasingly make choices for you.",
          "Your original personality is almost completely gone."
        ];
    }
  }

  static getCorruptionBehavior(stage: "Normal" | "Frayed" | "Twisted" | "Broken"): {
    aiControlChance: number;
    corruptionChoiceBonus: number;
    relationshipPenalty: number;
  } {
    switch (stage) {
      case "Normal":
        return { aiControlChance: 0, corruptionChoiceBonus: 0, relationshipPenalty: 0 };
      case "Frayed":
        return { aiControlChance: 0.1, corruptionChoiceBonus: 0.2, relationshipPenalty: -5 };
      case "Twisted":
        return { aiControlChance: 0.3, corruptionChoiceBonus: 0.4, relationshipPenalty: -15 };
      case "Broken":
        return { aiControlChance: 0.7, corruptionChoiceBonus: 0.8, relationshipPenalty: -30 };
    }
  }

  static shouldAITakeControl(character: Character): boolean {
    const stage = character.soulCorruptionStage;
    const behavior = this.getCorruptionBehavior(stage);
    return Math.random() < behavior.aiControlChance;
  }

  static getCorruptionVisualEffects(stage: "Normal" | "Frayed" | "Twisted" | "Broken"): {
    scaleColor: string;
    eyeColor: string;
    aura: string;
  } {
    switch (stage) {
      case "Normal":
        return { scaleColor: "natural", eyeColor: "bright", aura: "pure light" };
      case "Frayed":
        return { scaleColor: "slightly dulled", eyeColor: "flickering", aura: "dim shadows" };
      case "Twisted":
        return { scaleColor: "darkened edges", eyeColor: "cold and distant", aura: "creeping darkness" };
      case "Broken":
        return { scaleColor: "black veins throughout", eyeColor: "empty and void", aura: "consuming shadow" };
    }
  }
}

export function getMagicSpellsByType(type: MagicSpell["type"]): MagicSpell[] {
  return ENHANCED_MAGIC_SPELLS.filter(spell => spell.type === type);
}

export function getMagicSpellsByCategory(category: MagicSpell["category"]): MagicSpell[] {
  return ENHANCED_MAGIC_SPELLS.filter(spell => spell.category === category);
}

export function calculateSpellSoulCost(spell: MagicSpell): number {
  const [min, max] = spell.soulCost;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
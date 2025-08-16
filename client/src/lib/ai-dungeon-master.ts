import { Character, GameData, Scenario, Choice, PoliticalEvent, WarStatus, ExplorationEvent } from "@shared/schema";

export class AIDungeonMaster {
  static generateMoralDilemma(character: Character, gameData: GameData): Scenario {
    const dilemmas = [
      {
        title: "The Desperate Plea",
        setup: `A young dragonet approaches you with tears streaming down their scales. Their parent is trapped under a rockslide, and they beg you to use your animus magic to save them.`,
        choice1: "Use powerful magic to lift the rocks (15-25% soul cost)",
        choice2: "Try to help with physical strength and tools",
        choice3: "Find other dragons to help instead"
      },
      {
        title: "The Queen's Command",
        setup: `Your tribe's queen demands you enchant weapons for an upcoming war. She promises great honor but threatens exile if you refuse.`,
        choice1: "Enchant the weapons as commanded (10-20% soul cost)",
        choice2: "Refuse and face the consequences",
        choice3: "Offer a compromise - enchant defensive items instead"
      },
      {
        title: "The Corruption Temptation", 
        setup: `You discover a scroll detailing how to transfer your soul damage to another dragon. You could be pure again... but someone else would suffer.`,
        choice1: "Use the forbidden magic (restore 50% soul, gain corruption)",
        choice2: "Destroy the scroll and accept your fate",
        choice3: "Study it but don't use it... yet"
      }
    ];

    const dilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)];
    
    return {
      id: `ai_dilemma_${Date.now()}`,
      title: dilemma.title,
      description: "A moral choice that will test your character",
      narrativeText: [dilemma.setup],
      choices: [
        {
          id: "dilemma_1",
          text: dilemma.choice1,
          description: "The path of power, but at what cost?",
          soulCost: dilemma.choice1.includes("soul cost") ? Math.floor(Math.random() * 15) + 10 : 0,
          sanityCost: 0,
          consequences: ["Your choice will have lasting consequences..."],
          corruption: dilemma.choice1.includes("corruption")
        },
        {
          id: "dilemma_2", 
          text: dilemma.choice2,
          description: "The harder path, but perhaps the right one",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 5),
          consequences: ["Sometimes the right choice is the hardest one..."]
        },
        {
          id: "dilemma_3",
          text: dilemma.choice3,
          description: "A middle ground, but is it enough?",
          soulCost: dilemma.choice3.includes("enchant") ? Math.floor(Math.random() * 8) + 3 : 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Compromise can be wisdom, or cowardice..."]
        }
      ],
      type: 'extraordinary',
      location: gameData.location,
      timeOfDay: "afternoon",
      weather: "tense"
    };
  }

  static generateRandomDisaster(character: Character, gameData: GameData): Scenario {
    const disasters = [
      {
        title: "IceWing Raid",
        description: "IceWing warriors attack your settlement without warning!",
        choice1: "Fight them with tooth and claw",
        choice2: "Use animus magic to create defenses",
        choice3: "Try to negotiate or flee"
      },
      {
        title: "Earthquake at Jade Mountain",
        description: "The mountain shakes violently, threatening to collapse the academy!",
        choice1: "Use magic to stabilize the mountain",
        choice2: "Help evacuate other dragons",
        choice3: "Protect yourself and escape"
      },
      {
        title: "Disease Outbreak",
        description: "A mysterious illness spreads through your tribe, weakening dragons rapidly.",
        choice1: "Enchant a cure using animus magic",
        choice2: "Search for natural remedies",
        choice3: "Isolate yourself to avoid infection"
      }
    ];

    const disaster = disasters[Math.floor(Math.random() * disasters.length)];

    return {
      id: `ai_disaster_${Date.now()}`,
      title: disaster.title,
      description: "A sudden crisis tests your resolve",
      narrativeText: [
        disaster.description,
        "The situation is dire and demands immediate action. What do you do?"
      ],
      choices: [
        {
          id: "disaster_1",
          text: disaster.choice1,
          description: "Take direct action",
          soulCost: disaster.choice1.includes("magic") ? Math.floor(Math.random() * 12) + 5 : 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Your brave action will be remembered..."]
        },
        {
          id: "disaster_2",
          text: disaster.choice2, 
          description: "Help others without magic",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 2),
          consequences: ["Sometimes the hardest path is the most noble..."]
        },
        {
          id: "disaster_3",
          text: disaster.choice3,
          description: "Look out for yourself",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 5) + 2,
          consequences: ["Self-preservation, but at what cost to your conscience?"],
          corruption: true
        }
      ],
      type: 'extraordinary',
      location: gameData.location,
      timeOfDay: "crisis",
      weather: "chaotic"
    };
  }

  static generatePersonalConsequence(character: Character): string[] {
    const stage = character.soulCorruptionStage;
    const consequences = [];

    switch (stage) {
      case "Frayed":
        consequences.push("Your soul corruption manifests as sudden mood swings.");
        consequences.push("You snap at a friend without meaning to.");
        consequences.push("Other dragons notice you seem... different lately.");
        break;
      case "Twisted":
        consequences.push("The corruption darkens your thoughts constantly.");
        consequences.push("You find yourself enjoying others' misfortune.");
        consequences.push("Your friends begin to distance themselves from you.");
        break;
      case "Broken":
        consequences.push("Your soul is so damaged that cruelty feels natural.");
        consequences.push("You actively seek ways to cause pain or gain power.");
        consequences.push("The dragon you once were seems like a distant memory.");
        break;
      default:
        consequences.push("You maintain your moral compass for now.");
    }

    return consequences;
  }

  static generateTribePolitics(character: Character): PoliticalEvent {
    const politicalEvents = [
      {
        type: "succession" as const,
        tribes: [character.tribe],
        description: `The current ${character.tribe} queen is aging, and two of her daughters vie for the throne. Both seek your support.`,
        consequences: "Your choice of successor will shape your tribe's future."
      },
      {
        type: "civil_war" as const,
        tribes: [character.tribe],
        description: `A faction within the ${character.tribe} tribe rebels against the queen's leadership, claiming she has grown weak.`,
        consequences: "Civil war threatens to tear your tribe apart."
      },
      {
        type: "queen_demand" as const,
        tribes: [character.tribe],
        description: `Queen ${character.tribe === "SandWing" ? "Thorn" : "Glacier"} demands you use your animus magic to create a powerful artifact for the royal treasury.`,
        consequences: "Defying a queen's direct order carries severe penalties."
      }
    ];

    return politicalEvents[Math.floor(Math.random() * politicalEvents.length)];
  }

  static generateWarEvent(character: Character): WarStatus {
    const possibleEnemies = ["SkyWings", "IceWings", "SandWings", "MudWings"];
    const enemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
    
    return {
      isAtWar: true,
      warringTribes: [character.tribe, enemy],
      warCause: Math.random() < 0.5 ? "territorial dispute" : "succession conflict",
      playerInvolvement: "forced_fighter"
    };
  }

  static generateExploration(character: Character): ExplorationEvent {
    const locations = [
      "Ancient NightWing ruins",
      "Abandoned SkyWing palace",
      "Deep underwater caves",
      "Hidden RainWing sanctuary",
      "Mysterious ice caverns"
    ];

    const discoveries = [
      { type: "ruins" as const, desc: "You discover ancient dragon artifacts and mysterious carvings." },
      { type: "scroll" as const, desc: "A weathered scroll contains forgotten animus spells." },
      { type: "treasure" as const, desc: "A cache of precious gems and ancient coins." },
      { type: "enemy" as const, desc: "Hostile dragons have made this place their lair." },
      { type: "ally" as const, desc: "A lost dragon seeks your help to return home." }
    ];

    const location = locations[Math.floor(Math.random() * locations.length)];
    const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];

    return {
      location,
      discovery: discovery.type,
      description: discovery.desc,
      consequences: [`Your discovery at ${location} will have lasting effects.`]
    };
  }

  static generateAnimusTemptation(character: Character): Choice {
    const temptations = [
      {
        text: "Enchant this ring to make everyone love you",
        soulCost: 15,
        desc: "The easy path to popularity... but is it real?"
      },
      {
        text: "Create a spell to eliminate all your enemies",
        soulCost: 25,
        desc: "Power to remove obstacles... permanently."
      },
      {
        text: "Enchant yourself to never feel pain or sadness again",
        soulCost: 20,
        desc: "Emotional numbness might seem like peace."
      }
    ];

    const temptation = temptations[Math.floor(Math.random() * temptations.length)];

    return {
      id: "ai_temptation",
      text: temptation.text,
      description: temptation.desc,
      soulCost: temptation.soulCost,
      sanityCost: 0,
      consequences: ["The easy path often leads to darkness..."],
      corruption: true
    };
  }
}
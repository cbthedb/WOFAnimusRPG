import { Character, GameData, Scenario, Choice, PoliticalEvent, WarStatus, ExplorationEvent, InventoryItem } from "@shared/schema";

export class AIDungeonMaster {
  // Dynamic scenario generation categories
  private static scenarioTypes = [
    "moral_dilemma", "random_disaster", "tribal_politics", "romance_encounter", 
    "exploration_discovery", "animus_temptation", "war_conflict", "social_interaction",
    "mystery_event", "magical_phenomenon", "family_drama", "prophecy_vision"
  ];

  private static randomElements = {
    locations: [
      "Jade Mountain Academy", "Queen's Palace", "Ancient Ruins", "Tribal Border",
      "Mysterious Cave", "Sacred Grove", "War Camp", "Peaceful Village",
      "Abandoned Castle", "Underground Tunnels", "Mountain Peak", "Desert Oasis"
    ],
    weather: [
      "thunderstorm brewing", "eerily calm", "swirling mists", "blazing hot",
      "freezing cold", "perfect clear skies", "strange aurora", "unnatural darkness"
    ],
    timeOfDay: [
      "dawn breaking", "high noon", "sunset", "midnight", "pre-dawn", "twilight"
    ],
    characters: [
      "mysterious stranger", "old prophecy keeper", "young dragonet", "tribal leader",
      "wounded warrior", "wise elder", "suspicious merchant", "lost traveler"
    ],
    objects: [
      "glowing scroll", "ancient artifact", "magical gem", "cursed weapon",
      "prophetic mirror", "talking statue", "enchanted book", "mysterious egg"
    ]
  };

  static generateRandomScenario(character: Character, gameData: GameData): Scenario {
    // Filter scenario types based on character abilities
    let availableScenarios = this.scenarioTypes.filter(type => {
      // Don't show animus scenarios to non-animus dragons
      if (type === "animus_temptation" && !character.isAnimus) {
        return false;
      }
      return true;
    });

    const scenarioType = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    
    switch (scenarioType) {
      case "moral_dilemma":
        return this.generateMoralDilemma(character, gameData);
      case "random_disaster":
        return this.generateRandomDisaster(character, gameData);
      case "tribal_politics":
        return this.generateTribalPoliticsScenario(character, gameData);
      case "romance_encounter":
        return this.generateRomanceEncounter(character, gameData);
      case "exploration_discovery":
        return this.generateExplorationScenario(character, gameData);
      case "animus_temptation":
        return this.generateAnimusTemptationScenario(character, gameData);
      case "war_conflict":
        return this.generateWarScenario(character, gameData);
      case "social_interaction":
        return this.generateSocialScenario(character, gameData);
      case "mystery_event":
        return this.generateMysteryScenario(character, gameData);
      case "magical_phenomenon":
        return this.generateMagicalPhenomenon(character, gameData);
      case "family_drama":
        return this.generateFamilyDrama(character, gameData);
      case "prophecy_vision":
        return this.generateProphecyVision(character, gameData);
      default:
        return this.generateMoralDilemma(character, gameData);
    }
  }

  private static getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
  static generateMoralDilemma(character: Character, gameData: GameData): Scenario {
    // Generate dynamic moral dilemma
    const victim = this.getRandomElement(["young dragonet", "injured elder", "pregnant dragon", "enemy soldier", "tribal outcast"]);
    const threat = this.getRandomElement(["rockslide", "disease", "curse", "war wound", "magical poison"]);
    const location = this.getRandomElement(this.randomElements.locations);
    const weather = this.getRandomElement(this.randomElements.weather);
    
    // Generate different solutions based on whether character is animus or not
    const magicSolution = character.isAnimus ? this.getRandomElement([
      "heal them instantly with animus magic",
      "enchant an object to save them",
      "use magic to turn back time",
      "transfer their suffering to yourself",
      "create a magical barrier"
    ]) : this.getRandomElement([
      "use your tribal powers to help",
      "attempt magical healing with tribal abilities",
      "try to channel natural magic",
      "use elemental powers to assist",
      "rely on instinctual magical abilities"
    ]);
    
    const nonMagicSolution = this.getRandomElement([
      "try conventional healing methods",
      "seek help from other dragons",
      "use your tribal powers instead",
      "find a natural remedy",
      "attempt a risky rescue"
    ]);
    
    const moralChoice = this.getRandomElement([
      "leave them to their fate",
      "make them prove they deserve help",
      "demand payment for your aid",
      "use this as a learning experience",
      "find a creative compromise"
    ]);

    const dilemmas = [
      {
        title: `Crisis at ${location}`,
        setup: `During a ${weather} day at ${location}, you encounter a ${victim} suffering from ${threat}. They desperately plead for your help, but the situation is complex and morally challenging.`,
        choice1: magicSolution,
        choice2: nonMagicSolution,
        choice3: moralChoice
      }
    ];

    const dilemma = dilemmas[0]; // Use the dynamically generated dilemma
    
    return {
      id: `ai_dilemma_${Date.now()}`,
      title: dilemma.title,
      description: "A moral choice that will test your character",
      narrativeText: [dilemma.setup],
      choices: [
        {
          id: "dilemma_1",
          text: character.isAnimus ? dilemma.choice1 + " (10-25% soul cost)" : dilemma.choice1,
          description: character.isAnimus ? "The path of power, but at what cost?" : "Use your natural abilities to help",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 15) + 10 : 0,
          sanityCost: character.isAnimus ? 0 : Math.floor(Math.random() * 5),
          consequences: ["Your choice will have lasting consequences..."],
          corruption: false
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
    // Generate dynamic disaster
    const disasterType = this.getRandomElement(["tribal raid", "natural disaster", "magical catastrophe", "disease outbreak", "beast attack"]);
    const location = this.getRandomElement(this.randomElements.locations);
    const weather = this.getRandomElement(this.randomElements.weather);
    const tribe = this.getRandomElement(["IceWings", "SkyWings", "SandWings", "SeaWings", "MudWings"]);
    
    let title, description, magicResponse, physicalResponse, escapeResponse;
    
    switch (disasterType) {
      case "tribal raid":
        title = `${tribe} Raid on ${location}`;
        description = `During ${weather} conditions, ${tribe} warriors launch a surprise attack on ${location}!`;
        magicResponse = "Use animus magic to create powerful defenses";
        physicalResponse = "Fight them with traditional combat skills";
        escapeResponse = "Try to negotiate or find an escape route";
        break;
      case "natural disaster":
        const disaster = this.getRandomElement(["earthquake", "volcanic eruption", "tsunami", "avalanche", "hurricane"]);
        title = `${disaster.charAt(0).toUpperCase() + disaster.slice(1)} at ${location}`;
        description = `A devastating ${disaster} strikes ${location} during ${weather} conditions!`;
        magicResponse = "Use magic to control or stop the disaster";
        physicalResponse = "Help rescue and evacuate other dragons";
        escapeResponse = "Focus on protecting yourself and escape";
        break;
      default:
        title = "Mysterious Crisis";
        description = `An unknown threat emerges at ${location} during ${weather} conditions.`;
        magicResponse = "Use animus magic to investigate and respond";
        physicalResponse = "Approach the situation cautiously";
        escapeResponse = "Avoid the situation entirely";
    }

    const disasters = [
      {
        title,
        description,
        choice1: magicResponse,
        choice2: physicalResponse,
        choice3: escapeResponse
      }
    ];

    const disaster = disasters[0]; // Use the dynamically generated disaster

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

  static generateTribalPoliticsScenario(character: Character, gameData: GameData): Scenario {
    const politicalEvent = this.generateTribePolitics(character);
    const location = this.getRandomElement(this.randomElements.locations);
    const weather = this.getRandomElement(this.randomElements.weather);
    
    return {
      id: `political_${Date.now()}`,
      title: `${politicalEvent.type.replace('_', ' ').toUpperCase()}: ${politicalEvent.tribes.join(' vs ')}`,
      description: "Political turmoil threatens the stability of your tribe",
      narrativeText: [
        `At ${location} during ${weather} conditions...`,
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

  static generateRomanceEncounter(character: Character, gameData: GameData): Scenario {
    const potentialPartner = this.getRandomElement(this.randomElements.characters);
    const location = this.getRandomElement(this.randomElements.locations);
    const weather = this.getRandomElement(this.randomElements.weather);
    
    const romanticSituations = [
      "approaches you with obvious romantic interest",
      "asks you to be their mate during a tribal ceremony",
      "confesses their feelings under the stars",
      "challenges you to prove your worthiness as a partner",
      "offers to share a nest with you"
    ];
    
    const situation = this.getRandomElement(romanticSituations);
    
    return {
      id: `romance_${Date.now()}`,
      title: "Matters of the Heart",
      description: "Romance blooms in unexpected places",
      narrativeText: [
        `At ${location} during ${weather} conditions, a ${potentialPartner} ${situation}.`,
        "Your heart races as you consider how to respond.",
        "This could be the beginning of something beautiful... or complicated."
      ],
      choices: [
        {
          id: "romance_accept",
          text: "Accept their romantic advances",
          description: "Open your heart to love",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["Love can bring great joy... and great vulnerability"]
        },
        {
          id: "romance_cautious",
          text: "Be cautious but interested",
          description: "Take things slowly",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["A careful approach to matters of the heart"]
        },
        {
          id: "romance_reject",
          text: "Politely decline their advances",
          description: "Focus on other priorities",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 2),
          consequences: ["Sometimes the heart must wait for duty"]
        }
      ],
      type: 'mundane',
      location: gameData.location,
      timeOfDay: this.getRandomElement(this.randomElements.timeOfDay),
      weather
    };
  }

  static generateExplorationScenario(character: Character, gameData: GameData): Scenario {
    const exploration = this.generateExploration(character);
    const mysteriousObject = this.getRandomElement(this.randomElements.objects);
    
    return {
      id: `exploration_${Date.now()}`,
      title: `Discovery at ${exploration.location}`,
      description: "Adventure calls from unknown places",
      narrativeText: [
        `While exploring ${exploration.location}, you make an unexpected discovery:`,
        exploration.description,
        `Among the findings, you notice a ${mysteriousObject} that seems important.`,
        "What do you do with this discovery?"
      ],
      choices: [
        {
          id: "explore_investigate",
          text: `Investigate the ${mysteriousObject} thoroughly`,
          description: "Knowledge is power, but can be dangerous",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Curiosity reveals both wonders and dangers..."]
        },
        {
          id: "explore_magic",
          text: character.isAnimus ? "Use animus magic to understand the discovery" : "Use your natural abilities to understand the discovery",
          description: character.isAnimus ? "Magic can reveal hidden secrets" : "Your abilities can reveal hidden secrets",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 8) + 3 : 0,
          sanityCost: character.isAnimus ? 0 : Math.floor(Math.random() * 5) + 1,
          consequences: ["Deeper understanding reveals truths that some would keep hidden..."]
        },
        {
          id: "explore_leave",
          text: "Leave the area undisturbed",
          description: "Some things are better left alone",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["Wisdom sometimes lies in restraint..."]
        }
      ],
      type: 'extraordinary',
      location: exploration.location,
      timeOfDay: this.getRandomElement(this.randomElements.timeOfDay),
      weather: this.getRandomElement(this.randomElements.weather)
    };
  }

  static generateAnimusTemptationScenario(character: Character, gameData: GameData): Scenario {
    const temptation = this.generateAnimusTemptation(character);
    const location = this.getRandomElement(this.randomElements.locations);
    
    return {
      id: `temptation_${Date.now()}`,
      title: "The Whisper of Power",
      description: "Easy solutions call to your animus magic",
      narrativeText: [
        `At ${location}, you face a situation where animus magic offers an easy solution.`,
        "A voice in your mind suggests a simple spell that would solve everything.",
        `You could ${temptation.text.toLowerCase()}, but at what cost?`
      ],
      choices: [
        {
          id: "temptation_give_in",
          text: temptation.text,
          description: temptation.description,
          soulCost: temptation.soulCost,
          sanityCost: 0,
          consequences: temptation.consequences,
          corruption: temptation.corruption
        },
        {
          id: "temptation_resist",
          text: "Resist the temptation",
          description: "Find a harder but more ethical solution",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Virtue is its own reward, though the path is harder..."]
        },
        {
          id: "temptation_compromise",
          text: "Find a middle ground",
          description: "Use minimal magic for a partial solution",
          soulCost: Math.floor(temptation.soulCost / 2),
          sanityCost: Math.floor(Math.random() * 2),
          consequences: ["Sometimes compromise serves both ethics and necessity..."]
        }
      ],
      type: 'magical',
      location: gameData.location,
      timeOfDay: this.getRandomElement(this.randomElements.timeOfDay),
      weather: this.getRandomElement(this.randomElements.weather)
    };
  }

  static generateWarScenario(character: Character, gameData: GameData): Scenario {
    const warEvent = this.generateWarEvent(character);
    const location = this.getRandomElement(this.randomElements.locations);
    
    return {
      id: `war_${Date.now()}`,
      title: `War Between ${warEvent.warringTribes.join(' and ')}`,
      description: "Conflict engulfs the dragon lands",
      narrativeText: [
        `War has broken out between ${warEvent.warringTribes.join(' and ')} over ${warEvent.warCause}.`,
        `The battle has reached ${location}, and you find yourself caught in the middle.`,
        character.isAnimus ? "As an animus dragon, both sides want you as an ally. What do you do?" : "Both sides want you as an ally. What do you do?"
      ],
      choices: [
        {
          id: "war_join",
          text: `Join the ${character.tribe} forces`,
          description: "Fight for your tribe's cause",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 5) + 2,
          consequences: ["War changes everyone it touches..."]
        },
        {
          id: "war_magic",
          text: character.isAnimus ? "Use animus magic to end the conflict" : "Use your abilities to mediate the conflict",
          description: character.isAnimus ? "Force peace through magical means" : "Try to find a peaceful solution",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 15) + 10 : 0,
          sanityCost: character.isAnimus ? 0 : Math.floor(Math.random() * 8) + 3,
          consequences: ["Peace through force may not be true peace..."]
        },
        {
          id: "war_flee",
          text: "Flee from the conflict",
          description: "Avoid the war entirely",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 8) + 3,
          consequences: ["Some call it cowardice, others call it wisdom..."],
          corruption: true
        }
      ],
      type: 'extraordinary',
      location: gameData.location,
      timeOfDay: "battlefield",
      weather: "smoke and fire"
    };
  }

  static generateSocialScenario(character: Character, gameData: GameData): Scenario {
    const socialSituation = this.getRandomElement([
      "tribal gathering", "celebration feast", "formal ceremony", "casual meeting", "heated argument"
    ]);
    const otherDragon = this.getRandomElement(this.randomElements.characters);
    const location = this.getRandomElement(this.randomElements.locations);
    
    return {
      id: `social_${Date.now()}`,
      title: `${socialSituation} at ${location}`,
      description: "Social dynamics shape your reputation",
      narrativeText: [
        `During a ${socialSituation} at ${location}, you encounter a ${otherDragon}.`,
        "The interaction could strengthen or damage your social standing.",
        "How do you handle this social situation?"
      ],
      choices: [
        {
          id: "social_charm",
          text: "Use your natural charisma",
          description: "Rely on social skills",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["Genuine charm opens many doors..."]
        },
        {
          id: "social_magic",
          text: character.isAnimus ? "Subtly use animus magic to influence them" : "Use your natural abilities to connect with them",
          description: character.isAnimus ? "Magical manipulation" : "Natural empathy and understanding",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 5) + 2 : 0,
          sanityCost: character.isAnimus ? 0 : Math.floor(Math.random() * 2),
          consequences: character.isAnimus ? ["False friendship built on magic is hollow..."] : ["Genuine connection builds lasting relationships..."],
          corruption: character.isAnimus ? true : false
        },
        {
          id: "social_honest",
          text: "Be completely honest and direct",
          description: "Straightforward approach",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 2),
          consequences: ["Honesty is not always appreciated, but it is always valuable..."]
        }
      ],
      type: 'mundane',
      location: gameData.location,
      timeOfDay: this.getRandomElement(this.randomElements.timeOfDay),
      weather: this.getRandomElement(this.randomElements.weather)
    };
  }

  static generateMysteryScenario(character: Character, gameData: GameData): Scenario {
    const mysteriousEvent = this.getRandomElement([
      "strange lights in the sky", "mysterious disappearances", "unexplained sounds", "time distortions", "reality glitches"
    ]);
    const location = this.getRandomElement(this.randomElements.locations);
    const mysteriousObject = this.getRandomElement(this.randomElements.objects);
    
    return {
      id: `mystery_${Date.now()}`,
      title: `The Mystery of ${location}`,
      description: "Strange occurrences defy explanation",
      narrativeText: [
        `At ${location}, you witness ${mysteriousEvent}.`,
        `Near the phenomenon, you discover a ${mysteriousObject} that seems connected to the mystery.`,
        "The situation defies logical explanation. What do you do?"
      ],
      choices: [
        {
          id: "mystery_investigate",
          text: "Investigate the mystery thoroughly",
          description: "Seek the truth behind the phenomenon",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 4) + 1,
          consequences: ["Some mysteries are better left unsolved..."]
        },
        {
          id: "mystery_magic",
          text: "Use animus magic to understand the phenomenon",
          description: "Magical investigation",
          soulCost: Math.floor(Math.random() * 10) + 5,
          sanityCost: 0,
          consequences: ["Magic reveals truths that mortal minds cannot grasp..."]
        },
        {
          id: "mystery_avoid",
          text: "Avoid the area and warn others",
          description: "Prudent caution",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Sometimes wisdom lies in knowing when to walk away..."]
        }
      ],
      type: 'extraordinary',
      location: gameData.location,
      timeOfDay: this.getRandomElement(this.randomElements.timeOfDay),
      weather: "unnaturally still"
    };
  }

  static generateMagicalPhenomenon(character: Character, gameData: GameData): Scenario {
    const phenomenon = this.getRandomElement([
      "magic storm", "reality rift", "temporal anomaly", "dimensional portal", "magical plague"
    ]);
    const location = this.getRandomElement(this.randomElements.locations);
    
    return {
      id: `magical_${Date.now()}`,
      title: `${phenomenon} at ${location}`,
      description: "Magical forces beyond comprehension",
      narrativeText: [
        `A ${phenomenon} has manifested at ${location}.`,
        "The magical energies are chaotic and dangerous.",
        character.isAnimus ? "As an animus dragon, you can sense the power involved. What do you do?" : "You can sense something powerful and dangerous here. What do you do?"
      ],
      choices: [
        {
          id: "phenomenon_absorb",
          text: character.isAnimus ? "Try to absorb the magical energy" : "Try to resist the magical influence",
          description: character.isAnimus ? "Risky but potentially powerful" : "Protect yourself from the dangerous energy",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 20) + 5 : 0,
          sanityCost: Math.floor(Math.random() * 10) + 5,
          consequences: ["Power always comes with a price..."]
        },
        {
          id: "phenomenon_dispel",
          text: character.isAnimus ? "Use animus magic to dispel the phenomenon" : "Use your tribal powers to counter the phenomenon",
          description: "Attempt to restore normalcy",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 15) + 8 : 0,
          sanityCost: character.isAnimus ? 0 : Math.floor(Math.random() * 8) + 2,
          consequences: ["Sometimes the cure is worse than the disease..."]
        },
        {
          id: "phenomenon_study",
          text: "Study the phenomenon from a safe distance",
          description: "Cautious observation",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["Knowledge gained safely is knowledge kept..."]
        }
      ],
      type: 'magical',
      location: gameData.location,
      timeOfDay: "time seems irrelevant",
      weather: "reality flickers"
    };
  }

  static generateFamilyDrama(character: Character, gameData: GameData): Scenario {
    const familyMember = this.getRandomElement([
      "your mother", "your father", "a sibling", "your mate", "a dragonet"
    ]);
    const drama = this.getRandomElement([
      "reveals a dark secret", "asks for a dangerous favor", "betrays your trust", "falls gravely ill", "gets into serious trouble"
    ]);
    const location = this.getRandomElement(this.randomElements.locations);
    
    return {
      id: `family_${Date.now()}`,
      title: "Family Bonds Tested",
      description: "Blood ties bring both joy and sorrow",
      narrativeText: [
        `At ${location}, ${familyMember} ${drama}.`,
        "The situation tests the bonds of family loyalty.",
        "Your response will define your relationship forever."
      ],
      choices: [
        {
          id: "family_support",
          text: "Support your family member unconditionally",
          description: "Family comes first",
          soulCost: 0,
          sanityCost: 0,
          consequences: ["Family loyalty is both a strength and a burden..."]
        },
        {
          id: "family_magic",
          text: "Use animus magic to help them",
          description: "Magical intervention",
          soulCost: Math.floor(Math.random() * 12) + 5,
          sanityCost: 0,
          consequences: ["Magic can heal wounds but creates new ones..."]
        },
        {
          id: "family_distance",
          text: "Distance yourself from the situation",
          description: "Protect yourself first",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 8) + 3,
          consequences: ["Sometimes love means letting go..."],
          corruption: true
        }
      ],
      type: 'mundane',
      location: gameData.location,
      timeOfDay: this.getRandomElement(this.randomElements.timeOfDay),
      weather: this.getRandomElement(this.randomElements.weather)
    };
  }

  static generateProphecyVision(character: Character, gameData: GameData): Scenario {
    const prophecySubject = this.getRandomElement([
      "the fall of a great queen", "a war that will consume all tribes", "your own dark future", 
      "the birth of a legendary dragon", "the end of animus magic", "a great catastrophe"
    ]);
    const visionTrigger = this.getRandomElement([
      "a mysterious dream", "touching an ancient artifact", "a sudden flash of insight", 
      "a magical accident", "communion with spirits"
    ]);
    
    return {
      id: `prophecy_${Date.now()}`,
      title: "Visions of Tomorrow",
      description: "The future reveals itself in fragments",
      narrativeText: [
        `Through ${visionTrigger}, you receive a prophetic vision about ${prophecySubject}.`,
        "The vision is vivid and disturbing, showing events that may come to pass.",
        "What do you do with this glimpse into the future?"
      ],
      choices: [
        {
          id: "prophecy_act",
          text: "Act immediately to change the future",
          description: "Try to prevent or fulfill the prophecy",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 5) + 2,
          consequences: ["Changing fate often leads to unexpected consequences..."]
        },
        {
          id: "prophecy_magic",
          text: character.isAnimus ? "Use animus magic to explore the vision further" : "Use your intuition to understand the vision",
          description: character.isAnimus ? "Seek more details about the prophecy" : "Trust your natural instincts about the vision",
          soulCost: character.isAnimus ? Math.floor(Math.random() * 8) + 4 : 0,
          sanityCost: character.isAnimus ? 0 : Math.floor(Math.random() * 5) + 2,
          consequences: ["Some knowledge comes at too high a price..."]
        },
        {
          id: "prophecy_ignore",
          text: "Ignore the vision and focus on the present",
          description: "Live in the moment",
          soulCost: 0,
          sanityCost: Math.floor(Math.random() * 3),
          consequences: ["The future will unfold as it will, regardless of prophecy..."]
        }
      ],
      type: 'prophetic',
      location: gameData.location,
      timeOfDay: "vision time",
      weather: "ethereal"
    };
  }
}
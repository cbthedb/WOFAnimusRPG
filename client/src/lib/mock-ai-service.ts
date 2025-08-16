// Mock AI Service - Generates contextually-aware random content for Wings of Fire RPG
// No API keys required - uses local logic and lore knowledge

export interface AIResponse {
  content: string;
  mood?: 'mysterious' | 'ominous' | 'hopeful' | 'dramatic' | 'neutral';
}

export class MockAIService {
  private static wingsOfFireTribes = [
    'MudWing', 'SandWing', 'SkyWing', 'SeaWing', 'IceWing', 'RainWing', 'NightWing',
    'SilkWing', 'HiveWing', 'LeafWing'
  ];

  private static prophecyTemplates = [
    "When {element} meets {element2}, the {creature} shall {action}",
    "In the {time} of {event}, {number} dragons will {action} the {object}",
    "The {tribe} dragon with {trait} eyes will {action} when {condition}",
    "From {location} to {location2}, the path of {concept} shall be {adjective}",
    "When the {celestial} {action2} above {location}, {consequence} will follow"
  ];

  private static visionTemplates = [
    "You see {location} shrouded in {weather}, where {character} {action} a {object}",
    "A flash of {color} light reveals {number} dragons {action} near {landmark}",
    "In your vision, {tribe} dragons are {action} while {event} unfolds",
    "The image shows {character} holding {object} as {weather} approaches {location}",
    "You witness {event} happening at {location} under a {celestial} sky"
  ];

  private static objectDescriptions = {
    scroll: [
      "This ancient scroll bears the seal of {tribe} royalty, its edges singed with age",
      "Mysterious runes dance along this parchment, glowing faintly in moonlight",
      "A prophecy scroll that seems to whisper secrets when the wind touches it"
    ],
    gem: [
      "A {color} gemstone that pulses with inner fire, warm to the touch",
      "This crystalline stone seems to contain swirling {element} energy",
      "A rare gem that {tribe} dragons once used in their most sacred ceremonies"
    ],
    weapon: [
      "An {material} weapon forged in the volcanic depths of the {tribe} kingdom",
      "This blade hums with power, its edge sharp enough to cut through scales",
      "A legendary weapon that once belonged to a {adjective} {tribe} hero"
    ],
    armor: [
      "Scales of fallen {tribe} warriors woven into protective armor",
      "This armor bears battle scars from the great {event} war",
      "Enchanted protection that grows stronger with each victory"
    ],
    artifact: [
      "A mysterious relic from the time before the {tribe} tribes were divided",
      "This ancient artifact pulses with {element} magic",
      "A sacred object that {tribe} shamans used to commune with spirits"
    ]
  };

  private static powerUsageScenarios = {
    fire: [
      "The cavern is blocked by ice - your fire could melt a path through",
      "Enemy dragons approach in the darkness - illuminate and intimidate them",
      "A fellow dragon is trapped in freezing water - warm them to safety"
    ],
    ice: [
      "The ground is unstable - freeze it solid to create safe passage",
      "Pursuers are gaining on you - create an ice barrier to slow them",
      "A forest fire threatens innocents - help contain the flames"
    ],
    electricity: [
      "Ancient mechanisms need power to activate the door",
      "Storm clouds gather - channel lightning to charge your scales",
      "Communication crystals are dead - energize them with your spark"
    ],
    water: [
      "The desert crossing ahead looks treacherous without water",
      "Toxic fumes fill the air - create a water shield to breathe safely",
      "Injured dragons need healing - pure water accelerates recovery"
    ],
    earth: [
      "The mountain path has collapsed - reshape the stone to continue",
      "Enemies corner you in open ground - raise earth walls for protection",
      "Hidden treasures lie beneath - sense valuable metals underground"
    ],
    mind_reading: [
      "The suspicious dragon claims innocence - read their true intentions",
      "Multiple paths lie ahead - probe nearby minds for the safest route",
      "Negotiations have stalled - understand what your opponent really wants"
    ],
    prophecy: [
      "Dark times approach - seek visions of what's to come",
      "An important decision looms - glimpse the consequences of each choice",
      "Ancient mysteries surround you - divine the truth from the past"
    ],
    camouflage: [
      "Guards patrol the forbidden area - slip past unseen",
      "Dangerous predators hunt nearby - become invisible to their eyes",
      "Diplomatic mission requires stealth - infiltrate without detection"
    ]
  };

  private static elements = ['fire', 'ice', 'lightning', 'earth', 'water', 'wind', 'shadow', 'light'];
  private static colors = ['crimson', 'azure', 'golden', 'emerald', 'violet', 'silver', 'obsidian', 'pearl'];
  private static materials = ['steel', 'obsidian', 'diamond', 'dragonbone', 'moonstone', 'starsilver'];
  private static adjectives = ['legendary', 'cursed', 'blessed', 'ancient', 'mystical', 'powerful', 'forgotten'];
  private static locations = ['Jade Mountain', 'Possibility', 'Diamond Falls', 'Burn\'s Palace', 'Ruins of the Palace', 'The Scorpion Den'];
  private static events = ['War of SandWing Succession', 'Great Ice Storm', 'Plague of the Red Death', 'Dragon Rebellion'];
  private static celestials = ['moon', 'sun', 'stars', 'eclipse', 'aurora'];
  private static weather = ['storm clouds', 'mist', 'sandstorm', 'blizzard', 'gentle rain', 'scorching heat'];

  static generateObjectDescription(itemName: string, context?: any): AIResponse {
    const seed = this.createSeed(itemName + (context?.turn || 0));
    const type = this.determineObjectType(itemName) as keyof typeof this.objectDescriptions;
    const templates = this.objectDescriptions[type] || this.objectDescriptions.artifact;
    
    const template = templates[seed % templates.length];
    const description = this.fillTemplate(template, seed);
    
    return {
      content: description,
      mood: 'mysterious'
    };
  }

  static generateProphecy(character: any, context?: any): AIResponse {
    const seed = this.createSeed(character.name + character.tribe + (context?.turn || 0));
    const template = this.prophecyTemplates[seed % this.prophecyTemplates.length];
    const prophecy = this.fillTemplate(template, seed);
    
    return {
      content: `The visions swirl before you: "${prophecy}"`,
      mood: 'ominous'
    };
  }

  static generateVision(character: any, context?: any): AIResponse {
    const seed = this.createSeed(character.name + 'vision' + (context?.turn || 0));
    const template = this.visionTemplates[seed % this.visionTemplates.length];
    const vision = this.fillTemplate(template, seed);
    
    return {
      content: `Your mind's eye reveals: ${vision}`,
      mood: 'mysterious'
    };
  }

  static generatePowerUsageOptions(power: string, context?: any): string[] {
    const scenarios = this.powerUsageScenarios[power as keyof typeof this.powerUsageScenarios] || this.powerUsageScenarios.fire;
    const seed = this.createSeed(power + (context?.turn || 0));
    
    // Return 2-3 random scenarios
    const shuffled = this.shuffle([...scenarios], seed);
    return shuffled.slice(0, 2 + (seed % 2));
  }

  static generateRandomEvent(character: any, gameData: any): AIResponse {
    const seed = this.createSeed(character.name + gameData.turn + 'event');
    const events = [
      "A mysterious {tribe} dragon approaches with urgent news about {event}",
      "Strange {weather} brings {adjective} omens to {location}",
      "You discover {object} hidden in the ruins, but {consequence}",
      "Tribal politics shift as {tribe} dragons {action} against {tribe2}",
      "The {celestial} reveals secrets about your {trait} heritage"
    ];
    
    const template = events[seed % events.length];
    const event = this.fillTemplate(template, seed);
    
    return {
      content: event,
      mood: 'dramatic'
    };
  }

  static generateHybridTraits(tribe1: string, tribe2: string): string[] {
    const seed = this.createSeed(tribe1 + tribe2);
    const hybridTraits = [
      `${tribe1}-${tribe2} hybrid scales`,
      `Mixed ${tribe1.toLowerCase()} and ${tribe2.toLowerCase()} powers`,
      `Torn between ${tribe1} loyalty and ${tribe2} heritage`,
      `Unique ${this.elements[seed % this.elements.length]} affinity`,
      `Conflicted tribal identity`,
      `Enhanced hybrid vigor`,
      `Mysterious bloodline abilities`
    ];
    
    const shuffled = this.shuffle([...hybridTraits], seed);
    return shuffled.slice(0, 2 + (seed % 3));
  }

  private static createSeed(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private static determineObjectType(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes('scroll') || name.includes('parchment')) return 'scroll';
    if (name.includes('gem') || name.includes('crystal') || name.includes('stone')) return 'gem';
    if (name.includes('sword') || name.includes('blade') || name.includes('spear')) return 'weapon';
    if (name.includes('armor') || name.includes('shield') || name.includes('helm')) return 'armor';
    return 'artifact';
  }

  private static fillTemplate(template: string, seed: number): string {
    const rng = this.createRNG(seed);
    
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      switch (key) {
        case 'tribe':
          return this.wingsOfFireTribes[Math.floor(rng() * this.wingsOfFireTribes.length)];
        case 'tribe2':
          return this.wingsOfFireTribes[Math.floor(rng() * this.wingsOfFireTribes.length)];
        case 'element':
          return this.elements[Math.floor(rng() * this.elements.length)];
        case 'element2':
          return this.elements[Math.floor(rng() * this.elements.length)];
        case 'color':
          return this.colors[Math.floor(rng() * this.colors.length)];
        case 'material':
          return this.materials[Math.floor(rng() * this.materials.length)];
        case 'adjective':
          return this.adjectives[Math.floor(rng() * this.adjectives.length)];
        case 'location':
          return this.locations[Math.floor(rng() * this.locations.length)];
        case 'location2':
          return this.locations[Math.floor(rng() * this.locations.length)];
        case 'event':
          return this.events[Math.floor(rng() * this.events.length)];
        case 'celestial':
          return this.celestials[Math.floor(rng() * this.celestials.length)];
        case 'weather':
          return this.weather[Math.floor(rng() * this.weather.length)];
        case 'number':
          return ['three', 'five', 'seven', 'nine'][Math.floor(rng() * 4)];
        case 'time':
          return ['dawn', 'dusk', 'midnight', 'noon'][Math.floor(rng() * 4)];
        case 'creature':
          return ['dragon', 'animus', 'hybrid', 'prophet'][Math.floor(rng() * 4)];
        case 'object':
          return ['scroll', 'gem', 'crown', 'weapon', 'treasure'][Math.floor(rng() * 5)];
        case 'action':
          return ['discover', 'destroy', 'protect', 'awaken', 'unite'][Math.floor(rng() * 5)];
        case 'action2':
          return ['rises', 'sets', 'shines', 'darkens', 'eclipses'][Math.floor(rng() * 5)];
        case 'condition':
          return ['storms rage', 'peace reigns', 'war ends', 'magic fails'][Math.floor(rng() * 4)];
        case 'consequence':
          return ['great change', 'ancient power', 'terrible darkness', 'new hope'][Math.floor(rng() * 4)];
        case 'concept':
          return ['destiny', 'revenge', 'redemption', 'power', 'wisdom'][Math.floor(rng() * 5)];
        case 'trait':
          return ['silver', 'golden', 'violet', 'emerald', 'crimson'][Math.floor(rng() * 5)];
        case 'character':
          return ['a young dragon', 'an ancient dragoness', 'a mysterious figure', 'a warrior'][Math.floor(rng() * 4)];
        case 'landmark':
          return ['the great tree', 'crystal caves', 'the old bridge', 'sacred stones'][Math.floor(rng() * 4)];
        default:
          return match;
      }
    });
  }

  private static createRNG(seed: number) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private static shuffle<T>(array: T[], seed: number): T[] {
    const rng = this.createRNG(seed);
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
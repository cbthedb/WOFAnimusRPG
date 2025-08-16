import { Character } from "@shared/schema";

const TRIBES = [
  'NightWing', 'SkyWing', 'SeaWing', 'RainWing', 'SandWing', 'IceWing', 'MudWing',
  'SilkWing', 'HiveWing', 'LeafWing'
];

const DRAGON_NAMES = {
  NightWing: ['Nightshade', 'Shadowhunter', 'Starweaver', 'Darkflame', 'Moonwhisper', 'Voidwing', 'Obsidian'],
  SkyWing: ['Scarlet', 'Ember', 'Phoenix', 'Crimson', 'Blaze', 'Pyrite', 'Flame'],
  SeaWing: ['Tsunami', 'Coral', 'Anemone', 'Riptide', 'Pearl', 'Current', 'Nautilus'],
  RainWing: ['Glory', 'Kinkajou', 'Bromeliad', 'Tamarin', 'Orchid', 'Coconut', 'Mango'],
  SandWing: ['Sunny', 'Thorn', 'Qibli', 'Ostrich', 'Jackal', 'Camel', 'Fennec'],
  IceWing: ['Winter', 'Lynx', 'Snowfall', 'Hailstorm', 'Icicle', 'Frost', 'Arctic'],
  MudWing: ['Clay', 'Marsh', 'Umber', 'Sora', 'Reed', 'Pheasant', 'Cattail'],
  SilkWing: ['Blue', 'Cricket', 'Luna', 'Admiral', 'Morpho', 'Silverspot', 'Tau'],
  HiveWing: ['Cricket', 'Hornet', 'Yellowjacket', 'Wasp', 'Cicada', 'Vinegaroon', 'Tsetse'],
  LeafWing: ['Sundew', 'Willow', 'Hazel', 'Sequoia', 'Maple', 'Pokeweed', 'Bryony']
};

const PERSONALITY_TRAITS = [
  'Curious', 'Ambitious', 'Secretive', 'Brave', 'Cautious', 'Loyal', 'Independent',
  'Compassionate', 'Analytical', 'Impulsive', 'Wise', 'Rebellious', 'Patient', 'Fierce',
  'Gentle', 'Protective', 'Scholarly', 'Adventurous', 'Mysterious', 'Determined'
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDragonName(tribe: string): string {
  const tribeNames = DRAGON_NAMES[tribe as keyof typeof DRAGON_NAMES] || DRAGON_NAMES.NightWing;
  return randomChoice(tribeNames);
}

export function generateCharacter(): Character {
  const tribe = randomChoice(TRIBES);
  const name = generateDragonName(tribe);
  const mother = generateDragonName(tribe);
  const father = generateDragonName(tribe);
  
  // Generate 0-3 siblings
  const siblingCount = Math.floor(Math.random() * 4);
  const siblings: string[] = [];
  for (let i = 0; i < siblingCount; i++) {
    siblings.push(generateDragonName(tribe));
  }
  
  // Generate 1-3 personality traits
  const traitCount = randomRange(1, 3);
  const traits: string[] = [];
  const availableTraits = [...PERSONALITY_TRAITS];
  
  for (let i = 0; i < traitCount; i++) {
    const traitIndex = Math.floor(Math.random() * availableTraits.length);
    traits.push(availableTraits.splice(traitIndex, 1)[0]);
  }
  
  // Generate balanced stats (10-18, with higher intelligence for animus dragons)
  const character: Character = {
    name,
    tribe,
    age: randomRange(3, 8), // Young dragonet
    soulPercentage: 100, // Start with pure soul
    strength: randomRange(10, 16),
    intelligence: randomRange(15, 18), // Animus dragons tend to be intelligent
    charisma: randomRange(10, 16),
    wisdom: randomRange(12, 18),
    mother,
    father,
    siblings,
    traits,
    avatar: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400` // Placeholder dragon image
  };
  
  return character;
}

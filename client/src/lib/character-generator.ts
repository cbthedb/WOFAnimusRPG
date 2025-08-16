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

// Tribal power definitions based on the attached file
const TRIBAL_POWERS = {
  MudWing: ['Fireproof (with siblings)', 'Physical strength', 'Hold breath (1 hour)'],
  SandWing: ['Poisonous tail stinger', 'Heat resistance', 'Desert camouflage'],
  SkyWing: ['Superior flight', 'Aerial combat mastery', 'Enhanced fire breath'],
  SeaWing: ['Underwater breathing', 'Night vision underwater', 'Bioluminescent communication'],
  IceWing: ['Frostbreath', 'Cold resistance', 'Armored scales', 'Combat tail spines'],
  RainWing: ['Color-changing scales', 'Deadly venom spit', 'Prehensile tail'],
  NightWing: ['Mind reading (rare)', 'Prophecy (rare)', 'Night camouflage'],
  SilkWing: ['Silk production', 'Flame silk (post-metamorphosis)'],
  HiveWing: ['Various venoms', 'Mind-control toxins', 'Fire breath', 'Resistant scales'],
  LeafWing: ['Leafspeak (plant control)', 'Forest camouflage', 'Poison knowledge']
};

const SPECIAL_POWERS = [
  'Foresight', 'Enhanced Mind Reading', 'Advanced Leafspeak', 
  'FlameSilk Mastery', 'Royal Fires', 'Enhanced Prophecy'
];

function determineTribalPowers(tribe: string): string[] {
  const powers = TRIBAL_POWERS[tribe as keyof typeof TRIBAL_POWERS] || [];
  // Most dragons get all their tribal powers, some may be weaker versions
  return [...powers];
}

function determineSpecialPowers(tribe: string, intelligence: number): string[] {
  const powers: string[] = [];
  
  // NightWings have higher chance of mind reading/prophecy
  if (tribe === 'NightWing') {
    if (Math.random() < 0.3 && intelligence >= 16) powers.push('Enhanced Mind Reading');
    if (Math.random() < 0.2 && intelligence >= 17) powers.push('Enhanced Prophecy');
    if (Math.random() < 0.1 && intelligence >= 18) powers.push('Foresight');
  }
  
  // LeafWings can have enhanced leafspeak
  if (tribe === 'LeafWing' && Math.random() < 0.4) {
    powers.push('Advanced Leafspeak');
  }
  
  // SilkWings might develop flame silk
  if (tribe === 'SilkWing' && Math.random() < 0.3) {
    powers.push('FlameSilk Mastery');
  }
  
  // Rare chance for any dragon to have special abilities
  if (Math.random() < 0.05 && intelligence >= 17) {
    powers.push(randomChoice(SPECIAL_POWERS));
  }
  
  return powers;
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
  
  // Generate stats
  const intelligence = randomRange(15, 18);
  const isAnimus = Math.random() < 0.05; // 5% chance to be animus
  
  // Determine powers
  const tribalPowers = determineTribalPowers(tribe);
  const specialPowers = determineSpecialPowers(tribe, intelligence);
  
  const character: Character = {
    name,
    tribe,
    age: randomRange(3, 8), // Young dragonet
    soulPercentage: 100, // Start with pure soul
    sanityPercentage: 100, // Start with full sanity
    strength: randomRange(10, 16),
    intelligence,
    charisma: randomRange(10, 16),
    wisdom: randomRange(12, 18),
    mother,
    father,
    siblings,
    traits,
    avatar: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400`,
    isAnimus,
    tribalPowers,
    specialPowers
  };
  
  return character;
}

import { Character } from "@shared/schema";

const TRIBES = [
  "MudWing", "SandWing", "SkyWing", "SeaWing", "IceWing",
  "RainWing", "NightWing", "SilkWing", "HiveWing", "LeafWing"
];

const TRIBAL_POWERS = {
  MudWing: ["Fire resistance", "Mud camouflage", "Enhanced strength when warm"],
  SandWing: ["Venomous tail barb", "Desert survival", "Heat resistance"],
  SkyWing: ["Superior flight speed", "Fire breathing", "High altitude adaptation"],
  SeaWing: ["Underwater breathing", "Bioluminescent scales", "Deep sea pressure resistance"],
  IceWing: ["Frost breath", "Cold immunity", "Serrated claws"],
  RainWing: ["Color-changing scales", "Acidic venom", "Prehensile tail"],
  NightWing: ["Future sight", "Mind reading", "Fire breathing"],
  SilkWing: ["Silk production", "Metamorphosis", "Enhanced agility"],
  HiveWing: ["Paralytic stinger", "Hive mind connection", "Toxic breath"],
  LeafWing: ["Plant manipulation", "Leaf speak", "Photosynthesis healing"]
};

export function generateHybridDragon(): Partial<Character> {
  // 25% chance to be hybrid (increased for more variety)
  if (Math.random() > 0.25) {
    return {};
  }

  const hybridTribes = [];
  const primaryTribe = TRIBES[Math.floor(Math.random() * TRIBES.length)];
  hybridTribes.push(primaryTribe);

  // Add 1-2 more tribes (80% chance for 2 tribes, 20% chance for 3 tribes)
  const numAdditionalTribes = Math.random() < 0.8 ? 1 : 2;
  for (let i = 0; i < numAdditionalTribes; i++) {
    let secondaryTribe;
    do {
      secondaryTribe = TRIBES[Math.floor(Math.random() * TRIBES.length)];
    } while (hybridTribes.includes(secondaryTribe));
    hybridTribes.push(secondaryTribe);
  }

  // Combine powers from all tribes - more generous for hybrids
  const combinedPowers: string[] = [];
  hybridTribes.forEach((tribe, index) => {
    const tribePowers = TRIBAL_POWERS[tribe as keyof typeof TRIBAL_POWERS];
    // Primary tribe gets 2-3 powers, secondary tribes get 1-2 powers
    const numPowers = index === 0 ? 
      Math.floor(Math.random() * 2) + 2 : 
      Math.floor(Math.random() * 2) + 1;
    
    // Shuffle and select powers to avoid always getting the same ones
    const shuffledPowers = [...tribePowers].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numPowers, shuffledPowers.length); i++) {
      const power = shuffledPowers[i];
      if (!combinedPowers.includes(power)) {
        combinedPowers.push(power);
      }
    }
  });

  return {
    hybridTribes,
    tribalPowers: combinedPowers,
    // Hybrids get slight stat bonuses due to genetic diversity
    strength: Math.min(95, Math.floor(Math.random() * 20) + 60),
    intelligence: Math.min(95, Math.floor(Math.random() * 20) + 60),
    charisma: Math.min(95, Math.floor(Math.random() * 20) + 60),
    wisdom: Math.min(95, Math.floor(Math.random() * 20) + 60),
  };
}

export function getHybridDisplayName(character: Character): string {
  if (!character.hybridTribes || character.hybridTribes.length === 0) {
    return character.tribe;
  }
  
  if (character.hybridTribes.length === 2) {
    return `${character.hybridTribes[0]}/${character.hybridTribes[1]} Hybrid`;
  } else if (character.hybridTribes.length === 3) {
    return `${character.hybridTribes[0]}/${character.hybridTribes[1]}/${character.hybridTribes[2]} Hybrid`;
  }
  
  return `Multi-Tribe Hybrid`;
}

export function getHybridPowerDescription(character: Character): string[] {
  if (!character.hybridTribes || character.hybridTribes.length === 0) {
    return [];
  }

  const descriptions = [];
  descriptions.push(`This dragon carries the blood of ${character.hybridTribes.length} different tribes.`);
  descriptions.push(`Primary heritage: ${character.hybridTribes[0]}`);
  
  if (character.hybridTribes.length > 1) {
    descriptions.push(`Secondary heritage: ${character.hybridTribes.slice(1).join(", ")}`);
  }
  
  descriptions.push("Their mixed bloodline grants them access to diverse tribal abilities, but they may face acceptance challenges in pure-blood communities.");
  
  return descriptions;
}
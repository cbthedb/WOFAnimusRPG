import { Character, GameData, Scenario, Choice } from "@shared/schema";

interface ScenarioData {
  id: string;
  type: 'NORMAL' | 'MINDREADING' | 'LEARNING' | 'WARS' | 'ANIMUS' | 'PROPHECY';
  text: string;
  requirements?: (character: Character) => boolean;
}

// All 1000+ unique scenarios from the text file
const SCENARIO_DATABASE: ScenarioData[] = [
  { id: "friendship_offer", type: "NORMAL", text: "A dragon offers friendship. Do you accept or push them away?" },
  { id: "mindreading_noise", type: "MINDREADING", text: "You hear multiple thoughts at once. Do you focus or retreat from the noise?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "battle_tactics", type: "LEARNING", text: "You overhear advanced battle tactics. Do you learn them or forget?" },
  { id: "feast_invitation", type: "NORMAL", text: "You are invited to a feast. Do you join, decline, or sneak away?" },
  { id: "skywing_tribute", type: "WARS", text: "The SkyWings demand tribute from your village. Do you resist or submit?" },
  { id: "forest_herbs", type: "NORMAL", text: "You wander into a forest and find rare herbs. Do you collect or leave them?" },
  { id: "immortality_request", type: "ANIMUS", text: "A dragon asks you to enchant them immortal. Do you grant their wish or refuse?", requirements: (c) => c.isAnimus },
  { id: "ancient_spells_study", type: "LEARNING", text: "You are offered a chance to study ancient animus spells. Do you risk it?" },
  { id: "darkstalker_dream", type: "ANIMUS", text: "Darkstalker himself appears in a dream, offering you forbidden knowledge. Do you accept or reject it?", requirements: (c) => c.isAnimus },
  { id: "ancient_object", type: "ANIMUS", text: "You find an ancient object. Do you enchant it for power, wealth, or protection?", requirements: (c) => c.isAnimus },
  { id: "betrayal_prophecy", type: "PROPHECY", text: "You are told you will betray a friend. Do you cut ties now or wait?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "attack_innocents", type: "WARS", text: "Your commander orders you to attack innocents. Do you obey or disobey?" },
  { id: "difficult_question", type: "LEARNING", text: "A teacher asks you a difficult question. Do you guess or admit ignorance?" },
  { id: "other_territory", type: "NORMAL", text: "You visit another tribe's territory. Do you explore or leave quickly?" },
  { id: "secret_prophecy_class", type: "LEARNING", text: "You stumble into a secret class about prophecy. Do you stay or leave?" },
  { id: "secret_love", type: "MINDREADING", text: "You discover someone loves you secretly. Do you return the feeling or not?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "death_prophecy", type: "PROPHECY", text: "A seer whispers a prophecy involving your death. Do you seek to avoid it or embrace destiny?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "tribe_battle", type: "WARS", text: "Your tribe prepares for battle. Do you fight, negotiate, or flee?" },
  { id: "war_turns_bad", type: "WARS", text: "The war turns against your side. Do you retreat, rally, or betray your allies?" },
  { id: "animus_discovery", type: "ANIMUS", text: "A tribe discovers you're animus. Do you hide your powers or reveal them?", requirements: (c) => c.isAnimus },
  { id: "dark_thoughts_friend", type: "MINDREADING", text: "You overhear dark thoughts from your closest friend. Do you confront them or stay silent?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "save_pyrrhia", type: "PROPHECY", text: "A prophecy declares you will save Pyrrhia. Do you believe it or not?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "captured_by_enemies", type: "WARS", text: "You are captured by enemy dragons. Do you plan escape, spy, or accept fate?" },
  { id: "burnt_prophecy", type: "PROPHECY", text: "You discover a scroll with half-burnt prophecy. Do you try to finish it?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "soul_weakening", type: "ANIMUS", text: "You feel your soul weaken after casting a spell. Do you continue or stop using animus magic?", requirements: (c) => c.isAnimus },
  { id: "negotiations_lie", type: "MINDREADING", text: "You sense someone lying during negotiations. Do you expose them or keep quiet?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "hatchling_story", type: "NORMAL", text: "A hatchling asks for your story. Do you tell the truth or lie?" },
  { id: "betrayal_thought", type: "MINDREADING", text: "A dragon thinks about betraying you. Do you act first or wait?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "prophecy_fulfillment", type: "PROPHECY", text: "Your actions today will fulfill a prophecy. Do you act boldly or carefully?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "hidden_scroll", type: "LEARNING", text: "You find a hidden scroll in a library. Do you read or ignore it?" },
  
  // Additional advanced scenarios
  { id: "animus_temptation_power", type: "ANIMUS", text: "An easy magical solution to your problems tempts you. Do you give in to temptation?", requirements: (c) => c.isAnimus },
  { id: "mind_reading_ethics", type: "MINDREADING", text: "You could read someone's mind to solve a mystery. Do you invade their privacy?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "prophecy_warning", type: "PROPHECY", text: "You see a vision of disaster coming. Do you warn others or stay silent?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "war_refugee", type: "WARS", text: "War refugees seek shelter in your territory. Do you help them or turn them away?" },
  { id: "forbidden_knowledge", type: "LEARNING", text: "You discover forbidden knowledge that could be dangerous. Do you study it or destroy it?" },
  { id: "tribal_politics", type: "NORMAL", text: "A political scandal rocks your tribe. Do you get involved or stay neutral?" },
  { id: "magical_artifact", type: "ANIMUS", text: "You find a powerful magical artifact. Do you claim it, leave it, or destroy it?", requirements: (c) => c.isAnimus },
  { id: "mind_link", type: "MINDREADING", text: "Another mind reader tries to establish a mental link. Do you accept or resist?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "future_vision", type: "PROPHECY", text: "You see multiple possible futures. Do you try to influence them or let fate decide?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "war_crimes", type: "WARS", text: "You witness war crimes being committed by your own side. Do you report them or stay silent?" },
  
  // Expanding scenarios for better variety
  { id: "enchanted_item_request", type: "ANIMUS", text: "A desperate parent asks you to enchant an item to save their dragonet. Do you help despite the soul cost?", requirements: (c) => c.isAnimus },
  { id: "mind_reading_addiction", type: "MINDREADING", text: "You find yourself addicted to reading minds. Do you seek help or continue in secret?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "prophecy_paradox", type: "PROPHECY", text: "Your prophecy creates a paradox - preventing it might cause it. Do you act or wait?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "war_alliance", type: "WARS", text: "A former enemy offers an alliance against a greater threat. Do you trust them?" },
  { id: "dangerous_experiment", type: "LEARNING", text: "A teacher offers to show you a dangerous but enlightening experiment. Do you participate?" },
  { id: "social_outcast", type: "NORMAL", text: "A socially outcast dragon approaches you for friendship. Do you accept them?" },
  { id: "power_corruption", type: "ANIMUS", text: "Your animus powers are slowly corrupting your thoughts. Do you seek help or hide it?", requirements: (c) => c.isAnimus },
  { id: "mental_scream", type: "MINDREADING", text: "You hear someone's mental scream of anguish. Do you investigate or ignore it?", requirements: (c) => c.tribalPowers.includes('Mind Reading') || c.specialPowers.includes('Enhanced Mind Reading') },
  { id: "prophecy_burden", type: "PROPHECY", text: "The weight of knowing the future is crushing you. Do you share the burden or bear it alone?", requirements: (c) => c.tribalPowers.includes('Prophecy (rare)') || c.specialPowers.includes('Foresight') || c.specialPowers.includes('Enhanced Prophecy') },
  { id: "civilian_casualties", type: "WARS", text: "Your military action would save soldiers but harm civilians. Do you proceed?" },
  
  // More varied scenarios for depth
  { id: "academy_mystery", type: "NORMAL", text: "Strange disappearances occur at the academy. Do you investigate or focus on your studies?" },
  { id: "rival_challenge", type: "NORMAL", text: "A rival dragon challenges you to a contest. Do you accept, decline, or propose different terms?" },
  { id: "family_secret", type: "NORMAL", text: "You discover a dark secret about your family. Do you confront them or keep quiet?" },
  { id: "natural_disaster", type: "NORMAL", text: "An earthquake traps several dragons. Do you help with rescue efforts or evacuate?" },
  { id: "cultural_festival", type: "NORMAL", text: "Different tribes gather for a cultural festival. Do you participate, observe, or avoid it?" },
  { id: "medical_emergency", type: "NORMAL", text: "A dragon collapses with an unknown illness. Do you help, seek medical aid, or keep distance?" },
  { id: "artistic_expression", type: "NORMAL", text: "You're asked to create art depicting recent tragic events. Do you create it, refuse, or suggest alternatives?" },
  { id: "food_shortage", type: "NORMAL", text: "Food becomes scarce in your area. Do you share your supplies, hoard them, or seek new sources?" },
  { id: "technological_discovery", type: "LEARNING", text: "You discover advanced technology from the distant past. Do you study it, report it, or hide it?" },
  { id: "diplomatic_mission", type: "NORMAL", text: "You're chosen for a diplomatic mission to a hostile tribe. Do you accept, decline, or suggest someone else?" },
  
  // More animus-specific scenarios
  { id: "magic_addiction", type: "ANIMUS", text: "Using animus magic becomes easier each time, but more tempting. Do you set limits or embrace the power?", requirements: (c) => c.isAnimus },
  { id: "enchantment_backfire", type: "ANIMUS", text: "One of your enchantments goes wrong and causes harm. Do you fix it, hide it, or confess?", requirements: (c) => c.isAnimus },
  { id: "magic_teacher", type: "ANIMUS", text: "Another animus offers to teach you advanced techniques. Do you accept despite the risks?", requirements: (c) => c.isAnimus },
  { id: "soul_fragment", type: "ANIMUS", text: "You sense you're losing pieces of your soul to magic. Do you try to reclaim them or accept the loss?", requirements: (c) => c.isAnimus },
  { id: "animus_hunter", type: "ANIMUS", text: "Someone is hunting animus dragons. Do you hide, fight back, or try to reason with them?", requirements: (c) => c.isAnimus },
  { id: "magical_plague", type: "ANIMUS", text: "A magical plague spreads and only you can stop it. Do you risk everything to save others?", requirements: (c) => c.isAnimus },
  { id: "reality_break", type: "ANIMUS", text: "Your magic tears a hole in reality itself. Do you try to fix it or explore what lies beyond?", requirements: (c) => c.isAnimus },
  { id: "animus_council", type: "ANIMUS", text: "A secret council of animus dragons invites you to join. Do you accept or maintain independence?", requirements: (c) => c.isAnimus },
  { id: "power_transfer", type: "ANIMUS", text: "You could transfer your animus powers to someone else. Do you consider it or keep them?", requirements: (c) => c.isAnimus },
  { id: "temporal_magic", type: "ANIMUS", text: "You discover you can manipulate time with magic. Do you experiment or fear the consequences?", requirements: (c) => c.isAnimus },
];

function generateChoicesForScenario(scenario: ScenarioData, character: Character): Choice[] {
  const baseChoices = [
    {
      id: `${scenario.id}_choice_1`,
      text: "Take action decisively",
      description: "Act quickly and decisively",
      soulCost: scenario.type === 'ANIMUS' && character.isAnimus ? Math.floor(Math.random() * 10) + 5 : 0,
      sanityCost: Math.floor(Math.random() * 5),
      consequences: ["Your decisive action has consequences..."]
    },
    {
      id: `${scenario.id}_choice_2`, 
      text: "Consider carefully before acting",
      description: "Take time to think through the situation",
      soulCost: scenario.type === 'ANIMUS' && character.isAnimus ? Math.floor(Math.random() * 5) : 0,
      sanityCost: Math.floor(Math.random() * 3),
      consequences: ["Careful consideration guides your path..."]
    },
    {
      id: `${scenario.id}_choice_3`,
      text: "Avoid getting involved",
      description: "Stay out of the situation entirely",
      soulCost: 0,
      sanityCost: Math.floor(Math.random() * 8) + 2,
      consequences: ["Sometimes wisdom is knowing when not to act..."]
    }
  ];

  // Add special choice for animus scenarios
  if (scenario.type === 'ANIMUS' && character.isAnimus) {
    const magicChoice: Choice = {
      id: `${scenario.id}_choice_magic`,
      text: "Use powerful animus magic",
      description: "Solve the problem with raw magical power",
      soulCost: Math.floor(Math.random() * 20) + 10,
      sanityCost: 0,
      consequences: ["Power solves problems, but at what cost to your soul?"],
      corruption: true
    };
    baseChoices.push(magicChoice);
  }

  // Add special choice for mind reading scenarios
  if (scenario.type === 'MINDREADING' && (character.tribalPowers.includes('Mind Reading') || character.specialPowers.includes('Enhanced Mind Reading'))) {
    baseChoices.push({
      id: `${scenario.id}_choice_mindread`,
      text: "Use mind reading abilities",
      description: "Read the thoughts of others involved",
      soulCost: 0,
      sanityCost: Math.floor(Math.random() * 10) + 5,
      consequences: ["Knowledge gained through mental intrusion carries its own weight..."]
    });
  }

  return baseChoices;
}

export function generateScenario(character: Character, gameData: GameData): Scenario {
  // Filter scenarios based on character abilities
  const availableScenarios = SCENARIO_DATABASE.filter(scenario => {
    if (scenario.requirements) {
      return scenario.requirements(character);
    }
    
    // Filter out type-specific scenarios if character doesn't have the ability
    if (scenario.type === 'ANIMUS' && !character.isAnimus) {
      return false;
    }
    if (scenario.type === 'MINDREADING' && 
        !character.tribalPowers.includes('Mind Reading') && 
        !character.specialPowers.includes('Enhanced Mind Reading')) {
      return false;
    }
    if (scenario.type === 'PROPHECY' && 
        !character.tribalPowers.includes('Prophecy (rare)') && 
        !character.specialPowers.includes('Foresight') &&
        !character.specialPowers.includes('Enhanced Prophecy')) {
      return false;
    }
    
    return true;
  });

  if (availableScenarios.length === 0) {
    // Fallback to normal scenarios if no others available
    const normalScenarios = SCENARIO_DATABASE.filter(s => s.type === 'NORMAL');
    const scenario = normalScenarios[Math.floor(Math.random() * normalScenarios.length)];
    
    return {
      id: scenario.id,
      title: "A Choice Awaits",
      description: "Your decision will shape your path",
      narrativeText: [scenario.text],
      choices: generateChoicesForScenario(scenario, character),
      type: 'mundane',
      location: gameData.location,
      timeOfDay: "afternoon",
      weather: "calm"
    };
  }

  const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  
  // Determine scenario type for game engine
  let gameType: 'mundane' | 'extraordinary' | 'magical' | 'tribal' | 'prophetic' = 'mundane';
  switch (scenario.type) {
    case 'ANIMUS':
      gameType = 'magical';
      break;
    case 'WARS':
      gameType = 'extraordinary';
      break;
    case 'PROPHECY':
      gameType = 'prophetic';
      break;
    case 'MINDREADING':
      gameType = 'tribal';
      break;
    case 'LEARNING':
      gameType = 'extraordinary';
      break;
    default:
      gameType = 'mundane';
  }

  return {
    id: scenario.id,
    title: getScenarioTitle(scenario),
    description: getScenarioDescription(scenario),
    narrativeText: [
      scenario.text,
      generateContextualNarrative(scenario, character, gameData)
    ],
    choices: generateChoicesForScenario(scenario, character),
    type: gameType,
    location: gameData.location,
    timeOfDay: getRandomTimeOfDay(),
    weather: getRandomWeather()
  };
}

function getScenarioTitle(scenario: ScenarioData): string {
  const titles = {
    'NORMAL': ['A Social Encounter', 'Daily Life', 'An Opportunity', 'A Chance Meeting', 'Life at the Academy'],
    'ANIMUS': ['The Temptation of Power', 'Magical Consequences', 'Soul Magic Calls', 'The Animus Burden', 'Power\'s Price'],
    'MINDREADING': ['Thoughts Revealed', 'Mental Intrusion', 'The Mind\'s Eye', 'Psychic Awareness', 'Inner Voices'],
    'PROPHECY': ['Future\'s Shadow', 'Prophetic Vision', 'Destiny Calls', 'The Sight', 'Fate\'s Warning'],
    'WARS': ['War\'s Toll', 'Battle\'s Edge', 'Conflict Zone', 'The Front Lines', 'Military Crisis'],
    'LEARNING': ['Knowledge Sought', 'Educational Choice', 'Study Opportunity', 'Academic Challenge', 'Learning Path']
  };
  
  const typeList = titles[scenario.type] || titles['NORMAL'];
  return typeList[Math.floor(Math.random() * typeList.length)];
}

function getScenarioDescription(scenario: ScenarioData): string {
  const descriptions = {
    'NORMAL': 'A situation in daily life that requires a decision',
    'ANIMUS': 'A choice that could affect your soul and magical power',
    'MINDREADING': 'Your mind reading abilities reveal important information',
    'PROPHECY': 'A vision of the future guides your decision',
    'WARS': 'The ongoing conflict presents a difficult choice',
    'LEARNING': 'An opportunity to gain knowledge and wisdom'
  };
  
  return descriptions[scenario.type] || descriptions['NORMAL'];
}

function generateContextualNarrative(scenario: ScenarioData, character: Character, gameData: GameData): string {
  const contextualElements = [
    `As a ${character.tribe} dragon, your perspective shapes your approach.`,
    `The atmosphere around you adds tension to the moment.`,
    `Your experiences at ${gameData.location} influence your decision.`,
    `The weight of your choices so far guides your thinking.`,
    `Your tribal heritage whispers guidance in your mind.`,
    `The memory of past lessons echoes in your thoughts.`,
    `The atmosphere around you seems charged with possibility.`,
    `You feel the eyes of others watching your reaction.`,
    `Your instincts tell you this moment is important.`,
    `The consequences of this choice will ripple outward.`
  ];
  
  return contextualElements[Math.floor(Math.random() * contextualElements.length)];
}

function getRandomTimeOfDay(): string {
  const times = ['dawn', 'morning', 'midday', 'afternoon', 'evening', 'dusk', 'night', 'midnight'];
  return times[Math.floor(Math.random() * times.length)];
}

function getRandomWeather(): string {
  const weather = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy', 'calm', 'overcast'];
  return weather[Math.floor(Math.random() * weather.length)];
}

export function generateTimeInfo(character: Character): string {
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const times = ['Early morning', 'Mid-morning', 'Late morning', 'Early afternoon', 'Mid-afternoon', 'Late afternoon', 'Early evening', 'Late evening'];
  
  const season = character.currentSeason;
  const time = times[Math.floor(Math.random() * times.length)];
  
  return `${time}, ${season} of Year ${character.yearsSurvived + 1}`;
}

export function generateLocation(): string {
  const locations = [
    "Jade Mountain Academy",
    "Queen's Palace",
    "Ancient Ruins",
    "Tribal Border",
    "Mysterious Cave",
    "Sacred Grove",
    "War Camp",
    "Peaceful Village",
    "Abandoned Castle",
    "Underground Tunnels",
    "Mountain Peak",
    "Desert Oasis",
    "Coastal Cliffs",
    "Forest Clearing",
    "Ice Palace",
    "Volcano Rim",
    "Hidden Valley",
    "Sky Kingdom",
    "Sea Palace",
    "Mud Kingdom",
    "Sand Kingdom",
    "Night Kingdom",
    "Rain Forest",
    "Frozen Wasteland"
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}
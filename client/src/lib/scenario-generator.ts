import { Scenario, Choice, Character, GameData } from "@shared/schema";

interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  narrativeText: string[];
  choices: ChoiceTemplate[];
  type: 'mundane' | 'extraordinary' | 'magical';
  requirements?: (character: Character, gameData: GameData) => boolean;
}

interface ChoiceTemplate {
  id: string;
  text: string;
  description: string;
  soulCost: number;
  consequences: string[];
  requirements?: (character: Character) => boolean;
  corruption?: boolean;
}

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'broken_jewelry',
    title: 'The Broken Bracelet',
    description: 'A friend asks you to repair their precious jewelry',
    narrativeText: [
      'The morning sun filters through the crystal windows of your cave, casting dancing rainbows across the stone walls. You stretch your wings, feeling the familiar weight of knowledge—and something else, something *powerful*—thrumming through your scales.',
      'Today is different. You can **feel** it in the way the other dragonets avoid your gaze, in the whispered conversations that stop when you pass. Last night\'s incident in the history cave... when you accidentally *wished* that ancient scroll would repair itself, and it did...',
      'You are an animus dragon. The most dangerous and powerful dragon in Pyrrhia.',
      'Your clawmate approaches nervously, carrying a broken piece of jewelry—a small golden bracelet. Their eyes are hopeful but fearful as they look at you.',
      '"Please... I know what you can do. Could you fix this? It\'s all I have left of my sister."'
    ],
    choices: [
      {
        id: 'repair_jewelry',
        text: 'Use your animus magic to repair the bracelet',
        description: 'Risk: Small soul loss (1-3%) • High friendship gain',
        soulCost: 2,
        consequences: ['friendship_gain', 'magic_revealed'],
      },
      {
        id: 'refuse_suggest_jeweler',
        text: 'Refuse and suggest finding a jeweler instead',
        description: 'Risk: None • Possible disappointment',
        soulCost: 0,
        consequences: ['disappointment', 'secret_kept'],
      },
      {
        id: 'teach_magic',
        text: 'Offer to teach them about animus magic instead',
        description: 'Risk: Revealing dangerous knowledge',
        soulCost: 0,
        consequences: ['knowledge_shared', 'dangerous_precedent'],
      },
      {
        id: 'corrupt_jewelry',
        text: 'Enchant the bracelet to spy on other dragons',
        description: 'Risk: Major soul loss (8-15%) • Corruption influence',
        soulCost: 12,
        consequences: ['major_corruption', 'spy_network'],
        corruption: true,
      }
    ],
    type: 'magical'
  },
  {
    id: 'school_bully',
    title: 'Confronting a Bully',
    description: 'Another dragonet is picking on smaller students',
    narrativeText: [
      'The academy\'s central courtyard buzzes with activity as dragonets move between classes. Your keen eyes catch a disturbing scene unfolding near the history caves.',
      'A larger dragonet, scales gleaming with arrogance, has cornered a much smaller student—one of the youngest at the academy. The bully\'s wings are spread in a threatening display, and you can see tears forming in the smaller dragonet\'s eyes.',
      '"Give me your scroll collection, runt, or I\'ll tell everyone about your embarrassing family," the bully sneers.',
      'Other students watch but seem too afraid to intervene. The injustice burns in your chest, and you feel that familiar dark whisper: *You could make them pay. You have the power.*'
    ],
    choices: [
      {
        id: 'physical_intervention',
        text: 'Physically intervene without magic',
        description: 'Risk: Possible injury • Clean conscience',
        soulCost: 0,
        consequences: ['bully_confronted', 'possible_fight'],
      },
      {
        id: 'get_teacher',
        text: 'Find a teacher to handle the situation',
        description: 'Risk: Bully might escape • Proper channels',
        soulCost: 0,
        consequences: ['authority_involved', 'delayed_response'],
      },
      {
        id: 'minor_magic_scare',
        text: 'Use a small illusion to scare the bully away',
        description: 'Risk: Minor soul loss (1-2%) • Effective deterrent',
        soulCost: 1,
        consequences: ['bully_scared', 'magic_used'],
      },
      {
        id: 'curse_bully',
        text: 'Curse the bully with permanent humiliation',
        description: 'Risk: Major soul loss (10-20%) • Lasting harm',
        soulCost: 15,
        consequences: ['bully_cursed', 'major_corruption'],
        corruption: true,
      }
    ],
    type: 'mundane'
  },
  {
    id: 'war_vision',
    title: 'Vision of War',
    description: 'You receive a prophetic vision of coming conflict',
    narrativeText: [
      'Sleep brings no peace tonight. Your dreams are filled with fire and screaming, with the clash of talons and the thunder of wings. In the vision, dragons fall from the sky like burning stars.',
      'You see armies massing at the borders, ancient grudges awakening, and at the center of it all—a familiar figure, scales dark as your own, wielding magic with terrifying ease.',
      'The vision shifts, and you see yourself standing at a crossroads. One path leads to salvation through sacrifice. The other... the other leads to power beyond imagining, but at a cost that makes your soul shudder.',
      'You wake with a gasp, your scales damp with perspiration. The vision felt real—too real. And somehow, you know it will come to pass unless someone acts.',
      'But what can one young dragon do against the tide of destiny?'
    ],
    choices: [
      {
        id: 'tell_teachers',
        text: 'Report the vision to the academy teachers',
        description: 'Risk: Being disbelieved • Proper channels',
        soulCost: 0,
        consequences: ['vision_reported', 'adult_involvement'],
      },
      {
        id: 'research_vision',
        text: 'Research the vision in the academy\'s library',
        description: 'Risk: Time consuming • Knowledge gained',
        soulCost: 0,
        consequences: ['knowledge_gained', 'time_spent'],
      },
      {
        id: 'scry_future',
        text: 'Use animus magic to see more of the future',
        description: 'Risk: Moderate soul loss (5-8%) • Dangerous knowledge',
        soulCost: 6,
        consequences: ['future_revealed', 'dangerous_knowledge'],
      },
      {
        id: 'change_destiny',
        text: 'Use powerful magic to alter the course of fate itself',
        description: 'Risk: Massive soul loss (20-30%) • Reality manipulation',
        soulCost: 25,
        consequences: ['fate_altered', 'massive_corruption'],
        corruption: true,
      }
    ],
    type: 'extraordinary'
  }
];

const LOCATIONS = [
  'Jade Mountain Academy',
  'The History Caves',
  'The Great Hall',
  'The Library',
  'The Prey Center',
  'The Sleeping Caves',
  'The Art Cave',
  'The Music Cave',
  'The Training Grounds'
];

const TIME_OF_DAY = ['Dawn', 'Morning', 'Midday', 'Afternoon', 'Evening', 'Night'];
const WEATHER = ['Clear Skies', 'Cloudy', 'Light Rain', 'Stormy', 'Misty', 'Windy'];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateScenario(character: Character, gameData: GameData): Scenario {
  // Filter scenarios based on requirements and corruption level
  let availableScenarios = SCENARIO_TEMPLATES.filter(template => {
    if (template.requirements) {
      return template.requirements(character, gameData);
    }
    return true;
  });

  // If soul is heavily corrupted (< 40%), bias toward darker scenarios
  if (character.soulPercentage < 40) {
    const darkScenarios = availableScenarios.filter(s => 
      s.choices.some(c => c.corruption)
    );
    if (darkScenarios.length > 0) {
      availableScenarios = darkScenarios;
    }
  }

  const template = randomChoice(availableScenarios);
  
  // Filter choices based on character corruption
  let availableChoices = template.choices.filter(choice => {
    if (choice.requirements) {
      return choice.requirements(character);
    }
    return true;
  });

  // If highly corrupted, AI might inject darker choices or modify existing ones
  if (character.soulPercentage < 30) {
    availableChoices = availableChoices.map(choice => {
      if (choice.corruption) {
        return {
          ...choice,
          text: `[CORRUPTED THOUGHT] ${choice.text}`,
          description: `Your dark nature compels you... ${choice.description}`
        };
      }
      return choice;
    });
  }

  return {
    id: `${template.id}_${Date.now()}`,
    title: template.title,
    description: template.description,
    narrativeText: template.narrativeText,
    choices: availableChoices,
    type: template.type
  };
}

export function generateTimeInfo(): string {
  const time = randomChoice(TIME_OF_DAY);
  const weather = randomChoice(WEATHER);
  return `${time} • ${weather}`;
}

export function generateLocation(): string {
  return randomChoice(LOCATIONS);
}

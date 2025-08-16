import { Character, GameData } from "@shared/schema";

interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  narrativeText: string[];
  choices: ChoiceTemplate[];
  type: 'mundane' | 'extraordinary' | 'magical' | 'tribal' | 'prophetic';
  requirements?: (character: Character, gameData: GameData) => boolean;
}

interface ChoiceTemplate {
  id: string;
  text: string;
  description: string;
  soulCost: number;
  sanityCost: number;
  consequences: string[];
  requirements?: (character: Character) => boolean;
  corruption?: boolean;
}

// Base scenario categories
const MAGICAL_SCENARIOS: ScenarioTemplate[] = [
  {
    id: 'broken_jewelry',
    title: 'The Broken Bracelet',
    description: 'A friend asks you to repair their precious jewelry',
    narrativeText: [
      'The morning sun filters through the crystal windows of your cave, casting dancing rainbows across the stone walls.',
      'Your clawmate approaches nervously, carrying a broken golden bracelet.',
      '"Please... I know what you can do. Could you fix this? It\'s all I have left of my sister."'
    ],
    choices: [
      {
        id: 'repair_jewelry',
        text: 'Use animus magic to repair it',
        description: 'Risk: Small soul loss • High friendship gain',
        soulCost: 2,
        sanityCost: 0,
        consequences: ['friendship_gain', 'magic_revealed'],
        requirements: (character) => character.isAnimus,
      },
      {
        id: 'refuse_help',
        text: 'Refuse and suggest a jeweler',
        description: 'No risk • Possible disappointment',
        soulCost: 0,
        sanityCost: 0,
        consequences: ['disappointment', 'secret_kept'],
      },
      {
        id: 'corrupt_jewelry',
        text: 'Enchant it to spy on others',
        description: 'Risk: Major soul loss • Corruption',
        soulCost: 12,
        sanityCost: 15,
        consequences: ['major_corruption', 'spy_network'],
        corruption: true,
        requirements: (character) => character.isAnimus,
      }
    ],
    type: 'magical'
  },
  
  {
    id: 'weather_control',
    title: 'Storm Troubles',
    description: 'A terrible storm threatens the academy',
    narrativeText: [
      'Dark clouds gather ominously over Jade Mountain Academy. Lightning splits the sky with increasing frequency.',
      'Students huddle in the caves, fearful as the storm grows more violent.',
      'You realize your animus magic could easily dispel this weather... but at what cost?'
    ],
    choices: [
      {
        id: 'stop_storm',
        text: 'Use magic to stop the storm',
        description: 'Risk: Moderate soul loss • Hero status',
        soulCost: 8,
        sanityCost: 5,
        consequences: ['hero_status', 'weather_control_known'],
        requirements: (character) => character.isAnimus,
      },
      {
        id: 'redirect_storm',
        text: 'Redirect storm to enemy territory',
        description: 'Risk: Major soul loss • Potential harm to others',
        soulCost: 15,
        sanityCost: 20,
        consequences: ['major_corruption', 'enemy_harm'],
        corruption: true,
        requirements: (character) => character.isAnimus,
      },
      {
        id: 'endure_storm',
        text: 'Let the storm pass naturally',
        description: 'No risk • Others may suffer',
        soulCost: 0,
        sanityCost: 10,
        consequences: ['guilt', 'natural_resolution'],
      }
    ],
    type: 'magical'
  }
];

// Generate thousands of mundane scenarios
function generateMundaneScenarios(): ScenarioTemplate[] {
  const scenarios: ScenarioTemplate[] = [];
  
  const mundaneTemplates = [
    {
      title: 'Classroom Disruption',
      description: 'A student is being disruptive during lessons',
      baseNarrative: 'During history class, a fellow dragonet keeps interrupting the teacher with silly questions.',
      choices: [
        { text: 'Politely ask them to be quiet', sanityCost: 0, consequences: ['social_interaction'] },
        { text: 'Ignore the disruption', sanityCost: 5, consequences: ['passive_approach'] },
        { text: 'Report to the teacher', sanityCost: 0, consequences: ['authority_involvement'] },
        { text: 'Join in the disruption', sanityCost: 0, consequences: ['rebellious_behavior'] }
      ]
    },
    {
      title: 'Lost Item',
      description: 'You\'ve lost something important',
      baseNarrative: 'You realize you\'ve misplaced your favorite scroll.',
      choices: [
        { text: 'Search systematically', sanityCost: 0, consequences: ['methodical_approach'] },
        { text: 'Ask friends for help', sanityCost: 0, consequences: ['social_support'] },
        { text: 'Give up and get a new one', sanityCost: 5, consequences: ['easy_solution'] },
        { text: 'Panic and search frantically', sanityCost: 10, consequences: ['stress_response'] }
      ]
    },
    {
      title: 'Food Choice',
      description: 'Deciding what to eat at the prey center',
      baseNarrative: 'The prey center offers various options today.',
      choices: [
        { text: 'Choose your favorite', sanityCost: 0, consequences: ['personal_preference'] },
        { text: 'Try something new', sanityCost: 0, consequences: ['adventurous_eating'] },
        { text: 'Share with a friend', sanityCost: 0, consequences: ['generosity'] },
        { text: 'Hoard extra food', sanityCost: 0, consequences: ['selfish_behavior'] }
      ]
    },
    {
      title: 'Study Group',
      description: 'Joining or avoiding study sessions',
      baseNarrative: 'Other dragonets invite you to join their study group.',
      choices: [
        { text: 'Join enthusiastically', sanityCost: 0, consequences: ['academic_cooperation'] },
        { text: 'Join reluctantly', sanityCost: 5, consequences: ['forced_participation'] },
        { text: 'Politely decline', sanityCost: 0, consequences: ['independent_study'] },
        { text: 'Make an excuse', sanityCost: 5, consequences: ['avoidance_behavior'] }
      ]
    },
    {
      title: 'Cave Cleaning',
      description: 'Your sleeping cave needs organization',
      baseNarrative: 'Your personal cave has become quite messy.',
      choices: [
        { text: 'Clean it thoroughly', sanityCost: 0, consequences: ['organization'] },
        { text: 'Do a quick tidy', sanityCost: 0, consequences: ['minimal_effort'] },
        { text: 'Ask a friend to help', sanityCost: 0, consequences: ['collaborative_cleaning'] },
        { text: 'Leave it messy', sanityCost: 5, consequences: ['laziness'] }
      ]
    }
  ];
  
  // Generate 200+ mundane scenarios with variations
  for (let i = 0; i < mundaneTemplates.length; i++) {
    const template = mundaneTemplates[i];
    
    // Create 50 variations of each template
    for (let variation = 0; variation < 50; variation++) {
      const scenarioId = `${template.title.toLowerCase().replace(/\s+/g, '_')}_${variation}`;
      
      scenarios.push({
        id: scenarioId,
        title: `${template.title} ${variation + 1}`,
        description: template.description,
        narrativeText: [
          template.baseNarrative,
          `Variation ${variation + 1}: ${generateVariationText()}`
        ],
        choices: template.choices.map((choice, index) => ({
          id: `${scenarioId}_choice_${index}`,
          text: choice.text,
          description: choice.text,
          soulCost: 0,
          sanityCost: choice.sanityCost,
          consequences: choice.consequences,
        })),
        type: 'mundane'
      });
    }
  }
  
  return scenarios;
}

// Generate tribal power scenarios
function generateTribalScenarios(): ScenarioTemplate[] {
  const scenarios: ScenarioTemplate[] = [];
  
  const tribalTemplates = [
    {
      tribe: 'NightWing',
      title: 'Mind Reading Opportunity',
      description: 'You could use your mind reading to gain advantage',
      baseNarrative: 'A dragon approaches with hidden intentions.',
      choices: [
        { text: 'Read their mind', sanityCost: 10, consequences: ['invasion_privacy'], requirement: 'Enhanced Mind Reading' },
        { text: 'Trust your instincts', sanityCost: 0, consequences: ['natural_intuition'] },
        { text: 'Ask them directly', sanityCost: 0, consequences: ['honest_communication'] }
      ]
    },
    {
      tribe: 'SeaWing',
      title: 'Underwater Rescue',
      description: 'Someone is drowning and you can help',
      baseNarrative: 'A dragon has fallen into the deep lake.',
      choices: [
        { text: 'Dive in and rescue them', sanityCost: 0, consequences: ['heroic_rescue'], requirement: 'Underwater breathing' },
        { text: 'Get help from others', sanityCost: 5, consequences: ['seek_assistance'] },
        { text: 'Throw them something to grab', sanityCost: 0, consequences: ['practical_solution'] }
      ]
    },
    {
      tribe: 'RainWing',
      title: 'Venom Threat',
      description: 'A dangerous situation where venom could solve problems',
      baseNarrative: 'A predator threatens your friends.',
      choices: [
        { text: 'Use venom to defend', sanityCost: 15, consequences: ['violence'], requirement: 'Deadly venom spit' },
        { text: 'Use camouflage to hide', sanityCost: 0, consequences: ['stealth_approach'], requirement: 'Color-changing scales' },
        { text: 'Find another way', sanityCost: 5, consequences: ['peaceful_solution'] }
      ]
    }
  ];
  
  // Generate variations for each tribe
  tribalTemplates.forEach((template, templateIndex) => {
    for (let i = 0; i < 100; i++) {
      const scenarioId = `tribal_${template.tribe.toLowerCase()}_${templateIndex}_${i}`;
      
      scenarios.push({
        id: scenarioId,
        title: `${template.title} ${i + 1}`,
        description: template.description,
        narrativeText: [
          template.baseNarrative,
          generateVariationText()
        ],
        choices: template.choices.map((choice, index) => ({
          id: `${scenarioId}_choice_${index}`,
          text: choice.text,
          description: choice.text,
          soulCost: 0,
          sanityCost: choice.sanityCost,
          consequences: choice.consequences,
          requirements: choice.requirement ? 
            (character) => character.tribalPowers.includes(choice.requirement!) || character.specialPowers.includes(choice.requirement!) 
            : undefined
        })),
        type: 'tribal',
        requirements: (character) => character.tribe === template.tribe
      });
    }
  });
  
  return scenarios;
}

// Generate prophetic scenarios
function generatePropheticScenarios(): ScenarioTemplate[] {
  const scenarios: ScenarioTemplate[] = [];
  
  const prophecyTemplates = [
    {
      title: 'Vision of Danger',
      description: 'You see a future disaster',
      baseNarrative: 'A vision floods your mind - danger approaches the academy.',
      choices: [
        { text: 'Warn everyone immediately', sanityCost: 0, consequences: ['prophecy_revealed'] },
        { text: 'Investigate the vision first', sanityCost: 5, consequences: ['careful_investigation'] },
        { text: 'Try to prevent it secretly', sanityCost: 10, consequences: ['secret_intervention'] },
        { text: 'Ignore the vision', sanityCost: 20, consequences: ['ignored_prophecy'] }
      ]
    },
    {
      title: 'Future Choice Vision',
      description: 'You see the consequences of different paths',
      baseNarrative: 'Multiple possible futures flash before your eyes.',
      choices: [
        { text: 'Follow the path to success', sanityCost: 0, consequences: ['guided_by_prophecy'] },
        { text: 'Choose differently to test fate', sanityCost: 15, consequences: ['defying_fate'] },
        { text: 'Let others choose their path', sanityCost: 5, consequences: ['free_will_respected'] }
      ]
    }
  ];
  
  prophecyTemplates.forEach((template, templateIndex) => {
    for (let i = 0; i < 50; i++) {
      const scenarioId = `prophecy_${templateIndex}_${i}`;
      
      scenarios.push({
        id: scenarioId,
        title: `${template.title} ${i + 1}`,
        description: template.description,
        narrativeText: [
          template.baseNarrative,
          generatePropheticVariation()
        ],
        choices: template.choices.map((choice, index) => ({
          id: `${scenarioId}_choice_${index}`,
          text: choice.text,
          description: choice.text,
          soulCost: 0,
          sanityCost: choice.sanityCost,
          consequences: choice.consequences,
        })),
        type: 'prophetic',
        requirements: (character) => 
          character.specialPowers.includes('Foresight') || 
          character.specialPowers.includes('Enhanced Prophecy') ||
          character.tribalPowers.includes('Prophecy (rare)')
      });
    }
  });
  
  return scenarios;
}

function generateVariationText(): string {
  const variations = [
    'The situation feels familiar yet different.',
    'Something about this reminds you of a story you heard.',
    'The other dragons seem unusually tense today.',
    'You notice small details others might miss.',
    'The timing couldn\'t be more important.',
    'Your instincts tell you this matters more than it seems.',
    'You remember advice from your parents.',
    'The consequences could be far-reaching.',
    'Other students are watching your reaction.',
    'You feel the weight of responsibility.'
  ];
  
  return variations[Math.floor(Math.random() * variations.length)];
}

function generatePropheticVariation(): string {
  const prophetic = [
    'The vision is crystal clear and frightening.',
    'Images flash rapidly through your consciousness.',
    'You see multiple timelines converging.',
    'The future feels malleable, changeable.',
    'Dark possibilities cloud your sight.',
    'Hope and despair battle in your vision.',
    'Time seems to slow as understanding dawns.',
    'The weight of foreknowledge burdens you.',
    'Fate and free will dance before your eyes.',
    'The vision fades, leaving urgent purpose.'
  ];
  
  return prophetic[Math.floor(Math.random() * prophetic.length)];
}

// Combine all scenarios
export function getAllScenarios(): ScenarioTemplate[] {
  return [
    ...MAGICAL_SCENARIOS,
    ...generateMundaneScenarios(),
    ...generateTribalScenarios(), 
    ...generatePropheticScenarios()
  ];
}

export { ScenarioTemplate, ChoiceTemplate };
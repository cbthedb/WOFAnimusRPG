import { Scenario, Choice, Character, GameData } from "@shared/schema";
import { getAllScenarios } from "./massive-scenarios";

export function generateScenario(character: Character, gameData: GameData): Scenario {
  const allScenarios = getAllScenarios();
  
  // Filter based on character requirements
  const availableScenarios = allScenarios.filter(scenario => {
    if (scenario.requirements) {
      return scenario.requirements(character, gameData);
    }
    return true;
  });
  
  // Select random scenario
  const selectedTemplate = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  
  // Convert to Scenario
  const availableChoices = selectedTemplate.choices.filter(choice => {
    if (choice.requirements) {
      return choice.requirements(character);
    }
    return true;
  });

  return {
    id: selectedTemplate.id,
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    narrativeText: selectedTemplate.narrativeText,
    choices: availableChoices.map(choice => ({
      id: choice.id,
      text: choice.text,
      description: choice.description,
      soulCost: choice.soulCost,
      sanityCost: choice.sanityCost,
      consequences: choice.consequences,
      corruption: choice.corruption || false
    })),
    type: selectedTemplate.type,
    location: generateLocation(),
    timeOfDay: generateTimeOfDay(),
    weather: generateWeather()
  };
}

export function generateTimeInfo(): string {
  const times = [
    'Early Morning', 'Morning', 'Late Morning', 'Midday', 
    'Afternoon', 'Late Afternoon', 'Evening', 'Night', 'Late Night'
  ];
  return times[Math.floor(Math.random() * times.length)];
}

export function generateLocation(): string {
  const locations = [
    'History Cave', 'Prey Center', 'Art Cave', 'Healing Cave', 'Library Cave',
    'Main Entrance', 'Student Cave', 'Great Hall', 'Underground Lake',
    'Training Grounds', 'Jade Mountain Peak', 'Crystal Cave', 'Music Cave',
    'Scroll Room', 'Meditation Chamber', 'Garden Terrace', 'Astronomy Tower',
    'Sleeping Caves', 'Teachers\' Quarters', 'Hidden Passages', 'Map Room',
    'Treasure Cave', 'Study Hall', 'Dining Hall', 'Recreation Cave'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateTimeOfDay(): string {
  const times = ['Dawn', 'Morning', 'Midday', 'Afternoon', 'Dusk', 'Night'];
  return times[Math.floor(Math.random() * times.length)];
}

function generateWeather(): string {
  const weather = [
    'Clear skies', 'Partly cloudy', 'Overcast', 'Light rain', 'Heavy rain',
    'Thunderstorm', 'Foggy', 'Windy', 'Snow', 'Sunny', 'Misty'
  ];
  return weather[Math.floor(Math.random() * weather.length)];
}
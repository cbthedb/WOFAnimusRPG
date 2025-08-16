import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// For client-side use, we'll make requests to our backend which has the API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

const WINGS_OF_FIRE_CONTEXT = `
You are an AI assistant for a Wings of Fire themed role-playing game. Wings of Fire is a fantasy book series about dragons living in tribes with unique abilities.

Tribes and their abilities:
- NightWings: Mind reading, prophecy, can breathe fire
- SkyWings: Excellent fliers, breathe fire, fierce warriors  
- SeaWings: Underwater breathing, bioluminescent scales, strong swimmers
- RainWings: Color-changing scales, deadly venom, excellent climbers
- SandWings: Venomous tail barbs, survive in deserts, excellent hunters
- IceWings: Ice breath, resist cold, precise and organized
- MudWings: Breathe fire, strong and tough, some have fire immunity

The game focuses on animus dragons - rare dragons with magical powers that corrupt their soul with each use. Players make choices that affect their character's soul integrity, relationships, and story progression.

Always respond in character and maintain the Wings of Fire atmosphere. Be dramatic, descriptive, and reference dragon society, tribal politics, and the consequences of magic use.
`;

export class OpenAIService {
  static async generateScenarioResponse(prompt: string, context?: any): Promise<string> {
    try {
      const contextInfo = context ? JSON.stringify(context) : "";
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: WINGS_OF_FIRE_CONTEXT + "\n\nGenerate a dramatic, immersive response for this Wings of Fire RPG scenario. Keep responses to 2-3 sentences maximum."
          },
          {
            role: "user",
            content: `${prompt}\n\nContext: ${contextInfo}`
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return response.choices[0].message.content || "The mystical energies swirl around you, but their meaning remains unclear.";
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return "The magical energies are too chaotic to interpret right now.";
    }
  }

  static async generateMindReading(character: any, scenario: string): Promise<string> {
    const prompt = `As a ${character.tribe} dragon${character.isAnimus ? ' with animus powers' : ''}, you use your mind-reading abilities in this situation: ${scenario}. What thoughts do you pick up from other dragons nearby?`;
    
    return await this.generateScenarioResponse(prompt, { 
      soulCorruption: character.soulCorruptionStage,
      location: character.location 
    });
  }

  static async generateProphecy(character: any, scenario: string): Promise<string> {
    const prompt = `As a ${character.tribe} dragon${character.isAnimus ? ' with animus powers' : ''}, you have a prophetic vision about: ${scenario}. What cryptic future do you see?`;
    
    return await this.generateScenarioResponse(prompt, { 
      soulCorruption: character.soulCorruptionStage,
      age: character.age 
    });
  }

  static async generateFutureVision(character: any, scenario: string): Promise<string> {
    const prompt = `As a ${character.tribe} dragon${character.isAnimus ? ' with animus powers' : ''}, you peer into possible futures regarding: ${scenario}. What potential outcomes do you glimpse?`;
    
    return await this.generateScenarioResponse(prompt, { 
      soulCorruption: character.soulCorruptionStage,
      relationships: Object.keys(character.relationships).length 
    });
  }

  static async generateTribalPowerUse(character: any, power: string, scenario: string): Promise<string> {
    const prompt = `As a ${character.tribe} dragon, you use your tribal power "${power}" in this situation: ${scenario}. Describe the dramatic result and its effect on the story.`;
    
    return await this.generateScenarioResponse(prompt, { 
      tribe: character.tribe,
      soulCorruption: character.soulCorruptionStage 
    });
  }

  static async generateCustomAction(character: any, action: string, scenario: string): Promise<string> {
    const prompt = `As a ${character.tribe} dragon${character.isAnimus ? ' with animus powers' : ''}, you attempt to: ${action}. Current situation: ${scenario}. Describe what happens and how it affects the story.`;
    
    return await this.generateScenarioResponse(prompt, { 
      action,
      currentScene: scenario,
      corruption: character.soulCorruptionStage 
    });
  }

  static async generateCorruptionWhisper(character: any): Promise<string> {
    const prompts = [
      "Generate a dark, tempting whisper that a corrupted soul might hear, encouraging evil actions.",
      "Create a sinister suggestion that corruption whispers to a dragon, tempting them toward darkness.",
      "Generate an evil thought that manifests as a whisper in a corrupted dragon's mind.",
    ];
    
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return await this.generateScenarioResponse(prompt, { 
      soulCorruption: character.soulCorruptionStage,
      tribe: character.tribe 
    });
  }
}
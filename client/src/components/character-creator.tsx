import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dice6, Sparkles, Zap } from "lucide-react";
import { generateCharacter } from "@/lib/character-generator";
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

interface CharacterCreatorProps {
  onCreateCharacter: (character: Character) => void;
  onCancel: () => void;
}

export default function CharacterCreator({ onCreateCharacter, onCancel }: CharacterCreatorProps) {
  const [customName, setCustomName] = useState("");
  const [selectedTribe, setSelectedTribe] = useState<string>("");
  const [isAnimus, setIsAnimus] = useState(false);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [attributes, setAttributes] = useState({
    strength: 50,
    intelligence: 50,
    charisma: 50,
    wisdom: 50
  });

  const handleRandomize = () => {
    const randomChar = generateCharacter();
    setCustomName(randomChar.name);
    setSelectedTribe(randomChar.tribe);
    setIsAnimus(randomChar.isAnimus);
    setSelectedPowers(randomChar.tribalPowers);
    setAttributes({
      strength: randomChar.strength,
      intelligence: randomChar.intelligence,
      charisma: randomChar.charisma,
      wisdom: randomChar.wisdom
    });
  };

  const handlePowerToggle = (power: string) => {
    setSelectedPowers(prev => 
      prev.includes(power) 
        ? prev.filter(p => p !== power)
        : [...prev, power]
    );
  };

  const handleCreateCustom = () => {
    const baseChar = generateCharacter();
    const customCharacter: Character = {
      ...baseChar,
      name: customName || baseChar.name,
      tribe: selectedTribe || baseChar.tribe,
      isAnimus,
      tribalPowers: selectedPowers,
      strength: attributes.strength,
      intelligence: attributes.intelligence,
      charisma: attributes.charisma,
      wisdom: attributes.wisdom,
      soulPercentage: 100,
      sanityPercentage: 100
    };
    onCreateCharacter(customCharacter);
  };

  const availablePowers = selectedTribe ? TRIBAL_POWERS[selectedTribe as keyof typeof TRIBAL_POWERS] : [];

  return (
    <div className="min-h-screen bg-dragon-gradient text-slate-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="font-fantasy text-3xl text-purple-300 text-center">
              <span className="mr-3">🐉</span>
              Create Your Dragon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleRandomize}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Dice6 className="w-4 h-4 mr-2" />
                Randomize Everything
              </Button>
              <Button 
                onClick={() => onCreateCharacter(generateCharacter())}
                variant="outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Quick Start (Random)
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-fantasy text-xl text-purple-300">Basic Information</h3>
                
                <div>
                  <Label htmlFor="name">Dragon Name</Label>
                  <Input
                    id="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter custom name or leave blank for random"
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="tribe">Tribe</Label>
                  <Select value={selectedTribe} onValueChange={setSelectedTribe}>
                    <SelectTrigger className="bg-black/50 border-purple-500/30">
                      <SelectValue placeholder="Choose your tribe" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIBES.map(tribe => (
                        <SelectItem key={tribe} value={tribe}>{tribe}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="animus" 
                    checked={isAnimus}
                    onCheckedChange={(checked) => setIsAnimus(checked === true)}
                  />
                  <Label htmlFor="animus" className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-red-400" />
                    Animus Dragon (Soul magic abilities)
                  </Label>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <h3 className="font-fantasy text-xl text-purple-300">Attributes</h3>
                
                {Object.entries(attributes).map(([attr, value]) => (
                  <div key={attr}>
                    <Label className="capitalize">{attr}: {value}</Label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={value}
                      onChange={(e) => setAttributes(prev => ({
                        ...prev,
                        [attr]: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tribal Powers */}
            {selectedTribe && (
              <div className="space-y-4">
                <h3 className="font-fantasy text-xl text-purple-300">
                  {selectedTribe} Tribal Powers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePowers.map(power => (
                    <div 
                      key={power}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPowers.includes(power)
                          ? 'bg-purple-600/50 border-purple-400'
                          : 'bg-black/50 border-purple-500/30 hover:bg-purple-500/20'
                      }`}
                      onClick={() => handlePowerToggle(power)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{power}</span>
                        {selectedPowers.includes(power) && (
                          <Badge variant="secondary" className="ml-2">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Select the powers your dragon has mastered. You can choose multiple abilities.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-6">
              <Button 
                onClick={handleCreateCustom}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Character
              </Button>
              <Button 
                onClick={onCancel}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
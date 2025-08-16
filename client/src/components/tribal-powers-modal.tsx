import { Character } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpenAIService } from "@/lib/openai-service";
import { Zap, Eye, Flame, Droplets, Snowflake, Leaf, Moon, Sparkles } from "lucide-react";
import { useState } from "react";

interface TribalPowersModalProps {
  character: Character;
  currentScenario?: string;
  isOpen: boolean;
  onClose: () => void;
  onUsePower: (power: string, scenario?: string) => void;
}

const POWER_ICONS = {
  "Fire resistance": Flame,
  "Mud camouflage": Eye,
  "Enhanced strength when warm": Zap,
  "Venomous tail barb": Zap,
  "Desert survival": Flame,
  "Heat resistance": Flame,
  "Superior flight speed": Sparkles,
  "Fire breathing": Flame,
  "High altitude adaptation": Sparkles,
  "Underwater breathing": Droplets,
  "Bioluminescent scales": Sparkles,
  "Deep sea pressure resistance": Droplets,
  "Frost breath": Snowflake,
  "Cold immunity": Snowflake,
  "Serrated claws": Zap,
  "Color-changing scales": Sparkles,
  "Acidic venom": Zap,
  "Prehensile tail": Zap,
  "Future sight": Moon,
  "Mind reading": Eye,
  "Silk production": Sparkles,
  "Metamorphosis": Sparkles,
  "Enhanced agility": Zap,
  "Paralytic stinger": Zap,
  "Hive mind connection": Eye,
  "Toxic breath": Zap,
  "Plant manipulation": Leaf,
  "Leaf speak": Leaf,
  "Photosynthesis healing": Leaf,
};

export default function TribalPowersModal({ character, currentScenario, isOpen, onClose, onUsePower }: TribalPowersModalProps) {
  const [selectedPower, setSelectedPower] = useState<string | null>(null);
  const [powerScenarios, setPowerScenarios] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const allPowers = [...character.tribalPowers, ...character.specialPowers];

  const getPowerIcon = (power: string) => {
    const IconComponent = POWER_ICONS[power as keyof typeof POWER_ICONS];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
  };

  const handlePowerSelect = async (power: string) => {
    setSelectedPower(power);
    const powerType = determinePowerType(power);
    const context = { 
      turn: Math.floor(Math.random() * 100),
      currentSituation: currentScenario || "general situation",
      powerName: power
    };
    const response = await OpenAIService.generateTribalPowerUse(character, power, currentScenario || "current situation");
    setPowerScenarios([response]);
    setAiResponse(null);
  };

  const handleUsePowerWithScenario = async (scenario: string) => {
    const response = await OpenAIService.generateTribalPowerUse(character, selectedPower!, scenario);
    setAiResponse(response);
    onUsePower(selectedPower!, scenario);
  };

  const handleUseVisionPower = async (power: string) => {
    if (power.toLowerCase().includes('future') || power.toLowerCase().includes('prophecy')) {
      const prophecy = await OpenAIService.generateProphecy(character, "current situation");
      setAiResponse(prophecy);
    } else if (power.toLowerCase().includes('mind')) {
      const vision = await OpenAIService.generateMindReading(character, "nearby dragons");
      setAiResponse(vision);
    }
    onUsePower(power);
  };

  const determinePowerType = (power: string): string => {
    const powerLower = power.toLowerCase();
    if (powerLower.includes('fire') || powerLower.includes('flame') || powerLower.includes('breath')) return 'fire';
    if (powerLower.includes('ice') || powerLower.includes('frost') || powerLower.includes('cold')) return 'ice';
    if (powerLower.includes('water') || powerLower.includes('sea') || powerLower.includes('underwater')) return 'water';
    if (powerLower.includes('earth') || powerLower.includes('mud')) return 'earth';
    if (powerLower.includes('electric') || powerLower.includes('lightning')) return 'electricity';
    if (powerLower.includes('mind')) return 'mind_reading';
    if (powerLower.includes('future') || powerLower.includes('prophecy')) return 'prophecy';
    if (powerLower.includes('camouflage') || powerLower.includes('color')) return 'camouflage';
    return 'fire';
  };

  const resetModal = () => {
    setSelectedPower(null);
    setPowerScenarios([]);
    setAiResponse(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetModal(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-100">
            {character.hybridTribes ? "Hybrid" : character.tribe} Powers & Abilities
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedPower ? (
            <>
              {/* Tribal Powers */}
              {character.tribalPowers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-200 mb-3">Tribal Powers</h3>
                  <div className="space-y-3">
                    {character.tribalPowers.map((power, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg">
                        <div className="flex items-center">
                          {getPowerIcon(power)}
                          <span className="ml-3 font-medium text-purple-100">{power}</span>
                        </div>
                        <div className="flex gap-2">
                          {(power.toLowerCase().includes('future') || power.toLowerCase().includes('mind') || power.toLowerCase().includes('prophecy')) && (
                            <Button
                              size="sm"
                              onClick={() => handleUseVisionPower(power)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Vision
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handlePowerSelect(power)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Powers */}
              {character.specialPowers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-200 mb-3">Special Abilities</h3>
                  <div className="space-y-3">
                    {character.specialPowers.map((power, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg">
                        <div className="flex items-center">
                          {getPowerIcon(power)}
                          <span className="ml-3 font-medium text-blue-100">{power}</span>
                          <Badge variant="outline" className="ml-2 text-xs text-amber-400 border-amber-400">
                            Rare
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePowerSelect(power)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Powers */}
              {allPowers.length === 0 && (
                <div className="text-center py-8 text-purple-300">
                  <p>You have not yet manifested any special powers.</p>
                  <p className="text-sm mt-2">Powers may develop as you grow and face challenges.</p>
                </div>
              )}

              {/* Animus Warning */}
              {character.isAnimus && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-red-200 text-sm">
                    <strong>Animus Warning:</strong> Your animus magic is far more powerful than these tribal abilities, 
                    but remember - every spell costs part of your soul.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Power Usage Scenarios */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-purple-300 flex items-center">
                  {getPowerIcon(selectedPower)}
                  <span className="ml-2">Using: {selectedPower}</span>
                </h4>
                <Button size="sm" variant="ghost" onClick={resetModal}>Back</Button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-slate-300">Choose how you want to use this power:</p>
                {powerScenarios.map((scenario, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-black/30 rounded-lg border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => handleUsePowerWithScenario(scenario)}
                  >
                    <p className="text-sm text-slate-200">{scenario}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
              <div className="flex items-center mb-2">
                <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                <h4 className="font-semibold text-purple-300">Mystical Vision</h4>
              </div>
              <p className="text-sm text-slate-200 italic">{aiResponse}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => { resetModal(); onClose(); }} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
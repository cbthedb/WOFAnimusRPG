import { useState } from "react";
import { Character } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Skull, Zap, Shield, Cloud, Heart, Sword, Eye } from "lucide-react";
import { ENHANCED_MAGIC_SPELLS, calculateSpellSoulCost } from "@/lib/enhanced-magic-system";

interface EnhancedMagicModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onCastSpell?: (spellName: string, soulCost: number) => void;
}

const typeIcons = {
  enchantment: Wand2,
  combat: Sword,
  healing: Heart,
  weather: Cloud,
  curse: Skull,
  summoning: Eye
};

const typeColors = {
  enchantment: "bg-purple-600",
  combat: "bg-red-600", 
  healing: "bg-green-600",
  weather: "bg-blue-600",
  curse: "bg-black",
  summoning: "bg-orange-600"
};

export default function EnhancedMagicModal({ 
  isOpen, 
  onClose, 
  character,
  onCastSpell 
}: EnhancedMagicModalProps) {
  const [selectedType, setSelectedType] = useState<string>("enchantment");

  if (!character.isAnimus) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-black/90 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Magic Denied</DialogTitle>
            <DialogDescription className="text-purple-200">
              Only animus dragons can cast soul magic. Your character lacks this rare and dangerous gift.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const spellsByType = ENHANCED_MAGIC_SPELLS.reduce((acc, spell) => {
    if (!acc[spell.type]) acc[spell.type] = [];
    acc[spell.type].push(spell);
    return acc;
  }, {} as Record<string, typeof ENHANCED_MAGIC_SPELLS>);

  const handleCastSpell = (spellName: string) => {
    const spell = ENHANCED_MAGIC_SPELLS.find(s => s.name === spellName);
    if (spell && onCastSpell) {
      const soulCost = calculateSpellSoulCost(spell);
      onCastSpell(spellName, soulCost);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black/90 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="font-fantasy text-2xl text-purple-300 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-red-400" />
            Animus Magic Grimoire
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Channel your soul's power to reshape reality itself. Each spell costs a fragment of your very essence.
          </DialogDescription>
        </DialogHeader>

        {/* Soul Status Warning */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <Skull className="w-5 h-5 mr-2 text-red-400" />
            <span className="font-semibold text-red-300">Soul Integrity: {character.soulPercentage}%</span>
          </div>
          <p className="text-sm text-red-200">
            Corruption Stage: <Badge variant="destructive">{character.soulCorruptionStage}</Badge>
          </p>
          {character.soulPercentage < 50 && (
            <p className="text-xs text-red-300 mt-2">
              ⚠️ Your soul is heavily corrupted. Magic use is increasingly dangerous.
            </p>
          )}
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-6 bg-black/50">
            {Object.keys(spellsByType).map(type => {
              const Icon = typeIcons[type as keyof typeof typeIcons];
              return (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className="flex flex-col items-center p-2 data-[state=active]:bg-purple-600"
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs capitalize">{type}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(spellsByType).map(([type, spells]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="grid gap-4">
                {spells.map((spell) => {
                  const Icon = typeIcons[spell.type as keyof typeof typeIcons];
                  const canCast = character.soulPercentage >= spell.soulCost[0];
                  
                  return (
                    <Card 
                      key={spell.name}
                      className={`bg-black/40 border-purple-500/30 ${
                        !canCast ? 'opacity-50' : 'hover:bg-purple-500/10'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${typeColors[spell.type as keyof typeof typeColors]}`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-purple-300">
                                {spell.name}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant={spell.category === 'catastrophic' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {spell.category}
                                </Badge>
                                <span className="text-sm text-slate-400">
                                  Soul Cost: {spell.soulCost[0]}-{spell.soulCost[1]}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleCastSpell(spell.name)}
                            disabled={!canCast}
                            variant={spell.category === 'catastrophic' ? 'destructive' : 'default'}
                            size="sm"
                          >
                            Cast Spell
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-purple-200 mb-3">{spell.description}</p>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-purple-300 text-sm">Possible Effects:</h4>
                          <ul className="space-y-1">
                            {spell.examples.map((example, index) => (
                              <li key={index} className="text-sm text-slate-300 flex items-start">
                                <span className="text-purple-400 mr-2">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {spell.category === 'catastrophic' && (
                          <div className="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded">
                            <p className="text-xs text-red-300 flex items-center">
                              <Skull className="w-3 h-3 mr-1" />
                              WARNING: Catastrophic magic may completely corrupt your soul
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
          <h4 className="font-semibold text-purple-300 mb-2">Remember:</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Each spell permanently removes soul fragments</li>
            <li>• Higher-tier magic carries exponentially greater risks</li>
            <li>• Soul corruption changes your personality and choices</li>
            <li>• At 0% soul, the AI takes complete control of your character</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
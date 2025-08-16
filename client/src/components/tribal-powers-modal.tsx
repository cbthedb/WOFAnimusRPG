import { Character } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Eye, Flame, Droplets, Snowflake, Leaf, Moon, Sparkles } from "lucide-react";

interface TribalPowersModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onUsePower: (power: string) => void;
}

const POWER_ICONS = {
  "Fireproof (with siblings)": Flame,
  "Physical strength": Zap,
  "Hold breath (1 hour)": Droplets,
  "Poisonous tail stinger": Zap,
  "Heat resistance": Flame,
  "Desert camouflage": Eye,
  "Superior flight": Sparkles,
  "Aerial combat mastery": Zap,
  "Enhanced fire breath": Flame,
  "Underwater breathing": Droplets,
  "Night vision underwater": Eye,
  "Bioluminescent communication": Sparkles,
  "Frostbreath": Snowflake,
  "Cold resistance": Snowflake,
  "Armored scales": Zap,
  "Combat tail spines": Zap,
  "Color-changing scales": Sparkles,
  "Deadly venom spit": Zap,
  "Prehensile tail": Zap,
  "Mind reading (rare)": Eye,
  "Prophecy (rare)": Moon,
  "Night camouflage": Eye,
  "Silk production": Sparkles,
  "Flame silk (post-metamorphosis)": Flame,
  "Various venoms": Zap,
  "Mind-control toxins": Eye,
  "Fire breath": Flame,
  "Resistant scales": Zap,
  "Leafspeak (plant control)": Leaf,
  "Forest camouflage": Leaf,
  "Poison knowledge": Zap
};

export default function TribalPowersModal({ character, isOpen, onClose, onUsePower }: TribalPowersModalProps) {
  const allPowers = [...character.tribalPowers, ...character.specialPowers];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-100">
            {character.tribe} Powers & Abilities
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tribal Powers */}
          {character.tribalPowers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-purple-200 mb-3">Tribal Powers</h3>
              <div className="grid gap-3">
                {character.tribalPowers.map((power, index) => {
                  const IconComponent = POWER_ICONS[power as keyof typeof POWER_ICONS] || Zap;
                  return (
                    <Card key={index} className="bg-purple-900/40 border-purple-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
                          <IconComponent className="w-4 h-4" />
                          {power}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {character.tribe} Ability
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onUsePower(power)}
                            className="hover:bg-purple-800"
                          >
                            Use Power
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Powers */}
          {character.specialPowers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-purple-200 mb-3">Special Abilities</h3>
              <div className="grid gap-3">
                {character.specialPowers.map((power, index) => {
                  const IconComponent = POWER_ICONS[power as keyof typeof POWER_ICONS] || Moon;
                  return (
                    <Card key={index} className="bg-purple-900/40 border-purple-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
                          <IconComponent className="w-4 h-4" />
                          {power}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs text-amber-400 border-amber-400">
                            Rare Ability
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onUsePower(power)}
                            className="hover:bg-purple-800"
                          >
                            Use Power
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
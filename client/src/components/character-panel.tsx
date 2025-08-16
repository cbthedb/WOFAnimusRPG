import { Character } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/game-engine";
import SanityBar from "./sanity-bar";
import { Zap, Eye, Sparkles } from "lucide-react";

interface CharacterPanelProps {
  character: Character;
  onShowTribalPowers?: () => void;
}

export default function CharacterPanel({ character, onShowTribalPowers }: CharacterPanelProps) {
  const corruptionLevel = GameEngine.getCorruptionLevel(character.soulPercentage);
  
  const getSoulBarColor = () => {
    if (character.soulPercentage >= 80) return "bg-white";
    if (character.soulPercentage >= 50) return "bg-yellow-400";
    if (character.soulPercentage >= 20) return "bg-orange-500";
    return "bg-red-600 animate-pulse";
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 h-full overflow-y-auto">
        <CardContent className="p-6">
          {/* Character Avatar & Basic Info */}
          <div className="text-center mb-6">
            <img
              src={character.avatar}
              alt="Dragon character portrait"
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-purple-400 object-cover"
            />
            <h2 className="font-fantasy text-2xl font-bold text-purple-300">
              {character.name}
            </h2>
            <p className="text-purple-400 font-medium">
              {character.tribe} Dragonet
            </p>
            <p className="text-sm text-purple-200">
              {character.age} years old
            </p>
          </div>

          {/* Soul Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-200">Soul Integrity</span>
              <span className="text-sm font-bold">{character.soulPercentage}%</span>
            </div>
            <Progress
              value={character.soulPercentage}
              className="h-3"
            />
            <p className="text-xs text-slate-400 mt-1">
              {GameEngine.getCorruptionMessage(corruptionLevel)}
            </p>
          </div>

          {/* Sanity Status */}
          <div className="mb-6">
            <SanityBar sanityPercentage={character.sanityPercentage} />
          </div>

          {/* Animus & Powers Status */}
          <div className="mb-6">
            <div className="space-y-3">
              {character.isAnimus && (
                <Badge variant="destructive" className="w-full justify-center py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Animus Dragon
                </Badge>
              )}
              
              {(character.tribalPowers.length > 0 || character.specialPowers.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowTribalPowers}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Powers ({character.tribalPowers.length + character.specialPowers.length})
                </Button>
              )}
            </div>
          </div>

          {/* Character Stats */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                Attributes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Strength</div>
                  <div className="font-semibold">{character.strength}</div>
                </div>
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Intelligence</div>
                  <div className="font-semibold">{character.intelligence}</div>
                </div>
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Charisma</div>
                  <div className="font-semibold">{character.charisma}</div>
                </div>
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Wisdom</div>
                  <div className="font-semibold">{character.wisdom}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Family & Background */}
          <div className="space-y-4">
            <div>
              <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                Family
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mother:</span>
                  <span>{character.mother}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Father:</span>
                  <span>{character.father}</span>
                </div>
                {character.siblings.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Siblings:</span>
                    <span>{character.siblings.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.traits.map((trait, index) => (
                  <Badge
                    key={index}
                    variant={trait === 'Corrupted' ? 'destructive' : 'secondary'}
                    className={trait === 'Corrupted' ? 'bg-red-600/30 text-red-300' : 'bg-purple-600/30 text-purple-300'}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

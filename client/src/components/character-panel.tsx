import { Character, InventoryItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/game-engine";
import { getHybridDisplayName, getHybridPowerDescription } from "@/lib/hybrid-generator";
import SanityBar from "./sanity-bar";
import { Zap, Eye, Sparkles, Package, Heart, Users, Baby } from "lucide-react";
import { useState } from "react";

interface CharacterPanelProps {
  character: Character;
  inventory?: InventoryItem[];
  onShowTribalPowers?: () => void;
}

export default function CharacterPanel({ character, inventory = [], onShowTribalPowers }: CharacterPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "family" | "social" | "inventory">("info");
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
              {character.hybridTribes ? getHybridDisplayName(character) : `${character.tribe} Dragonet`}
            </p>
            {character.hybridTribes && (
              <div className="mt-2">
                <Badge variant="outline" className="border-rainbow bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Hybrid Dragon
                </Badge>
              </div>
            )}
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
            <div className="flex items-center justify-between mt-1">
              <Badge variant={character.soulCorruptionStage === 'Normal' ? 'default' : character.soulCorruptionStage === 'Frayed' ? 'secondary' : character.soulCorruptionStage === 'Twisted' ? 'destructive' : 'destructive'} className="text-xs">
                {character.soulCorruptionStage}
              </Badge>
              <span className="text-xs text-slate-400">
                {character.soulCorruptionStage === 'Normal' ? 'Pure soul' : character.soulCorruptionStage === 'Frayed' ? 'Minor corruption' : character.soulCorruptionStage === 'Twisted' ? 'Significant corruption' : 'Soul nearly lost'}
              </span>
            </div>
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

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-4">
            <Button
              variant={activeTab === "info" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("info")}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              Info
            </Button>
            <Button
              variant={activeTab === "family" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("family")}
              className="flex-1"
            >
              <Baby className="w-3 h-3 mr-1" />
              Family
            </Button>
            <Button
              variant={activeTab === "social" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("social")}
              className="flex-1"
            >
              <Users className="w-3 h-3 mr-1" />
              Social
            </Button>
            <Button
              variant={activeTab === "inventory" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("inventory")}
              className="flex-1"
            >
              <Package className="w-3 h-3 mr-1" />
              Items
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === "info" && (
            <div className="space-y-4">
              {/* Character Stats */}
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

              {/* Hybrid Dragon Info */}
              {character.hybridTribes && (
                <div>
                  <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                    Hybrid Heritage
                  </h3>
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 border border-purple-500/20">
                    <div className="space-y-2 text-sm">
                      {getHybridPowerDescription(character).map((desc, index) => (
                        <p key={index} className="text-slate-300">{desc}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Traits */}
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

              {/* Achievements */}
              {character.achievements.length > 0 && (
                <div>
                  <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                    Achievements
                  </h3>
                  <div className="space-y-1">
                    {character.achievements.slice(0, 5).map((achievement, index) => (
                      <Badge key={index} variant="outline" className="w-full justify-start text-xs py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                    {character.achievements.length > 5 && (
                      <p className="text-xs text-slate-400">+{character.achievements.length - 5} more...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "family" && (
            <div className="space-y-4">
              {/* Parents & Siblings */}
              <div>
                <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                  Birth Family
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

              {/* Mate & Romance */}
              {character.mate && (
                <div>
                  <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                    <Heart className="w-4 h-4 inline mr-2" />
                    Romantic Life
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mate:</span>
                      <span className="text-pink-300">{character.mate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dragonets */}
              {character.dragonets.length > 0 && (
                <div>
                  <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                    <Baby className="w-4 h-4 inline mr-2" />
                    Dragonets ({character.dragonets.length})
                  </h3>
                  <div className="space-y-3">
                    {character.dragonets.map((dragonet, index) => (
                      <div key={index} className="bg-black/30 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-purple-300">{dragonet.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {dragonet.age} years
                          </Badge>
                        </div>
                        <div className="text-xs space-y-1 text-slate-400">
                          <div>Heritage: {dragonet.hybridTribes ? dragonet.hybridTribes.join('/') : dragonet.tribe}</div>
                          <div>Personality: {dragonet.personality}</div>
                          {dragonet.isAnimus && (
                            <Badge variant="destructive" className="text-xs">
                              <Zap className="w-2 h-2 mr-1" />
                              Animus
                            </Badge>
                          )}
                          {dragonet.inheritedTraits.length > 0 && (
                            <div>Traits: {dragonet.inheritedTraits.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-4">
              <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                Relationships ({Object.keys(character.relationships).length})
              </h3>
              {Object.keys(character.relationships).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No significant relationships yet.</p>
              ) : (
                <div className="space-y-2">
                  {Object.values(character.relationships).slice(0, 8).map((relationship, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-purple-300">{relationship.name}</span>
                        <Badge 
                          variant={relationship.type === 'mate' || relationship.type === 'romantic' ? 'default' : relationship.type === 'friend' ? 'secondary' : relationship.type === 'rival' || relationship.type === 'enemy' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {relationship.type === 'mate' ? '💕 Mate' : relationship.type === 'romantic' ? '💖 Romance' : relationship.type === 'friend' ? '🤝 Friend' : relationship.type === 'rival' ? '⚔️ Rival' : relationship.type === 'enemy' ? '💀 Enemy' : '🤷 Neutral'}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        <div>Strength: {relationship.strength}</div>
                        {relationship.history.length > 0 && (
                          <div>Last: {relationship.history[relationship.history.length - 1]}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {Object.keys(character.relationships).length > 8 && (
                    <p className="text-xs text-slate-400 text-center">+{Object.keys(character.relationships).length - 8} more relationships...</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              <h3 className="font-fantasy text-lg font-semibold text-purple-300 mb-3">
                <Package className="w-4 h-4 inline mr-2" />
                Inventory ({inventory.length})
              </h3>
              {inventory.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No items in inventory.</p>
              ) : (
                <div className="space-y-2">
                  {inventory.slice(0, 6).map((item, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-purple-300">{item.name}</span>
                        <Badge variant={item.type === 'enchanted_object' ? 'default' : item.type === 'magical_artifact' ? 'destructive' : 'secondary'} className="text-xs">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{item.description}</p>
                      {item.enchantments.length > 0 && (
                        <div className="text-xs text-blue-300">
                          ✨ {item.enchantments.join(', ')}
                        </div>
                      )}
                      {item.soulCostToCreate && (
                        <div className="text-xs text-red-300 mt-1">
                          Soul cost: {item.soulCostToCreate}%
                        </div>
                      )}
                    </div>
                  ))}
                  {inventory.length > 6 && (
                    <p className="text-xs text-slate-400 text-center">+{inventory.length - 6} more items...</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

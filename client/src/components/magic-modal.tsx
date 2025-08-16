import { Character, MagicSpell, CustomSpell, InventoryItem } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Skull, Zap, Shield, Sparkles, Package } from "lucide-react";
import { useState } from "react";
import { ENHANCED_MAGIC_SPELLS, calculateSpellSoulCost } from "@/lib/enhanced-magic-system";

interface MagicModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  inventory: InventoryItem[];
  onCastSpell: (spell: CustomSpell) => void;
}


export default function MagicModal({ isOpen, onClose, character, inventory, onCastSpell }: MagicModalProps) {
  const [activeTab, setActiveTab] = useState<"predefined" | "custom" | "inventory">("custom");
  const [customSpell, setCustomSpell] = useState({
    targetObject: "",
    enchantmentDescription: "",
    spellType: "enchantment" as const
  });
  
  const estimateSpellCost = () => {
    if (!customSpell.targetObject || !customSpell.enchantmentDescription) return 0;
    
    const words = customSpell.enchantmentDescription.split(' ').length;
    const complexity = words > 20 ? "catastrophic" : words > 10 ? "complex" : words > 5 ? "moderate" : "simple";
    
    const baseCost = {
      simple: [1, 5],
      moderate: [5, 15],
      complex: [15, 30],
      catastrophic: [30, 60]
    }[complexity];
    
    const typeMultiplier = {
      enchantment: 1,
      healing: 0.8,
      weather: 1.2,
      combat: 1.1,
      summoning: 1.3,
      curse: 1.4
    }[customSpell.spellType];
    
    return Math.floor(baseCost[1] * typeMultiplier);
  };
  
  const handleCastCustomSpell = () => {
    if (!customSpell.targetObject || !customSpell.enchantmentDescription) return;
    
    const spell: CustomSpell = {
      id: `custom_${Date.now()}`,
      targetObject: customSpell.targetObject,
      enchantmentDescription: customSpell.enchantmentDescription,
      estimatedSoulCost: estimateSpellCost(),
      spellType: customSpell.spellType,
      complexity: estimateSpellCost() > 30 ? "catastrophic" : estimateSpellCost() > 15 ? "complex" : estimateSpellCost() > 5 ? "moderate" : "simple",
      turnCast: Date.now()
    };
    
    onCastSpell(spell);
    setCustomSpell({ targetObject: "", enchantmentDescription: "", spellType: "enchantment" });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'minor':
        return 'border-green-500/30 bg-green-500/10';
      case 'moderate':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'major':
        return 'border-orange-500/30 bg-orange-500/10';
      case 'catastrophic':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'minor':
        return <Shield className="w-5 h-5" />;
      case 'moderate':
        return <Zap className="w-5 h-5" />;
      case 'major':
        return <Sparkles className="w-5 h-5" />;
      case 'catastrophic':
        return <Skull className="w-5 h-5" />;
      default:
        return <Wand2 className="w-5 h-5" />;
    }
  };

  const getCorruptionInfo = () => {
    const stage = character.soulCorruptionStage;
    switch (stage) {
      case 'Normal':
        return { text: "Full control", color: "text-green-400" };
      case 'Frayed':
        return { text: "Occasional dark thoughts", color: "text-yellow-400" };
      case 'Twisted':
        return { text: "Partial AI control", color: "text-orange-400" };
      case 'Broken':
        return { text: "Mostly corrupted", color: "text-red-400" };
    }
  };

  const corruptionInfo = getCorruptionInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-black/90 border-purple-500/50 text-slate-100 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fantasy text-2xl font-bold text-purple-300 flex items-center">
            <Wand2 className="mr-3" />
            Animus Magic Spells
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Understanding the cost of power. Each spell category represents increasing corruption to your soul.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button 
            variant={activeTab === "custom" ? "default" : "outline"}
            onClick={() => setActiveTab("custom")}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Cast Custom Spell
          </Button>
          <Button 
            variant={activeTab === "predefined" ? "default" : "outline"}
            onClick={() => setActiveTab("predefined")}
            className="flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Spell Examples
          </Button>
          <Button 
            variant={activeTab === "inventory" ? "default" : "outline"}
            onClick={() => setActiveTab("inventory")}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Inventory ({inventory.length})
          </Button>
        </div>

        {/* Custom Spell Casting */}
        {activeTab === "custom" && (
          <div className="space-y-6">
            <Card className="border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="text-purple-300">Create Your Own Animus Spell</CardTitle>
                <DialogDescription className="text-purple-200">
                  Describe what object you want to enchant and what you want it to do. Be creative!
                </DialogDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target-object" className="text-slate-300">What do you want to enchant?</Label>
                  <Input
                    id="target-object"
                    placeholder="e.g., a sword, a ring, a cloak, the weather, an enemy..."
                    value={customSpell.targetObject}
                    onChange={(e) => setCustomSpell({...customSpell, targetObject: e.target.value})}
                    className="bg-black/50 border-purple-400/30 text-slate-100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="enchantment" className="text-slate-300">Describe the enchantment:</Label>
                  <Input
                    id="enchantment"
                    placeholder="e.g., to cut through any material, to make me invisible, to summon lightning..."
                    value={customSpell.enchantmentDescription}
                    onChange={(e) => setCustomSpell({...customSpell, enchantmentDescription: e.target.value})}
                    className="bg-black/50 border-purple-400/30 text-slate-100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="spell-type" className="text-slate-300">Spell Type:</Label>
                  <Select value={customSpell.spellType} onValueChange={(value: any) => setCustomSpell({...customSpell, spellType: value})}>
                    <SelectTrigger className="bg-black/50 border-purple-400/30 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enchantment">Enchantment</SelectItem>
                      <SelectItem value="combat">Combat</SelectItem>
                      <SelectItem value="healing">Healing</SelectItem>
                      <SelectItem value="weather">Weather</SelectItem>
                      <SelectItem value="curse">Curse</SelectItem>
                      <SelectItem value="summoning">Summoning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-black/30 p-4 rounded border border-yellow-400/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-300 font-semibold">Estimated Soul Cost:</span>
                    <span className="text-yellow-300 font-bold text-lg">{estimateSpellCost()}%</span>
                  </div>
                  <p className="text-xs text-yellow-200">
                    More complex descriptions and dangerous spell types cost more soul.
                  </p>
                </div>
                
                <Button 
                  onClick={handleCastCustomSpell}
                  disabled={!customSpell.targetObject || !customSpell.enchantmentDescription || character.soulPercentage < estimateSpellCost()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Cast Spell ({estimateSpellCost()}% soul cost)
                </Button>
              </CardContent>
            </Card>
            
            {/* Soul Status */}
            <Card className="border-purple-500/30 bg-purple-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-400">
                  <Skull />
                  Your Soul Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Current Purity:</span>
                    <span className="font-bold">{character.soulPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Corruption Stage:</span>
                    <span className={`font-semibold ${corruptionInfo.color}`}>
                      {character.soulCorruptionStage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-3 space-y-1">
                    <div>• Normal (75-100%): Full control over choices</div>
                    <div>• Frayed (50-74%): Occasional dark thoughts</div>
                    <div>• Twisted (25-49%): AI may override decisions</div>
                    <div>• Broken (0-24%): Mostly AI controlled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Predefined Spell Examples */}
        {activeTab === "predefined" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENHANCED_MAGIC_SPELLS.slice(0, 6).map((spell) => (
              <Card key={spell.name} className={`${getCategoryColor(spell.category)} border`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(spell.category)}
                    {spell.name}
                    <Badge
                      variant="outline"
                      className={`ml-auto ${
                        spell.category === 'minor'
                          ? 'border-green-400 text-green-400'
                          : spell.category === 'moderate'
                          ? 'border-yellow-400 text-yellow-400'
                          : spell.category === 'major'
                          ? 'border-orange-400 text-orange-400'
                          : 'border-red-400 text-red-400'
                      }`}
                    >
                      {spell.soulCost[0]}-{spell.soulCost[1]}% soul
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">{spell.description}</p>
                  <ul className="text-sm space-y-1 text-slate-300">
                    {spell.examples.slice(0, 3).map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Inventory */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            {inventory.length === 0 ? (
              <Card className="border-gray-500/30 bg-gray-500/10">
                <CardContent className="pt-6 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-slate-300">Your inventory is empty.</p>
                  <p className="text-slate-400 text-sm">Create enchanted objects to add them to your inventory.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.map((item) => (
                  <Card key={item.id} className="border-blue-500/30 bg-blue-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-blue-300">
                        <Package className="w-5 h-5" />
                        {item.name}
                        <Badge variant="outline" className="ml-auto border-blue-400 text-blue-400">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-3">{item.description}</p>
                      {item.enchantments.length > 0 && (
                        <div>
                          <p className="text-xs text-blue-300 font-semibold mb-1">Enchantments:</p>
                          <ul className="text-xs space-y-1 text-slate-300">
                            {item.enchantments.map((enchantment, index) => (
                              <li key={index}>• {enchantment}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.soulCostToCreate && (
                        <p className="text-xs text-slate-400 mt-2">
                          Soul cost to create: {item.soulCostToCreate}%
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-4">
          <h4 className="font-semibold text-purple-300 mb-2 flex items-center">
            <Skull className="w-4 h-4 mr-2" />
            Warning: The Price of Power
          </h4>
          <p className="text-sm text-purple-200">
            Every use of animus magic corrupts your soul. As your purity decreases, you will lose control
            over your choices. The game will begin making increasingly dark decisions for you. At 0% purity,
            you become a villain that others must stop.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

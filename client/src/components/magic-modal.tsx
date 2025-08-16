import { Character, MagicSpell } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, Skull, Zap, Shield } from "lucide-react";
import { GameEngine } from "@/lib/game-engine";

interface MagicModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
}

const MAGIC_SPELLS: MagicSpell[] = [
  {
    name: "Minor Enchantments",
    category: "minor",
    soulCost: [1, 3],
    description: "Small magical effects with minimal soul cost",
    examples: [
      "Repair small objects",
      "Create light or warmth",
      "Simple communication aids",
      "Minor illusions"
    ]
  },
  {
    name: "Moderate Magic",
    category: "moderate",
    soulCost: [5, 12],
    description: "Significant magical effects with noticeable soul cost",
    examples: [
      "Enhance physical abilities",
      "Create lasting magical items",
      "Weather manipulation",
      "Advanced illusions"
    ]
  },
  {
    name: "Dangerous Spells",
    category: "dangerous",
    soulCost: [15, 40],
    description: "Powerful magic that severely corrupts your soul",
    examples: [
      "Mind control",
      "Life and death magic",
      "Reality alteration",
      "Curse creation"
    ]
  }
];

export default function MagicModal({ isOpen, onClose, character }: MagicModalProps) {
  const corruptionLevel = GameEngine.getCorruptionLevel(character.soulPercentage);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'minor':
        return 'border-green-500/30 bg-green-500/10';
      case 'moderate':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'dangerous':
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
      case 'dangerous':
        return <Skull className="w-5 h-5" />;
      default:
        return <Wand2 className="w-5 h-5" />;
    }
  };

  const getCorruptionInfo = () => {
    switch (corruptionLevel) {
      case 'pure':
        return { text: "Full control", color: "text-green-400" };
      case 'tainted':
        return { text: "Occasional dark thoughts", color: "text-yellow-400" };
      case 'corrupted':
        return { text: "Partial AI control", color: "text-orange-400" };
      case 'lost':
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {MAGIC_SPELLS.map((spell) => (
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
                  {spell.examples.map((example, index) => (
                    <li key={index}>• {example}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card className="border-purple-500/30 bg-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-purple-400">
                <Wand2 />
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
                  <span className="text-slate-300">Status:</span>
                  <span className={`font-semibold ${corruptionInfo.color}`}>
                    {corruptionInfo.text}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-3 space-y-1">
                  <div>• 80-100%: Full control over choices</div>
                  <div>• 50-79%: Occasional dark thoughts</div>
                  <div>• 20-49%: AI may override some decisions</div>
                  <div>• 0-19%: Mostly AI controlled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

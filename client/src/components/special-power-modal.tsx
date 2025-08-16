import { Character } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockAIService } from "@/lib/mock-ai-service";
import { Eye, Brain, Sparkles, Zap, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface SpecialPowerModalProps {
  character: Character;
  powerType: 'prophecy' | 'mindreading' | 'future' | null;
  isOpen: boolean;
  onClose: () => void;
  onUsePower: (power: string, result: string) => void;
}

export default function SpecialPowerModal({ 
  character, 
  powerType, 
  isOpen, 
  onClose, 
  onUsePower 
}: SpecialPowerModalProps) {
  const [currentVision, setCurrentVision] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [soulCost, setSoulCost] = useState(0);

  const powerConfig = {
    prophecy: {
      title: "Prophecy Vision",
      icon: <Eye className="w-5 h-5" />,
      color: "blue",
      description: "Peer into the threads of fate to see what destiny holds",
      baseCost: 2,
      actions: [
        "See a vision of the near future",
        "Divine the outcome of a major decision", 
        "Glimpse potential dangers ahead",
        "Witness distant events unfolding",
        "Perceive the consequences of current actions"
      ]
    },
    mindreading: {
      title: "Mind Reading",
      icon: <Brain className="w-5 h-5" />,
      color: "purple", 
      description: "Delve into the thoughts and memories of others",
      baseCost: 3,
      actions: [
        "Read the surface thoughts of a nearby dragon",
        "Probe deeper into someone's memories",
        "Sense the emotions and intentions around you",
        "Detect lies and hidden motives",
        "Communicate telepathically with another mind"
      ]
    },
    future: {
      title: "Future Sight",
      icon: <Sparkles className="w-5 h-5" />,
      color: "cyan",
      description: "See across time with enhanced foresight",
      baseCost: 5,
      actions: [
        "Glimpse multiple possible futures",
        "See the long-term consequences of actions",
        "Witness events that will shape the world",
        "Perceive threats before they manifest",
        "View the destiny of individuals or kingdoms"
      ]
    }
  };

  const config = powerType ? powerConfig[powerType] : null;

  useEffect(() => {
    if (powerType && isOpen) {
      setUsageCount(0);
      setSoulCost(config?.baseCost || 0);
      setCurrentVision("");
    }
  }, [powerType, isOpen, config]);

  const generateVision = (actionType: string) => {
    if (!config || !powerType) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      let vision = "";
      
      switch (powerType) {
        case 'prophecy':
          const prophecy = MockAIService.generateProphecy(character, { action: actionType });
          vision = prophecy.content;
          break;
          
        case 'mindreading':
          const mindRead = MockAIService.generateVision(character, { action: actionType });
          vision = mindRead.content;
          break;
          
        case 'future':
          const futureVision = MockAIService.generateProphecy(character, { action: actionType, type: 'future' });
          vision = futureVision.content;
          break;
      }
      
      setCurrentVision(vision);
      setUsageCount(prev => prev + 1);
      setSoulCost(prev => prev + (config.baseCost * usageCount));
      setIsGenerating(false);
    }, 1000);
  };

  const usePower = () => {
    if (currentVision && config && powerType) {
      onUsePower(config.title, currentVision);
      onClose();
    }
  };

  if (!config || !powerType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-${config.color}-300 flex items-center gap-2`}>
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className={`p-4 bg-${config.color}-900/20 border border-${config.color}-500/30 rounded-lg`}>
            <p className="text-sm text-slate-300">{config.description}</p>
            
            {usageCount > 0 && (
              <div className="flex items-center gap-4 mt-2 text-xs">
                <Badge variant="outline">Uses: {usageCount}</Badge>
                <Badge variant="destructive">Soul Cost: {soulCost}%</Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200">Choose your vision:</h4>
            {config.actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full text-left p-3 border-${config.color}-500/30 hover:bg-${config.color}-500/10`}
                onClick={() => generateVision(action)}
                disabled={isGenerating}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{action}</span>
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Vision Display */}
          {currentVision && (
            <div className={`p-4 bg-gradient-to-r from-${config.color}-900/30 to-black/30 rounded-lg border border-${config.color}-500/30`}>
              <div className="flex items-center mb-2">
                {config.icon}
                <h4 className={`font-semibold text-${config.color}-300 ml-2`}>Vision Received</h4>
              </div>
              <p className="text-sm text-slate-200 italic leading-relaxed">{currentVision}</p>
              
              <div className="flex justify-end mt-4">
                <Button
                  onClick={usePower}
                  className={`bg-${config.color}-600 hover:bg-${config.color}-700`}
                >
                  Use This Vision
                </Button>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className={`p-3 bg-${config.color}-900/10 border border-${config.color}-700/30 rounded-lg`}>
            <p className="text-xs text-slate-400">
              <strong>Warning:</strong> Using {config.title.toLowerCase()} repeatedly may strain your mind and cost soul energy. 
              Each use becomes more taxing than the last.
            </p>
          </div>
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
import { Character, GameData, InventoryItem } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { OpenAIService } from "@/lib/openai-service";
import { Sparkles, Send, Package, Zap } from "lucide-react";
import { useState } from "react";

interface CustomActionModalProps {
  character: Character;
  gameData: GameData;
  inventory: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (action: string, result: string, itemUsed?: InventoryItem) => void;
}

export default function CustomActionModal({ 
  character, 
  gameData,
  inventory, 
  isOpen, 
  onClose, 
  onExecuteAction 
}: CustomActionModalProps) {
  const [customAction, setCustomAction] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionResult, setActionResult] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateActionResult = async () => {
    if (!customAction.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate AI response based on action and context
    const context = {
      turn: gameData.turn,
      location: gameData.location,
      action: customAction,
      tribe: character.tribe,
      item: selectedItem?.name,
      itemEnchantments: selectedItem?.enchantments || []
    };
    
    let result = "";
    
    if (selectedItem) {
      // Action with item usage
      result = await OpenAIService.generateCustomAction(character, `${customAction} using ${selectedItem.name}`, gameData.currentScenario.description);
    } else {
      // Pure custom action
      result = await OpenAIService.generateCustomAction(character, customAction, gameData.currentScenario.description);
    }
    
    setActionResult(result);
    setIsGenerating(false);
  };

  const executeAction = () => {
    if (actionResult) {
      onExecuteAction(customAction, actionResult, selectedItem || undefined);
      reset();
      onClose();
    }
  };

  const reset = () => {
    setCustomAction("");
    setSelectedItem(null);
    setActionResult("");
    setIsGenerating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-yellow-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Custom Action
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-slate-300">
              Describe what you want your dragon to do. Be creative! You can interact with other dragons, 
              explore locations, use items, or try anything you can imagine within the Wings of Fire universe.
            </p>
          </div>

          {/* Action Input */}
          <div className="space-y-2">
            <Label htmlFor="action">What do you want to do?</Label>
            <Input
              id="action"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="e.g., 'Approach the group of SkyWing dragonets and ask about the missing scroll' or 'Use my fire breath to light the ancient torch'"
              className="bg-black/50 border-yellow-500/30"
              disabled={isGenerating}
            />
          </div>

          {/* Inventory Selection */}
          {inventory.length > 0 && (
            <div className="space-y-3">
              <Label>Use an item (optional):</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  variant={selectedItem === null ? "default" : "outline"}
                  onClick={() => setSelectedItem(null)}
                  className="text-left p-3"
                  disabled={isGenerating}
                >
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    No item (use natural abilities)
                  </div>
                </Button>
                
                {inventory.slice(0, 5).map((item, index) => (
                  <Button
                    key={index}
                    variant={selectedItem?.id === item.id ? "default" : "outline"}
                    onClick={() => setSelectedItem(item)}
                    className="text-left p-3"
                    disabled={isGenerating}
                  >
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {selectedItem && (
                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="font-medium text-purple-300">Selected: {selectedItem.name}</span>
                  </div>
                  <p className="text-sm text-slate-300">{selectedItem.description}</p>
                  {selectedItem.enchantments.length > 0 && (
                    <div className="text-sm text-blue-300 mt-2">
                      ✨ Enchantments: {selectedItem.enchantments.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateActionResult}
            disabled={!customAction.trim() || isGenerating}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                AI is narrating your action...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                See What Happens
              </>
            )}
          </Button>

          {/* Result Display */}
          {actionResult && (
            <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-black/30 rounded-lg border border-yellow-500/30">
              <div className="flex items-center mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
                <h4 className="font-semibold text-yellow-300">Action Result</h4>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{actionResult}</p>
              
              <div className="flex justify-end mt-4">
                <Button
                  onClick={executeAction}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Commit to This Action
                </Button>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="p-3 bg-slate-900/20 border border-slate-600/30 rounded-lg">
            <h5 className="font-semibold text-slate-300 mb-2">Example Actions:</h5>
            <div className="text-xs text-slate-400 space-y-1">
              <div>• "Challenge the arrogant SkyWing to a flying race"</div>
              <div>• "Sneak into the forbidden library using my RainWing camouflage"</div>
              <div>• "Ask the wise SeaWing elder about ancient prophecies"</div>
              <div>• "Use my enchanted amulet to communicate with distant allies"</div>
              <div>• "Practice my tribal powers in the training caves"</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => { reset(); onClose(); }} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
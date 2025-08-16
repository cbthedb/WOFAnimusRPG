import { Character, GameData, Choice } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Package, SkipForward } from "lucide-react";

interface GameplayAreaProps {
  character: Character;
  gameData: GameData;
  onChoice: (choice: Choice) => void;
  onShowMagic: () => void;
  isProcessing: boolean;
}

export default function GameplayArea({
  character,
  gameData,
  onChoice,
  onShowMagic,
  isProcessing,
}: GameplayAreaProps) {
  const scenario = gameData.currentScenario;

  const getChoiceButtonColor = (choice: Choice, index: number) => {
    if (choice.corruption) {
      return "bg-red-900/50 hover:bg-red-900/70 border-red-600/30 text-red-300";
    }
    if (choice.soulCost > 10) {
      return "bg-orange-900/50 hover:bg-orange-900/70 border-orange-600/30";
    }
    if (choice.soulCost > 0) {
      return "bg-yellow-900/50 hover:bg-yellow-900/70 border-yellow-600/30";
    }
    return "bg-black/50 hover:bg-purple-500/20 border-purple-500/30";
  };

  return (
    <div className="lg:col-span-2">
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-fantasy text-xl font-semibold text-purple-300">
                {gameData.location}
              </h3>
              <p className="text-sm text-purple-200">
                Day {Math.floor(gameData.turn / 3)} • {gameData.timeInfo}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Turn</div>
              <div className="font-bold text-lg">{gameData.turn}</div>
            </div>
          </div>
        </div>

        {/* Narrative Display */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="narrative-text font-narrative text-base leading-relaxed">
            {scenario.narrativeText.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4"
                dangerouslySetInnerHTML={{
                  __html: paragraph
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                }}
              />
            ))}

            {scenario.type === 'magical' && (
              <div className="bg-black/50 border-l-4 border-purple-400 p-4 rounded-r-lg mb-6">
                <p className="font-semibold text-purple-300 mb-2">Current Scenario:</p>
                <p>{scenario.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Choice Selection Area */}
        <div className="border-t border-purple-500/30 p-6">
          <h4 className="font-fantasy text-lg font-semibold text-purple-300 mb-4">
            Choose your action:
          </h4>

          <div className="space-y-3">
            {scenario.choices.map((choice, index) => (
              <Button
                key={choice.id}
                variant="ghost"
                className={`choice-button w-full text-left p-4 border transition-all duration-300 ${getChoiceButtonColor(choice, index)}`}
                onClick={() => onChoice(choice)}
                disabled={isProcessing}
              >
                <div className="flex items-start">
                  <div className="bg-purple-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">{choice.text}</div>
                    <div className="text-sm text-slate-400 mt-1">{choice.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-500/20">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onShowMagic}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Magic Spells
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                disabled
              >
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
              disabled
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Turn
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

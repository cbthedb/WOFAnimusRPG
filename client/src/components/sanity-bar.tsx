import { Progress } from "@/components/ui/progress";
import { Brain, AlertTriangle } from "lucide-react";

interface SanityBarProps {
  sanityPercentage: number;
  className?: string;
}

export default function SanityBar({ sanityPercentage, className = "" }: SanityBarProps) {
  const getSanityColor = (sanity: number) => {
    if (sanity >= 70) return "bg-blue-500";
    if (sanity >= 50) return "bg-yellow-500";
    if (sanity >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSanityLabel = (sanity: number) => {
    if (sanity >= 70) return "Stable";
    if (sanity >= 50) return "Stressed";
    if (sanity >= 30) return "Unstable";
    if (sanity >= 10) return "Fragmented";
    return "Breaking";
  };

  const getSanityDescription = (sanity: number) => {
    if (sanity >= 70) return "Your mind is clear and focused.";
    if (sanity >= 50) return "You feel the weight of knowledge and power.";
    if (sanity >= 30) return "Reality seems less certain than before.";
    if (sanity >= 10) return "You struggle to distinguish truth from delusion.";
    return "Your grip on reality is slipping away.";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-purple-200">
            Sanity: {getSanityLabel(sanityPercentage)}
          </span>
        </div>
        <span className="text-sm text-purple-300">
          {Math.round(sanityPercentage)}%
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={sanityPercentage} 
          className="h-3 bg-purple-900/50" 
        />
        <div 
          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${getSanityColor(sanityPercentage)}`}
          style={{ width: `${sanityPercentage}%` }}
        />
      </div>
      
      <p className="text-xs text-purple-300">
        {getSanityDescription(sanityPercentage)}
      </p>
      
      {sanityPercentage <= 20 && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Warning: Mental breakdown imminent!</span>
        </div>
      )}
    </div>
  );
}
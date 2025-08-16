import { Character } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockAIService } from "@/lib/mock-ai-service";
import { MessageCircle, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ConversationMessage {
  speaker: string;
  text: string;
  isPlayer: boolean;
}

interface ConversationChoice {
  text: string;
  tone: 'friendly' | 'hostile' | 'neutral' | 'diplomatic' | 'cunning';
}

interface ConversationModalProps {
  character: Character;
  conversationTopic: string;
  otherDragon: string;
  isOpen: boolean;
  onClose: () => void;
  onConversationEnd: (outcome: string, relationship: string) => void;
}

export default function ConversationModal({ 
  character, 
  conversationTopic,
  otherDragon,
  isOpen, 
  onClose, 
  onConversationEnd 
}: ConversationModalProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentChoices, setCurrentChoices] = useState<ConversationChoice[]>([]);
  const [conversationTurn, setConversationTurn] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && conversationTopic) {
      initializeConversation();
    }
  }, [isOpen, conversationTopic]);

  const initializeConversation = () => {
    setMessages([]);
    setConversationTurn(0);
    
    // Generate opening message from the other dragon
    const openingContext = {
      topic: conversationTopic,
      speaker: otherDragon,
      turn: 0,
      playerTribe: character.tribe
    };
    
    const opening = MockAIService.generateRandomEvent(character, openingContext);
    
    setMessages([{
      speaker: otherDragon,
      text: opening.content,
      isPlayer: false
    }]);
    
    generateChoices();
  };

  const generateChoices = () => {
    const choices: ConversationChoice[] = [
      {
        text: generateChoiceText('friendly'),
        tone: 'friendly'
      },
      {
        text: generateChoiceText('neutral'),
        tone: 'neutral'
      },
      {
        text: generateChoiceText('diplomatic'),
        tone: 'diplomatic'
      }
    ];

    // Add hostile or cunning options based on character traits
    if (character.traits.includes('Fierce') || character.traits.includes('Vengeful')) {
      choices.push({
        text: generateChoiceText('hostile'),
        tone: 'hostile'
      });
    }

    if (character.traits.includes('Cunning') || character.traits.includes('Ambitious')) {
      choices.push({
        text: generateChoiceText('cunning'),
        tone: 'cunning'
      });
    }

    setCurrentChoices(choices);
  };

  const generateChoiceText = (tone: string): string => {
    const templates = {
      friendly: [
        "That's interesting! Tell me more about that.",
        "I appreciate you sharing this with me.",
        "I'd love to help if I can.",
        "That sounds like quite an adventure!"
      ],
      neutral: [
        "I see. What do you think we should do?",
        "That's certainly one way to look at it.",
        "Hmm, let me think about that.",
        "What would you suggest?"
      ],
      diplomatic: [
        "Perhaps we could find a solution that works for everyone.",
        "I understand your perspective, but consider this...",
        "Maybe there's a way to compromise here.",
        "Let's think about this carefully before acting."
      ],
      hostile: [
        "That's ridiculous! You're completely wrong.",
        "I don't have time for this nonsense.",
        "You're either lying or completely deluded.",
        "Keep talking and see what happens."
      ],
      cunning: [
        "That's... very convenient for you, isn't it?",
        "I wonder what you're not telling me.",
        "Interesting. And what do you get out of this?",
        "I'm sure there's more to this story."
      ]
    };

    const toneTemplates = templates[tone as keyof typeof templates] || templates.neutral;
    return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
  };

  const handleChoice = async (choice: ConversationChoice) => {
    setIsGenerating(true);
    
    // Add player message
    const newMessages = [...messages, {
      speaker: character.name,
      text: choice.text,
      isPlayer: true
    }];
    
    setMessages(newMessages);
    
    // Generate response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responseContext = {
      topic: conversationTopic,
      playerChoice: choice.text,
      playerTone: choice.tone,
      turn: conversationTurn + 1,
      characterTraits: character.traits
    };
    
    const response = MockAIService.generateRandomEvent(character, responseContext);
    
    const finalMessages = [...newMessages, {
      speaker: otherDragon,
      text: response.content,
      isPlayer: false
    }];
    
    setMessages(finalMessages);
    setConversationTurn(prev => prev + 1);
    
    // End conversation after 3-4 exchanges or generate new choices
    if (conversationTurn >= 2) {
      endConversation(choice.tone);
    } else {
      generateChoices();
    }
    
    setIsGenerating(false);
  };

  const endConversation = (lastTone: string) => {
    const outcomes = {
      friendly: ["The conversation ends on a positive note", "You've made a new friend", "They seem to trust you more"],
      hostile: ["The conversation escalates into conflict", "They storm off angrily", "You've made an enemy"],
      neutral: ["The conversation ends inconclusively", "You both go your separate ways", "Nothing much changes"],
      diplomatic: ["You reach a mutual understanding", "A compromise is achieved", "Both parties benefit"],
      cunning: ["You learn valuable information", "They suspect your motives", "The situation becomes complex"]
    };

    const outcomeTexts = outcomes[lastTone as keyof typeof outcomes] || outcomes.neutral;
    const outcome = outcomeTexts[Math.floor(Math.random() * outcomeTexts.length)];
    
    const relationshipChanges = {
      friendly: "improved",
      hostile: "worsened", 
      neutral: "unchanged",
      diplomatic: "strengthened",
      cunning: "complicated"
    };

    const relationship = relationshipChanges[lastTone as keyof typeof relationshipChanges];
    
    setTimeout(() => {
      onConversationEnd(outcome, relationship);
      onClose();
    }, 2000);
  };

  const getToneColor = (tone: string) => {
    const colors = {
      friendly: "text-green-400 border-green-500/30",
      hostile: "text-red-400 border-red-500/30",
      neutral: "text-slate-400 border-slate-500/30",
      diplomatic: "text-blue-400 border-blue-500/30",
      cunning: "text-purple-400 border-purple-500/30"
    };
    return colors[tone as keyof typeof colors] || colors.neutral;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-300 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversation with {otherDragon}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-slate-300">Topic: {conversationTopic}</p>
          </div>

          {/* Conversation Messages */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                message.isPlayer 
                  ? 'bg-purple-900/30 border border-purple-500/30 ml-4' 
                  : 'bg-slate-900/30 border border-slate-500/30 mr-4'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={message.isPlayer ? "default" : "outline"} className="text-xs">
                    {message.speaker}
                  </Badge>
                </div>
                <p className="text-sm text-slate-200">{message.text}</p>
              </div>
            ))}
          </div>

          {/* Conversation Choices */}
          {currentChoices.length > 0 && !isGenerating && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">How do you respond?</h4>
              {currentChoices.map((choice, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full text-left p-3 ${getToneColor(choice.tone)}`}
                  onClick={() => handleChoice(choice)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{choice.text}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {choice.tone}
                      </Badge>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-4">
              <MessageCircle className="w-6 h-6 animate-pulse mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-slate-400">They are thinking...</p>
            </div>
          )}

          {conversationTurn >= 3 && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300">Conversation concluding...</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            End Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
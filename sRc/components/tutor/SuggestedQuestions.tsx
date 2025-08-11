
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface SuggestedQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

export const SuggestedQuestions = ({ onQuestionSelect }: SuggestedQuestionsProps) => {
  const suggestedQuestions = [
    "Explain Big O notation",
    "How do hash tables work?",
    "What is dynamic programming?",
    "Explain SQL joins with examples"
  ];

  return (
    <div className="px-6 pb-6 animate-slide-in-up">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <p className="text-sm text-muted-foreground font-medium">Try asking about:</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {suggestedQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onQuestionSelect(question)}
            className={`text-sm hover-lift glass-effect border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 animate-slide-in-up animate-stagger-${index + 1}`}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};
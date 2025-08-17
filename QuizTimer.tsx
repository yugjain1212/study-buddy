
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuizTimerProps {
  isActive: boolean;
  onTimeUpdate?: (time: number) => void;
  questionStartTime?: number;
}

export const QuizTimer = ({ isActive, onTimeUpdate, questionStartTime }: QuizTimerProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      const startTime = questionStartTime || Date.now();
      interval = setInterval(() => {
        const currentTime = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(currentTime);
        onTimeUpdate?.(currentTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, questionStartTime, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="w-3 h-3" />
      {formatTime(seconds)}
    </Badge>
  );
};

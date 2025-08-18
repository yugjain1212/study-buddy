
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
  estimatedMinutes: number;
  onTimeUpdate: (taskId: string, timeSpent: number) => void;
}

export const TaskTimer = ({ taskId, taskTitle, estimatedMinutes, onTimeUpdate }: TaskTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const [lastNotification, setLastNotification] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          
          // Check for procrastination notifications
          const estimatedSeconds = estimatedMinutes * 60;
          const overagePercentage = (newTime / estimatedSeconds) * 100;
          
          // Notify at 100%, 150%, and 200% of estimated time
          if (overagePercentage >= 100 && lastNotification < 100) {
            setLastNotification(100);
            toast({
              title: "Time's up! ⏰",
              description: `You've reached the estimated time for "${taskTitle}". Consider wrapping up or reassessing the task complexity.`,
              variant: "destructive",
            });
          } else if (overagePercentage >= 150 && lastNotification < 150) {
            setLastNotification(150);
            toast({
              title: "Procrastination Alert! 🚨",
              description: `You're spending 50% more time than estimated on "${taskTitle}". Take a break or refocus!`,
              variant: "destructive",
            });
          } else if (overagePercentage >= 200 && lastNotification < 200) {
            setLastNotification(200);
            toast({
              title: "Serious Overrun! ⚠️",
              description: `You've spent double the estimated time on "${taskTitle}". Consider breaking it into smaller tasks.`,
              variant: "destructive",
            });
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, estimatedMinutes, taskTitle, lastNotification]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    toast({
      title: "Timer Started! 🎯",
      description: `Working on "${taskTitle}"`,
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    onTimeUpdate(taskId, timeSpent);
  };

  const handleStop = () => {
    setIsRunning(false);
    onTimeUpdate(taskId, timeSpent);
    setTimeSpent(0);
    setLastNotification(0);
    toast({
      title: "Timer Stopped ✅",
      description: `Session completed for "${taskTitle}"`,
    });
  };

  const estimatedSeconds = estimatedMinutes * 60;
  const progress = Math.min((timeSpent / estimatedSeconds) * 100, 100);
  const isOvertime = timeSpent > estimatedSeconds;

  return (
    <Card className="p-3 glass-effect border-l-4 border-l-primary/80 shadow-lg hover-lift ambient-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-primary animate-pulse-glow" />
          <div>
            <div className={`font-mono text-lg font-bold ${isOvertime ? 'text-red-400' : 'text-foreground'} ${isRunning ? 'animate-pulse' : ''}`}>
              {formatTime(timeSpent)}
            </div>
            <div className="text-xs text-muted-foreground">
              Est: {estimatedMinutes}min {isOvertime && `(+${Math.ceil((timeSpent - estimatedSeconds) / 60)}min over)`}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button 
              size="sm" 
              onClick={handleStart} 
              className="gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover-lift"
            >
              <Play className="w-3 h-3" />
              Start
            </Button>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handlePause} 
                className="gap-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
              >
                <Pause className="w-3 h-3" />
                Pause
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleStop} 
                className="gap-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
              >
                <Square className="w-3 h-3" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isOvertime 
                ? 'bg-gradient-to-r from-red-500 to-rose-500 animate-pulse' 
                : 'bg-gradient-to-r from-primary to-blue-500'
            } ${isRunning ? 'ambient-glow' : ''}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

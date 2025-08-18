
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskTimer } from "./TaskTimer";
import { 
  Circle, 
  CheckCircle, 
  Clock, 
  Flag, 
  Calendar,
  Trash2,
  Timer,
  AlertCircle
} from "lucide-react";

interface StudySession {
  id: string;
  topic: string;
  duration_minutes: number;
  session_type: string;
  created_at: string;
  content?: any;
}

interface TaskCardProps {
  session: StudySession;
  onMarkCompleted: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onTimeUpdate: (taskId: string, timeSpent: number) => void;
}

export const TaskCard = ({ session, onMarkCompleted, onDelete, onTimeUpdate }: TaskCardProps) => {
  const [showTimer, setShowTimer] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flag className="w-4 h-4 text-red-400 animate-pulse-glow" />;
      case 'medium':
        return <Flag className="w-4 h-4 text-yellow-400 animate-pulse-glow" />;
      case 'low':
        return <Flag className="w-4 h-4 text-green-400 animate-pulse-glow" />;
      default:
        return <Flag className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500/80 glass-effect smooth-border';
      case 'medium': return 'border-l-yellow-500/80 glass-effect smooth-border';
      case 'low': return 'border-l-green-500/80 glass-effect smooth-border';
      default: return 'border-l-border glass-effect';
    }
  };

  const formatDueDate = (dueDateString: string) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400 bg-red-950/30 border-red-800' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-400 bg-orange-950/30 border-orange-800' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-400 bg-yellow-950/30 border-yellow-800' };
    return { text: `${diffDays} days left`, color: 'text-muted-foreground bg-muted/30 border-border' };
  };

  const isCompleted = session.content?.status === 'completed';
  const dueDateInfo = session.content?.due_date ? formatDueDate(session.content.due_date) : null;

  return (
    <Card 
      className={`border-l-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover-lift glow-effect ${getPriorityColor(session.content?.priority)} ${
        isCompleted ? 'opacity-75' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMarkCompleted(session.id)}
              className="p-1 hover:bg-green-500/20 hover:text-green-400 transition-colors duration-300"
              disabled={isCompleted}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-400 animate-pulse-glow" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-green-400 transition-colors duration-300" />
              )}
            </Button>
            
            <div className="flex-1">
              <h4 className={`font-medium text-foreground ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {session.topic}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {getPriorityIcon(session.content?.priority)}
                <Badge variant="secondary" className="text-xs glass-effect border-border/50">
                  {session.session_type.replace('_', ' ')}
                </Badge>
                {session.content?.subject && (
                  <Badge variant="outline" className="text-xs glass-effect border-primary/30 text-primary">
                    {session.content.subject}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {isHovered && (
            <div className="flex items-center gap-1 animate-slide-in-right">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowTimer(!showTimer)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors duration-300"
              >
                <Timer className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(session.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {session.duration_minutes} min
          </span>
          
          {dueDateInfo && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${dueDateInfo.color}`}>
              <Calendar className="w-3 h-3" />
              {dueDateInfo.text}
            </span>
          )}
          
          {session.content?.completed_at && (
            <span className="text-green-400 text-xs">
              ✓ Completed {new Date(session.content.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Notes */}
        {session.content?.notes && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 glass-effect p-2 rounded-md">
            {session.content.notes}
          </p>
        )}

        {/* Timer */}
        {showTimer && !isCompleted && (
          <div className="animate-slide-in-up">
            <TaskTimer
              taskId={session.id}
              taskTitle={session.topic}
              estimatedMinutes={session.duration_minutes}
              onTimeUpdate={onTimeUpdate}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

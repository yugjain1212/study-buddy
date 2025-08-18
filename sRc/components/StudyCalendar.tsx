import { useState, useMemo, useCallback } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  parseISO,
  formatISO
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Trash,
  Clock,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Bell,
  BellOff,
  BellRing,
  CheckSquare,
  Square,
  Award,
  Target,
  Zap,
  Star,
  Bookmark,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Types
type Priority = 'low' | 'medium' | 'high';
type TaskStatus = 'pending' | 'in-progress' | 'completed';
type TaskType = 'study' | 'assignment' | 'exam' | 'project' | 'other';

interface TaskBase {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  subject: string;
  type: TaskType;
  duration: number;
  notes: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudyTask extends TaskBase {
  type: 'study';
  subject: string;
  duration: number;
}

type Task = StudyTask | TaskBase;

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
  hasCompleted: boolean;
  hasHighPriority: boolean;
  tasks: Task[];
}

interface StudyCalendarProps {
  tasks?: Task[];
  onAddTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  onUpdateTask?: (task: Task) => Promise<void>;
  initialDate?: Date;
  viewMode?: 'day' | 'week' | 'month';
  className?: string;
}

interface StudyCalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: 'day' | 'week' | 'month';
  localTasks: Task[];
  error: string | null;
  success: string | null;
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({
  tasks: propTasks = [], 
  onDeleteTask: propOnDeleteTask, 
  onUpdateTask: propOnUpdateTask,
  initialDate = new Date(),
  viewMode: initialViewMode = 'month',
  className
}) => {
  const { toast } = useToast();
  
  const [state, setState] = useState<StudyCalendarState>({
    currentDate: initialDate,
    selectedDate: null,
    viewMode: initialViewMode,
    localTasks: [],
    error: null,
    success: null
  });

  // Combine prop tasks and local tasks
  const allTasks = useMemo(() => [...propTasks, ...state.localTasks], [propTasks, state.localTasks]);

  // Get tasks for the selected date
  const selectedDateTasks = useMemo(() => {
    if (!state.selectedDate) return [];
    return allTasks.filter(task => 
      isSameDay(parseISO(task.dueDate), state.selectedDate!)
    );
  }, [allTasks, state.selectedDate]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setState(s => ({ ...s, selectedDate: date, viewMode: 'day' }));
  };

  // State setters
  const setCurrentDate = (date: Date) => setState(s => ({ ...s, currentDate: date }));
  const setSelectedDate = (date: Date | null) => setState(s => ({ ...s, selectedDate: date }));
  const setViewMode = (mode: 'day' | 'week' | 'month') => setState(s => ({ ...s, viewMode: mode }));
  const setError = (error: string | null) => setState(s => ({ ...s, error }));
  const setSuccess = (message: string | null) => setState(s => ({ ...s, success: message }));

  // Navigation handlers
  const goToToday = () => {
    const today = new Date();
    setState(s => ({
      ...s,
      currentDate: today,
      selectedDate: today
    }));
  };

  const goToPreviousPeriod = useCallback(() => {
    setState(s => {
      const currentDate = s.currentDate || new Date();
      let newDate = currentDate;
      
      switch (s.viewMode) {
        case 'month': newDate = subMonths(currentDate, 1); break;
        case 'week': newDate = subWeeks(currentDate, 1); break;
        case 'day': newDate = subDays(currentDate, 1); break;
      }
      
      return {
        ...s,
        currentDate: newDate
      };
    });
  }, [state.viewMode]);

  const goToNextPeriod = useCallback(() => {
    setState(s => {
      const currentDate = s.currentDate || new Date();
      let newDate = currentDate;
      
      switch (s.viewMode) {
        case 'month': newDate = addMonths(currentDate, 1); break;
        case 'week': newDate = addWeeks(currentDate, 1); break;
        case 'day': newDate = addDays(currentDate, 1); break;
      }
      
      return {
        ...s,
        currentDate: newDate
      };
    });
  }, [state.viewMode]);

  // Task handlers
  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      if (propOnDeleteTask) {
        await propOnDeleteTask(taskId);
      } else {
        setState(s => ({ ...s, localTasks: s.localTasks.filter(t => t.id !== taskId) }));
      }
      setSuccess('Task deleted successfully!');
    } catch (err) {
      setError('Failed to delete task. Please try again.');
    }
  }, [propOnDeleteTask]);

  const handleTaskToggle = useCallback(async (taskId: string, completed: boolean) => {
    try {
      if (propOnUpdateTask) {
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
          await propOnUpdateTask({ ...task, completed });
        }
      } else {
        setState(s => ({
          ...s,
          localTasks: s.localTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed, status: completed ? 'completed' : 'pending' } 
              : task
          )
        }));
      }
      setSuccess(`Task marked as ${completed ? 'completed' : 'pending'}`);
    } catch (err) {
      setError('Failed to update task status. Please try again.');
    }
  }, [allTasks, propOnUpdateTask]);

  // Generate calendar days based on current view
  const calendarDays = useMemo(() => {
    const { currentDate, selectedDate } = state;
    if (!currentDate) return [];
    
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const start = startOfWeek(firstDay, { weekStartsOn: 0 });
    const end = endOfWeek(lastDay, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start, end }).map(day => ({
      date: day,
      isCurrentMonth: isSameMonth(day, currentDate),
      isToday: isToday(day),
      isSelected: isSameDay(day, selectedDate),
      hasTasks: allTasks.some(task => isSameDay(parseISO(task.dueDate), day)),
      hasCompleted: allTasks.some(task => task.status === 'completed' && isSameDay(parseISO(task.dueDate), day)),
      hasHighPriority: allTasks.some(task => task.priority === 'high' && isSameDay(parseISO(task.dueDate), day)),
      tasks: allTasks.filter(task => isSameDay(parseISO(task.dueDate), day))
    }));
  }, [state.currentDate, state.selectedDate, allTasks]);

  // Day names
  const dayNames = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array(7).fill(0).map((_, i) => format(addDays(start, i), 'EEE'));
  }, []);

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'in_progress': return <Sparkles className="w-3 h-3 text-blue-500" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Study Calendar</h2>
          <Badge variant="outline" className="text-sm">
            {format(state.currentDate, 'MMMM yyyy')}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="gap-1"
          >
            <CalendarIcon className="w-4 h-4" />
            Today
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousPeriod}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPeriod}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="glass-effect hover-lift animate-slide-in-left animate-stagger-1 border-border/50 shadow-lg">
        <CardContent className="p-4">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {dayNames.map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7 gap-px bg-border/20 rounded-md overflow-hidden">
            {calendarDays.map((day, i) => {
              // Get tasks for this specific day
              const dayTasks = allTasks.filter(task => 
                isSameDay(parseISO(task.dueDate), day.date)
              );
              
              return (
                <div 
                  key={i}
                  onClick={() => handleDateSelect(day.date)}
                  className={cn(
                    'min-h-24 p-2 bg-background hover:bg-accent/50 transition-colors',
                    !day.isCurrentMonth && 'text-muted-foreground/50',
                    day.isToday && 'bg-primary/5',
                    day.isSelected && 'ring-2 ring-primary'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      'inline-flex items-center justify-center rounded-full w-6 h-6 text-sm',
                      day.isToday && 'bg-primary text-primary-foreground',
                      day.isSelected && !day.isToday && 'font-semibold'
                    )}>
                      {format(day.date, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex -space-x-1">
                        {dayTasks.some(t => t.priority === 'high') && (
                          <span className="w-2 h-2 rounded-full bg-red-500 border border-red-200 dark:border-red-800"></span>
                        )}
                        {dayTasks.some(t => t.status === 'completed') && (
                          <span className="w-2 h-2 rounded-full bg-green-500 border border-green-200 dark:border-green-800"></span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Show task titles for the day */}
                  <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                    {dayTasks.slice(0, 3).map(task => (
                      <div 
                        key={task.id} 
                        className="text-xs p-1 rounded truncate"
                        style={{
                          backgroundColor: task.priority === 'high' ? '#fee2e2' : 
                                                task.priority === 'medium' ? '#fef3c7' : '#ecfccb',
                          color: task.priority === 'high' ? '#b91c1c' : 
                                        task.priority === 'medium' ? '#92400e' : '#365314'
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {!state.selectedDate || isToday(state.selectedDate) 
              ? 'Today' 
              : format(state.selectedDate, 'EEEE, MMM d')}
          </h2>
          {state.selectedDate && !isToday(state.selectedDate) && (
            <Badge variant="outline" className="text-sm">
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {selectedDateTasks.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 hover:border-primary/50 transition-colors bg-background/50">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <h3 className="font-medium text-foreground mb-1">
                No tasks for {!state.selectedDate || isToday(state.selectedDate) ? 'today' : 'this day'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {!state.selectedDate || isToday(state.selectedDate) 
                  ? 'Add a task to get started with your study plan' 
                  : `No tasks scheduled for ${format(state.selectedDate, 'MMMM d')}`}
              </p>

            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {selectedDateTasks.map((task) => {
              const taskTitle = task.title || 'Untitled Task';
              const taskDescription = task.description;
              const taskDuration = task.duration || 30;
              const isCompleted = task.status === 'completed';
              
              return (
                <Card 
                  key={task.id}
                  className={`group hover:shadow-md transition-all ${isCompleted ? 'opacity-80' : ''} ${
                    isToday(new Date(task.dueDate)) ? 'ring-1 ring-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            isCompleted ? 'bg-green-500' : 
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></span>
                          <h3 className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {taskTitle}
                          </h3>
                        </div>
                        
                        {taskDescription && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {taskDescription}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {taskDuration} min
                          </div>
                          {task.subject && (
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                              {task.subject}
                            </div>
                          )}
                          {!isToday(new Date(task.dueDate)) && (
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                              {format(new Date(task.dueDate), 'MMM d')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {task.priority || 'low'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyCalendar;
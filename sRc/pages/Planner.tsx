import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { AddToDoModal } from "@/components/AddToDoModal";
import { TaskCard } from "@/components/TaskCard";
import { StudyPlannerSidebar } from "@/components/StudyPlannerSidebar";
import StudyCalendar from "@/components/StudyCalendar";
import { Calendar, Clock, BookOpen, Target, Plus, CheckCircle, TrendingUp, Brain, Zap, AlertCircle, Timer, Sparkles, Bot, History } from "lucide-react";
import { SmartSuggestionsCard } from "@/components/planner/SmartSuggestionsCard";
import { QuickStatsCard } from "@/components/planner/QuickStatsCard";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AITutor from "@/components/AITutor";

interface StudySession {
  id: string;
  topic: string;
  duration_minutes: number;
  session_type: string;
  created_at: string;
  content?: any;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  subject: string;
  type: 'study' | 'assignment' | 'exam' | 'project' | 'other';
  duration: number;
  notes: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudySessionInsert {
  topic: string;
  duration_minutes: number;
  session_type: string;
  user_id: string;
  content: {
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
  };
  created_at: string;
}

const convertToTask = (session: StudySession): Task => {
  return {
    id: session.id,
    title: session.topic,
    description: session.content?.description || '',
    status: session.content?.status || 'pending',
    priority: session.content?.priority || 'medium',
    dueDate: session.content?.due_date || new Date().toISOString(),
    subject: session.session_type,
    type: 'study',
    duration: session.duration_minutes,
    notes: session.content?.notes || '',
    completed: session.content?.status === 'completed',
    createdAt: session.created_at,
    updatedAt: session.content?.updated_at || session.created_at
  };
};

const addStudySession = async (session: Omit<StudySession, 'id' | 'created_at' | 'user_id'>, userId: string) => {
  try {
    if (!userId) throw new Error('Valid user ID required');
    if (!session.topic?.trim()) throw new Error('Non-empty task title required');
    if (!session.duration_minutes || session.duration_minutes <= 0) 
      throw new Error('Duration must be positive number');

    // Simplified payload matching actual database columns
    const payload = {
      topic: session.topic.trim(),
      duration_minutes: Math.floor(session.duration_minutes),
      session_type: 'other',
      user_id: userId,
      content: {
        title: session.topic.trim(),
        description: session.content?.description || '',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    console.log('Final validated payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
      .from('study_sessions')
      .insert(payload)
      .select('*');

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    return data[0];
  } catch (error) {
    console.error('Task creation error:', error);
    throw new Error('Failed to create task');
  }
};

const Planner = () => {
  const {
    user
  } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const fetchStudySessions = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setStudySessions(data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load study sessions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudySessions();
  }, [user]);

  const deleteSession = async (sessionId: string) => {
    try {
      const {
        error
      } = await supabase.from('study_sessions').delete().eq('id', sessionId).eq('user_id', user?.id);
      if (error) throw error;
      setStudySessions(prev => prev.filter(session => session.id !== sessionId));
      toast({
        title: "Success",
        description: "Task deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive"
      });
    }
  };

  const markAsCompleted = async (sessionId: string) => {
    try {
      const session = studySessions.find(s => s.id === sessionId);
      if (!session) return;
      const {
        error
      } = await supabase.from('study_sessions').update({
        content: {
          ...session.content,
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      }).eq('id', sessionId);
      if (error) throw error;
      setStudySessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        content: {
          ...s.content,
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      } : s));
      toast({
        title: "Task Completed! ",
        description: "Great job! Keep up the momentum!"
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive"
      });
    }
  };

  const handleTimeUpdate = async (taskId: string, timeSpent: number) => {
    try {
      const session = studySessions.find(s => s.id === taskId);
      if (!session) return;
      const {
        error
      } = await supabase.from('study_sessions').update({
        content: {
          ...session.content,
          time_spent: timeSpent,
          last_worked: new Date().toISOString()
        }
      }).eq('id', taskId);
      if (error) throw error;
      setStudySessions(prev => prev.map(s => s.id === taskId ? {
        ...s,
        content: {
          ...s.content,
          time_spent: timeSpent,
          last_worked: new Date().toISOString()
        }
      } : s));
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  const pendingTasks = studySessions.filter(session => !session.content?.status || session.content.status === 'pending');
  const completedTasks = studySessions.filter(session => session.content?.status === 'completed');
  const sortedPendingTasks = pendingTasks.sort((a, b) => {
    const priorityOrder = {
      'high': 3,
      'medium': 2,
      'low': 1
    };
    const aPriority = priorityOrder[a.content?.priority as keyof typeof priorityOrder] || 1;
    const bPriority = priorityOrder[b.content?.priority as keyof typeof priorityOrder] || 1;
    if (aPriority !== bPriority) return bPriority - aPriority;
    if (a.content?.due_date && b.content?.due_date) {
      return new Date(a.content.due_date).getTime() - new Date(b.content.due_date).getTime();
    }
    return 0;
  });
  const todayTasks = sortedPendingTasks.filter(session => {
    if (!session.content?.due_date) return false;
    
    try {
      const dueDate = new Date(session.content.due_date);
      const today = new Date();
      
      // Reset time components for accurate date comparison
      const normalizeDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };
      
      const normalizedDueDate = normalizeDate(dueDate);
      const normalizedToday = normalizeDate(today);
      
      return normalizedDueDate.getTime() === normalizedToday.getTime();
    } catch (error) {
      console.error('Error parsing date:', session.content.due_date, error);
      return false;
    }
  });
  
  console.log('Today\'s tasks:', {
    allTasks: studySessions,
    pendingTasks,
    todayTasks,
    currentTime: new Date().toISOString()
  });
  const totalStudyTime = studySessions.reduce((total, session) => total + session.duration_minutes, 0);
  const completedSessions = completedTasks.length;
  if (loading) {
    return <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary ambient-glow"></div>
        </div>
      </AuthGuard>;
  }
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex animate-fade-in">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Header with Gradient and Animation */}
            <div className="flex items-center justify-between animate-slide-in-up">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Brain className="w-8 h-8 text-primary animate-pulse-glow" />
                  Study Planner
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-float" />
                </h1>
                <p className="text-muted-foreground">Organize your learning with smart scheduling and time tracking</p>
              </div>
              <Button 
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover-lift ambient-glow animate-slide-in-right" 
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            <Tabs defaultValue="today" className="space-y-6 animate-slide-in-up animate-stagger-1">
              <TabsList className="grid w-full grid-cols-5 glass-effect border border-border/50">
                <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Today
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All Tasks
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Study Calendar
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-6 animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left column */}
          <div className="space-y-4">
            {/* Today's Focus */}
            <Card className="glass-effect border-border/50 shadow-lg hover-lift animate-slide-in-up animate-stagger-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5 text-primary animate-pulse-glow" />
                  Today's Focus
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4 animate-float" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No tasks for today</h3>
                    <p className="text-muted-foreground mb-4">Start by adding your first task</p>
                    <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover-lift ambient-glow">
                      Add Your First Task
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {todayTasks.map((session, index) => (
                        <div key={session.id} className={`animate-slide-in-up animate-stagger-${Math.min(index + 1, 4)}`}>
                          <TaskCard
                            session={session}
                            onMarkCompleted={markAsCompleted}
                            onDelete={deleteSession}
                            onTimeUpdate={handleTimeUpdate}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <SmartSuggestionsCard 
              studySessions={studySessions}
              upcomingExams={[]}
              recentPerformance={[]}
              onAddSuggestion={async (suggestion) => {
                try {
                  const { data, error } = await supabase
                    .from('study_sessions')
                    .insert([{
                      topic: suggestion.title,
                      duration_minutes: suggestion.estimatedMinutes,
                      session_type: suggestion.subject,
                      content: {
                        description: suggestion.reason,
                        priority: suggestion.priority,
                        status: 'pending',
                        due_date: new Date().toISOString()
                      },
                      user_id: user?.id
                    }])
                    .select();
                  
                  if (error) throw error;
                  
                  if (data) {
                    setStudySessions(prev => [...prev, data[0]]);
                    toast({
                      title: 'Success',
                      description: `${suggestion.title} added to your tasks`,
                      className: 'bg-green-500 text-white'
                    });
                  }
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to add task',
                    className: 'bg-red-500 text-white'
                  });
                  console.error('Error adding task:', error);
                }
              }}
            />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Card className="glass-effect border-border/50 shadow-lg hover-lift animate-slide-in-right animate-stagger-1">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary ambient-glow">{todayTasks.length}</div>
                  <p className="text-sm text-muted-foreground">Tasks Due Today</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="glass-effect p-3 rounded-lg hover-lift">
                    <div className="text-lg font-semibold text-orange-500">{pendingTasks.length}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="glass-effect p-3 rounded-lg hover-lift">
                    <div className="text-lg font-semibold text-green-500">{completedSessions}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="calendar" className="space-y-6 animate-fade-in">
        <StudyCalendar
          tasks={studySessions.map(convertToTask)}
          onAddTask={async (task) => {
            console.log('onAddTask called with task:', JSON.stringify(task, null, 2));
            
            if (!user) {
              const errorMsg = 'User must be logged in to add tasks';
              console.error('Authentication error:', errorMsg);
              throw new Error(errorMsg);
            }
            
            try {
              console.log('Preparing study session data...');
              
              // Prepare the content object with all task metadata
              const content = {
                // Task metadata
                title: task.title,
                description: task.description || '',
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                due_date: task.dueDate || new Date().toISOString(),
                subject: task.subject || 'General',
                type: task.type || 'study',
                notes: task.notes || '',
                completed: task.completed || false,
                // Timestamps will be set by the database
              };
              
              // Prepare the session data matching the database schema
              const sessionData = {
                topic: task.title, // Required field in study_sessions
                duration_minutes: task.duration || 60, // Required field
                session_type: task.subject || 'General', // Required field
                content: content // All other fields go into the content JSON
              };
              
              console.log('Calling addStudySession with data:', JSON.stringify(sessionData, null, 2));
              const result = await addStudySession(sessionData, user.id);
              console.log('addStudySession result:', result);
              
              console.log('Refreshing study sessions...');
              await fetchStudySessions();
              console.log('Study sessions refreshed successfully');
              
              // Convert the StudySession to a Task before returning
              const newTask = convertToTask(result);
              return newTask;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              console.error('Error in onAddTask:', {
                error: errorMsg,
                stack: error instanceof Error ? error.stack : undefined,
                task: JSON.stringify(task, null, 2)
              });
              throw error;
            }
          }}
          onDeleteTask={deleteSession}
          className="animate-slide-in-up"
        />
      </TabsContent>

      <TabsContent value="pending" className="space-y-6 animate-fade-in">
                <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-6">
                  <Card className="glass-effect border-border/50 shadow-lg hover-lift animate-slide-in-up h-[700px] flex flex-col">
                    <CardHeader className="flex-shrink-0 mx-[2px]">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Target className="w-5 h-5 text-primary animate-pulse-glow" />
                        All Tasks ({sortedPendingTasks.length})
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        All your pending tasks, organized by priority
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      {sortedPendingTasks.length === 0 ? (
                        <div className="text-center py-12 animate-fade-in">
                          <CheckCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4 animate-float" />
                          <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                          <p className="text-muted-foreground mb-4">No pending tasks</p>
                          <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover-lift ambient-glow"
                          >
                            Add New Task
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-full pr-4">
                          <div className="grid gap-6 grid-cols-1 auto-rows-max">
                            {sortedPendingTasks.map((session, index) => (
                              <div
                                key={session.id}
                                className={`animate-slide-in-up animate-stagger-${Math.min(index + 1, 4)}`}
                              >
                                <TaskCard
                                  session={session}
                                  onMarkCompleted={markAsCompleted}
                                  onDelete={deleteSession}
                                  onTimeUpdate={handleTimeUpdate}
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Tutor Section */}
                  <div className="space-y-4">
                    <Card className="glass-effect border-border/50 shadow-lg hover-lift animate-slide-in-up animate-stagger-3">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center gap-2 text-foreground">
                            <Bot className="w-5 h-5 text-primary" />
                            AI Study Tutor
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setShowChatHistory(true)}
                          >
                            <History className="w-4 h-4" />
                            Chat History
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <AITutor />
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Mobile StudyPlannerSidebar - Show below on small screens */}
                <div className="lg:hidden mt-6">
                  <StudyPlannerSidebar
                    studySessions={studySessions}
                    onAddTask={() => setShowAddModal(true)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6 animate-fade-in">
                <Card className="glass-effect border-border/50 shadow-lg hover-lift animate-slide-in-up h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <CheckCircle className="w-5 h-5 text-green-500 animate-pulse-glow" />
                      Completed Tasks ({completedTasks.length})
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Your achievements and completed work</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    {completedTasks.length === 0 ? (
                      <div className="text-center py-12 animate-fade-in">
                        <Clock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4 animate-float" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No completed tasks yet</h3>
                        <p className="text-muted-foreground">Complete your first task to see it here</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-4">
                        <div className="grid gap-6 grid-cols-1 auto-rows-max">
                          {completedTasks.map((session, index) => (
                            <div key={session.id} className={`animate-slide-in-up animate-stagger-${Math.min(index + 1, 4)}`}>
                              <TaskCard session={session} onMarkCompleted={markAsCompleted} onDelete={deleteSession} onTimeUpdate={handleTimeUpdate} />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-effect border-border/50 shadow-lg hover-lift animate-slide-in-up">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <TrendingUp className="w-5 h-5 text-primary animate-pulse-glow" />
                        Performance Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 glass-effect rounded-lg hover-lift animate-gradient bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                          <div className="text-2xl font-bold text-green-400 ambient-glow">{completedSessions}</div>
                          <div className="text-sm text-muted-foreground">Tasks Completed</div>
                        </div>
                        <div className="text-center p-4 glass-effect rounded-lg hover-lift animate-gradient bg-gradient-to-br from-orange-500/20 to-red-500/20">
                          <div className="text-2xl font-bold text-orange-400 ambient-glow">{pendingTasks.length}</div>
                          <div className="text-sm text-muted-foreground">Tasks Pending</div>
                        </div>
                        <div className="text-center p-4 glass-effect rounded-lg hover-lift animate-gradient bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                          <div className="text-2xl font-bold text-blue-400 ambient-glow">{Math.round(totalStudyTime / 60)}h</div>
                          <div className="text-sm text-muted-foreground">Total Study Time</div>
                        </div>
                        <div className="text-center p-4 glass-effect rounded-lg hover-lift animate-gradient bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <div className="text-2xl font-bold text-purple-400 ambient-glow">
                            {completedSessions > 0 ? Math.round(totalStudyTime / completedSessions) : 0}m
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Task Duration</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <AddToDoModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal} 
          onToDoAdded={fetchStudySessions} 
        />
      </div>
    </AuthGuard>
  );
};

export default Planner;
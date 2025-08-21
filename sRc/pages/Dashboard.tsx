import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import AppNavigation from "@/components/AppNavigation";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  Award,
  MessageSquare,
  FileText,
  Users,
  ChevronRight,
  Star,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserProgress {
  subject: string;
  topic: string;
  progress_percentage: number;
  total_study_time_minutes: number;
}

interface StudySession {
  topic: string;
  created_at: string;
  duration_minutes: number;
  session_type: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('progress_percentage', { ascending: false })
          .limit(5);

        if (progressError) {
          setUserProgress([]);
        } else {
          setUserProgress(progressData || []);
        }

        // Fetch recent study sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('topic, created_at, duration_minutes, session_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (sessionsError) {
          setRecentSessions([]);
        } else {
          setRecentSessions(sessionsData || []);
        }

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, refreshKey]);

  const calculateStats = () => {
    const totalStudyTime = recentSessions.reduce((total, session) => total + session.duration_minutes, 0);
    const topicsStudied = new Set(userProgress.map(p => p.topic)).size;
    const averageProgress = userProgress.length > 0 
      ? Math.round(userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / userProgress.length)
      : 0;

    return {
      studyHours: Math.round(totalStudyTime / 60),
      topicsStudied,
      averageProgress,
      totalSessions: recentSessions.length
    };
  };

  const stats = calculateStats();

  const handleQuickActionClick = (action: string) => {
    switch (action) {
      case 'ai-tutor':
        navigate('/tutor');
        break;
      case 'quiz':
        navigate('/quizzes');
        break;
      case 'planner':
        navigate('/planner');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your learning progress.</p>
                  </div>
                  <Button variant="outline" onClick={handleRefresh}>
                    <Zap className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Study Hours</p>
                        <p className="text-2xl font-bold text-foreground">{stats.studyHours}</p>
                        <p className="text-xs text-green-600 mt-1">+2.5 from last week</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Topics Studied</p>
                        <p className="text-2xl font-bold text-foreground">{stats.topicsStudied}</p>
                        <p className="text-xs text-green-600 mt-1">+3 new topics</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Progress</p>
                        <p className="text-2xl font-bold text-foreground">{stats.averageProgress}%</p>
                        <p className="text-xs text-green-600 mt-1">+12% improvement</p>
                      </div>
                      <Target className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Study Sessions</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                        <p className="text-xs text-green-600 mt-1">7-day streak</p>
                      </div>
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleQuickActionClick('ai-tutor')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">AI Tutor</h3>
                          <p className="text-sm text-muted-foreground">Chat with your AI study buddy</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleQuickActionClick('quiz')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Take Quiz</h3>
                          <p className="text-sm text-muted-foreground">Test your knowledge</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleQuickActionClick('planner')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Study Planner</h3>
                          <p className="text-sm text-muted-foreground">Plan your study schedule</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userProgress.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No progress data yet</p>
                        <p className="text-sm text-muted-foreground">Start studying to see your progress!</p>
                        <Button className="mt-4">Start Learning</Button>
                      </div>
                    ) : (
                      userProgress.map((progress, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">{progress.subject} - {progress.topic}</span>
                            <span>{progress.progress_percentage}%</span>
                          </div>
                          <Progress value={progress.progress_percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(progress.total_study_time_minutes / 60)} hours studied
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest learning activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentSessions.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No recent activity</p>
                          <p className="text-sm text-muted-foreground">Start a study session to see your activity!</p>
                          <Button className="mt-4">Start Studying</Button>
                        </div>
                      ) : (
                        recentSessions.map((session, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{session.topic}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.created_at).toLocaleDateString()} • {session.session_type.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {session.duration_minutes} min
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;

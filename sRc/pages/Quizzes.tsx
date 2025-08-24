import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { QuizGenerator } from "@/components/QuizGenerator";
import { CustomQuizModal } from "@/components/CustomQuizModal";
import { 
  Play, 
  Trophy, 
  Clock, 
  CheckCircle, 
  Star, 
  Brain,
  Target,
  TrendingUp,
  BookOpen,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface QuizSession {
  id: string;
  topic: string;
  created_at: string;
  content: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
}

const Quizzes = () => {
  const { user } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<{category: string, difficulty: string, questionCount?: number} | null>(null);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const quizCategories = [
    {
      id: 1,
      title: "Data Structures",
      description: "Arrays, Lists, Trees, Graphs",
      difficulty: "Beginner to Advanced",
      estimatedTime: "10 min",
      color: "bg-gradient-to-r from-blue-600 to-purple-600"
    },
    {
      id: 2,
      title: "Algorithms",
      description: "Sorting, Searching, Dynamic Programming",
      difficulty: "Intermediate",
      estimatedTime: "10 min",
      color: "bg-gradient-to-r from-green-600 to-emerald-600"
    },
    {
      id: 3,
      title: "Operating Systems",
      description: "Processes, Memory, File Systems",
      difficulty: "Advanced",
      estimatedTime: "10 min",
      color: "bg-gradient-to-r from-purple-600 to-pink-600"
    },
    {
      id: 4,
      title: "Computer Networks",
      description: "TCP/IP, HTTP, Network Security",
      difficulty: "Intermediate",
      estimatedTime: "10 min",
      color: "bg-gradient-to-r from-orange-600 to-red-600"
    }
  ];

  const fetchQuizData = async () => {
    if (!user) return;

    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'quiz')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;
      setQuizSessions(sessions || []);

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [user]);

  const startQuiz = (category: string, difficulty: string, questionCount: number = 5) => {
    setSelectedQuiz({ category, difficulty, questionCount });
  };

  const startCustomQuiz = (subject: string, topic: string, difficulty: string, questionCount: number) => {
    const customCategory = `${subject} - ${topic}`;
    setSelectedQuiz({ category: customCategory, difficulty, questionCount });
  };

  const handleQuizComplete = (score: number) => {
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}%`,
    });
    
    fetchQuizData();
    setSelectedQuiz(null);
  };

  const calculateStats = () => {
    const totalQuizzes = quizSessions.length;
    const totalScore = quizSessions.reduce((sum, session) => 
      sum + (session.content?.score || 0), 0
    );
    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const totalQuestions = quizSessions.reduce((sum, session) => 
      sum + (session.content?.questions || 0), 0
    );

    return { totalQuizzes, averageScore, totalQuestions };
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Chart data preparation
  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(263, 70%, 65%)",
    },
    time: {
      label: "Time (min)",
      color: "hsl(280, 60%, 60%)",
    },
  };

  const performanceData = quizSessions.slice(0, 7).reverse().map((session, index) => ({
    quiz: `Quiz ${index + 1}`,
    score: session.content?.score || 0,
    time: Math.round((session.content?.total_time_seconds || 0) / 60),
    date: new Date(session.created_at).toLocaleDateString()
  }));

  const categoryData = [
    { name: "Data Structures", value: 85, color: "#8B5CF6" },
    { name: "Algorithms", value: 72, color: "#10B981" },
    { name: "Operating Systems", value: 45, color: "#F59E0B" },
    { name: "Networks", value: 63, color: "#EF4444" }
  ];

  const weeklyProgress = [
    { day: "Mon", quizzes: 2, avgScore: 78 },
    { day: "Tue", quizzes: 1, avgScore: 85 },
    { day: "Wed", quizzes: 3, avgScore: 92 },
    { day: "Thu", quizzes: 2, avgScore: 68 },
    { day: "Fri", quizzes: 4, avgScore: 89 },
    { day: "Sat", quizzes: 1, avgScore: 95 },
    { day: "Sun", quizzes: 2, avgScore: 82 }
  ];

  const stats = calculateStats();

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    );
  }

  if (selectedQuiz) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedQuiz(null)}
                  className="mb-4 glass-effect border-primary/20 hover:bg-primary/10"
                >
                  ← Back to Quizzes
                </Button>
              </div>
              <QuizGenerator 
                category={selectedQuiz.category}
                difficulty={selectedQuiz.difficulty}
                questionCount={selectedQuiz.questionCount}
                onQuizComplete={handleQuizComplete}
              />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="animate-slide-in-right">
                <h1 className="text-3xl font-bold text-gradient ambient-glow">Interactive Quizzes</h1>
                <p className="text-muted-foreground">Test your knowledge with AI-generated questions</p>
              </div>
              <div className="flex gap-3 animate-slide-in-right">
                <CustomQuizModal onStartQuiz={startCustomQuiz} />
                <Button className="gap-2 button-gradient hover-lift ambient-glow" onClick={() => startQuiz("Mixed Topics", "Intermediate", 5)}>
                  <Brain className="w-4 h-4" />
                  Quick Quiz
                </Button>
              </div>
            </div>

            <Tabs defaultValue="categories" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 glass-effect-strong">
                <TabsTrigger value="categories" className="data-[state=active]:bg-primary/20">Categories</TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-primary/20">Recent</TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-primary/20">Achievements</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizCategories.map((category, index) => (
                    <Card key={category.id} className="interactive-card animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center ambient-glow hover-lift`}>
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="border-primary/30">{category.difficulty}</Badge>
                        </div>
                        <CardTitle className="text-xl text-gradient">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {category.estimatedTime}
                          </span>
                          <span>5 questions</span>
                        </div>
                        
                        <Button 
                          className="w-full gap-2 button-gradient hover-lift ambient-glow interactive-button" 
                          onClick={() => startQuiz(category.title, category.difficulty.split(' ')[0], 5)}
                        >
                          <Play className="w-4 h-4" />
                          Start Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="space-y-6 animate-fade-in">
                <Card className="interactive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gradient">
                      <Clock className="w-5 h-5" />
                      Recent Quiz Results
                    </CardTitle>
                    <CardDescription>Your latest quiz performances with completion times</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quizSessions.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
                          <p className="text-muted-foreground">No quizzes taken yet</p>
                          <Button className="mt-4 button-gradient hover-lift" onClick={() => startQuiz("Data Structures", "Beginner")}>
                            Take Your First Quiz
                          </Button>
                        </div>
                      ) : (
                        quizSessions.slice(0, 10).map((session, index) => (
                          <div key={session.id} className="flex items-center justify-between p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                (session.content?.score || 0) >= 90 ? 'bg-green-500/20 text-green-400 ambient-glow' :
                                (session.content?.score || 0) >= 70 ? 'bg-yellow-500/20 text-yellow-400 ambient-glow' :
                                'bg-red-500/20 text-red-400 ambient-glow'
                              }`}>
                                {(session.content?.score || 0) >= 90 ? <Trophy className="w-5 h-5" /> :
                                 (session.content?.score || 0) >= 70 ? <Star className="w-5 h-5" /> :
                                 <Target className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{session.topic}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                                  <span>{session.content?.questions || 0} questions</span>
                                  <Badge variant="outline" className="border-primary/30">{session.content?.difficulty || 'Unknown'}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(session.content?.total_time_seconds)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gradient">{session.content?.score || 0}%</div>
                              <div className="text-sm text-muted-foreground">Score</div>
                              {session.content?.average_time_per_question && (
                                <div className="text-xs text-muted-foreground">
                                  Avg: {formatTime(session.content.average_time_per_question)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="interactive-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gradient">
                        <Trophy className="w-5 h-5" />
                        Achievements
                      </CardTitle>
                      <CardDescription>Your quiz milestones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {achievements.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
                          <p className="text-muted-foreground">No achievements yet</p>
                          <p className="text-sm text-muted-foreground">Complete quizzes to earn achievements!</p>
                        </div>
                      ) : (
                        achievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 glass-effect border border-primary/20 rounded-lg hover-lift">
                            <span className="text-2xl ambient-glow">{achievement.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{achievement.title}</h4>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              <p className="text-xs text-muted-foreground">{new Date(achievement.earned_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="interactive-card">
                    <CardHeader>
                      <CardTitle className="text-gradient">Quiz Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                          <div className="text-2xl font-bold text-gradient">{stats.totalQuizzes}</div>
                          <div className="text-sm text-muted-foreground">Quizzes Completed</div>
                        </div>
                        <div className="text-center p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                          <div className="text-2xl font-bold text-gradient">{stats.averageScore}%</div>
                          <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                        <div className="text-center p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                          <div className="text-2xl font-bold text-gradient">{stats.totalQuestions}</div>
                          <div className="text-sm text-muted-foreground">Questions Answered</div>
                        </div>
                        <div className="text-center p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                          <div className="text-2xl font-bold text-gradient">{achievements.length}</div>
                          <div className="text-sm text-muted-foreground">Achievements</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  {/* Performance Trend Chart */}
                  <Card className="interactive-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gradient">
                        <TrendingUp className="w-5 h-5" />
                        Performance Trend
                      </CardTitle>
                      <CardDescription>Your quiz scores over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {performanceData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[300px]">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="quiz" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="hsl(263, 70%, 65%)" 
                              strokeWidth={3}
                              dot={{ fill: "hsl(263, 70%, 65%)", strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8, stroke: "hsl(263, 70%, 65%)", strokeWidth: 2, fill: "hsl(var(--background))" }}
                            />
                          </LineChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <TrendingUp className="w-12 h-12 mx-auto mb-4 animate-pulse-glow" />
                            <p>No performance data yet</p>
                            <p className="text-sm">Take some quizzes to see your progress!</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Category Performance */}
                    <Card className="interactive-card">
                      <CardHeader>
                        <CardTitle className="text-gradient">Category Performance</CardTitle>
                        <CardDescription>Performance breakdown by subject</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px]">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Weekly Activity */}
                    <Card className="interactive-card">
                      <CardHeader>
                        <CardTitle className="text-gradient">Weekly Activity</CardTitle>
                        <CardDescription>Quiz activity throughout the week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px]">
                          <BarChart data={weeklyProgress}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar 
                              dataKey="quizzes" 
                              fill="hsl(263, 70%, 65%)" 
                              radius={[4, 4, 0, 0]}
                              name="Quizzes"
                            />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Improvement Suggestions */}
                  <Card className="interactive-card">
                    <CardHeader>
                      <CardTitle className="text-gradient">Performance Insights</CardTitle>
                      <CardDescription>Recommendations based on your performance</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3 p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                        <Brain className="w-5 h-5 text-blue-400 mt-1 ambient-glow" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Focus Area</p>
                          <p className="text-xs text-muted-foreground">Practice more OS concepts for better scores</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                        <Target className="w-5 h-5 text-green-400 mt-1 ambient-glow" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Strength</p>
                          <p className="text-xs text-muted-foreground">Excellent performance in data structures</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 glass-effect border border-primary/20 rounded-lg hover-lift">
                        <Zap className="w-5 h-5 text-yellow-400 mt-1 ambient-glow" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Next Goal</p>
                          <p className="text-xs text-muted-foreground">Achieve 90% average score across all topics</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Quizzes;

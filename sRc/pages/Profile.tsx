
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import AppNavigation from "@/components/AppNavigation";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Settings,
  Camera
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

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

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile data for user:', user.id);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profileData);
      setProfile(profileData);

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('progress_percentage', { ascending: false });

      if (progressError) {
        console.error('Progress error:', progressError);
        throw progressError;
      }
      
      console.log('Progress data:', progressData);
      setUserProgress(progressData || []);

      // Fetch recent study sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('topic, created_at, duration_minutes, session_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error('Sessions error:', sessionsError);
        throw sessionsError;
      }
      
      console.log('Sessions data:', sessionsData);
      setRecentSessions(sessionsData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          university: profile.university,
          major: profile.major,
          year: profile.year,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    const totalStudyTime = recentSessions.reduce((total, session) => total + session.duration_minutes, 0);
    const topicsStudied = new Set(userProgress.map(p => p.topic)).size;
    const averageProgress = userProgress.length > 0 
      ? Math.round(userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / userProgress.length)
      : 0;
    const streakDays = Math.min(recentSessions.length, 30);

    return {
      studyHours: Math.round(totalStudyTime / 60),
      topicsStudied,
      averageProgress,
      streakDays
    };
  };

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                  <p className="text-muted-foreground">Manage your account and track your progress</p>
                </div>
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(!isEditing)}
                  variant={isEditing ? "default" : "outline"}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="md:col-span-1">
                      <CardHeader className="text-center pb-4">
                        <div className="relative mx-auto">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt="Profile" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                              {profile?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
                          >
                            <Camera className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {profile?.full_name || user?.email}
                          </h3>
                          <p className="text-muted-foreground">{profile?.major || "Student"}</p>
                          {profile?.year && <Badge variant="secondary" className="mt-2">{profile.year}</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{user?.email}</span>
                          </div>
                          {profile?.university && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{profile.university}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Separator />
                        <p className="text-sm text-muted-foreground">
                          {profile?.bio || "No bio added yet"}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Study Hours</p>
                              <p className="text-2xl font-bold text-foreground">{stats.studyHours}</p>
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
                            </div>
                            <Trophy className="w-8 h-8 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Study Sessions</p>
                              <p className="text-2xl font-bold text-foreground">{recentSessions.length}</p>
                            </div>
                            <Target className="w-8 h-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="progress" className="space-y-6">
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
                        </div>
                      ) : (
                        userProgress.slice(0, 5).map((progress, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-2">
                              <span>{progress.subject} - {progress.topic}</span>
                              <span>{progress.progress_percentage}%</span>
                            </div>
                            <Progress value={progress.progress_percentage} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(progress.total_study_time_minutes / 60)} hours studied
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
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
                          </div>
                        ) : (
                          recentSessions.map((session, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                              <div>
                                <p className="font-medium text-foreground">{session.topic}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.created_at).toLocaleDateString()} • {session.session_type.replace('_', ' ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">
                                  {session.duration_minutes} min
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile?.full_name || ""}
                            onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="university">University</Label>
                          <Input
                            id="university"
                            value={profile?.university || ""}
                            onChange={(e) => setProfile(prev => prev ? {...prev, university: e.target.value} : null)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            value={profile?.major || ""}
                            onChange={(e) => setProfile(prev => prev ? {...prev, major: e.target.value} : null)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={profile?.bio || ""}
                          onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                          disabled={!isEditing}
                        />
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button onClick={handleSave}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;

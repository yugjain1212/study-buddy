import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Shield,
  Moon,
  Sun,
  Monitor,
  Volume2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    studyReminders: true,
    achievementAlerts: false,
    weeklyReports: true
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    difficulty: "intermediate",
    studyGoal: "60"
  });

  const [userProfile, setUserProfile] = useState({
    email: "",
    full_name: ""
  });

  useEffect(() => {
    if (user) {
      setUserProfile({
        email: user.email || "",
        full_name: user.user_metadata?.full_name || ""
      });
    }
  }, [user]);

  const saveSettings = async () => {
    try {
      // Save preferences to user metadata or a preferences table
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            preferences,
            notifications,
            theme
          }
        });
        
        if (error) throw error;
      }
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateAccountInfo = async () => {
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          email: userProfile.email,
          data: { 
            full_name: userProfile.full_name 
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account Updated",
          description: "Your account information has been updated.",
        });
      }
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const changePassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset email has been sent to your email address.",
    });
  };

  const enableTwoFactor = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup will be available in the next update.",
    });
  };

  const exportData = async () => {
    try {
      if (user) {
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id);
        
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        
        const { data: achievements } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id);

        const exportData = {
          study_sessions: sessions,
          user_progress: progress,
          achievements: achievements,
          exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study-buddy-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Data Exported",
          description: "Your study data has been downloaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAllData = async () => {
    try {
      if (user && window.confirm("Are you sure you want to delete all your study data? This action cannot be undone.")) {
        await supabase.from('study_sessions').delete().eq('user_id', user.id);
        await supabase.from('user_progress').delete().eq('user_id', user.id);
        await supabase.from('achievements').delete().eq('user_id', user.id);
        
        toast({
          title: "Data Deleted",
          description: "All your study data has been deleted.",
        });
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async () => {
    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will delete all your data.")) {
      try {
        if (user) {
          await supabase.from('study_sessions').delete().eq('user_id', user.id);
          await supabase.from('user_progress').delete().eq('user_id', user.id);
          await supabase.from('achievements').delete().eq('user_id', user.id);
          await supabase.from('profiles').delete().eq('id', user.id);
        }
        
        toast({
          title: "Account Deletion",
          description: "Your account deletion request has been processed. You will be logged out.",
        });
        
        await signOut();
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please contact support.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="animate-slide-in-up">
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and application settings</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 glass-effect">
                <TabsTrigger value="general" className="transition-all duration-200 hover:scale-105">General</TabsTrigger>
                <TabsTrigger value="notifications" className="transition-all duration-200 hover:scale-105">Notifications</TabsTrigger>
                <TabsTrigger value="privacy" className="transition-all duration-200 hover:scale-105">Privacy</TabsTrigger>
                <TabsTrigger value="data" className="transition-all duration-200 hover:scale-105">Data</TabsTrigger>
                <TabsTrigger value="account" className="transition-all duration-200 hover:scale-105">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card className="glass-effect hover-lift animate-slide-in-up animate-stagger-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Appearance
                    </CardTitle>
                    <CardDescription>Customize how the application looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Theme</Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                      </div>
                      <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
                        <SelectTrigger className="w-40 glass-effect">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect">
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Language</Label>
                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                      </div>
                      <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                        <SelectTrigger className="w-32 glass-effect">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect hover-lift animate-slide-in-up animate-stagger-2">
                  <CardHeader>
                    <CardTitle>Learning Preferences</CardTitle>
                    <CardDescription>Customize your learning experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Default Difficulty</Label>
                        <Select value={preferences.difficulty} onValueChange={(value) => setPreferences({...preferences, difficulty: value})}>
                          <SelectTrigger className="glass-effect">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-effect">
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="study-goal">Daily Study Goal (minutes)</Label>
                        <Input
                          id="study-goal"
                          type="number"
                          value={preferences.studyGoal}
                          onChange={(e) => setPreferences({...preferences, studyGoal: e.target.value})}
                          className="glass-effect"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="glass-effect hover-lift animate-slide-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Study Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded about your study sessions</p>
                      </div>
                      <Switch
                        checked={notifications.studyReminders}
                        onCheckedChange={(checked) => setNotifications({...notifications, studyReminders: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Achievement Alerts</Label>
                        <p className="text-sm text-muted-foreground">Celebrate your learning milestones</p>
                      </div>
                      <Switch
                        checked={notifications.achievementAlerts}
                        onCheckedChange={(checked) => setNotifications({...notifications, achievementAlerts: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-foreground">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Get weekly progress summaries</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card className="glass-effect hover-lift animate-slide-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacy & Security
                    </CardTitle>
                    <CardDescription>Control your privacy and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Data Collection</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        We collect anonymized usage data to improve our AI recommendations
                      </p>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Analytics Tracking</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Help us understand how you use the platform
                      </p>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Control who can see your learning progress
                      </p>
                      <Select defaultValue="private">
                        <SelectTrigger className="w-full glass-effect">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect hover-lift animate-slide-in-up animate-stagger-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Password & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start glass-effect hover-lift" onClick={changePassword}>
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start glass-effect hover-lift" onClick={enableTwoFactor}>
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start glass-effect hover-lift">
                      View Active Sessions
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <Card className="glass-effect hover-lift animate-slide-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Data Management
                    </CardTitle>
                    <CardDescription>Export or manage your learning data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex-col gap-2 glass-effect hover-lift" onClick={exportData}>
                        <Download className="w-5 h-5" />
                        Export Study Data
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2 glass-effect hover-lift" onClick={exportData}>
                        <Download className="w-5 h-5" />
                        Download Progress Report
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Export your learning progress, quiz results, and study statistics
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect hover-lift animate-slide-in-up animate-stagger-1">
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Study Sessions</span>
                        <span>2.4 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quiz Results</span>
                        <span>1.8 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>AI Conversations</span>
                        <span>5.2 MB</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>9.4 MB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card className="glass-effect hover-lift animate-slide-in-up">
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Manage your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-email">Email Address</Label>
                        <Input 
                          id="account-email" 
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-fullname">Full Name</Label>
                        <Input 
                          id="account-fullname" 
                          value={userProfile.full_name}
                          onChange={(e) => setUserProfile({...userProfile, full_name: e.target.value})}
                          className="glass-effect"
                        />
                      </div>
                    </div>
                    <Button onClick={updateAccountInfo} className="ambient-glow hover-lift">Update Account Information</Button>
                  </CardContent>
                </Card>

                <Card className="border-red-200 glass-effect animate-slide-in-up animate-stagger-1">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible account actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 glass-effect" onClick={deleteAllData}>
                      Delete All Study Data
                    </Button>
                    <Button variant="destructive" className="w-full ambient-glow" onClick={deleteAccount}>
                      Delete Account
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end animate-slide-in-up animate-stagger-4">
              <Button onClick={saveSettings} className="ambient-glow hover-lift">Save All Settings</Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Settings;

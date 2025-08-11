
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Check } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="relative py-24 px-6 overflow-hidden bg-muted/10 border-y border-border">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Everything You Need to Excel</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive learning tools designed for modern education
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-dark interactive-card animate-slide-in-up border border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">AI Personal Tutor</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Get instant, detailed explanations for any concept with interactive examples.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Code examples with syntax highlighting
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Step-by-step problem solving
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Interactive follow-up questions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark interactive-card animate-slide-in-up border border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Smart Study Planner</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Organize your learning with AI-optimized schedules that adapt to your progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Personalized learning paths
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Automated study reminders
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Progress tracking & analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark interactive-card animate-slide-in-up border border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Interactive Quizzes</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Test your knowledge with auto-generated quizzes tailored to your level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Adaptive difficulty levels
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Detailed answer explanations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Performance analytics
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;
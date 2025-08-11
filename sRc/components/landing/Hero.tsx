
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Target, Star, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden min-h-screen flex items-center">
      {/* Enhanced Ambient Background Elements */}
      {/* 3D Orbiting Gradient Disc */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-[1200px] h-[1200px] rounded-full bg-gradient-to-br from-primary/20 via-purple-600/10 to-background border border-primary/10 blur-2xl animate-orbit"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsla(263,70%,65%,0.15)_0%,transparent_50%)] animate-pulse-glow"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,hsla(280,60%,60%,0.1)_0%,transparent_50%)] animate-pulse-glow" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,hsla(240,50%,55%,0.08)_0%,transparent_60%)] animate-pulse-glow" style={{animationDelay: '3s'}}></div>
      
      {/* Enhanced Floating Particles */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-primary/40 rounded-full animate-float particle"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-purple-400/30 rounded-full animate-float particle" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-primary/35 rounded-full animate-float particle" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-1/3 right-20 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-float particle" style={{animationDelay: '6s'}}></div>
      <div className="absolute top-60 left-1/3 w-2 h-2 bg-primary/25 rounded-full animate-float particle" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 right-1/3 w-1.5 h-1.5 bg-purple-400/35 rounded-full animate-float particle" style={{animationDelay: '5s'}}></div>

      <div className="container mx-auto text-center max-w-6xl relative z-10 perspective-1000">
        {/* Enhanced Header Badge */}
        <Badge className="mb-6 glass-effect text-foreground border border-primary/30 ambient-glow hover-lift animate-slide-in-up px-6 py-2">
          <Sparkles className="w-4 h-4 mr-2 animate-pulse-glow" />
          Your AI-Powered Learning Companion
        </Badge>
        
        {/* Enhanced Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight animate-slide-in-up animate-stagger-1">
          Master Any Subject
          <span className="block text-gradient animate-gradient mt-2">
            with AI Guidance
          </span>
        </h1>
        
        {/* Enhanced Description */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed animate-slide-in-up animate-stagger-2">
          Get personalized explanations, interactive quizzes, and adaptive study plans. 
          Transform your learning experience with cutting-edge AI technology.
        </p>
        
        {/* Enhanced Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 animate-slide-in-up animate-stagger-3">
          <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full border border-primary/20 hover-lift">
            <Users className="w-5 h-5 text-primary animate-pulse-glow" />
            <span className="font-semibold text-primary">10,000+</span>
            <span className="text-muted-foreground">Students</span>
          </div>
          <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full border border-green-500/20 hover-lift">
            <Star className="w-5 h-5 text-yellow-500 animate-pulse-glow" />
            <span className="font-semibold text-yellow-500">4.9/5</span>
            <span className="text-muted-foreground">Rating</span>
          </div>
          <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full border border-blue-500/20 hover-lift">
            <TrendingUp className="w-5 h-5 text-blue-500 animate-pulse-glow" />
            <span className="font-semibold text-blue-500">95%</span>
            <span className="text-muted-foreground">Success Rate</span>
          </div>
        </div>
        
        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-in-up animate-stagger-4">
          <Link to="/signup">
            <Button size="lg" className="button-gradient text-primary-foreground text-lg px-12 py-6 hover-lift ambient-glow interactive-button group shadow-2xl">
              Start Learning Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-12 py-6 glass-effect border-primary/30 hover:bg-primary/10 hover-lift interactive-button shadow-lg">
            <Zap className="mr-2 w-5 h-5" />
            View Demo
          </Button>
        </div>
        
        {/* Enhanced Hero Dashboard Preview */}
        <div className="relative max-w-7xl mx-auto animate-slide-in-up animate-stagger-5">
          <div className="glass-effect-strong border border-primary/20 rounded-3xl shadow-2xl p-8 hover-lift ambient-glow-purple interactive-card">
            <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-8 border border-white/10">
              {/* Enhanced Browser Header */}
              <div className="flex items-center space-x-3 mb-8 animate-fade-in">
                <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <span className="text-sm text-muted-foreground ml-6 font-mono">Study Buddy AI Dashboard</span>
              </div>
              
              {/* Enhanced Feature Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="glass-effect border border-primary/20 rounded-xl p-6 hover-lift animate-slide-in-right animate-stagger-1 interactive-card group">
                  <div className="flex items-center mb-4">
                    <Target className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform ambient-glow" />
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">AI Tutor</h4>
                      <p className="text-xs text-muted-foreground">Instant explanations</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gradient-to-r from-primary/60 via-purple-500/40 to-transparent rounded-full"></div>
                    <div className="text-xs text-muted-foreground">Active learning session</div>
                  </div>
                </div>
                
                <div className="glass-effect border border-primary/20 rounded-xl p-6 hover-lift animate-slide-in-right animate-stagger-2 interactive-card group">
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-8 h-8 text-purple-400 mr-3 group-hover:scale-110 transition-transform ambient-glow" />
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Smart Planner</h4>
                      <p className="text-xs text-muted-foreground">Adaptive scheduling</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gradient-to-r from-purple-500/60 via-primary/40 to-transparent rounded-full"></div>
                    <div className="text-xs text-muted-foreground">Optimized study path</div>
                  </div>
                </div>
                
                <div className="glass-effect border border-primary/20 rounded-xl p-6 hover-lift animate-slide-in-right animate-stagger-3 interactive-card group">
                  <div className="flex items-center mb-4">
                    <Zap className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform ambient-glow" />
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Progress Tracking</h4>
                      <p className="text-xs text-muted-foreground">Real-time insights</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gradient-to-r from-primary/60 via-purple-400/40 to-transparent rounded-full"></div>
                    <div className="text-xs text-muted-foreground">Performance analytics</div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Animated Progress Indicators */}
              <div className="flex justify-center space-x-12 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse ambient-glow"></div>
                  <span className="text-sm text-muted-foreground font-medium">AI Online</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse ambient-glow" style={{animationDelay: '0.7s'}}></div>
                  <span className="text-sm text-muted-foreground font-medium">Learning Active</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse ambient-glow" style={{animationDelay: '1.4s'}}></div>
                  <span className="text-sm text-muted-foreground font-medium">Progress Synced</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Floating Action Indicators */}
          <div className="absolute -top-8 -right-8 glass-effect border border-primary/20 rounded-full p-4 animate-float ambient-glow">
            <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
          </div>
          <div className="absolute -bottom-8 -left-8 glass-effect border border-purple-400/20 rounded-full p-4 animate-float ambient-glow" style={{animationDelay: '3s'}}>
            <Zap className="w-6 h-6 text-purple-400 animate-pulse-glow" />
          </div>
          <div className="absolute top-1/2 -left-6 glass-effect border border-primary/20 rounded-full p-3 animate-float ambient-glow" style={{animationDelay: '1.5s'}}>
            <Target className="w-5 h-5 text-primary animate-pulse-glow" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
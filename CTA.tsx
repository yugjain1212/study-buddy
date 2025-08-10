
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-primary via-primary/80 to-primary/90 glass-effect">
      {/* Decorative Radial Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsla(263,70%,65%,0.25)_0%,transparent_60%)] animate-pulse-glow"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,hsla(280,60%,60%,0.15)_0%,transparent_60%)] animate-pulse-glow" style={{animationDelay:'2s'}}></div>
      </div>

      <div className="container mx-auto text-center text-primary-foreground relative z-10">
        <Sparkles className="w-8 h-8 mx-auto mb-4 animate-pulse-glow ambient-glow" />
        <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-up animate-stagger-1">Ready to Transform Your Learning?</h2>
        <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto animate-slide-in-up animate-stagger-2">Join thousands of students already learning smarter with Study Buddy AI</p>
        <Link to="/signup">
          <Button size="lg" className="button-gradient text-lg px-8 py-6 hover-lift interactive-button animate-slide-in-up animate-stagger-3">
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Floating Decorative Particles */}
      <div className="absolute -top-4 left-1/3 w-2 h-2 bg-accent/40 rounded-full animate-float ambient-glow"></div>
      <div className="absolute bottom-8 right-1/4 w-3 h-3 bg-purple-400/40 rounded-full animate-float ambient-glow" style={{animationDelay:'3s'}}></div>
    </section>
  );
};

export default CTA;

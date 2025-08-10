
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-primary/20 glass-effect-strong sticky top-0 z-50 ambient-glow">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 animate-slide-in-right">
          <div className="w-10 h-10 button-gradient rounded-xl flex items-center justify-center ambient-glow hover-lift">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Study Buddy AI
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 animate-slide-in-up">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-all hover:scale-105 transform duration-300 focus-ring hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            Features
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-all hover:scale-105 transform duration-300 focus-ring hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            How It Works
          </a>
          <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-all hover:scale-105 transform duration-300 focus-ring hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            Reviews
          </a>
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-4 animate-slide-in-right">
          <Link to="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary glass-effect border border-primary/20 hover:bg-primary/10 hover-lift focus-ring">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="button-gradient text-primary-foreground hover-lift ambient-glow interactive-button focus-ring">
              Get Started
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors glass-effect border border-primary/20 rounded-lg hover-lift focus-ring"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-primary/20 glass-effect-strong animate-slide-in-up">
          <nav className="container mx-auto px-6 py-6 space-y-4">
            <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors py-3 hover:pl-2 focus-ring">
              Features
            </a>
            <a href="#how-it-works" className="block text-muted-foreground hover:text-primary transition-colors py-3 hover:pl-2 focus-ring">
              How It Works
            </a>
            <a href="#testimonials" className="block text-muted-foreground hover:text-primary transition-colors py-3 hover:pl-2 focus-ring">
              Reviews
            </a>
            <div className="pt-4 space-y-3">
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary glass-effect border border-primary/20 hover:bg-primary/10 focus-ring">
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="block">
                <Button className="w-full button-gradient text-primary-foreground hover-lift ambient-glow focus-ring">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
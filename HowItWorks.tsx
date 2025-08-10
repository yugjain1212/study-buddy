
import { MessageSquare, Brain, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Ask Your Question",
      description: "Type any question or upload your work for review",
      icon: MessageSquare
    },
    {
      step: "2", 
      title: "Get Instant Help",
      description: "Receive detailed explanations, examples, and step-by-step solutions",
      icon: Brain
    },
    {
      step: "3",
      title: "Track Your Progress",
      description: "Monitor your learning journey and build knowledge systematically",
      icon: TrendingUp
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground text-2xl font-bold">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
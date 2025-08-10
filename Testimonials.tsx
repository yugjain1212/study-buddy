
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CS Major, MIT",
      content: "This AI helped me ace my operating systems final! The explanations are incredibly clear and the examples are perfect.",
      rating: 5
    },
    {
      name: "Marcus Johnson", 
      role: "Software Engineering Student",
      content: "The study planner is a game-changer. I'm finally organized and my grades have improved dramatically.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Data Structures Student", 
      content: "I love how it breaks down complex algorithms. The interactive quizzes really help reinforce my learning.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-6 bg-secondary/20 border-y border-border">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Trusted by Students Worldwide</h2>
          <p className="text-xl text-muted-foreground">See what learners are saying about Study Buddy AI</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
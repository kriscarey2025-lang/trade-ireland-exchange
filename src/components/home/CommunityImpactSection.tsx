import { TrendingUp, Users, Leaf, Heart, MessageSquare, Lightbulb } from "lucide-react";

const impactStories = [
  {
    quote: "I've been retired for five years and felt a bit useless, honestly. Now I'm teaching three local teenagers woodworking, and in return, one of them keeps my computer running smoothly. I haven't felt this useful in years.",
    author: "Michael, 68",
    location: "Cork",
    skill: "Woodworking for tech help"
  },
  {
    quote: "As a single mum, I couldn't afford piano lessons for my daughter. Through SwapSkills, she's learning from a lovely retired music teacher, and I help with her grocery shopping. Win-win!",
    author: "Sarah, 34",
    location: "Dublin",
    skill: "Shopping for music lessons"
  },
  {
    quote: "My garden was a complete state. Now it's the pride of the street, and I've taught my helper how to fix almost anything around the house. We've become good friends over cups of tea.",
    author: "Patrick, 72",
    location: "Galway",
    skill: "DIY for gardening"
  }
];

const benefits = [
  {
    icon: Users,
    title: "Stronger Communities",
    description: "Every skill swap creates a connection. These connections weave together to form the fabric of real community — neighbours who know each other, trust each other, and look out for each other.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Leaf,
    title: "Environmental Impact",
    description: "Local skill sharing means less driving to distant service providers, less packaging, less waste. It's a small but meaningful contribution to a more sustainable Ireland.",
    color: "bg-success/10 text-success"
  },
  {
    icon: Heart,
    title: "Mental Wellbeing",
    description: "Loneliness is a growing crisis in Ireland. Every swap is an opportunity for genuine human connection, for feeling valued, for being part of something bigger than yourself.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: TrendingUp,
    title: "Economic Resilience",
    description: "When skills stay local, communities become more self-sufficient. Money that would have left the area stays within the community, strengthening the local economy.",
    color: "bg-highlight/10 text-highlight"
  }
];

export function CommunityImpactSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold mb-6">
              <Lightbulb className="w-4 h-4" />
              Real impact, real stories
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              What happens when <span className="gradient-text">communities connect</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every skill swap is more than a transaction. It's a story, a connection, a small act that makes Ireland a little bit better.
            </p>
          </div>

          {/* Stories carousel */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {impactStories.map((story, index) => (
              <div 
                key={index} 
                className="bg-card rounded-3xl p-6 border border-border/50 cozy-shadow hover-lift"
              >
                <div className="mb-4">
                  <MessageSquare className="w-8 h-8 text-primary/60" />
                </div>
                <blockquote className="text-muted-foreground mb-4 italic">
                  "{story.quote}"
                </blockquote>
                <div className="pt-4 border-t border-border/30">
                  <p className="font-semibold text-foreground">{story.author}</p>
                  <p className="text-sm text-muted-foreground">{story.location}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {story.skill}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex gap-5 p-6 bg-card rounded-2xl border border-border/50 hover-lift cozy-shadow"
              >
                <div className={`w-14 h-14 rounded-xl ${benefit.color} flex items-center justify-center shrink-0`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to reflection */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-3xl p-8 md:p-10 border border-primary/20">
              <p className="text-xl md:text-2xl font-display font-medium text-foreground mb-4">
                "The greatest gift you can give someone is your time, your attention, your skill."
              </p>
              <p className="text-muted-foreground">
                What will you share today?
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

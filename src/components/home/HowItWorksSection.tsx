import { UserPlus, ListChecks, MessageCircle, HandshakeIcon } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    emoji: "👋",
    title: "Create Your Profile",
    description: "Sign up for free and tell us about your skills. Upload qualifications if you have them.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ListChecks,
    emoji: "📝",
    title: "List Your Services",
    description: "Post what skills you can offer and what services you're looking for in return.",
    color: "bg-highlight/10 text-highlight",
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "Browse & Connect",
    description: "Find services you need and send trade requests. Use credits for flexible exchanges.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: HandshakeIcon,
    emoji: "🎉",
    title: "Trade & Review",
    description: "Complete your trade and leave reviews. Build your reputation in the community.",
    color: "bg-success/10 text-success",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-secondary/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-highlight/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple as 1-2-3-4
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Trading skills is simple. Here's how to get started in four easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative text-center p-6 rounded-3xl bg-card border-2 border-border hover:border-primary/30 transition-all hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Number Badge */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-accent text-white font-bold text-sm shadow-lg">
                {index + 1}
              </span>
              
              {/* Icon Container */}
              <div className="relative inline-flex mb-5 mt-2">
                <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${step.color}`}>
                  <step.icon className="h-9 w-9" />
                </div>
                <span className="absolute -bottom-1 -right-1 text-2xl">{step.emoji}</span>
              </div>

              <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { UserPlus, ListChecks, MessageCircle, HandshakeIcon } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up for free and tell us about your skills. Upload qualifications if you have them.",
  },
  {
    icon: ListChecks,
    title: "List Your Services",
    description: "Post what skills you can offer and what services you're looking for in return.",
  },
  {
    icon: MessageCircle,
    title: "Browse & Connect",
    description: "Find services you need and send trade requests. Use credits for flexible exchanges.",
  },
  {
    icon: HandshakeIcon,
    title: "Trade & Review",
    description: "Complete your trade and leave reviews. Build your reputation in the community.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How SkillSwap Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trading skills is simple. Here's how to get started in four easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              
              {/* Step Number */}
              <div className="relative inline-flex mb-6">
                <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-card border border-border shadow-medium">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-sm">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { UserPlus, ListChecks, MessageCircle, HandshakeIcon } from "lucide-react";
const steps = [{
  icon: UserPlus,
  emoji: "👋",
  title: "Say hello",
  description: "Tell us a bit about yourself and what you're good at. No CV required — just be yourself!",
  color: "bg-primary/10 text-primary"
}, {
  icon: ListChecks,
  emoji: "✨",
  title: "Share your talents",
  description: "Can you bake? Fix bikes? Help with homework? Pop it up and let neighbours know.",
  color: "bg-highlight/10 text-highlight"
}, {
  icon: MessageCircle,
  emoji: "☕",
  title: "Have a chat",
  description: "Found someone interesting? Drop them a message. Maybe grab a cuppa and plan your swap.",
  color: "bg-accent/10 text-accent"
}, {
  icon: HandshakeIcon,
  emoji: "🎉",
  title: "Make it happen",
  description: "Do the swap, make a friend, leave a wee review. That's community in action!",
  color: "bg-success/10 text-success"
}];
export function HowItWorksSection() {
  return <section className="py-24 relative overflow-hidden" style={{ background: 'var(--gradient-section-alt)' }}>
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-primary/6 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/15 shadow-sm">
            Dead simple, really
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How does it work?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            No complicated systems. Just good people helping each other out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => <div key={index} className="relative text-center p-7 rounded-3xl bg-card/90 border border-border/40 hover:border-primary/25 transition-all duration-300 hover-lift shadow-medium hover:shadow-elevated animate-fade-up backdrop-blur-sm" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              {/* Step Number Badge */}
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-medium">
                {index + 1}
              </span>
              
              {/* Icon Container */}
              <div className="relative inline-flex mb-5 mt-2">
                <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${step.color} shadow-sm`}>
                  <step.icon className="h-9 w-9" />
                </div>
                <span className="absolute -bottom-1 -right-1 text-2xl">{step.emoji}</span>
              </div>

              <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
}
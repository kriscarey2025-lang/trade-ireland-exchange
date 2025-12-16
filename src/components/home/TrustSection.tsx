import { Shield, Star, Users, Heart, Flag } from "lucide-react";
const trustFeatures = [{
  icon: Shield,
  title: "Optional verification",
  description: "Want extra peace of mind? Users can verify their ID or social media—totally optional, but it helps build trust."
}, {
  icon: Flag,
  title: "Report concerns",
  description: "Had an unpleasant experience? We encourage you to report it. We take every report seriously."
}, {
  icon: Star,
  title: "Reputation matters",
  description: "Build trust through honest reviews. Good deeds get noticed around here."
}, {
  icon: Heart,
  title: "Community first",
  description: "This isn't a faceless app. It's your neighbours looking out for each other."
}, {
  icon: Users,
  title: "Made for Ireland",
  description: "Built right here in Killeshin. We understand what Irish communities need."
}];
export function TrustSection() {
  return <section className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              We've got your back
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Look, we know trusting strangers can be scary. That's why we've built 
              this whole thing around keeping you safe. Verified profiles, honest reviews, 
              and a community that actually cares about each other.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {trustFeatures.map((feature, index) => <div key={index} className="flex gap-4 animate-fade-up" style={{
              animationDelay: `${index * 0.1}s`
            }}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>)}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Background Circles */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-float" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-secondary to-background border border-border" />
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🤝</div>
                  <p className="text-lg font-medium text-foreground">Real connections</p>
                  <p className="text-sm text-muted-foreground">Not just transactions</p>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-8 right-8 bg-card rounded-xl p-3 shadow-elevated animate-float border border-border/50" style={{
              animationDelay: "0.2s"
            }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍀</span>
                  <span className="font-medium text-sm">Irish made</span>
                </div>
              </div>
              <div className="absolute bottom-12 left-4 bg-card rounded-xl p-3 shadow-elevated animate-float border border-border/50" style={{
              animationDelay: "0.4s"
            }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span className="font-medium text-sm">ID checked</span>
                </div>
              </div>
              <div className="absolute bottom-24 right-0 bg-card rounded-xl p-3 shadow-elevated animate-float border border-border/50" style={{
              animationDelay: "0.6s"
            }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <span className="font-medium text-sm">Real chats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}
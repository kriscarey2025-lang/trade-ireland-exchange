import { Shield, CheckCircle2, Star, Users } from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Members",
    description: "Upload qualifications and ID for verification. Manual review ensures trust.",
  },
  {
    icon: Star,
    title: "Earned Badges",
    description: "Build your reputation through successful trades and positive reviews.",
  },
  {
    icon: CheckCircle2,
    title: "Quality Assurance",
    description: "Every trade is reviewed. Our community standards keep everyone safe.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built for Irish communities, by Irish communities. We're all neighbours here.",
  },
];

export function TrustSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built on Trust & Transparency
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We combine manual verification with a community-driven badge system. 
              Start unverified, earn trust through trades, or fast-track with document verification.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {trustFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex gap-4 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
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
                  <div className="text-6xl font-bold text-primary mb-2">98%</div>
                  <p className="text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-8 right-8 bg-card rounded-xl p-3 shadow-elevated animate-float" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-medium">5-Star</span>
                </div>
              </div>
              <div className="absolute bottom-12 left-4 bg-card rounded-xl p-3 shadow-elevated animate-float" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-medium">Verified</span>
                </div>
              </div>
              <div className="absolute bottom-24 right-0 bg-card rounded-xl p-3 shadow-elevated animate-float" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium">Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

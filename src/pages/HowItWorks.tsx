import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  ListChecks,
  Search,
  MessageCircle,
  HandshakeIcon,
  Star,
  Coins,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "1. Create Your Free Account",
    description:
      "Sign up with your email. Tell us about yourself and the skills you have. You can add qualifications and work samples later.",
    details: ["Free to join", "No credit card required", "Takes 2 minutes"],
  },
  {
    icon: ListChecks,
    title: "2. Post Your Services",
    description:
      "List what you can offer and what you're looking for. Be specific about your skills, experience, and availability.",
    details: ["Post unlimited services", "Add photos & qualifications", "Set your own terms"],
  },
  {
    icon: Search,
    title: "3. Browse & Discover",
    description:
      "Search through services in your area. Filter by category, location, and type to find exactly what you need.",
    details: ["Smart search filters", "See ratings & reviews", "View provider profiles"],
  },
  {
    icon: MessageCircle,
    title: "4. Send Trade Requests",
    description:
      "Found something you need? Send a trade request! Propose a direct swap or use credits for flexibility.",
    details: ["In-app messaging", "Negotiate terms", "Choose swap or credits"],
  },
  {
    icon: HandshakeIcon,
    title: "5. Complete the Trade",
    description:
      "Meet up and exchange services. Both parties confirm completion when satisfied.",
    details: ["Safety guidelines provided", "Mutual confirmation", "Credits transferred automatically"],
  },
  {
    icon: Star,
    title: "6. Rate & Review",
    description:
      "Leave honest feedback to help the community. Good reviews earn you badges and build your reputation.",
    details: ["5-star rating system", "Written reviews", "Earn trust badges"],
  },
];

const tradingModes = [
  {
    icon: HandshakeIcon,
    title: "Direct Swap",
    description:
      "Trade services directly. You tile their bathroom, they tutor your kids. Simple and straightforward.",
    example: "Tiling ↔ Tutoring",
  },
  {
    icon: Coins,
    title: "Credit System",
    description:
      "Earn credits by providing services, spend them on services you need. Maximum flexibility.",
    example: "Earn 40 credits → Spend on gardening",
  },
];

export default function HowItWorks() {
  return (
    <>
      <SEO 
        title="How It Works"
        description="Learn how Swap Skills works - create your account, post services, browse listings, connect with neighbours, and start trading skills in Ireland."
        keywords="how swap skills works, skill exchange tutorial, barter services Ireland guide, trade skills step by step"
        url="https://swap-skills.com/how-it-works"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How SkillSwap Works</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trading skills is simple, safe, and rewarding. Here's everything you need to know to get started.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-6 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground">
                      <step.icon className="h-8 w-8" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <div className="flex flex-wrap gap-3">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trading Modes */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Two Ways to Trade</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose direct swaps for simple exchanges, or use credits for maximum flexibility.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {tradingModes.map((mode, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <mode.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{mode.title}</h3>
                    <p className="text-muted-foreground mb-4">{mode.description}</p>
                    <div className="inline-block px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium">
                      Example: {mode.example}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join our growing community of skill traders across Ireland.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/browse">Browse Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </>
  );
}

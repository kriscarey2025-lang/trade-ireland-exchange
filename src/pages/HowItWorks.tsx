import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  ListChecks,
  Search,
  MessageCircle,
  HandshakeIcon,
  Star,
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
      "List what you can offer and what you're looking for in return. Be specific about your skills, experience, and availability.",
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
    title: "4. Propose a Swap",
    description:
      "Found something you need? Reach out and propose a direct swap! Discuss what you can offer in exchange.",
    details: ["In-app messaging", "Discuss terms", "Agree on the exchange"],
  },
  {
    icon: HandshakeIcon,
    title: "5. Complete the Exchange",
    description:
      "Meet up and exchange services. Both parties confirm completion when satisfied with the swap.",
    details: ["Safety guidelines provided", "Mutual confirmation", "Fair exchange guaranteed"],
  },
  {
    icon: Star,
    title: "6. Rate & Review",
    description:
      "Leave honest feedback to help the community. Good reviews build your reputation and trust.",
    details: ["5-star rating system", "Written reviews", "Earn trust badges"],
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">How Swap Skills Works</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Exchange skills directly with your neighbours. No money changes hands — just fair, like-for-like service swaps.
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

          {/* Direct Swap Highlight */}
          <section className="py-16 bg-secondary/30">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground mx-auto mb-8">
                  <HandshakeIcon className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Direct Service Exchange</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Swap Skills is all about fair, direct exchanges. You help someone with tiling, they help you with tutoring. 
                  No complicated points systems — just honest trades between neighbours.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 text-left">
                  <div className="bg-background rounded-xl p-6 border border-border/50">
                    <h4 className="font-semibold mb-2">Simple & Fair</h4>
                    <p className="text-sm text-muted-foreground">Agree on what each service is worth and make a straightforward swap.</p>
                  </div>
                  <div className="bg-background rounded-xl p-6 border border-border/50">
                    <h4 className="font-semibold mb-2">Build Community</h4>
                    <p className="text-sm text-muted-foreground">Get to know your neighbours while helping each other out.</p>
                  </div>
                  <div className="bg-background rounded-xl p-6 border border-border/50">
                    <h4 className="font-semibold mb-2">Save Money</h4>
                    <p className="text-sm text-muted-foreground">Exchange your time and skills instead of spending cash.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16">
            <div className="container text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8">
                Join our growing community of skill swappers across Ireland.
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

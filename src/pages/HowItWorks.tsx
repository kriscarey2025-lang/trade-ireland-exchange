import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { BreadcrumbJsonLd, HowToJsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { UserPlus, PenLine, Search, MessageCircle, HandshakeIcon, Star, ArrowRight, CheckCircle2, Clock, Calendar } from "lucide-react";
const steps = [{
  icon: UserPlus,
  title: "1. Create Your Free Account",
  description: "Sign up with your email. Tell us about yourself and the skills you have. You can add qualifications and work samples later.",
  details: ["Free to join", "No credit card required", "Takes 2 minutes"]
}, {
  icon: null,
  // Special dual-option step
  title: "2. Post a Service or Browse",
  description: "You have two paths: share what you can offer, or browse what others are offering. Or do both!",
  isChoice: true,
  options: [{
    icon: PenLine,
    label: "Post Your Service",
    description: "Share your skills with the community",
    details: ["Time-Sensitive Ads — Need help urgently? Mark it!", "Long-Term Ads — Ongoing services at your pace"]
  }, {
    icon: Search,
    label: "Browse Services",
    description: "Find what you need from neighbours",
    details: ["Smart filters by category & location", "See ratings & reviews"]
  }]
}, {
  icon: MessageCircle,
  title: "3. Get in Touch",
  description: "Found something you need or interested in a service? Reach out through our in-app messaging to start the conversation.",
  details: ["Safe in-app messaging", "Discuss the details", "Get to know each other"]
}, {
  icon: HandshakeIcon,
  title: "4. Propose a Swap",
  description: "Agree on what you'll exchange and set a completion date. Both parties confirm the terms of the swap before moving forward.",
  details: ["Set a completion date", "Agree on exchange terms", "Mutual confirmation required"]
}, {
  icon: Star,
  title: "5. Rate & Review",
  description: "Once the completion date has passed, you'll be able to rate and review each other. Honest feedback builds trust in our community.",
  details: ["Available after completion date", "5-star rating system", "Written reviews to share your experience"]
}];
const howToSteps = steps.map(step => ({
  name: step.title.replace(/^\d+\.\s*/, ''),
  text: step.description
}));
export default function HowItWorks() {
  return <>
      <SEO title="How It Works" description="Learn how Swap Skills works - create your account, post services, browse listings, connect with neighbours, and start trading skills in Ireland." keywords="how swap skills works, skill exchange tutorial, barter services Ireland guide, trade skills step by step" url="https://swap-skills.com/how-it-works" />
      <HowToJsonLd name="How to Swap Skills in Ireland" description="A step-by-step guide to trading skills and services with neighbours in Ireland using SwapSkills." steps={howToSteps} />
      <BreadcrumbJsonLd items={[{
      name: "Home",
      url: "https://swap-skills.com"
    }, {
      name: "How It Works",
      url: "https://swap-skills.com/how-it-works"
    }]} />
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
              <div className="max-w-4xl mx-auto space-y-12">
                {steps.map((step, index) => <div key={index} className="animate-fade-up" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                    {step.isChoice ?
                // Special rendering for the choice step
                <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground mb-6">{step.description}</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {step.options?.map((option, optIndex) => <div key={optIndex} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground">
                                  <option.icon className="h-6 w-6" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{option.label}</h4>
                                  <p className="text-sm text-muted-foreground">{option.description}</p>
                                </div>
                              </div>
                              <div className="space-y-2 mt-4">
                                {option.details.map((detail, i) => <div key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span>{detail}</span>
                                  </div>)}
                              </div>
                            </div>)}
                        </div>
                      </div> :
                // Standard step rendering
                <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground">
                            {step.icon && <step.icon className="h-8 w-8" />}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          <div className="flex flex-wrap gap-3">
                            {step.details?.map((detail, i) => <div key={i} className="flex items-center gap-1.5 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span>{detail}</span>
                              </div>)}
                          </div>
                        </div>
                      </div>}
                  </div>)}
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
                <p className="text-lg text-muted-foreground mb-8">Swap Skills is all about fair, direct exchanges. You help someone they help you with. No complicated points systems — just honest trades between neighbours.You decide what is valueable to you and to what extend. </p>
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
    </>;
}
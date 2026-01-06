import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Leaf, Shield, ArrowRight, UserPlus, ListChecks, MessageCircle, HandshakeIcon, Star, Flag, MapPin, Clock, Sprout, Globe, HeartHandshake, Coins } from "lucide-react";
import { SEO } from "@/components/SEO";
import { BreadcrumbJsonLd, OrganizationJsonLd, PersonJsonLd } from "@/components/seo/JsonLd";
import founderImage from "@/assets/founder-kristina-new.png";

const values = [
  {
    icon: Heart,
    title: "Community First",
    description:
      "We believe in the power of communities helping each other. SwapSkills brings neighbours together.",
  },
  {
    icon: Users,
    title: "Inclusive Trading",
    description:
      "Everyone has skills to offer. We make it easy for anyone to participate, regardless of profession.",
  },
  {
    icon: Leaf,
    title: "Sustainable Living",
    description:
      "Trade skills, not money. Reduce consumption and build a more sustainable local economy.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Our verification system and community reviews ensure safe and reliable exchanges.",
  },
];

const howItWorksSteps = [
  {
    icon: UserPlus,
    emoji: "👋",
    title: "Say hello",
    description: "Tell us a bit about yourself and what you're good at. No CV required — just be yourself!",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: ListChecks,
    emoji: "✨",
    title: "Share your talents",
    description: "Can you bake? Fix bikes? Help with homework? Pop it up and let neighbours know.",
    color: "bg-highlight/10 text-highlight"
  },
  {
    icon: MessageCircle,
    emoji: "☕",
    title: "Have a chat",
    description: "Found someone interesting? Drop them a message. Maybe grab a cuppa and plan your swap.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: HandshakeIcon,
    emoji: "🎉",
    title: "Make it happen",
    description: "Do the swap, make a friend, leave a wee review. That's community in action!",
    color: "bg-success/10 text-success"
  }
];

const trustFeatures = [
  {
    icon: Shield,
    title: "Optional verification",
    description: "Want extra peace of mind? Users can verify their ID or social media—totally optional, but it helps build trust."
  },
  {
    icon: Flag,
    title: "Report concerns",
    description: "Had an unpleasant experience? We encourage you to report it. We take every report seriously."
  },
  {
    icon: Star,
    title: "Reputation matters",
    description: "Build trust through honest reviews. Good deeds get noticed around here."
  },
  {
    icon: Heart,
    title: "Community first",
    description: "This isn't a faceless app. It's your neighbours looking out for each other."
  },
  {
    icon: Users,
    title: "Made for Ireland",
    description: "Built right here in Killeshin. We understand what Irish communities need."
  }
];

export default function About() {
  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about Swap Skills - Ireland's community-driven platform for trading skills and services without money. Founded by Kristina Carey to help neighbours help each other."
        keywords="about swap skills, skill exchange Ireland, Kristina Carey, community trading, barter Ireland"
        url="https://swap-skills.com/about"
      />
      <OrganizationJsonLd />
      <PersonJsonLd 
        name="Kristina Carey"
        jobTitle="Founder"
        description="Founder of SwapSkills Ireland - building a community-driven platform for trading skills and services."
        url="https://swap-skills.com/about"
      />
      <BreadcrumbJsonLd 
        items={[
          { name: "Home", url: "https://swap-skills.com" },
          { name: "About", url: "https://swap-skills.com/about" },
        ]} 
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  About SwapSkills Ireland
                </h1>
                <p className="text-lg text-muted-foreground">
                  We're building Ireland's first community-driven platform for trading skills and services 
                  without money. Because sometimes the best currency is helping each other.
                </p>
              </div>
            </div>
          </section>

          {/* Founder Story */}
          <section className="py-16">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">Our Story</h2>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="relative">
                      <img 
                        src={founderImage} 
                        alt="Kristina, founder of SwapSkills Ireland"
                        width={300}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="w-full rounded-2xl shadow-lg object-cover aspect-[3/4] grayscale"
                      />
                      <div className="absolute -bottom-3 -right-3 bg-primary/10 rounded-2xl w-full h-full -z-10" />
                    </div>
                    <p className="text-center mt-4 text-sm text-muted-foreground font-medium">
                      Kristina, Founder
                    </p>
                  </div>
                  <div className="md:w-2/3 prose prose-lg text-muted-foreground">
                    <p>
                      SwapSkills was born from a simple observation: everyone has skills to offer, 
                      but not everyone has money to spare. In communities across Ireland, we saw 
                      talented people who could help each other — if only they had a way to connect.
                    </p>
                    <p>
                      A tiler who needs help with childcare. A teacher who wants their garden sorted. 
                      A gardener who needs tech support. The skills are there; we just needed to 
                      create the connections.
                    </p>
                    <p>
                      That's why we built SwapSkills — a platform where you can trade what you're 
                      good at for what you need. No money changes hands. Just skills, time, and 
                      the satisfaction of helping your neighbours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-24 bg-secondary/50 relative overflow-hidden">
            <div className="absolute top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
            
            <div className="container relative">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
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
                {howItWorksSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className="relative text-center p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all hover-lift animate-fade-up cozy-shadow" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg">
                      {index + 1}
                    </span>
                    
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

          {/* Trust Section */}
          <section className="py-20">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    We've got your back
                  </h2>

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

                <div className="relative">
                  <div className="aspect-square max-w-md mx-auto relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-float" />
                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-secondary to-background border border-border" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-3">🤝</div>
                        <p className="text-lg font-medium text-foreground">Real connections</p>
                        <p className="text-sm text-muted-foreground">Not just transactions</p>
                      </div>
                    </div>

                    <div className="absolute top-8 right-8 bg-card rounded-xl p-3 shadow-elevated animate-float border border-border/50" style={{ animationDelay: "0.2s" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🍀</span>
                        <span className="font-medium text-sm">Irish made</span>
                      </div>
                    </div>
                    <div className="absolute bottom-12 left-4 bg-card rounded-xl p-3 shadow-elevated animate-float border border-border/50" style={{ animationDelay: "0.4s" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        <span className="font-medium text-sm">ID checked</span>
                      </div>
                    </div>
                    <div className="absolute bottom-24 right-0 bg-card rounded-xl p-3 shadow-elevated animate-float border border-border/50" style={{ animationDelay: "0.6s" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💬</span>
                        <span className="font-medium text-sm">Real chats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Story / Vision Section */}
          <section className="py-20 md:py-28 bg-card/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
                    <Globe className="w-4 h-4" />
                    The bigger picture
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                    More than just a <span className="gradient-text">barter system</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We're building a modern barter community that matters. Here's why SwapSkills exists and what we're working towards.
                  </p>
                </div>

                <div className="prose prose-lg max-w-none">
                  {/* The Problem */}
                  <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 mb-8 cozy-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-destructive" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                        The problem we saw
                      </h3>
                    </div>
                    <div className="text-muted-foreground space-y-4">
                      <p>
                        Ireland has changed dramatically over the past few decades. Our communities, once tight-knit 
                        groups where neighbours knew each other by name and helped out without a second thought, have 
                        become increasingly disconnected. The cost of living crisis has put pressure on families across 
                        the country, making it harder than ever to afford the services we need.
                      </p>
                      <p>
                        Think about it: the retired teacher on your street could help local kids with their homework, 
                        and in return, maybe someone shovels their driveway when the snow comes. The old barter system 
                        worked for centuries, but finding someone to barter with became nearly impossible in our modern, 
                        disconnected world.
                      </p>
                    </div>
                  </div>

                  {/* The Vision */}
                  <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 mb-8 cozy-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sprout className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                        Our vision for Ireland
                      </h3>
                    </div>
                    <div className="text-muted-foreground space-y-4">
                      <p>
                        We envision an Ireland where communities are reconnecting through a modern barter system. 
                        Where the young professional who's handy with technology can help an elderly neighbour set 
                        up video calls to see their grandchildren, and learn a family recipe in return.
                      </p>
                      <p>
                        SwapSkills isn't just about saving money, though that's certainly a wonderful benefit. It's 
                        about rediscovering the value of what we already have. Every person in Ireland has something 
                        to offer, something they're good at, something they could share.
                      </p>
                    </div>
                  </div>

                  {/* The Irish Way */}
                  <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 mb-8 cozy-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-highlight/10 flex items-center justify-center">
                        <HeartHandshake className="w-6 h-6 text-highlight" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                        The Irish tradition of helping out
                      </h3>
                    </div>
                    <div className="text-muted-foreground space-y-4">
                      <p>
                        What we're doing isn't new at all. In fact, it's deeply rooted in Irish tradition. Our 
                        grandparents and great-grandparents lived this way naturally — bartering skills, trading 
                        favours, helping out neighbours. The concept of "meitheal" — neighbours coming together to 
                        help with farming tasks, building homes, or tackling any job too big for one family alone — 
                        was essentially a community barter system that helped communities survive and thrive.
                      </p>
                      <p>
                        SwapSkills is bringing this tradition into the digital age. We're using modern technology 
                        to facilitate the same kind of community connections that have sustained Irish life for 
                        generations.
                      </p>
                    </div>
                  </div>

                  {/* The Practicalities */}
                  <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 cozy-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-success" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                        How this actually helps you
                      </h3>
                    </div>
                    <div className="text-muted-foreground space-y-4">
                      <p>
                        Times are tough for many families in Ireland right now. Between mortgages, rent, bills, 
                        and the ever-increasing cost of groceries, there's often nothing left at the end of the 
                        month. Yet we still need services — someone to help with the garden, a tutor for the kids, 
                        assistance with home repairs, or just someone to walk the dog when work runs late.
                      </p>
                      <p>
                        SwapSkills lets you barter for these services without money changing hands. Beyond the 
                        practical savings, there's something even more valuable: the connections you'll make. 
                        Neighbours who'd lived on the same street for years but never spoken until SwapSkills 
                        brought them together.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Proudly built in Killeshin, County Carlow — serving communities across all 32 counties</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="py-16 bg-secondary/30">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  The principles that guide everything we do at SwapSkills.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {values.map((value, index) => (
                  <Card key={index} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <value.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{value.title}</h3>
                          <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero text-primary-foreground">
            <div className="container text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                Be part of Ireland's growing skills trading movement. 
                Sign up today and start connecting with your neighbours.
              </p>
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/auth?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

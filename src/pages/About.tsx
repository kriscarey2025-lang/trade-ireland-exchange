import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Leaf, Shield, ArrowRight, Sparkles, Gift } from "lucide-react";
import { SEO } from "@/components/SEO";
import founderImage from "@/assets/founder-kristina.png";

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

export default function About() {
  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about Swap Skills - Ireland's community-driven platform for trading skills and services without money. Founded by Kristina Carey to help neighbours help each other."
        keywords="about swap skills, skill exchange Ireland, Kristina Carey, community trading, barter Ireland"
        url="https://swap-skills.com/about"
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

        {/* Credits Announcement */}
        <section className="py-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-background/80 backdrop-blur-sm border-primary/30 shadow-lg overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                          <Gift className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                        <Sparkles className="h-3.5 w-3.5" />
                        Coming Soon
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">
                        Credits System Launching Soon
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        We're rolling out a new credits system to make trading skills even easier. 
                        For a <span className="text-foreground font-semibold">limited time</span>, all new members 
                        receive <span className="text-primary font-bold">45 free credits</span> to get started!
                      </p>
                      <Button asChild>
                        <Link to="/auth?mode=signup">
                          Claim Your 45 Free Credits
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story */}
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

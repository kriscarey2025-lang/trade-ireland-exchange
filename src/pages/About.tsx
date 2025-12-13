import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Leaf, Shield, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Community First",
    description:
      "We believe in the power of communities helping each other. SkillSwap brings neighbours together.",
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About SkillSwap Ireland
              </h1>
              <p className="text-lg text-muted-foreground">
                We're building Ireland's first community-driven platform for trading skills and services 
                without money. Because sometimes the best currency is helping each other.
              </p>
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
                      src="/src/assets/founder-kristina.png" 
                      alt="Kristina, founder of SkillSwap Ireland"
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
                    SkillSwap was born from a simple observation: everyone has skills to offer, 
                    but not everyone has money to spare. In communities across Ireland, we saw 
                    talented people who could help each other — if only they had a way to connect.
                  </p>
                  <p>
                    A tiler who needs help with childcare. A teacher who wants their garden sorted. 
                    A gardener who needs tech support. The skills are there; we just needed to 
                    create the connections.
                  </p>
                  <p>
                    That's why we built SkillSwap — a platform where you can trade what you're 
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
                The principles that guide everything we do at SkillSwap.
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

        {/* Stats */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Community Members</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
                <p className="text-muted-foreground">Trades Completed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">26</div>
                <p className="text-muted-foreground">Counties Covered</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">Satisfaction Rate</p>
              </div>
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
  );
}

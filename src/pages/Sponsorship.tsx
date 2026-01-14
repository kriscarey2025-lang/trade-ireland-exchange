import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Building2, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Users, 
  MapPin, 
  Shield,
  Sparkles,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

interface PackageFeature {
  text: string;
  included: boolean;
}

interface SponsorPackage {
  name: string;
  icon: React.ElementType;
  bestFor: string;
  examples: string;
  price: {
    monthly?: string;
    yearly: string;
  };
  features: PackageFeature[];
  ethicalFraming: string;
  highlight?: boolean;
  badge?: string;
}

const packages: SponsorPackage[] = [
  {
    name: "Community Supporter",
    icon: Heart,
    bestFor: "Small local businesses, sole traders, clinics, cafés",
    examples: "Local cafés, therapists, tutors, craftspeople",
    price: {
      monthly: "€25–€40",
      yearly: "€250",
    },
    features: [
      { text: "Logo + short description on Local Supporters page", included: true },
      { text: '"Proud Supporter of Swap-Skills" badge', included: true },
      { text: "Mention in 1 community social post per month", included: true },
      { text: 'Listed under "Local Businesses Supporting Community Exchange"', included: true },
      { text: "Does NOT affect search results", included: false },
      { text: "Does NOT push ads into user feeds", included: false },
      { text: "Does NOT influence trades", included: false },
    ],
    ethicalFraming: "Your support helps keep Swap-Skills free for the community.",
  },
  {
    name: "Local Partner",
    icon: Building2,
    bestFor: "Established businesses wanting visibility and goodwill",
    examples: "Gyms, vets, salons, accountants, cafés, trades",
    price: {
      monthly: "€60–€90",
      yearly: "€600–€900",
    },
    features: [
      { text: "Everything in Community Supporter, plus:", included: true },
      { text: "Featured business profile page", included: true },
      { text: "Tagged mention in 2 community posts per month", included: true },
      { text: "Highlighted on town landing page (below user listings)", included: true },
      { text: '"Community Partner" label on profile', included: true },
      { text: "Clearly marked as sponsored", included: true },
      { text: "Never appears inside trade listings", included: false },
      { text: "No prioritisation of user offers", included: false },
    ],
    ethicalFraming: "Local Partners help fund moderation, safety, and platform improvements.",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Town Champion",
    icon: Trophy,
    bestFor: "Anchor businesses, councils, chambers, regional sponsors",
    examples: "Car dealerships, shopping centres, councils, regional brands",
    price: {
      yearly: "€1,200–€2,000",
    },
    features: [
      { text: "Everything above, plus:", included: true },
      { text: '"Supported by [Your Business]" on Town Hub page', included: true },
      { text: "Quarterly community spotlight post", included: true },
      { text: 'Optional co-branded community initiative (e.g. "Free Skills Week")', included: true },
      { text: "First option to renew before new sponsors", included: true },
      { text: "Feels civic, not commercial", included: true },
    ],
    ethicalFraming: "Town Champions help keep Swap-Skills independent, local, and accessible.",
  },
];

const ethicalPrinciples = [
  {
    icon: Shield,
    title: "No Pay-to-Win",
    description: "Sponsors never get priority in search results or trade listings.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "All sponsorship revenue goes directly to platform improvements and safety.",
  },
  {
    icon: MapPin,
    title: "Locally Focused",
    description: "We only work with genuine local businesses that serve the community.",
  },
  {
    icon: Sparkles,
    title: "Transparent",
    description: "All sponsored content is clearly marked so users always know what's what.",
  },
];

export default function Sponsorship() {
  return (
    <>
      <SEO
        title="Ethical Sponsorship Packages | Support Your Community"
        description="Support Swap-Skills and get visibility for your local business with our ethical sponsorship packages. No ads in feeds, no pay-to-win - just genuine community support."
        keywords="swap skills sponsorship, local business Ireland, community supporter, ethical advertising"
        url="https://swap-skills.com/sponsorship"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <Badge variant="secondary" className="mb-4">
                  <Star className="h-3 w-3 mr-1" />
                  Ethical Sponsorship
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                  Support Your Community,
                  <br />
                  <span className="text-primary">Grow Your Business</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our sponsorship packages are designed to give local businesses visibility 
                  while keeping Swap-Skills free, fair, and community-focused. No intrusive ads. 
                  No pay-to-win. Just genuine support.
                </p>
              </div>
            </div>
          </section>

          {/* Ethical Principles */}
          <section className="py-12 border-b">
            <div className="container">
              <h2 className="text-2xl font-bold text-center mb-8">Our Ethical Commitment</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {ethicalPrinciples.map((principle, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                      <principle.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground">{principle.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Packages */}
          <section className="py-16">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Sponsorship Packages</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Choose the package that fits your business. All packages support the community 
                  and help keep Swap-Skills running for everyone.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {packages.map((pkg, index) => (
                  <Card 
                    key={index} 
                    className={`relative flex flex-col ${
                      pkg.highlight 
                        ? "border-primary shadow-lg ring-2 ring-primary/20" 
                        : ""
                    }`}
                  >
                    {pkg.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          {pkg.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4">
                        <pkg.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {pkg.bestFor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Pricing */}
                      <div className="text-center mb-6 pb-6 border-b">
                        {pkg.price.monthly ? (
                          <>
                            <div className="text-3xl font-bold text-primary">
                              {pkg.price.monthly}
                            </div>
                            <div className="text-sm text-muted-foreground">per month</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              or <span className="font-medium">{pkg.price.yearly}</span> per year
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-primary">
                              {pkg.price.yearly}
                            </div>
                            <div className="text-sm text-muted-foreground">per year</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              (No monthly option - intentionally meaningful)
                            </div>
                          </>
                        )}
                      </div>

                      {/* Examples */}
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Examples:</span> {pkg.examples}
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 flex-1">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            {feature.included ? (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${!feature.included ? "text-muted-foreground" : ""}`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Ethical Framing */}
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-sm text-center italic text-muted-foreground">
                          "{pkg.ethicalFraming}"
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="mt-6">
                        <Button 
                          asChild 
                          className="w-full" 
                          variant={pkg.highlight ? "default" : "outline"}
                        >
                          <Link to="/contact?subject=Sponsorship Inquiry: {{pkg.name}}">
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Why This Works */}
          <section className="py-16 bg-secondary/20">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Why This Works</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <h3 className="font-semibold mb-2">Low Barrier</h3>
                      <p className="text-sm text-muted-foreground">
                        Affordable entry points mean any local business can participate and support their community.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <h3 className="font-semibold mb-2">Reputation Boost</h3>
                      <p className="text-sm text-muted-foreground">
                        Being associated with community support builds trust and goodwill with local customers.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <h3 className="font-semibold mb-2">Feels Like Patronage</h3>
                      <p className="text-sm text-muted-foreground">
                        It's about supporting the community, not aggressive advertising. Users appreciate the difference.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Support Your Community?</h2>
                <p className="text-muted-foreground mb-6">
                  Get in touch to discuss which package is right for your business. 
                  We're happy to answer any questions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link to="/contact?subject=Sponsorship Inquiry">
                      Contact Us About Sponsorship
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/advertise">
                      Traditional Advertising
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

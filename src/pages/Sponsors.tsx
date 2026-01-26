import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Award, Star, Trophy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Sponsor {
  id: string;
  tier: string;
  display_name: string | null;
  website_url: string | null;
  message: string | null;
  is_public: boolean;
}

const tierConfig = {
  gold: {
    label: "Gold Sponsors",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    order: 1,
  },
  silver: {
    label: "Silver Sponsors",
    icon: Award,
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/30",
    order: 2,
  },
  bronze: {
    label: "Bronze Sponsors",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    borderColor: "border-amber-600/30",
    order: 3,
  },
  advertising: {
    label: "Supporters",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    order: 4,
  },
};

const SponsorCard = ({ sponsor, tier }: { sponsor: Sponsor; tier: string }) => {
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronze;
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 transition-all hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">
                {sponsor.display_name || "Anonymous Supporter"}
              </h3>
              <Badge variant="outline" className={`${config.color} ${config.borderColor}`}>
                {config.label.replace(" Sponsors", "").replace("s", "")}
              </Badge>
            </div>
            {sponsor.message && (
              <p className="text-muted-foreground mt-2 text-sm italic">
                "{sponsor.message}"
              </p>
            )}
            {sponsor.website_url && (
              <a
                href={sponsor.website_url.startsWith("http") ? sponsor.website_url : `https://${sponsor.website_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TierSection = ({ tier, sponsors }: { tier: string; sponsors: Sponsor[] }) => {
  const config = tierConfig[tier as keyof typeof tierConfig];
  if (!config || sponsors.length === 0) return null;

  const Icon = config.icon;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`h-8 w-8 ${config.color}`} />
        <h2 className="text-2xl font-bold">{config.label}</h2>
        <Badge variant="secondary">{sponsors.length}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} tier={tier} />
        ))}
      </div>
    </section>
  );
};

const SponsorsPage = () => {
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["public-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, tier, display_name, website_url, message, is_public")
        .eq("is_public", true)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Sponsor[];
    },
  });

  // Group sponsors by tier
  const sponsorsByTier = sponsors?.reduce((acc, sponsor) => {
    const tier = sponsor.tier || "bronze";
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>) || {};

  // Sort tiers by order
  const sortedTiers = Object.keys(sponsorsByTier).sort((a, b) => {
    const orderA = tierConfig[a as keyof typeof tierConfig]?.order || 99;
    const orderB = tierConfig[b as keyof typeof tierConfig]?.order || 99;
    return orderA - orderB;
  });

  const totalSponsors = sponsors?.length || 0;

  return (
    <>
      <SEO
        title="Our Sponsors | SwapSkills Ireland"
        description="Meet the amazing sponsors who support SwapSkills Ireland and help keep our community thriving."
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Community Supported</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Amazing Sponsors
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              These generous supporters help keep SwapSkills Ireland free and accessible for everyone.
              Thank you for believing in our mission!
            </p>
            {totalSponsors > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalSponsors} {totalSponsors === 1 ? "Sponsor" : "Sponsors"} & Counting
              </Badge>
            )}
          </div>
        </section>

        {/* Sponsors List */}
        <section className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : totalSponsors === 0 ? (
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Be Our First Sponsor!</h3>
                <p className="text-muted-foreground mb-6">
                  No public sponsors yet. Be the first to support our community and get featured here!
                </p>
                <Button asChild>
                  <Link to="/advertise">Become a Sponsor</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedTiers.map((tier) => (
              <TierSection key={tier} tier={tier} sponsors={sponsorsByTier[tier]} />
            ))
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to Support SwapSkills Ireland?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join our sponsors and help us grow the skill-swapping community across Ireland.
              Every contribution makes a difference!
            </p>
            <Button asChild size="lg">
              <Link to="/advertise">
                <Heart className="mr-2 h-5 w-5" />
                Become a Sponsor
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SponsorsPage;

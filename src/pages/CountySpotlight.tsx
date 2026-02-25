import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceCardCompact } from "@/components/services/ServiceCardCompact";
import { ServiceCardMobile } from "@/components/services/ServiceCardMobile";
import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { JsonLd, FAQJsonLd, BreadcrumbJsonLd, SpeakableJsonLd } from "@/components/seo/JsonLd";
import { getCountyBySlug, countySpotlights } from "@/lib/countySpotlights";
import { useServices } from "@/hooks/useServices";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, ArrowRight, Lightbulb, Sparkles, TrendingUp, BookOpen, ExternalLink, MapPin, Star } from "lucide-react";

export default function CountySpotlight() {
  const { slug } = useParams<{ slug: string }>();
  const county = slug ? getCountyBySlug(slug) : undefined;
  const isMobile = useIsMobile();

  const { data: services, isLoading } = useServices({
    location: county?.name,
    status: "active",
  });

  if (!county) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">County not found</h1>
          <p className="text-muted-foreground mb-6">This county spotlight doesn't exist yet.</p>
          <Button asChild><Link to="/county">Browse all counties</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  // Get related counties (same province, different from current, max 3)
  const relatedCounties = countySpotlights
    .filter(c => c.slug !== county.slug && c.province === county.province)
    .slice(0, 2)
    .concat(
      countySpotlights
        .filter(c => c.slug !== county.slug && c.province !== county.province)
        .sort(() => 0.5 - Math.random())
        .slice(0, 1)
    );

  const listingCount = services?.length ?? 0;

  return (
    <>
      <SEO
        title={`Skill Swapping in ${county.name}, Ireland | County Spotlight`}
        description={county.metaDescription}
        url={`https://swap-skills.ie/county/${county.slug}`}
        keywords={`${county.name.toLowerCase()} skills, skill swap ${county.name.toLowerCase()}, ${county.name.toLowerCase()} Ireland, community ${county.name.toLowerCase()}`}
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `Skill Swapping in ${county.name}, Ireland — County Spotlight`,
        description: county.metaDescription,
        url: `https://swap-skills.ie/county/${county.slug}`,
        datePublished: "2026-02-17",
        dateModified: "2026-02-17",
        author: { "@type": "Organization", name: "SwapSkills Ireland", url: "https://swap-skills.ie" },
        publisher: { "@type": "Organization", name: "SwapSkills Ireland", logo: { "@type": "ImageObject", url: "https://swap-skills.ie/og-image.png" } },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://swap-skills.ie/county/${county.slug}` },
        about: { "@type": "Place", name: `County ${county.name}, Ireland` },
        inLanguage: "en-IE",
      }} />
      <FAQJsonLd faqs={county.funFacts.map((fact, i) => ({
        question: `What's an interesting fact about ${county.name}? (#${i + 1})`,
        answer: fact,
      }))} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://swap-skills.ie/" },
        { name: "County Spotlights", url: "https://swap-skills.ie/county" },
        { name: county.name, url: `https://swap-skills.ie/county/${county.slug}` },
      ]} />
      <SpeakableJsonLd
        name={`Skill Swapping in ${county.name}, Ireland`}
        url={`https://swap-skills.ie/county/${county.slug}`}
      />

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10 border-b">
            <div className="container py-12 md:py-16">
              <Link to="/county" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" /> All Counties
              </Link>
              <div className="flex items-start gap-4">
                <span className="text-5xl md:text-6xl">{county.icon}</span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {county.name}
                  </h1>
                  <Badge variant="outline" className="mb-3">
                    <MapPin className="h-3 w-3 mr-1" /> {county.province}
                  </Badge>
                  <p className="text-lg md:text-xl text-muted-foreground italic max-w-2xl">
                    {county.heroTagline}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="container py-10 space-y-12">
            {/* Intro */}
            <section className="max-w-3xl">
              <p className="text-lg leading-relaxed text-foreground/90">{county.intro}</p>
            </section>

            {/* Famous Skills */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                What {county.name} is Famous For
              </h2>
              <div className="flex flex-wrap gap-2">
                {county.famousSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="px-4 py-2 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Fun Facts */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Fun Facts about {county.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {county.funFacts.map((fact, i) => (
                  <Card key={i} className="bg-secondary/30 border-secondary hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed">{fact}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Did You Know callout */}
            <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 md:p-8 max-w-3xl">
              <div className="flex gap-3">
                <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Did you know?</h3>
                  <p className="text-foreground/80 leading-relaxed">{county.didYouKnow}</p>
                </div>
              </div>
            </section>

            {/* Expert CTA */}
            <section className="bg-accent/10 border border-accent/20 rounded-xl p-6 md:p-8">
              <div className="flex gap-3">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Are you a skilled {county.name} local?</h3>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Get listed in our {county.name} directory and connect with neighbours who need your skills. Or create a SwapSkills post and trade your talent — no money needed, just good ol' community spirit!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/contact">Get a Directory Listing</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/new-service">Create a Swap Post</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Listings */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  SwapSkills in {county.name}
                  {listingCount > 0 && (
                    <Badge variant="outline" className="ml-2">{listingCount}</Badge>
                  )}
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/browse?search=${county.name}`}>
                    View all <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>

              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.slice(0, 6).map((service) =>
                    isMobile ? (
                      <ServiceCardMobile key={service.id} service={service} />
                    ) : (
                      <ServiceCardCompact key={service.id} service={service} />
                    )
                  )}
                </div>
              ) : (
                <Card className="bg-secondary/30">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No listings in {county.name} yet — be the first to post one!
                    </p>
                    <Button asChild>
                      <Link to="/new-service">Post a Listing in {county.name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Bottom CTA */}
            <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Ready to swap skills in {county.name}?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join SwapSkills for free and connect with people in {county.name} who want to exchange skills. No money needed — just your talent!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">Join Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to={`/browse?search=${county.name}`}>
                    Browse {county.name} <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Related Counties */}
            <section>
              <h2 className="text-xl font-bold mb-4">Explore More Counties</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedCounties.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/county/${c.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{c.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.province}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/county">All Counties</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/skills">Skill Guides</Link>
                </Button>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

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
import { JsonLd, FAQJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { getSkillGuideBySlug, skillGuides } from "@/lib/skillGuides";
import { useServices } from "@/hooks/useServices";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, ArrowRight, Lightbulb, Sparkles, TrendingUp, BookOpen, ExternalLink } from "lucide-react";

export default function SkillGuide() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getSkillGuideBySlug(slug) : undefined;
  const isMobile = useIsMobile();

  const { data: services, isLoading } = useServices({
    category: guide?.category,
    status: "active",
  });

  if (!guide) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Skill guide not found</h1>
          <p className="text-muted-foreground mb-6">This skill guide doesn't exist yet.</p>
          <Button asChild><Link to="/skills">Browse all skill guides</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  // Get related guides (different from current, max 3)
  const relatedGuides = skillGuides
    .filter(g => g.slug !== guide.slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const listingCount = services?.length ?? 0;

  return (
    <>
      <SEO
        title={`${guide.label} in Ireland | Skill Guide`}
        description={guide.metaDescription}
        url={`https://swap-skills.ie/skills/${guide.slug}`}
        keywords={`${guide.label.toLowerCase()} Ireland, ${guide.label.toLowerCase()} swap, skill exchange ${guide.label.toLowerCase()}, ${guide.label.toLowerCase()} help Ireland`}
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${guide.label} in Ireland — Skill Guide`,
        description: guide.metaDescription,
        url: `https://swap-skills.ie/skills/${guide.slug}`,
        datePublished: "2026-02-17",
        dateModified: "2026-02-17",
        author: { "@type": "Organization", name: "SwapSkills Ireland", url: "https://swap-skills.ie" },
        publisher: { "@type": "Organization", name: "SwapSkills Ireland", logo: { "@type": "ImageObject", url: "https://swap-skills.ie/og-image.png" } },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://swap-skills.ie/skills/${guide.slug}` },
        about: { "@type": "Thing", name: guide.label },
        inLanguage: "en-IE",
      }} />
      <FAQJsonLd faqs={guide.funFacts.map((fact, i) => ({
        question: `What's an interesting fact about ${guide.label.toLowerCase()} in Ireland? (#${i + 1})`,
        answer: fact,
      }))} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://swap-skills.ie/" },
        { name: "Skill Guides", url: "https://swap-skills.ie/skills" },
        { name: guide.label, url: `https://swap-skills.ie/skills/${guide.slug}` },
      ]} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10 border-b">
            <div className="container py-12 md:py-16">
              <Link to="/skills" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" /> All Skill Guides
              </Link>
              <div className="flex items-start gap-4">
                <span className="text-5xl md:text-6xl">{guide.icon}</span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {guide.label} in Ireland
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground italic max-w-2xl">
                    {guide.heroTagline}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="container py-10 space-y-12">
            {/* Intro */}
            <section className="max-w-3xl">
              <p className="text-lg leading-relaxed text-foreground/90">{guide.intro}</p>
            </section>

            {/* Fun Facts */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Fun Facts about {guide.label} in Ireland
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {guide.funFacts.map((fact, i) => (
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
                  <p className="text-foreground/80 leading-relaxed">{guide.didYouKnow}</p>
                </div>
              </div>
            </section>

            {/* Expert CTA */}
            <section className="bg-accent/10 border border-accent/20 rounded-xl p-6 md:p-8">
              <div className="flex gap-3">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Want to be listed as a {guide.label} expert?</h3>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Get featured in our directory and connect with people across Ireland looking for {guide.label.toLowerCase()} skills. Or if you fancy a good ol' barter, create a SwapSkills post and trade your talent!
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
                  Live {guide.label} Listings
                  {listingCount > 0 && (
                    <Badge variant="outline" className="ml-2">{listingCount}</Badge>
                  )}
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/browse?category=${guide.category}`}>
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
                      No {guide.label.toLowerCase()} listings yet — be the first to post one!
                    </p>
                    <Button asChild>
                      <Link to="/new-service">Post a {guide.label} Listing</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Ready to swap {guide.label.toLowerCase()} skills?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join SwapSkills for free and connect with people across Ireland who want to exchange {guide.label.toLowerCase()} skills. No money needed — just your talent!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">Join Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to={`/browse?category=${guide.category}`}>
                    Browse {guide.label} <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Related Guides */}
            <section>
              <h2 className="text-xl font-bold mb-4">Explore More Skill Guides</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedGuides.map((g) => (
                  <Link
                    key={g.slug}
                    to={`/skills/${g.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{g.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{g.heroTagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { countySpotlights } from "@/lib/countySpotlights";
import { MapPin } from "lucide-react";

const provinces = ["Leinster", "Munster", "Connacht", "Ulster"] as const;

export default function CountySpotlightsIndex() {
  return (
    <>
      <SEO
        title="County Spotlights — Skill Swapping Across Ireland"
        description="Explore skill swapping in every county across Ireland. Fun facts, famous local skills, and live SwapSkills listings from all 26 counties."
        url="https://swap-skills.ie/county"
        keywords="skill swap Ireland, county skills Ireland, local skill exchange, community Ireland"
      />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://swap-skills.ie/" },
        { name: "County Spotlights", url: "https://swap-skills.ie/county" },
      ]} />
      <ItemListJsonLd
        name="SwapSkills County Spotlights"
        description="Skill swapping spotlights for every county in Ireland"
        items={countySpotlights.map((c, i) => ({
          name: c.name,
          url: `https://swap-skills.ie/county/${c.slug}`,
          position: i + 1,
        }))}
      />

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10 border-b">
            <div className="container py-12 md:py-16 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                🇮🇪 County Spotlights
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover skill swapping in every corner of Ireland. Fun facts, famous local skills, and live listings from all 26 counties.
              </p>
            </div>
          </section>

          <div className="container py-10 space-y-10">
            {provinces.map((province) => {
              const counties = countySpotlights.filter(c => c.province === province);
              return (
                <section key={province}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {province}
                    <Badge variant="outline" className="ml-1">{counties.length}</Badge>
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {counties.map((county) => (
                      <Link
                        key={county.slug}
                        to={`/county/${county.slug}`}
                        className="group"
                      >
                        <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{county.icon}</span>
                              <div>
                                <p className="font-semibold group-hover:text-primary transition-colors">{county.name}</p>
                                <p className="text-xs text-muted-foreground">{county.province}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground italic line-clamp-2">
                              {county.heroTagline}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {county.famousSkills.slice(0, 2).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

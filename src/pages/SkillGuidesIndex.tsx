import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { skillGuides } from "@/lib/skillGuides";
import { ArrowRight } from "lucide-react";

export default function SkillGuidesIndex() {
  return (
    <>
      <SEO
        title="Skill Guides | Explore Skills in Ireland"
        description="Explore fun, interactive guides to every skill you can swap in Ireland. Fun facts, live listings, and creative swap ideas for gardening, tech, cooking, and more."
        url="https://swap-skills.ie/skills"
        keywords="skill guides Ireland, skill swap categories, Irish skills, swap skills guide"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10 border-b">
            <div className="container py-12 md:py-16">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Skill Guides 🇮🇪
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Explore every skill you can swap on SwapSkills — packed with fun Irish facts, 
                creative swap ideas, and real listings from your community.
              </p>
            </div>
          </section>

          <div className="container py-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skillGuides.map((guide) => (
                <Link key={guide.slug} to={`/skills/${guide.slug}`}>
                  <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{guide.icon}</span>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {guide.label}
                          </h2>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                      <p className="text-sm text-muted-foreground italic line-clamp-2">
                        {guide.heroTagline}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {guide.funFacts.length} fun facts · {guide.swapIdeas.length} swap ideas
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

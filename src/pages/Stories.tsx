import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Share2, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const stories = [
  {
    id: 1,
    title: "From Guitar Lessons to Website Design",
    author: "Sarah M.",
    location: "Dublin",
    excerpt: "I never thought my guitar skills would help me get a professional website for my small business. Through SwapSkills, I connected with Mark who needed music lessons for his daughter...",
    category: "Music & Tech",
    date: "December 2025",
    image: "🎸",
  },
  {
    id: 2,
    title: "Trading Gardening Tips for Photography",
    author: "Michael O.",
    location: "Cork",
    excerpt: "As a retired gardener, I had plenty of knowledge to share. When Emma offered to photograph my garden in exchange for teaching her about organic vegetables, it was a perfect match...",
    category: "Nature & Art",
    date: "November 2025",
    image: "🌱",
  },
  {
    id: 3,
    title: "Language Exchange That Became a Friendship",
    author: "Aoife K.",
    location: "Galway",
    excerpt: "I wanted to improve my French before a trip to Paris. Through SwapSkills, I found Pierre who wanted to learn Irish. Six months later, we're still meeting weekly...",
    category: "Languages",
    date: "October 2025",
    image: "🗣️",
  },
  {
    id: 4,
    title: "Baking Lessons for Home Repairs",
    author: "Thomas B.",
    location: "Limerick",
    excerpt: "My kitchen needed some work, but I couldn't afford a contractor. I offered my baking expertise and found John, a handyman who'd always wanted to make proper sourdough bread...",
    category: "Home & Food",
    date: "September 2025",
    image: "🍞",
  },
];

export default function Stories() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Swap-Skill Stories | SwapSkills Ireland"
        description="Read inspiring stories from our community members who have successfully swapped skills and made meaningful connections."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Community Stories</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Swap-Skill <span className="text-primary">Stories</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover how our community members are exchanging skills, building connections, 
                and creating value through the power of skill swapping.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=signup">Share Your Story</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8">
              {stories.map((story) => (
                <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{story.image}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {story.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{story.date}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {story.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">{story.author}</span>
                            <span className="text-muted-foreground"> • {story.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Have a Swap-Skill Story to Share?
              </h2>
              <p className="text-muted-foreground mb-6">
                We'd love to hear about your skill swapping experience. Share your story 
                and inspire others in our community.
              </p>
              <Button variant="hero" asChild>
                <Link to="/contact">Submit Your Story</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

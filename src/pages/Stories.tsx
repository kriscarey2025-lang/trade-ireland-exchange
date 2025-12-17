import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import jenniferDeliaImage from "@/assets/jennifer-delia-carlow.png";

// Featured real story
const featuredStory = {
  id: 0,
  title: "A Real Life Story from Carlow",
  authors: "Jennifer & Delia",
  location: "Carlow",
  category: "Holistic Wellness",
  date: "December 2025",
  image: jenniferDeliaImage,
  facebookLink: "https://www.facebook.com/beautyholistic",
  content: {
    intro: "Two wellness professionals discovered the power of skill-trading.",
    jennifer: "Jennifer runs Carlow Reiki Clinic, a calm and welcoming space where she supports people through Reiki healing, meditation, and energy balancing, helping clients restore calm, clarity, and wellbeing.",
    delia: "Delia is the founder of ND Clinic in Carlow city centre, where she offers a range of professional massage and holistic wellness treatments, supporting both physical recovery and deep relaxation.",
    connection: "Through skill-trading, Jennifer and Delia connected in a simple, natural way.",
    exchange: "Jennifer helps Delia relax and rebalance through Reiki and meditation sessions, while Delia supports Jennifer with calming massage treatments after long working days.",
    outcome: "No money is exchanged — just two professionals sharing their skills, supporting each other's wellbeing, and building trust.",
    partnership: "That connection has since grown into a business partnership, rooted in shared values and mutual care."
  }
};

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

        {/* Featured Story */}
        <section className="py-12 bg-primary/5">
          <div className="container">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Featured Story
              </Badge>
              <span className="text-sm text-muted-foreground">Real success from our community</span>
            </div>
            
            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative aspect-[4/5] lg:aspect-auto">
                    <img 
                      src={featuredStory.image} 
                      alt="Jennifer and Delia from Carlow" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{featuredStory.category}</Badge>
                      <span className="text-xs text-muted-foreground">{featuredStory.date}</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-primary">
                      {featuredStory.title}
                    </h2>
                    
                    <div className="space-y-4 text-muted-foreground">
                      <p>{featuredStory.content.jennifer}</p>
                      <p>{featuredStory.content.delia}</p>
                      <p className="font-medium text-foreground">{featuredStory.content.connection}</p>
                      <p>{featuredStory.content.exchange}</p>
                      <p className="italic">{featuredStory.content.outcome}</p>
                      <p className="font-medium text-foreground">{featuredStory.content.partnership}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
                      <div className="text-sm">
                        <span className="font-medium">{featuredStory.authors}</span>
                        <span className="text-muted-foreground"> • {featuredStory.location}</span>
                      </div>
                      <a 
                        href={featuredStory.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Follow Their Journey
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* More Stories Grid */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-display font-bold mb-8">More Community Stories</h2>
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

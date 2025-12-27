import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, ExternalLink, Home, Heart, Users, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import jenniferDeliaImage from "@/assets/jennifer-delia-carlow-edited.png";

// Story index for navigation
const stories = [
  {
    id: "founder-story",
    title: "From Home Exchange to Skill Exchange",
    subtitle: "Why I Built Swap-Skills",
    author: "Kris",
    badge: "Founder's Story",
    badgeColor: "bg-amber-600",
    preview: "A home exchange experience that sparked the idea for Swap-Skills..."
  },
  {
    id: "jennifer-delia",
    title: "A Real Life Story from Carlow",
    subtitle: "Jennifer & Delia",
    author: "Jennifer & Delia",
    badge: "Community Story",
    badgeColor: "bg-primary",
    preview: "Two wellness professionals discovered the power of skill-trading..."
  }
];

// Featured real story data
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
    jennifer: "Jennifer runs Carlow Reiki Clinic, a calm and welcoming space where she supports people through Reiki healing, meditation, and energy balancing, helping clients restore calm, clarity, and wellbeing. Delia runs ND Clinic in the heart of Carlow, a holistic wellness and therapy clinic, with a range of non-invasive treatments for general well-being, weight loss and more.",
    delia: "Delia is the founder of ND Clinic in Carlow city centre, where she offers a range of professional massage and holistic wellness treatments, supporting both physical recovery and deep relaxation.",
    connection: "Through skill-trading, Jennifer and Delia connected in a simple, natural way.",
    exchange: "Jennifer helps Delia relax and rebalance through Reiki and meditation sessions, while Delia supports Jennifer with calming massage treatments after long working days.",
    outcome: "No money is exchanged — just two professionals sharing their skills, supporting each other's wellbeing, and building trust.",
    partnership: "That connection has since grown into a business partnership, rooted in shared values and mutual care.\n\nInterested to find out more? Follow their journey below:"
  }
};

export default function Stories() {
  const scrollToStory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Swap-Skill Stories" 
        description="Read inspiring stories from our community members who have successfully swapped skills and made meaningful connections."
        url="https://swap-skills.com/stories"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Community Stories</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Swap-Skill <span className="text-primary">Stories</span>
              </h1>
              <p className="text-muted-foreground mb-6">
                Discover how our community members are exchanging skills and building connections.
              </p>
              <Button variant="hero" asChild>
                <Link to="/auth?mode=signup">Share Your Story</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Story Index / Quick Navigation */}
        <section className="py-8 bg-background border-b border-border">
          <div className="container max-w-4xl">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Jump to a Story
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => scrollToStory(story.id)}
                  className="group flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left"
                >
                  <Badge className={`${story.badgeColor} text-white shrink-0 mt-0.5`}>
                    {story.badge}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {story.subtitle}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section id="founder-story" className="py-10 md:py-12 scroll-mt-20">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="default" className="bg-amber-600 text-white">
                Founder's Story
              </Badge>
              <span className="text-sm text-muted-foreground">The inspiration behind Swap-Skills</span>
            </div>

            <Card className="overflow-hidden border-border">
              <CardContent className="p-0">
                {/* Hero Image Grid */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src="/images/spain-street-blurred.png" 
                      alt="Family exploring a Spanish street during home exchange" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-xs font-medium">Spain 🇪🇸</span>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3]">
                    <img 
                      src="/images/spanish-family-carlow-blurred.png" 
                      alt="Spanish exchange family exploring Duckett's Grove Castle in Carlow, Ireland" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-xs font-medium">Carlow 🇮🇪</span>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-600 font-medium text-sm">Home Exchange Experience</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-1">
                    From Home Exchange to Skill Exchange
                  </h2>
                  <h3 className="text-lg text-primary font-medium mb-6">
                    Why I Built Swap-Skills
                  </h3>

                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Last summer, my family and I did something that—if you had asked me a few years ago—I might have politely dismissed as "not for us." <strong className="text-foreground">We swapped homes.</strong>
                    </p>
                    
                    <p>
                      For two weeks, we stayed in Spain with our three children, while a young family of four stayed in our home in Carlow. No money exchanged hands for accommodation. Just trust, communication, and a shared belief that this could work.
                    </p>

                    <p className="italic">
                      At first, I'll be honest — I was nervous. Letting strangers into your home goes against everything modern media conditions us to feel comfortable with.
                    </p>

                    <p className="font-medium text-foreground">
                      But something interesting happened.
                    </p>
                  </div>

                  {/* Trust Section */}
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-foreground">Trust Grew Through Communication</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From the very beginning, communication made all the difference. Messages back and forth, small details shared, questions answered. While we explored Spain, we'd excitedly read messages about what they were up to in Carlow. Over those two weeks, we didn't just exchange homes — we shared experiences and connected as families.
                    </p>
                  </div>

                  {/* Pet Minding Section */}
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <h4 className="font-bold text-foreground">Even the Pets Were Happy!</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      One of the sweetest parts? Both families' cats were happily minded in their own homes during the swap. Our black and white cat stayed comfortable in Carlow while the Spanish family's tabby stayed relaxed poolside in Spain — no stressful travel, no kennels, just familiar surroundings and caring hands.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative rounded-lg overflow-hidden shadow-sm">
                        <img 
                          src="/images/cat-ireland.png" 
                          alt="Our black and white cat being minded in Carlow during the home exchange" 
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span className="text-xs font-medium">Our cat 🐱</span>
                        </div>
                      </div>
                      <div className="relative rounded-lg overflow-hidden shadow-sm">
                        <img 
                          src="/images/cat-spain.png" 
                          alt="The Spanish family's tabby cat minded in Spain during the home exchange" 
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span className="text-xs font-medium">Their cat 🐱</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Section */}
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong className="text-foreground">The cost of that holiday?</strong> Flights, a car rental, and whatever activities we chose. No accommodation bill. No financial stress.
                    </p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      And most importantly — no bad experiences, no horror stories. Just people helping people.
                    </p>
                  </div>

                  {/* The Spark */}
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-foreground">The Spark Behind Swap-Skills</h4>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        That experience stayed with me long after we returned home. It made me question: <strong className="text-foreground">When did we become so disconnected from one another?</strong>
                      </p>
                      <p>
                        While a home exchange might not be for everyone, it planted a simple idea: <em className="text-primary font-medium">What if reconnecting didn't require such a big leap?</em>
                      </p>
                      <p className="font-medium text-foreground">
                        That's where Swap-Skills was born.
                      </p>
                    </div>
                  </div>

                  {/* A Smaller Step */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-lg">
                    <h4 className="font-bold text-foreground mb-2">A Smaller Step — With Big Impact</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Skill swapping is a gentler starting point. One hour of your time for one hour of mine. No money involved. No judgement about whose skill is "worth more."
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      German tutoring for babysitting. A massage for home cleaning. Gardening for tech help.
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      There's very little to lose — and a lot to gain: Confidence, connection, community.
                    </p>
                  </div>

                  {/* Why This Matters */}
                  <div className="mt-6">
                    <h4 className="font-bold text-foreground mb-2">Why This Matters</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Swap-Skills isn't about avoiding money or replacing jobs. It's about remembering that value isn't always measured in euros — sometimes it's measured in trust, time, and shared effort.
                    </p>
                    <blockquote className="border-l-4 border-primary pl-4 py-1 my-4">
                      <p className="text-primary font-bold italic">
                        Most people are good. Most people want to help. We just need a safe, simple way to start.
                      </p>
                    </blockquote>
                    <p className="text-sm font-medium text-foreground">
                      That's what Swap-Skills is trying to be.
                    </p>
                  </div>

                  {/* Author */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <span className="font-bold">— Kris</span>
                    <span className="text-muted-foreground text-sm ml-2">Founder of Swap-Skills</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Jennifer & Delia Story - Now with consistent styling */}
        <section id="jennifer-delia" className="py-10 md:py-12 bg-muted/30 scroll-mt-20">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Community Story
              </Badge>
              <span className="text-sm text-muted-foreground">Real success from our community</span>
            </div>
            
            <Card className="overflow-hidden border-border">
              <CardContent className="p-0">
                {/* Image - Consistent with founder story layout */}
                <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 flex items-center justify-center p-6 md:p-8">
                  <div className="relative w-48 h-60 md:w-56 md:h-72 rounded-lg overflow-hidden shadow-2xl ring-4 ring-white/30">
                    <img 
                      src={featuredStory.image} 
                      alt={`${featuredStory.authors} - ${featuredStory.title}`} 
                      loading="lazy" 
                      decoding="async" 
                      className="w-full h-full object-cover object-top" 
                    />
                  </div>
                </div>

                {/* Story Content - Matching founder story padding */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{featuredStory.category}</Badge>
                    <span className="text-xs text-muted-foreground">{featuredStory.date}</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-1">
                    {featuredStory.title}
                  </h2>
                  <h3 className="text-lg text-primary font-medium mb-6">
                    {featuredStory.authors} • {featuredStory.location}
                  </h3>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Two business women from Carlow with unique offerings connected by swapping their skills:
                    </p>
                    <p>{featuredStory.content.jennifer}</p>
                    
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="font-medium text-foreground mb-2">{featuredStory.content.connection}</p>
                      <p className="text-sm">{featuredStory.content.exchange}</p>
                    </div>
                    
                    <p className="italic">{featuredStory.content.outcome}</p>
                    <p className="font-medium text-foreground">{featuredStory.content.partnership}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
                    <div>
                      <span className="font-bold">— {featuredStory.authors}</span>
                      <span className="text-muted-foreground text-sm ml-2">{featuredStory.location}</span>
                    </div>
                    <a href={featuredStory.facebookLink} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Follow Their Journey
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary/5">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
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

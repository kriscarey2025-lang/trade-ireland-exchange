import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SocialShareButtons } from "@/components/shared/SocialShareButtons";
import { BookOpen, MessageCircle, ExternalLink, Home, Heart, Users, Sparkles, ChevronRight, Award } from "lucide-react";
import { Link } from "react-router-dom";
import jenniferDeliaImage from "@/assets/jennifer-delia-carlow-edited.png";

// Story index for navigation
const stories = [
  {
    id: "community-hero-2026",
    title: "Community Hero Award 2026",
    subtitle: "Nominate Your Hero",
    author: "Swap Skills",
    badge: "Award",
    badgeColor: "bg-amber-500",
    preview: "Know someone who goes above and beyond? Nominate them for the 2026 Community Hero Award!"
  },
  {
    id: "jenny-3-swaps",
    title: "3 Skill Exchanges in 1 Month",
    subtitle: "Jenny's Reiki Business Success",
    author: "Jenny",
    badge: "Success Story",
    badgeColor: "bg-success",
    preview: "How Jenny used her Reiki skills to get a website, hair treatment, and facial..."
  },
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

  // Dynamic OG image URL for the Founder's Story
  const founderStoryOgImage = `https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/generate-og-image?title=${encodeURIComponent("From Home Exchange to Skill Exchange")}&category=${encodeURIComponent("founder")}&location=${encodeURIComponent("Ireland")}&type=${encodeURIComponent("story")}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Swap-Skill Stories | Founder's Story" 
        description="Discover how a home exchange experience in Spain inspired the creation of Swap-Skills - Ireland's community for trading skills without money."
        url="https://swap-skills.ie/stories"
        image={founderStoryOgImage}
        keywords="skill swap, founder story, Ireland, community, skill exchange, home exchange"
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

        {/* Community Hero Award 2026 Section */}
        <section id="community-hero-2026" className="py-10 md:py-12 scroll-mt-20">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="default" className="bg-amber-500 text-white">
                Award
              </Badge>
              <span className="text-sm text-muted-foreground">Nominations open until mid-March 2026</span>
            </div>

            <Card className="overflow-hidden border-border">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-amber-500/20 via-primary/10 to-accent/20 p-6 md:p-10 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
                    Swap Skills Community Hero Award 2026
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto mb-2">
                    Do you know someone who goes above and beyond for their community? Someone who selflessly helps others, brings people together, or makes a real difference?
                  </p>
                  <p className="text-foreground font-medium max-w-xl mx-auto mb-6">
                    Nominate them for the <strong>2026 Community Hero Award</strong>! The winner will be <strong>featured in a dedicated article on our website</strong> and receive the spotlight they truly deserve.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button size="lg" className="rounded-full" asChild>
                      <Link to="/community-hero">
                        <Award className="mr-2 h-4 w-4" />
                        Nominate a Community Hero
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Nominations close mid-March 2026 · Winner announced end of March 2026
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Jenny's 3 Swaps Success Story */}
        <section id="jenny-3-swaps" className="py-10 md:py-12 scroll-mt-20">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="default" className="bg-success text-white">
                Success Story
              </Badge>
              <span className="text-sm text-muted-foreground">Real results from skill trading</span>
            </div>
            
            <Card className="overflow-hidden border-border">
              <CardContent className="p-0">
                {/* Hero Banner */}
                <div className="relative bg-gradient-to-br from-success/20 via-primary/10 to-accent/20 p-6 md:p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success mb-4">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-bold">3 Exchanges • 1 Month • €0 Spent</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold">
                      3 Skill Exchanges in 1 Month
                    </h2>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">Reiki & Wellness</Badge>
                    <span className="text-xs text-muted-foreground">January 2026 • Carlow</span>
                  </div>
                  
                  <h3 className="text-lg text-primary font-medium mb-6">
                    How Jenny Used Her Reiki Business to Transform Her Life
                  </h3>
                  
                  <div className="space-y-4 text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Jenny runs a successful Reiki healing practice in Carlow. In just one month, she completed three skill exchanges that would have cost her hundreds of euros — and gained so much more than money could buy.
                    </p>

                    {/* The 3 Exchanges */}
                    <div className="grid gap-4 mt-6">
                      {/* Exchange 1: Website */}
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-primary font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground mb-1">🌐 A Brand New Website</h4>
                            <p className="text-sm">Jenny exchanged Reiki sessions with a local web developer who was looking for stress relief and energy healing. In return, she received a professionally designed website for her business — something that typically costs <strong className="text-foreground">€500-€1,500</strong>.</p>
                          </div>
                        </div>
                      </div>

                      {/* Exchange 2: Hair Treatment */}
                      <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                            <span className="text-accent-foreground font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground mb-1">💇‍♀️ Balayage for Her Daughter</h4>
                            <p className="text-sm">A local hairstylist was curious about Reiki and wanted to experience its benefits. Jenny provided healing sessions, and in exchange, her daughter received a beautiful balayage hair colouring treatment — normally priced at <strong className="text-foreground">€120-€200</strong>.</p>
                          </div>
                        </div>
                      </div>

                      {/* Exchange 3: Facial */}
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center shrink-0">
                            <span className="text-amber-700 dark:text-amber-200 font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground mb-1">✨ Professional Facial Treatment</h4>
                            <p className="text-sm">A beauty therapist from a local Carlow business wanted to try Reiki for her own wellbeing. Jenny provided sessions and received a luxurious professional facial in return — valued at around <strong className="text-foreground">€80-€150</strong>.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Value Breakdown */}
                    <div className="mt-6 p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="h-5 w-5 text-success" />
                        <h4 className="font-bold text-foreground">The Real Value</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-foreground mb-2">💰 Monetary Savings:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Website: €500-€1,500</li>
                            <li>• Balayage: €120-€200</li>
                            <li>• Facial: €80-€150</li>
                            <li className="font-bold text-success pt-1">Total Saved: €700-€1,850</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-2">🤝 Beyond Money:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• 3 new local connections</li>
                            <li>• Potential paying customers</li>
                            <li>• Word-of-mouth referrals</li>
                            <li>• Stronger community ties</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="border-l-4 border-success pl-4 py-2 my-6">
                      <p className="text-foreground font-medium italic">
                        "Every swap introduced me to someone new in my community. These aren't just transactions — they're relationships. The web developer now recommends me to stressed clients, the hairstylist has become a regular, and the beauty therapist and I are planning to collaborate on wellness events."
                      </p>
                      <footer className="text-sm text-muted-foreground mt-2">— Jenny, Carlow</footer>
                    </blockquote>

                    {/* The Bigger Picture */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-foreground">The Swap-Skills Difference</h4>
                      </div>
                      <p className="text-sm">
                        Jenny's story showcases what makes Swap-Skills special. It's not just about saving money — though that's certainly a benefit. It's about <strong className="text-foreground">building genuine local connections</strong>, <strong className="text-foreground">gaining potential customers</strong> who've experienced your work firsthand, and <strong className="text-foreground">strengthening community bonds</strong> through mutual support.
                      </p>
                      <p className="text-sm mt-3 font-medium text-foreground">
                        When you trade skills, everyone wins — and those wins often multiply in ways you never expected.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
                    <div>
                      <span className="font-bold">— Jenny</span>
                      <span className="text-muted-foreground text-sm ml-2">Reiki Practitioner, Carlow</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <SocialShareButtons 
                        url="https://swap-skills.ie/stories#jenny-3-swaps"
                        title="3 Skill Exchanges in 1 Month - Jenny's Swap-Skills Success Story"
                        description="How Jenny used her Reiki business to get a website, hair treatment, and facial while making real local connections."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Founder Story Section */}
        <section id="founder-story" className="py-10 md:py-12 bg-muted/30 scroll-mt-20">
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

                  {/* Author & Share */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="font-bold">— Kris</span>
                      <span className="text-muted-foreground text-sm ml-2">Founder of Swap-Skills</span>
                    </div>
                    <SocialShareButtons 
                      url="https://swap-skills.ie/stories#founder-story"
                      title="From Home Exchange to Skill Exchange - Why I Built Swap-Skills"
                      description="A home exchange experience that inspired the creation of Ireland's community for trading skills without money."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Jennifer & Delia Story */}
        <section id="jennifer-delia" className="py-10 md:py-12 scroll-mt-20">
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
                  
                  <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
                    <div>
                      <span className="font-bold">— {featuredStory.authors}</span>
                      <span className="text-muted-foreground text-sm ml-2">{featuredStory.location}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto flex-wrap">
                      <SocialShareButtons 
                        url="https://swap-skills.ie/stories#jennifer-delia"
                        title="A Real Life Story from Carlow - Jennifer & Delia"
                        description="Two wellness professionals discovered the power of skill-trading and built a business partnership."
                      />
                      <a href={featuredStory.facebookLink} target="_blank" rel="noopener noreferrer">
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

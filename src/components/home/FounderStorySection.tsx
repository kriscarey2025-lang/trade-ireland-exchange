import { Heart, Sparkles, Users, Wallet, Coffee, TreePine } from "lucide-react";

export function FounderStorySection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" />
              A bit about us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Why I started <span className="gradient-text">Swap Skills</span>
            </h2>
          </div>

          {/* Story content */}
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50 cozy-shadow">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-relaxed font-display">
                It all started over a cuppa with my neighbour.
              </p>
              
              <p className="mb-6">
                She was telling me about her garden — overgrown, neglected, driving her mad. "I'd do anything 
                for someone to sort it," she said. Meanwhile, I was dreading setting up my new laptop. 
                Technology and me? Not exactly best friends.
              </p>

              <p className="mb-6">
                Then it clicked. She loves gardening. I'm grand with computers. 
                Why were we both planning to pay strangers when we could just... help each other?
              </p>

              <div className="my-10 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-2xl border border-primary/20">
                <p className="text-lg md:text-xl font-medium text-foreground italic mb-0 font-display">
                  "What if there was a place where skills were the currency? Where your talents actually meant something?"
                </p>
              </div>

              <p className="mb-6">
                I met a single mum who's a brilliant gardener but couldn't afford childcare to go back to college. 
                A retired electrician who'd love to help but didn't know anyone who needed him. 
                A student brilliant at web design, drowning in rent.
              </p>

              <p className="mb-6">
                We've forgotten how to be neighbours. We order strangers on apps instead of asking the 
                person next door. But here's the thing — <span className="text-foreground font-semibold">your community is full of hidden superpowers</span>. 
                We just need a wee nudge to share them.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Coffee className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Make actual friends</h3>
                  <p className="text-sm text-muted-foreground">Not just service providers. Real people you might grab a coffee with.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Keep your hard-earned cash</h3>
                  <p className="text-sm text-muted-foreground">No money changes hands. Your skills are your currency here.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-highlight/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-highlight" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Discover hidden talents</h3>
                  <p className="text-sm text-muted-foreground">Your neighbour might be amazing at something you'd never guess.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
                  <TreePine className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Restore faith in humanity</h3>
                  <p className="text-sm text-muted-foreground">Seriously. There's something magic about helping each other.</p>
                </div>
              </div>
            </div>

            {/* Closing */}
            <div className="mt-10 pt-8 border-t border-border/30 text-center">
              <p className="text-lg text-foreground font-medium font-display">
                This isn't a startup chasing millions. It's a wee project from rural Carlow, 
                hoping to make Ireland a bit friendlier.
              </p>
              <p className="text-muted-foreground mt-4">
                Fancy giving it a go? We'd love to have you. ☕
              </p>
              <p className="text-sm text-primary mt-4 font-semibold">
                — Kristina, from Killeshin
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

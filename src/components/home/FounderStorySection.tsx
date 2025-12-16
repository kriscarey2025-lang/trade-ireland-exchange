import { Heart, Sparkles, Users, Wallet, Coffee, TreePine } from "lucide-react";
export function FounderStorySection() {
  return <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
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
                Here's a confession: I can build you a website, but I'm absolutely hopeless with a drill.
              </p>
              
              <p className="mb-6">
                Seriously. Last time I tried to put up a shelf, let's just say... the shelf won. I can fix your 
                laptop, sort out your WiFi, or rescue your photos from that ancient hard drive. But ask me to 
                hang a picture frame? Disaster waiting to happen.
              </p>

              <div className="my-10 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-2xl border border-primary/20">
                <p className="text-lg md:text-xl font-medium text-foreground italic mb-0 font-display">
                  "What if I could help someone with their tech headaches, and in return, they'd help me put together 
                  that flat-pack furniture that's been haunting my hallway?"
                </p>
              </div>

              <p className="mb-6">
                That's how Swap Skills was born. I realised we're all walking around with brilliant skills that 
                someone else desperately needs. The retired teacher next door who'd love to help with maths homework. 
                The teenager who's magic with animals. The neighbour who actually knows which end of a screwdriver 
                to hold.
              </p>

              <p className="mb-6">.your community is full of hidden superpowers. We just need a little nudge to share them.<span className="text-foreground font-semibold">your community is full of hidden superpowers</span>. 
                We just need a little nudge to share them.
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
                This isn't a startup chasing millions. It's a small project from rural Carlow, 
                hoping to bring Ireland closer together one exchange at a time.
              </p>
              <p className="text-muted-foreground mt-4">
                Fancy giving it a go? We'd love to have you. ☕
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
}
import { Heart, Sparkles, Users, Wallet } from "lucide-react";

export function FounderStorySection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Why I Built <span className="gradient-text">Swap Skills</span>
            </h2>
          </div>

          {/* Story content */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50 shadow-soft">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-relaxed">
                It started with a simple realisation: the value of a service depends entirely on who&apos;s doing it.
              </p>
              
              <p className="mb-6">
                What takes me an hour—setting up a website, configuring a CRM, fixing a computer—might feel like an impossible mountain for someone else. Meanwhile, that same person might find joy in gardening, something I&apos;d struggle with for days.
              </p>

              <p className="mb-6">
                I met a single parent who loved tending to gardens but desperately needed weekend childcare to attend college. She had skills. She had time. What she didn&apos;t have was money to spare—and the traditional economy wasn&apos;t working for her.
              </p>

              <div className="my-10 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-2xl border border-primary/20">
                <p className="text-lg md:text-xl font-medium text-foreground italic mb-0">
                  &quot;What if we could trade skills directly? No money changing hands. No tax man taking a cut. No inflation eating away at your hard-earned value.&quot;
                </p>
              </div>

              <p className="mb-6">
                But Swap Skills is about more than transactions. In a world where loneliness has become an epidemic and neighbours don&apos;t know each other&apos;s names, skill-swapping has the power to do something remarkable:
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Build Real Connections</h3>
                  <p className="text-sm text-muted-foreground">Transform anonymous neighbours into friends. Create meaningful relationships through genuine exchange.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Keep Your Value</h3>
                  <p className="text-sm text-muted-foreground">No financial expenses. No taxes on exchanges. No inflation eroding your purchasing power.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-gradient-fun flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Unlock Hidden Talents</h3>
                  <p className="text-sm text-muted-foreground">Discover skills you never knew existed in your community. Everyone has something valuable to offer.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-background/50 rounded-2xl border border-border/30 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">More Than Transactions</h3>
                  <p className="text-sm text-muted-foreground">Every swap is a chance to learn, teach, and grow together. It&apos;s community building at its finest.</p>
                </div>
              </div>
            </div>

            {/* Closing */}
            <div className="mt-10 pt-8 border-t border-border/30 text-center">
              <p className="text-lg text-foreground font-medium">
                This isn&apos;t just a platform. It&apos;s a movement back to how communities used to work—where your skills are your currency and helping each other is the norm.
              </p>
              <p className="text-muted-foreground mt-4">
                Welcome to Swap Skills. Let&apos;s build something meaningful together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

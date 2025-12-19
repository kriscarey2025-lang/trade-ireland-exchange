import { MapPin, Clock, Sprout, Globe, HeartHandshake, Coins } from "lucide-react";

export function OurStorySection() {
  return (
    <section className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              The bigger picture
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              More than just <span className="gradient-text">swapping skills</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building something that matters. Here's why SwapSkills exists and what we're working towards.
            </p>
          </div>

          {/* Main content */}
          <div className="prose prose-lg max-w-none">
            {/* The Problem */}
            <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 mb-8 cozy-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                  The problem we saw
                </h3>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Ireland has changed dramatically over the past few decades. Our communities, once tight-knit 
                  groups where neighbours knew each other by name and helped out without a second thought, have 
                  become increasingly disconnected. The cost of living crisis has put pressure on families across 
                  the country, making it harder than ever to afford the services we need.
                </p>
                <p>
                  Think about it: you might be brilliant at fixing computers, while your neighbour down the road 
                  is amazing at gardening. But instead of helping each other, you both end up paying strangers 
                  for services your community already has. Money flows out of local areas, skills go unused, and 
                  opportunities for genuine connection slip away.
                </p>
                <p>
                  We've become a society where we're more likely to order something online from the other side 
                  of the world than ask a neighbour for help. We scroll past each other on our phones, unaware 
                  that the person sitting next to us on the bus could solve a problem we've been struggling with 
                  for weeks.
                </p>
              </div>
            </div>

            {/* The Vision */}
            <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 mb-8 cozy-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                  Our vision for Ireland
                </h3>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  We envision an Ireland where communities are alive again. Where the retired teacher on your 
                  street can help local kids with their homework, and in return, maybe someone shovels their 
                  driveway when the snow comes. Where the young professional who's handy with technology can 
                  help an elderly neighbour set up video calls to see their grandchildren, and learn a family 
                  recipe in return.
                </p>
                <p>
                  SwapSkills isn't just about saving money, though that's certainly a wonderful benefit. It's 
                  about rediscovering the value of what we already have. Every person in Ireland has something 
                  to offer, something they're good at, something they could share. We're simply creating the 
                  bridge that connects these hidden talents.
                </p>
                <p>
                  Picture your local community board filled with offers: "Can teach guitar in exchange for 
                  help moving furniture." "Happy to mind dogs while you're at work — would love someone to 
                  teach me to bake!" "Plumber with 30 years experience, looking for someone to help with 
                  garden work." These are real connections waiting to happen.
                </p>
              </div>
            </div>

            {/* The Irish Way */}
            <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 mb-8 cozy-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-highlight/10 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-highlight" />
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                  The Irish tradition of helping out
                </h3>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  What we're doing isn't new at all. In fact, it's deeply rooted in Irish tradition. Our 
                  grandparents and great-grandparents lived this way naturally. The concept of "meitheal" — 
                  neighbours coming together to help with farming tasks, building homes, or tackling any job 
                  too big for one family alone — was how communities survived and thrived.
                </p>
                <p>
                  During the hard times, Irish communities pulled together. When a family was struggling, 
                  neighbours stepped in. When the hay needed saving before the rain, the whole townland would 
                  show up. There was an understanding that we're all in this together, that what helps one 
                  helps all, and that genuine community makes life richer in ways money simply cannot.
                </p>
                <p>
                  SwapSkills is bringing this tradition into the digital age. We're using modern technology 
                  to facilitate the same kind of community connections that have sustained Irish life for 
                  generations. We're not trying to replace human connection with an app — we're using an app 
                  to enable more human connection.
                </p>
              </div>
            </div>

            {/* The Practicalities */}
            <div className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 cozy-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground m-0">
                  How this actually helps you
                </h3>
              </div>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Let's be practical about this. Times are tough for many families in Ireland right now. 
                  Between mortgages, rent, bills, and the ever-increasing cost of groceries, there's often 
                  nothing left at the end of the month. Yet we still need services — someone to help with 
                  the garden, a tutor for the kids, assistance with home repairs, or just someone to walk 
                  the dog when work runs late.
                </p>
                <p>
                  SwapSkills lets you access these services without money changing hands. If you can offer 
                  something in return — and everyone can offer something — you can get the help you need. 
                  Maybe you're a fantastic cook but hopeless with technology. Maybe you're great with kids 
                  but your garden looks like a jungle. Whatever your situation, there's someone out there 
                  whose skills perfectly complement yours.
                </p>
                <p>
                  Beyond the practical savings, there's something even more valuable: the connections you'll 
                  make. We've heard countless stories from our community about swaps that turned into 
                  friendships, about neighbours who'd lived on the same street for years but never spoken 
                  until SwapSkills brought them together. These connections enrich life in ways that no 
                  amount of money can buy.
                </p>
              </div>
            </div>
          </div>

          {/* Location emphasis */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Proudly built in Killeshin, County Carlow — serving communities across all 32 counties</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

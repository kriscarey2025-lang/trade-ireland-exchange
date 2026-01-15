import { useState } from "react";
import { Users, Heart, Coins, Wrench, BookOpen, Home, UtensilsCrossed, Shirt, Baby, Laptop, Dog, Car, Scissors, Camera, Music, Printer } from "lucide-react";
import qrCode from "@/assets/flyer-qr-code.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Flyer = () => {
  const [size, setSize] = useState<"a4" | "a5">("a4");

  const handlePrint = () => {
    window.print();
  };

  const benefits = [
    { icon: Coins, text: "Save Money", emoji: "💰" },
    { icon: Users, text: "Make Friends", emoji: "🤝" },
    { icon: Heart, text: "Help Neighbours", emoji: "❤️" },
  ];

  const skills = [
    { icon: UtensilsCrossed, skill: "Cooking", emoji: "🍳" },
    { icon: Shirt, skill: "Ironing", emoji: "👔" },
    { icon: Baby, skill: "Childminding", emoji: "👶" },
    { icon: Laptop, skill: "Tech Setup", emoji: "💻" },
    { icon: Home, skill: "Gardening", emoji: "🌱" },
    { icon: Wrench, skill: "DIY & Repairs", emoji: "🔧" },
    { icon: Dog, skill: "Pet Sitting", emoji: "🐕" },
    { icon: Car, skill: "Lifts & Errands", emoji: "🚗" },
    { icon: BookOpen, skill: "Tutoring", emoji: "📚" },
    { icon: Scissors, skill: "Hairdressing", emoji: "✂️" },
    { icon: Camera, skill: "Photography", emoji: "📸" },
    { icon: Music, skill: "Music Lessons", emoji: "🎵" },
  ];

  const skillsA5 = skills.slice(0, 8);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-4 print:p-0 print:bg-white print:min-h-0">
      {/* Controls - Hidden when printing */}
      <div className="mb-6 print:hidden flex flex-col items-center gap-4">
        <Tabs value={size} onValueChange={(v) => setSize(v as "a4" | "a5")}>
          <TabsList>
            <TabsTrigger value="a4">A4 (210 × 297mm)</TabsTrigger>
            <TabsTrigger value="a5">A5 (148 × 210mm)</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handlePrint} size="lg" className="gap-2">
          <Printer className="w-5 h-5" />
          Download / Print Flyer
        </Button>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Tip: In print dialog, select "Save as PDF" and set paper size to {size === "a4" ? "A4" : "A5"}
        </p>
      </div>

      {/* A4 Flyer - Exact dimensions */}
      {size === "a4" && (
        <div 
          className="bg-white shadow-2xl print:shadow-none overflow-hidden rounded-lg print:rounded-none flex flex-col"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            maxWidth: '100%'
          }}
        >
          {/* Header Banner - Branded */}
          <div className="bg-accent text-white py-8 px-10 text-center relative overflow-hidden">
            {/* Decorative blobs matching brand */}
            <div className="absolute top-0 left-0 w-28 h-28 bg-[hsl(85_35%_45%)] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-highlight/40 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-8 w-16 h-16 bg-[hsl(85_35%_45%)] rounded-full -translate-y-1/2 opacity-40" />
            <h1 className="text-5xl font-bold tracking-tight relative z-10 font-display uppercase">
              SWAP SKILLS
            </h1>
            <p className="text-xl mt-2 opacity-95 font-medium relative z-10 font-friendly">
              Ireland's Free Skill Exchange Platform
            </p>
          </div>

          {/* Main Content - Flex grow to fill space */}
          <div className="px-10 py-8 flex-1 flex flex-col">
            {/* Branded tagline - multi-color */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold font-display italic">
                <span className="text-primary">Swap skills.</span>{" "}
                <span className="text-highlight">Make friends.</span>
                <br />
                <span className="text-accent">Save money.</span>
              </h2>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-accent mb-2 font-display">
                🔄 Exchange Skills, Not Cash!
              </h3>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-friendly">
                Join your local community and trade skills with neighbours.
                <span className="font-semibold text-primary"> No money needed</span> – just your talents!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 flex-1">
              {/* Left Column - Benefits & Skills */}
              <div className="space-y-6">
                {/* Key Benefits */}
                <div className="bg-secondary/50 rounded-2xl p-6 border-2 border-accent/20">
                  <h3 className="text-xl font-bold text-accent mb-5 text-center font-display">
                    ✨ Why Join?
                  </h3>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-3xl">{benefit.emoji}</span>
                        </div>
                        <span className="text-xl font-semibold text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20">
                  <h3 className="text-xl font-bold text-primary mb-5 text-center font-display">
                    🎯 Swap Skills Like...
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {skills.map((item, index) => (
                      <div key={index} className="text-center bg-white rounded-xl p-3 shadow-sm">
                        <span className="text-2xl block mb-1">{item.emoji}</span>
                        <span className="text-sm font-medium text-foreground leading-tight block">{item.skill}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-base text-muted-foreground mt-4 italic">
                    ...and so much more! 🌟
                  </p>
                </div>
              </div>

              {/* Right Column - QR Code & CTA */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-accent">
                  <img src={qrCode} alt="Scan to join Swap Skills" className="w-64 h-auto" />
                </div>
                <div className="mt-5 text-center">
                  <p className="text-2xl font-bold text-accent font-display">📱 Scan & Join Today!</p>
                  <p className="text-primary font-semibold text-xl mt-2">swap-skills.ie</p>
                </div>

                {/* How it Works */}
                <div className="mt-6 w-full bg-accent/10 rounded-2xl p-5">
                  <h4 className="text-center font-bold text-accent mb-4 text-lg font-display">How It Works</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center text-base shadow-md">1</span>
                      <span className="text-base font-medium">Sign up for FREE 🆓</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-base shadow-md">2</span>
                      <span className="text-base font-medium">List your skills & needs 📝</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center text-base shadow-md">3</span>
                      <span className="text-base font-medium">Connect & swap! 🤝</span>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-secondary px-4 py-2 rounded-full font-medium">✅ 100% Free</span>
                  <span className="bg-secondary px-4 py-2 rounded-full font-medium">🔒 Safe & Local</span>
                  <span className="bg-secondary px-4 py-2 rounded-full font-medium">🇮🇪 Irish Made</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-accent text-white py-5 px-10 mt-auto">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-xl">🇮🇪 Built for Irish Communities</p>
                <p className="text-base opacity-90">Connecting neighbours • Building friendships • Saving money</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">swap-skills.ie</p>
                <p className="text-base opacity-90">Join 50+ members today!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A5 Flyer - Exact dimensions */}
      {size === "a5" && (
        <div 
          className="bg-white shadow-2xl print:shadow-none overflow-hidden rounded-lg print:rounded-none flex flex-col"
          style={{ 
            width: '148mm', 
            minHeight: '210mm',
            maxWidth: '100%'
          }}
        >
          {/* Compact Header - Branded */}
          <div className="bg-accent text-white py-4 px-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-14 h-14 bg-[hsl(85_35%_45%)] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-highlight/40 rounded-full translate-x-1/2 translate-y-1/2" />
            <h1 className="text-3xl font-bold tracking-tight relative z-10 font-display uppercase">
              SWAP SKILLS
            </h1>
            <p className="text-base mt-1 opacity-95 font-medium relative z-10 font-friendly">
              Ireland's Free Skill Exchange Platform
            </p>
          </div>

          {/* Main Content */}
          <div className="px-5 py-5 flex-1 flex flex-col">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-accent font-display">
                🔄 Exchange Skills, Not Cash!
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Trade skills with neighbours – <span className="font-semibold text-primary">no money needed!</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Left: QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl shadow-lg border-4 border-accent">
                  <img src={qrCode} alt="Scan to join" className="w-32 h-auto" />
                </div>
                <p className="text-base font-bold text-accent mt-3 font-display">📱 Scan to Join!</p>
                <p className="text-primary font-semibold text-sm">swap-skills.ie</p>
              </div>

              {/* Right: Benefits + Steps */}
              <div className="space-y-3">
                {/* Mini Benefits */}
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-sm font-bold text-accent mb-2 text-center">✨ Why Join?</p>
                  <div className="space-y-1.5">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5">
                        <span className="text-lg">{benefit.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Steps */}
                <div className="bg-accent/10 rounded-xl p-3">
                  <p className="text-sm font-bold text-accent mb-2 text-center">3 Easy Steps</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs">1</span>
                      <span className="text-xs font-medium">Sign up FREE 🆓</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">2</span>
                      <span className="text-xs font-medium">List skills 📝</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs">3</span>
                      <span className="text-xs font-medium">Swap! 🤝</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Row */}
            <div className="mt-4 bg-primary/5 rounded-xl p-3 border border-primary/20">
              <p className="text-sm font-bold text-primary mb-2 text-center">🎯 Swap Skills Like...</p>
              <div className="grid grid-cols-4 gap-2">
                {skillsA5.map((item, index) => (
                  <div key={index} className="text-center bg-white rounded-lg py-1.5 px-1 shadow-sm">
                    <span className="text-xl block">{item.emoji}</span>
                    <span className="text-[10px] font-medium text-foreground leading-tight block">{item.skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-3 flex justify-center gap-2 text-xs">
              <span className="bg-secondary px-3 py-1 rounded-full font-medium">✅ Free</span>
              <span className="bg-secondary px-3 py-1 rounded-full font-medium">🔒 Safe</span>
              <span className="bg-secondary px-3 py-1 rounded-full font-medium">🇮🇪 Irish</span>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="bg-accent text-white py-3 px-5 text-center mt-auto">
            <p className="text-sm font-semibold">🇮🇪 swap-skills.ie • Join 50+ members!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flyer;

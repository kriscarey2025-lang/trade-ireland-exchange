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

  const skillsA5 = skills.slice(0, 8); // Fewer skills for A5

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 print:p-0 print:bg-white">
      {/* Controls - Hidden when printing */}
      <div className="mb-4 print:hidden flex flex-col items-center gap-4">
        <Tabs value={size} onValueChange={(v) => setSize(v as "a4" | "a5")}>
          <TabsList>
            <TabsTrigger value="a4">A4 (Full Page)</TabsTrigger>
            <TabsTrigger value="a5">A5 (Half Page)</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handlePrint} size="lg" className="gap-2">
          <Printer className="w-5 h-5" />
          Download / Print Flyer
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Tip: Choose "Save as PDF" in the print dialog to download
        </p>
      </div>

      {/* A4 Flyer */}
      {size === "a4" && (
        <div className="w-full max-w-[210mm] bg-white shadow-2xl print:shadow-none overflow-hidden rounded-lg print:rounded-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-accent to-accent/80 text-white py-6 px-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-20 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-1/2 translate-y-1/2" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight relative z-10 font-display">
              SWAP SKILLS
            </h1>
            <p className="text-lg md:text-xl mt-1 opacity-95 font-medium relative z-10">
              Ireland's Free Skill Exchange Platform
            </p>
          </div>

          {/* Main Content */}
          <div className="px-6 md:px-10 py-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-accent mb-2 font-display">
                🔄 Exchange Skills, Not Cash!
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                Join your local community and trade skills with neighbours.
                <span className="font-semibold text-primary"> No money needed</span> – just your talents!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-5">
                <div className="bg-secondary/50 rounded-2xl p-5 border-2 border-accent/20">
                  <h3 className="text-xl font-bold text-accent mb-4 text-center font-display">
                    ✨ Why Join?
                  </h3>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-2xl">{benefit.emoji}</span>
                        </div>
                        <span className="text-lg font-semibold text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-5 border-2 border-primary/20">
                  <h3 className="text-xl font-bold text-primary mb-4 text-center font-display">
                    🎯 Swap Skills Like...
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {skills.map((item, index) => (
                      <div key={index} className="text-center bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-2xl block mb-1">{item.emoji}</span>
                        <span className="text-xs font-medium text-foreground leading-tight block">{item.skill}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-3 italic">
                    ...and so much more! 🌟
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-lg border-4 border-accent">
                  <img src={qrCode} alt="Scan to join Swap Skills" className="w-56 h-auto md:w-64" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold text-accent font-display">📱 Scan & Join Today!</p>
                  <p className="text-primary font-semibold text-lg mt-1">swap-skills.ie</p>
                </div>

                <div className="mt-5 w-full bg-accent/10 rounded-2xl p-4">
                  <h4 className="text-center font-bold text-accent mb-3 font-display">How It Works</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm shadow-md">1</span>
                      <span className="text-sm font-medium">Sign up for FREE 🆓</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">2</span>
                      <span className="text-sm font-medium">List your skills & needs 📝</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm shadow-md">3</span>
                      <span className="text-sm font-medium">Connect & swap! 🤝</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                  <span className="bg-secondary px-3 py-1 rounded-full font-medium">✅ 100% Free</span>
                  <span className="bg-secondary px-3 py-1 rounded-full font-medium">🔒 Safe & Local</span>
                  <span className="bg-secondary px-3 py-1 rounded-full font-medium">🇮🇪 Irish Made</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent text-white py-4 px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
              <div>
                <p className="font-semibold text-lg">🇮🇪 Built for Irish Communities</p>
                <p className="text-sm opacity-90">Connecting neighbours • Building friendships • Saving money</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">swap-skills.ie</p>
                <p className="text-sm opacity-90">Join 50+ members today!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A5 Flyer - Compact Version */}
      {size === "a5" && (
        <div className="w-full max-w-[148mm] bg-white shadow-2xl print:shadow-none overflow-hidden rounded-lg print:rounded-none">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-accent to-accent/80 text-white py-3 px-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-12 h-12 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-primary/20 rounded-full translate-x-1/2 translate-y-1/2" />
            <h1 className="text-2xl font-bold tracking-tight relative z-10 font-display">
              SWAP SKILLS
            </h1>
            <p className="text-sm mt-0.5 opacity-95 font-medium relative z-10">
              Ireland's Free Skill Exchange Platform
            </p>
          </div>

          {/* Compact Main Content */}
          <div className="px-4 py-4">
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-accent font-display">
                🔄 Exchange Skills, Not Cash!
              </h2>
              <p className="text-muted-foreground text-xs mt-1">
                Trade skills with neighbours – <span className="font-semibold text-primary">no money needed!</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Left: QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl shadow-lg border-3 border-accent">
                  <img src={qrCode} alt="Scan to join" className="w-28 h-auto" />
                </div>
                <p className="text-sm font-bold text-accent mt-2 font-display">📱 Scan to Join!</p>
                <p className="text-primary font-semibold text-xs">swap-skills.ie</p>
              </div>

              {/* Right: Benefits + Steps */}
              <div className="space-y-2">
                {/* Mini Benefits */}
                <div className="bg-secondary/50 rounded-xl p-2">
                  <p className="text-xs font-bold text-accent mb-1.5 text-center">✨ Why Join?</p>
                  <div className="space-y-1">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
                        <span className="text-base">{benefit.emoji}</span>
                        <span className="text-xs font-medium text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Steps */}
                <div className="bg-accent/10 rounded-xl p-2">
                  <p className="text-xs font-bold text-accent mb-1 text-center">3 Easy Steps</p>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[8px]">1</span>
                      <span>Sign up FREE 🆓</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[8px]">2</span>
                      <span>List skills 📝</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[8px]">3</span>
                      <span>Swap! 🤝</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Row */}
            <div className="mt-3 bg-primary/5 rounded-xl p-2 border border-primary/20">
              <p className="text-xs font-bold text-primary mb-2 text-center">🎯 Swap Skills Like...</p>
              <div className="grid grid-cols-4 gap-1.5">
                {skillsA5.map((item, index) => (
                  <div key={index} className="text-center bg-white rounded-lg py-1 px-0.5 shadow-sm">
                    <span className="text-lg block">{item.emoji}</span>
                    <span className="text-[9px] font-medium text-foreground leading-tight block">{item.skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-2 flex justify-center gap-1.5 text-[9px]">
              <span className="bg-secondary px-2 py-0.5 rounded-full font-medium">✅ Free</span>
              <span className="bg-secondary px-2 py-0.5 rounded-full font-medium">🔒 Safe</span>
              <span className="bg-secondary px-2 py-0.5 rounded-full font-medium">🇮🇪 Irish</span>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="bg-accent text-white py-2 px-4 text-center">
            <p className="text-xs font-semibold">🇮🇪 swap-skills.ie • Join 50+ members!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flyer;

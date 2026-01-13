import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Palette, Type, Users, Handshake, Heart, MapPin, FileText, ExternalLink, Newspaper } from "lucide-react";
import swapskillsLogo from "@/assets/swapskills-logo-full.png";
import carlowNationalistArticle from "@/assets/press/carlow-nationalist-jan-2026.jpg";

const PressKit = () => {
  const stats = [
    { label: "Community Members", value: "36+", icon: Users, description: "Active neighbours swapping skills" },
    { label: "Skills Offered", value: "15+", icon: Handshake, description: "Available services to swap" },
    { label: "Categories", value: "7+", icon: FileText, description: "From gardening to language tutoring" },
    { label: "Location", value: "Carlow, Ireland", icon: MapPin, description: "Built with love in Killeshin" },
  ];

  const brandColors = [
    { name: "Primary (Terracotta)", hsl: "18 70% 50%", hex: "#D95F2C", usage: "Main brand color, CTAs, headers" },
    { name: "Accent (Sage Green)", hsl: "145 35% 42%", hex: "#4A9A6F", usage: "Secondary actions, success states" },
    { name: "Highlight (Honey Gold)", hsl: "38 75% 55%", hex: "#E3A832", usage: "Highlights, badges, accents" },
    { name: "Background (Cream)", hsl: "40 30% 98%", hex: "#FDFBF8", usage: "Page backgrounds" },
    { name: "Foreground (Warm Brown)", hsl: "25 25% 15%", hex: "#302822", usage: "Body text, headings" },
  ];

  const handleDownloadLogo = () => {
    const link = document.createElement('a');
    link.href = swapskillsLogo;
    link.download = 'swapskills-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Press Kit - SwapSkills | Brand Assets & Media Resources"
        description="Download SwapSkills logos, brand guidelines, and media resources. Learn about Ireland's first free digital barter system for skill swapping."
      />
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                <FileText className="h-3 w-3 mr-1" />
                Press & Media
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Press Kit
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Everything you need to tell the SwapSkills story. Download our brand assets, 
                learn about our mission, and access key statistics about Ireland's first free 
                digital barter system.
              </p>
            </div>
          </div>
        </section>

        {/* Press Coverage Section */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Newspaper className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-display font-bold text-foreground">Press Coverage</h2>
              </div>
              
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6">
                    <img 
                      src={carlowNationalistArticle} 
                      alt="Carlow Nationalist article about SwapSkills - Killeshin woman launches online service exchange platform" 
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                  <CardContent className="pt-6 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-3">
                      <Newspaper className="h-3 w-3 mr-1" />
                      Featured Article
                    </Badge>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      "Killeshin woman launches online service exchange platform SwapSkills"
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Featured in the Carlow Nationalist, this article highlights Kris Carey's launch of SwapSkills, 
                      Ireland's first free digital barter platform connecting neighbours to exchange services.
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">Carlow Nationalist</Badge>
                      <Badge variant="outline">13 January 2026</Badge>
                      <Badge variant="outline">By Hosanna Boulter</Badge>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">About SwapSkills</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>
                  <strong className="text-foreground">SwapSkills</strong> is Ireland's first free digital barter 
                  platform, connecting neighbours to exchange skills and services without any money changing hands. 
                  Founded in Killeshin, County Carlow, we believe in the power of community and the value of 
                  helping each other.
                </p>
                <p>
                  Whether it's swapping German lessons for gardening help, or trading tech support for 
                  home-cooked meals, SwapSkills makes it easy for neighbours to share what they know 
                  and get help with what they need.
                </p>
                <div className="bg-secondary/50 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Our Mission
                  </h3>
                  <p className="text-foreground italic">
                    "To strengthen local communities by making it simple and free for neighbours to 
                    share skills, build connections, and help each other thrive — without money 
                    getting in the way."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Statistics */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8 text-center">
                Key Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => (
                  <Card key={stat.label} className="text-center">
                    <CardContent className="pt-6">
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-foreground">{stat.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Logo Assets */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8">Logo Assets</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Primary Logo - Light Background */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Primary Logo</CardTitle>
                    <CardDescription>For use on light backgrounds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background border rounded-xl p-8 flex items-center justify-center mb-4">
                      <img 
                        src={swapskillsLogo} 
                        alt="SwapSkills Logo" 
                        className="h-24 w-auto"
                      />
                    </div>
                    <Button onClick={handleDownloadLogo} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </CardContent>
                </Card>

                {/* Logo on Dark Background */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Logo on Dark</CardTitle>
                    <CardDescription>For use on dark backgrounds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-foreground rounded-xl p-8 flex items-center justify-center mb-4">
                      <img 
                        src={swapskillsLogo} 
                        alt="SwapSkills Logo on dark background" 
                        className="h-24 w-auto"
                      />
                    </div>
                    <Button onClick={handleDownloadLogo} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Logo Usage Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Maintain minimum clear space around the logo equal to the height of the "S" in Skills
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Use only the approved color versions provided
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      Do not stretch, distort, or rotate the logo
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      Do not alter the colors or add effects
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      Do not place the logo on busy or low-contrast backgrounds
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="py-16 bg-secondary/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Palette className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-display font-bold text-foreground">Brand Colors</h2>
              </div>
              
              <div className="grid gap-4">
                {brandColors.map((color) => (
                  <Card key={color.name} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div 
                        className="w-full sm:w-32 h-20 sm:h-auto shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <CardContent className="p-4 flex-grow">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{color.name}</h3>
                            <p className="text-sm text-muted-foreground">{color.usage}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-mono text-foreground">{color.hex}</p>
                            <p className="font-mono text-muted-foreground">HSL: {color.hsl}</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Type className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-display font-bold text-foreground">Typography</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">Fraunces</CardTitle>
                    <CardDescription>Display & Headlines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-4xl text-foreground mb-4">Aa Bb Cc</p>
                    <p className="font-display text-lg text-muted-foreground">
                      Used for headings, hero text, and brand statements. 
                      A warm, friendly serif that conveys trust and community.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <a href="https://fonts.google.com/specimen/Fraunces" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Google Fonts
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Nunito</CardTitle>
                    <CardDescription>Body & UI Text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl text-foreground mb-4">Aa Bb Cc</p>
                    <p className="text-lg text-muted-foreground">
                      Used for body text, buttons, and UI elements. 
                      A rounded, friendly sans-serif that's highly readable.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <a href="https://fonts.google.com/specimen/Nunito" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Google Fonts
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Voice */}
        <section className="py-16 bg-secondary/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8">Brand Voice</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">🤝</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Neighbourly</h3>
                    <p className="text-muted-foreground">
                      We speak like a friendly neighbour, not a corporation. Warm, approachable, 
                      and genuinely helpful.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">🍀</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Proudly Irish</h3>
                    <p className="text-muted-foreground">
                      We embrace our Irish roots with pride. Local phrases, Irish humour, 
                      and a deep love for community.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">💚</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Genuine</h3>
                    <p className="text-muted-foreground">
                      We're honest and transparent. No hidden fees, no corporate jargon — 
                      just neighbours helping neighbours.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Media Enquiries</h2>
              <p className="text-lg text-muted-foreground mb-6">
                For press enquiries, interviews, or additional assets, please get in touch.
              </p>
              <Button size="lg" asChild>
                <a href="/contact">
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PressKit;

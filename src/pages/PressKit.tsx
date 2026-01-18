import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Users, Handshake, Heart, MapPin, FileText, ExternalLink, Newspaper, Radio, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import swapskillsLogo from "@/assets/swapskills-logo-full.png";
import carlowNationalistArticle from "@/assets/press/carlow-nationalist-jan-2026.jpg";
import kclrDailyLogo from "@/assets/press/kclr-daily-logo.png";

const PressKit = () => {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [servicesCount, setServicesCount] = useState<number | null>(null);
  const [categoriesCount, setCategoriesCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch member count
      const { count: members } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Fetch active services count
      const { count: services } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // Fetch unique categories count
      const { data: categoryData } = await supabase
        .from('services')
        .select('category')
        .eq('status', 'active');
      
      const uniqueCategories = new Set(categoryData?.map(s => s.category) || []);
      
      // Use real count or minimum of 71 for members
      setMemberCount(Math.max(members || 0, 71));
      setServicesCount(Math.max(services || 0, 15));
      setCategoriesCount(Math.max(uniqueCategories.size, 7));
    };

    fetchStats();
  }, []);

  const stats = [{
    label: "Community Members",
    value: memberCount !== null ? `${memberCount}+` : "...",
    icon: Users,
    description: "Active neighbours swapping skills"
  }, {
    label: "Skills Offered",
    value: servicesCount !== null ? `${servicesCount}+` : "...",
    icon: Handshake,
    description: "Available services to swap"
  }, {
    label: "Categories",
    value: categoriesCount !== null ? `${categoriesCount}+` : "...",
    icon: FileText,
    description: "From gardening to language tutoring"
  }, {
    label: "Location",
    value: "Carlow, Ireland",
    icon: MapPin,
    description: "Built with love in Killeshin"
  }];
  const handleDownloadLogo = () => {
    const link = document.createElement('a');
    link.href = swapskillsLogo;
    link.download = 'swapskills-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Press Kit - SwapSkills | Brand Assets & Media Resources" description="Download SwapSkills logos, brand guidelines, and media resources. Learn about Ireland's first free digital barter system for skill swapping." />
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
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Press Coverage</h1>
              
            </div>
          </div>
        </section>

        {/* Press Coverage Section */}
        <section className="py-16 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Newspaper className="h-8 w-8 text-primary" />
                
              </div>
              
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6">
                    <img src={carlowNationalistArticle} alt="Carlow Nationalist article about SwapSkills - Killeshin woman launches online service exchange platform" className="w-full rounded-lg shadow-md" />
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

              {/* Laois Nationalist Online Article */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Newspaper className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Online Article
                        </Badge>
                        <Badge variant="outline">January 2026</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        "Killeshin woman launches online platform SwapSkills to help people save money"
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        The Laois Nationalist covers SwapSkills, featuring founder Kristina Carey's vision for 
                        building community connections through skill exchanges without money changing hands.
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                        <Badge variant="outline">Laois Nationalist</Badge>
                        <Badge variant="outline">17 January 2026</Badge>
                        <Badge variant="outline">By Hosanna Boulter</Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://www.laois-nationalist.ie/news/killeshin-woman-launches-online-platform-swapskills-to-help-people-save-money_arid-84343.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Article
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Carlow Nationalist Online Article */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Newspaper className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Online Article
                        </Badge>
                        <Badge variant="outline">January 2026</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        "Killeshin woman launches online platform SwapSkills to help people save money"
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        The Carlow Nationalist online coverage of SwapSkills, featuring founder Kris Carey's 
                        vision for helping neighbours exchange skills and save money through community connections.
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                        <Badge variant="outline">Carlow Nationalist</Badge>
                        <Badge variant="outline">16 January 2026</Badge>
                        <Badge variant="outline">Online Edition</Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://www.carlow-nationalist.ie/news/killeshin-woman-launches-online-platform-swapskills-to-help-people-save-money_arid-84184.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Article
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Radio Interview */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <img src={kclrDailyLogo} alt="The KCLR Daily with Brian Redmond" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            <Radio className="h-3 w-3 mr-1" />
                            Radio Interview
                          </Badge>
                          <Badge variant="outline">January 2026</Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Radio Interview with Kris Carey
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          Listen to founder Kris Carey discuss SwapSkills and the vision for building 
                          stronger communities through skill sharing. The interview runs from 2:41:00 to 2:47:30.
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">KCLR Radio</Badge>
                          <Badge variant="outline">15 January 2026</Badge>
                          <Badge variant="outline">The KCLR Daily with Brian Redmond</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <Button size="lg" className="h-14 w-14 rounded-full shrink-0" onClick={() => {
                        const audio = document.getElementById('kclr-interview') as HTMLAudioElement;
                        if (audio) {
                          audio.currentTime = 9660; // 2:41:00
                          audio.play();
                        }
                      }}>
                          <Play className="h-6 w-6 ml-1" />
                        </Button>
                        <div className="flex-grow">
                          <p className="font-semibold text-foreground">The KCLR Daily</p>
                          <p className="text-sm text-muted-foreground">Interview starts at 2:41:00</p>
                          <audio id="kclr-interview" controls className="w-full mt-2" preload="metadata">
                            <source src="https://s3.eu-central-1.wasabisys.com/autopod-public/episodes/11768482186112.mp3" type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        Click play to start at the SwapSkills interview segment (2:41:00 - 2:47:30)
                      </p>
                    </div>
                  </div>
                </CardContent>
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
                <p>Purposely we have decided not to implement a credits, hour trading or skill valuation system - to allow our users to decide what is valuable and fair to them. We believe in honest and open communication, clear expectation setting and are actively monitoring the site by implementing reporting systems, review systems and providing safety guidelines. Ultimately our platform however solely aims to connect people through service exchanges. </p>
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
                {stats.map(stat => <Card key={stat.label} className="text-center">
                    <CardContent className="pt-6">
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-foreground">{stat.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>)}
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
                      <img src={swapskillsLogo} alt="SwapSkills Logo" className="h-24 w-auto" />
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
                      <img src={swapskillsLogo} alt="SwapSkills Logo on dark background" className="h-24 w-auto" />
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
    </div>;
};
export default PressKit;
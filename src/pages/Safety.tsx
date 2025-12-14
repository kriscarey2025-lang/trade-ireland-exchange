import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, MapPin, MessageCircle, Heart, AlertTriangle, Settings, Sparkles } from "lucide-react";

const safetyTips = [
  {
    icon: Users,
    title: "Meet in Public First",
    description: "For your first swap with someone new, we recommend choosing a public place such as a café or community centre. Public settings offer a comfortable way to get to know each other.",
  },
  {
    icon: MessageCircle,
    title: "Communicate Clearly",
    description: "Use our messaging system to discuss all details before meeting. Be clear about what you are offering and what you expect in return. Clear communication helps set expectations and avoid misunderstandings.",
  },
  {
    icon: MapPin,
    title: "Share Your Plans",
    description: "Let a friend or family member know where you are going and who you are meeting. Even a quick message can provide reassurance.",
  },
  {
    icon: Shield,
    title: "Trust Your Instincts",
    description: "If something doesn't feel right, it's okay to pause or decline. There is never any obligation to continue a swap, and your comfort and safety come first.",
  },
  {
    icon: Sparkles,
    title: "Start Small",
    description: "Build trust gradually by beginning with smaller exchanges. As familiarity grows, you can choose to explore larger swaps with confidence.",
  },
  {
    icon: Settings,
    title: "Use Platform Tools",
    description: "Swap-Skills provides tools to help you manage your experience, including the ability to message, block, or report other users. If at any point you feel uncomfortable, you can step away from a conversation.",
  },
  {
    icon: AlertTriangle,
    title: "Report Concerns",
    description: "If you encounter behaviour that makes you uncomfortable or appears to breach our Community Guidelines, please let us know via our Contact page. Reports help us review patterns of behaviour and maintain a respectful community.",
  },
];

export default function Safety() {
  return (
    <>
      <SEO 
        title="Safety Guidelines"
        description="Stay safe while swapping skills on Swap Skills. Learn our safety tips for meeting new people, exchanging services, and building trust in your community."
        keywords="swap skills safety, safe skill exchange, meeting strangers safely Ireland, community trading safety"
        url="https://swap-skills.com/safety"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-display mb-4">
                  Safety Guidelines
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your safety matters to us. These guidelines are here to help you have positive, respectful, and secure experiences on Swap-Skills.
                </p>
              </div>

              <div className="max-w-4xl mx-auto mb-16">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold text-center mb-4">Our Philosophy</h2>
                    <p className="text-center text-lg mb-4">
                      Swap-Skills was created with a simple belief — that most people are kind, generous, and want to help their neighbours. We aim to restore faith in humanity, one swap at a time.
                    </p>
                    <p className="text-center text-lg">
                      We encourage openness and trust, while also supporting thoughtful, sensible decision-making. 
                      <span className="text-primary font-medium"> You are always in control</span> of whether and how you proceed with any exchange.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {safetyTips.map((tip, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <tip.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="max-w-3xl mx-auto mt-8">
                <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      <strong>If you ever feel in immediate danger, please contact local emergency services.</strong>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="max-w-3xl mx-auto mt-16">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Community Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Swap-Skills is built on <strong>respect</strong>, <strong>honesty</strong>, and 
                      <strong> kindness</strong>. We ask all members to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Treat others as you would like to be treated</li>
                      <li>Be honest about your skills, experience, and availability</li>
                      <li>Communicate promptly and respectfully</li>
                      <li>Honour your commitments</li>
                      <li>Give others the benefit of the doubt</li>
                      <li>Report concerns so we can help maintain a safe environment</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="max-w-3xl mx-auto mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">A Note on Responsibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Swap-Skills provides a platform to connect people but does not supervise, verify, or participate in exchanges. Members are responsible for their own decisions, interactions, and safety when using the platform.
                    </p>
                    <p className="text-muted-foreground text-center pt-4">
                      Together, we're proving that neighbours helping neighbours can create something truly positive. Thank you for being part of this journey 💚
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

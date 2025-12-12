import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, MapPin, MessageCircle, Heart, AlertTriangle } from "lucide-react";

const safetyTips = [
  {
    icon: Users,
    title: "Meet in Public First",
    description: "For your first swap with someone new, choose a public place like a café or community centre. This gives you a chance to get to know each other in a safe environment.",
  },
  {
    icon: MessageCircle,
    title: "Communicate Clearly",
    description: "Use our messaging system to discuss all details before meeting. Be clear about what you're offering and what you expect in return. Good communication prevents misunderstandings.",
  },
  {
    icon: MapPin,
    title: "Share Your Plans",
    description: "Let a friend or family member know where you're going and who you're meeting. A quick text with details can provide peace of mind for everyone.",
  },
  {
    icon: Shield,
    title: "Trust Your Instincts",
    description: "If something doesn't feel right, it's okay to step back. Your safety and comfort always come first. There's no obligation to proceed with any swap.",
  },
  {
    icon: Heart,
    title: "Start Small",
    description: "Build trust gradually by starting with smaller swaps. As you get to know someone, you can progress to larger exchanges with confidence.",
  },
  {
    icon: AlertTriangle,
    title: "Report Concerns",
    description: "If you encounter any behaviour that makes you uncomfortable, please let us know through our Contact page. We take all reports seriously.",
  },
];

export default function Safety() {
  return (
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
                Your safety matters to us. Here's how to have positive, secure experiences on Swap-Skills.
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-16">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-center text-lg">
                    <span className="font-semibold">Our Philosophy:</span> Swap-Skills was created with a simple belief – 
                    that most people are kind, generous, and want to help their neighbours. We're here to 
                    <span className="text-primary font-medium"> restore faith in humanity</span>, one swap at a time. 
                    While we encourage openness and trust, we also believe in being sensible.
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

            <div className="max-w-3xl mx-auto mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Community Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Swap-Skills is built on the values of <strong>respect</strong>, <strong>honesty</strong>, and 
                    <strong> kindness</strong>. We ask all members to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Treat others as you'd like to be treated</li>
                    <li>Be honest about your skills and availability</li>
                    <li>Communicate promptly and respectfully</li>
                    <li>Honour your commitments</li>
                    <li>Give others the benefit of the doubt</li>
                    <li>Report any concerns so we can maintain a safe community</li>
                  </ul>
                  <p className="text-muted-foreground pt-4">
                    Together, we're proving that neighbours helping neighbours can create something beautiful. 
                    Thank you for being part of this journey. 💚
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

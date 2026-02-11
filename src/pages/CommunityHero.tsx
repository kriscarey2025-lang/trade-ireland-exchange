import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Heart, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function CommunityHero() {
  const [heroName, setHeroName] = useState("");
  const [description, setDescription] = useState("");
  const [nominatorName, setNominatorName] = useState("");
  const [nominatorEmail, setNominatorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!heroName.trim() || !description.trim()) {
      toast.error("Please fill in the hero's name and description.");
      return;
    }

    if (heroName.trim().length > 200) {
      toast.error("Hero name must be less than 200 characters.");
      return;
    }

    if (description.trim().length > 5000) {
      toast.error("Description must be less than 5000 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("community_hero_nominations").insert({
        hero_name: heroName.trim(),
        description: description.trim(),
        nominator_name: nominatorName.trim() || null,
        nominator_email: nominatorEmail.trim() || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Thank you! Your nomination has been submitted.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <SEO title="Community Hero Award 2026 | Swap Skills" description="Thank you for nominating a Community Hero!" />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Thank You! 🎉</CardTitle>
              <CardDescription className="text-base">
                Your nomination for the 2026 Community Hero Award has been submitted. The winner will be featured in a dedicated article on our website and announced at the end of March 2026.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <Link to="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Community Hero Award 2026 | Swap Skills"
        description="Nominate someone for the Swap Skills Community Hero Award 2026! The winner will be featured in an article on our website."
      />
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl py-12 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="gradient-text">Swap Skills Community Hero Award</span> 2026
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Know someone who goes above and beyond for their community? Nominate them for the <strong>2026 Community Hero Award</strong>! The winner will be <strong>featured in a dedicated article on our website</strong> and receive the spotlight they truly deserve. We're collecting nominations from <strong>mid-February to mid-March 2026</strong> and will announce the Community Hero <strong>at the end of March</strong>.
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                Nominate Your Hero
              </CardTitle>
              <CardDescription>
                All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="heroName">Community Hero Name *</Label>
                  <Input
                    id="heroName"
                    placeholder="Enter the hero's full name"
                    value={heroName}
                    onChange={(e) => setHeroName(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What makes this person a Community Hero? *</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us their story — what have they done for the community? Why do they deserve recognition?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={5000}
                    rows={8}
                    required
                    className="min-h-[160px]"
                  />
                  <p className="text-xs text-muted-foreground text-right">{description.length}/5000</p>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Your details (optional — so we can follow up)</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nominatorName">Your Name</Label>
                      <Input
                        id="nominatorName"
                        placeholder="Your name"
                        value={nominatorName}
                        onChange={(e) => setNominatorName(e.target.value)}
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nominatorEmail">Your Email</Label>
                      <Input
                        id="nominatorEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={nominatorEmail}
                        onChange={(e) => setNominatorEmail(e.target.value)}
                        maxLength={255}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-full" size="lg" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Nomination"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button variant="ghost" asChild>
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fireConfetti } from "@/hooks/useConfetti";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { SEO } from "@/components/SEO";

const EventRSVP = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "confirmed" | "cancelled"; name: string } | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    is_registered_user: "no",
    attendance: "yes",
    notes: "",
  });

  // Handle confirm/cancel URL params from email links
  useEffect(() => {
    const action = searchParams.get("action");
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (action && email && token && (action === "confirm" || action === "cancel")) {
      handleEmailAction(action, email, token);
    }
  }, [searchParams]);

  const handleEmailAction = async (action: "confirm" | "cancel", email: string, token: string) => {
    setActionProcessing(true);
    try {
      const newStatus = action === "confirm" ? "confirmed" : "cancelled";
      const { data, error } = await supabase
        .from("event_rsvps" as any)
        .update({ registration_status: newStatus } as any)
        .eq("id", token)
        .eq("email", email)
        .select("full_name")
        .single();

      if (error) throw error;

      setActionResult({ type: newStatus as "confirmed" | "cancelled", name: (data as any)?.full_name || "" });
      if (action === "confirm") fireConfetti();
    } catch (error) {
      console.error("Action error:", error);
      toast({ title: "Something went wrong", description: "This link may have expired or already been used.", variant: "destructive" });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Please fill in your name and email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("event_rsvps" as any).insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        is_registered_user: form.is_registered_user === "yes",
        attendance: form.attendance,
        time_preference: "either",
        notes: form.notes.trim() || null,
        registration_status: "confirmed",
      } as any);

      if (error) throw error;

      setSubmitted(true);
      fireConfetti();
    } catch (error: any) {
      console.error("RSVP error:", error);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Show action result (confirm/cancel from email)
  if (actionProcessing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (actionResult) {
    const firstName = actionResult.name?.split(" ")[0] || "there";
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO title="Event Registration — SwapSkills" description="Carlow in-person meet-up registration" />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center space-y-4">
              {actionResult.type === "confirmed" ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h2 className="text-2xl font-bold">You're confirmed, {firstName}! 🎉</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We'll see you at <strong>Enterprise House, O'Brien's Road, Carlow</strong> on <strong>Friday 17th April</strong> from <strong>6–8 PM</strong>. Light refreshments will be provided!
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                  <h2 className="text-2xl font-bold">RSVP Cancelled</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No worries, {firstName}! Your spot has been freed up for someone else. We hope to see you at a future event. 🤝
                  </p>
                </>
              )}
              <Button asChild className="mt-4">
                <Link to="/">Back to SwapSkills</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Register for the Carlow Meet-Up | SwapSkills"
        description="Register for the SwapSkills in-person meet-up at Enterprise House, Carlow on Friday 17th April 2026, 6–8 PM. Places limited!"
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        {/* Event Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Carlow, Ireland
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            🤝 SwapSkills In-Person Meet-Up
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Meet fellow skill-swappers face to face! Connect, chat, and arrange a skill exchange on the spot.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
            <Link to="/">Browse Offerings</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild>
            <Link to="/auth?mode=signup">Join for Free</Link>
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Location</p>
              <p className="text-xs text-muted-foreground">Enterprise House, O'Brien's Road, Carlow</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Date & Time</p>
              <p className="text-xs text-muted-foreground">Friday 17th April 2026, 6–8 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Who</p>
              <p className="text-xs text-muted-foreground">Places limited · Light refreshments</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">You're registered, {form.full_name.split(" ")[0]}! 🎉</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We'll see you at <strong>Enterprise House, O'Brien's Road, Carlow</strong> on <strong>Friday 17th April</strong> from <strong>6–8 PM</strong>. Expect light refreshments, skill swapping, connecting and learning about SwapSkills!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Register Your Place</CardTitle>
              <p className="text-sm text-muted-foreground">
                Places are limited — register below to secure your spot at our first in-person event!
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Your Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="e.g. Mary Moran"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    maxLength={100}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                    required
                  />
                </div>

                {/* Already a member? */}
                <div className="space-y-3">
                  <Label>Already a SwapSkills member?</Label>
                  <RadioGroup
                    value={form.is_registered_user}
                    onValueChange={(v) => setForm({ ...form, is_registered_user: v })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="member-yes" />
                      <Label htmlFor="member-yes" className="font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="member-no" />
                      <Label htmlFor="member-no" className="font-normal">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Would you attend? */}
                <div className="space-y-3">
                  <Label>Will you attend?</Label>
                  <RadioGroup
                    value={form.attendance}
                    onValueChange={(v) => setForm({ ...form, attendance: v })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="attend-yes" />
                      <Label htmlFor="attend-yes" className="font-normal">Yes, I'll be there!</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="attend-maybe" />
                      <Label htmlFor="attend-maybe" className="font-normal">Maybe — I'll try my best</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="attend-no" />
                      <Label htmlFor="attend-no" className="font-normal">Not this time</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Notes / Comments */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Anything you'd like to add? (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Questions, suggestions, or anything else..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    "Register My Place 🎉"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventRSVP;
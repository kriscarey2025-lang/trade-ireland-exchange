import { useState } from "react";
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
import { MapPin, Calendar, Users, CheckCircle2, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

const EventRSVP = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    is_registered_user: "no",
    attendance: "yes",
    time_preference: "either",
    notes: "",
  });

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
        time_preference: form.time_preference,
        notes: form.notes.trim() || null,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="In-Person Swap Event – Carlow | SwapSkills"
        description="Join our first in-person SwapSkills event in Carlow! Meet fellow skill-swappers, arrange exchanges, and connect with the community."
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
            Meet fellow skill-swappers face to face! Connect, chat, and maybe even arrange a skill exchange on the spot.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Location</p>
              <p className="text-xs text-muted-foreground">Carlow Town (TBC)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Date</p>
              <p className="text-xs text-muted-foreground">To be confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Who</p>
              <p className="text-xs text-muted-foreground">Everyone welcome!</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Thanks, {form.full_name.split(" ")[0]}! 🎉</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your interest has been recorded. We'll be in touch with event details once the date and venue are confirmed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Express Your Interest</CardTitle>
              <p className="text-sm text-muted-foreground">
                We're gauging interest before confirming the event. Fill in this quick form — no commitment yet!
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
                  <Label>Would you attend?</Label>
                  <RadioGroup
                    value={form.attendance}
                    onValueChange={(v) => setForm({ ...form, attendance: v })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="attend-yes" />
                      <Label htmlFor="attend-yes" className="font-normal">Yes, I'd love to!</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="attend-maybe" />
                      <Label htmlFor="attend-maybe" className="font-normal">Maybe — depends on timing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="attend-no" />
                      <Label htmlFor="attend-no" className="font-normal">Not this time</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Time preference */}
                <div className="space-y-3">
                  <Label>Time preference</Label>
                  <RadioGroup
                    value={form.time_preference}
                    onValueChange={(v) => setForm({ ...form, time_preference: v })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daytime" id="time-day" />
                      <Label htmlFor="time-day" className="font-normal">Daytime (weekday)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekend" id="time-weekend" />
                      <Label htmlFor="time-weekend" className="font-normal">Weekend</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="either" id="time-either" />
                      <Label htmlFor="time-either" className="font-normal">Either works for me</Label>
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
                      Submitting...
                    </>
                  ) : (
                    "Submit My Interest 🎉"
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

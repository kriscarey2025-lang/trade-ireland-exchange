import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

export default function NewsletterFeedback() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      toast.error("Please share a few more words");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-newsletter-feedback", {
        body: { message: message.trim(), email: email.trim() || undefined, subject: subject.trim() || undefined },
      });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not send right now — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <Helmet>
        <title>Share a suggestion · Swap Skills</title>
        <meta name="description" content="Tell us how to improve Swap Skills — your idea goes straight to the founder." />
        <link rel="canonical" href="https://swap-skills.ie/newsletter-feedback" />
      </Helmet>
      <div className="max-w-xl mx-auto">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Help shape Swap Skills</CardTitle>
            <CardDescription>
              One suggestion is all it takes. Your message lands directly in the admin inbox — no account required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Thank you</h2>
                <p className="text-muted-foreground">Your suggestion was sent. I really appreciate you taking the time.</p>
                <Button asChild variant="outline"><Link to="/browse">Back to Swap Skills</Link></Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Topic (optional)</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="e.g. Make messaging easier" />
                </div>
                <div>
                  <Label htmlFor="message">Your suggestion *</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} maxLength={2000} rows={6} placeholder="What would make Swap Skills more useful for you?" />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional, only if you'd like a reply)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} placeholder="you@example.com" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Sending…" : "Send suggestion"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
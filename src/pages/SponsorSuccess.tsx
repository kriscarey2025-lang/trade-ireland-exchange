import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Heart, Loader2, Eye, EyeOff } from "lucide-react";

export default function SponsorSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [displayOption, setDisplayOption] = useState<string>("anonymous");
  const [displayName, setDisplayName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      navigate("/advertise");
    }
  }, [sessionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session information missing. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isPublic = displayOption !== "anonymous";
      
      const { data, error } = await supabase.functions.invoke("save-sponsor-preferences", {
        body: {
          sessionId,
          isPublic,
          displayName: displayOption !== "anonymous" ? displayName : null,
          websiteUrl: displayOption === "name_website" ? websiteUrl : null,
          message: displayOption === "name_message" ? message : null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIsSubmitted(true);
      toast({
        title: "Preferences Saved!",
        description: "Thank you for your support. Your preferences have been saved.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) {
    return null;
  }

  return (
    <>
      <SEO
        title="Thank You for Your Support!"
        description="Complete your sponsorship by choosing your display preferences."
        url="https://swap-skills.ie/sponsor-success"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <div className="max-w-xl mx-auto">
              {isSubmitted ? (
                <Card>
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                        <Heart className="h-10 w-10 text-primary" />
                      </div>
                      <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
                      <p className="text-muted-foreground mb-6">
                        Your support means the world to us and the Swap-Skills community. 
                        Together, we're building something special.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate("/browse")}>
                          Explore Services
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/advertise")}>
                          Back to Sponsorship
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                      One more step - tell us how you'd like to be recognized.
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sponsor Display Preferences</CardTitle>
                      <CardDescription>
                        Choose how you'd like to appear on our Sponsors page. 
                        You can always change this later.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <RadioGroup
                          value={displayOption}
                          onValueChange={setDisplayOption}
                          className="space-y-4"
                        >
                          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value="anonymous" id="anonymous" className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor="anonymous" className="flex items-center gap-2 font-medium cursor-pointer">
                                <EyeOff className="h-4 w-4" />
                                Stay Anonymous
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Support us privately - you won't appear on the Sponsors page.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value="name_only" id="name_only" className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor="name_only" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Eye className="h-4 w-4" />
                                Display Name Only
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Show your name or business name on our Sponsors page.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value="name_website" id="name_website" className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor="name_website" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Eye className="h-4 w-4" />
                                Name + Website Link
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Display your name with a link to your website.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value="name_message" id="name_message" className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor="name_message" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Eye className="h-4 w-4" />
                                Name + Short Message
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Share your name and a brief message or tagline.
                              </p>
                            </div>
                          </div>
                        </RadioGroup>

                        {displayOption !== "anonymous" && (
                          <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="displayName">Display Name *</Label>
                              <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name or business name"
                                required={displayOption !== "anonymous"}
                                maxLength={100}
                              />
                            </div>

                            {displayOption === "name_website" && (
                              <div className="space-y-2">
                                <Label htmlFor="websiteUrl">Website URL</Label>
                                <Input
                                  id="websiteUrl"
                                  type="url"
                                  value={websiteUrl}
                                  onChange={(e) => setWebsiteUrl(e.target.value)}
                                  placeholder="https://yourbusiness.ie"
                                  maxLength={255}
                                />
                              </div>
                            )}

                            {displayOption === "name_message" && (
                              <div className="space-y-2">
                                <Label htmlFor="message">Short Message</Label>
                                <Textarea
                                  id="message"
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  placeholder="A brief message or tagline (e.g., 'Proud to support local communities!')"
                                  rows={3}
                                  maxLength={200}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                  {message.length}/200 characters
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Preferences"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

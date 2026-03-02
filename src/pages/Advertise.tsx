import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  BarChart3, 
  Heart, 
  Users,
  Star,
  Monitor,
  CreditCard,
  List,
  Loader2,
  Settings
} from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { submitToHubSpot, parseFullName } from "@/hooks/useHubSpot";

// Stripe price IDs
const STRIPE_PRICES = {
  advertising: "price_1SturrRnrCLBBVkPwQdZ06uw", // €30/month
  sponsorBronze: "price_1Stus6RnrCLBBVkPnJZR4PD2", // €10/month
  sponsorSilver: "price_1StusJRnrCLBBVkPyi7fKg0p", // €25/month
  sponsorGold: "price_1StusWRnrCLBBVkPL44EKf0d", // €50/month
};

const organisationSchema = z.object({
  organisationName: z.string().trim().min(2, "Organisation name must be at least 2 characters").max(100, "Organisation name must be less than 100 characters"),
  contactName: z.string().trim().min(2, "Contact name must be at least 2 characters").max(100, "Contact name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10, "Please tell us a bit more about your organisation").max(1000, "Message must be less than 1000 characters"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms of Use to proceed" }),
  }),
});

type OrganisationFormData = z.infer<typeof organisationSchema>;

export default function Advertise() {
  const [searchParams] = useSearchParams();
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  // Organisation form state
  const [isOrgSubmitting, setIsOrgSubmitting] = useState(false);
  const [isOrgSubmitted, setIsOrgSubmitted] = useState(false);
  const [orgFormData, setOrgFormData] = useState({
    organisationName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
    termsAccepted: false,
  });
  const [orgErrors, setOrgErrors] = useState<Record<string, string>>({});

  // Check for success/cancel URL params
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Payment Successful!",
        description: "Thank you for your support. We'll be in touch shortly to set up your account.",
      });
    } else if (searchParams.get("canceled") === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. Feel free to try again when you're ready.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const handleCheckout = async (priceId: string, planName: string) => {
    setIsCheckingOut(priceId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          priceId,
          successUrl: `${window.location.origin}/sponsor-success`,
          cancelUrl: `${window.location.origin}/advertise?canceled=true`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        // Try multiple navigation methods for mobile compatibility
        // Some in-app browsers (Facebook, Instagram, LinkedIn) have issues with location.href
        try {
          // Method 1: Try location.replace (works better in some mobile browsers)
          window.location.replace(data.url);
        } catch {
          // Method 2: Fallback to assign
          window.location.assign(data.url);
        }
        
        // Method 3: If still on page after 2 seconds, show manual link
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            toast({
              title: "Opening Stripe Checkout...",
              description: "If the page didn't open, tap here to continue.",
              action: (
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Open Checkout
                </a>
              ),
              duration: 10000,
            });
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "There was an error starting checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(null);
    }
  };

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please log in to manage your subscription.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Portal error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to open subscription portal.";
      toast({
        title: "Portal Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrgFormData((prev) => ({ ...prev, [name]: value }));
    if (orgErrors[name]) {
      setOrgErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOrgCheckboxChange = (checked: boolean) => {
    setOrgFormData((prev) => ({ ...prev, termsAccepted: checked }));
    if (orgErrors.termsAccepted) {
      setOrgErrors((prev) => ({ ...prev, termsAccepted: "" }));
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgErrors({});

    const result = organisationSchema.safeParse(orgFormData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setOrgErrors(fieldErrors);
      return;
    }

    setIsOrgSubmitting(true);

    try {
      // Send email notification
      await supabase.functions.invoke("send-contact-email", {
        body: {
          name: result.data.contactName,
          email: result.data.email,
          subject: `Organisation Sponsorship Enquiry: ${result.data.organisationName}`,
          message: `
Organisation Name: ${result.data.organisationName}
Contact Name: ${result.data.contactName}
Email: ${result.data.email}
Phone: ${result.data.phone || "Not provided"}

Message:
${result.data.message}

Terms Accepted: Yes
          `.trim(),
        },
      });

      // Submit to HubSpot
      const { firstname, lastname } = parseFullName(result.data.contactName);
      submitToHubSpot({
        email: result.data.email,
        firstname,
        lastname,
        phone: result.data.phone || undefined,
        company: result.data.organisationName,
        form_source: 'Organisation Sponsorship Enquiry',
        message: result.data.message,
      });

      setIsOrgSubmitted(true);
      toast({
        title: "Enquiry Submitted",
        description: "Thank you! We'll be in touch to discuss sponsorship options.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrgSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Support Swap-Skills | Sponsorship"
        description="Help keep Swap-Skills free for everyone. Sponsorships cover hosting, development, and in-person community events across Ireland. Posting is always free."
        keywords="swap skills sponsorship, support swap skills, community sponsor Ireland, keep it free, skill swap events"
        url="https://swap-skills.ie/advertise"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <Badge variant="secondary" className="mb-4">
                  <Heart className="h-3 w-3 mr-1" />
                  For Supporters
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                  Help Keep Swap-Skills
                  <br />
                  <span className="text-primary">Free for Everyone</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Swap-Skills is 100% free to use — posting, browsing, and swapping costs nothing. 
                  Sponsorships help us cover hosting, development, and in-person community events across Ireland.
                </p>
              </div>
            </div>
          </section>

          {/* Two Options Overview */}
          <section id="sponsorship" className="py-16">
            <div className="container">
              <div className="max-w-xl mx-auto">

                {/* Sponsorship Card */}
                <Card className="relative border-primary shadow-lg ring-2 ring-primary/20">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      For Supporters
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4">
                      <Heart className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Become a Sponsor</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                      Your contribution helps us keep Swap-Skills completely free, 
                      cover hosting &amp; development costs, and organise in-person skill-swap events across Ireland.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center pb-4 border-b">
                      <div className="text-4xl font-bold text-primary">Choose Your Level</div>
                      <div className="text-muted-foreground">monthly contribution</div>
                      <div className="text-sm text-muted-foreground mt-1">Cancel anytime</div>
                    </div>

                    {/* Clarification banner */}
                    <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Posting on Swap-Skills is always free.</span>{" "}
                        Sponsorships are purely voluntary and help us maintain the platform, advertise Swap-Skills to grow the community, and host events.
                      </p>
                    </div>

                    {/* What your sponsorship funds */}
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Keep the Platform Free</span>
                          <p className="text-sm text-muted-foreground">
                            Covers hosting, development, and running costs so everyone can swap for free
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Grow the Community</span>
                          <p className="text-sm text-muted-foreground">
                            Funds advertising and outreach to bring more neighbours onto the platform
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">In-Person Events</span>
                          <p className="text-sm text-muted-foreground">
                            Helps organise local skill-swap meetups and community events across Ireland
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <List className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Listed in Sponsors Directory</span>
                          <p className="text-sm text-muted-foreground">
                            Your name or business featured on our Sponsors page as a thank-you
                          </p>
                        </div>
                      </li>
                    </ul>

                    {/* Sponsorship Tiers */}
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => handleCheckout(STRIPE_PRICES.sponsorBronze, "Bronze Sponsor")}
                        disabled={isCheckingOut !== null}
                      >
                        <span>🥉 Bronze Sponsor</span>
                        <span className="font-semibold">
                          {isCheckingOut === STRIPE_PRICES.sponsorBronze ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "€10/month"
                          )}
                        </span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => handleCheckout(STRIPE_PRICES.sponsorSilver, "Silver Sponsor")}
                        disabled={isCheckingOut !== null}
                      >
                        <span>🥈 Silver Sponsor</span>
                        <span className="font-semibold">
                          {isCheckingOut === STRIPE_PRICES.sponsorSilver ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "€25/month"
                          )}
                        </span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => handleCheckout(STRIPE_PRICES.sponsorGold, "Gold Sponsor")}
                        disabled={isCheckingOut !== null}
                      >
                        <span>🥇 Gold Sponsor</span>
                        <span className="font-semibold">
                          {isCheckingOut === STRIPE_PRICES.sponsorGold ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "€50/month"
                          )}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Existing Subscriber - Manage Subscription */}
          <section className="py-8 border-b">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <h3 className="font-semibold flex items-center gap-2 justify-center sm:justify-start">
                          <Settings className="h-4 w-4" />
                          Already a subscriber?
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your subscription, update payment methods, or cancel anytime.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleOpenPortal}
                        disabled={isOpeningPortal}
                        className="whitespace-nowrap"
                      >
                        {isOpeningPortal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Opening...
                          </>
                        ) : (
                          "Manage Subscription"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Organisation Enquiry Section */}
          <section id="organisations" className="py-12 bg-secondary/20">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Communities & Organisations</h2>
                  <p className="text-muted-foreground">
                    Are you a community group, council, or larger organisation interested in sponsoring Swap-Skills? 
                    Get in touch to discuss tailored sponsorship options.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Sponsorship Enquiry</CardTitle>
                    <CardDescription className="text-center">
                      Tell us about your organisation and we'll explore partnership opportunities together.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isOrgSubmitted ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                          <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                        <p className="text-muted-foreground mb-4">
                          We've received your enquiry and will be in touch soon to discuss sponsorship options.
                        </p>
                        <Button variant="outline" onClick={() => setIsOrgSubmitted(false)}>
                          Submit Another Enquiry
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleOrgSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="organisationName">Organisation Name *</Label>
                            <Input
                              id="organisationName"
                              name="organisationName"
                              value={orgFormData.organisationName}
                              onChange={handleOrgChange}
                              placeholder="Your Organisation"
                              className={orgErrors.organisationName ? "border-destructive" : ""}
                            />
                            {orgErrors.organisationName && (
                              <p className="text-sm text-destructive">{orgErrors.organisationName}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orgContactName">Contact Name *</Label>
                            <Input
                              id="orgContactName"
                              name="contactName"
                              value={orgFormData.contactName}
                              onChange={handleOrgChange}
                              placeholder="Your Full Name"
                              className={orgErrors.contactName ? "border-destructive" : ""}
                            />
                            {orgErrors.contactName && (
                              <p className="text-sm text-destructive">{orgErrors.contactName}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="orgEmail">Email Address *</Label>
                            <Input
                              id="orgEmail"
                              name="email"
                              type="email"
                              value={orgFormData.email}
                              onChange={handleOrgChange}
                              placeholder="you@organisation.ie"
                              className={orgErrors.email ? "border-destructive" : ""}
                            />
                            {orgErrors.email && (
                              <p className="text-sm text-destructive">{orgErrors.email}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orgPhone">Phone Number</Label>
                            <Input
                              id="orgPhone"
                              name="phone"
                              type="tel"
                              value={orgFormData.phone}
                              onChange={handleOrgChange}
                              placeholder="085 123 4567"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="orgMessage">
                            Tell us about your organisation and sponsorship goals *
                          </Label>
                          <Textarea
                            id="orgMessage"
                            name="message"
                            value={orgFormData.message}
                            onChange={handleOrgChange}
                            placeholder="What type of organisation are you? What are you hoping to achieve through sponsorship? Are there specific communities or areas you'd like to support?"
                            rows={5}
                            className={orgErrors.message ? "border-destructive" : ""}
                          />
                          {orgErrors.message && (
                            <p className="text-sm text-destructive">{orgErrors.message}</p>
                          )}
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="orgTermsAccepted"
                            checked={orgFormData.termsAccepted}
                            onCheckedChange={handleOrgCheckboxChange}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="orgTermsAccepted"
                              className={`text-sm font-normal ${
                                orgErrors.termsAccepted ? "text-destructive" : ""
                              }`}
                            >
                              I agree to the{" "}
                              <Link to="/terms" className="text-primary hover:underline">
                                Terms of Use
                              </Link>{" "}
                              and{" "}
                              <Link to="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                              </Link>
                              *
                            </Label>
                            {orgErrors.termsAccepted && (
                              <p className="text-sm text-destructive">{orgErrors.termsAccepted}</p>
                            )}
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isOrgSubmitting}>
                          {isOrgSubmitting ? "Submitting..." : "Submit Enquiry"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground mb-2">
                    Prefer to reach us directly?
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:hello@swap-skills.com" className="text-primary hover:underline">
                      hello@swap-skills.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

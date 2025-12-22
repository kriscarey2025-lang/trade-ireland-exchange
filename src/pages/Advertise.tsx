import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, CheckCircle2, BarChart3, Shield, Users } from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { submitToHubSpot, parseFullName } from "@/hooks/useHubSpot";

const advertiserSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(100, "Business name must be less than 100 characters"),
  contactName: z.string().trim().min(2, "Contact name must be at least 2 characters").max(100, "Contact name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().optional(),
  location: z.string().trim().min(2, "Location must be at least 2 characters").max(100, "Location must be less than 100 characters"),
  website: z.string().trim().max(255, "Website must be less than 255 characters").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message must be less than 1000 characters").optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms of Use to proceed" }),
  }),
});

type AdvertiserFormData = z.infer<typeof advertiserSchema>;

const benefits = [
  {
    icon: Users,
    title: "Reach Local Customers",
    description: "Connect directly with community members who value supporting local businesses.",
  },
  {
    icon: MapPin,
    title: "Hyper-Local Targeting",
    description: "Your ads are shown to users in your area who are actively seeking local services.",
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description: "Access a dedicated dashboard to monitor impressions, clicks, and engagement.",
  },
  {
    icon: Shield,
    title: "Brand Safe Environment",
    description: "Your ads appear alongside community-focused content in a trusted platform.",
  },
];

export default function Advertise() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    message: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
    if (errors.termsAccepted) {
      setErrors((prev) => ({ ...prev, termsAccepted: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = advertiserSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit via rate-limited edge function
      const { data, error: submitError } = await supabase.functions.invoke("submit-advertiser-interest", {
        body: {
          businessName: result.data.businessName,
          contactName: result.data.contactName,
          email: result.data.email,
          phone: result.data.phone || undefined,
          location: result.data.location,
          website: result.data.website || undefined,
          message: result.data.message || undefined,
        },
      });

      if (submitError) throw submitError;
      
      // Check for rate limiting response
      if (data?.rateLimited) {
        toast({
          title: "Too Many Submissions",
          description: "You've submitted too many requests. Please try again in an hour.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (data?.error) throw new Error(data.error);

      // Notify admins about new advertiser interest
      supabase.functions.invoke("notify-admins-advertiser", {
        body: {
          businessName: result.data.businessName,
          contactName: result.data.contactName,
          email: result.data.email,
          location: result.data.location,
          website: result.data.website || undefined,
          message: result.data.message || undefined,
        },
      }).catch((err) => console.error("Failed to notify admins:", err));

      // Also send email notification (existing)
      await supabase.functions.invoke("send-contact-email", {
        body: {
          name: result.data.contactName,
          email: result.data.email,
          subject: `Advertiser Interest: ${result.data.businessName}`,
          message: `
Business Name: ${result.data.businessName}
Contact Name: ${result.data.contactName}
Email: ${result.data.email}
Phone: ${result.data.phone || "Not provided"}
Location: ${result.data.location}
Website: ${result.data.website || "Not provided"}

Additional Message:
${result.data.message || "No additional message provided"}

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
        company: result.data.businessName,
        city: result.data.location,
        website: result.data.website || undefined,
        form_source: 'Advertiser Interest Form',
        message: result.data.message || undefined,
      });

      setIsSubmitted(true);
      toast({
        title: "Interest Submitted",
        description: "Thank you! We'll review your request and get back to you soon.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Advertise With Us | Local Business Advertising"
        description="Promote your local Irish business on Swap-Skills. Reach community members who value supporting local services and businesses."
        keywords="advertise swap skills, local business advertising Ireland, community advertising"
        url="https://swap-skills.com/advertise"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-display mb-4">
                  Advertise With Swap-Skills
                </h1>
                <p className="text-lg text-muted-foreground">
                  Connect your local business with our growing community of Irish neighbours 
                  who value supporting local services.
                </p>
              </div>
            </div>
          </section>

          {/* Local Business Focus */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          For Local Businesses Only
                        </h2>
                        <p className="text-muted-foreground">
                          Swap-Skills is built around community and local connections. We exclusively 
                          offer advertising space to local Irish businesses that align with our 
                          community values. This ensures our members see relevant, trustworthy 
                          businesses that serve their area.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-12 bg-secondary/20">
            <div className="container">
              <h2 className="text-2xl font-bold text-center mb-8">
                Why Advertise With Us?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Submit Your Interest</h3>
                      <p className="text-muted-foreground text-sm">
                        Complete the form below with your business details. All fields marked 
                        with an asterisk are required.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Internal Review</h3>
                      <p className="text-muted-foreground text-sm">
                        Our team reviews each request to ensure alignment with our community 
                        values and local focus. We'll be in touch within a few business days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Get Your Dashboard</h3>
                      <p className="text-muted-foreground text-sm">
                        Approved businesses receive access to a dedicated advertiser dashboard 
                        where you can upload ads, modify campaigns, and track performance metrics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interest Form */}
          <section className="py-12 bg-secondary/20">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Express Your Interest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                          <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                        <p className="text-muted-foreground mb-4">
                          We've received your interest and will review your request. 
                          You'll hear from us within a few business days.
                        </p>
                        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                          Submit Another Request
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                              id="businessName"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleChange}
                              placeholder="Your Business Name"
                              className={errors.businessName ? "border-destructive" : ""}
                            />
                            {errors.businessName && (
                              <p className="text-sm text-destructive">{errors.businessName}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Name *</Label>
                            <Input
                              id="contactName"
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleChange}
                              placeholder="Your Full Name"
                              className={errors.contactName ? "border-destructive" : ""}
                            />
                            {errors.contactName && (
                              <p className="text-sm text-destructive">{errors.contactName}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="you@business.com"
                              className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && (
                              <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="+353 XX XXX XXXX"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Business Location *</Label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="e.g., Dublin, Cork, Galway"
                              className={errors.location ? "border-destructive" : ""}
                            />
                            {errors.location && (
                              <p className="text-sm text-destructive">{errors.location}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              name="website"
                              type="url"
                              value={formData.website}
                              onChange={handleChange}
                              placeholder="https://yourbusiness.ie"
                              className={errors.website ? "border-destructive" : ""}
                            />
                            {errors.website && (
                              <p className="text-sm text-destructive">{errors.website}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Tell Us About Your Business</Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Briefly describe your business and what you'd like to promote..."
                            rows={4}
                            className={errors.message ? "border-destructive" : ""}
                          />
                          {errors.message && (
                            <p className="text-sm text-destructive">{errors.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="termsAccepted"
                              checked={formData.termsAccepted}
                              onCheckedChange={handleCheckboxChange}
                              className={errors.termsAccepted ? "border-destructive" : ""}
                            />
                            <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
                              I have read and agree to the Swap-Skills{" "}
                              <Link to="/terms" className="text-primary hover:underline">
                                Terms of Use
                              </Link>{" "}
                              and{" "}
                              <Link to="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                              </Link>
                              . I understand that advertising requests are subject to review and approval. *
                            </Label>
                          </div>
                          {errors.termsAccepted && (
                            <p className="text-sm text-destructive">{errors.termsAccepted}</p>
                          )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit Interest"}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          By submitting this form, you consent to us contacting you regarding 
                          your advertising enquiry.
                        </p>
                      </form>
                    )}
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

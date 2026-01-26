import { useState } from "react";
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
  Smartphone,
  CreditCard,
  List
} from "lucide-react";
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
        title="For Business | Sponsorship & Advertising"
        description="Support Swap-Skills and get visibility for your local Irish business. Advertise to local users or become a sponsor to support the community."
        keywords="swap skills sponsorship, local business Ireland, community supporter, ethical advertising, advertise swap skills"
        url="https://swap-skills.com/advertise"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <Badge variant="secondary" className="mb-4">
                  <Star className="h-3 w-3 mr-1" />
                  For Local Businesses
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                  Support Your Community,
                  <br />
                  <span className="text-primary">Grow Your Business</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Choose from advertising to reach local customers or sponsorship to support 
                  Swap-Skills and get listed in our Sponsors Directory.
                </p>
              </div>
            </div>
          </section>

          {/* Two Options Overview */}
          <section id="sponsorship" className="py-16">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                
                {/* Package A: Advertise with us */}
                <Card className="relative border-primary shadow-lg ring-2 ring-primary/20">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      For Businesses
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Advertise with Us</CardTitle>
                    <CardDescription>
                      Get your business in front of local customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center pb-4 border-b">
                      <div className="text-4xl font-bold text-primary">€30</div>
                      <div className="text-muted-foreground">per month</div>
                      <div className="text-sm text-muted-foreground mt-1">Cancel anytime</div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Monitor className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Website & Mobile App Placement</span>
                          <p className="text-sm text-muted-foreground">
                            Your ad displayed to users browsing our website and mobile app
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Shown to Local Users</span>
                          <p className="text-sm text-muted-foreground">
                            Reach people in your area who are actively seeking local services
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Your Own Dashboard</span>
                          <p className="text-sm text-muted-foreground">
                            Manage your ad and track clicks, impressions, and traffic to your page
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Simple Fixed Price</span>
                          <p className="text-sm text-muted-foreground">
                            No hidden fees, no bidding - just €30/month flat rate
                          </p>
                        </div>
                      </li>
                    </ul>

                    {/* CTA */}
                    <Button asChild className="w-full" size="lg">
                      <a href="#contact-form">Get Started</a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Package B: Sponsorship */}
                <Card className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary">
                      For Supporters
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4">
                      <Heart className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Sponsorship</CardTitle>
                    <CardDescription>
                      Support the community without advertising
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center pb-4 border-b">
                      <div className="text-4xl font-bold text-primary">You Choose</div>
                      <div className="text-muted-foreground">your monthly amount</div>
                      <div className="text-sm text-muted-foreground mt-1">Cancel anytime</div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Support Swap-Skills</span>
                          <p className="text-sm text-muted-foreground">
                            Help keep the platform free and accessible for everyone in the community
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
                            Your name or business featured on our Sponsors page with appreciation
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">No Advertising</span>
                          <p className="text-sm text-muted-foreground">
                            Pure community support - no ads, no tracking, just goodwill
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Flexible Contributions</span>
                          <p className="text-sm text-muted-foreground">
                            Give what you can - every contribution helps the community
                          </p>
                        </div>
                      </li>
                    </ul>

                    {/* CTA */}
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <a href="#contact-form">Become a Sponsor</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Interest Form */}
          <section id="contact-form" className="py-12 bg-secondary/20">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Express Your Interest</CardTitle>
                    <CardDescription className="text-center">
                      Whether you're interested in advertising or sponsorship, fill out the form below 
                      and we'll get back to you within a few business days.
                    </CardDescription>
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
                              placeholder="you@business.ie"
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
                              placeholder="085 123 4567"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="e.g. Dublin, Cork, Galway"
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
                              value={formData.website}
                              onChange={handleChange}
                              placeholder="https://yourbusiness.ie"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">
                            Tell us which option interests you (Advertising or Sponsorship)
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Are you interested in advertising (€30/month) or sponsorship? Tell us a bit about your business..."
                            rows={4}
                          />
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="termsAccepted"
                            checked={formData.termsAccepted}
                            onCheckedChange={handleCheckboxChange}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="termsAccepted"
                              className={`text-sm font-normal ${
                                errors.termsAccepted ? "text-destructive" : ""
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
                            {errors.termsAccepted && (
                              <p className="text-sm text-destructive">{errors.termsAccepted}</p>
                            )}
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit Interest"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Organisation Enquiry Section */}
          <section id="organisations" className="py-12">
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

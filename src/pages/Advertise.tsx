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
  Shield, 
  Users, 
  Heart, 
  Trophy, 
  XCircle, 
  Sparkles,
  Star
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

interface PackageFeature {
  text: string;
  included: boolean;
}

interface SponsorPackage {
  name: string;
  icon: React.ElementType;
  bestFor: string;
  examples: string;
  price: {
    monthly?: string;
    yearly: string;
  };
  features: PackageFeature[];
  ethicalFraming: string;
  highlight?: boolean;
  badge?: string;
}

const packages: SponsorPackage[] = [
  {
    name: "Community Supporter",
    icon: Heart,
    bestFor: "Small local businesses, sole traders, clinics, cafés",
    examples: "Local cafés, therapists, tutors, craftspeople",
    price: {
      monthly: "€25–€40",
      yearly: "€250",
    },
    features: [
      { text: "Logo + short description on Local Supporters page", included: true },
      { text: '"Proud Supporter of Swap-Skills" badge', included: true },
      { text: "Mention in 1 community social post per month", included: true },
      { text: 'Listed under "Local Businesses Supporting Community Exchange"', included: true },
      { text: "Does NOT affect search results", included: false },
      { text: "Does NOT push ads into user feeds", included: false },
      { text: "Does NOT influence trades", included: false },
    ],
    ethicalFraming: "Your support helps keep Swap-Skills free for the community.",
  },
  {
    name: "Local Partner",
    icon: Building2,
    bestFor: "Established businesses wanting visibility and goodwill",
    examples: "Gyms, vets, salons, accountants, cafés, trades",
    price: {
      monthly: "€60–€90",
      yearly: "€600–€900",
    },
    features: [
      { text: "Everything in Community Supporter, plus:", included: true },
      { text: "Featured business profile page", included: true },
      { text: "Tagged mention in 2 community posts per month", included: true },
      { text: "Highlighted on town landing page (below user listings)", included: true },
      { text: '"Community Partner" label on profile', included: true },
      { text: "Clearly marked as sponsored", included: true },
      { text: "Never appears inside trade listings", included: false },
      { text: "No prioritisation of user offers", included: false },
    ],
    ethicalFraming: "Local Partners help fund moderation, safety, and platform improvements.",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Town Champion",
    icon: Trophy,
    bestFor: "Anchor businesses, councils, chambers, regional sponsors",
    examples: "Car dealerships, shopping centres, councils, regional brands",
    price: {
      yearly: "€1,200–€2,000",
    },
    features: [
      { text: "Everything above, plus:", included: true },
      { text: '"Supported by [Your Business]" on Town Hub page', included: true },
      { text: "Quarterly community spotlight post", included: true },
      { text: 'Optional co-branded community initiative (e.g. "Free Skills Week")', included: true },
      { text: "First option to renew before new sponsors", included: true },
      { text: "Feels civic, not commercial", included: true },
    ],
    ethicalFraming: "Town Champions help keep Swap-Skills independent, local, and accessible.",
  },
];

const ethicalPrinciples = [
  {
    icon: Shield,
    title: "No Pay-to-Win",
    description: "Sponsors never get priority in search results or trade listings.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "All sponsorship revenue goes directly to platform improvements and safety.",
  },
  {
    icon: MapPin,
    title: "Locally Focused",
    description: "We only work with genuine local businesses that serve the community.",
  },
  {
    icon: Sparkles,
    title: "Transparent",
    description: "All sponsored content is clearly marked so users always know what's what.",
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
        title="For Business | Sponsorship & Advertising"
        description="Support Swap-Skills and get visibility for your local Irish business. Ethical sponsorship packages and advertising options for community-focused businesses."
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
                  Our sponsorship packages are designed to give local businesses visibility 
                  while keeping Swap-Skills free, fair, and community-focused. No intrusive ads. 
                  No pay-to-win. Just genuine support.
                </p>
              </div>
            </div>
          </section>

          {/* Ethical Principles */}
          <section className="py-12 border-b">
            <div className="container">
              <h2 className="text-2xl font-bold text-center mb-8">Our Ethical Commitment</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {ethicalPrinciples.map((principle, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                      <principle.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground">{principle.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sponsorship Packages */}
          <section id="sponsorship" className="py-16">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Sponsorship Packages</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Choose the package that fits your business. All packages support the community 
                  and help keep Swap-Skills running for everyone.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {packages.map((pkg, index) => (
                  <Card 
                    key={index} 
                    className={`relative flex flex-col ${
                      pkg.highlight 
                        ? "border-primary shadow-lg ring-2 ring-primary/20" 
                        : ""
                    }`}
                  >
                    {pkg.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          {pkg.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4">
                        <pkg.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {pkg.bestFor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Pricing */}
                      <div className="text-center mb-6 pb-6 border-b">
                        {pkg.price.monthly ? (
                          <>
                            <div className="text-3xl font-bold text-primary">
                              {pkg.price.monthly}
                            </div>
                            <div className="text-sm text-muted-foreground">per month</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              or <span className="font-medium">{pkg.price.yearly}</span> per year
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-primary">
                              {pkg.price.yearly}
                            </div>
                            <div className="text-sm text-muted-foreground">per year</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              (No monthly option - intentionally meaningful)
                            </div>
                          </>
                        )}
                      </div>

                      {/* Examples */}
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Examples:</span> {pkg.examples}
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 flex-1">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            {feature.included ? (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${!feature.included ? "text-muted-foreground" : ""}`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Ethical Framing */}
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-sm text-center italic text-muted-foreground">
                          "{pkg.ethicalFraming}"
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="mt-6">
                        <Button 
                          asChild 
                          className="w-full" 
                          variant={pkg.highlight ? "default" : "outline"}
                        >
                          <a href="#contact-form">
                            Get Started
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Why This Works */}
          <section className="py-16 bg-secondary/20">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Why This Works</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <h3 className="font-semibold mb-2">Low Barrier</h3>
                      <p className="text-sm text-muted-foreground">
                        Affordable entry points mean any local business can participate and support their community.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <h3 className="font-semibold mb-2">Reputation Boost</h3>
                      <p className="text-sm text-muted-foreground">
                        Being associated with community support builds trust and goodwill with local customers.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <h3 className="font-semibold mb-2">Feels Like Patronage</h3>
                      <p className="text-sm text-muted-foreground">
                        It's about supporting the community, not aggressive advertising. Users appreciate the difference.
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
                Why Partner With Us?
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
                      <h3 className="font-semibold">Get Started</h3>
                      <p className="text-muted-foreground text-sm">
                        Approved businesses will be onboarded with their chosen sponsorship package
                        and can start building their community presence.
                      </p>
                    </div>
                  </div>
                </div>
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
                      Whether you're interested in sponsorship or advertising, fill out the form below 
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
                            Tell us about your business and which package interests you
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="What does your business offer? Which sponsorship package are you interested in?"
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
                  <p className="text-sm mt-1">
                    <strong>Phone:</strong>{" "}
                    <a href="tel:+353851234567" className="text-primary hover:underline">
                      +353 85 123 4567
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

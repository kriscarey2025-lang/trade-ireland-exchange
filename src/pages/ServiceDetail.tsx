import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { ServiceJsonLd, BreadcrumbJsonLd, LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Coins, 
  Calendar,
  MessageCircle,
  Share2,
  Heart,
  Loader2,
  User,
  Mail,
  Repeat,
  Pencil,
  Trash2,
  Linkedin,
  Facebook,
  Instagram
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ContactDialog } from "@/components/messaging/ContactDialog";
import { formatDisplayName } from "@/lib/utils";
import { UserRatingBadge } from "@/components/reviews/UserRatingBadge";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { ReportServiceDialog } from "@/components/reports/ReportServiceDialog";
import { InterestButton } from "@/components/services/InterestButton";

// Response from secure database function
interface SecureServiceDetail {
  id: string;
  user_id: string | null; // null for unauthenticated users
  title: string;
  description: string | null;
  category: string;
  type: string | null;
  price: number | null;
  price_type: string | null;
  location: string | null;
  images: string[] | null;
  status: string | null;
  accepted_categories: string[] | null;
  created_at: string;
  updated_at: string;
  provider_name: string | null;
  provider_avatar: string | null;
  provider_bio: string | null;
  provider_location: string | null;
  provider_linkedin: string | null;
  provider_facebook: string | null;
  provider_instagram: string | null;
  provider_verification_status: string | null;
  provider_is_founder: boolean | null;
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID is required");

      // Use secure RPC function that conditionally exposes user_id
      const { data, error } = await supabase.rpc("get_service_by_id", {
        _service_id: id,
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Service not found");

      return data[0] as SecureServiceDetail;
    },
    enabled: !!id,
  });

  const handleContact = () => {
    if (!user) {
      toast.error("Please sign in to contact the provider");
      navigate('/auth');
      return;
    }

    if (user.id === service?.user_id) {
      toast.info("This is your own service");
      return;
    }

    setContactOpen(true);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: service?.title,
        text: service?.description || "",
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    if (!user || !service) return;
    
    setIsDeleting(true);
    
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete. Please try again.");
      setIsDeleting(false);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["user-services"] });
    
    toast.success("Service deleted successfully");
    navigate("/browse");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number | null, priceType: string | null) => {
    if (!price) return "Negotiable";
    const formatted = `€${price.toFixed(2)}`;
    if (priceType === "hourly") return `${formatted}/hour`;
    return formatted;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This service may have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate('/browse')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === service.user_id;

  const serviceUrl = `https://swap-skills.com/services/${service.id}`;
  
  // Use actual service image if available, otherwise use default OG image
  // Note: Dynamic SVG OG images aren't supported by Facebook - they require PNG/JPG
  const ogImage = service.images?.[0] || `https://swap-skills.com/og-image.png`;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={service.title}
        description={service.description 
          ? service.description.slice(0, 150) + (service.description.length > 150 ? "..." : "")
          : `${service.type === "skill_swap" ? "Skill swap" : service.type === "free_offer" ? "Free offer" : "Looking for"}: ${categoryLabels[service.category as ServiceCategory]} in ${service.location || "Ireland"} - Trade skills, not money!`}
        url={serviceUrl}
        type="article"
        image={ogImage}
        keywords={`skill swap, ${categoryLabels[service.category as ServiceCategory]}, ${service.location || "Ireland"}, trade services, barter`}
      />
      <ServiceJsonLd
        name={service.title}
        description={service.description || ""}
        provider={service.provider_name || undefined}
        location={service.location || undefined}
        price={service.price ? Number(service.price) : undefined}
        priceType={service.price_type || undefined}
        category={categoryLabels[service.category as ServiceCategory]}
        url={serviceUrl}
        image={service.images?.[0]}
        datePosted={service.created_at}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://swap-skills.com" },
          { name: "Browse Services", url: "https://swap-skills.com/browse" },
          { name: service.title, url: serviceUrl },
        ]}
      />
      {service.provider_verification_status === "verified" && service.provider_name && (
        <LocalBusinessJsonLd
          name={service.provider_name}
          description={service.provider_bio || undefined}
          location={service.provider_location || service.location || undefined}
          url={serviceUrl}
          image={service.provider_avatar || undefined}
        />
      )}
      <Header />
      <main className="flex-1 bg-secondary/20">
        <div className="container py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Header */}
              <Card className="shadow-elevated border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge 
                      variant={service.type === "request" ? "accent" : "default"} 
                      className="rounded-lg"
                    >
                      {service.type === "request" ? "🔍 Looking for" : "✨ Offering"}
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg">
                      {categoryIcons[service.category as ServiceCategory]} {categoryLabels[service.category as ServiceCategory]}
                    </Badge>
                    {service.status === "active" && (
                      <Badge variant="outline" className="rounded-lg bg-success/10 text-success border-success/20">
                        Active
                      </Badge>
                    )}
                    {isOwner && (
                      <Badge variant="outline" className="rounded-lg">
                        Your {service.type === "request" ? "Request" : "Service"}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold mb-4">
                    {service.title}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {service.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {service.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Posted {formatDate(service.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              {service.images && service.images.length > 0 && (
                <Card className="shadow-elevated border-border/50 overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Photos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {service.images.map((url, index) => (
                        <div 
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden border border-border"
                        >
                          <img
                            src={url}
                            alt={`${service.title} - Photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card className="shadow-elevated border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {service.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="shadow-elevated border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {formatPrice(service.price ? Number(service.price) : null, service.price_type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.price_type === "negotiable" || !service.price
                          ? "Open to trades and negotiations"
                          : service.price_type === "hourly"
                          ? "Hourly rate"
                          : "Fixed price"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accepts in Return */}
              {service.accepted_categories && service.accepted_categories.length > 0 && (
                <Card className="shadow-elevated border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Repeat className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">
                        {service.type === "request" ? "Can Offer in Return" : "Accepts in Return"}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.type === "request" 
                        ? "This person can offer these services as a trade:"
                        : "The provider is open to trading for these services:"
                      }
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {/* Show specific categories */}
                      {service.accepted_categories
                        .filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_")
                        .map((cat) => (
                          <Badge key={cat} variant="secondary" className="rounded-lg">
                            {categoryIcons[cat as ServiceCategory]} {categoryLabels[cat as ServiceCategory]}
                          </Badge>
                        ))}
                      {/* Show custom categories */}
                      {service.accepted_categories
                        .filter(cat => cat.startsWith("custom:"))
                        .map((cat) => (
                          <Badge key={cat} variant="outline" className="rounded-lg">
                            📋 {cat.replace("custom:", "")}
                          </Badge>
                        ))}
                      {/* Always show "Open to all" if selected */}
                      {service.accepted_categories.includes("_open_to_all_") && (
                        <Badge variant="accent" className="rounded-lg px-4 py-2">
                          ✨ Open to all offers
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Provider Card */}
              <Card className="shadow-elevated border-border/50 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Service Provider</h2>
                  
                  {/* Show provider info only for authenticated users */}
                  {service.provider_name ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                          <AvatarImage src={service.provider_avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {getInitials(service.provider_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-lg">
                              {formatDisplayName(service.provider_name)}
                            </p>
                            <VerifiedBadge 
                              status={(service.provider_verification_status as "verified" | "pending" | "unverified" | "rejected") || "unverified"} 
                              size="md" 
                            />
                            {service.provider_is_founder && <FoundersBadge size="sm" />}
                          </div>
                          {service.user_id && (
                            <UserRatingBadge userId={service.user_id} size="sm" />
                          )}
                          {service.provider_location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {service.provider_location}
                            </p>
                          )}
                        </div>
                      </div>

                      {service.provider_bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {service.provider_bio}
                        </p>
                      )}

                      {/* Social Links */}
                      {(service.provider_linkedin || service.provider_facebook || service.provider_instagram) && (
                        <div className="flex items-center gap-2 mb-4">
                          {service.provider_linkedin && (
                            <a 
                              href={service.provider_linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                              title="LinkedIn"
                            >
                              <Linkedin className="h-4 w-4 text-muted-foreground" />
                            </a>
                          )}
                          {service.provider_facebook && (
                            <a 
                              href={service.provider_facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                              title="Facebook"
                            >
                              <Facebook className="h-4 w-4 text-muted-foreground" />
                            </a>
                          )}
                          {service.provider_instagram && (
                            <a 
                              href={service.provider_instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                              title="Instagram"
                            >
                              <Instagram className="h-4 w-4 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign in to see provider details
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                        Sign In
                      </Button>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Actions */}
                  <div className="space-y-3">
                    {!isOwner ? (
                      <>
                        <Button
                          variant="hero"
                          className="w-full"
                          onClick={handleContact}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Provider
                        </Button>
                        <InterestButton 
                          serviceId={service.id} 
                          ownerId={service.user_id}
                          className="w-full"
                        />
                      </>
                    
                    ) : (
                      <>
                        <Button
                          variant="hero"
                          className="w-full"
                          asChild
                        >
                          <Link to={`/services/${service.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit {service.type === "request" ? "Request" : "Service"}
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-full"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this {service.type === "request" ? "request" : "service"}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your {service.type === "request" ? "request" : "service"} and remove it from the marketplace.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => toast.success("Saved to favorites!")}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>

                    {/* Report button - only show if not owner and user is logged in */}
                    {!isOwner && user && service.user_id && (
                      <div className="pt-2 border-t border-border">
                        <ReportServiceDialog
                          serviceId={service.id}
                          serviceTitle={service.title}
                          serviceOwnerId={service.user_id}
                        />
                      </div>
                    )}

                    <Disclaimer variant="full" className="mt-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {service && service.user_id && (
        <ContactDialog
          open={contactOpen}
          onOpenChange={setContactOpen}
          serviceId={service.id}
          serviceTitle={service.title}
          providerId={service.user_id}
          providerName={formatDisplayName(service.provider_name)}
        />
      )}
    </div>
  );
}

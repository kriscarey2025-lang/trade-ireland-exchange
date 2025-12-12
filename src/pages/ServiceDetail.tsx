import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface ServiceDetail {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  price: number | null;
  price_type: string | null;
  location: string | null;
  images: string[] | null;
  status: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    created_at: string;
  } | null;
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID is required");

      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            bio,
            location,
            created_at
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Service not found");

      return data as ServiceDetail;
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

    // For now, show a toast - messaging can be added later
    toast.success("Contact feature coming soon!", {
      description: "We'll notify the provider of your interest.",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: service?.title,
        text: service?.description || "",
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
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

  return (
    <div className="min-h-screen flex flex-col">
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
                    <Badge variant="default" className="rounded-lg">
                      {categoryIcons[service.category as ServiceCategory]} {categoryLabels[service.category as ServiceCategory]}
                    </Badge>
                    {service.status === "active" && (
                      <Badge variant="secondary" className="rounded-lg bg-success/10 text-success">
                        Active
                      </Badge>
                    )}
                    {isOwner && (
                      <Badge variant="outline" className="rounded-lg">
                        Your Service
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Provider Card */}
              <Card className="shadow-elevated border-border/50 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Service Provider</h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                      <AvatarImage src={service.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {getInitials(service.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">
                        {service.profiles?.full_name || "Anonymous"}
                      </p>
                      {service.profiles?.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {service.profiles.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {service.profiles?.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {service.profiles.bio}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mb-4">
                    Member since {service.profiles?.created_at ? formatDate(service.profiles.created_at) : "—"}
                  </p>

                  <Separator className="my-4" />

                  {/* Actions */}
                  <div className="space-y-3">
                    {!isOwner ? (
                      <Button
                        variant="hero"
                        className="w-full"
                        onClick={handleContact}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Provider
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link to="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Edit in Profile
                        </Link>
                      </Button>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

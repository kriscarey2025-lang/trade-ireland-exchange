import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { UserRatingBadge } from "@/components/reviews/UserRatingBadge";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ServiceCard } from "@/components/services/ServiceCard";
import { useQuery } from "@tanstack/react-query";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  verification_status: VerificationStatus;
  is_founder: boolean | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  location: string | null;
  images: string[] | null;
  provider_name: string | null;
  provider_avatar: string | null;
  provider_verification_status: string | null;
  provider_is_founder: boolean | null;
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  // Fetch public profile using the RPC function
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: async () => {
      if (!id) throw new Error("No profile ID provided");
      
      const { data, error } = await supabase
        .rpc('get_basic_profile', { _profile_id: id });
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      // Get verification status and founder status separately
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('verification_status, is_founder')
        .eq('id', id)
        .maybeSingle();
      
      return {
        ...data[0],
        verification_status: (fullProfile?.verification_status as VerificationStatus) || 'unverified',
        is_founder: fullProfile?.is_founder || false,
      } as PublicProfile;
    },
    enabled: !!id && !authLoading,
  });

  // Fetch user's services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['user-services', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .rpc('get_public_services', { _status: 'active' });
      
      if (error) throw error;
      
      // Filter to only this user's services
      return (data || []).filter((s: any) => s.user_id === id) as Service[];
    },
    enabled: !!id && !authLoading,
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <main className="container py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-elevated border-border/50">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Sign in to view profiles</h2>
                <p className="text-muted-foreground mb-6">
                  Create an account or sign in to view member profiles and connect with them.
                </p>
                <Button asChild className="rounded-xl">
                  <Link to="/auth">Sign In / Sign Up</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <main className="container py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-elevated border-border/50">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
                <p className="text-muted-foreground mb-6">
                  This profile doesn't exist or may have been removed.
                </p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/browse">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Browse Services
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // If viewing own profile, redirect hint
  if (user.id === id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <main className="container py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-elevated border-border/50">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">This is your profile!</h2>
                <p className="text-muted-foreground mb-6">
                  You're viewing your own profile. Go to your profile page to edit it.
                </p>
                <Button asChild className="rounded-xl">
                  <Link to="/profile">Go to My Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back button */}
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </Button>

          {/* Profile Header Card */}
          <Card className="shadow-elevated border-border/50 overflow-hidden">
            <div className="h-24 bg-gradient-hero" />
            <CardHeader className="relative pb-4">
              <div className="absolute -top-12 left-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-14">
                <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                  {profile.full_name || "SwapSkills Member"}
                  <VerifiedBadge status={profile.verification_status} size="md" />
                  {profile.is_founder && <FoundersBadge size="md" />}
                </CardTitle>
                {profile.location && (
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </CardDescription>
                )}
                <div className="mt-2">
                  <UserRatingBadge userId={id!} />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Bio Card */}
          {profile.bio && (
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* User's Services */}
          {!servicesLoading && services && services.length > 0 && (
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Skills Offered</CardTitle>
                <CardDescription>
                  Services this member can offer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={{
                        id: service.id,
                        title: service.title,
                        description: service.description || "",
                        category: service.category as any,
                        type: service.type as any,
                        location: service.location || "Ireland",
                        user: service.provider_name ? {
                          name: service.provider_name,
                          avatar: service.provider_avatar || undefined,
                          rating: null,
                          completedTrades: 0,
                          verificationStatus: (service.provider_verification_status as any) || "unverified",
                          isFounder: service.provider_is_founder || false,
                        } : undefined,
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card className="shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Reviews</CardTitle>
              <CardDescription>
                What others say about this member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewsList userId={id!} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

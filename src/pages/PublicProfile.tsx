import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, ArrowLeft, User, Calendar, RefreshCw, FileText, Star, Sparkles, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ProfileContactDialog } from "@/components/messaging/ProfileContactDialog";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { categoryLabels } from "@/lib/categories";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  verification_status: VerificationStatus;
  is_founder: boolean | null;
  created_at: string;
}

interface UserStats {
  activePosts: number;
  closedPosts: number;
  totalSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
  reviewCount: number;
  avgRating: number | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  location: string | null;
  images: string[] | null;
  status: string;
  provider_name: string | null;
  provider_avatar: string | null;
  provider_verification_status: string | null;
  provider_is_founder: boolean | null;
}

// Format name as "First Name + Last Initial"
function formatDisplayName(fullName: string | null): string {
  if (!fullName) return "SwapSkills Member";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

// Get skill label from category key
function getSkillLabel(skillKey: string): string {
  const label = categoryLabels[skillKey as keyof typeof categoryLabels];
  return label || skillKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Fetch public profile using the RPC function
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: async () => {
      if (!id) throw new Error("No profile ID provided");
      
      const { data, error } = await supabase
        .rpc('get_basic_profile', { _profile_id: id });
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      // Get verification status, founder status, and created_at
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('verification_status, is_founder, created_at')
        .eq('id', id)
        .maybeSingle();
      
      return {
        ...data[0],
        verification_status: (fullProfile?.verification_status as VerificationStatus) || 'unverified',
        is_founder: fullProfile?.is_founder || false,
        created_at: fullProfile?.created_at || new Date().toISOString(),
      } as PublicProfile;
    },
    enabled: !!id && !authLoading,
  });

  // Fetch user's stats (skills, posts, swaps, rating)
  const { data: stats } = useQuery({
    queryKey: ['user-stats', id],
    queryFn: async (): Promise<UserStats> => {
      if (!id) return { activePosts: 0, closedPosts: 0, totalSwaps: 0, skillsOffered: [], skillsWanted: [], reviewCount: 0, avgRating: null };
      
      // Fetch user preferences for skills
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('skills_offered, skills_wanted')
        .eq('user_id', id)
        .maybeSingle();
      
      // Fetch services for post counts and swap count
      const { data: services } = await supabase
        .rpc('get_public_services', {});
      
      const userServices = (services || []).filter((s: any) => s.user_id === id);
      const activePosts = userServices.filter((s: any) => s.status === 'active').length;
      const closedPosts = userServices.filter((s: any) => s.status !== 'active').length;
      const totalSwaps = userServices.reduce((sum: number, s: any) => sum + (s.completed_swaps_count || 0), 0);
      
      // Fetch review count and average rating
      const { data: ratings } = await supabase
        .rpc("get_user_ratings", { _user_id: id });
      
      const ratingData = ratings?.[0] || null;
      
      return {
        activePosts,
        closedPosts,
        totalSwaps,
        skillsOffered: prefs?.skills_offered || [],
        skillsWanted: prefs?.skills_wanted || [],
        reviewCount: ratingData?.total_reviews || 0,
        avgRating: ratingData?.avg_user_rating || null,
      };
    },
    enabled: !!id && !authLoading && !!user,
  });

  // Fetch user's services (both active and closed)
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['user-services', id],
    queryFn: async () => {
      if (!id) return { active: [], closed: [] };
      
      const { data, error } = await supabase
        .rpc('get_public_services', {});
      
      if (error) throw error;
      
      // Filter to only this user's services
      const userServices = (data || []).filter((s: any) => s.user_id === id) as Service[];
      
      return {
        active: userServices.filter(s => s.status === 'active'),
        closed: userServices.filter(s => s.status !== 'active'),
      };
    },
    enabled: !!id && !authLoading && !!user,
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Wait for auth to fully load before making any decisions
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only show sign-in prompt if auth is fully loaded AND user is null
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

  // Show loading state for profile data after auth is confirmed
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const displayName = formatDisplayName(profile.full_name);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
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
              <div className="pt-14 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                    {displayName}
                    <VerifiedBadge status={profile.verification_status} size="md" />
                    {profile.is_founder && <FoundersBadge size="md" />}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Member since {format(new Date(profile.created_at), 'MMM yyyy')}
                    </span>
                  </div>
                  {/* Rating display */}
                  {stats?.avgRating && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{stats.avgRating}</span>
                      <span className="text-muted-foreground">
                        ({stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
                {/* Contact Button */}
                <Button 
                  onClick={() => setShowContactDialog(true)}
                  className="rounded-xl shrink-0"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 mx-auto mb-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold flex items-center justify-center gap-1">
                  {stats?.avgRating ? (
                    <>
                      {stats.avgRating}
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </>
                  ) : (
                    <span className="text-muted-foreground text-base">No ratings</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{stats?.reviewCount || 0} Reviews</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto mb-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{stats?.totalSwaps || 0}</p>
                <p className="text-xs text-muted-foreground">Swaps Completed</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 mx-auto mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.activePosts || 0}</p>
                <p className="text-xs text-muted-foreground">Active Posts</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted mx-auto mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{stats?.closedPosts || 0}</p>
                <p className="text-xs text-muted-foreground">Closed Posts</p>
              </CardContent>
            </Card>
          </div>

          {/* Skills Preferences */}
          {((stats?.skillsOffered && stats.skillsOffered.length > 0) || 
            (stats?.skillsWanted && stats.skillsWanted.length > 0)) && (
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Skill Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.skillsOffered && stats.skillsOffered.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Can Offer:</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.skillsOffered.map((skill) => (
                        <Badge key={skill} variant="secondary" className="rounded-full">
                          {getSkillLabel(skill)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {stats?.skillsWanted && stats.skillsWanted.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Looking For:</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.skillsWanted.map((skill) => (
                        <Badge key={skill} variant="outline" className="rounded-full">
                          {getSkillLabel(skill)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* Active Posts */}
          {!servicesLoading && services?.active && services.active.length > 0 && (
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active Posts
                </CardTitle>
                <CardDescription>
                  Current offerings from {displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {services.active.map((service) => (
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

          {/* Closed Posts */}
          {!servicesLoading && services?.closed && services.closed.length > 0 && (
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Closed Posts
                </CardTitle>
                <CardDescription>
                  Past offerings that are no longer active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 opacity-75">
                  {services.closed.slice(0, 3).map((service) => (
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
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Reviews
              </CardTitle>
              <CardDescription>
                What others say about {displayName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewsList userId={id!} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Contact Dialog */}
      <ProfileContactDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        profileId={id!}
        profileName={displayName}
      />
    </div>
  );
}

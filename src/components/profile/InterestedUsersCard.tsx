import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ExternalLink, Users, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDisplayName } from "@/lib/utils";

interface InterestedUser {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
  service_title: string;
  user_services: {
    id: string;
    title: string;
    category: string;
  }[];
}

interface InterestedUsersCardProps {
  userId: string;
}

export function InterestedUsersCard({ userId }: InterestedUsersCardProps) {
  const navigate = useNavigate();
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterestedUsers() {
      // First get all services owned by this user
      const { data: userServices, error: servicesError } = await supabase
        .from("services")
        .select("id, title")
        .eq("user_id", userId)
        .eq("status", "active");

      if (servicesError || !userServices?.length) {
        setLoading(false);
        return;
      }

      const serviceIds = userServices.map(s => s.id);
      const serviceMap = Object.fromEntries(userServices.map(s => [s.id, s.title]));

      // Get all interests for these services
      const { data: interests, error: interestsError } = await supabase
        .from("interests")
        .select("*")
        .in("service_id", serviceIds)
        .order("created_at", { ascending: false });

      if (interestsError || !interests?.length) {
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(interests.map(i => i.user_id))];

      // Fetch user profiles using the get_basic_profile function for each user
      const profilePromises = userIds.map(async (uid) => {
        const { data } = await supabase.rpc("get_basic_profile", { _profile_id: uid });
        return data?.[0] || null;
      });
      
      const profiles = await Promise.all(profilePromises);
      const profileMap = Object.fromEntries(
        profiles.filter(Boolean).map(p => [p.id, p])
      );

      // Fetch services offered by interested users
      const { data: interestedUserServices } = await supabase
        .from("services")
        .select("id, title, category, user_id")
        .in("user_id", userIds)
        .eq("status", "active");

      const userServicesMap: Record<string, { id: string; title: string; category: string }[]> = {};
      interestedUserServices?.forEach(s => {
        if (!userServicesMap[s.user_id]) {
          userServicesMap[s.user_id] = [];
        }
        userServicesMap[s.user_id].push({ id: s.id, title: s.title, category: s.category });
      });

      // Combine all data
      const enrichedInterests: InterestedUser[] = interests.map(interest => ({
        id: interest.id,
        user_id: interest.user_id,
        service_id: interest.service_id,
        created_at: interest.created_at,
        user_name: profileMap[interest.user_id]?.full_name || null,
        user_avatar: profileMap[interest.user_id]?.avatar_url || null,
        service_title: serviceMap[interest.service_id] || "Unknown Service",
        user_services: userServicesMap[interest.user_id] || [],
      }));

      setInterestedUsers(enrichedInterests);
      setLoading(false);
    }

    fetchInterestedUsers();
  }, [userId]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleStartConversation = async (interestedUserId: string, serviceId: string) => {
    setStartingChat(interestedUserId);
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("service_id", serviceId)
        .or(`and(participant_1.eq.${userId},participant_2.eq.${interestedUserId}),and(participant_1.eq.${interestedUserId},participant_2.eq.${userId})`)
        .maybeSingle();

      if (existing) {
        navigate(`/messages/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: userId,
          participant_2: interestedUserId,
          service_id: serviceId,
        })
        .select("id")
        .single();

      if (error) throw error;
      
      navigate(`/messages/${newConvo.id}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setStartingChat(null);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Interested Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Interested Users
          {interestedUsers.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {interestedUsers.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Users who have expressed interest in your services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interestedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No one has expressed interest yet</p>
            <p className="text-sm mt-1">Share your services to get more visibility!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interestedUsers.map((interest) => (
              <div
                key={interest.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={interest.user_avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(interest.user_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {formatDisplayName(interest.user_name)}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(interest.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Interested in: <span className="font-medium text-foreground">{interest.service_title}</span>
                  </p>
                  {interest.user_services.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">They offer:</p>
                      <div className="flex flex-wrap gap-1">
                        {interest.user_services.slice(0, 3).map((service) => (
                          <Link key={service.id} to={`/service/${service.id}`}>
                            <Badge 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              {service.title}
                            </Badge>
                          </Link>
                        ))}
                        {interest.user_services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{interest.user_services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleStartConversation(interest.user_id, interest.service_id)}
                    disabled={startingChat === interest.user_id}
                  >
                    {startingChat === interest.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Link to={`/service/${interest.service_id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCategory, PostCategory } from "@/types";
import { formatDisplayName } from "@/lib/utils";

// Response from secure database function
interface SecureServiceResponse {
  id: string;
  user_id: string | null;
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
  provider_linkedin: string | null;
  provider_facebook: string | null;
  provider_instagram: string | null;
  provider_verification_status: string | null;
  provider_is_founder: boolean | null;
  completed_swaps_count: number | null;
  is_time_sensitive: boolean | null;
  needed_by_date: string | null;
}

export interface DatabaseService {
  id: string;
  user_id: string;
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
  is_time_sensitive: boolean | null;
  needed_by_date: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ServiceWithUser {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  category: ServiceCategory;
  type: PostCategory;
  images?: string[];
  estimatedHours?: number;
  createdAt: Date;
  location: string;
  status: "active" | "paused" | "completed";
  acceptedCategories?: string[];
  completedSwapsCount?: number;
  isTimeSensitive?: boolean;
  neededByDate?: Date | null;
  user?: {
    id: string | null;
    name: string;
    avatar?: string;
    rating: number | null;
    completedTrades: number;
    verificationStatus: "verified" | "pending" | "unverified";
    linkedinUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    isFounder?: boolean;
  };
}

const mapType = (type: string | null): PostCategory => {
  if (type === "offer") return "skill_swap";
  if (type === "request") return "help_request";
  if (type === "free_offer" || type === "help_request" || type === "skill_swap") {
    return type as PostCategory;
  }
  return "skill_swap";
};

function transformSecureService(service: SecureServiceResponse): ServiceWithUser {
  const completedSwapsCount = service.completed_swaps_count || 0;
  
  return {
    id: service.id,
    userId: service.user_id,
    title: service.title,
    description: service.description || "",
    category: service.category as ServiceCategory,
    type: mapType(service.type),
    images: service.images || undefined,
    createdAt: new Date(service.created_at),
    location: service.location || "Ireland",
    status: (service.status as "active" | "paused" | "completed") || "active",
    acceptedCategories: service.accepted_categories || undefined,
    completedSwapsCount,
    isTimeSensitive: service.is_time_sensitive || false,
    neededByDate: service.needed_by_date ? new Date(service.needed_by_date) : null,
    user: service.provider_name ? {
      id: service.user_id,
      name: formatDisplayName(service.provider_name),
      avatar: service.provider_avatar || undefined,
      rating: null,
      completedTrades: completedSwapsCount,
      verificationStatus: (service.provider_verification_status as "verified" | "pending" | "unverified") || "unverified",
      linkedinUrl: service.provider_linkedin || undefined,
      facebookUrl: service.provider_facebook || undefined,
      instagramUrl: service.provider_instagram || undefined,
      isFounder: service.provider_is_founder || false,
    } : undefined,
  };
}

function transformService(dbService: DatabaseService): ServiceWithUser {
  return {
    id: dbService.id,
    userId: dbService.user_id,
    title: dbService.title,
    description: dbService.description || "",
    category: dbService.category as ServiceCategory,
    type: mapType(dbService.type),
    images: dbService.images || undefined,
    createdAt: new Date(dbService.created_at),
    location: dbService.location || "Ireland",
    status: (dbService.status as "active" | "paused" | "completed") || "active",
    acceptedCategories: dbService.accepted_categories || undefined,
    isTimeSensitive: dbService.is_time_sensitive || false,
    neededByDate: dbService.needed_by_date ? new Date(dbService.needed_by_date) : null,
    user: dbService.profiles ? {
      id: dbService.user_id,
      name: formatDisplayName(dbService.profiles.full_name),
      avatar: dbService.profiles.avatar_url || undefined,
      rating: null,
      completedTrades: 0,
      verificationStatus: "pending",
    } : undefined,
  };
}

interface UseServicesOptions {
  category?: ServiceCategory | "all";
  location?: string;
  search?: string;
  status?: "active" | "paused" | "completed";
}

export function useServices(options: UseServicesOptions = {}) {
  return useQuery({
    queryKey: ["services", options],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_services", {
        _category: options.category && options.category !== "all" ? options.category : null,
        _location: options.location && options.location !== "All Ireland" ? options.location : null,
        _search: options.search || null,
        _status: options.status || "active",
      });

      if (error) {
        throw error;
      }

      const services = (data as SecureServiceResponse[]).map(transformSecureService);
      
      // Fetch ratings for all unique user IDs
      const userIds = [...new Set(services.map(s => s.userId).filter(Boolean))] as string[];
      
      if (userIds.length > 0) {
        const ratingsPromises = userIds.map(userId => 
          supabase.rpc("get_user_ratings", { _user_id: userId })
        );
        
        const ratingsResults = await Promise.all(ratingsPromises);
        
        const ratingsMap = new Map<string, number>();
        ratingsResults.forEach((result, index) => {
          if (result.data && result.data[0] && result.data[0].total_reviews > 0) {
            ratingsMap.set(userIds[index], result.data[0].avg_user_rating);
          }
        });
        
        // Update services with ratings
        services.forEach(service => {
          if (service.user && service.userId && ratingsMap.has(service.userId)) {
            service.user.rating = ratingsMap.get(service.userId) || null;
          }
        });
      }
      
      return services;
    },
  });
}

export function useUserServices(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-services", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data as DatabaseService[]).map(transformService);
    },
    enabled: !!userId,
  });
}

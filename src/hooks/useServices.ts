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
      
      // Fetch ratings and user completed swaps in batch queries
      const userIds = [...new Set(services.map(s => s.userId).filter(Boolean))] as string[];
      
      if (userIds.length > 0) {
        // Use a single query to get all reviews and aggregate on client
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("reviewed_user_id, user_rating")
          .in("reviewed_user_id", userIds);
        
        // Fetch user's total completed swaps (across all conversations, not just per-service)
        const { data: conversationsData } = await supabase
          .from("conversations")
          .select("participant_1, participant_2")
          .eq("swap_status", "completed");
        
        const ratingsMap = new Map<string, { sum: number; count: number }>();
        const userSwapsMap = new Map<string, number>();
        
        if (reviewsData) {
          reviewsData.forEach(review => {
            const existing = ratingsMap.get(review.reviewed_user_id) || { sum: 0, count: 0 };
            ratingsMap.set(review.reviewed_user_id, {
              sum: existing.sum + review.user_rating,
              count: existing.count + 1
            });
          });
        }
        
        // Count completed swaps per user
        if (conversationsData) {
          conversationsData.forEach(conv => {
            if (userIds.includes(conv.participant_1)) {
              userSwapsMap.set(conv.participant_1, (userSwapsMap.get(conv.participant_1) || 0) + 1);
            }
            if (userIds.includes(conv.participant_2)) {
              userSwapsMap.set(conv.participant_2, (userSwapsMap.get(conv.participant_2) || 0) + 1);
            }
          });
        }
        
        // Update services with calculated average ratings and user's total swaps
        services.forEach(service => {
          if (service.user && service.userId) {
            if (ratingsMap.has(service.userId)) {
              const rating = ratingsMap.get(service.userId)!;
              service.user.rating = rating.sum / rating.count;
            }
            // Use user's total completed swaps instead of per-service count
            service.user.completedTrades = userSwapsMap.get(service.userId) || 0;
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

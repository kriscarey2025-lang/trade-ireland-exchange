import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunityPost, PostCategory, PostStatus } from '@/types/community';
import { toast } from 'sonner';

export function useBoardPosts(county?: string | null) {
  return useQuery({
    queryKey: ['community-board-posts', county],
    queryFn: async () => {
      if (county) {
        // Use search function with county filter for latest 20 active posts
        const { data, error } = await supabase.rpc('search_community_posts', {
          _search: null,
          _category: null,
          _county: county,
          _status: 'active',
          _limit: 20,
          _offset: 0,
        });
        if (error) throw error;
        return data as CommunityPost[];
      }
      const { data, error } = await supabase.rpc('get_visible_board_posts');
      if (error) throw error;
      return data as CommunityPost[];
    },
  });
}

interface SearchParams {
  search?: string;
  category?: PostCategory | null;
  county?: string | null;
  status?: PostStatus | null;
  limit?: number;
  offset?: number;
}

export function useSearchPosts(params: SearchParams) {
  return useQuery({
    queryKey: ['community-search-posts', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_community_posts', {
        _search: params.search || null,
        _category: params.category || null,
        _county: params.county || null,
        _status: params.status || null,
        _limit: params.limit || 50,
        _offset: params.offset || 0,
      });
      if (error) throw error;
      return data as (CommunityPost & { total_count: number })[];
    },
    enabled: Boolean(params.search || params.category || params.county || params.status),
  });
}

interface CreatePostData {
  title: string;
  description: string;
  category: PostCategory;
  location?: string;
  county?: string;
  image_url?: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a post');

      // Call moderation function
      let moderationStatus = 'approved';
      let moderationReason: string | null = null;

      try {
        const { data: modResult, error: modError } = await supabase.functions.invoke('moderate-content', {
          body: { title: data.title, description: data.description || '' }
        });

        if (!modError && modResult) {
          if (!modResult.approved) {
            moderationStatus = 'pending_review';
            moderationReason = modResult.reason || 'Flagged for review';
          }
        }
      } catch (err) {
        console.error('Moderation check failed, defaulting to approved:', err);
      }

      const { data: result, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location || null,
          county: data.county || null,
          image_url: data.image_url || null,
          moderation_status: moderationStatus,
          moderation_reason: moderationReason,
        }])
        .select()
        .single();

      if (error) throw error;
      return { result, moderationStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-board-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-search-posts'] });
      if (data.moderationStatus === 'pending_review') {
        toast.info('Your post is being reviewed and will appear shortly.');
      } else {
        toast.success('Post created successfully!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
}

export function useUpdatePostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PostStatus }) => {
      const { error } = await supabase
        .from('community_posts')
        .update({ 
          status,
          archived_at: status === 'archived' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-board-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-search-posts'] });
      toast.success('Post updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-board-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-search-posts'] });
      toast.success('Post deleted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
}

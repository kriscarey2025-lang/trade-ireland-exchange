import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunityPost, PostCategory, PostStatus } from '@/types/community';
import { toast } from 'sonner';

export function useBoardPosts() {
  return useQuery({
    queryKey: ['community-board-posts'],
    queryFn: async () => {
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
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a post');

      const { data: result, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location || null,
          county: data.county || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-board-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-search-posts'] });
      toast.success('Post created successfully!');
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

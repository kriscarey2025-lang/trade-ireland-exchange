import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModerationResult {
  approved: boolean;
  reason: string | null;
  categories: string[];
}

export function useContentModeration() {
  const [isChecking, setIsChecking] = useState(false);

  const checkContent = async (title: string, description: string): Promise<ModerationResult> => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { title, description }
      });

      if (error) {
        console.error('Moderation error:', error);
        // Default to approved on error
        return { approved: true, reason: null, categories: [] };
      }

      return data as ModerationResult;
    } catch (err) {
      console.error('Moderation check failed:', err);
      return { approved: true, reason: null, categories: [] };
    } finally {
      setIsChecking(false);
    }
  };

  return { checkContent, isChecking };
}

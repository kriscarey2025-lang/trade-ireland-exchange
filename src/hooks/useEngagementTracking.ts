import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Check if user is an admin (excluded from tracking)
const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' });
    return data === true;
  } catch {
    return false;
  }
};

// Track service creation (skip admins)
export const trackServiceCreated = async (userId: string, serviceId: string, serviceTitle: string) => {
  try {
    // Check if admin - skip tracking
    const isAdmin = await checkIsAdmin(userId);
    if (isAdmin) return;

    await supabase.from('user_engagement').insert({
      user_id: userId,
      event_type: 'service_created',
      metadata: { service_id: serviceId, title: serviceTitle }
    });
  } catch (error) {
    console.error('Failed to track service creation:', error);
  }
};

// Track contact initiated (conversation started) - skip admins
export const trackContactInitiated = async (userId: string, conversationId: string, providerId: string) => {
  try {
    const isAdmin = await checkIsAdmin(userId);
    if (isAdmin) return;

    await supabase.from('user_engagement').insert({
      user_id: userId,
      event_type: 'contact_initiated',
      metadata: { conversation_id: conversationId, provider_id: providerId }
    });
  } catch (error) {
    console.error('Failed to track contact:', error);
  }
};

// Hook for tracking time spent on pages
export const usePageTimeTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sessionStartRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>(location.pathname);
  const isTrackingRef = useRef(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check admin status once on mount
  useEffect(() => {
    if (user?.id) {
      checkIsAdmin(user.id).then(setIsAdmin);
    }
  }, [user?.id]);

  const recordSession = useCallback(async (path: string, durationSeconds: number) => {
    if (!user?.id || durationSeconds < 5 || isAdmin) return; // Skip admins
    
    try {
      await supabase.from('user_engagement').insert({
        user_id: user.id,
        event_type: 'session',
        page_path: path,
        duration_seconds: Math.round(durationSeconds)
      });
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }, [user?.id, isAdmin]);

  // Track page changes
  useEffect(() => {
    if (!user?.id) return;

    const currentPath = location.pathname;
    
    // If path changed, record the previous session
    if (lastPathRef.current !== currentPath && isTrackingRef.current) {
      const duration = (Date.now() - sessionStartRef.current) / 1000;
      recordSession(lastPathRef.current, duration);
    }

    // Start new session
    sessionStartRef.current = Date.now();
    lastPathRef.current = currentPath;
    isTrackingRef.current = true;
  }, [location.pathname, user?.id, recordSession]);

  // Track on page unload
  useEffect(() => {
    if (!user?.id) return;

    const handleBeforeUnload = () => {
      const duration = (Date.now() - sessionStartRef.current) / 1000;
      if (duration >= 5) {
        // Use sendBeacon for reliable tracking on page exit
        const payload = JSON.stringify({
          user_id: user.id,
          event_type: 'session',
          page_path: lastPathRef.current,
          duration_seconds: Math.round(duration)
        });
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_engagement`,
          new Blob([payload], { type: 'application/json' })
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = (Date.now() - sessionStartRef.current) / 1000;
        recordSession(lastPathRef.current, duration);
        sessionStartRef.current = Date.now(); // Reset for when tab becomes visible again
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, recordSession]);
};

// Hook to get engagement summary for admin dashboard
export const useEngagementSummary = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const fetchSummary = useCallback(async () => {
    if (!targetUserId) return null;
    
    const { data, error } = await supabase
      .rpc('get_user_engagement_summary', { _user_id: targetUserId });
    
    if (error) {
      console.error('Failed to fetch engagement summary:', error);
      return null;
    }
    
    return data?.[0] || null;
  }, [targetUserId]);

  return { fetchSummary };
};

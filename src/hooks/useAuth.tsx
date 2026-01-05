import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { submitToHubSpot, parseFullName } from '@/hooks/useHubSpot';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isBanned: boolean;
  signUp: (email: string, password: string, fullName: string, location: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const initializedRef = useRef(false);
  const ipLoggedRef = useRef(false);
  const welcomeEmailSentRef = useRef(false);

  const checkBanStatus = async (userId: string) => {
    try {
      const { data } = await supabase.rpc('is_user_banned', { _user_id: userId });
      return data === true;
    } catch {
      return false;
    }
  };

  const logIpAndCheckBan = async (currentSession: Session | null) => {
    // Only log IP once per session and only if we have a valid session
    if (ipLoggedRef.current || !currentSession?.access_token) {
      return { ipBanned: false };
    }
    
    try {
      ipLoggedRef.current = true;
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { data, error } = await supabase.functions.invoke('log-ip', {
        body: {}
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        // If session is invalid (401), don't treat as error - just skip IP logging
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('Session invalid for IP logging, skipping');
          return { ipBanned: false };
        }
        console.error('Failed to log IP:', error);
        return { ipBanned: false };
      }
      return { ipBanned: data?.banned === true };
    } catch (e) {
      console.error('IP logging error:', e);
      return { ipBanned: false };
    }
  };

  const handleBanCheck = async (userId: string, currentSession: Session | null, skipIpLog = false) => {
    const banned = await checkBanStatus(userId);
    if (banned) {
      setIsBanned(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setLoading(false);
      return true;
    }
    
    // Only log IP on fresh sign-in, not on initial load with cached session
    if (!skipIpLog) {
      const { ipBanned } = await logIpAndCheckBan(currentSession);
      if (ipBanned) {
        setIsBanned(true);
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
        return true;
      }
    }
    
    setIsBanned(false);
    return false;
  };

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Safety timeout - ensure loading is set to false after 10 seconds max
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Listen for auth changes - handle fresh sign-ins for IP logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Synchronous state updates only
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setIsBanned(false);
          ipLoggedRef.current = false;
          setLoading(false);
        }
        
        // Log IP only on fresh sign-in or token refresh (not initial session)
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !ipLoggedRef.current) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            await logIpAndCheckBan(session);
          }, 100);
        }
      }
    );

    // Get initial session - skip IP logging for cached sessions
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Skip IP logging on initial load - will be done on TOKEN_REFRESHED if session is valid
        const wasBanned = await handleBanCheck(session.user.id, session, true);
        if (wasBanned) {
          clearTimeout(safetyTimeout);
          return;
        }
        
        // Send welcome email for new OAuth users (check if profile was just created)
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at, email, full_name, location')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;
          
          // If profile was created in the last 60 seconds, send welcome email and submit to HubSpot (only once)
          if (diffSeconds < 60 && !welcomeEmailSentRef.current) {
            welcomeEmailSentRef.current = true;
            const userEmail = profile.email || session.user.email || '';
            const userName = profile.full_name || 'there';
            
            // Send welcome email
            try {
              await supabase.functions.invoke('send-welcome-email', {
                body: { 
                  email: userEmail, 
                  fullName: userName 
                }
              });
            } catch (e) {
              console.error('Failed to send welcome email:', e);
            }
            
            // Submit to HubSpot for OAuth users
            if (userEmail) {
              const { firstname, lastname } = parseFullName(userName);
              submitToHubSpot({
                email: userEmail,
                firstname,
                lastname,
                city: profile.location || undefined,
                form_source: 'google_oauth_signup',
              }).catch(e => console.error('Failed to submit to HubSpot:', e));
            }
          }
        }
      }
      
      clearTimeout(safetyTimeout);
      setLoading(false);
    }).catch(() => {
      clearTimeout(safetyTimeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, location: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      // Use rate-limited signup edge function
      const { data, error: invokeError } = await supabase.functions.invoke('rate-limited-signup', {
        body: { email, password, fullName, location, redirectUrl }
      });

      if (invokeError) {
        console.error('Signup invoke error:', invokeError);
        return { error: new Error('Unable to create account. Please try again.') };
      }

      if (data?.error) {
        return { error: new Error(data.error) };
      }

      if (data?.rateLimited) {
        return { error: new Error('Too many signup attempts. Please try again later.') };
      }

      // Sign in the user after successful account creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        // Account was created but sign in failed - still a success
        return { error: null };
      }

      // Send welcome email (only if not already sent)
      if (!welcomeEmailSentRef.current) {
        welcomeEmailSentRef.current = true;
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: { email, fullName }
          });
        } catch (e) {
          console.error('Failed to send welcome email:', e);
        }
      }

      return { error: null };
    } catch (e: any) {
      console.error('Signup error:', e);
      return { error: new Error('Unable to create account. Please try again.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Check if user is banned
    if (data.user) {
      const banned = await checkBanStatus(data.user.id);
      if (banned) {
        await supabase.auth.signOut();
        setIsBanned(true);
        return { error: new Error('Your account has been suspended. Please contact support.') };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    setIsBanned(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isBanned, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

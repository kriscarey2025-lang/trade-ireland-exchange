import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  const checkBanStatus = async (userId: string) => {
    try {
      const { data } = await supabase.rpc('is_user_banned', { _user_id: userId });
      return data === true;
    } catch {
      return false;
    }
  };

  const logIpAndCheckBan = async () => {
    // Only log IP once per session
    if (ipLoggedRef.current) {
      return { ipBanned: false };
    }
    
    try {
      ipLoggedRef.current = true;
      const { data, error } = await supabase.functions.invoke('log-ip');
      if (error) {
        console.error('Failed to log IP:', error);
        return { ipBanned: false };
      }
      return { ipBanned: data?.banned === true };
    } catch (e) {
      console.error('IP logging error:', e);
      return { ipBanned: false };
    }
  };

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const banned = await checkBanStatus(session.user.id);
        if (banned) {
          setIsBanned(true);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        const { ipBanned } = await logIpAndCheckBan();
        if (ipBanned) {
          setIsBanned(true);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
      }
      
      setLoading(false);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only process actual auth events, not initial session
        if (event === 'SIGNED_IN') {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const banned = await checkBanStatus(session.user.id);
            if (banned) {
              setIsBanned(true);
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              return;
            }
            
            const { ipBanned } = await logIpAndCheckBan();
            if (ipBanned) {
              setIsBanned(true);
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              return;
            }
            
            setIsBanned(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsBanned(false);
          ipLoggedRef.current = false;
        } else if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, location: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          location: location,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Update profile with location after signup
    if (!error) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase.from('profiles').update({ location }).eq('id', newUser.id);
      }
    }

    return { error: null };
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

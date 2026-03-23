import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  gender_preference: string | null;
  bio: string;
  avatar_url: string;
  photos: string[];
  interests: string[];
  occupation: string;
  university: string;
  city: string;
  lat: number | null;
  lng: number | null;
  is_verified: boolean;
  is_online: boolean;
  last_active: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userMetadata?: any, retryCount = 0): Promise<any> => {
    try {
      console.log(`Fetching profile for ${userId} (attempt ${retryCount + 1})...`);
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (data) {
        console.log("Profile found:", data);
        setProfile(data);
        return data;
      }

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
      }
      
      // If not found and we have retries left, wait and try again
      // (The database trigger might be running)
      if (retryCount < 3) {
        console.log(`Profile not found, waiting for trigger (retry ${retryCount + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return fetchProfile(userId, userMetadata, retryCount + 1);
      }
      
      // Still not found after retries, try manual insert
      console.log("Profile not found after retries, attempting manual creation with metadata...");
      
      const name = userMetadata?.full_name || userMetadata?.name || "";
      const avatar_url = userMetadata?.avatar_url || userMetadata?.picture || "";
      
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ 
          id: userId,
          name: name,
          avatar_url: avatar_url
        })
        .select()
        .single();
        
      if (newProfile) {
        console.log("Profile created manually:", newProfile);
        setProfile(newProfile);
        return newProfile;
      } else {
        console.warn("Manual creation failed (likely missing RLS INSERT policy):", insertError);
      }
    } catch (err) {
      console.error("fetchProfile critical error:", err);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id, user.user_metadata);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Get initial session — set loading false ASAP
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.user_metadata);
        }
      } catch (err) {
        console.error("Failed to get session:", err);
      } finally {
        if (mounted) {
          // If there's an OAuth hash in the URL, don't set loading to false yet.
          // Let onAuthStateChange handle the session loading.
          const hasHash = window.location.hash && (
            window.location.hash.includes("access_token") || 
            window.location.hash.includes("id_token") ||
            window.location.hash.includes("error_description")
          );
          
          if (!hasHash) {
            setLoading(false);
          } else {
            // Safety timeout: If OAuth hash is present but onAuthStateChange 
            // doesn't resolve in 10s, force loading false
            setTimeout(() => {
              if (mounted) {
                console.log("OAuth safety timeout reached, forcing loading false");
                setLoading(false);
              }
            }, 10000);
          }
        }
      }
    };

    init();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth event:", event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Update online status
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .update({ is_online: true, last_active: new Date().toISOString() })
      .eq("id", user.id)
      .then();

    const interval = setInterval(() => {
      supabase
        .from("profiles")
        .update({ last_active: new Date().toISOString() })
        .eq("id", user.id)
        .then();
    }, 60000);

    const handleBeforeUnload = () => {
      supabase.from("profiles").update({ is_online: false }).eq("id", user.id);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [user]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from("profiles").insert({ id: data.user.id }).single();
    }
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase
      .from("profiles")
      .update({ is_online: false })
      .eq("id", user?.id);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export type { Profile };

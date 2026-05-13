import { create } from "zustand";
import { canUseMockFallbacks, isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthUser = {
  id: string;
  email?: string;
};

type AuthState = {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  error?: string;
  continueAsGuest: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  isLoading: false,
  continueAsGuest: () =>
    set({
      user: { id: "guest-user", email: "guest@mirror.local" },
      isGuest: true,
      error: undefined
    }),
  signIn: async (email, password) => {
    set({ isLoading: true, error: undefined });
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        set({
          user: data.user ? { id: data.user.id, email: data.user.email || undefined } : null,
          isGuest: false
        });
      } else if (canUseMockFallbacks) {
        set({ user: { id: "mock-user", email }, isGuest: false });
      } else {
        throw new Error("Supabase is not configured for this production build.");
      }
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Giriş yapılamadı." });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (email, password) => {
    set({ isLoading: true, error: undefined });
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        set({
          user: data.user ? { id: data.user.id, email: data.user.email || undefined } : null,
          isGuest: false
        });
      } else if (canUseMockFallbacks) {
        set({ user: { id: "mock-user", email }, isGuest: false });
      } else {
        throw new Error("Supabase is not configured for this production build.");
      }
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Kayıt oluşturulamadı." });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, isGuest: false, error: undefined });
  }
}));

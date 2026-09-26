import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/api-client';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session });
      if (session) {
        const res = await apiClient.get('/auth/me');
        set({ user: res.data });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  }
}));
import { create } from 'zustand';

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  syncStatus: 'synced' | 'syncing' | 'error' | 'none';

  // Actions
  setUser: (user: AuthState['user']) => void;
  setSyncStatus: (status: AuthState['syncStatus']) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  syncStatus: 'none',

  setUser: (user) => set({ user }),
  setSyncStatus: (syncStatus) => set({ syncStatus })
}));

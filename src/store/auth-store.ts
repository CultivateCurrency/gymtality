import { create } from "zustand";

interface AuthStore {
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  pendingEmail: null,
  setPendingEmail: (email) => set({ pendingEmail: email }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

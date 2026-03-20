import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  companyName: string;
  login: (token: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      companyName: '',
      login: (token, companyName) => set({ token, companyName }),
      logout: () => set({ token: null, companyName: '' }),
    }),
    { name: 'company-auth' }
  )
);

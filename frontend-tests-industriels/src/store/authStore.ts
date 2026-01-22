import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                localStorage.setItem('auth_token', token);
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth-storage');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (updatedUser) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedUser } : null,
                })),
        }),
        {
            name: 'auth-storage',
            version: 1, // Increment this to force storage migration/clear
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

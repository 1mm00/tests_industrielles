import api from '@/config/api';
import type { User, ApiResponse } from '@/types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    matricule: string;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    password_confirmation: string;
    fonction: string;
    service?: string;
    telephone?: string;
}

export interface MeResponse {
    user: User;
    personnel?: any;
    activities?: any[];
    habilitations?: any[];
}

export const authService = {
    /**
     * Connexion utilisateur
     */
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        const response = await api.post<ApiResponse<{ user: User; token: string }>>(
            '/auth/login',
            credentials
        );
        return response.data.data;
    },

    /**
     * Inscription utilisateur
     */
    async register(data: RegisterData): Promise<{ user: User; token: string }> {
        const response = await api.post<ApiResponse<{ user: User; token: string }>>(
            '/auth/register',
            data
        );
        return response.data.data;
    },

    /**
     * Déconnexion
     */
    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    /**
     * Récupérer l'utilisateur authentifié
     */
    async me(): Promise<MeResponse> {
        const response = await api.get<ApiResponse<MeResponse>>('/auth/me');
        return response.data.data;
    },

    /**
     * Rafraîchir le token
     */
    async refreshToken(): Promise<{ token: string }> {
        const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
        return response.data.data;
    },

    /**
     * Mot de passe oublié
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await api.post<ApiResponse<{ message: string }>>(
            '/auth/forgot-password',
            { email }
        );
        return response.data.data;
    },

    /**
     * Réinitialiser le mot de passe
     */
    async resetPassword(data: {
        email: string;
        password: string;
        password_confirmation: string;
        token: string;
    }): Promise<{ message: string }> {
        const response = await api.post<ApiResponse<{ message: string }>>(
            '/auth/reset-password',
            data
        );
        return response.data.data;
    },

    /**
     * Mettre à jour le profil (nom, email, tel)
     */
    async updateProfile(data: {
        name: string;
        email: string;
        telephone?: string;
    }): Promise<MeResponse> {
        const response = await api.put<ApiResponse<MeResponse>>('/auth/profile', data);
        return response.data.data;
    },

    /**
     * Vérifier le mot de passe actuel (Double Authentification)
     */
    async verifyPassword(password: string): Promise<boolean> {
        const response = await api.post<ApiResponse<any>>('/auth/verify-password', { password });
        return response.data.success;
    },
};

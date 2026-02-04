import api from '@/config/api';
import type { ApiResponse } from '@/types';

export interface UserPersonnel {
    id_personnel: string;
    matricule: string;
    cin: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    poste: string;
    departement?: string;
    actif: boolean;
    date_embauche?: string;
    nom_complet?: string;
    role?: {
        nom_role: string;
    };
}

export interface UserStats {
    total: number;
    actifs: number;
    inactifs: number;
    by_departement: Array<{ departement: string; count: number }>;
}

export const usersService = {
    /**
     * Récupérer tous les utilisateurs (personnel)
     */
    async getUsers(): Promise<UserPersonnel[]> {
        const response = await api.get<ApiResponse<UserPersonnel[]>>('/users');
        return response.data.data;
    },

    /**
     * Récupérer les statistiques des utilisateurs
     */
    async getUserStats(): Promise<UserStats> {
        const response = await api.get<ApiResponse<UserStats>>('/users/stats');
        return response.data.data;
    },

    /**
     * Créer un nouvel utilisateur/personnel
     */
    async createUser(data: Partial<UserPersonnel>): Promise<UserPersonnel> {
        const response = await api.post<ApiResponse<UserPersonnel>>('/personnel', data);
        return response.data.data;
    },

    /**
     * Récupérer la liste des rôles
     */
    async getRoles(): Promise<any[]> {
        const response = await api.get<ApiResponse<any[]>>('/roles');
        return response.data.data;
    },

    /**
     * Récupérer la liste des postes
     */
    async getPostes(roleId?: string): Promise<any[]> {
        const params = roleId ? { role_id: roleId } : {};
        const response = await api.get<ApiResponse<any[]>>('/postes', { params });
        return response.data.data;
    },

    /**
     * Récupérer la liste des départements
     */
    async getDepartements(roleId?: string, poste?: string): Promise<any[]> {
        const params: any = {};
        if (roleId) params.role_id = roleId;
        if (poste) params.poste = poste;
        const response = await api.get<ApiResponse<any[]>>('/departements', { params });
        return response.data.data;
    },

    /**
     * Mettre à jour un utilisateur/personnel
     */
    async updateUser(id: string, data: Partial<UserPersonnel>): Promise<UserPersonnel> {
        const response = await api.put<ApiResponse<UserPersonnel>>(`/personnel/${id}`, data);
        return response.data.data;
    },

    /**
     * Mettre à jour les permissions d'un rôle
     */
    async updateRolePermissions(roleId: string, permissions: any): Promise<any> {
        const response = await api.put<ApiResponse<any>>(`/roles/${roleId}/permissions`, { permissions });
        return response.data.data;
    },

    /**
     * Supprimer un utilisateur/personnel
     */
    async deleteUser(id: string): Promise<void> {
        await api.delete(`/personnel/${id}`);
    }

};

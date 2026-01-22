import api from '@/config/api';
import type { NonConformite, ApiResponse, PaginatedResponse } from '@/types';

export interface NcFilters {
    search?: string;
    statut?: string;
    criticite_id?: string;
    page?: number;
    per_page?: number;
}

export const ncService = {
    /**
     * Récupérer toutes les non-conformités avec filtres et pagination
     */
    async getPaginatedNc(filters?: NcFilters): Promise<PaginatedResponse<NonConformite>> {
        const response = await api.get<PaginatedResponse<NonConformite>>('/non-conformites', {
            params: filters,
        });
        return response.data;
    },

    /**
     * Récupérer les statistiques des NC
     */
    async getNcStats(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/non-conformites/stats');
        return response.data.data;
    },

    /**
     * Récupérer une NC par ID
     */
    async getNc(id: string): Promise<NonConformite> {
        const response = await api.get<ApiResponse<NonConformite>>(`/non-conformites/${id}`);
        return response.data.data;
    },

    /**
     * Créer une nouvelle NC
     */
    async createNc(data: any): Promise<NonConformite> {
        const response = await api.post<ApiResponse<NonConformite>>('/non-conformites', data);
        return response.data.data;
    },

    /**
     * Récupérer les données pour la création d'une NC
     */
    async getCreationData(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/non-conformites/creation-data');
        return response.data.data;
    },
};

import api from '@/config/api';
import type { Equipement, ApiResponse, PaginatedResponse } from '@/types';

export interface EquipementFilters {
    search?: string;
    statut?: string;
    criticite?: number;
    site?: string;
    page?: number;
    per_page?: number;
}

export const equipementsService = {
    /**
     * Récupérer tous les équipements avec filtres et pagination
     */
    async getPaginatedEquipements(filters?: EquipementFilters): Promise<PaginatedResponse<Equipement>> {
        const response = await api.get<PaginatedResponse<Equipement>>('/equipements', {
            params: filters,
        });
        return response.data;
    },

    /**
     * Récupérer les statistiques des équipements
     */
    async getEquipementStats(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/equipements/stats');
        return response.data.data;
    },

    /**
     * Récupérer un équipement par ID
     */
    async getEquipement(id: string): Promise<Equipement> {
        const response = await api.get<ApiResponse<Equipement>>(`/equipements/${id}`);
        return response.data.data;
    },
};

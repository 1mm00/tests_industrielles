import api from '@/config/api';
import type { NonConformite, ApiResponse, PaginatedResponse } from '@/types';

export interface NcFilters {
    search?: string;
    statut?: string;
    criticite_id?: string;
    is_archived?: boolean;
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

    async updateNc(id: string, data: any): Promise<NonConformite> {
        const response = await api.put<ApiResponse<NonConformite>>(`/non-conformites/${id}`, data);
        return response.data.data;
    },

    /**
     * Supprimer une NC
     */
    async deleteNc(id: string): Promise<void> {
        await api.delete(`/non-conformites/${id}`);
    },

    /**
     * Enregistrer l'analyse des causes racines
     */
    async analyserNc(id: string, data: any): Promise<void> {
        await api.post(`/non-conformites/${id}/analyser`, data);
    },

    /**
     * Créer un plan d'actions correctives
     */
    async createPlanAction(id: string, data: any): Promise<void> {
        await api.post(`/non-conformites/${id}/plan-action`, data);
    },

    /**
     * Clôturer officiellement une NC (vérification pré-requis + verrouillage)
     */
    async cloturerNc(id: string, commentaires: string): Promise<NonConformite> {
        const response = await api.post<ApiResponse<NonConformite>>(`/v1/non-conformites/${id}/cloturer`, {
            commentaires_cloture: commentaires
        });
        return response.data.data;
    },

    /**
     * Réouvrir une NC clôturée
     */
    async reouvrirNc(id: string, motif: string): Promise<NonConformite> {
        const response = await api.post<ApiResponse<NonConformite>>(`/v1/non-conformites/${id}/reouvrir`, {
            motif_reouverture: motif
        });
        return response.data.data;
    },

    /**
     * Archiver ou désarchiver une NC
     */
    async archiveNc(id: string): Promise<NonConformite> {
        const response = await api.post<ApiResponse<NonConformite>>(`/v1/non-conformites/${id}/archive`);
        return response.data.data;
    },
};

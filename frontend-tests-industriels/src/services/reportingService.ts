import api from '@/config/api';
import type { ApiResponse } from '@/types';

export interface PerformanceStats {
    summary: {
        conformity_rate: { value: number; trend: string; change: string };
        avg_resolution_days: number;
        total_nc_active: { value: number; trend: string; change: string | number };
        critical_nc_count: { value: number; trend: string; change: string | number };
        total_tests?: { value: number; trend: string; change: string };
    };
    conformity_trend: {
        categories: string[];
        series: Array<{ name: string; data: number[] }>;
    };

    test_types: Array<{ label: string; value: number }>;
    top_issues: Array<{ label: string; value: number }>;
    nc_by_criticality: Array<{ label: string; value: number; color: string }>;
}

export interface Rapport {
    id_rapport: string;
    test_id: string;
    numero_rapport: string;
    type_rapport: string;
    date_edition: string;
    redacteur_id: string;
    valideur_id: string;
    date_validation: string;
    statut: string;
    resume_executif: string;
    fichier_pdf_url: string;
    test?: {
        numero_test: string;
        equipement?: {
            designation: string;
        };
    };
    redacteur?: {
        nom: string;
        prenom: string;
    };
}

export const reportingService = {
    /**
     * Récupérer les statistiques de performance pour le dashboard reporting
     */
    async getPerformanceStats(): Promise<PerformanceStats> {
        const response = await api.get<ApiResponse<PerformanceStats>>('/reporting/performance');
        return response.data.data;
    },

    /**
     * Récupérer la liste des rapports
     */
    async getReports(): Promise<Rapport[]> {
        const response = await api.get<ApiResponse<Rapport[]>>('/reporting/reports');
        return response.data.data;
    },

    /**
     * Créer un nouveau rapport
     */
    async createReport(data: {
        test_id: string;
        type_rapport: string;
        date_edition: string;
        resume_executif?: string;
        redacteur_id: string;
    }): Promise<Rapport> {
        const response = await api.post<ApiResponse<Rapport>>('/reporting/reports', data);
        return response.data.data;
    },

    /**
     * Exécuter une requête dynamique
     */
    async customQuery(params: {
        metric: string;
        dimension: string;
        start_date?: string;
        end_date?: string;
    }): Promise<{ labels: string[]; values: number[]; metric: string; dimension: string }> {
        const response = await api.post<ApiResponse<any>>('/reporting/custom-query', params);
        return response.data.data;
    },

    /**
     * Gérer les favoris
     */
    async getFavorites(): Promise<any[]> {
        const response = await api.get<ApiResponse<any[]>>('/reporting/favorites');
        return response.data.data;
    },

    async saveFavorite(data: { name: string; config: any }): Promise<any> {
        const response = await api.post<ApiResponse<any>>('/reporting/favorites', data);
        return response.data.data;
    },

    async deleteFavorite(id: string): Promise<void> {
        await api.delete(`/reporting/favorites/${id}`);
    }
};

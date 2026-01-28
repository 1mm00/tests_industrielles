import api from '@/config/api';
import type { TestIndustriel, ApiResponse, PaginatedResponse } from '@/types';

export interface TestFilters {
    search?: string;
    statut?: string;
    equipement_id?: string;
    type_test_id?: string;
    date_debut?: string;
    date_fin?: string;
    criticite?: number;
    page?: number;
    per_page?: number;
}

export interface CreateTestData {
    type_test_id: string;
    equipement_id: string;
    phase_id?: string | null;
    procedure_id?: string | null;
    date_test: string;
    heure_debut?: string;
    heure_fin?: string;
    localisation: string;
    niveau_criticite: number;
    responsable_test_id?: string | null;
    equipe_test?: string[];
    observations_generales?: string;
    arret_production_requis?: boolean;
}

export const testsService = {
    /**
     * Récupérer tous les tests avec filtres et pagination
     */
    async getTests(filters?: TestFilters): Promise<PaginatedResponse<TestIndustriel>> {
        const response = await api.get<PaginatedResponse<TestIndustriel>>('/tests', {
            params: filters,
        });
        return response.data;
    },

    /**
     * Récupérer un test par ID
     */
    async getTest(id: string): Promise<TestIndustriel> {
        const response = await api.get<ApiResponse<TestIndustriel>>(`/tests/${id}`);
        return response.data.data;
    },

    /**
     * Créer un nouveau test
     */
    async createTest(data: CreateTestData): Promise<TestIndustriel> {
        const response = await api.post<ApiResponse<TestIndustriel>>('/tests', data);
        return response.data.data;
    },

    /**
     * Mettre à jour un test
     */
    async updateTest(id: string, data: Partial<CreateTestData>): Promise<TestIndustriel> {
        const response = await api.put<ApiResponse<TestIndustriel>>(`/tests/${id}`, data);
        return response.data.data;
    },

    /**
     * Supprimer un test
     */
    async deleteTest(id: string): Promise<void> {
        await api.delete(`/tests/${id}`);
    },

    /**
     * Démarrer un test
     */
    async startTest(id: string): Promise<TestIndustriel> {
        const response = await api.post<ApiResponse<TestIndustriel>>(`/tests/${id}/start`);
        return response.data.data;
    },

    /**
     * Terminer un test
     */
    async finishTest(id: string, data: { resultat_global: string; observations?: string }): Promise<TestIndustriel> {
        const response = await api.post<ApiResponse<TestIndustriel>>(`/tests/${id}/finish`, data);
        return response.data.data;
    },

    /**
     * Suspendre un test
     */
    async suspendTest(id: string, motif: string): Promise<TestIndustriel> {
        const response = await api.post<ApiResponse<TestIndustriel>>(`/tests/${id}/suspend`, { motif });
        return response.data.data;
    },

    /**
     * Annuler un test
     */
    async cancelTest(id: string, motif: string): Promise<TestIndustriel> {
        const response = await api.post<ApiResponse<TestIndustriel>>(`/tests/${id}/cancel`, { motif });
        return response.data.data;
    },

    /**
     * Récupérer les tests en cours
     */
    async getTestsEnCours(): Promise<TestIndustriel[]> {
        const response = await api.get<ApiResponse<TestIndustriel[]>>('/tests/en-cours');
        return response.data.data;
    },

    async getTestsStats(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/tests/stats');
        return response.data.data;
    },

    /**
     * Récupérer les statistiques spécifiques pour le dashboard technicien
     */
    async getTechnicianStats(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/tests/technician-stats');
        return response.data.data;
    },


    /**
     * Récupérer les tests pour le calendrier (mois/année)
     */
    async getCalendarTests(month?: number, year?: number): Promise<TestIndustriel[]> {
        const response = await api.get<ApiResponse<TestIndustriel[]>>('/tests/calendar', {
            params: { month, year }
        });
        return response.data.data;
    },

    /**
     * Récupérer les données de configuration pour la création d'un test
     */
    async getCreationData(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/tests/creation-data');
        return response.data.data;
    },

    /**
     * Exporter les tests en CSV
     */
    async exportTests(filters?: TestFilters): Promise<Blob> {
        const response = await api.get('/tests/export', {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Récupérer les mesures d'un test
     */
    async getTestMesures(testId: string): Promise<any[]> {
        const response = await api.get<ApiResponse<any[]>>(`/tests/${testId}/mesures`);
        return response.data.data;
    },

    /**
     * Ajouter une mesure à un test
     */
    async addTestMesure(testId: string, data: any): Promise<any> {
        const response = await api.post<ApiResponse<any>>(`/tests/${testId}/mesures`, data);
        return response.data.data;
    },

    /**
     * Mettre à jour une mesure
     */
    async updateMesure(id: string, data: any): Promise<any> {
        const response = await api.put<ApiResponse<any>>(`/mesures/${id}`, data);
        return response.data.data;
    },

    /**
     * Supprimer une mesure
     */
    async deleteMesure(id: string): Promise<void> {
        await api.delete(`/mesures/${id}`);
    },
};

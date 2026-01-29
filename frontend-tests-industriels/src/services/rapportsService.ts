import api from '@/config/api';

export interface RapportTest {
    id_rapport: string;
    test_id: string;
    numero_rapport: string;
    type_rapport: string;
    date_edition: string;
    redacteur_id: string;
    valideur_id?: string;
    date_validation?: string;
    statut: 'BROUILLON' | 'EN_REVISION' | 'VALIDE';
    resume_executif?: string;
    structure_rapport?: any;
    fichier_pdf_url?: string;
    test?: any;
    redacteur?: any;
    valideur?: any;
}

export interface RapportFilters {
    page?: number;
    per_page?: number;
    search?: string;
    statut?: string;
}

export const rapportsService = {
    /**
     * Récupère la liste paginée des rapports
     */
    async getRapports(filters: RapportFilters) {
        const response = await api.get('/rapports', { params: filters });
        return response.data;
    },

    /**
     * Récup ère UN rapport avec toutes ses données pour génération PDF
     */
    async getMasterReportData(id: string) {
        const response = await api.get(`/rapports/${id}/master-data`);
        return response.data;
    },

    /**
     * Créer un nouveau rapport
     */
    async createRapport(data: {
        test_id: string;
        type_rapport: string;
        resume_executif?: string;
        structure_rapport?: any;
    }) {
        const response = await api.post('/rapports', data);
        return response.data;
    },

    /**
     * Mettre à jour un rapport
     */
    async updateRapport(id: string, data: Partial<RapportTest>) {
        const response = await api.put(`/rapports/${id}`, data);
        return response.data;
    },

    /**
     * Valider un rapport
     */
    async validerRapport(id: string) {
        const response = await api.post(`/rapports/${id}/valider`);
        return response.data;
    },

    /**
     * Supprimer un rapport
     */
    async deleteRapport(id: string) {
        await api.delete(`/rapports/${id}`);
    },

    /**
     * Récupère les statistiques des rapports
     */
    async getStats() {
        const response = await api.get('/rapports/stats');
        return response.data;
    },
};

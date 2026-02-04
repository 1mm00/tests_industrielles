import api from '@/config/api';

export interface DashboardIngenieurData {
    kpis: {
        taux_conformite: number;
        nc_actives: number;
        nc_critiques: number;
        tests_totaux: number;
    };
    performance_12_mois: Array<{
        mois: string;
        tests_reussis: number;
        tests_conformes: number;
        non_conformites: number;
    }>;
    actions_requises: Array<{
        id_test: string;
        numero_test: string;
        type: string;
        equipement: string;
        code_equipement: string;
        statut: string;
        date_planifiee: string;
        criticite: number;
    }>;
    expertise_equipement: Array<{
        id_equipement: string;
        designation: string;
        code: string;
        total_tests: number;
        total_nc: number;
        taux_echec: number;
    }>;
    stats_complementaires: {
        tests_en_cours: number;
        tests_planifies: number;
        tests_suspendus: number;
        nc_resolues_ce_mois: number;
    };
}

export interface DashboardTechnicienData {
    tests_aujourdhui: any[];
    tests_semaine: any[];
    total_aujourdhui: number;
    total_semaine: number;
}

export const dashboardService = {
    /**
     * Récupère les données du Dashboard Ingénieur
     */
    async getDashboardIngenieur(): Promise<DashboardIngenieurData> {
        const response = await api.get('/dashboard/ingenieur');
        return response.data;
    },

    /**
     * Récupère les données du Dashboard Technicien
     */
    async getDashboardTechnicien(): Promise<DashboardTechnicienData> {
        const response = await api.get('/dashboard/technicien');
        return response.data;
    },
    /**
     * Retourne l'URL pour le téléchargement du rapport analytique (PDF)
     */
    getAnalyticsPdfUrl(): string {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        return `${baseUrl}/dashboard/analytics/pdf`;
    }
};

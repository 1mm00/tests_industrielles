import api from '@/config/api';

export interface ParametreCritique {
    parametre: string;
    statut: 'VALIDATED' | 'WARNING' | 'ERROR';
    valeur: string | number;
}

export interface MaintenancePredictive {
    jours_restants: number;
    prochaine_date: string;
    urgence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TendancePoint {
    date: string;
    conformite: number;
}

export interface EquipementExpertiseData {
    id_equipement: string;
    designation: string;
    code_equipement: string;
    zone: string;
    statut: string;
    efficacite: number;
    parametres_critiques: ParametreCritique[];
    maintenance_predictive: MaintenancePredictive;
    tendance: TendancePoint[];
    total_tests: number;
    derniere_intervention: string;
}

export interface InstrumentMetrologique {
    id_instrument: string;
    designation: string;
    numero_serie: string;
    type: string;
    statut: string;
    etalonnage: {
        dernier: string;
        prochain: string;
        jours_restants: number | null;
        etat: 'VALID' | 'WARNING' | 'EXPIRED' | 'UNKNOWN';
    };
    precision: string;
    incertitude: string;
}

export interface LiveSensorData {
    sensor_id: string;
    type: string;
    valeur: number;
    unite: string;
    timestamp: string;
    statut: string;
}

export interface ExpertiseEquipementsResponse {
    kpis: {
        total_equipements: number;
        en_service: number;
        hors_service: number;
        taux_disponibilite: number;
    };
    suivi_technique: EquipementExpertiseData[];
    instruments_metrologiques: InstrumentMetrologique[];
    live_sensor_data: LiveSensorData[];
    statistiques: {
        taux_disponibilite_parc: number;
        interventions_ce_mois: number;
        alertes_critiques: number;
    };
}

export const equipementExpertiseService = {
    /**
     * Récupère toutes les données d'expertise du parc
     */
    async getExpertiseData(): Promise<ExpertiseEquipementsResponse> {
        const response = await api.get('/equipements/expertise');
        return response.data;
    },

    /**
     * Exporte la base de données assets en Excel/CSV
     */
    async exportAssetDatabase() {
        const response = await api.get('/equipements/export-asset-db', {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Synchronise les données temps réel avec les capteurs IoT
     */
    async syncRealTime() {
        const response = await api.post('/equipements/sync-realtime');
        return response.data;
    },
};

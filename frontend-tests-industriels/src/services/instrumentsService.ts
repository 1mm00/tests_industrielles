import api from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface InstrumentFilters {
    search?: string;
    statut?: string;
    type?: string;
    calibration_filter?: 'expired' | 'upcoming' | '';
    page?: number;
    per_page?: number;
}

export interface Instrument {
    id_instrument: string;
    code_instrument: string;
    designation: string;
    type_instrument: string;
    categorie_mesure: string;
    fabricant: string;
    modele: string;
    numero_serie: string;
    precision: string;
    plage_mesure_min: string;
    plage_mesure_max: string;
    unite_mesure: string;
    resolution: string;
    date_acquisition: string;
    date_derniere_calibration: string;
    date_prochaine_calibration: string;
    periodicite_calibration_mois: number;
    statut: string;
    localisation: string;
    certificat_calibration_url: string;
    created_at: string;
    updated_at: string;
}

export const instrumentsService = {
    /**
     * Récupérer tous les instruments avec filtres et pagination
     */
    async getPaginatedInstruments(filters?: InstrumentFilters): Promise<PaginatedResponse<Instrument>> {
        const response = await api.get<PaginatedResponse<Instrument>>('/instruments', {
            params: filters,
        });
        return response.data;
    },

    /**
     * Récupérer les statistiques des instruments
     */
    async getInstrumentStats(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/instruments/stats');
        return response.data.data;
    },

    /**
     * Récupérer les alertes de calibration détaillées
     */
    async getCalibrationAlerts(): Promise<{ expired: Instrument[], upcoming: Instrument[] }> {
        const response = await api.get<ApiResponse<{ expired: Instrument[], upcoming: Instrument[] }>>('/instruments/alerts');
        return response.data.data;
    },

    /**
     * Récupérer un instrument par ID
     */
    async getInstrument(id: string): Promise<Instrument> {
        const response = await api.get<ApiResponse<Instrument>>(`/instruments/${id}`);
        return response.data.data;
    },

    /**
     * Créer un nouvel instrument
     */
    async createInstrument(data: any): Promise<Instrument> {
        const response = await api.post<ApiResponse<Instrument>>('/instruments', data);
        return response.data.data;
    },
    /**
     * Supprimer un instrument
     */
    async deleteInstrument(id: string): Promise<void> {
        await api.delete(`/instruments/${id}`);
    },
};

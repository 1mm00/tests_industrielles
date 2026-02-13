import api from './api';
import { ApiResponse } from '@/types';

export interface VerificationEfficacite {
    id: string;
    action_corrective_id: string;
    verificateur_id: string;
    date_verification: string;
    methode_verification: string;
    resultats_constates: string;
    est_efficace: boolean;
    commentaires?: string;
    verificateur?: any;
    action_corrective?: any;
}

export const verificationService = {
    /**
     * Enregistrer une nouvelle vérification d'efficacité
     */
    async store(data: any): Promise<VerificationEfficacite> {
        const response = await api.post<ApiResponse<VerificationEfficacite>>('/v1/verifications-efficacite', data);
        return response.data.data;
    },

    /**
     * Récupérer les vérifications pour une NC
     */
    async getByNc(ncId: string): Promise<VerificationEfficacite[]> {
        const response = await api.get<ApiResponse<VerificationEfficacite[]>>(`/v1/non-conformites/${ncId}/verifications`);
        return response.data.data;
    }
};

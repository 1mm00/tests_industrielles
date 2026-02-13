import api from '@/config/api';
import type { ApiResponse } from '@/types';

export interface ActionCorrective {
    id_action: string;
    plan_id: string;
    numero_action: string;
    type_action: string;
    description: string;
    responsable_id: string;
    date_prevue: string;
    date_realisee?: string;
    statut: 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'ANNULEE';
    priorite?: string;
    commentaires?: string;
    responsable?: {
        id_personnel: string;
        nom: string;
        prenom: string;
    };
}

export const actionService = {
    /**
     * Récupérer toutes les actions d'un plan d'action
     */
    async getByPlan(planId: string): Promise<ActionCorrective[]> {
        const response = await api.get<ApiResponse<ActionCorrective[]>>(`/v1/plan-actions/${planId}/actions`);
        return response.data.data;
    },

    /**
     * Mettre à jour le statut d'une action corrective
     */
    async updateAction(id: string, data: { statut: string; date_realisee?: string; commentaires?: string }): Promise<ActionCorrective> {
        const response = await api.put<ApiResponse<ActionCorrective>>(`/v1/actions-correctives/${id}`, data);
        return response.data.data;
    },

    /**
     * Marquer plusieurs actions comme réalisées
     */
    async bulkComplete(actionIds: string[]): Promise<void> {
        await api.post('/v1/actions-correctives/bulk-complete', {
            action_ids: actionIds
        });
    }
};

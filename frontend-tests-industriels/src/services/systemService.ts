import api from '@/config/api';
import type { ApiResponse } from '@/types';

export interface SystemHealth {
    status: 'OK' | 'CRITICAL';
    components: {
        database: string;
        api: string;
        storage: string;
        latency: string;
    };
    last_sync: string;
}

export interface SystemNotification {
    id: string;
    title: string;
    description: string;
    type: 'info' | 'error' | 'success' | 'warning';
    category: string;
    time: string;
}

export const systemService = {
    /**
     * Récupérer l'état de santé du système
     */
    async getHealth(): Promise<SystemHealth> {
        const response = await api.get<ApiResponse<SystemHealth>>('/system/health');
        return response.data.data;
    },

    /**
     * Récupérer les notifications consolidées
     */
    async getNotifications(): Promise<SystemNotification[]> {
        const response = await api.get<ApiResponse<SystemNotification[]>>('/system/notifications');
        return response.data.data;
    }
};

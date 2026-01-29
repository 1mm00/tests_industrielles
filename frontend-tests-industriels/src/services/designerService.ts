import api from './api';
import { ApiResponse, ChecklistControle } from '@/types';

export const designerService = {
    getChecklist: async (typeTestId: string): Promise<ChecklistControle | null> => {
        const response = await api.get<ApiResponse<ChecklistControle>>(`/designer/checklists/${typeTestId}`);
        return response.data.data;
    },

    saveChecklist: async (typeTestId: string, data: any): Promise<ChecklistControle> => {
        const response = await api.post<ApiResponse<ChecklistControle>>(`/designer/checklists/${typeTestId}`, data);
        return response.data.data;
    },
};

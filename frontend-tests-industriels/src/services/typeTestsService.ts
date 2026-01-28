import api from './api';
import { TypeTest, ApiResponse } from '@/types';

export const typeTestsService = {
    getTypeTests: async (params?: { search?: string; actif?: boolean }): Promise<TypeTest[]> => {
        const response = await api.get<ApiResponse<TypeTest[]>>('/type-tests', { params });
        return response.data.data;
    },

    getTypeTest: async (id: string): Promise<TypeTest> => {
        const response = await api.get<ApiResponse<TypeTest>>(`/type-tests/${id}`);
        return response.data.data;
    },

    createTypeTest: async (data: Partial<TypeTest>): Promise<TypeTest> => {
        const response = await api.post<ApiResponse<TypeTest>>('/type-tests', data);
        return response.data.data;
    },

    updateTypeTest: async (id: string, data: Partial<TypeTest>): Promise<TypeTest> => {
        const response = await api.put<ApiResponse<TypeTest>>(`/type-tests/${id}`, data);
        return response.data.data;
    },

    deleteTypeTest: async (id: string): Promise<void> => {
        await api.delete(`/type-tests/${id}`);
    },

    getCreationData: async (): Promise<any> => {
        const response = await api.get<ApiResponse<any>>('/type-tests/creation-data');
        return response.data.data;
    },
};

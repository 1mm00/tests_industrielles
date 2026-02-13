import api from '@/config/api';

export interface Norme {
    id_norme: string;
    code_norme: string;
    titre: string;
    organisme_emission: string;
    categorie: string;
    version?: string;
    date_publication?: string;
    statut: string;
    description?: string;
}

export interface Departement {
    id_departement: string;
    code_departement: string;
    libelle: string;
    description?: string;
    actif: boolean;
}

export interface Poste {
    id_poste: string;
    code_poste: string;
    libelle: string;
    categorie: string;
    role_id: string;
    actif: boolean;
}

export const settingsService = {
    // Normes
    getNormes: (params?: any) => api.get('/normes', { params }),
    createNorme: (data: Partial<Norme>) => api.post('/normes', data),
    updateNorme: (id: string, data: Partial<Norme>) => api.put(`/normes/${id}`, data),
    deleteNorme: (id: string) => api.delete(`/normes/${id}`),

    // Départements
    getDepartements: () => api.get('/departements'),
    createDepartement: (data: Partial<Departement>) => api.post('/departements', data),
    updateDepartement: (id: string, data: Partial<Departement>) => api.put(`/departements/${id}`, data),
    deleteDepartement: (id: string) => api.delete(`/departements/${id}`),

    // Postes
    getPostes: (params?: any) => api.get('/postes', { params }),
    createPoste: (data: Partial<Poste>) => api.post('/postes', data),
    updatePoste: (id: string, data: Partial<Poste>) => api.put(`/postes/${id}`, data),
    deletePoste: (id: string) => api.delete(`/postes/${id}`),

    // Roles (needed for Postes creation)
    getRoles: () => api.get('/roles'),
};

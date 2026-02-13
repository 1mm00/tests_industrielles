import { useState, useEffect } from 'react';
import api from '@/config/api';

export interface KpiData {
    taux_reussite: {
        valeur: number;
        total: number;
        reussis: number;
        variation: number;
    };
    total_tests: {
        valeur: number;
        variation: number;
        variation_pct: number;
    };
    tests_par_statut: {
        [key: string]: number;
    };
    non_conformites: {
        total: number;
        ouvertes: number;
        critiques: number;
        variation: number;
        taux_ouverture: number;
    };
    temps_moyen_execution: {
        valeur: number;
        unite: string;
        variation: number;
    };
    taux_utilisation_equipements: {
        valeur: number;
        equipements_utilises: number;
        total_equipements: number;
    };
    performance_par_type: Array<{
        type: string;
        total: number;
        valides: number;
        taux_reussite: number;
    }>;
    tendances: Array<{
        mois: string;
        total: number;
        valides: number;
        taux_reussite: number;
    }>;
}

interface UseKpisOptions {
    refreshInterval?: number;
    filters?: {
        start_date?: string;
        end_date?: string;
        type_test_id?: string;
        equipement_id?: string;
    };
}

export const useKpis = (options: UseKpisOptions = {}) => {
    const [data, setData] = useState<KpiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKpis = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/v1/kpis/dashboard', {
                params: options.filters
            });

            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError('Erreur lors de la récupération des KPIs');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur réseau');
            console.error('Erreur KPIs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();

        if (options.refreshInterval) {
            const interval = setInterval(fetchKpis, options.refreshInterval);
            return () => clearInterval(interval);
        }
    }, [JSON.stringify(options.filters), options.refreshInterval]); // Use stringified filters for deep comparison in dependency array

    return {
        data,
        loading,
        error,
        refetch: fetchKpis,
    };
};

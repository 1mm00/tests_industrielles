import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    AlertTriangle,
    Search,
    Filter,
    Plus,
    Eye,
    CheckCircle2,
    Clock,
    ShieldAlert,
    MapPin,
    Calendar,
    Trash2,
    Activity,
    Target,
    Zap,
    History,
    ChevronRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { ncService, NcFilters } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

import { useAuthStore } from '@/store/authStore';
import { hasPermission, isLecteur } from '@/utils/permissions';

export default function NonConformitesPage() {
    const { user } = useAuthStore();
    const { openNcModal, openNcEditModal, openNcDetailsModal } = useModalStore();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<NcFilters>({
        page: 1,
        per_page: 10,
        search: '',
        statut: '',
    });

    // Main data queries
    const { data, isLoading } = useQuery({
        queryKey: ['non-conformites', filters],
        queryFn: () => ncService.getPaginatedNc(filters),
    });

    const { data: stats } = useQuery({
        queryKey: ['nc-stats'],
        queryFn: () => ncService.getNcStats(),
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, statut: e.target.value, page: 1 }));
    };



    const handleDeleteClick = (id: string, numero: string) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[300px]">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase">Supprimer la NC ?</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{numero}</p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    Cette action est irréversible. Toutes les données associées (attachements, historique de traitement) seront définitivement supprimées.
                </p>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await executeDelete(id, numero);
                        }}
                        className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                    >
                        Confirmer Suppression
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '32px',
                background: '#fff',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #fee2e2'
            },
        });
    };

    const executeDelete = async (id: string, numero: string) => {
        const loadingToast = toast.loading(`Suppression de ${numero} en cours...`);
        try {
            await ncService.deleteNc(id);
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            toast.success(`La NC ${numero} a été supprimée.`, {
                id: loadingToast,
                icon: '✅',
                className: 'font-bold text-xs'
            });
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Erreur lors de la suppression.",
                { id: loadingToast, duration: 5000 }
            );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <ShieldAlert className="h-7 w-7 text-rose-600" />
                        Registre Non-Conformités
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Audit, gestion des écarts et orchestration du plan d'actions correctives</p>
                </div>

                <div className="flex items-center gap-3">

                    {hasPermission(user, 'non_conformites', 'create') && (
                        <button
                            onClick={openNcModal}
                            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                            Déclarer une NC
                        </button>
                    )}
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform shadow-sm">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total NC</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats?.summary?.total || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Analyse</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats?.summary?.en_cours || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-sm">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haute Criticité</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats?.summary?.critiques || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clôturées (Optimisées)</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.summary?.cloturees || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par n° de NC, description technique, expert..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="flex-1 md:w-52 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all appearance-none"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous les Statuts</option>
                        <option value="OUVERTE">Ouverte (Action Requise)</option>
                        <option value="TRAITEMENT">En Traitement Analytique</option>
                        <option value="CLOTUREE">Clôturée & Validée</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Table View */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Identification</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Description de l'Écart</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Asset & Protocole</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Audit Detection</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-7 py-6">
                                            <div className="h-10 bg-slate-50 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-7 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-20">
                                            <ShieldCheck className="h-20 w-20 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[4px] text-xs underline underline-offset-8">Registre Nominal (Zéro Défaut)</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((nc: any) => (
                                    <tr key={nc.id_non_conformite} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-rose-500">
                                        <td className="px-7 py-6">
                                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-widest shadow-sm">
                                                {nc.numero_nc}
                                            </span>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="max-w-xs">
                                                <p className="text-[13px] font-black text-slate-800 line-clamp-1 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{nc.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                    <Target className="h-3 w-3" />
                                                    {nc.type_nc}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black text-slate-700 truncate max-w-[180px] flex items-center gap-2">
                                                    <Activity className="h-3.5 w-3.5 text-slate-300" />
                                                    {nc.equipement?.designation || 'Équipement non spécifié'}
                                                </span>
                                                <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                                                    {nc.test?.numero_test || 'Intervention Directe'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-700">{formatDate(nc.date_detection)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{nc.zone_detection || 'Zone de Tests Flux A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                                                    nc.statut === 'OUVERTE' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                        nc.statut === 'TRAITEMENT' || nc.statut === 'EN_ANALYSE' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                            "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                )}>
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        nc.statut === 'OUVERTE' ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" :
                                                            nc.statut === 'TRAITEMENT' || nc.statut === 'EN_ANALYSE' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                                                                "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                                                    )} />
                                                    {nc.statut === 'TRAITEMENT' ? 'ANALYSE ACTIVE' : nc.statut}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(hasPermission(user, 'non_conformites', 'read') || isLecteur(user)) && (
                                                    <button
                                                        onClick={() => openNcDetailsModal(nc.id_non_conformite)}
                                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                        title="Consulter"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {nc.statut !== 'CLOTUREE' && (hasPermission(user, 'non_conformites', 'update') || hasPermission(user, 'non_conformites', 'close')) && (
                                                    <button
                                                        onClick={() => openNcEditModal(nc.id_non_conformite)}
                                                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Traiter / Clôturer"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'non_conformites', 'delete') && (
                                                    <button
                                                        onClick={() => handleDeleteClick(nc.id_non_conformite, nc.numero_nc)}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Optional: Footer Pagination */}
                {!isLoading && data && data.meta.total > 0 && (
                    <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {data.meta.total} Anomalies détectées sur le cycle actuel
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={data.meta.current_page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Archive Précédente
                            </button>
                            <button
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={data.meta.current_page === data.meta.last_page}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            >
                                Page Suivante
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

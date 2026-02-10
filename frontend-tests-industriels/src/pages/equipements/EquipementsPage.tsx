import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,

    Plus,
    Eye,
    Settings,
    Trash2,
    ShieldCheck,
    AlertCircle,
    MapPin,
    Cpu,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { equipementsService, EquipementFilters } from '@/services/equipementsService';
import { cn } from '@/utils/helpers';

import { useAuthStore } from '@/store/authStore';
import { hasPermission, isLecteur } from '@/utils/permissions';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';

export default function EquipementsPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { openEquipementEditModal, openEquipementCreateModal, openEquipementDetailsModal } = useModalStore();
    const [filters, setFilters] = useState<EquipementFilters>({
        page: 1,
        per_page: 10,
        search: '',
        statut: '',
        criticite: undefined,
    });

    const { data, isLoading } = useQuery({
        queryKey: ['equipements', filters],
        queryFn: () => equipementsService.getPaginatedEquipements(filters),
    });

    const { data: stats } = useQuery({
        queryKey: ['equipement-stats'],
        queryFn: () => equipementsService.getEquipementStats(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => equipementsService.deleteEquipement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipements'] });
            queryClient.invalidateQueries({ queryKey: ['equipement-stats'] });
            toast.success('Équipement archivé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    });

    const handleDelete = (equipement: any) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 uppercase">Supprimer l'actif ?</p>
                        <p className="text-[10px] text-gray-500 font-bold">{equipement.code_equipement}</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Cette action supprimera définitivement l'équipement. L'historique des tests et interventions sera conservé pour traçabilité.
                </p>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            deleteMutation.mutate(equipement.id_equipement);
                        }}
                        className="px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '24px',
                background: '#fff',
                padding: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #fee2e2'
            },
        });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, statut: e.target.value, page: 1 }));
    };



    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Cpu className="h-7 w-7 text-blue-600" />
                        Parc Équipements
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Inventaire technique et pilotage de la flotte industrielle</p>
                </div>
                <div className="flex items-center gap-3">

                    {hasPermission(user, 'equipements', 'create') && (
                        <button
                            onClick={openEquipementCreateModal}
                            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                            Ajouter un Actif
                        </button>
                    )}
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Actifs</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats?.total || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-slate-400 rounded-r-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Service</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.en_service || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.en_service / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats?.en_maintenance || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.en_maintenance / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critiques</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats?.critiques || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.critiques / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher par code, désignation, modèle..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="EN_SERVICE">En Service</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="HORS_SERVICE">Hors Service</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Table */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Actif / ID</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Catégorie</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Localisation</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Criticité</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-7 py-6"><div className="h-8 bg-slate-50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-7 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Cpu className="h-16 w-16 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun actif identifié</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((eq: any) => (
                                    <tr key={eq.id_equipement} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-blue-500">
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{eq.code_equipement}</span>
                                                <span className="text-[13px] font-black text-slate-800 capitalize mt-0.5">{eq.designation}</span>
                                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 italic mt-1">{eq.sous_categorie || 'Sans sous-catégorie'}</p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-tight">
                                                {eq.categorie_equipement}
                                            </span>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-300" />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-slate-700">{eq.localisation_site}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium italic">{eq.localisation_precise}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-center">
                                            <div className="flex items-center justify-center -space-x-1.5">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <div
                                                        key={n}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black transition-all",
                                                            n <= (eq.niveau_criticite || 1)
                                                                ? cn(
                                                                    "text-white shadow-sm z-10",
                                                                    eq.niveau_criticite >= 4 ? "bg-rose-500" :
                                                                        eq.niveau_criticite === 3 ? "bg-amber-500" : "bg-blue-500"
                                                                )
                                                                : "bg-slate-100 text-slate-300 z-0"
                                                        )}
                                                    >
                                                        {n}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    eq.statut_operationnel === 'EN_SERVICE' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                                                        eq.statut_operationnel === 'MAINTENANCE' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                                                            "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    eq.statut_operationnel === 'EN_SERVICE' ? "text-emerald-600" :
                                                        eq.statut_operationnel === 'MAINTENANCE' ? "text-amber-600" :
                                                            "text-rose-600"
                                                )}>
                                                    {eq.statut_operationnel.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(hasPermission(user, 'equipements', 'read') || isLecteur(user)) && (
                                                    <button
                                                        onClick={() => openEquipementDetailsModal(eq.id_equipement)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Détails"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'equipements', 'update') && (
                                                    <button
                                                        onClick={() => openEquipementEditModal(eq.id_equipement)}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Modifier"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'equipements', 'delete') && (
                                                    <button
                                                        onClick={() => handleDelete(eq)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                {!isLoading && data && data.meta.total > 0 && (
                    <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Page {data.meta.current_page} sur {data.meta.last_page} • Total de {data.meta.total} actifs
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 shadow-sm"
                                disabled={data.meta.current_page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Précèdent
                            </button>
                            <button
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 shadow-sm"
                                disabled={data.meta.current_page === data.meta.last_page}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

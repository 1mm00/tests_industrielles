import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    CheckCircle2,
    Clock,
    ShieldAlert,
} from 'lucide-react';
import { ncService, NcFilters } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { exportToPDF } from '@/utils/pdfExport';
import { useAuthStore } from '@/store/authStore';
import { hasPermission, isLecteur } from '@/utils/permissions';

export default function NonConformitesPage() {
    const { user } = useAuthStore();
    const { openNcModal, openNcEditModal } = useModalStore();
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

    const handleExportPDF = () => {
        if (!data?.data) return;

        const headers = ["ID NC", "Description", "Type", "Équipement / Test", "Date Détection", "Statut"];
        const body = data.data.map((nc: any) => [
            nc.numero_nc,
            nc.description,
            nc.type_nc,
            `${nc.equipement?.designation || 'N/A'} \n(${nc.test?.numero_test || 'NC Directe'})`,
            formatDate(nc.date_detection),
            nc.statut
        ]);

        exportToPDF({
            title: "Rapport des Non-Conformités Industrielles",
            filename: "liste_nc",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Non-Conformités</h1>
                    <p className="text-xs text-gray-500 font-bold italic">Gestion et suivi des écarts qualité et sécurité</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasPermission(user, 'rapports', 'export') && (
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
                        >
                            <Download className="h-3.5 w-3.5 text-primary-600" />
                            <span className="hidden sm:inline">Exporter PDF</span>
                        </button>
                    )}
                    {hasPermission(user, 'non_conformites', 'create') && (
                        <button
                            onClick={openNcModal}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Déclarer une NC</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total NC</p>
                        <h3 className="text-base font-black text-gray-900">{stats?.summary?.total || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 border-l-4 border-l-rose-500">
                    <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ouvertes</p>
                        <h3 className="text-base font-black text-rose-600">{stats?.summary?.ouvertes || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 border-l-4 border-l-amber-500">
                    <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">En Cours</p>
                        <h3 className="text-base font-black text-amber-600">{stats?.summary?.en_cours || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 border-l-4 border-l-emerald-500">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Clôturées</p>
                        <h3 className="text-base font-black text-emerald-600">{stats?.summary?.cloturees || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Recherche par numéro, description..."
                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-3.5 w-3.5 text-gray-400" />
                    <select
                        className="flex-1 md:w-44 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-600 uppercase tracking-tight"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="OUVERTE">Ouverte</option>
                        <option value="TRAITEMENT">En Cours</option>
                        <option value="CLOTUREE">Clôturée</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">ID NC</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Description</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Équipement / Test</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Date Détection</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-4 py-5"><div className="h-6 bg-gray-50 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <ShieldAlert className="h-10 w-10 text-gray-400" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Aucune non-conformité détectée</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((nc: any) => (
                                    <tr key={nc.id_non_conformite} className="hover:bg-blue-50/20 transition-all group border-b border-gray-50 last:border-0 border-l-4 border-l-transparent hover:border-l-rose-500">
                                        <td className="px-4 py-2">
                                            <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block">
                                                {nc.numero_nc}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="max-w-[200px] xl:max-w-sm">
                                                <p className="text-xs font-black text-gray-800 line-clamp-1">{nc.description}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{nc.type_nc}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-700 truncate max-w-[150px]">{nc.equipement?.designation || 'Équipement non spécifié'}</span>
                                                <span className="text-[9px] text-gray-400 font-bold italic">{nc.test?.numero_test || 'Intervention Directe'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="text-[11px] font-bold text-gray-600">{formatDate(nc.date_detection, 'short')}</span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={cn(
                                                "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                                nc.statut === 'OUVERTE' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    nc.statut === 'TRAITEMENT' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            )}>
                                                {nc.statut}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {(hasPermission(user, 'non_conformites', 'read') || isLecteur(user)) && (
                                                    <button
                                                        onClick={() => openNcEditModal(nc.id_non_conformite)}
                                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="Détails"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                {nc.statut !== 'CLOTUREE' && (hasPermission(user, 'non_conformites', 'update') || hasPermission(user, 'non_conformites', 'close')) && (
                                                    <button
                                                        onClick={() => openNcEditModal(nc.id_non_conformite)}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Traiter"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
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

                {/* Pagination */}
                {!isLoading && data && data.meta.total > 0 && (
                    <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Page {data.meta.current_page} sur {data.meta.last_page}
                        </span>
                        <div className="flex gap-1.5">
                            <button
                                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                disabled={data.meta.current_page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Préc.
                            </button>
                            <button
                                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                disabled={data.meta.current_page === data.meta.last_page}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            >
                                Suiv.
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

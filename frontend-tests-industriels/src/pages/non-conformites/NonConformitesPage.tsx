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

export default function NonConformitesPage() {
    const { openNcModal } = useModalStore();
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Non-Conformités</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Gestion et suivi des écarts qualité et sécurité</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 border border-black bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold text-sm shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Exporter PDF
                    </button>
                    <button
                        onClick={openNcModal}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300"
                    >
                        <Plus className="h-4 w-4" />
                        Déclarer une NC
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border border-gray-100">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total NC</p>
                        <h3 className="text-xl font-bold text-gray-900">{stats?.summary?.total || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-red-500">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ouvertes</p>
                        <h3 className="text-xl font-bold text-red-600">{stats?.summary?.ouvertes || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-orange-500">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Cours</p>
                        <h3 className="text-xl font-bold text-orange-600">{stats?.summary?.en_cours || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-green-500">
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clôturées</p>
                        <h3 className="text-xl font-bold text-green-600">{stats?.summary?.cloturees || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par numéro ou description..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        className="flex-1 md:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-600 uppercase tracking-tight"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="OUVERTE">Ouverte</option>
                        <option value="EN_COURS">En Cours</option>
                        <option value="CLOTUREE">Clôturée</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="card bg-white shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Numéro NC</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Équipement / Test</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Détection</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-gray-50 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShieldAlert className="h-12 w-12 text-gray-200" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucune non-conformité trouvée</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((nc: any) => (
                                    <tr key={nc.id_non_conformite} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100">
                                                {nc.numero_nc}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs xl:max-w-md">
                                                <p className="text-sm font-bold text-gray-800 line-clamp-1 truncate">{nc.description}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter truncate">{nc.type_nc}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-gray-700">{nc.equipement?.designation || 'N/A'}</span>
                                                <span className="text-[10px] text-gray-400 font-medium italic">{nc.test?.numero_test || 'NC Directe'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-gray-600">{formatDate(nc.date_detection)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                                                nc.statut === 'OUVERTE' ? "bg-red-50 text-red-600 border-red-100" :
                                                    nc.statut === 'EN_COURS' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                        "bg-green-50 text-green-600 border-green-100"
                                            )}>
                                                {nc.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white hover:text-primary-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400" title="Voir détails">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white hover:text-green-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400" title="Traiter">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
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
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Page {data.meta.current_page} sur {data.meta.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                disabled={data.meta.current_page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Précédent
                            </button>
                            <button
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-50 transition-colors"
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

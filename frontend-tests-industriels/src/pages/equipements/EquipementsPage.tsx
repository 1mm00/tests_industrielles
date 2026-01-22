import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    Settings,
    ShieldCheck,
    AlertCircle,
    MapPin,
    Cpu
} from 'lucide-react';
import { equipementsService, EquipementFilters } from '@/services/equipementsService';
import { cn } from '@/utils/helpers';
import { exportToPDF } from '@/utils/pdfExport';

export default function EquipementsPage() {
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

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, statut: e.target.value, page: 1 }));
    };

    const handleExportPDF = () => {
        if (!data?.data) return;

        const headers = ["Code", "Désignation", "Catégorie", "Localisation", "Criticité", "Statut"];
        const body = data.data.map((eq: any) => [
            eq.code_equipement,
            eq.designation,
            eq.categorie_equipement,
            `${eq.localisation_site} (${eq.localisation_precise})`,
            `Niveau ${eq.niveau_criticite}`,
            eq.statut_operationnel.replace('_', ' ')
        ]);

        exportToPDF({
            title: "Inventaire du Parc Équipements Industriels",
            filename: "liste_equipements",
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
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Parc Équipements</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Inventaire technique et suivi opérationnel des actifs</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 border border-black bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold text-sm shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Exporter PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300">
                        <Plus className="h-4 w-4" />
                        Ajouter un Équipement
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border border-gray-100">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Actifs</p>
                        <h3 className="text-xl font-bold text-gray-900">{stats?.total || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-green-500">
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Service</p>
                        <h3 className="text-xl font-bold text-green-600">{stats?.en_service || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-orange-500">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Maintenance</p>
                        <h3 className="text-xl font-bold text-orange-600">{stats?.en_maintenance || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-red-500">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Critiques</p>
                        <h3 className="text-xl font-bold text-red-600">{stats?.critiques || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, désignation ou modèle..."
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
                        <option value="EN_SERVICE">En Service</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="HORS_SERVICE">Hors Service</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="card bg-white shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code / Désignation</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Localisation</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Criticité</th>
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
                                            <Cpu className="h-12 w-12 text-gray-200" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun équipement trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((eq: any) => (
                                    <tr key={eq.id_equipement} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100 w-fit mb-1">
                                                    {eq.code_equipement}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800">{eq.designation}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700">{eq.categorie_equipement}</span>
                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{eq.sous_categorie || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold">{eq.localisation_site}</span>
                                                    <span className="text-[10px] text-gray-400">{eq.localisation_precise}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                                                eq.niveau_criticite >= 4 ? "bg-red-50 text-red-600 border-red-100" :
                                                    eq.niveau_criticite === 3 ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                        "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                Niveau {eq.niveau_criticite}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                                                eq.statut_operationnel === 'EN_SERVICE' ? "bg-green-50 text-green-600 border-green-100" :
                                                    eq.statut_operationnel === 'MAINTENANCE' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {eq.statut_operationnel.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white hover:text-primary-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400" title="Voir détails">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white hover:text-orange-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400" title="Maintenance">
                                                    <Settings className="h-4 w-4" />
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

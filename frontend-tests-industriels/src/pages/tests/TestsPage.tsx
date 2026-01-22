import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FlaskConical,
    Search,
    Filter,
    Plus,
    Download,
    MoreVertical,
    Eye,
    Play,
    CheckCircle,
    Calendar,
    MapPin,
    AlertCircle,
} from 'lucide-react';
import { testsService, TestFilters } from '@/services/testsService';
import { formatDate, getStatusColor, getCriticalityColor } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { exportToPDF } from '@/utils/pdfExport';

export default function TestsPage() {
    const { openTestModal } = useModalStore();
    const [filters, setFilters] = useState<TestFilters>({
        page: 1,
        per_page: 10,
    });

    const { data, isLoading } = useQuery({
        queryKey: ['tests', filters],
        queryFn: () => testsService.getTests(filters),
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, statut: e.target.value, page: 1 }));
    };

    const handleExportPDF = () => {
        if (!data?.data) return;

        const headers = ["ID Test", "Type de Test", "Équipement", "Date Prévue", "Criticité", "Statut"];
        const body = data.data.map(test => [
            test.numero_test,
            test.type_test?.libelle_type || 'N/A',
            `${test.equipement?.designation} (${test.equipement?.code_equipement})`,
            formatDate(test.date_test),
            `Niveau ${test.niveau_criticite || 1}`,
            test.statut_test
        ]);

        exportToPDF({
            title: "Rapport d'Exportation des Tests Industriels",
            filename: "liste_tests",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header section with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Gestion des Tests</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Suivi et exécution des contrôles industriels</p>
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
                        onClick={openTestModal}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Test
                    </button>
                </div>
            </div>

            {/* Top Stats Row (Visual highlight) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-primary-600 text-white p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <FlaskConical className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Total Tests</p>
                        <h3 className="text-2xl font-bold">{data?.meta.total || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 border-l-4 border-l-yellow-500 bg-white shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                        <Play className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">En Cours</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {data?.data.filter(t => t.statut_test === 'En cours').length || 0}
                        </h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 border-l-4 border-l-red-500 bg-white shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Critiques</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {data?.data.filter(t => (t.niveau_criticite || 0) >= 3).length || 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 bg-white shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par numéro, équipement ou type..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-semibold text-gray-700"
                                onChange={handleStatusFilter}
                            >
                                <option value="">Tous les statuts</option>
                                <option value="Planifié">Planifié</option>
                                <option value="En cours">En cours</option>
                                <option value="Terminé">Terminé</option>
                                <option value="Suspendu">Suspendu</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tests List / Table */}
            <div className="card overflow-hidden bg-white shadow-lg border-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Test</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Équipement</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Planification</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Criticité</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                        Aucun test trouvé
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((test) => (
                                    <tr key={test.id_test} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {test.numero_test}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                                                    {test.type_test?.libelle_type || 'Type inconnu'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs ring-1 ring-primary-100">
                                                    {test.equipement?.code_equipement?.substring(0, 2) || 'EQ'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-800">{test.equipement?.designation}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{test.equipement?.code_equipement}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {formatDate(test.date_test, 'short')}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                                    <MapPin className="h-3 w-3" />
                                                    {test.localisation || 'Zone indéf.'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCriticalityColor(test.niveau_criticite || 1)}`}>
                                                Niveau {test.niveau_criticite || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(test.statut_test)}`}>
                                                {test.statut_test}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-all" title="Voir les détails">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {test.statut_test === 'Planifié' && (
                                                    <button className="p-2 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-all" title="Démarrer le test">
                                                        <Play className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {test.statut_test === 'En cours' && (
                                                    <button className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-all" title="Finaliser le test">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
                                                    <MoreVertical className="h-4 w-4" />
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

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    FlaskConical,
    Search,
    Filter,
    Plus,
    Download,
    Eye,
    Play,
    CheckCircle2,
    Calendar,
    MapPin,
    AlertCircle,
    Pencil,
    Trash2,
    FileDown,
} from 'lucide-react';
import { testsService, TestFilters } from '@/services/testsService';
import { formatDate, getStatusColor, getCriticalityColor } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { exportToPDF, exportTestReportPDF } from '@/utils/pdfExport';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permissions';

export default function TestsPage() {
    const { user } = useAuthStore();
    const { openTestModal, openExecutionModal } = useModalStore();
    const queryClient = useQueryClient();
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
            test.type_test?.libelle || 'N/A',
            `${test.equipement?.designation} (${test.equipement?.code_equipement})`,
            formatDate(test.date_test),
            `Niveau ${test.niveau_criticite || 1}`,
            test.statut_test
        ]);

        exportToPDF({
            title: "Rapport d'Exportation des Tests Industriels",
            filename: "liste_tests_complet",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    const handleExportSinglePDF = (test: any) => {
        // Le test ici contient les relations chargées par l'API
        // On s'assure d'avoir toutes les données requises par exportTestReportPDF
        exportTestReportPDF(test);
    };

    const handleDeleteClick = (id: string, numero: string) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 uppercase">Supprimer le test ?</p>
                        <p className="text-[10px] text-gray-500 font-bold">{numero}</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Cette action supprimera toutes les mesures et données associées. Les NC et rapports resteront archivés.
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
                            await executeDelete(id, numero);
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

    const executeDelete = async (id: string, numero: string) => {
        const loadingToast = toast.loading(`Destruction de ${numero} en cours...`);
        try {
            await testsService.deleteTest(id);
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast.success(`Le test ${numero} a été supprimé définitivement.`, {
                id: loadingToast,
                icon: '✅',
                className: 'font-bold text-xs'
            });
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Suppression impossible : des dépendances (NC ou Rapports) bloquent l'opération par sécurité.",
                { id: loadingToast, duration: 5000 }
            );
        }
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
                    {hasPermission(user, 'rapports', 'export') && (
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 border border-black bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold text-sm shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Exporter PDF
                        </button>
                    )}
                    {hasPermission(user, 'tests', 'create') && (
                        <button
                            onClick={() => openTestModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau Test
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats Row (Visual highlight) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-4 border-l-4 border-l-primary-600 bg-white shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                        <FlaskConical className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Tests</p>
                        <h3 className="text-2xl font-bold text-gray-900">{data?.meta.total || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 border-l-4 border-l-yellow-500 bg-white shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                        <Play className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">En Cours</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {data?.data.filter(t => t.statut_test === 'EN_COURS').length || 0}
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
                                <option value="PLANIFIE">Planifié</option>
                                <option value="EN_COURS">En cours</option>
                                <option value="TERMINE">Terminé</option>
                                <option value="SUSPENDU">Suspendu</option>
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
                                                    {test.type_test?.libelle || 'Type inconnu'}
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 group/actions">
                                                {/* Edit - Planifié only */}
                                                {test.statut_test === 'PLANIFIE' && hasPermission(user, 'tests', 'update') && (
                                                    <button
                                                        onClick={() => openTestModal(test.id_test)}
                                                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Modifier le test"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {/* Export PDF */}
                                                <button
                                                    onClick={() => handleExportSinglePDF(test)}
                                                    className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                                                    title="Exporter PDF"
                                                >
                                                    <FileDown className="h-4 w-4" />
                                                </button>

                                                {/* Delete */}
                                                {hasPermission(user, 'tests', 'delete') && (
                                                    <button
                                                        onClick={() => handleDeleteClick(test.id_test, test.numero_test)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {/* Spacer/Separator */}
                                                <div className="w-px h-8 bg-gray-100 mx-1" />

                                                {/* Primary Contextual Action */}
                                                {test.statut_test === 'PLANIFIE' ? (
                                                    <button
                                                        onClick={() => openExecutionModal(test.id_test)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                                                    >
                                                        <Play className="h-3 w-3 fill-current" />
                                                        Démarrer
                                                    </button>
                                                ) : test.statut_test === 'EN_COURS' ? (
                                                    <button
                                                        onClick={() => openExecutionModal(test.id_test)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Finaliser
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 border border-gray-200"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Détails
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

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    FlaskConical,
    Search,
    Filter,
    Plus,
    Eye,
    Play,
    CheckCircle2,
    Calendar,
    MapPin,
    Pencil,
    Trash2,
    FileDown,
    FileText,
    Activity,
    ShieldCheck,
    Stethoscope,
    Users
} from 'lucide-react';
import { testsService, TestFilters } from '@/services/testsService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { exportToPDF, exportTestReportPDF } from '@/utils/pdfExport';
import { useAuthStore } from '@/store/authStore';
import { hasPermission, isLecteur } from '@/utils/permissions';

export default function TestsPage() {
    const { user } = useAuthStore();
    const { openTestModal, openExecutionModal, openTestDetailsModal } = useModalStore();
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
        <div className="space-y-4">
            {/* Header section with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Gestion des Tests</h1>
                    <p className="text-xs text-gray-500 font-bold italic">Suivi et exécution des contrôles industriels</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasPermission(user, 'rapports', 'export') && (
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
                        >
                            <FileDown className="h-3.5 w-3.5 text-primary-600" />
                            <span className="hidden sm:inline">Exporter PDF</span>
                        </button>
                    )}
                    {hasPermission(user, 'tests', 'create') && (
                        <button
                            onClick={() => openTestModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Nouveau Test</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats Row (Visual highlight) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                            <FlaskConical className="h-5 w-5 lg:h-6 lg:w-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[1.5px]">Total Tests</p>
                            <h3 className="text-xl lg:text-2xl font-black text-gray-900 mt-0.5">{data?.meta.total || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
                        <div className="h-full bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" style={{ width: '85%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
                            <Activity className="h-5 w-5 lg:h-6 lg:w-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[1.5px]">En Cours</p>
                            <h3 className="text-xl lg:text-2xl font-black text-gray-900 mt-0.5">
                                {data?.data.filter(t => t.statut_test === 'EN_COURS').length || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
                        <div className="h-full bg-amber-500 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" style={{ width: '45%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.1)] group-hover:shadow-[0_0_20px_rgba(225,29,72,0.2)] transition-all">
                            <ShieldCheck className="h-5 w-5 lg:h-6 lg:w-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[1.5px]">Critiques</p>
                            <h3 className="text-xl lg:text-2xl font-black text-gray-900 mt-0.5">
                                {data?.data.filter(t => (t.niveau_criticite || 0) >= 3).length || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
                        <div className="h-full bg-rose-500 rounded-r-full shadow-[0_0_8px_rgba(225,29,72,0.4)]" style={{ width: '12%' }}></div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Recherche rapide..."
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-40">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <select
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-bold text-gray-700"
                                onChange={handleStatusFilter}
                            >
                                <option value="">Statut</option>
                                <option value="PLANIFIE">Planifié</option>
                                <option value="EN_COURS">En cours</option>
                                <option value="TERMINE">Terminé</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tests List / Table */}
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">ID Test</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Équipement</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Echéance</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Expert</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Statut</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-4 py-6">
                                            <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-xs font-bold italic">
                                        Aucun test enregistré
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((test) => (
                                    <tr key={test.id_test} className="hover:bg-blue-50/20 transition-all group border-b border-gray-50 last:border-0 border-l-4 border-l-transparent hover:border-l-primary-500">
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {test.numero_test}
                                                </span>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                    {test.type_test?.libelle || 'Standard'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3 group/tooltip cursor-help relative">
                                                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700 font-black text-[10px] border border-gray-100 group-hover/tooltip:bg-blue-50 group-hover/tooltip:text-blue-600 transition-all shrink-0">
                                                    {test.equipement?.code_equipement?.substring(0, 2) || 'EQ'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-black text-gray-800 truncate">{test.equipement?.designation}</span>
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-1 rounded">{test.equipement?.code_equipement}</span>
                                                        <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest truncate">{test.instrument?.code_instrument || 'AUTO'}</span>
                                                    </div>
                                                </div>
                                                {/* Tooltip Metrologique */}
                                                <div className="absolute bottom-full left-0 mb-1 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 min-w-[200px] pointer-events-none">
                                                    <div className="bg-gray-950 text-white p-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Stethoscope className="h-3.5 w-3.5 text-blue-400" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Métrologie Instrument</span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div>
                                                                <p className="text-[8px] text-gray-500 uppercase font-black">Dernière Calibration</p>
                                                                <p className="text-[10px] font-bold text-gray-300">{test.instrument?.date_derniere_calibration ? formatDate(test.instrument.date_derniere_calibration) : 'Donnée indisponible'}</p>
                                                            </div>
                                                            <div className="h-px bg-white/5"></div>
                                                            <div>
                                                                <p className="text-[8px] text-gray-500 uppercase font-black">Prochaine Échéance</p>
                                                                <p className="text-[10px] font-bold text-amber-500">{test.instrument?.date_prochaine_calibration ? formatDate(test.instrument.date_prochaine_calibration) : 'À planifier'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-3 h-3 bg-gray-950 transform rotate-45 ml-4 -mt-1.5 border-r border-b border-white/10"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-700 font-black">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                    {formatDate(test.date_test, 'short')}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                    <MapPin className="h-3.5 w-3.5 text-gray-300" />
                                                    {test.localisation || 'Salle de Test A1'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white">
                                                    {test.responsable?.nom_complet || test.responsable?.nom ? (
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(test.responsable?.nom_complet || `${test.responsable?.prenom || ''} ${test.responsable?.nom || ''}`.trim())}&background=random&color=fff`} alt="" />
                                                    ) : (
                                                        <Users className="h-3.5 w-3.5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-black text-gray-800 truncate max-w-[80px]">
                                                        {test.responsable?.nom_complet || `${test.responsable?.prenom || ''} ${test.responsable?.nom || ''}`.trim() || 'Inconnu'}
                                                    </span>
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Certifié</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className={cn(
                                                "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-[1.2px] flex items-center gap-1.5 border w-fit shadow-sm",
                                                test.statut_test === 'TERMINE'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : test.statut_test === 'EN_COURS'
                                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {test.statut_test === 'TERMINE' && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>}
                                                {test.statut_test === 'EN_COURS' && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span></span>}
                                                {test.statut_test}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center justify-end gap-3 px-2 group/actions">
                                                {/* Actions pour Tests Planifiés ou En Cours */}
                                                {(test.statut_test === 'PLANIFIE' || test.statut_test === 'EN_COURS') && (
                                                    <>
                                                        {hasPermission(user, 'tests', 'update') && (
                                                            <button
                                                                onClick={() => openTestModal(test.id_test)}
                                                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                                title="Modifier la planification"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                        )}
                                                        {hasPermission(user, 'tests', 'delete') && (
                                                            <button
                                                                onClick={() => handleDeleteClick(test.id_test, test.numero_test)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                title="Annuler le test"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}

                                                        {/* Raccourcis d'exécution (facultatif mais utile pour le workflow) */}
                                                        <div className="w-px h-5 bg-gray-100 mx-1" />
                                                        {test.statut_test === 'PLANIFIE' && !isLecteur(user) ? (
                                                            <button onClick={() => openExecutionModal(test.id_test)} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95" title="Lancer le test">
                                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                            </button>
                                                        ) : test.statut_test === 'EN_COURS' && !isLecteur(user) ? (
                                                            <button onClick={() => openExecutionModal(test.id_test)} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95" title="Saisir les mesures">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        ) : null}
                                                    </>
                                                )}

                                                {/* Actions pour Tests Terminés */}
                                                {(test.statut_test === 'TERMINE') && (
                                                    <>
                                                        <button
                                                            onClick={() => openTestDetailsModal(test.id_test)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Consulter les mesures archivées"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleExportSinglePDF(test)}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Récupérer le rapport PDF"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                        {hasPermission(user, 'tests', 'delete') && (
                                                            <button
                                                                onClick={() => handleDeleteClick(test.id_test, test.numero_test)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                title="Gestion de l'historique (Supprimer)"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </>
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
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
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

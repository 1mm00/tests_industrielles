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
    FileText,
    Activity,
    ShieldCheck,
    Stethoscope,
    Users,
    ClipboardList,
    TrendingUp,
    ShieldAlert,
    Target
} from 'lucide-react';
import { testsService, TestFilters } from '@/services/testsService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { exportTestReportPDF } from '@/utils/pdfExport';
import { useAuthStore } from '@/store/authStore';
import { hasPermission, isLecteur } from '@/utils/permissions';

export default function TestsPage() {
    const { user } = useAuthStore();
    const { openTestModal, openExecutionModal, openTestDetailsModal } = useModalStore();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<TestFilters>({
        page: 1,
        per_page: 10,
        search: '',
        statut: ''
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
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">
            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <ClipboardList className="h-7 w-7 text-indigo-600" />
                        Registre des Tests
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Suivi analytique et orchestration des contrôles industriels</p>
                </div>
                <div className="flex items-center gap-3">

                    {hasPermission(user, 'tests', 'create') && (
                        <button
                            onClick={() => openTestModal()}
                            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                            Planifier un Test
                        </button>
                    )}
                </div>
            </div>

            {/* 2. KPI Cards Row (The core "Dashboard" look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                            <FlaskConical className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocoles</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{data?.meta.total || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Exécution</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">
                                {data?.data.filter(t => t.statut_test === 'EN_COURS').length || 0}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-sm">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haute Criticité</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">
                                {data?.data.filter(t => (t.niveau_criticite || 0) >= 4).length || 0}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux Succès</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">94.2%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par n° de test, équipement, expert..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all appearance-none"
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous les Statuts</option>
                        <option value="PLANIFIE">Planifié</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="TERMINE">Terminé</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Table View (The Professional Dashboard look) */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Identification</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Équipement & Instrument</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Planification</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Expertise</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-7 py-6">
                                            <div className="h-10 bg-slate-50 rounded-2xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-7 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <ClipboardList className="h-16 w-16 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun test dans le registre</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((test) => (
                                    <tr key={test.id_test} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{test.numero_test}</span>
                                                <span className="text-[13px] font-black text-slate-800 capitalize mt-0.5">{test.type_test?.libelle || 'Standard'}</span>
                                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 italic mt-1">{test.observations_generales || 'Protocole AeroTech Standard'}</p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-3 group/tooltip cursor-help relative">
                                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 font-black text-[10px] border border-slate-100 group-hover:bg-white group-hover:text-indigo-600 transition-all shrink-0">
                                                    {test.equipement?.code_equipement?.substring(0, 2) || 'EQ'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[12px] font-black text-slate-800 truncate">{test.equipement?.designation}</span>
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-md">{test.equipement?.code_equipement}</span>
                                                        <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md">{test.instrument?.code_instrument || 'AUTO'}</span>
                                                    </div>
                                                </div>
                                                {/* Tooltip Metrologique */}
                                                <div className="absolute bottom-full left-0 mb-1 invisible group-hover:visible group-hover:opacity-100 transition-all z-50 min-w-[200px] pointer-events-none opacity-0">
                                                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Stethoscope className="h-3.5 w-3.5 text-blue-400" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Métrologie Instrument</span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div>
                                                                <p className="text-[8px] text-slate-500 uppercase font-black">Dernière Calibration</p>
                                                                <p className="text-[10px] font-bold text-slate-300">{test.instrument?.date_derniere_calibration ? formatDate(test.instrument.date_derniere_calibration) : 'Donnée indisponible'}</p>
                                                            </div>
                                                            <div className="h-px bg-white/5"></div>
                                                            <div>
                                                                <p className="text-[8px] text-slate-500 uppercase font-black">Prochaine Échéance</p>
                                                                <p className="text-[10px] font-bold text-amber-500">{test.instrument?.date_prochaine_calibration ? formatDate(test.instrument.date_prochaine_calibration) : 'À planifier'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-3 h-3 bg-slate-900 transform rotate-45 ml-4 -mt-1.5 border-r border-b border-white/10"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                                                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                                    {formatDate(test.date_test)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-300" />
                                                    {test.localisation || 'Atelier Principal'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-9 w-9 rounded-full border border-white shadow-sm ring-2 ring-slate-50 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {test.responsable?.nom ? (
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${test.responsable?.prenom || ''} ${test.responsable?.nom || ''}`.trim())}&background=6366f1&color=fff&bold=true`} alt="" />
                                                    ) : (
                                                        <Users className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-black text-slate-800 truncate">
                                                        {test.responsable?.nom_complet || `${test.responsable?.prenom || ''} ${test.responsable?.nom || ''}`.trim() || 'Inconnu'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Technicien Qualifié</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                                                    test.statut_test === 'TERMINE'
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : test.statut_test === 'EN_COURS'
                                                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                            : "bg-amber-50 text-amber-700 border-amber-100"
                                                )}>
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        test.statut_test === 'TERMINE' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                                                            test.statut_test === 'EN_COURS' ? "bg-indigo-500 shadow-[0_0_8px_#6366f1]" :
                                                                "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                                                    )} />
                                                    {test.statut_test}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(test.statut_test === 'PLANIFIE' || test.statut_test === 'EN_COURS') && (
                                                    <>
                                                        {hasPermission(user, 'tests', 'update') && (
                                                            <button
                                                                onClick={() => openTestModal(test.id_test)}
                                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                                title="Modifier"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                        )}
                                                        {!isLecteur(user) && (
                                                            <button
                                                                onClick={() => openExecutionModal(test.id_test)}
                                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                                title="Exécuter"
                                                            >
                                                                <Play size={18} className="fill-current" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => openTestDetailsModal(test.id_test)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                    title="Détails"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {(test.statut_test === 'TERMINE') && (
                                                    <button
                                                        onClick={() => handleExportSinglePDF(test)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Rapport PDF"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                )}

                                                {hasPermission(user, 'tests', 'delete') && (
                                                    <button
                                                        onClick={() => handleDeleteClick(test.id_test, test.numero_test)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
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

                {/* Optional: Footer Pagination (Dashboard Style) */}
                {!isLoading && data && data.meta.total > 0 && (
                    <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Total de {data.meta.total} tests répertoriés
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"
                                disabled={data.meta.current_page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Précèdent
                            </button>
                            <button
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"
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

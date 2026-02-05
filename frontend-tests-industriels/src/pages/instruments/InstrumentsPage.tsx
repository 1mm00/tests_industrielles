import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Thermometer,
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Scale,
    Trash2,
    Settings,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { instrumentsService, InstrumentFilters } from '@/services/instrumentsService';
import { formatDate, cn } from '@/utils/helpers';
import { exportToPDF } from '@/utils/pdfExport';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission, isLecteur } from '@/utils/permissions';
import toast from 'react-hot-toast';

export default function InstrumentsPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { openInstrumentCreateModal, openInstrumentDetailsModal } = useModalStore();
    const [filters, setFilters] = useState<InstrumentFilters>({
        page: 1,
        per_page: 10,
        search: '',
        statut: '',
        calibration_filter: '',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['instruments', filters],
        queryFn: () => instrumentsService.getPaginatedInstruments(filters),
    });

    const { data: stats } = useQuery({
        queryKey: ['instrument-stats'],
        queryFn: () => instrumentsService.getInstrumentStats(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => instrumentsService.deleteInstrument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instruments'] });
            queryClient.invalidateQueries({ queryKey: ['instrument-stats'] });
            toast.success('Instrument archivé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    });

    const handleDelete = (id: string, code: string) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 uppercase">Supprimer l'instrument ?</p>
                        <p className="text-[10px] text-gray-500 font-bold">{code}</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Cette action supprimera définitivement l'instrument de mesure. L'historique de calibration sera conservé pour l'archivage légal.
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
                            deleteMutation.mutate(id);
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

    const handleCalibrationFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, calibration_filter: e.target.value as any, page: 1 }));
    };

    const handleExportPDF = () => {
        if (!data?.data) return;

        const headers = ["Code", "Désignation", "Métrologie", "Dernière Calib.", "Prochaine Calib.", "Statut"];
        const body = data.data.map((inst: any) => [
            inst.code_instrument,
            inst.designation,
            `${inst.categorie_mesure}\n(${inst.plage_mesure_min} - ${inst.plage_mesure_max} ${inst.unite_mesure})`,
            formatDate(inst.date_derniere_calibration),
            formatDate(inst.date_prochaine_calibration),
            inst.statut.replace('_', ' ')
        ]);

        exportToPDF({
            title: "Inventaire du Parc Instruments de Mesure",
            filename: "liste_instruments",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Scale className="h-7 w-7 text-indigo-600" />
                        Parc Métrologique
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Certification et précision des instruments de mesure</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission(user, 'rapports', 'export') && (
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest shadow-sm active:scale-95"
                        >
                            <Download className="h-4 w-4 text-indigo-600" />
                            <span className="hidden sm:inline">Export PDF</span>
                        </button>
                    )}
                    {hasPermission(user, 'instruments', 'create') && (
                        <button
                            onClick={openInstrumentCreateModal}
                            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                            Ajouter Instrument
                        </button>
                    )}
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instruments</p>
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
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Service</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.operationnels || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.operationnels / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calib. Échues</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats?.calibration_echue || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.calibration_echue / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">À Calibrer</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats?.calibration_proche || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.calibration_proche / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher par code, désignation, fabricant..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous statuts</option>
                        <option value="OPERATIONNEL">Opérationnel</option>
                        <option value="EN_CALIBRATION">Calibration</option>
                        <option value="HORS_SERVICE">Hors Service</option>
                    </select>
                    <select
                        className="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all"
                        value={filters.calibration_filter}
                        onChange={handleCalibrationFilter}
                    >
                        <option value="">Toutes Calib.</option>
                        <option value="expired">Échues</option>
                        <option value="upcoming">Prochaines (30j)</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Table */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Code / Instrument</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Métrologie</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Calibration</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-7 py-6"><div className="h-8 bg-slate-50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-7 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Thermometer className="h-16 w-16 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun instrument identifié</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((inst: any) => (
                                    <tr key={inst.id_instrument} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{inst.code_instrument}</span>
                                                <span className="text-[13px] font-black text-slate-800 capitalize mt-0.5">{inst.designation}</span>
                                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 italic mt-1">{inst.fabricant} • {inst.modele}</p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-tight w-fit">
                                                    {inst.categorie_mesure}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Plage: {inst.plage_mesure_min}-{inst.plage_mesure_max} {inst.unite_mesure}</span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                                    <Clock className="h-3.5 w-3.5 text-slate-300" />
                                                    Dernière: {formatDate(inst.date_derniere_calibration)}
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter",
                                                    new Date(inst.date_prochaine_calibration) < new Date() ? "text-rose-600" : "text-slate-400"
                                                )}>
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Prochaine: {formatDate(inst.date_prochaine_calibration)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    inst.statut === 'OPERATIONNEL' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                                                        inst.statut === 'EN_CALIBRATION' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                                                            "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    inst.statut === 'OPERATIONNEL' ? "text-emerald-600" :
                                                        inst.statut === 'EN_CALIBRATION' ? "text-amber-600" :
                                                            "text-rose-600"
                                                )}>
                                                    {inst.statut.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(hasPermission(user, 'instruments', 'read') || isLecteur(user)) && (
                                                    <button
                                                        onClick={() => openInstrumentDetailsModal(inst.id_instrument)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Détails"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'instruments', 'update') && (
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Paramètres / Calibration"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'instruments', 'delete') && (
                                                    <button
                                                        onClick={() => handleDelete(inst.id_instrument, inst.code_instrument)}
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
                            Page {data.meta.current_page} sur {data.meta.last_page} • Total de {data.meta.total} instruments
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

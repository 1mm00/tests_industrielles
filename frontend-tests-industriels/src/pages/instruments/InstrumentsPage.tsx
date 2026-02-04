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
    Settings
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
        },
    });

    const handleDelete = (id: string, code: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-[13px] uppercase tracking-tight">Supprimer l'instrument ?</p>
                        <p className="text-[10px] text-gray-500 font-bold">{code}</p>
                    </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    Cette action est irréversible et supprimera l'historique de calibration associé.
                </p>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                deleteMutation.mutateAsync(id),
                                {
                                    loading: 'Suppression...',
                                    success: 'Instrument supprimé',
                                    error: 'Erreur suppression',
                                }
                            );
                        }}
                        className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        ), {
            duration: 8000,
            position: 'top-center',
            style: {
                borderRadius: '20px',
                padding: '16px',
            }
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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Parc Instruments</h1>
                    <p className="text-xs text-gray-500 font-bold italic">Gestion métrologique et suivi calibrations</p>
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
                    {hasPermission(user, 'instruments', 'create') && (
                        <button
                            onClick={openInstrumentCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Ajouter</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                        <Scale className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Instruments</p>
                        <h3 className="text-base font-black text-gray-900">{stats?.total || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 border-l-4 border-l-emerald-500">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">En Service</p>
                        <h3 className="text-base font-black text-emerald-600">{stats?.operationnels || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 border-l-4 border-l-rose-500">
                    <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Calib. Échues</p>
                        <h3 className="text-base font-black text-rose-600">{stats?.calibration_echue || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 border-l-4 border-l-amber-500">
                    <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">À Calibrer</p>
                        <h3 className="text-base font-black text-amber-600">{stats?.calibration_proche || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Chercher (code, désigne, fabricant...)"
                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-3.5 w-3.5 text-gray-400" />
                    <select
                        className="flex-1 md:w-36 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-600 uppercase tracking-tight"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous statuts</option>
                        <option value="OPERATIONNEL">Opérationnel</option>
                        <option value="EN_CALIBRATION">Calibration</option>
                        <option value="HORS_SERVICE">Hors Service</option>
                    </select>
                    <select
                        className="flex-1 md:w-36 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-600 uppercase tracking-tight"
                        value={filters.calibration_filter}
                        onChange={handleCalibrationFilter}
                    >
                        <option value="">Toutes Calib.</option>
                        <option value="expired">Échues</option>
                        <option value="upcoming">Prochaines (30j)</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Code / Instrument</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Métrologie</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Calibration</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-4 py-5"><div className="h-6 bg-gray-50 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Thermometer className="h-10 w-10 text-gray-400" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Aucun instrument trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((inst: any) => (
                                    <tr key={inst.id_instrument} className="hover:bg-blue-50/20 transition-all group border-b border-gray-50 last:border-0 border-l-4 border-l-transparent hover:border-l-primary-500">
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 w-fit">
                                                    {inst.code_instrument}
                                                </span>
                                                <span className="text-xs font-black text-gray-800 mt-1">{inst.designation}</span>
                                                <span className="text-[9px] text-gray-400 font-medium">{inst.fabricant} {inst.modele}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-700">{inst.categorie_mesure}</span>
                                                <span className="text-[9px] text-gray-400 font-medium">Plage: {inst.plage_mesure_min} - {inst.plage_mesure_max} {inst.unite_mesure}</span>
                                                <span className="text-[9px] text-gray-500 font-bold">Précision: {inst.precision}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    Dern.: {formatDate(inst.date_derniere_calibration)}
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter",
                                                    new Date(inst.date_prochaine_calibration) < new Date() ? "text-rose-600" : "text-gray-400"
                                                )}>
                                                    <Calendar className="h-3 w-3" />
                                                    Proch.: {formatDate(inst.date_prochaine_calibration)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={cn(
                                                "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                                inst.statut === 'OPERATIONNEL' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    inst.statut === 'EN_CALIBRATION' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {inst.statut.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {(hasPermission(user, 'instruments', 'read') || isLecteur(user)) && (
                                                    <button
                                                        onClick={() => openInstrumentDetailsModal(inst.id_instrument)}
                                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="Détails techniques"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'instruments', 'update') && (
                                                    <button
                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Paramètres / Calibration"
                                                    >
                                                        <Settings className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'instruments', 'delete') && (
                                                    <button
                                                        onClick={() => handleDelete(inst.id_instrument, inst.code_instrument)}
                                                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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

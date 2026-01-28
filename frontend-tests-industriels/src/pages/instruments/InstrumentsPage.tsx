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
    FileCheck,
    Trash2,
    Settings
} from 'lucide-react';
import { instrumentsService, InstrumentFilters } from '@/services/instrumentsService';
import { formatDate, cn } from '@/utils/helpers';
import { exportToPDF } from '@/utils/pdfExport';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permissions';
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

    // Mutation pour la suppression
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
                <div className="flex items-center gap-2 text-rose-600">
                    <Trash2 className="h-5 w-5" />
                    <span className="font-black uppercase text-xs tracking-widest">Confirmation</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                    Voulez-vous vraiment supprimer l'instrument <span className="font-black text-gray-900">{code}</span> ?
                </p>
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            const promise = deleteMutation.mutateAsync(id);
                            toast.promise(promise, {
                                loading: 'Suppression...',
                                success: 'Instrument supprimé !',
                                error: 'Erreur lors de la suppression',
                            });
                        }}
                        className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                    >
                        Supprimer instrument
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            style: {
                borderRadius: '1.5rem',
                background: '#fff',
                color: '#333',
                border: '1px solid #fecaca',
                padding: '1rem',
                minWidth: '350px'
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Parc Instruments</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Gestion métrologique et suivi des calibrations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 border border-black bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold text-sm shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Exporter PDF
                    </button>
                    {hasPermission(user, 'instruments', 'create') && (
                        <button
                            onClick={openInstrumentCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvel Instrument
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border border-gray-100">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instruments</p>
                        <h3 className="text-xl font-bold text-gray-900">{stats?.total || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-green-500">
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Service</p>
                        <h3 className="text-xl font-bold text-green-600">{stats?.operationnels || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-red-500">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Echues</p>
                        <h3 className="text-xl font-bold text-red-600">{stats?.calibration_echue || 0}</h3>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4 bg-white shadow-sm border-l-4 border-l-orange-500">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">A Calibrer</p>
                        <h3 className="text-xl font-bold text-orange-600">{stats?.calibration_proche || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 bg-white shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, désignation, fabricant..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        className="flex-1 md:w-36 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-600 uppercase tracking-tight"
                        value={filters.statut}
                        onChange={handleStatusFilter}
                    >
                        <option value="">Tous statuts</option>
                        <option value="OPERATIONNEL">Opérationnel</option>
                        <option value="EN_CALIBRATION">Calibration</option>
                        <option value="HORS_SERVICE">Hors Service</option>
                    </select>
                    <select
                        className="flex-1 md:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-600 uppercase tracking-tight"
                        value={filters.calibration_filter}
                        onChange={handleCalibrationFilter}
                    >
                        <option value="">Toutes Calib.</option>
                        <option value="expired">Echues</option>
                        <option value="upcoming">Prochaines (30j)</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="card bg-white shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code / Instrument</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Métrologie</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calibration</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-gray-50 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Thermometer className="h-12 w-12 text-gray-200" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun instrument trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((inst: any) => (
                                    <tr key={inst.id_instrument} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100 w-fit mb-1">
                                                    {inst.code_instrument}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800">{inst.designation}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{inst.fabricant} {inst.modele}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700">{inst.categorie_mesure}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">Plage: {inst.plage_mesure_min} - {inst.plage_mesure_max} {inst.unite_mesure}</span>
                                                <span className="text-[10px] text-gray-500 font-bold">Précision: {inst.precision}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    Dernière: {formatDate(inst.date_derniere_calibration)}
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter",
                                                    new Date(inst.date_prochaine_calibration) < new Date() ? "text-red-600" : "text-gray-400"
                                                )}>
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Prochaine: {formatDate(inst.date_prochaine_calibration)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                                                inst.statut === 'OPERATIONNEL' ? "bg-green-50 text-green-600 border-green-100" :
                                                    inst.statut === 'EN_CALIBRATION' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {inst.statut.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {hasPermission(user, 'instruments', 'read') && (
                                                    <button
                                                        onClick={() => openInstrumentDetailsModal(inst.id_instrument)}
                                                        className="p-2 hover:bg-white hover:text-primary-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400"
                                                        title="Détails techniques"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'instruments', 'update') && (
                                                    <button
                                                        className="p-2 hover:bg-white hover:text-orange-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400"
                                                        title="Paramètres / Calibration"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'instruments', 'delete') && (
                                                    <button
                                                        onClick={() => handleDelete(inst.id_instrument, inst.code_instrument)}
                                                        className="p-2 hover:bg-white hover:text-rose-600 rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

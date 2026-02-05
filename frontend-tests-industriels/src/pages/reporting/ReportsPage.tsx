import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    FileText,
    Download,
    Search,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Activity,
    ChevronRight,
    Filter,
    Search as SearchIcon,
    ShieldCheck,
    FileCheck
} from 'lucide-react';
import { rapportsService, type RapportTest } from '@/services/rapportsService';
import { formatDate, cn } from '@/utils/helpers';
import { exportToPDF } from '@/utils/pdfExport';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permissions';
import { useModalStore } from '@/store/modalStore';

export default function ReportsPage() {
    const { user } = useAuthStore();
    const { openReportModal } = useModalStore();
    const [search, setSearch] = useState('');
    const [filters] = useState({ page: 1, per_page: 10 });

    const { data: rapportsData, isLoading } = useQuery({
        queryKey: ['rapports', filters, search],
        queryFn: () => rapportsService.getRapports({ ...filters, search }),
    });

    const { data: statsData } = useQuery({
        queryKey: ['rapports-stats'],
        queryFn: () => rapportsService.getStats(),
    });

    const stats = useMemo(() => {
        return {
            total: (statsData?.valides || 0) + (statsData?.en_revision || 0) + (statsData?.brouillons || 0),
            valides: statsData?.valides || 0,
            revision: statsData?.en_revision || 0,
            brouillons: statsData?.brouillons || 0
        };
    }, [statsData]);

    const reports = rapportsData?.data || [];

    const handleExportPDF = () => {
        if (!reports) return;

        const headers = ["ID Rapport", "Type", "Test Associé", "Date Édition", "Rédacteur", "Statut"];
        const body = reports.map((report: RapportTest) => [
            report.numero_rapport,
            report.type_rapport,
            `${report.test?.numero_test || 'N/A'} \n(${report.test?.equipement?.designation || 'N/A'})`,
            formatDate(report.date_edition),
            report.redacteur ? `${report.redacteur.nom_complet}` : 'N/A',
            report.statut
        ]);

        exportToPDF({
            title: "Registre des Rapports de Tests Industriels",
            filename: "liste_rapports",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    const handleDownloadReport = async (report: RapportTest) => {
        if (report.statut === 'BROUILLON') {
            toast.error("Veuillez valider le rapport avant de l'exporter en PDF officiel.", {
                icon: '⚠️',
                duration: 4000
            });
            return;
        }

        try {
            toast.loading('Génération du PDF par le serveur...', { id: 'pdf-gen' });

            const response = await fetch(rapportsService.getPdfDownloadUrl(report.id_rapport), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/pdf'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expirée. Veuillez vous reconnecter.', { id: 'pdf-gen' });
                    return;
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${report.numero_rapport}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Rapport PDF téléchargé !', { id: 'pdf-gen' });
        } catch (error: any) {
            console.error('Erreur PDF:', error);
            toast.error(error.message || 'Erreur lors de la génération du PDF par le serveur', { id: 'pdf-gen' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <FileText className="h-7 w-7 text-indigo-600" />
                        Registre Rapports
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Génération et archivage des documents de certification technique</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission(user, 'rapports', 'export') && (
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest shadow-sm active:scale-95"
                        >
                            <Download className="h-4 w-4 text-indigo-600" />
                            <span className="hidden sm:inline">Registre CSV/PDF</span>
                        </button>
                    )}
                    {hasPermission(user, 'rapports', 'create') && (
                        <button
                            onClick={() => openReportModal()}
                            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <Activity className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                            Générer Rapport Global
                        </button>
                    )}
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Éditions</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-slate-400 rounded-r-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validés</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.valides}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${stats.total ? (stats.valides / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <FileCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Révision</p>
                            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{stats.revision}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-blue-500 rounded-r-full" style={{ width: `${stats.total ? (stats.revision / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brouillons</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats.brouillons}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${stats.total ? (stats.brouillons / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher par numéro de rapport, équipement ou rédacteur..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all">
                        <option value="">Tous les statuts</option>
                        <option value="VALIDE">Validés</option>
                        <option value="EN_REVISION">Révision</option>
                        <option value="BROUILLON">Brouillon</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Table */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Rapport / ID</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Test Associé</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Date Édition</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Rédacteur</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-7 py-6"><div className="h-8 bg-slate-50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : reports?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-7 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <FileText className="h-16 w-16 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun rapport identifié</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports?.map((report: RapportTest) => (
                                    <tr key={report.id_rapport} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{report.numero_rapport}</span>
                                                    <span className="text-[13px] font-black text-slate-800 capitalize mt-0.5">{report.type_rapport}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-700">{report.test?.numero_test || 'N/A'}</span>
                                                <p className="text-[10px] text-slate-400 font-medium italic line-clamp-1">{report.test?.equipement?.designation || 'Équipement non spécifié'}</p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                                <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                                {formatDate(report.date_edition, 'short')}
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-700">{report.redacteur ? `${report.redacteur.nom_complet}` : 'Système'}</span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                report.statut.toUpperCase() === 'VALIDÉ' || report.statut.toUpperCase() === 'VALIDE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    report.statut.toUpperCase() === 'EN RÉVISION' || report.statut.toUpperCase() === 'EN_REVISION' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {report.statut}
                                            </span>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {hasPermission(user, 'rapports', 'read') && (
                                                    <button
                                                        onClick={() => openReportModal(report.id_rapport)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Voir"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'rapports', 'export') && (
                                                    <button
                                                        onClick={() => handleDownloadReport(report)}
                                                        disabled={report.statut === 'BROUILLON'}
                                                        className={cn(
                                                            "p-2 rounded-xl transition-all",
                                                            report.statut === 'BROUILLON'
                                                                ? "text-slate-200"
                                                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                        )}
                                                        title="Télécharger"
                                                    >
                                                        <Download className="h-4 w-4" />
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
                <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Affichage de {reports?.length || 0} rapports industriels certifiés
                    </span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            Précèdent
                        </button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

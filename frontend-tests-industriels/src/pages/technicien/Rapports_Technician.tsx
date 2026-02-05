import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FileBarChart,
    Download,
    Eye,
    Clock,
    FileText,
    Search as SearchIcon,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { rapportsService, RapportTest } from '@/services/rapportsService';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { generateTechnicalReportPDF } from '@/utils/pdfExport';

export default function Rapports_Technician() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const { data: rapportsData, isLoading } = useQuery({
        queryKey: ['reports-technician', searchTerm, page],
        queryFn: () => rapportsService.getRapports({ search: searchTerm, page, per_page: 10 })
    });

    const reports = rapportsData?.data || [];

    const stats = useMemo(() => {
        return {
            total: rapportsData?.total || 0,
            valides: reports.filter((r: any) => r.statut?.includes('VALIDE')).length,
            recent: reports.filter((r: any) => {
                const date = new Date(r.date_edition);
                const now = new Date();
                return (now.getTime() - date.getTime()) < (7 * 24 * 60 * 60 * 1000); // last 7 days
            }).length
        };
    }, [rapportsData, reports]);

    const handleDownloadReport = async (id: string, numero: string) => {
        const loadingToast = toast.loading(`Génération du rapport ${numero}...`);
        try {
            const masterData = await rapportsService.getMasterReportData(id);
            generateTechnicalReportPDF(masterData);
            toast.success('Rapport prêt !', { id: loadingToast });
        } catch (error) {
            console.error(error);
            toast.error('Erreur de génération', { id: loadingToast });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <FileBarChart className="h-7 w-7 text-indigo-600" />
                        Centre Documentation
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Accès aux rapports certifiés et synthèses techniques</p>
                </div>
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filtrer par titre ou n°..."
                        className="w-full sm:w-64 pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[12.5px] font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rapports Validés</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.valides}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nouveautés (7j)</p>
                            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{stats.recent}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archivage</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">Automatique</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. List Layout */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-28 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                    ))
                ) : reports?.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <FileBarChart className="h-16 w-16 text-slate-300" />
                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun document archivé</p>
                        </div>
                    </div>
                ) : (
                    reports?.map((report: RapportTest) => (
                        <div
                            key={report.id_rapport}
                            className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-200/20 transition-all duration-500 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden"
                        >
                            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                <FileText size={28} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                        {report.type_rapport}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 capitalize">
                                        <Clock size={12} className="text-slate-300" />
                                        Édité le {formatDate(report.date_edition)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                    {report.numero_rapport} • {report.test?.equipement?.designation || 'Rapport Technique'}
                                </h3>
                            </div>

                            <div className="flex items-center gap-3 md:border-l md:pl-6 border-slate-50">
                                <button
                                    onClick={() => handleDownloadReport(report.id_rapport, report.numero_rapport)}
                                    className="h-11 px-6 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 group/btn shadow-sm"
                                >
                                    <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    Consulter
                                </button>
                                <button
                                    onClick={() => handleDownloadReport(report.id_rapport, report.numero_rapport)}
                                    className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!isLoading && rapportsData?.last_page > 1 && (
                <div className="flex items-center justify-between px-7 py-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page {rapportsData.current_page} sur {rapportsData.last_page} • {rapportsData.total} Rapports
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white border border-transparent hover:border-slate-100 transition-all disabled:opacity-30"
                        >
                            Précédent
                        </button>
                        <button
                            disabled={page === rapportsData.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white border border-transparent hover:border-slate-100 transition-all disabled:opacity-30"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

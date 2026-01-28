import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FileBarChart,
    Search,
    Filter,
    Download,
    Eye,
    Clock,
    BarChart3,
    FileText
} from 'lucide-react';
import { reportingService, Rapport } from '@/services/reportingService';
import { formatDate } from '@/utils/helpers';

export default function Rapports_Technician() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: reports, isLoading } = useQuery({
        queryKey: ['reports-technician'],
        queryFn: () => reportingService.getReports()
    });

    const filteredReports = reports?.filter((r: Rapport) =>
        r.numero_rapport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type_rapport.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <FileBarChart size={36} className="text-indigo-400" />
                        Centre de Documentation
                    </h1>
                    <p className="text-indigo-100/70 font-medium max-w-xl">
                        Accédez aux rapports de tests validés, synthèses de maintenance et indicateurs de performance.
                    </p>
                </div>

                <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
                    <BarChart3 size={400} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Filtrer par titre ou type de rapport..."
                        className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="p-4 bg-white border border-gray-100 text-gray-600 rounded-[1.5rem] shadow-sm hover:bg-gray-50 transition-colors">
                    <Filter size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                    ))
                ) : filteredReports?.map((report: Rapport) => (
                    <div
                        key={report.id_rapport}
                        className="group bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center gap-6"
                    >
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            <FileText size={28} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    {report.type_rapport}
                                </span>
                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDate(report.date_edition)}
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">
                                {report.numero_rapport} - {report.test?.equipement?.designation || 'Rapport de Test'}
                            </h3>
                        </div>

                        <div className="flex items-center gap-3 md:border-l md:pl-6 border-gray-100">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-all group/btn">
                                <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                                Lire
                            </button>
                            <button className="p-2.5 text-gray-400 hover:text-indigo-600 transition-colors">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {!isLoading && filteredReports?.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                        <FileBarChart size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Aucun rapport disponible</h3>
                        <p className="text-gray-500">Ajustez vos filtres de recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

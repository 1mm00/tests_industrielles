import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    AlertOctagon,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ArrowLeft,
    FileBarChart
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useNavigate } from 'react-router-dom';

export default function NonConformitesStatsPage() {
    const navigate = useNavigate();
    const { data: stats, isLoading } = useQuery({
        queryKey: ['nc-stats-detailed'],
        queryFn: () => ncService.getNcStats(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const summary = stats?.summary || { total: 0, ouvertes: 0, en_cours: 0, cloturees: 0 };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Statistiques Non-Conformités</h1>
                        <p className="text-sm text-gray-500 font-medium italic">Analyse analytique des écarts et performances qualité</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileBarChart className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Déclaré</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{summary.total}</h3>
                </div>

                <div className="card p-6 bg-white shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertOctagon className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Attente</p>
                    <h3 className="text-2xl font-black text-red-600 mt-1">{summary.ouvertes}</h3>
                </div>

                <div className="card p-6 bg-white shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Résolution</p>
                    <h3 className="text-2xl font-black text-orange-600 mt-1">{summary.en_cours}</h3>
                </div>

                <div className="card p-6 bg-white shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clôturées</p>
                    <h3 className="text-2xl font-black text-green-600 mt-1">{summary.cloturees}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="card p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <PieChart className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Répartition par Statut</h2>
                    </div>
                    <div className="space-y-4">
                        {stats?.by_status?.length > 0 ? (
                            stats.by_status.map((item: any) => (
                                <div key={item.statut} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase">
                                        <span className="text-gray-600">{item.statut}</span>
                                        <span className="text-primary-600">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-500"
                                            style={{ width: `${(item.count / summary.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-400 font-medium italic">Aucune donnée de statut disponible</p>
                        )}
                    </div>
                </div>

                {/* Top NC Types */}
                <div className="card p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <BarChart3 className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Top 5 Types de NC</h2>
                    </div>
                    <div className="space-y-4">
                        {stats?.by_type?.length > 0 ? (
                            stats.by_type.map((item: any) => (
                                <div key={item.type_nc} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-gray-600 truncate">{item.type_nc}</span>
                                            <span className="text-gray-900">{item.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gray-800 transition-all duration-500"
                                                style={{ width: `${(item.count / stats.by_type[0].count) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-400 font-medium italic">Aucune donnée de type disponible</p>
                        )}
                    </div>
                </div>

                {/* Criticality Analysis */}
                <div className="card p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <AlertTriangle className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Analyse par Criticité</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {stats?.by_criticite?.length > 0 ? (
                            stats.by_criticite.map((item: any) => (
                                <div key={item.label} className="p-4 rounded-xl border border-gray-50 bg-gray-50/30">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black text-gray-900">{item.count}</span>
                                        <span className="text-[10px] text-gray-500 font-bold">NCs</span>
                                    </div>
                                    <div className="mt-2 h-1 bg-white rounded-full">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color, width: `${(item.count / summary.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-8 text-gray-400 font-medium italic">Données de criticité non disponibles</div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Trend */}
                <div className="card p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Tendance 30 Jours</h2>
                    </div>
                    <div className="h-40 flex items-end gap-2 pb-2 px-2 overflow-hidden">
                        {stats?.recent_trends?.length > 0 ? (
                            stats.recent_trends.map((day: any) => (
                                <div
                                    key={day.date}
                                    className="flex-1 bg-primary-100 hover:bg-primary-500 transition-colors rounded-t-sm relative group"
                                    style={{ height: `${(day.count / Math.max(...stats.recent_trends.map((d: any) => d.count))) * 100}%` }}
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {day.date}: {day.count}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                                Aucune tendance récente
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-50">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">30 jours avant</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Aujourd'hui</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

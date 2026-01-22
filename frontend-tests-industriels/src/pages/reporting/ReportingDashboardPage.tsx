import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    TrendingUp,
    AlertOctagon,
    Timer,
    FileBarChart,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    FlaskConical
} from 'lucide-react';
import { reportingService } from '@/services/reportingService';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import NcDistributionChart from '@/components/dashboard/NcDistributionChart';

export default function ReportingDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['reporting-performance'],
        queryFn: () => reportingService.getPerformanceStats(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Reporting & KPIs</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Analyse de la performance et de la qualité industrielle</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm bg-white">
                        <Filter className="h-4 w-4" />
                        Filtrer la période
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300">
                        <Download className="h-4 w-4" />
                        Exporter Rapport PDF
                    </button>
                </div>
            </div>

            {/* Top KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="h-12 w-12 text-primary-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Taux de Conformité</p>
                    <h3 className="text-3xl font-black text-gray-900">{stats?.summary.conformity_rate}%</h3>
                    <div className="flex items-center gap-1 mt-2 text-green-600 font-bold text-xs">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span>+2.4% vs mois dernier</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Timer className="h-12 w-12 text-orange-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Résolution Moyenne</p>
                    <h3 className="text-3xl font-black text-gray-900">{stats?.summary.avg_resolution_days}j</h3>
                    <div className="flex items-center gap-1 mt-2 text-red-600 font-bold text-xs">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        <span>-0.5j vs mois dernier</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutDashboard className="h-12 w-12 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NC Actives</p>
                    <h3 className="text-3xl font-black text-gray-900">{stats?.summary.total_nc_active}</h3>
                    <div className="flex items-center gap-1 mt-2 text-gray-500 font-bold text-xs">
                        <span>En cours de traitement</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertOctagon className="h-12 w-12 text-red-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NC Critiques</p>
                    <h3 className="text-3xl font-black text-red-600">{stats?.summary.critical_nc_count}</h3>
                    <div className="flex items-center gap-1 mt-2 text-red-500 font-bold text-xs">
                        <span>Requiert attention immédiate</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Conformity Trend */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary-500" />
                                Évolution du Taux de Conformité
                            </h3>
                            <select className="text-xs font-bold bg-gray-50 border-0 rounded-lg px-2 py-1 outline-none">
                                <option>6 derniers mois</option>
                                <option>Année complète</option>
                            </select>
                        </div>
                        <div className="h-80">
                            <IndustrialChart
                                data={{
                                    series: stats?.conformity_trend.series || [],
                                    categories: stats?.conformity_trend.categories || []
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Criticality Distribution */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-8">
                            <FileBarChart className="h-5 w-5 text-orange-500" />
                            Répartition par Criticité
                        </h3>
                        <div className="h-64 mb-6">
                            <NcDistributionChart
                                data={{
                                    series: stats?.nc_by_criticality.map((c: any) => c.value) || []
                                }}
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            {stats?.nc_by_criticality.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-xs font-bold text-gray-600">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Issues Table */}
                <div className="lg:col-span-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                            <AlertOctagon className="h-5 w-5 text-red-500" />
                            Top 5 Équipements à Problèmes
                        </h3>
                        <div className="space-y-4">
                            {stats?.top_issues.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-400 w-4">{i + 1}.</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                            <span className="text-sm font-black text-gray-900">{item.value} NC</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-400 rounded-full"
                                                style={{ width: `${stats.top_issues[0].value > 0 ? (item.value / stats.top_issues[0].value) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Test Types Distribution */}
                <div className="lg:col-span-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                            <FlaskConical className="h-5 w-5 text-primary-500" />
                            Activité par Type de Test
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {stats?.test_types.map((item: any, i: number) => (
                                <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-black text-gray-900">{item.value}</span>
                                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Rapporté</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

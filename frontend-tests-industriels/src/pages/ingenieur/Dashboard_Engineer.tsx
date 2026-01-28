import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    FileCheck,
    AlertOctagon,
    Settings,
    TrendingUp,
    Clock,
    FlaskConical,
    ChevronRight,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { reportingService } from '@/services/reportingService';
import { cn } from '@/utils/helpers';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import { useModalStore } from '@/store/modalStore';

export default function Dashboard_Engineer() {
    const { openExecutionModal } = useModalStore();
    const { data: stats } = useQuery({
        queryKey: ['engineer-stats'],
        queryFn: () => testsService.getTestsStats(),
    });

    // console.log('Engineer stats:', stats); // Removed to avoid clutter if not needed, but data is used below

    const { data: performance } = useQuery({
        queryKey: ['performance-data'],
        queryFn: () => reportingService.getPerformanceStats(),
    });

    const engineerKpis = [
        {
            title: "Taux de Conformité Global",
            value: performance?.summary?.conformity_rate?.value ? `${performance.summary.conformity_rate.value}%` : "0%",
            change: performance?.summary?.conformity_rate?.change || "0%",
            trend: performance?.summary?.conformity_rate?.trend || "neutral",
            icon: FileCheck,
            color: "emerald"
        },
        {
            title: "Non-conformités Actives",
            value: performance?.summary?.total_nc_active?.value?.toString() || "0",
            change: performance?.summary?.total_nc_active?.change?.toString() || "0",
            trend: performance?.summary?.total_nc_active?.trend || "neutral",
            icon: Clock,
            color: "orange"
        },
        {
            title: "NC Critiques",
            value: performance?.summary?.critical_nc_count?.value?.toString() || "0",
            change: performance?.summary?.critical_nc_count?.change || "Stable",
            trend: performance?.summary?.critical_nc_count?.trend || "neutral",
            icon: AlertOctagon,
            color: "red"
        },
        {
            title: "Tests Totaux",
            value: performance?.summary?.total_tests?.value?.toString() || stats?.totalTests?.toString() || "0",

            change: performance?.summary?.total_tests?.change || "0%",
            trend: performance?.summary?.total_tests?.trend || "neutral",
            icon: Settings,
            color: "blue"
        }
    ];


    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Dashboard Ingénieur</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Pilotage technique et validation de la conformité industrielle</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {engineerKpis.map((kpi) => (
                    <div key={kpi.title} className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-500 overflow-hidden">
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full transition-all group-hover:opacity-20",
                            `bg-${kpi.color}-500`
                        )} />

                        <div className="relative z-10">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 border-2 shadow-sm group-hover:scale-110 transition-transform duration-500",
                                kpi.color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                    kpi.color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-600" :
                                        kpi.color === 'red' ? "bg-red-50 border-red-100 text-red-600" :
                                            "bg-blue-50 border-blue-100 text-blue-600"
                            )}>
                                <kpi.icon className="h-6 w-6" />
                            </div>

                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.title}</h3>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-black text-gray-900 leading-none">{kpi.value}</span>
                                <div className={cn(
                                    "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                                    kpi.trend === 'up' ? "bg-emerald-100 text-emerald-700" :
                                        kpi.trend === 'down' ? "bg-red-100 text-red-700" :
                                            "bg-gray-100 text-gray-700"
                                )}>
                                    {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> :
                                        kpi.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : null}
                                    {kpi.change}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Charts Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase">Performance Technique</h2>
                                <p className="text-xs text-gray-400 font-bold tracking-widest mt-1 uppercase">Analyse des 12 derniers mois</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="text-xs font-black bg-gray-50 border-0 rounded-lg px-3 py-2 outline-none cursor-pointer">
                                    <option>Tous les types de tests</option>
                                    <option>Vibration</option>
                                    <option>Calibration</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <IndustrialChart
                                data={stats?.industrial_evolution}
                            />

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary-200">
                            <TrendingUp className="h-10 w-10 mb-6 opacity-50" />
                            <h3 className="text-2xl font-black mb-2 leading-tight">Optimisation de la Production</h3>
                            <p className="text-primary-100 text-sm font-medium mb-6 opacity-80">Les derniers tests montrent une amélioration de 4% sur la ligne A après calibration métrologique.</p>
                            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-black uppercase tracking-widest transition-all">
                                Voir les Recommandations
                            </button>
                        </div>
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                            <FlaskConical className="h-10 w-10 mb-6 text-primary-400" />
                            <h3 className="text-2xl font-black mb-2 leading-tight">Protocoles Expérimentaux</h3>
                            <p className="text-gray-400 text-sm font-medium mb-6">3 nouveaux types de tests en attente de définition technique pour le nouveau parc machine.</p>
                            <button
                                onClick={() => window.location.href = '/engineer/protocoles'}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-600/30"
                            >
                                Configurer les Tests
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Tasks / Feed */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
                            <h2 className="text-lg font-black text-gray-900 uppercase">Actions Requises</h2>
                            <span className="flex h-6 w-6 items-center justify-center bg-red-100 text-red-600 text-xs font-black rounded-full">4</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {stats?.recent_tests?.length > 0 ? (
                                stats.recent_tests.slice(0, 4).map((test: any) => (
                                    <div
                                        key={test.id_test}
                                        onClick={() => openExecutionModal(test.id_test)}
                                        className="group p-4 rounded-3xl hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-[10px]",
                                                test.statut_test === 'TERMINE' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    test.statut_test === 'EN_COURS' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                        "bg-gray-50 text-gray-600 border border-gray-100"
                                            )}>
                                                {test.statut_test === 'TERMINE' ? 'FIN' : 'TST'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{test.numero_test}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{test.equipement?.designation || 'Équipement inconnu'} • {test.statut_test}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 font-bold uppercase text-[10px]">Aucun test récent</div>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 text-center">
                            <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">
                                Voir toutes les interventions
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                        <h2 className="text-lg font-black text-gray-900 uppercase mb-6">Expertise Équipement</h2>
                        <div className="space-y-6">
                            {stats?.recent_nc?.length > 0 ? (
                                stats.recent_nc.slice(0, 3).map((nc: any) => (
                                    <div key={nc.id_nc} className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                                            <span className="text-gray-900">{nc.equipement?.designation || 'Équipement'}</span>
                                            <span className={cn(
                                                nc.criticite?.code_niveau?.includes('L3') || nc.criticite?.code_niveau?.includes('L4') ? "text-red-500" : "text-orange-500"
                                            )}>{nc.statut}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    nc.criticite?.code_niveau?.includes('L3') || nc.criticite?.code_niveau?.includes('L4') ? "bg-red-500" : "bg-orange-500"
                                                )}
                                                style={{ width: nc.statut === 'CLOTUREE' ? '100%' : '65%' }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 font-bold uppercase text-[10px] py-4">Pas de NC récentes</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
import { dashboardService } from '@/services/dashboardService';
import { cn } from '@/utils/helpers';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import { useModalStore } from '@/store/modalStore';

export default function Dashboard_Engineer() {
    const { openExecutionModal } = useModalStore();

    // Récupération des données réelles du dashboard
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-ingenieur'],
        queryFn: () => dashboardService.getDashboardIngenieur(),
        refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Chargement du Dashboard...</p>
                </div>
            </div>
        );
    }

    const chartData = {
        series: [
            {
                name: "Tests Réalisés",
                type: "column",
                data: dashboardData?.performance_12_mois.map((d: any) => d.tests_reussis) || []
            },
            {
                name: "Tests Conformes",
                type: "area",
                data: dashboardData?.performance_12_mois.map((d: any) => d.tests_conformes) || []
            },
            {
                name: "Non-Conformités",
                type: "line",
                data: dashboardData?.performance_12_mois.map((d: any) => d.non_conformites) || []
            }
        ],
        categories: dashboardData?.performance_12_mois.map((d: any) => d.mois) || []
    };

    const engineerKpis = [
        {
            title: "Taux de Conformité Global",
            value: dashboardData?.kpis.taux_conformite ? `${dashboardData.kpis.taux_conformite}%` : "0%",
            change: (dashboardData?.kpis.taux_conformite && dashboardData.kpis.taux_conformite >= 90) ? "+2.3%" : "-1.5%",
            trend: (dashboardData?.kpis.taux_conformite && dashboardData.kpis.taux_conformite >= 90) ? "up" : "down",
            icon: FileCheck,
            color: "emerald"
        },
        {
            title: "Non-conformités Actives",
            value: dashboardData?.kpis.nc_actives?.toString() || "0",
            change: dashboardData?.stats_complementaires?.nc_resolues_ce_mois?.toString() || "0",
            trend: "neutral",
            icon: Clock,
            color: "orange"
        },
        {
            title: "NC Critiques",
            value: dashboardData?.kpis.nc_critiques?.toString() || "0",
            change: "Haute",
            trend: (dashboardData?.kpis.nc_critiques && dashboardData.kpis.nc_critiques > 0) ? "down" : "neutral",
            icon: AlertOctagon,
            color: "red"
        },
        {
            title: "Tests Totaux",
            value: dashboardData?.kpis.tests_totaux?.toString() || "0",
            change: `${dashboardData?.stats_complementaires?.tests_en_cours || 0} en cours`,
            trend: "up",
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
                                data={chartData}
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
                            {dashboardData?.actions_requises && dashboardData.actions_requises.length > 0 ? (
                                dashboardData.actions_requises.map((test: any) => (
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
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{test.equipement || 'Équipement inconnu'} • {test.statut.replace('_', ' ')}</p>
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
                            {dashboardData?.expertise_equipement && dashboardData.expertise_equipement.length > 0 ? (
                                dashboardData.expertise_equipement.map((equipement: any) => (
                                    <div key={equipement.id_equipement} className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                                            <span className="text-gray-900">{equipement.designation}</span>
                                            <span className={cn(
                                                equipement.taux_echec > 20 ? "text-red-500" : "text-orange-500"
                                            )}>{equipement.taux_echec}% échec</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    equipement.taux_echec > 20 ? "bg-red-500" : "bg-orange-500"
                                                )}
                                                style={{ width: `${Math.min(equipement.taux_echec, 100)}%` }}
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

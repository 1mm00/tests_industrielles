import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    AlertOctagon,
    Settings,
    TrendingUp,
    Clock,
    FlaskConical,
    ChevronRight,
    Calendar,
    Zap,
    Target,
    BarChart3,
    Cpu,
    ArrowUpRight,
    Search,
    LayoutDashboard
} from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { cn } from '@/utils/helpers';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import { useModalStore } from '@/store/modalStore';
import { motion } from 'framer-motion';
import ReactApexChart from "react-apexcharts";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    trend: number[];
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) => {
    const sparklineOptions: any = {
        chart: { sparkline: { enabled: true }, animations: { enabled: true } },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        colors: [color === 'blue' ? '#6366f1' : color === 'orange' ? '#f59e0b' : color === 'emerald' ? '#10b981' : '#f43f5e'],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-sm p-6 overflow-hidden h-full group transition-all duration-500"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        color === 'blue' ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-100" :
                            color === 'orange' ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-100" :
                                color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-100" :
                                    "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-100"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60 italic">{subtitle}</p>
                </div>

                <div className="mt-5 h-12">
                    <ReactApexChart
                        options={sparklineOptions}
                        series={[{ data: trend }]}
                        type="area"
                        height="100%"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default function Dashboard_Engineer() {
    const { openExecutionModal, openTestDetailsModal } = useModalStore();
    const navigate = useNavigate();

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-ingenieur'],
        queryFn: () => dashboardService.getDashboardIngenieur(),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Orchestration Technique Core...</p>
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
            title: "Yield Conformité",
            value: dashboardData?.kpis.taux_conformite ? `${dashboardData.kpis.taux_conformite}%` : "0%",
            subtitle: "Performance globale",
            icon: Target,
            color: "emerald",
            trend: [85, 88, 87, 89, 92, 90, 93, 94]
        },
        {
            title: "NC en Analyse",
            value: dashboardData?.kpis.nc_actives?.toString() || "0",
            subtitle: "Cycle d'investigation",
            icon: Clock,
            color: "orange",
            trend: [5, 8, 12, 10, 8, 15, 7]
        },
        {
            title: "Urgences Vitales",
            value: dashboardData?.kpis.nc_critiques?.toString() || "0",
            subtitle: "Risque de rupture",
            icon: AlertOctagon,
            color: "red",
            trend: [2, 1, 3, 0, 1, 2, 0]
        },
        {
            title: "Capacité Node",
            value: dashboardData?.kpis.tests_totaux?.toString() || "0",
            subtitle: "Volume d'interventions",
            icon: Settings,
            color: "blue",
            trend: [100, 120, 110, 140, 130, 150, 160]
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100 group hover:rotate-6 transition-transform">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Engineering Hub
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2">
                            <Cpu className="h-3 w-3 text-indigo-500" />
                            Pilotage technique et orchestration des flux de tests
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* 2. KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {engineerKpis.map((kpi) => (
                    <StatCard
                        key={kpi.title}
                        title={kpi.title}
                        value={kpi.value}
                        subtitle={kpi.subtitle}
                        icon={kpi.icon}
                        color={kpi.color}
                        trend={kpi.trend}
                    />
                ))}
            </div>

            {/* 3. Central Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Performance Analytics */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Analyse de Performance Analytique</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Audit multi-sources des 12 derniers cycles</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none cursor-pointer text-slate-600 uppercase tracking-widest hover:bg-white transition-all shadow-sm">
                                    <option>Flux Global</option>
                                    <option>Vibration Node</option>
                                    <option>Calibration Core</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-[360px]">
                            <IndustrialChart data={chartData} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                            <TrendingUp className="h-12 w-12 mb-6 text-indigo-300 opacity-20 absolute -right-4 top-4 rotate-12 group-hover:rotate-0 transition-transform" />
                            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Intelligence Flux</h3>
                            <p className="text-indigo-100/70 text-[11px] font-medium mb-6 leading-relaxed italic">Progression technique de <span className="text-white font-black">+4.2%</span> détectée sur la ligne A après synchronisation node.</p>
                            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-3">
                                Analyser Insights
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                            <FlaskConical className="h-12 w-12 mb-6 text-indigo-400 opacity-20 absolute -right-4 top-4 -rotate-12 group-hover:rotate-0 transition-transform" />
                            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Protocoles R&D</h3>
                            <p className="text-slate-400 text-[11px] font-medium mb-6 leading-relaxed">3 nouveaux schémas de tests en attente de définition stratégique pour le parc digital.</p>
                            <button
                                onClick={() => navigate?.('/engineer/protocoles')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                            >
                                Configurer Nodes
                                <Settings className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Zap className="h-5 w-5 text-indigo-600" />
                                Actions Requises
                            </h2>
                            <span className="flex h-6 w-6 items-center justify-center bg-rose-100 text-rose-600 text-[10px] font-black rounded-lg shadow-sm border border-rose-200">4</span>
                        </div>
                        <div className="p-4 space-y-2 flex-1 no-scrollbar overflow-y-auto max-h-[420px]">
                            {dashboardData?.actions_requises && dashboardData.actions_requises.length > 0 ? (
                                dashboardData.actions_requises.slice(0, 5).map((test: any) => (
                                    <div
                                        key={test.id_test}
                                        onClick={() => {
                                            if (test.statut_test === 'TERMINE' || (test.statut && test.statut.includes('TERMINE'))) {
                                                openTestDetailsModal(test.id_test);
                                            } else {
                                                openExecutionModal(test.id_test);
                                            }
                                        }}
                                        className="group p-4 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center font-black text-[10px] border shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3",
                                                test.statut_test === 'TERMINE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    test.statut_test === 'EN_COURS' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                        "bg-white text-slate-400 border-slate-100"
                                            )}>
                                                {test.statut_test === 'TERMINE' ? 'FIN' : 'NODE'}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{test.numero_test}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5 truncate max-w-[140px] italic">{test.equipement?.substring(0, 25) || 'Contrôle Core'}</p>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-lg bg-white border border-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center opacity-30">
                                    <Search className="h-10 w-10 text-slate-300 mb-4" />
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Aucun node actif identifié</p>
                                </div>
                            )}
                        </div>
                        <div className="p-5 bg-slate-50/30 border-t border-slate-50 text-center">
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] hover:text-indigo-700 transition-colors">
                                Explorer l'orchestration complète
                            </button>
                        </div>
                    </div>

                    {/* Asset Criticality Sidebar Card */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm border border-rose-100">
                                <AlertOctagon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Focus Criticité Asset</h2>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Analytique des défaillances par node</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {dashboardData?.expertise_equipement && dashboardData.expertise_equipement.length > 0 ? (
                                dashboardData.expertise_equipement.map((equipement: any, idx: number) => (
                                    <div key={equipement.id_equipement} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{equipement.designation}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Matricule : #NODE-772</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={cn(
                                                    "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm border",
                                                    equipement.taux_echec > 20 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>{equipement.taux_echec}% FAILURE</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${Math.min(equipement.taux_echec, 100)}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }}
                                                className={cn(
                                                    "h-full rounded-full transition-all shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                                    equipement.taux_echec > 20 ? "bg-gradient-to-r from-rose-500 to-red-600" : "bg-gradient-to-r from-amber-400 to-orange-500"
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-20">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] italic">Statut Nominal Asset</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

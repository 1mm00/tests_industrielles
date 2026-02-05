import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    TrendingUp,
    AlertOctagon,
    Timer,
    FileBarChart,
    Download,
    Filter,
    Target,
    FlaskConical,
    Activity,
    FileText,
    Zap,
    Cpu,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    BarChart3
} from 'lucide-react';
import { reportingService } from '@/services/reportingService';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import NcDistributionChart from '@/components/dashboard/NcDistributionChart';
import { exportToPDF } from '@/utils/pdfExport';
import { formatDate, cn } from '@/utils/helpers';
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
            className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden h-full group transition-all duration-500"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors" />

            <div className="relative z-10 text-left">
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

export default function ReportingDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['reporting-performance'],
        queryFn: () => reportingService.getPerformanceStats(),
    });

    const handleExportPDF = () => {
        if (!stats) return;

        const headers = ["Indicateur", "Valeur", "Contexte"];
        const body = [
            ["Taux de Conformité", `${stats.summary.conformity_rate.value}%`, "Performance Globale"],
            ["Résolution Moyenne", `${stats.summary.avg_resolution_days} jours`, "Rapidité de résolution"],
            ["Non-Conformités Actives", stats.summary.total_nc_active.value.toString(), "En cours"],
            ["Non-Conformités Critiques", stats.summary.critical_nc_count.value.toString(), "Ressource prioritaire"],
        ];

        body.push(["---", "---", "---"]);
        body.push(["TOP 5 ÉQUIPEMENTS À PROBLÈMES", "", ""]);

        stats.top_issues.forEach((issue: any, index: number) => {
            body.push([`${index + 1}. ${issue.label}`, `${issue.value} NC`, "Équipement"]);
        });

        exportToPDF({
            title: "Rapport Intelligence Qualité Industrielle",
            filename: `STRATEGIC_REPORT_${formatDate(new Date(), 'short')}`,
            headers: headers,
            body: body,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Compilation des flux analytiques...</p>
            </div>
        );
    }

    const reportingKpis: (Omit<StatCardProps, 'icon'> & { icon: any })[] = [
        {
            title: "Yield Conformité",
            value: `${stats?.summary.conformity_rate.value}%`,
            subtitle: "+2.4% vs mois dernier",
            icon: Target,
            color: "emerald",
            trend: [82, 85, 84, 88, 87, 89, 92]
        },
        {
            title: "Célérité Moyenne",
            value: `${stats?.summary.avg_resolution_days}j`,
            subtitle: "-0.5j vs mois dernier",
            icon: Timer,
            color: "orange",
            trend: [10, 9, 11, 8, 8.5, 7.5, 7]
        },
        {
            title: "Flux Actif NC",
            value: stats?.summary.total_nc_active.value || 0,
            subtitle: "Interventions live",
            icon: LayoutDashboard,
            color: "blue",
            trend: [20, 25, 22, 18, 15, 12, 10]
        },
        {
            title: "Urgences Vitales",
            value: stats?.summary.critical_nc_count.value || 0,
            subtitle: "Priorité immédiate",
            icon: AlertOctagon,
            color: "red",
            trend: [5, 4, 3, 6, 2, 1, 0]
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 group hover:rotate-6 transition-transform">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Strategic Intel Hub
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                            Consolidation analytique et reporting de performance core
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span>Audit Q1</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-slate-900 font-black">Performance</span>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                        Exporter Insights
                    </button>
                </div>
            </div>

            {/* 2. KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportingKpis.map((kpi) => (
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

            {/* 3. Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Conformity Trend Area */}
                <div className="lg:col-span-8">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Target className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                        Vecteur de Conformité Global
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Audit temporel des écarts vs régulation node</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none text-slate-600 uppercase tracking-widest hover:bg-white transition-all shadow-sm">
                                    <option>Flux 6 Mois</option>
                                    <option>Cycle Annuel</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-80">
                            <IndustrialChart
                                data={{
                                    series: stats?.conformity_trend.series || [],
                                    categories: stats?.conformity_trend.categories || []
                                }}
                            />
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Zap className="h-5 w-5 fill-current" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                                Optimisation dynamique du flux détectée : augmentation du yield de <span className="text-emerald-600">+2.4%</span> sur le dernier cycle analytique.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Risk Matrix Distribution */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 h-full overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Matrice de Criticité</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Segmentation des risques</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 mb-8">
                            <NcDistributionChart
                                data={{
                                    series: stats?.nc_by_criticality.map((c: any) => c.value) || []
                                }}
                            />
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                            {stats?.nc_by_criticality.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-slate-50 hover:bg-white transition-all group overflow-hidden relative active:scale-95 cursor-pointer">
                                    <div className="absolute left-0 top-0 w-1.5 h-full opacity-50 group-hover:opacity-100 transition-all" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex items-center gap-3 pl-3">
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-900">{item.value} Nodes</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Asset Performance Table */}
                <div className="lg:col-span-6">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <AlertOctagon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Top Assets Critiques</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Registre prioritaire des anomalies par node</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">Live Monitor</span>
                        </div>
                        <div className="space-y-6">
                            {stats?.top_issues.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-5 group cursor-pointer">
                                    <span className="text-[11px] font-black text-slate-400 w-5 group-hover:text-rose-600 transition-colors">{String(i + 1).padStart(2, '0')}.</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[12px] font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.label}</span>
                                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 shadow-sm">{item.value} NC Identifiées</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: String(stats?.top_issues?.[0]?.value > 0 ? (item.value / stats.top_issues[0].value) * 100 : 0) + '%' }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                                                className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full shadow-[0_0_8px_#f43f5e]"
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Typology Grid */}
                <div className="lg:col-span-6">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <FlaskConical className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Spectre d'Activité Core</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Typologie des tests vs capacity planning</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats?.test_types.map((item: any, i: number) => (
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    key={i}
                                    className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity leading-tight">{item.label}</p>
                                        <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-indigo-600 transition-all">
                                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-6">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{item.value}</span>
                                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            Active Hub
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

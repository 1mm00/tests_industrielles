import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    ArrowLeft,
    FileText,
    AlertCircle,
    Settings,
    CheckCircle,
    ShieldAlert,
    Layers,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useNavigate } from 'react-router-dom';
import ReactApexChart from "react-apexcharts";
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: 'blue' | 'orange' | 'emerald' | 'sky';
    trend: number[];
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) => {
    const colorMap = {
        blue: '#2E5BFF',
        orange: '#FFAB00',
        emerald: '#00C853',
        sky: '#0EA5E9'
    };

    const sparklineOptions: any = {
        chart: { sparkline: { enabled: true }, animations: { enabled: true } },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        colors: [colorMap[color]],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="relative bg-white/70 backdrop-blur-md rounded-[22px] border border-slate-200 shadow-sm p-4 overflow-hidden h-full group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary-50/50 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-110",
                        color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" :
                            color === 'orange' ? "bg-gradient-to-br from-orange-400 to-red-500 text-white" :
                                color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white" :
                                    "bg-gradient-to-br from-sky-400 to-blue-500 text-white"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div className="space-y-0.5">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-slate-900 tracking-tight">{value}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</p>
                </div>

                <div className="mt-3 h-10">
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

export default function NonConformitesStatsPage() {
    const navigate = useNavigate();
    const { data: stats, isLoading } = useQuery({
        queryKey: ['nc-stats-detailed'],
        queryFn: () => ncService.getNcStats(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const summary = stats?.summary || { total: 0, ouvertes: 0, en_cours: 0, cloturees: 0 };

    // Preparation des données pour le graphe de tendance
    const trendData = stats?.recent_trends?.map((t: any) => t.count) || [0, 0, 0, 0, 0];
    const trendLabels = stats?.recent_trends?.map((t: any) => t.date) || [];

    // Graphe de tendance (Area Spline)
    const areaChartOptions: any = {
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter, sans-serif'
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3, colors: ['#2E5BFF'] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: '#2E5BFF', opacity: 0.4 },
                    { offset: 100, color: '#2E5BFF', opacity: 0 },
                ]
            }
        },
        xaxis: {
            categories: trendLabels,
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 600 } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        tooltip: { theme: 'light' }
    };

    // Graphe de répartition (Radial Gauge)
    const radialOptions: any = {
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: {
                    background: "#f1f5f9",
                    strokeWidth: '97%',
                    margin: 5,
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: -2,
                        fontSize: '22px',
                        fontWeight: '900',
                        color: '#1e293b',
                        formatter: (val: number) => `${val}%`
                    }
                }
            }
        },
        colors: ['#00C853'],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#2E5BFF'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: { lineCap: 'round' },
    };

    const resolutionRate = summary.total > 0 ? Math.round((summary.cloturees / summary.total) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">STATISTIQUES NON-CONFORMITÉS</h1>
                        </div>
                        <p className="text-xs text-slate-500 font-bold italic">Analyse analytique des écarts et performances qualité</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Déclaré"
                    value={summary.total}
                    subtitle="Volume global NC"
                    icon={FileText}
                    color="blue"
                    trend={[12, 18, 15, 22, 28, 25, 32, 40]}
                />
                <StatCard
                    title="En Attente"
                    value={summary.ouvertes}
                    subtitle="Urgences identifiées"
                    icon={AlertCircle}
                    color="orange"
                    trend={[8, 12, 10, 14, 12, 18, 15, 10]}
                />
                <StatCard
                    title="En Résolution"
                    value={summary.en_cours}
                    subtitle="Actions en cours"
                    icon={Settings}
                    color="sky"
                    trend={[5, 8, 12, 10, 15, 12, 18, 20]}
                />
                <StatCard
                    title="Clôturées"
                    value={summary.cloturees}
                    subtitle="Ecarts résolus"
                    icon={CheckCircle}
                    color="emerald"
                    trend={[10, 15, 18, 25, 28, 35, 40, 45]}
                />
            </div>

            {/* Top Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Tendance Chart */}
                <div className="lg:col-span-8 bg-white/70 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Tendance des NC (30 Jours)</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Évolution temporelle des déclarations</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ReactApexChart
                            options={areaChartOptions}
                            series={[{ name: 'Déclarations', data: trendData }]}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Status Distribution (Radial) */}
                <div className="lg:col-span-4 bg-white/70 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Performance Résolution</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Taux de clôture global</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <ReactApexChart
                            options={radialOptions}
                            series={[resolutionRate]}
                            type="radialBar"
                            height={240}
                        />
                        <div className="mt-4 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center">Efficacité Qualité</p>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">
                                Stable
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Criticality Analysis - Neon Horizontal Progress Bars */}
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Analyse par Criticité</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Poids des risques sur la production</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {stats?.by_criticite?.map((item: any, idx: number) => {
                            const percentage = summary.total > 0 ? (item.count / summary.total) * 100 : 0;
                            const isNeon = item.label === 'Vital' || item.label === 'Critique' || item.label === 'NC4' || item.label === 'NC3';

                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                item.label === 'Mineur' || item.label === 'NC1' ? 'bg-emerald-400' :
                                                    item.label === 'Moyen' || item.label === 'NC2' ? 'bg-amber-400' :
                                                        'bg-rose-500'
                                            )} />
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-900">{item.count}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">{Math.round(percentage)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                isNeon && "animate-pulse",
                                                item.label === 'Mineur' || item.label === 'NC1' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' :
                                                    item.label === 'Moyen' || item.label === 'NC2' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]' :
                                                        'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                                            )}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Types - Sleek List */}
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Layers className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Typologie des Défauts</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Top des occurrences par catégorie</p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {stats?.by_type?.map((type: any, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx}
                                className="py-3 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10.5px] font-black text-slate-800 uppercase tracking-tight">{type.type_nc}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Catégorie Qualité</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-black text-slate-600">
                                        {type.count}
                                    </span>
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

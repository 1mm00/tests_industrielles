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
    TrendingUp,
    Zap,
    Target,
    Clock,
    BarChart3
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
        blue: '#6366f1',
        orange: '#f59e0b',
        emerald: '#10b981',
        sky: '#0ea5e9'
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
            className="relative bg-white/70 backdrop-blur-md rounded-[28px] border border-slate-100 shadow-sm p-5 overflow-hidden h-full group transition-all"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-50/50 transition-colors" />

            <div className="relative z-10 text-left">
                <div className="flex justify-between items-start mb-4 text-left">
                    <div className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl shadow-xl transition-transform group-hover:scale-110",
                        color === 'blue' ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-200" :
                            color === 'orange' ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200" :
                                color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-200" :
                                    "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-sky-200"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                <div className="space-y-0.5 text-left">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
                    <div className="flex items-end gap-2 text-left">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic opacity-75">{subtitle}</p>
                </div>

                <div className="mt-4 h-12">
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
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Collecte des données analytiques...</p>
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
            fontFamily: 'Outfit, Inter, sans-serif'
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 4, colors: ['#6366f1'] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: '#6366f1', opacity: 0.4 },
                    { offset: 100, color: '#6366f1', opacity: 0 },
                ]
            }
        },
        xaxis: {
            categories: trendLabels,
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 900, fontSize: '10px' } } },
        grid: { borderColor: '#f8fafc', strokeDashArray: 4 },
        tooltip: { theme: 'light' }
    };

    // Graphe de répartition (Radial Gauge)
    const radialOptions: any = {
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                startAngle: -100,
                endAngle: 100,
                track: {
                    background: "#f1f5f9",
                    strokeWidth: '95%',
                    margin: 5,
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: 0,
                        fontSize: '28px',
                        fontWeight: '900',
                        color: '#0f172a',
                        formatter: (val: number) => `${val}%`
                    }
                }
            }
        },
        colors: ['#10b981'],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#6366f1'],
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
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90 group"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <Activity className="h-7 w-7 text-indigo-600" />
                            Intelligence Qualité
                        </h1>
                        <p className="text-sm text-slate-500 font-medium italic">Audit analytique des performances et flux correctifs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* 2. KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Volume Global"
                    value={summary.total}
                    subtitle="Défauts enregistrés"
                    icon={FileText}
                    color="blue"
                    trend={[12, 18, 15, 22, 28, 25, 32, 40]}
                />
                <StatCard
                    title="Urgences Actives"
                    value={summary.ouvertes}
                    subtitle="Actions en attente"
                    icon={AlertCircle}
                    color="orange"
                    trend={[8, 12, 10, 14, 12, 18, 15, 10]}
                />
                <StatCard
                    title="Traitement Node"
                    value={summary.en_cours}
                    subtitle="Flux en résolution"
                    icon={Settings}
                    color="sky"
                    trend={[5, 8, 12, 10, 15, 12, 18, 20]}
                />
                <StatCard
                    title="Archive Clôture"
                    value={summary.cloturees}
                    subtitle="Ecarts neutralisés"
                    icon={CheckCircle}
                    color="emerald"
                    trend={[10, 15, 18, 25, 28, 35, 40, 45]}
                />
            </div>

            {/* 3. Main Data Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Tendance Chart */}
                <div className="lg:col-span-8 bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Index de Déclaration</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Analyse temporelle sur 30 jours glissants</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Live Feed
                        </div>
                    </div>
                    <div className="h-[320px]">
                        <ReactApexChart
                            options={areaChartOptions}
                            series={[{ name: 'Volume NC', data: trendData }]}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Resolution Radial */}
                <div className="lg:col-span-4 bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Node Efficiency</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Taux de résolution global</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative py-6">
                        <ReactApexChart
                            options={radialOptions}
                            series={[resolutionRate]}
                            type="radialBar"
                            height={280}
                            width="100%"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 text-center mt-6">
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest inline-block shadow-sm">
                                {resolutionRate > 80 ? 'Haute Performance' : 'Optimisation Requise'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rapport hebdo</span>
                            <span className="text-xs font-black text-slate-900">+4.2% ce mois</span>
                        </div>
                        <Zap className="h-5 w-5 text-amber-500 fill-current" />
                    </div>
                </div>
            </div>

            {/* 4. Secondary Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Risk Breakdown */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Matrice de Criticité</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Classification des risques industriels</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {stats?.by_criticite?.map((item: any, idx: number) => {
                            const percentage = summary.total > 0 ? (item.count / summary.total) * 100 : 0;
                            const isDanger = item.label === 'Vital' || item.label === 'Critique' || item.label === 'NC4' || item.label === 'NC3';

                            return (
                                <div key={idx} className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                isDanger ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-300'
                                            )} />
                                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-900">{item.count}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{Math.round(percentage)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                item.label === 'Mineur' || item.label === 'NC1' ? 'bg-emerald-400' :
                                                    item.label === 'Moyen' || item.label === 'NC2' ? 'bg-amber-400' :
                                                        'bg-gradient-to-r from-rose-500 to-red-600'
                                            )}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Typology Registry */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Registry Typologique</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Segmentation analytique des défauts</p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50 mt-6">
                        {stats?.by_type?.map((type: any, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx}
                                className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 -mx-3 px-3 rounded-2xl transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                                        <BarChart3 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{type.type_nc}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">Protocole Qualité Standard</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-slate-900 tracking-tighter">
                                            {String(type.count).padStart(2, '0')}
                                        </span>
                                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md mt-1">Occurrence</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

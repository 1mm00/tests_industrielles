import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    ArrowLeft,
    FileText,
    CheckCircle,
    ShieldAlert,
    Layers,
    ChevronRight,
    Zap,
    Target,
    Clock,
    BarChart3,
    ShieldCheck
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
        chart: { sparkline: { enabled: true }, animations: { enabled: true, easing: 'easeinout', speed: 1000 } },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 100]
            }
        },
        colors: [colorMap[color]],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 shadow-sm p-7 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors duration-500" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-[1.5rem] shadow-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110",
                        color === 'blue' ? "bg-indigo-600 text-white shadow-indigo-200" :
                            color === 'orange' ? "bg-amber-500 text-white shadow-amber-200" :
                                color === 'emerald' ? "bg-emerald-500 text-white shadow-emerald-200" :
                                    "bg-sky-500 text-white shadow-sky-200"
                    )}>
                        <Icon className="h-7 w-7" />
                    </div>
                </div>

                <div className="space-y-1 ml-1 text-left">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
                    </div>
                </div>

                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mt-4 ml-1 flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full", color === 'emerald' ? "bg-emerald-500" : color === 'orange' ? "bg-amber-500" : "bg-indigo-500")} />
                    {subtitle}
                </p>

                <div className="mt-8 h-16 -mx-2">
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
                <div className="relative">
                    <div className="h-20 w-20 border-[6px] border-indigo-100 rounded-[2.5rem] animate-pulse" />
                    <div className="h-20 w-20 border-t-[6px] border-indigo-600 rounded-[2.5rem] animate-spin absolute top-0 left-0" />
                </div>
                <p className="text-slate-900 font-black animate-pulse uppercase tracking-[0.5em] text-[10px] mt-10 ml-2">Synching Intelligence HUD...</p>
            </div>
        );
    }

    const summary = stats?.summary || { total: 0, ouvertes: 0, en_cours: 0, cloturees: 0 };
    const trendData = stats?.recent_trends?.map((t: any) => t.count) || [0, 0, 0, 0, 0];
    const trendLabels = stats?.recent_trends?.map((t: any) => t.date) || [];

    const areaChartOptions: any = {
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Outfit, Inter, sans-serif',
            background: 'transparent'
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 4, colors: ['#6366f1'] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: trendLabels,
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 900, fontSize: '11px' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 8, padding: { left: 20, right: 20 } },
        tooltip: { theme: 'light' }
    };

    const radialOptions: any = {
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                startAngle: -120,
                endAngle: 120,
                hollow: { size: '65%', background: 'transparent' },
                track: {
                    background: "#f1f5f9",
                    strokeWidth: '95%',
                    margin: 5,
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: 10,
                        fontSize: '42px',
                        fontWeight: '950',
                        color: '#0f172a',
                        formatter: (val: number) => `${val}%`
                    }
                }
            }
        },
        colors: ['#6366f1'],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#10b981'],
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">

            {/* 1. Analytic Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-14 w-14 flex items-center justify-center bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowLeft className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                            <Activity className="h-8 w-8 text-indigo-600" />
                            Intelligence Qualité
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2.5 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
                            Audit analytique & Flux correctifs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center gap-4 group hover:bg-slate-900 transition-all cursor-default">
                        <Clock className="h-5 w-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
                        <span className="text-[11px] font-black text-slate-700 group-hover:text-white uppercase tracking-[0.2em]">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* 2. Executive Analytic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    icon={ShieldAlert}
                    color="orange"
                    trend={[8, 12, 10, 14, 12, 18, 15, 10]}
                />
                <StatCard
                    title="Traitement Node"
                    value={summary.en_cours}
                    subtitle="Flux en résolution"
                    icon={Zap}
                    color="sky"
                    trend={[5, 8, 12, 10, 15, 12, 18, 20]}
                />
                <StatCard
                    title="Clôtures Certifiées"
                    value={summary.cloturees}
                    subtitle="Ecarts neutralisés"
                    icon={CheckCircle}
                    color="emerald"
                    trend={[10, 15, 18, 25, 28, 35, 40, 45]}
                />
            </div>

            {/* Quality KPIs HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-indigo-600/10 to-blue-600/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-indigo-100/50 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-300/30 transition-all duration-700" />
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="h-20 w-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 group-hover:rotate-12 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Taux de Succès</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{stats?.quality_kpis?.taux_efficacite || 0}%</span>
                                <span className="text-sm font-bold text-indigo-400">EFFICACITÉ</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1 italic">Actions correctives durables</p>
                        </div>
                    </div>
                    <div className="hidden lg:block h-24 w-48 relative z-10 opacity-60">
                        {/* Sparkline style visualization for effectiveness */}
                        <div className="h-full w-full flex items-end gap-1 px-4">
                            {[40, 60, 45, 70, 55, 80, 75, 90].map((h, i) => (
                                <div key={i} className="flex-1 bg-indigo-400/20 rounded-t-lg transition-all group-hover:bg-indigo-400/40" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-emerald-100/50 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-300/30 transition-all duration-700" />
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="h-20 w-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 group-hover:rotate-12 transition-transform">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Temps de Cycle</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{stats?.quality_kpis?.delai_moyen_resolution || 0}</span>
                                <span className="text-sm font-bold text-emerald-400">JOURS</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1 italic">Moyenne détection → clôture</p>
                        </div>
                    </div>
                    <div className="hidden lg:block h-24 w-48 relative z-10 opacity-60">
                        {/* Inverse sparkline style for Cycle Time (lower is better) */}
                        <div className="h-full w-full flex items-end gap-1 px-4">
                            {[80, 65, 70, 50, 45, 30, 35, 20].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-400/20 rounded-t-lg transition-all group-hover:bg-emerald-400/40" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Deep-Dive Visualization Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Mission Trajectory Chart */}
                <div className="lg:col-span-8 bg-white/90 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-indigo-100/30" />

                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                                <BarChart3 className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Index de Déclaration</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" /> Volume NC / 30 Jours glissants
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                            Live Feed Matrix
                        </div>
                    </div>

                    <div className="h-[380px] relative z-10 mt-6">
                        <ReactApexChart
                            options={areaChartOptions}
                            series={[{ name: 'Volume NC', data: trendData }]}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Resolution Engine Efficiency */}
                <div className="lg:col-span-4 bg-white/90 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-50/50 rounded-full blur-[60px] group-hover:bg-emerald-100 transition-colors duration-1000" />

                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="h-12 w-12 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-md font-black text-slate-900 uppercase tracking-tighter leading-none">Node Efficiency</h3>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Taux de résolution global</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative py-8">
                        <ReactApexChart
                            options={radialOptions}
                            series={[resolutionRate]}
                            type="radialBar"
                            height={340}
                            width="100%"
                        />
                        <div className="absolute bottom-8 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "px-6 py-2.5 text-[11px] font-black rounded-2xl border uppercase tracking-[0.2em] inline-block shadow-sm",
                                    resolutionRate > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                )}
                            >
                                {resolutionRate > 80 ? 'Haute Performance' : 'Optimisation Requise'}
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-slate-900/20 relative z-10 group-hover:bg-indigo-600 transition-colors duration-500">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Delta Monthly</span>
                            <span className="text-md font-black tracking-tighter opacity-100">+4.2% Growth</span>
                        </div>
                        <div className="h-11 w-11 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md border border-white/10">
                            <Zap className="h-5 w-5 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Secondary Analytic HUDs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Critical Risk Matrix */}
                <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50/50 rounded-full blur-[60px] -mr-24 -mt-24 transition-all duration-1000 group-hover:bg-rose-100/40" />

                    <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="h-14 w-14 bg-rose-50 text-rose-600 border border-rose-100 rounded-3xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                            <ShieldAlert className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Matrice de Criticité</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <div className="h-2 w-2 bg-rose-500 rounded-full animate-ping" /> Classification des Risques Industriels
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        {stats?.by_criticite?.map((item: any, idx: number) => {
                            const percentage = summary.total > 0 ? (item.count / summary.total) * 100 : 0;
                            const isDanger = item.label === 'Vital' || item.label === 'Critique' || item.label === 'NC4' || item.label === 'NC3';

                            return (
                                <div key={idx} className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full",
                                                isDanger ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-slate-300'
                                            )} />
                                            <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest leading-none">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">{item.count}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{Math.round(percentage)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 group-hover:border-slate-200 transition-colors">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1.5, delay: idx * 0.1, type: 'spring' }}
                                            className={cn(
                                                "h-full rounded-full transition-all relative",
                                                item.label === 'Mineur' || item.label === 'NC1' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                                                    item.label === 'Moyen' || item.label === 'NC2' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                                                        'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_15px_#f43f5e]'
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 h-full w-6 bg-white/20 skew-x-12 animate-pulse" />
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Segmentation Registry HUD */}
                <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-50/50 rounded-full blur-[60px] group-hover:bg-indigo-100/40 transition-all duration-1000" />

                    <div className="flex items-center gap-6 mb-10 relative z-10">
                        <div className="h-14 w-14 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-3xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                            <Layers className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Registry Typologique</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <div className="h-2 w-2 bg-indigo-500 rounded-full" /> Segmentation analytique des Défauts
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 mt-6 relative z-10">
                        {stats?.by_type?.map((type: any, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx}
                                className="py-6 flex items-center justify-between group/item cursor-pointer hover:bg-indigo-50/50 -mx-6 px-6 rounded-[2rem] transition-all border-l-4 border-l-transparent hover:border-l-indigo-500 overflow-hidden"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-slate-900 group-hover/item:text-white group-hover/item:border-slate-900 transition-all shadow-md group-hover/item:rotate-12">
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black text-slate-800 uppercase tracking-tighter group-hover/item:text-indigo-600 transition-colors">{type.type_nc}</p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1.5 italic">Standard Protocol Flow</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                                            {String(type.count).padStart(2, '0')}
                                        </span>
                                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 mt-2.5">Occurrence</span>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-slate-200 group-hover/item:text-indigo-600 group-hover/item:translate-x-2 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HUD Footer Signature */}
            <div className="px-12 py-8 bg-slate-900 rounded-[3rem] text-white flex items-center justify-between shadow-2xl mt-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">AeroTech Dynamic Analytics v.4.0</span>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic">Analytic Stream Certified</span>
                </div>
            </div>
        </div>
    );
}

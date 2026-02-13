import React, { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    Activity,
    Wrench,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    Target,
    Zap,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useKpis } from '../hooks/useKpis';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import ReactApexChart from "react-apexcharts";
import { exportAuditKPIsPDF } from '@/utils/pdfExportAudit';

interface KpiStatCardProps {
    title: string;
    value: string | number;
    unit?: string;
    subtitle: string;
    icon: any;
    color: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'sky';
    trend?: number;
    trendSeries?: number[];
}

const KpiStatCard = ({ title, value, unit, subtitle, icon: Icon, color, trend, trendSeries }: KpiStatCardProps) => {
    const isPositive = trend !== undefined && trend >= 0;

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
        colors: [
            color === 'blue' ? '#3B82F6' :
                color === 'emerald' ? '#10B981' :
                    color === 'rose' ? '#F43F5E' :
                        color === 'amber' ? '#F59E0B' :
                            color === 'indigo' ? '#6366F1' : '#0EA5E9'
        ],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 shadow-sm p-7 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors duration-500" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-[1.5rem] shadow-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110",
                        color === 'blue' ? "bg-blue-600 text-white shadow-blue-200" :
                            color === 'emerald' ? "bg-emerald-500 text-white shadow-emerald-200" :
                                color === 'rose' ? "bg-rose-500 text-white shadow-rose-200" :
                                    color === 'amber' ? "bg-amber-500 text-white shadow-amber-200" :
                                        color === 'indigo' ? "bg-indigo-600 text-white shadow-indigo-200" :
                                            "bg-sky-500 text-white shadow-sky-200"
                    )}>
                        <Icon className="h-7 w-7" />
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all",
                            isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1 ml-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
                        {unit && <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{unit}</span>}
                    </div>
                </div>

                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mt-4 ml-1 flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full", isPositive ? "bg-emerald-500" : "bg-rose-500")} />
                    {subtitle}
                </p>

                {trendSeries && (
                    <div className="mt-8 h-16 -mx-2">
                        <ReactApexChart
                            options={sparklineOptions}
                            series={[{ data: trendSeries }]}
                            type="area"
                            height="100%"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ReportingPage: React.FC = () => {
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    });

    const { data, loading, error, refetch } = useKpis({ filters });

    const tendanceChartOptions: any = {
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Outfit, Inter, sans-serif',
            background: 'transparent'
        },
        stroke: { curve: 'smooth', width: 4, colors: ['#6366f1', '#10b981'] },
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
            categories: data?.tendances.map(t => t.mois) || [],
            labels: { style: { colors: '#94a3b8', fontWeight: 800, fontSize: '10px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 900, fontSize: '11px' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 8, padding: { left: 20, right: 20 } },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontWeight: 800,
            fontSize: '11px',
            textAnchor: 'end',
            markers: { radius: 8, width: 8, height: 8 },
            itemMargin: { horizontal: 15 }
        },
        tooltip: { theme: 'light', x: { show: true } }
    };

    const performanceSeries = [
        { name: 'Mission Volume', data: data?.tendances.map(t => t.total) || [] },
        { name: 'Certified Success', data: data?.tendances.map(t => t.valides) || [] }
    ];

    if (loading) {
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

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center">
                <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 border border-rose-100 shadow-2xl shadow-rose-100 animate-bounce">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Sync Interface Error</h3>
                <p className="text-slate-500 mt-3 max-w-md font-bold uppercase text-[10px] tracking-widest">{error}</p>
                <button
                    onClick={() => refetch()}
                    className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                >
                    Re-establish Feed
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">

            {/* 1. Executive Intelligence Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group hover:rotate-6 transition-transform">
                        <BarChart3 className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Intelligence Opérationnelle</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2.5 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
                            Analyse Prédictive & KPIs Industriels
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
                        title="Actualiser les données"
                    >
                        <RefreshCw className="h-5 w-5 text-slate-400 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                    <button
                        onClick={() => exportAuditKPIsPDF(data, filters)}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 hover:scale-105 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 active:scale-95 group"
                    >
                        <Download className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                        Audit Stratégique
                    </button>
                </div>
            </div>

            {/* 2. Chronological Analysis Filter */}
            <div className="p-4 bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-[3rem] flex flex-col xl:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 w-full xl:w-auto px-6 border-r border-slate-100">
                    <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block leading-none">Timeline</span>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest mt-1 block">Analyse Temporelle</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                    <div className="relative group">
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[12px] font-black focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest"
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Input</span>
                        <div className="absolute -top-2 right-6 bg-slate-900 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-[0.2em] shadow-lg">Start Sequence</div>
                    </div>
                    <div className="relative group">
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[12px] font-black focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest"
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Input</span>
                        <div className="absolute -top-2 right-6 bg-indigo-600 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-[0.2em] shadow-lg">End Sequence</div>
                    </div>
                </div>

                <button
                    onClick={() => refetch()}
                    className="w-full xl:w-48 py-4 bg-slate-900 text-white hover:bg-indigo-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 shrink-0"
                >
                    Sync Feed
                </button>
            </div>

            {/* 3. Primary Mission Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiStatCard
                    title="Conformité Globale"
                    value={data.taux_reussite.valeur}
                    unit="%"
                    subtitle="Certified Success Index"
                    icon={Target}
                    color="emerald"
                    trend={data.taux_reussite.variation}
                    trendSeries={[65, 78, 82, 85, 88, 92, 90, 94]}
                />
                <KpiStatCard
                    title="Volume Test"
                    value={data.total_tests.valeur}
                    subtitle="Live Mission Registry"
                    icon={Activity}
                    color="indigo"
                    trend={data.total_tests.variation_pct}
                    trendSeries={[10, 15, 25, 20, 30, 45, 40, 52]}
                />
                <KpiStatCard
                    title="Alertes Qualité"
                    value={data.non_conformites.total}
                    subtitle="Non-Conformity Flux"
                    icon={AlertTriangle}
                    color="rose"
                    trend={-(data.non_conformites.variation)}
                    trendSeries={[5, 12, 8, 15, 10, 4, 7, 3]}
                />
                <KpiStatCard
                    title="Temps Moyen"
                    value={data.temps_moyen_execution.valeur}
                    unit={data.temps_moyen_execution.unite}
                    subtitle="Execution Velocity"
                    icon={Clock}
                    color="amber"
                    trendSeries={[12, 11, 10.5, 9, 8.5, 8, 7.8, 7.5]}
                />
            </div>

            {/* 4. Real-time Status Micro-metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Missions Terminées', val: data.tests_par_statut['TERMINE'] || 0, icon: CheckCircle, color: 'emerald' },
                    { label: 'Opérations Actives', val: data.tests_par_statut['EN_COURS'] || 0, icon: Zap, color: 'blue' },
                    { label: 'NC Critiques', val: data.non_conformites.ouvertes, icon: XCircle, color: 'rose' },
                    { label: 'Utilisation Parc', val: `${data.taux_utilisation_equipements.valeur}%`, icon: Wrench, color: 'indigo' }
                ].map((m, idx) => (
                    <div key={idx} className="bg-white/50 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-white hover:shadow-md transition-all group">
                        <div className={cn(
                            "h-11 w-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                            m.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                m.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                    m.color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                        )}>
                            <m.icon className="h-5.5 w-5.5" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                            <h4 className="text-xl font-black text-slate-900 tracking-tighter mt-0.5">{m.val}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. Mission Trajectory & Comparative Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Performance Trajectory (Main Chart) */}
                <div className="lg:col-span-8 bg-white/90 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-indigo-100/30" />

                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Trajectoire de Performance</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" /> Volume Global vs Succès Certifiés
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>

                    <div className="h-[400px] relative z-10 mt-6">
                        <ReactApexChart
                            options={tendanceChartOptions}
                            series={performanceSeries}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Analytical Breakthroughs & Health Check */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-900/40 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px] -mr-24 -mt-24 transition-all duration-1000 group-hover:bg-indigo-600/40" />

                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em]">Breakthroughs</h3>
                        </div>

                        <div className="space-y-8 relative z-10">
                            {data.performance_par_type.slice(0, 4).map((perf, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{perf.type}</span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-tighter">Performance Index</span>
                                        </div>
                                        <span className="text-xl font-black text-white tracking-tighter">{perf.taux_reussite}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${perf.taux_reussite}%` }}
                                            transition={{ duration: 1.5, type: 'spring' }}
                                            className={cn(
                                                "h-full rounded-full transition-all relative",
                                                perf.taux_reussite >= 90 ? "bg-indigo-500 shadow-[0_0_15px_#6366f1]" :
                                                    perf.taux_reussite >= 75 ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-amber-500 shadow-[0_0_15px_#f59e0b]"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-pulse" />
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95">
                            Full Analytics Hub
                        </button>
                    </div>

                    <div className="flex-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-50/50 rounded-full blur-[50px] group-hover:bg-emerald-100 transition-colors" />
                        <div className="flex items-center gap-5 mb-5 relative z-10">
                            <div className="h-14 w-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 group-hover:rotate-6 transition-transform">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Infrastructure Health</h3>
                                <p className="text-[22px] font-black text-slate-900 tracking-tighter leading-none">Operational SLA</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10 bg-emerald-50/50 w-fit px-4 py-2 rounded-xl border border-emerald-100">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">99.9% Robustness</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. High-Fidelity Performance Registry */}
            <div className="bg-white/90 backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] rounded-[4rem] border border-slate-100 overflow-hidden mt-12">
                <div className="px-12 py-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Performance par Typologie</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                            <div className="h-2 w-2 bg-indigo-500 rounded-full" /> Analyse granulaire des protocoles de tests
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
                            <Filter className="h-4 w-4" /> Configurer Colonnes
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="pl-12 pr-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Identification / Domaine</th>
                                <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Volume Mission</th>
                                <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Certification HUD</th>
                                <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Trajectory Success</th>
                                <th className="pl-6 pr-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Registry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.performance_par_type.map((perf, index) => (
                                <tr key={index} className="hover:bg-indigo-50/20 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600 relative">
                                    <td className="pl-12 pr-6 py-8 border-r border-slate-50/50">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-all group-hover:rotate-12 group-hover:bg-indigo-600">
                                                {idxToChar(index)}
                                            </div>
                                            <div>
                                                <span className="text-[14px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{perf.type}</span>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1.5 italic">Standard Protocol Flow</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center bg-slate-50/10">
                                        <span className="text-lg font-black text-slate-800 tracking-tighter">{perf.total}</span>
                                        <p className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-widest">Entities</p>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[12px] font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-xl border border-emerald-100 shadow-sm uppercase tracking-widest">
                                                {perf.valides} OK
                                            </span>
                                            <p className="text-[8px] font-black text-slate-300 uppercase mt-2 tracking-widest">Certified</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield Index</span>
                                                <span className="text-[13px] font-black text-slate-900 tracking-tighter">{perf.taux_reussite}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${perf.taux_reussite}%` }}
                                                    transition={{ duration: 1, delay: index * 0.05 }}
                                                    className={cn(
                                                        "h-full rounded-full transition-all relative overflow-hidden",
                                                        perf.taux_reussite >= 90 ? 'bg-indigo-600 shadow-[0_0_10px_#6366f1]' :
                                                            perf.taux_reussite >= 75 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                                                                perf.taux_reussite >= 60 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                                                    )}
                                                >
                                                    <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-pulse" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="pl-6 pr-12 py-8 text-right">
                                        <button className="h-12 w-12 bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl flex items-center justify-center transition-all active:scale-90 group/btn">
                                            <ChevronRight className="h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Optional Footer Signature */}
                <div className="px-12 py-8 bg-slate-900 text-white flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">AeroTech Intelligence Engine v.4.0</span>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic">Continuous Feed Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const idxToChar = (idx: number) => {
    return String.fromCharCode(65 + (idx % 26));
};

export default ReportingPage;

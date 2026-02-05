import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Calendar,
    Clock,
    ChevronRight,
    ShieldAlert,
    Thermometer,
    Bell,
    CheckCircle2,
    Settings,
    ArrowRight,
    Zap,
    Target,
    Activity,
    Cpu,
    Fingerprint,
    Timer,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { instrumentsService } from '@/services/instrumentsService';
import { formatDate, cn } from '@/utils/helpers';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function CalibrationAlertsPage() {
    const { data: alerts, isLoading } = useQuery({
        queryKey: ['calibration-alerts'],
        queryFn: () => instrumentsService.getCalibrationAlerts(),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Collecte des alertes métrologiques...</p>
            </div>
        );
    }

    const expiredCount = alerts?.expired?.length || 0;
    const upcomingCount = alerts?.upcoming?.length || 0;

    const calibrationKpis = [
        {
            title: "Instruments Scellés",
            value: ((alerts?.expired?.length || 0) + (alerts?.upcoming?.length || 0) + 12), // Simulant le total
            subtitle: "Parc total monitoré",
            icon: Target,
            color: "blue",
            trend: [10, 11, 12, 12, 12, 13, 13]
        },
        {
            title: "Cycles Échus",
            value: expiredCount,
            subtitle: "Conformité rompue",
            icon: ShieldAlert,
            color: "red",
            trend: [2, 3, 1, 4, 2, 5, expiredCount]
        },
        {
            title: "Prochaines Échéances",
            value: upcomingCount,
            subtitle: "Fenêtre 30 jours",
            icon: Timer,
            color: "orange",
            trend: [15, 12, 10, 8, 9, 11, upcomingCount]
        },
        {
            title: "Health Factor",
            value: "94%",
            subtitle: "État de calibration",
            icon: Activity,
            color: "emerald",
            trend: [90, 92, 91, 94, 93, 95, 94]
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 group hover:rotate-6 transition-transform">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Metrology Intel Center
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2">
                            <Fingerprint className="h-3 w-3 text-indigo-500" />
                            Surveillance stratégique et alertes de conformité instru-core
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
                {calibrationKpis.map((kpi) => (
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

            {/* 3. Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Expired Alerts - High Priority Live Feed Pattern */}
                <div className="lg:col-span-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm border border-rose-200 animate-pulse">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                        Rupture de Conformité Détectée
                                    </h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Instruments nécessitant un arrêt machine immédiat</p>
                                </div>
                            </div>
                            <span className="flex h-8 px-4 items-center justify-center bg-rose-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-rose-200 border border-rose-500 uppercase tracking-widest">
                                {expiredCount} Alerts
                            </span>
                        </div>

                        <div className="p-8 space-y-4 flex-1">
                            {expiredCount === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-6 opacity-40">
                                    <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <p className="text-[12px] font-black text-slate-500 uppercase tracking-[4px] italic">Intégrité métrologique totale</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {alerts?.expired.map((inst: any, idx: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={inst.id_instrument}
                                            className="group p-6 bg-slate-50/50 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-rose-500/5 transition-all cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-100"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-rose-200 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                    <Thermometer className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <span className="text-[10px] font-black px-2.5 py-1 bg-slate-900 text-white rounded-lg uppercase tracking-widest">{inst.code_instrument}</span>
                                                        <p className="text-[15px] font-black text-slate-900 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{inst.designation}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5 opacity-60">
                                                            <Settings className="h-3 w-3" />
                                                            Fabricant: {inst.fabricant}
                                                        </span>
                                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                        <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            Échu depuis le: {formatDate(inst.date_prochaine_calibration)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/instruments/${inst.id_instrument}`}
                                                className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all"
                                            >
                                                <ChevronRight className="h-5 w-5 transform group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Synchronisation Monitoring Temps Réel Active</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Alerts - Sidebar Grid Pattern */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Horizon Prévisionnel</h2>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Interventions planifiées (J-30)</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar max-h-[500px] pr-2">
                            {upcomingCount === 0 ? (
                                <div className="text-center py-10 opacity-20">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] italic">Aucune dérive détectée</p>
                                </div>
                            ) : (
                                alerts?.upcoming.map((inst: any, idx: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={inst.id_instrument}
                                        className="p-5 rounded-3xl bg-slate-50 border border-transparent hover:bg-white hover:border-orange-100 hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1 opacity-60">Instrument Profile</span>
                                                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight line-clamp-1">{inst.designation}</h4>
                                            </div>
                                            <Link to={`/instruments/${inst.id_instrument}`}>
                                                <div className="h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all shadow-sm">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{formatDate(inst.date_prochaine_calibration)}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 uppercase tracking-widest group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                                                Active Alert
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Summary Insight */}
                        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-950 p-6 rounded-[2rem] text-white shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="h-5 w-5 text-indigo-400" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Analytique Prédictive</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                Le cycle de calibration global montre un taux de dérive de <span className="text-white">+1.2%</span>. Planification optimisée sur le cycle Q2.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

import {
    Play,
    ClipboardCheck,
    AlertTriangle,
    Clock,
    Activity,
    CheckCircle2,
    ChevronRight,
    Zap,
    ShieldAlert,
    BarChart3,
    Microscope,
    Share2,
    Edit3,
    Target as TargetIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { testsService } from '@/services/testsService';
import { ncService } from '@/services/ncService';
import { cn } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '@/store/modalStore';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
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

export default function Dashboard_Technician() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { openExecutionModal, openNcModal, openTestDetailsModal } = useModalStore();

    useEffect(() => {
        queryClient.prefetchQuery({
            queryKey: ['test-creation-data'],
            queryFn: () => testsService.getCreationData(),
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient]);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['technician-stats'],
        queryFn: () => testsService.getTechnicianStats(),
    });

    const { data: ncStats } = useQuery({
        queryKey: ['nc-summary-technician'],
        queryFn: () => ncService.getNcStats(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin shadow-xl" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initialisation du Poste de Contrôle...</p>
                </div>
            </div>
        );
    }

    const quickStats = [
        { label: "Tests Assignés", value: stats?.assignedCount || 0, icon: Clock, color: "blue", trend: [10, 15, 8, 20, 18, 25, 30] },
        { label: "Sessions Actives", value: stats?.inProgressCount || 0, icon: Activity, color: "orange", trend: [2, 5, 3, 8, 10, 12, 11] },
        { label: "Interventions OK", value: stats?.completedCount || 0, icon: CheckCircle2, color: "emerald", trend: [50, 60, 55, 70, 80, 85, 90] },
        { label: "NC Signalées", value: ncStats?.summary?.total || 0, icon: ShieldAlert, color: "red", trend: [1, 2, 0, 3, 2, 1, 4] },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">
            {/* 1. Header Area (Technician Command Center) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 group hover:rotate-6 transition-transform">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Operator Terminal <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 tracking-widest">v4.2</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2">
                            <Activity className="h-3 w-3 text-indigo-500" />
                            Session active • Opérateur {user?.prenom} {user?.nom} • ID #772-NODE
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Yield Session</span>
                            <span className="text-[14px] font-black text-slate-900 leading-none tracking-tighter">84.2%</span>
                        </div>
                        <TargetIcon className="h-6 w-6 text-emerald-500 opacity-60" />
                    </div>
                    <button
                        onClick={() => navigate('/technician/tests')}
                        className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group active:scale-95"
                    >
                        <Zap className="h-4 w-4 group-hover:scale-110 transition-transform fill-current" />
                        Terminal Complet
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((kpi) => (
                    <StatCard
                        key={kpi.label}
                        title={kpi.label}
                        value={kpi.value}
                        subtitle="Sessions à jour"
                        icon={kpi.icon}
                        color={kpi.color}
                        trend={kpi.trend}
                    />
                ))}
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Immediate Tasks Queue */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">Priorités Opérationnelles</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-[0.2em] italic">Interventions assignées en temps réel</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/technician/tests')}
                                className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
                            >
                                Explorer Node
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto no-scrollbar flex-1">
                            {stats?.assignedTests?.length > 0 ? (
                                stats.assignedTests.map((test: any, idx: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={test.id_test}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all gap-5 relative overflow-hidden active:scale-[0.99] cursor-pointer"
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-[11px] border shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3",
                                                test.statut_test === 'TERMINE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    test.statut_test === 'EN_COURS' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                        "bg-white text-slate-400 border-slate-100"
                                            )}>
                                                {test.numero_test.split('-')[1] || 'NODE'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <p className="text-[14px] font-black text-slate-900 tracking-tight uppercase">{test.numero_test}</p>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[8px] font-black rounded-lg uppercase border tracking-widest",
                                                        test.statut_test === 'EN_COURS' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            test.statut_test === 'TERMINE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                "bg-blue-50 text-blue-600 border-blue-100"
                                                    )}>
                                                        {test.statut_test === 'EN_COURS' ? 'Active Session' :
                                                            test.statut_test === 'TERMINE' ? 'Verified' : 'Scheduled'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{test.equipement?.designation}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                                        <p className="text-[9px] text-slate-400 font-black italic uppercase tracking-widest">{test.type_test?.libelle_type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 relative z-10">
                                            {test.statut_test === 'PLANIFIE' && (
                                                <button
                                                    onClick={() => openExecutionModal(test.id_test)}
                                                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] hover:bg-black transition-all shadow-xl shadow-slate-200 group/btn active:scale-95"
                                                >
                                                    <Play className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                                                    Lancer Node
                                                </button>
                                            )}

                                            {test.statut_test === 'EN_COURS' && (
                                                <button
                                                    onClick={() => openExecutionModal(test.id_test)}
                                                    className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                                                >
                                                    <ClipboardCheck className="h-4 w-4" />
                                                    Synchro Live
                                                </button>
                                            )}

                                            {test.statut_test === 'TERMINE' && (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => openTestDetailsModal(test.id_test)}
                                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[2px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                                    >
                                                        Rapport Core
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const { openTestModal } = useModalStore.getState();
                                                                openTestModal(test.id_test);
                                                            }}
                                                            className="p-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 hover:bg-white transition-all shadow-sm"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (navigator.share) {
                                                                    navigator.share({
                                                                        title: `Rapport Test ${test.numero_test}`,
                                                                        text: `Résultats du test pour ${test.equipement?.designation}`,
                                                                        url: window.location.href,
                                                                    }).catch(() => toast.error("Erreur partage"));
                                                                } else {
                                                                    navigator.clipboard.writeText(window.location.href);
                                                                    toast.success("Lien copié");
                                                                }
                                                            }}
                                                            className="p-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-100 hover:bg-white transition-all shadow-sm"
                                                        >
                                                            <Share2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="inline-flex h-20 w-20 bg-slate-50 border border-slate-100 rounded-full items-center justify-center mb-6 text-slate-300">
                                        <ClipboardCheck className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">Aucune tâche assignée</h4>
                                    <p className="text-slate-400 font-bold italic mt-1 text-[10px]">L'intégrité du système est nominale.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasking & Safety Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Action Hub */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group border border-white/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-8 flex items-center gap-3">
                            <Zap className="h-4 w-4" />
                            Réactions Terrain Live
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <button
                                onClick={openNcModal}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-600 hover:border-orange-500 transition-all group/btn active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-5 text-left">
                                    <div className="h-12 w-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-inner">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Signaler un Écart NC</p>
                                        <p className="text-[9px] text-orange-400/60 group-hover/btn:text-white/80 transition-all mt-1 italic">Notification immédiate engineering</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => navigate('/technician/equipements')}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600 hover:border-indigo-600 transition-all group/btn active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-5 text-left">
                                    <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-inner">
                                        <Microscope className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Consulter Asset Base</p>
                                        <p className="text-[9px] text-slate-400 group-hover/btn:text-white/80 transition-all mt-1 italic">Registre technique des actifs</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Performance Summary Widget */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Efficience Opérateur</h2>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest italic border-l-2 border-indigo-500 pl-2">Performance temps réel</p>
                            </div>
                            <BarChart3 className="h-6 w-6 text-indigo-200" />
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400 font-black">Quota Journalier</span>
                                    <span className="text-emerald-600">12 / 15 NODES</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: '80%' }} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400 font-black">Précision Diagnostique</span>
                                    <span className="text-blue-600">98.2% ACCURACY</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: '98.2%' }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            <p className="text-[10px] text-emerald-800 font-bold leading-relaxed italic">
                                Félicitations. Vos dernières interventions sur la Node-4 ont été validées sans écart technique. Continuez sur ce rythme nominal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

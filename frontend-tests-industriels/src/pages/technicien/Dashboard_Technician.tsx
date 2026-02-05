import {
    Play,
    ClipboardCheck,
    AlertTriangle,
    Clock,
    Activity,
    CheckCircle2,
    ChevronRight,
    Zap,
    Target,
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
        colors: [color === 'blue' ? '#2E5BFF' : color === 'orange' ? '#FFAB00' : color === 'emerald' ? '#00C853' : '#ef4444'],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="relative bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden h-full group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary-50/50 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-110",
                        color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" :
                            color === 'orange' ? "bg-gradient-to-br from-orange-400 to-red-500 text-white" :
                                color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white" :
                                    "bg-gradient-to-br from-red-500 to-rose-600 text-white"
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header consistent with Admin */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-200">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Poste de Contrôle Actif</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-bold italic">Bienvenue, Opérateur {user?.prenom} {user?.nom}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Taux de Complétion</p>
                            <p className="text-sm font-black text-slate-900 leading-none">84%</p>
                        </div>
                        <TargetIcon className="h-6 w-6 text-emerald-500 opacity-60" />
                    </div>
                    <button
                        onClick={() => navigate('/technician/tests')}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group active:scale-95"
                    >
                        <Activity className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>Terminal Tests</span>
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
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary-600" />
                                    Priorités de Session
                                </h2>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Interventions urgentes planifiées</p>
                            </div>
                            <button
                                onClick={() => navigate('/technician/tests')}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:text-primary-600 transition-all shadow-sm"
                            >
                                Planning Complet
                            </button>
                        </div>

                        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide flex-1">
                            {stats?.assignedTests?.length > 0 ? (
                                stats.assignedTests.map((test: any, idx: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={test.id_test}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/20 transition-all gap-5"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-primary-600 text-[10px] group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                {test.numero_test.split('-')[1] || 'TST'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-[12px] font-black text-slate-900 tracking-tight">{test.numero_test}</p>
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 text-[7px] font-black rounded-md uppercase border",
                                                        test.statut_test === 'EN_COURS' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            test.statut_test === 'TERMINE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                "bg-blue-50 text-blue-600 border-blue-100"
                                                    )}>
                                                        {test.statut_test === 'EN_COURS' ? 'En Cours' :
                                                            test.statut_test === 'TERMINE' ? 'Terminé' : 'Planifié'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{test.equipement?.designation}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold italic">{test.type_test?.libelle_type}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {test.statut_test === 'PLANIFIE' && (
                                                <button
                                                    onClick={() => openExecutionModal(test.id_test)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all shadow-md group/btn"
                                                >
                                                    <Play className="h-3 w-3 fill-current" />
                                                    Démarrer
                                                </button>
                                            )}

                                            {test.statut_test === 'EN_COURS' && (
                                                <button
                                                    onClick={() => openExecutionModal(test.id_test)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md"
                                                >
                                                    <ClipboardCheck className="h-3 w-3" />
                                                    Actualiser
                                                </button>
                                            )}

                                            {test.statut_test === 'TERMINE' && (
                                                <div className="flex items-center gap-2 text-left">
                                                    <button
                                                        onClick={() => openTestDetailsModal(test.id_test)}
                                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                    >
                                                        Détails
                                                    </button>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                const { openTestModal } = useModalStore.getState();
                                                                openTestModal(test.id_test);
                                                            }}
                                                            className="p-2 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-primary-600 hover:border-primary-100 transition-all"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
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
                                                            className="p-2 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-100 transition-all"
                                                        >
                                                            <Share2 className="h-3.5 w-3.5" />
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
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-6 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Réactions Terrain
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <button
                                onClick={openNcModal}
                                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-500 hover:border-orange-500 transition-all group/btn"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-inner">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest">Signaler une NC</p>
                                        <p className="text-[9px] text-orange-400/60 group-hover/btn:text-white/80 transition-all">Ouverture de ticket</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => navigate('/technician/equipements')}
                                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-primary-600 hover:border-primary-600 transition-all group/btn"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 bg-primary-500/20 text-primary-400 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-inner">
                                        <Microscope className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest">Consultation Parc</p>
                                        <p className="text-[9px] text-slate-400 group-hover/btn:text-white/80 transition-all">État des actifs</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Performance Summary Widget */}
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight">Efficience Expert</h2>
                            <BarChart3 className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Tests Terminés (Total)</span>
                                    <span className="text-emerald-600">12 / 15</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Précision Moyenne</span>
                                    <span className="text-blue-600">98.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '98.2%' }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-[9px] text-emerald-800 font-bold leading-relaxed">
                                <CheckCircle2 className="h-3 w-3 inline mr-1 -mt-0.5" />
                                Vos dernières interventions sur la Ligne 4 ont été validées sans écart technique.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useQuery } from '@tanstack/react-query';
import {
    FlaskConical,
    AlertTriangle,
    AlertOctagon,
    UserCheck,
    Target,
    Activity,
    ChevronRight,
    Download,
    Users as UsersIcon,
    Zap,
    TrendingUp,
    ShieldAlert,
    Cpu,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { usersService } from '@/services/usersService';
import api from '@/config/api';
import { formatNumber, cn, formatDate } from '@/utils/helpers';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import NcDistributionChart from '@/components/dashboard/NcDistributionChart';
import ReactApexChart from "react-apexcharts";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
        colors: [color === 'blue' ? '#6366f1' : color === 'orange' ? '#f59e0b' : color === 'emerald' ? '#10b981' : '#6366f1'],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden h-full group transition-all duration-500"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-[1.25rem] shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        color === 'blue' ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-100" :
                            color === 'orange' ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-100" :
                                color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-100" :
                                    "bg-gradient-to-br from-slate-400 to-slate-600 text-white"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        +12.5%
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

export default function DashboardPage() {
    const { data: stats, isLoading: isTestsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => testsService.getTestsStats(),
    });

    const { data: userStats, isLoading: isUsersLoading } = useQuery({
        queryKey: ['users-stats'],
        queryFn: () => usersService.getUserStats(),
    });

    const isLoading = isTestsLoading || isUsersLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Collecte des indicateurs de performance...</p>
            </div>
        );
    }

    const handleExportAnalytical = async () => {
        try {
            toast.loading('Génération du rapport analytique...', { id: 'analytic' });
            const response = await api.get('/dashboard/analytics/pdf', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `CORE_ANALYTICS_${new Date().getFullYear()}.pdf`;
            link.click();
            toast.success('Rapport analytique CORE généré !', { id: 'analytic' });
        } catch (e) {
            toast.error('Erreur export', { id: 'analytic' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 group hover:rotate-6 transition-transform">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Executive OS Dashboard
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                            <Zap className="h-3 w-3 text-amber-500 fill-current" />
                            Pilotage haute précision des opérations industrielles
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Cycle Q1-2026</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-slate-900">Analytique Core</span>
                    </div>
                    <button
                        onClick={handleExportAnalytical}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                        Exporter Analytique
                    </button>
                </div>
            </div>

            {/* 2. KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tests en Cours"
                    value={stats?.testsEnCours || 0}
                    subtitle="Activité terrain live"
                    icon={Activity}
                    color="blue"
                    trend={[30, 40, 35, 50, 49, 60, 70, 91]}
                />
                <StatCard
                    title="NC Ouvertes"
                    value={stats?.ncOuvertes || 0}
                    subtitle="Actions requises"
                    icon={ShieldAlert}
                    color="orange"
                    trend={[10, 15, 8, 12, 18, 14, 10, 5]}
                />
                <StatCard
                    title="Engineers Node"
                    value={userStats?.total || 0}
                    subtitle="Experts certifiés"
                    icon={UserCheck}
                    color="blue"
                    trend={[20, 22, 22, 25, 25, 28, 30, 30]}
                />
                <StatCard
                    title="Yield Qualité"
                    value={`${formatNumber(stats?.tauxConformite || 0, 1)}%`}
                    subtitle="Indice de conformité"
                    icon={Target}
                    color="emerald"
                    trend={[85, 88, 87, 89, 92, 90, 93, 94]}
                />
            </div>

            {/* 3. Central Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Evolution Analytics */}
                <div className="lg:col-span-8 bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Index de Performance Industrielle</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Évolution des cycles de tests vs conformité</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Data Feed
                        </div>
                    </div>
                    <div className="h-[360px]">
                        <IndustrialChart data={stats?.industrial_evolution} />
                    </div>
                </div>

                {/* Distribution Analysis */}
                <div className="lg:col-span-4 bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Spectre des Risques</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Répartition analytique des non-conformités</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <NcDistributionChart data={stats?.nc_distribution} />
                    </div>
                    <div className="mt-8 p-5 bg-slate-900 rounded-[1.5rem] text-white flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center gap-4">
                            <Zap className="h-5 w-5 text-amber-500 fill-current" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerte Prioritaire</span>
                                <span className="text-[11px] font-black uppercase tracking-tight">Node #F-02 : Inspection requise</span>
                            </div>
                        </div>
                        <div className="relative z-10 h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-all cursor-pointer">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Real-time Activity Hub */}
            <div className="bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intelligence Flow Registry</h2>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic leading-none">Journal d'activité haute fidélité du parc industriel</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200">
                        Explorer Tout
                    </button>
                </div>

                <div className="divide-y divide-slate-50 max-h-[460px] overflow-y-auto no-scrollbar px-2">
                    {[...(stats?.recent_tests || []), ...(stats?.recent_nc || [])]
                        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                        .map((item: any, idx) => {
                            const isNC = !!item.numero_nc;
                            const isCritical = isNC && (item.criticite?.code_niveau === 'NC3' || item.criticite?.code_niveau === 'NC4');

                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    key={idx}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500 mx-2 my-1 rounded-2xl"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-11 w-11 rounded-2xl flex items-center justify-center border transition-all shadow-sm group-hover:scale-110",
                                            isNC ? "bg-rose-50 border-rose-100 text-rose-600 shadow-rose-50" : "bg-indigo-50 border-indigo-100 text-indigo-600 shadow-indigo-50",
                                        )}>
                                            {isNC ? <AlertTriangle className="h-5 w-5" /> : <FlaskConical className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{isNC ? item.numero_nc : item.numero_test}</p>
                                                {isCritical && <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-lg shadow-lg shadow-rose-200 animate-pulse tracking-widest">CRITIQUE</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate max-w-[200px] md:max-w-md mt-0.5 italic opacity-70">
                                                {isNC ? item.description : (item.equipement?.designation || 'Contrôle Intermédiaire')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{formatDate(item.created_at || new Date(), 'short')}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1.5">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                                    isNC ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                )}>
                                                    {isNC ? 'Incident' : (item.resultat_global || 'EN COURS')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    }
                </div>
            </div>

            {/* 5. Infrastructure Section */}
            <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100">
                            <UsersIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Infrastructure Humaine & Capacités</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">Status opérationnel par département node</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userStats?.by_departement?.map((dept: any, index: number) => {
                        const deptColors: any = {
                            'Direction': 'border-indigo-500 bg-indigo-50 text-indigo-600',
                            'Bureau d\'Essais': 'border-blue-500 bg-blue-50 text-blue-600',
                            'Maintenance': 'border-amber-500 bg-amber-50 text-amber-600',
                            'Qualité': 'border-emerald-500 bg-emerald-50 text-emerald-600',
                            'Production': 'border-slate-500 bg-slate-50 text-slate-600'
                        };
                        const colorClass = deptColors[dept.departement] || 'border-slate-300 bg-slate-50 text-slate-500';
                        const displayUsers = dept.users?.slice(0, 5) || [];
                        const extraCount = Math.max(0, (dept.count || 0) - 5);

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                key={index}
                                className="group p-6 bg-slate-50/30 rounded-[2rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{dept.departement}</h3>
                                    <span className="px-2.5 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-[0.1em] shadow-lg shadow-slate-200">{dept.count} Nodes</span>
                                </div>

                                <div className="flex items-center -space-x-3.5 pl-1 mb-2">
                                    {displayUsers.map((person: any, pIdx: number) => (
                                        <div
                                            key={pIdx}
                                            title={person.nom_complet}
                                            className={cn(
                                                "relative h-11 w-11 rounded-2xl border-2 border-white shadow-xl flex items-center justify-center font-black text-[10.5px] transition-all hover:scale-125 hover:z-20 cursor-pointer overflow-hidden group/avatar",
                                                colorClass.split(' ')[1],
                                                colorClass.split(' ')[2]
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-white/10 group-hover/avatar:bg-transparent transition-colors" />
                                            {person.prenom[0]}{person.nom[0]}
                                        </div>
                                    ))}
                                    {extraCount > 0 && (
                                        <div className="h-11 w-11 rounded-2xl border-2 border-white bg-slate-800 text-white shadow-xl flex items-center justify-center font-black text-[10.5px] z-10 transition-transform hover:scale-110">
                                            +{extraCount}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupation</span>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Optimisée</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

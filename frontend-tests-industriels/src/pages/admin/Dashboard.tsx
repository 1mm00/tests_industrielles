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
    Users
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
        colors: [color === 'blue' ? '#2E5BFF' : color === 'orange' ? '#FFAB00' : color === 'emerald' ? '#00C853' : '#6366f1'],
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
                                    "bg-gradient-to-br from-slate-400 to-slate-600 text-white"
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
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
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
            link.download = `RAPPORT_ANALYTIQUE_${new Date().getFullYear()}.pdf`;
            link.click();
            toast.success('Rapport analytique généré !', { id: 'analytic' });
        } catch (e) {
            toast.error('Erreur export', { id: 'analytic' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-200">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Executive Dashboard</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-bold italic">Pilotage haute précision des opérations</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span>Dashboard</span>
                        <ChevronRight className="h-2.5 w-2.5" />
                        <span className="text-primary-600">Analytique</span>
                    </div>
                    <button
                        onClick={handleExportAnalytical}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group active:scale-95"
                    >
                        <Download className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                        <span>Exporter Analytique</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tests en Cours"
                    value={stats?.testsEnCours || 0}
                    subtitle="Tests actifs terrain"
                    icon={Activity}
                    color="blue"
                    trend={[30, 40, 35, 50, 49, 60, 70, 91]}
                />
                <StatCard
                    title="NC Ouvertes"
                    value={stats?.ncOuvertes || 0}
                    subtitle="Résolution requise"
                    icon={AlertOctagon}
                    color="orange"
                    trend={[10, 15, 8, 12, 18, 14, 10, 5]}
                />
                <StatCard
                    title="Effectif Total"
                    value={userStats?.total || 0}
                    subtitle="Personnel qualifié"
                    icon={UserCheck}
                    color="blue"
                    trend={[20, 22, 22, 25, 25, 28, 30, 30]}
                />
                <StatCard
                    title="Taux Conformité"
                    value={`${formatNumber(stats?.tauxConformite || 0, 1)}%`}
                    subtitle="Performance globale"
                    icon={Target}
                    color="emerald"
                    trend={[85, 88, 87, 89, 92, 90, 93, 94]}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <IndustrialChart data={stats?.industrial_evolution} />
                </div>
                <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <NcDistributionChart data={stats?.nc_distribution} />
                </div>
            </div>

            {/* Recent Items Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary-600" />
                        Flux Temps Réel
                    </h2>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-full animate-pulse border border-emerald-100 uppercase tracking-widest">Live Monitor</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {[...(stats?.recent_tests || []), ...(stats?.recent_nc || [])]
                        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                        .map((item: any, idx) => {
                            const isNC = !!item.numero_nc;
                            const isCritical = isNC && (item.criticite?.code_niveau === 'NC3' || item.criticite?.code_niveau === 'NC4');

                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={idx}
                                    className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-9 w-9 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                                            isNC ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600",
                                        )}>
                                            {isNC ? <AlertTriangle className="h-4 w-4" /> : <FlaskConical className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] font-black text-slate-800">{isNC ? item.numero_nc : item.numero_test}</p>
                                                {isCritical && <span className="text-[7px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded shadow-sm animate-pulse">CRITIQUE</span>}
                                            </div>
                                            <p className="text-[9px] text-slate-500 font-bold truncate max-w-[150px] md:max-w-xs">{isNC ? item.description : (item.equipement?.designation || 'Contrôle Intermédiaire')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{formatDate(item.created_at || new Date(), 'short')}</p>
                                            <span className={cn(
                                                "inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase mt-0.5 border",
                                                isNC ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {isNC ? 'Incident' : (item.resultat_global || 'EN COURS')}
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary-600 transform group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </motion.div>
                            );
                        })
                    }
                </div>
            </div>

            {/* Teams Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-600" />
                        Infrastructure Humaine
                    </h2>
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{userStats?.total || 0} Experts</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userStats?.by_departement?.map((dept: any, index: number) => {
                        const deptColors: any = {
                            'Direction': 'border-blue-500 bg-blue-50 text-blue-600',
                            'Bureau d\'Essais': 'border-indigo-500 bg-indigo-50 text-indigo-600',
                            'Maintenance': 'border-orange-500 bg-orange-50 text-orange-600',
                            'Qualité': 'border-emerald-500 bg-emerald-50 text-emerald-600',
                            'Production': 'border-slate-500 bg-slate-50 text-slate-600'
                        };
                        const colorClass = deptColors[dept.departement] || 'border-slate-300 bg-slate-50 text-slate-500';
                        const displayUsers = dept.users?.slice(0, 4) || [];
                        const extraCount = Math.max(0, (dept.count || 0) - 4);

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                key={index}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{dept.departement}</h3>
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded-md uppercase tracking-widest">{dept.count}</span>
                                </div>

                                <div className="flex items-center -space-x-3 pl-1">
                                    {displayUsers.map((person: any, pIdx: number) => (
                                        <div
                                            key={pIdx}
                                            className={cn(
                                                "relative h-9 w-9 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-black text-[10px] transition-transform hover:scale-110 hover:z-20 cursor-pointer overflow-hidden",
                                                colorClass.split(' ')[1],
                                                colorClass.split(' ')[2]
                                            )}
                                        >
                                            {person.prenom[0]}{person.nom[0]}
                                        </div>
                                    ))}
                                    {extraCount > 0 && (
                                        <div className="h-9 w-9 rounded-full border-2 border-white bg-slate-800 text-white shadow-sm flex items-center justify-center font-black text-[10px] z-10">
                                            +{extraCount}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

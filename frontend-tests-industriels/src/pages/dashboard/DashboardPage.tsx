import { useQuery } from '@tanstack/react-query';
import {
    FlaskConical,
    AlertTriangle,
    ShieldCheck,
    AlertOctagon,
    UserCheck,
    Target,
    Activity
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { usersService } from '@/services/usersService';
import { formatNumber, cn } from '@/utils/helpers';
import IndustrialChart from '@/components/dashboard/IndustrialChart';
import NcDistributionChart from '@/components/dashboard/NcDistributionChart';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: string;
    progress: number;
    progressColor: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, progress, progressColor }: StatCardProps) => (
    <div className="card shadow-sm border-0 h-full">
        <div className="p-5">
            <div className="flex items-start mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color} bg-opacity-10 mr-4`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
                </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">{value}</h4>
            <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-gray-400 truncate">{subtitle}</p>
                <div className="flex-1 max-w-[80px]">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressColor} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

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
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Tableau de Bord Industriel</h1>
                    <p className="text-sm text-gray-500 font-medium">Suivi des Tests & Conformité</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="bg-gray-100 px-2 py-1 rounded">Dashboard</span>
                    <span>/</span>
                    <span className="text-gray-900">Analytique</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tests en Cours"
                    value={stats?.testsEnCours || 0}
                    subtitle="Tests actifs"
                    icon={Activity}
                    color="bg-blue-600"
                    progress={100}
                    progressColor="bg-blue-600"
                />
                <StatCard
                    title="NC Ouvertes"
                    value={stats?.ncOuvertes || 0}
                    subtitle="Non-conformités"
                    icon={AlertOctagon}
                    color="bg-orange-500"
                    progress={100}
                    progressColor="bg-orange-500"
                />
                <StatCard
                    title="Effectif Total"
                    value={userStats?.total || 0}
                    subtitle="Personnel enregistré"
                    icon={UserCheck}
                    color="bg-teal-600"
                    progress={100}
                    progressColor="bg-teal-600"
                />
                <StatCard
                    title="Taux Conformité"
                    value={`${formatNumber(stats?.tauxConformite || 0, 1)}%`}
                    subtitle="Performance globale"
                    icon={Target}
                    color="bg-emerald-600"
                    progress={stats?.tauxConformite || 0}
                    progressColor="bg-emerald-600"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <IndustrialChart data={stats?.industrial_evolution} />
                </div>
                <div className="lg:col-span-4">
                    <NcDistributionChart data={stats?.nc_distribution} />
                </div>
            </div>

            {/* Recent Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tests récents */}
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-primary-600" />
                        <h2 className="card-title">Tests récents</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {stats?.recent_tests?.length > 0 ? (
                            stats.recent_tests.map((test: any) => (
                                <div
                                    key={test.id_test}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-primary-600">
                                            <FlaskConical className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{test.numero_test}</p>
                                            <p className="text-xs text-gray-500">{test.equipement?.designation || 'Équipement inconnu'}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                        test.resultat_global === 'CONFORME' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {test.resultat_global || 'EN COURS'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-400 text-xs italic">Aucun test récent</p>
                        )}
                    </div>
                </div>

                {/* NC critiques */}
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h2 className="card-title">Alertes Qualité</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {stats?.recent_nc?.length > 0 ? (
                            stats.recent_nc.map((nc: any) => (
                                <div
                                    key={nc.id_non_conformite}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-red-600">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{nc.numero_nc}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{nc.description}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                        nc.criticite?.code_niveau?.includes('L3') || nc.criticite?.code_niveau?.includes('L4') ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                    )}>
                                        {nc.criticite?.code_niveau || 'NC'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-400 text-xs italic">Aucune alerte qualité active</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Répartition Personnel */}
            <div className="card">
                <div className="card-header flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    <h2 className="card-title">Effectif par Département</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userStats?.by_departement?.map((dept: any, index: number) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="text-gray-700">{dept.departement}</span>
                                    <span className="text-primary-600 font-black">{dept.count} personnel</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: `${(dept.count / userStats.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

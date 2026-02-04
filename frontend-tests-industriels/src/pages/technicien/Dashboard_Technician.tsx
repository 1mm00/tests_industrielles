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
    Edit3
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

export default function Dashboard_Technician() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { openExecutionModal, openNcModal, openTestDetailsModal } = useModalStore();

    // Prefetching intelligent : charger les données du formulaire en arrière-plan
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
        { label: "Tests Assignés", value: stats?.assignedCount || 0, icon: Clock, color: "blue", trend: "Aujourd'hui" },
        { label: "Sessions Actives", value: stats?.inProgressCount || 0, icon: Activity, color: "orange", trend: "En cours" },
        { label: "Interventions OK", value: stats?.completedCount || 0, icon: CheckCircle2, color: "emerald", trend: "Cette semaine" },
        { label: "NC Signalées", value: ncStats?.summary?.total || 0, icon: ShieldAlert, color: "red", trend: "Total" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* High-Impact Header */}
            <div className="relative overflow-hidden bg-gray-900 rounded-[3rem] p-8 xl:p-12 text-white shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                <Zap className="h-6 w-6 fill-current" />
                            </div>
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary-400">Station Opérationnelle Active</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                            POSTE DE <span className="text-primary-500">CONTRÔLE</span> <br />
                            <span className="opacity-50">{user?.prenom} {user?.nom}</span>
                        </h1>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Taux de Complétion</p>
                                <p className="text-2xl font-black">84%</p>
                            </div>
                            <div className="h-10 w-10">
                                <Target className="h-full w-full text-emerald-500 opacity-50" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/technician/tests')}
                                className="px-6 py-3 bg-white text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-50 transition-all flex items-center gap-2"
                            >
                                <Activity className="h-3 w-3" />
                                Ouvrir le Terminal Tests
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((kpi) => (
                    <div key={kpi.label} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        <div className={cn(
                            "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 transition-transform group-hover:scale-110",
                            `bg-${kpi.color}-500`
                        )} />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                kpi.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                    kpi.color === 'orange' ? "bg-orange-50 text-orange-600" :
                                        kpi.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                            "bg-red-50 text-red-600"
                            )}>
                                <kpi.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <div className="flex items-end gap-3">
                                    <h4 className="text-3xl font-black text-gray-900 leading-none">{kpi.value}</h4>
                                    <span className="text-[8px] font-black text-gray-400 uppercase mb-1">{kpi.trend}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Immediate Tasks Queue */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h3 className="font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary-600" />
                                    Priorités de la Session
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Interventions urgentes et tests planifiés</p>
                            </div>
                            <button
                                onClick={() => navigate('/technician/tests')}
                                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-primary-600 transition-all shadow-sm"
                            >
                                Planning Complet
                            </button>
                        </div>

                        <div className="p-4 md:p-8 space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                            {stats?.assignedTests?.length > 0 ? (
                                stats.assignedTests.map((test: any) => (
                                    <div
                                        key={test.id_test}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:ring-1 hover:ring-primary-100 transition-all border border-transparent border-l-4 border-l-primary-500 gap-6"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all text-xs border border-gray-100">
                                                {test.numero_test.split('-')[1] || 'TST'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-black text-gray-900 uppercase">{test.numero_test}</p>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[8px] font-black rounded uppercase",
                                                        test.statut_test === 'EN_COURS' ? "bg-amber-100 text-amber-700" :
                                                            test.statut_test === 'TERMINE' ? "bg-emerald-100 text-emerald-700" :
                                                                "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {test.statut_test === 'EN_COURS' ? 'En Cours' :
                                                            test.statut_test === 'TERMINE' ? 'Terminé' : 'Planifié'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">{test.equipement?.designation}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium italic">{test.type_test?.libelle_type}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Action principale selon le statut */}
                                            {test.statut_test === 'PLANIFIE' && (
                                                <button
                                                    onClick={() => openExecutionModal(test.id_test)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-md shadow-sky-100"
                                                >
                                                    <Play className="h-3 w-3 fill-current" />
                                                    Démarrer le test
                                                </button>
                                            )}

                                            {test.statut_test === 'EN_COURS' && (
                                                <button
                                                    onClick={() => openExecutionModal(test.id_test)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-amber-100"
                                                >
                                                    <ClipboardCheck className="h-3 w-3" />
                                                    Ajouter les résultats
                                                </button>
                                            )}

                                            {test.statut_test === 'TERMINE' && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openTestDetailsModal(test.id_test)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md"
                                                    >
                                                        Détails
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const { openTestModal } = useModalStore.getState();
                                                            openTestModal(test.id_test);
                                                        }}
                                                        className="p-2 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-primary-600 hover:border-primary-100 transition-all"
                                                        title="Modifier"
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
                                                                }).catch(() => toast.error("Erreur lors du partage"));
                                                            } else {
                                                                navigator.clipboard.writeText(window.location.href);
                                                                toast.success("Lien copié dans le presse-papier");
                                                            }
                                                        }}
                                                        className="p-2 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-blue-600 hover:border-blue-100 transition-all"
                                                        title="Partager"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="inline-flex h-24 w-24 bg-gray-50 rounded-full items-center justify-center mb-6 text-gray-300 shadow-inner">
                                        <ClipboardCheck className="h-10 w-10 text-gray-200" />
                                    </div>
                                    <h4 className="text-gray-900 font-black uppercase tracking-widest text-sm">Poste de mesure libéré</h4>
                                    <p className="text-gray-400 font-medium italic mt-2 text-xs">Aucun test ne vous est actuellement assigné dans cette session.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasking & Safety Panel */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    {/* Action Hub */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-400 mb-6 flex items-center gap-3">
                            <Zap className="h-5 w-5" />
                            Réactions Immédiates
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <button
                                onClick={openNcModal}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-500 hover:border-orange-500 transition-all group/btn"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest">Signaler une NC</p>
                                        <p className="text-[10px] text-orange-400/60 group-hover/btn:text-white/80 transition-all">Anomalie ou incident</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => navigate('/technician/equipements')}
                                className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-primary-600 hover:border-primary-600 transition-all group/btn"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 bg-primary-500/20 text-primary-400 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all">
                                        <Microscope className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest">État du Parc</p>
                                        <p className="text-[10px] text-gray-400 group-hover/btn:text-white/80 transition-all">Consulter les instruments</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Performance Summary Widget */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Performance Récente</h3>
                            <BarChart3 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                    <span className="text-gray-400">Tests Terminés (Semaine)</span>
                                    <span className="text-emerald-600">12 / 15</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                    <span className="text-gray-400">Précision des Mesures</span>
                                    <span className="text-blue-600">98.2%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '98.2%' }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
                            <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">
                                <CheckCircle2 className="h-3 w-3 inline mr-1 -mt-0.5" />
                                Vos dernières interventions sur la Ligne 4 ont été validées sans écart. Excellente précision !
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


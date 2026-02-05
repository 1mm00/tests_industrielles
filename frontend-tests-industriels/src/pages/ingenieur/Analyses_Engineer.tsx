import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Cpu,
    Thermometer,
    Zap,
    Settings,
    CheckCircle2,
    Activity,
    Clock,
    ChevronRight,
    Database,
    BarChart3,
    Microscope,
    Save,
    RotateCcw,
    AlertTriangle,
    ShieldAlert,
    TrendingUp,
    Binary,
    Layers
} from 'lucide-react';
import { equipementExpertiseService } from '@/services/equipementExpertiseService';
import { cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function Analyses_Engineer() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { openEquipementEditModal } = useModalStore();

    // Récupération des données d'expertise
    const { data: expertiseData, isLoading } = useQuery({
        queryKey: ['equipement-expertise'],
        queryFn: () => equipementExpertiseService.getExpertiseData(),
        refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
    });

    // Mutation pour la synchronisation temps réel
    const syncMutation = useMutation({
        mutationFn: () => equipementExpertiseService.syncRealTime(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['equipement-expertise'] });
            toast.success(data.message || 'Synchronisation effectuée');
        },
        onError: () => {
            toast.error('Erreur lors de la synchronisation');
        }
    });

    // Export de la base asset
    const handleExport = async () => {
        try {
            toast.loading('Préparation de l\'export...', { id: 'export-asset' });
            await equipementExpertiseService.exportAssetDatabase();
            toast.success('Export réussi', { id: 'export-asset' });
        } catch (error) {
            toast.error('Erreur d\'export', { id: 'export-asset' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement de l'expertise technique...</p>
            </div>
        );
    }

    const kpis = expertiseData?.kpis;
    const stats = expertiseData?.statistiques;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Microscope className="h-7 w-7 text-indigo-600" />
                        Expertise Équipements
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Analyse prédictive et performance métrologique du parc industriel</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2.5 px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                    >
                        <Database className="h-4 w-4 text-indigo-600" />
                        <span className="hidden sm:inline">Export Asset DB</span>
                    </button>
                    <button
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <Save className={cn("h-4 w-4 group-hover:rotate-12 transition-transform", syncMutation.isPending && "animate-spin")} />
                        {syncMutation.isPending ? 'Sync...' : 'Sync Real-time'}
                    </button>
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actifs Totaux</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{kpis?.total_equipements || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Binary className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Service</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{kpis?.en_service || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-sm">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertes Critiques</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats?.alertes_critiques || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponibilité</p>
                            <h3 className="text-2xl font-black text-blue-600 mt-0.5">98.2%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Main Data Table View */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="p-7 pb-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Suivi Technique du Parc</h2>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status opérationnel et alertes métrologiques</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Sync Active</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Équipement</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Performance</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Paramètres Critiques</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Maint. Prédictive</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {expertiseData?.suivi_technique.map((eq) => (
                                <tr key={eq.id_equipement} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                    <td className="px-7 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm",
                                                eq.statut === 'EN_SERVICE' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                <Settings className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{eq.designation}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{eq.code_equipement}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-7 py-6">
                                        <div className="space-y-1.5 w-32">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                                                <span className="text-emerald-600">Efficacité</span>
                                                <span className="text-slate-900">{eq.efficacite}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" style={{ width: `${eq.efficacite}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-7 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {eq.parametres_critiques.map((param, i) => (
                                                <span key={i} className={cn(
                                                    "px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-tight",
                                                    param.statut === 'VALIDATED' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {param.parametre}: <span className="text-slate-900">{param.valeur}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-7 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm",
                                                eq.maintenance_predictive.urgence === 'HIGH' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            )}>
                                                {eq.maintenance_predictive.urgence === 'HIGH' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800">{eq.maintenance_predictive.jours_restants} Jours restants</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{eq.maintenance_predictive.prochaine_date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-7 py-6 text-right">
                                        <button
                                            onClick={() => openEquipementEditModal(eq.id_equipement)}
                                            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90 group/btn"
                                            title="Expertise & Maintenance"
                                        >
                                            <Activity className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Bottom Grid (Instruments & Live Data) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Instruments Panel */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex-1">
                        <div className="p-7 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Parc Métrologique</h2>
                            <TrendingUp className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expertiseData?.instruments_metrologiques.map((inst) => (
                                <div key={inst.id_instrument} className="p-5 bg-slate-50/30 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group flex items-start gap-4 shadow-sm hover:shadow-lg hover:shadow-indigo-100/50">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-black text-slate-800 truncate">{inst.designation}</p>
                                            <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md border border-slate-700 uppercase tracking-tighter">{inst.numero_serie}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{inst.etalonnage.prochain}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live IoT Panel */}
                <div className="lg:col-span-4 flex flex-col h-full">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />

                        <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-indigo-400 relative z-10">
                            <Zap className="h-5 w-5 animate-pulse" />
                            Live Flow Analyzer
                        </h2>

                        <div className="space-y-6 relative z-10">
                            {expertiseData?.live_sensor_data.map((sensor) => (
                                <div key={sensor.sensor_id} className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            sensor.type === 'TEMPERATURE' ? "bg-blue-400" : "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                                        )} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{sensor.type}</span>
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{sensor.valeur} <span className="text-[10px] text-slate-500 ml-1">{sensor.unite}</span></span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all relative z-10">
                            <div className="flex items-center gap-4 mb-3">
                                <Thermometer className="h-5 w-5 text-rose-500" />
                                <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Diagnostic Métrologique</p>
                            </div>
                            <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic">"Anomalie détectée sur le ventilateur d'extraction #V-02. Surchauffe de +15%. Nécessite calibration node."</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

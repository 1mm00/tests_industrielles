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
    AlertTriangle
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
            <div className="h-full w-full flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Chargement de l'expertise technique...</p>
            </div>
        );
    }

    const kpis = expertiseData?.kpis;
    const stats = expertiseData?.statistiques;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Microscope className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Expertise Équipements</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Analyse prédictive et performance métrologique du parc industriel</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-white border border-gray-100 rounded-[1.5rem] flex items-center gap-2 text-xs font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                        <Database className="h-4 w-4" />
                        Export Asset DB
                    </button>
                    <button
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                        className="px-6 py-3 bg-gray-900 text-white rounded-[1.5rem] flex items-center gap-2 text-xs font-black hover:bg-black transition-all shadow-xl uppercase tracking-widest disabled:opacity-50"
                    >
                        <Save className={cn("h-4 w-4", syncMutation.isPending && "animate-spin")} />
                        {syncMutation.isPending ? 'Sync...' : 'Sync Real-time'}
                    </button>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-50 rounded-full opacity-50" />
                    <BarChart3 className="h-10 w-10 text-blue-600 mb-4 opacity-50" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Équipements</h3>
                    <p className="text-3xl font-black text-gray-900">{kpis?.total_equipements || 0} <span className="text-xs text-blue-500 font-black">Actifs</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Parc industriel surveillé</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 bg-emerald-50 rounded-full opacity-50" />
                    <Cpu className="h-10 w-10 text-emerald-600 mb-4 opacity-50" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">En Service</h3>
                    <p className="text-3xl font-black text-gray-900">{kpis?.en_service || 0} <span className="text-xs text-emerald-500 font-black">OK</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Disponibilité opérationnelle</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 bg-red-50 rounded-full opacity-50" />
                    <RotateCcw className="h-10 w-10 text-red-600 mb-4 opacity-50" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Alertes Critiques</h3>
                    <p className="text-3xl font-black text-gray-900">{stats?.alertes_critiques || 0} <span className="text-xs text-red-500 font-black">Alerte</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Nécessite une intervention</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Equipment Monitoring List */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase">Suivi Technique du Parc</h2>
                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Status opérationnel et alertes métrologiques</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase text-gray-600">Sync Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Équipement / ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paramètres Critiques</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Maint. Prédictive</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Analyse</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {expertiseData?.suivi_technique.map((eq) => (
                                            <tr key={eq.id_equipement} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black group-hover:bg-primary-600 group-hover:text-white transition-all",
                                                            eq.statut === 'EN_SERVICE' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                        )}>
                                                            <Settings className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900">{eq.designation}</p>
                                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{eq.code_equipement}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1 w-32">
                                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                                            <span className="text-emerald-500">Efficacité</span>
                                                            <span>{eq.efficacite}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${eq.efficacite}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {eq.parametres_critiques.map((param, i) => (
                                                            <span key={i} className={cn(
                                                                "px-2 py-1 text-[8px] font-black rounded border uppercase",
                                                                param.statut === 'VALIDATED' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-red-50 text-red-600 border-red-100"
                                                            )}>
                                                                {param.parametre}: {param.valeur}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center",
                                                            eq.maintenance_predictive.urgence === 'HIGH' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                                        )}>
                                                            {eq.maintenance_predictive.urgence === 'HIGH' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900">{eq.maintenance_predictive.jours_restants} Jours restants</p>
                                                            <p className="text-[8px] text-gray-400 font-bold uppercase">Prochaine : {eq.maintenance_predictive.prochaine_date}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => openEquipementEditModal(eq.id_equipement)}
                                                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                                        title="Expertise & Maintenance"
                                                    >
                                                        <Activity className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instruments Alerts */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex-1">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 uppercase">Parc d'Instruments Métrologiques</h2>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expertiseData?.instruments_metrologiques.map((inst) => (
                                <div key={inst.id_instrument} className="p-5 bg-gray-50 rounded-[2rem] border border-transparent hover:border-primary-100 hover:bg-white transition-all group flex items-start gap-4">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-black text-gray-900 truncate">{inst.designation}</p>
                                            <span className="text-[8px] font-black bg-gray-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">{inst.numero_serie}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{inst.etalonnage.prochain}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-600" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sensor Feed / IoT Integration */}
                <div className="lg:col-span-4 flex flex-col h-full">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex-1">
                        <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-3 text-primary-400">
                            <Zap className="h-5 w-5 animate-pulse" />
                            Live Sensor Data
                        </h2>
                        <div className="space-y-6">
                            {expertiseData?.live_sensor_data.map((sensor) => (
                                <div key={sensor.sensor_id} className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            sensor.type === 'TEMPERATURE' ? "bg-blue-500" : "bg-orange-500"
                                        )} />
                                        <span className="text-[10px] font-black uppercase text-gray-400">{sensor.type}</span>
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{sensor.valeur} {sensor.unite}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4 mb-3">
                                <Thermometer className="h-5 w-5 text-red-500" />
                                <p className="text-[10px] font-black uppercase text-red-400 tracking-tighter">Diagnostic Métrologique</p>
                            </div>
                            <p className="text-xs font-medium text-gray-300">Anomalie détectée sur le ventilateur d'extraction #V-02. Surchauffe de +15%.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

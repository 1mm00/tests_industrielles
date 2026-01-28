import { useQuery } from '@tanstack/react-query';
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
    RotateCcw
} from 'lucide-react';
import { equipementsService } from '@/services/equipementsService';
import { instrumentsService } from '@/services/instrumentsService';
import { cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { hasPermission } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

export default function Analyses_Engineer() {
    const { user } = useAuthStore();
    const { openEquipementEditModal } = useModalStore();
    const { data: eqStats } = useQuery({
        queryKey: ['equipement-stats'],
        queryFn: () => equipementsService.getEquipementStats(),
    });

    const { data: equipements, isLoading: loadingEq } = useQuery({
        queryKey: ['expert-equipements'],
        queryFn: () => equipementsService.getPaginatedEquipements(),
    });

    const { data: instruments } = useQuery({
        queryKey: ['expert-instruments'],
        queryFn: () => instrumentsService.getPaginatedInstruments(),
    });

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
                    <button className="px-6 py-3 bg-white border border-gray-100 rounded-[1.5rem] flex items-center gap-2 text-xs font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm uppercase tracking-widest">
                        <Database className="h-4 w-4" />
                        Export Asset DB
                    </button>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-[1.5rem] flex items-center gap-2 text-xs font-black hover:bg-black transition-all shadow-xl uppercase tracking-widest">
                        <Save className="h-4 w-4" />
                        Sync Real-time
                    </button>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-50 rounded-full opacity-50" />
                    <BarChart3 className="h-10 w-10 text-blue-600 mb-4 opacity-50" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Équipements</h3>
                    <p className="text-3xl font-black text-gray-900">{eqStats?.total || 0} <span className="text-xs text-blue-500 font-black">Actifs</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Parc industriel surveillé</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 bg-emerald-50 rounded-full opacity-50" />
                    <Cpu className="h-10 w-10 text-emerald-600 mb-4 opacity-50" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">En Service</h3>
                    <p className="text-3xl font-black text-gray-900">{eqStats?.en_service || 0} <span className="text-xs text-emerald-500 font-black">OK</span></p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Disponibilité opérationnelle</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 bg-red-50 rounded-full opacity-50" />
                    <RotateCcw className="h-10 w-10 text-red-600 mb-4 opacity-50" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Critiques / HS</h3>
                    <p className="text-3xl font-black text-gray-900">{eqStats ? (eqStats.critiques + eqStats.hors_service) : 0} <span className="text-xs text-red-500 font-black">Alerte</span></p>
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
                                        {loadingEq ? (
                                            <tr>
                                                <td colSpan={5} className="p-20 text-center">
                                                    <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                                </td>
                                            </tr>
                                        ) : (
                                            equipements?.data?.slice(0, 5).map((eq: any) => (
                                                <tr key={eq.id_equipement} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-black group-hover:bg-primary-600 group-hover:text-white transition-all">
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
                                                                <span>92%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[8px] font-black rounded border border-blue-100 uppercase">Temp: 42°C</span>
                                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded border border-indigo-100 uppercase">Vibe: 0.8g</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-900">32 Jours restants</p>
                                                                <p className="text-[8px] text-gray-400 font-bold uppercase">Prochaine révision</p>
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
                                            ))
                                        )}
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
                            {instruments?.data?.slice(0, 4).map((inst: any) => (
                                <div key={inst.id_instrument} className="p-5 bg-gray-50 rounded-[2rem] border border-transparent hover:border-primary-100 hover:bg-white transition-all group flex items-start gap-4">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-black text-gray-900 truncate">{inst.designation}</p>
                                            <span className="text-[8px] font-black bg-gray-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">{inst.code_instrument}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{inst.frequence_calibration}</span>
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
                            {[
                                { name: "Température", value: "24.5 °C", color: "blue" },
                                { name: "Humidité", value: "45 %", color: "indigo" },
                                { name: "Consommation", value: "128 kW", color: "orange" },
                                { name: "Vibrations", value: "1.2 mm/s", color: "emerald" },
                            ].map((sensor) => (
                                <div key={sensor.name} className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            `bg-${sensor.color}-500`
                                        )} />
                                        <span className="text-[10px] font-black uppercase text-gray-400">{sensor.name}</span>
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{sensor.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4 mb-3">
                                <Thermometer className="h-5 w-5 text-red-500" />
                                <p className="text-[10px] font-black uppercase text-red-400 tracking-tighter">Alerte Thermique</p>
                            </div>
                            <p className="text-xs font-medium text-gray-300">Anomalie détectée sur le ventilateur d'extraction #V-02. Surchauffe de +15%.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

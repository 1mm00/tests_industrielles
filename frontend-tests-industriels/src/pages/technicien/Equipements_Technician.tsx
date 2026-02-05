import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Microscope,
    Settings,
    MapPin,
    ArrowRight,
    Search as SearchIcon,
    Layers,
    Cpu,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { equipementsService } from '@/services/equipementsService';
import { cn } from '@/utils/helpers';
import { Equipement } from '@/types';
import { useModalStore } from '@/store/modalStore';

export default function Equipements_Technician() {
    const [searchTerm, setSearchTerm] = useState('');
    const { openEquipementDetailsModal } = useModalStore();

    const { data: equipements, isLoading } = useQuery({
        queryKey: ['equipements-technician'],
        queryFn: () => equipementsService.getPaginatedEquipements()
    });

    const filteredEquipements = useMemo(() => {
        return equipements?.data.filter((e: Equipement) =>
            e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
    }, [equipements, searchTerm]);

    const stats = useMemo(() => {
        const items = equipements?.data || [];
        return {
            total: items.length,
            enService: items.filter((e: any) => e.statut_operationnel.toLowerCase().includes('service')).length,
            maintenance: items.filter((e: any) => e.statut_operationnel.toLowerCase().includes('maintenance')).length
        };
    }, [equipements]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Cpu className="h-7 w-7 text-indigo-600" />
                        Infrastructure Technique
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Consultation de l'inventaire et des fiches machines</p>
                </div>
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher équipement, SN..."
                        className="w-full sm:w-64 pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[12.5px] font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actifs Total</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opérationnels</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.enService}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats.maintenance}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Config/Fiches</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Equipments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
                    ))
                ) : filteredEquipements.length === 0 ? (
                    <div className="col-span-full bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <Cpu className="h-16 w-16 text-slate-300" />
                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun actif ne correspond</p>
                        </div>
                    </div>
                ) : (
                    filteredEquipements.map((eq: Equipement) => (
                        <div
                            key={eq.id_equipement}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-200/20 transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <Microscope size={24} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        eq.statut_operationnel?.toLowerCase().includes('service') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            eq.statut_operationnel?.toLowerCase().includes('service') ? "bg-emerald-500" : "bg-rose-500"
                                        )} />
                                        {eq.statut_operationnel}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                                    {eq.designation}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">S/N: {eq.numero_serie}</p>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin size={16} className="text-slate-300" />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700">{eq.localisation_site || 'Atelier'}</span>
                                            <span className="text-[9px] text-slate-400 font-medium italic">{eq.localisation_precise}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Settings size={16} className="text-slate-300" />
                                        <span className="text-[11px] font-bold text-slate-700">{eq.fabricant} • {eq.modele}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dossier technique</span>
                                <button
                                    onClick={() => openEquipementDetailsModal(eq.id_equipement)}
                                    className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all"
                                >
                                    Fiche d'actif
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

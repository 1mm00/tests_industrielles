import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Filter,
    Plus,
    ShieldAlert,
    Clock,
    Activity,
    FileSearch,
    Search as SearchIcon,
    AlertCircle,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { ncService, NcFilters } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

export default function NonConformites_Technician() {
    const [filters, setFilters] = useState<NcFilters>({
        page: 1,
        per_page: 8,
        search: ''
    });

    const { data: ncs, isLoading } = useQuery({
        queryKey: ['ncs-technician', filters],
        queryFn: () => ncService.getPaginatedNc(filters)
    });

    const { data: statsData } = useQuery({
        queryKey: ['nc-stats-technician'],
        queryFn: () => ncService.getNcStats(),
    });

    const stats = useMemo(() => {
        return {
            ouvertes: statsData?.summary?.ouvertes || 0,
            enCours: statsData?.summary?.en_cours || 0,
            cloturees: statsData?.summary?.cloturees || 0,
            total: (statsData?.summary?.ouvertes || 0) + (statsData?.summary?.en_cours || 0) + (statsData?.summary?.cloturees || 0)
        };
    }, [statsData]);

    const { openNcModal, openNcEditModal } = useModalStore();

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area with Premium Red Accents */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <ShieldAlert className="h-7 w-7 text-rose-600" />
                        Gestion des Écarts
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Déclaration et pilotage de la conformité industrielle</p>
                </div>
                <button
                    onClick={() => openNcModal()}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-rose-100 active:scale-95 group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Déclarer une NC
                </button>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actives</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats.ouvertes}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sous Analyse</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats.enCours}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clôturées</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.cloturees}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Filters & Search Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher par équipement, description ou numéro NC..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                    />
                </div>
                <button className="px-4 py-2.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl hover:bg-white transition-all">
                    <Filter size={18} />
                </button>
            </div>

            {/* 4. NC Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
                    ))
                ) : ncs?.data.length === 0 ? (
                    <div className="col-span-2 bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <ShieldCheck className="h-16 w-16 text-emerald-300" />
                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Tout est en ordre : aucune anomalie détectée</p>
                        </div>
                    </div>
                ) : (
                    ncs?.data.map((nc: any) => (
                        <div
                            key={nc.id_non_conformite}
                            className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-rose-200/20 transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                nc.criticite?.code_niveau === 'NC3' || nc.criticite?.code_niveau === 'NC4' ? "bg-rose-500 text-white border-rose-600" : "bg-amber-500 text-white border-amber-600"
                                            )}>
                                                {nc.criticite?.code_niveau || 'Sévérité Néc.'}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{nc.numero_nc || 'NC-PENDING'}</span>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight border",
                                            nc.statut === 'OUVERTE' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        )}>
                                            <Activity size={12} className={nc.statut === 'OUVERTE' ? 'animate-pulse' : ''} />
                                            {nc.statut}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors capitalize">
                                        {nc.equipement?.designation || 'Équipement non spécifié'}
                                    </h3>
                                    <p className="text-[12px] text-slate-500 font-medium italic leading-relaxed line-clamp-3">
                                        "{nc.description || 'Synthèse des écarts non disponible...'}"
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Clock size={14} className="text-slate-300" />
                                        Détectée le {formatDate(nc.date_detection || nc.created_at)}
                                    </div>
                                    <button
                                        onClick={() => openNcEditModal(nc.id_non_conformite)}
                                        className="h-10 px-5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2 group/btn"
                                    >
                                        <FileSearch size={14} className="group-hover/btn:scale-110 transition-transform" />
                                        Analyser
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

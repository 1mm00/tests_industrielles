import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Search,
    Filter,
    Plus,
    ShieldAlert,
    Clock,
    CheckCircle2,
    Activity,
    FileSearch
} from 'lucide-react';
import { ncService, NcFilters } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

export default function NonConformites_Technician() {
    const [filters, setFilters] = useState<NcFilters>({
        page: 1,
        per_page: 8
    });

    const { data: ncs, isLoading } = useQuery({
        queryKey: ['ncs-technician', filters],
        queryFn: () => ncService.getPaginatedNc(filters)
    });

    const { openNcModal, openNcEditModal } = useModalStore();

    return (
        <div className="space-y-6">
            {/* Header & Quick Action */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-center md:text-left">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                        <ShieldAlert size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">Gestion des Écarts</h1>
                        <p className="text-red-100 mt-2 font-medium max-w-md">
                            Déclarez toute anomalie détectée lors de vos tests pour assurer la conformité industrielle.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => openNcModal()}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-red-50 hover:scale-105 transition-all group"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" />
                    Déclarer une NC
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-tight">Actives</p>
                        <h4 className="text-2xl font-black text-gray-900">{ncs?.meta?.total || 0}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-tight">Sous Analyse</p>
                        <h4 className="text-2xl font-black text-gray-900">12</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-tight">Clôturées</p>
                        <h4 className="text-2xl font-black text-gray-900">45</h4>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-3xl border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par équipement ou description..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-medium"
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                    />
                </div>
                <button className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors">
                    <Filter size={20} />
                </button>
            </div>

            {/* NC List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : ncs?.data.map((nc: any) => (
                    <div
                        key={nc.id_non_conformite}
                        className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                                    nc.criticite?.code_niveau === 'NC3' || nc.criticite?.code_niveau === 'NC4' ? "bg-red-600 text-white" : "bg-yellow-500 text-white"
                                )}>
                                    {nc.criticite?.code_niveau || 'Sévérité Néc.'}
                                </div>
                                <span className="text-xs font-bold text-gray-400">{nc.numero_nc || 'NC-NEW'}</span>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                nc.statut === 'OUVERTE' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                            )}>
                                <Activity size={14} />
                                {nc.statut}
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors">
                            {nc.equipement?.designation || 'Équipement non spécifié'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed italic">
                            "{nc.description || 'Pas de description fournie'}"
                        </p>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <Clock size={14} />
                                Déclarée le {formatDate(nc.date_detection || nc.created_at)}
                            </div>
                            <button
                                onClick={() => openNcEditModal(nc.id_non_conformite)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
                            >
                                <FileSearch size={14} />
                                Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!isLoading && ncs?.data.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Tout est en ordre</h3>
                    <p className="text-gray-500 mt-2">Aucune non-conformité active signalée.</p>
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Microscope,
    Search,
    Settings,
    MapPin,
    ArrowRight,
    CheckCircle2,
    AlertCircle
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

    const filteredEquipements = equipements?.data.filter((e: Equipement) =>
        e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Parc des Équipements</h1>
                    <p className="text-gray-500 font-medium">Consultez l'état et les caractéristiques des machines</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher équipement..."
                            className="pl-12 pr-6 py-3 bg-gray-50 border-transparent rounded-2xl w-64 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : filteredEquipements?.map((eq: Equipement) => (
                    <div
                        key={eq.id_equipement}
                        className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-primary-500"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                    <Microscope size={24} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    eq.statut_operationnel === 'En service' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {eq.statut_operationnel === 'En service' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    {eq.statut_operationnel}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 mb-1">{eq.designation}</h3>
                            <p className="text-sm font-bold text-gray-400 mb-4">SN: {eq.numero_serie}</p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{eq.localisation_site || 'Standard'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                    <Settings size={16} className="text-gray-400" />
                                    <span>{eq.fabricant} - {eq.modele}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Fiche technique dispo.</span>
                            <button
                                onClick={() => openEquipementDetailsModal(eq.id_equipement)}
                                className="flex items-center gap-2 text-primary-600 font-black text-xs hover:gap-3 transition-all"
                            >
                                Consulter
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

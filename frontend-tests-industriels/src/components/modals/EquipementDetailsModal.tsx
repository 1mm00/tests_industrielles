import { useQuery } from '@tanstack/react-query';
import { X, Cpu, MapPin, Calendar, Factory, Activity, Info } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { equipementsService } from '@/services/equipementsService';
import { cn } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';
import { isLecteur } from '@/utils/permissions';
import { Eye } from 'lucide-react';

export default function EquipementDetailsModal() {
    const { user } = useAuthStore();
    const { isEquipementDetailsModalOpen, closeEquipementDetailsModal, selectedEquipementId } = useModalStore();

    const { data: equipement, isLoading } = useQuery<any>({
        queryKey: ['equipement', selectedEquipementId],
        queryFn: () => equipementsService.getEquipement(selectedEquipementId!),
        enabled: !!selectedEquipementId && isEquipementDetailsModalOpen,
    });

    if (!isEquipementDetailsModalOpen) return null;

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCriticalityColor = (level: number) => {
        if (level >= 4) return 'bg-red-500';
        if (level === 3) return 'bg-orange-500';
        return 'bg-blue-500';
    };

    const getStatusColor = (status: string) => {
        if (status === 'EN_SERVICE') return 'bg-green-500';
        if (status === 'MAINTENANCE') return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-200">
            <div className="bg-white/95 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Cpu className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Fiche Technique</h2>
                            <p className="text-xs text-gray-500 font-medium italic">Détails complets de l'équipement</p>
                        </div>
                    </div>
                    <button
                        onClick={closeEquipementDetailsModal}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        </div>
                    ) : equipement ? (
                        <>
                            {/* Code & Designation */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-xl font-black text-sm border border-primary-100 mb-2">
                                        {equipement.code_equipement}
                                    </span>
                                    <h3 className="text-2xl font-black text-gray-900">{equipement.designation}</h3>
                                    {equipement.description && (
                                        <p className="text-sm text-gray-500 mt-2 italic">{equipement.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <span className={cn(
                                        "px-3 py-1.5 text-white rounded-full text-xs font-black uppercase tracking-widest",
                                        getStatusColor(equipement.statut_operationnel)
                                    )}>
                                        {equipement.statut_operationnel.replace('_', ' ')}
                                    </span>
                                    <span className={cn(
                                        "px-3 py-1.5 text-white rounded-full text-xs font-black uppercase tracking-widest",
                                        getCriticalityColor(equipement.niveau_criticite ?? 3)
                                    )}>
                                        N{equipement.niveau_criticite ?? 3}
                                    </span>
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        Classification
                                    </h4>
                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-gray-500">Catégorie :</span>
                                            <span className="text-xs font-black text-gray-900">{equipement.categorie_equipement}</span>
                                        </div>
                                        {equipement.sous_categorie && (
                                            <div className="flex justify-between">
                                                <span className="text-xs font-bold text-gray-500">Sous-catégorie :</span>
                                                <span className="text-xs font-black text-gray-900">{equipement.sous_categorie}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Localisation
                                    </h4>
                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-gray-500">Site :</span>
                                            <span className="text-xs font-black text-gray-900">{equipement.localisation_site}</span>
                                        </div>
                                        {equipement.localisation_precise && (
                                            <div className="flex justify-between">
                                                <span className="text-xs font-bold text-gray-500">Zone :</span>
                                                <span className="text-xs font-black text-gray-900">{equipement.localisation_precise}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Factory className="h-4 w-4" />
                                    Informations Constructeur
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {equipement.fabricant && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200">
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Fabricant</p>
                                            <p className="text-sm font-black text-blue-900">{equipement.fabricant}</p>
                                        </div>
                                    )}
                                    {equipement.modele && (
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200">
                                            <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">Modèle</p>
                                            <p className="text-sm font-black text-purple-900">{equipement.modele}</p>
                                        </div>
                                    )}
                                    {equipement.numero_serie && (
                                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4 border border-green-200">
                                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">N° Série</p>
                                            <p className="text-sm font-black text-green-900">{equipement.numero_serie}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Performance Specs */}
                            {equipement.puissance_nominale_kw && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Caractéristiques Techniques
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-gray-500 mb-1">Puissance Nominale</p>
                                            <p className="text-lg font-black text-gray-900">{equipement.puissance_nominale_kw} kW</p>
                                        </div>
                                        {equipement.caracteristiques_techniques && (
                                            <div className="bg-gray-50 rounded-2xl p-4">
                                                <p className="text-xs font-bold text-gray-500 mb-1">Autres caractéristiques</p>
                                                <div className="text-xs text-gray-900 border-t border-gray-100 mt-2 pt-2 space-y-1">
                                                    {(() => {
                                                        const specs = typeof equipement.caracteristiques_techniques === 'string'
                                                            ? JSON.parse(equipement.caracteristiques_techniques)
                                                            : equipement.caracteristiques_techniques;

                                                        return Object.entries(specs).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between border-b border-gray-50 pb-1 last:border-0">
                                                                <span className="font-bold text-gray-600">{key}:</span>
                                                                <span className="font-black text-primary-700">{String(value)}</span>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Traçabilité
                                    </h4>
                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
                                        {equipement.annee_fabrication && (
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-500">Année fabrication :</span>
                                                <span className="font-black text-gray-900">{equipement.annee_fabrication}</span>
                                            </div>
                                        )}
                                        {equipement.date_mise_service && (
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-500">Mise en service :</span>
                                                <span className="font-black text-gray-900">{formatDate(equipement.date_mise_service)}</span>
                                            </div>
                                        )}
                                        {equipement.updated_at && (
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-500">Dernière MAJ :</span>
                                                <span className="font-black text-gray-900">{formatDate(equipement.updated_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 font-bold">Équipement introuvable</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    {isLecteur(user) ? (
                        <div className="flex items-center gap-3 px-6 py-3 bg-primary-50 border border-primary-100 rounded-2xl text-primary-600 font-black uppercase tracking-widest text-[10px]">
                            <Eye className="h-5 w-5" />
                            Mode Consultation Uniquement
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                            <Info className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Actif Industriel Certifié</span>
                        </div>
                    )}
                    <button
                        onClick={closeEquipementDetailsModal}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Fermer la fiche
                    </button>
                </div>
            </div>
        </div>
    );
}

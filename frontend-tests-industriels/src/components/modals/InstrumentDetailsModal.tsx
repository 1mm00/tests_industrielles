import { useQuery } from '@tanstack/react-query';
import { X, Gauge, Calendar, Activity, Info, MapPin, Factory, AlertCircle } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { instrumentsService } from '@/services/instrumentsService';
import { cn } from '@/utils/helpers';

export default function InstrumentDetailsModal() {
    const { isInstrumentDetailsModalOpen, closeInstrumentDetailsModal, selectedInstrumentId } = useModalStore();

    const { data: instrument, isLoading } = useQuery<any>({
        queryKey: ['instrument', selectedInstrumentId],
        queryFn: () => instrumentsService.getInstrument(selectedInstrumentId!),
        enabled: !!selectedInstrumentId && isInstrumentDetailsModalOpen,
    });

    if (!isInstrumentDetailsModalOpen) return null;

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        if (status === 'OPERATIONNEL') return 'bg-emerald-500';
        if (status === 'CALIBRATION') return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const isCalibrationExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Gauge className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Fiche Métrologique</h2>
                            <p className="text-xs text-gray-500 font-medium italic">Spécifications et suivi de l'instrument</p>
                        </div>
                    </div>
                    <button
                        onClick={closeInstrumentDetailsModal}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        </div>
                    ) : instrument ? (
                        <>
                            {/* Code & Designation */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-sm border border-emerald-100 mb-2">
                                        {instrument.code_instrument}
                                    </span>
                                    <h3 className="text-2xl font-black text-gray-900">{instrument.designation}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{instrument.type_instrument}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={cn(
                                        "px-3 py-1.5 text-white rounded-full text-xs font-black uppercase tracking-widest",
                                        getStatusColor(instrument.statut)
                                    )}>
                                        {instrument.statut.replace('_', ' ')}
                                    </span>
                                    {isCalibrationExpired(instrument.date_prochaine_calibration) && (
                                        <span className="px-3 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-rose-200">
                                            <AlertCircle className="h-3 w-3" />
                                            CALIBRATION ÉCHUE
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Main Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Activity className="h-4 w-4 text-emerald-600" />
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Métrologie</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500">Unité</p>
                                            <p className="text-lg font-black text-gray-900">{instrument.unite_mesure}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500">Précision</p>
                                            <p className="text-lg font-black text-gray-900">{instrument.precision || '± N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Gauge className="h-4 w-4 text-emerald-600" />
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plage de Mesure</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500">Minimum</p>
                                            <p className="text-lg font-black text-gray-900">{instrument.plage_mesure_min} {instrument.unite_mesure}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500">Maximum</p>
                                            <p className="text-lg font-black text-gray-900">{instrument.plage_mesure_max} {instrument.unite_mesure}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="h-4 w-4 text-emerald-600" />
                                        <h4 className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Calibration</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-emerald-600/70">Prochaine Échéance</p>
                                            <p className={cn(
                                                "text-lg font-black",
                                                isCalibrationExpired(instrument.date_prochaine_calibration) ? "text-rose-600" : "text-emerald-900"
                                            )}>
                                                {formatDate(instrument.date_prochaine_calibration)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-600/70">Périodicité</p>
                                            <p className="text-lg font-black text-emerald-900">{instrument.periodicite_calibration_mois} mois</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Factory className="h-4 w-4" />
                                        Spécifications Constructeur
                                    </h4>
                                    <div className="bg-gray-50/50 rounded-2xl p-6 space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 font-medium">Fabricant</span>
                                            <span className="font-black text-gray-900">{instrument.fabricant || 'Non spécifié'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 font-medium">Modèle</span>
                                            <span className="font-black text-gray-900">{instrument.modele || 'Non spécifié'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">N° Série</span>
                                            <span className="font-black text-gray-900">{instrument.numero_serie || 'Non spécifié'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Emplacement & Historique
                                    </h4>
                                    <div className="bg-gray-50/50 rounded-2xl p-6 space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 font-medium">Localisation</span>
                                            <span className="font-black text-gray-900">{instrument.localisation || 'Non spécifié'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                            <span className="text-gray-500 font-medium">Date Acquisition</span>
                                            <span className="font-black text-gray-900">{formatDate(instrument.date_acquisition)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Dernière Calibration</span>
                                            <span className="font-black text-gray-900">{formatDate(instrument.date_derniere_calibration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 font-black uppercase tracking-widest italic">Instrument introuvable</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end">
                    <button
                        onClick={closeInstrumentDetailsModal}
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Fermer le dossier
                    </button>
                </div>
            </div>
        </div>
    );
}

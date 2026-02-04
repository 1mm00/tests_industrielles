import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Gauge, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { instrumentsService } from '@/services/instrumentsService';
import { toast } from 'react-hot-toast';

export default function InstrumentCreationModal() {
    const { isInstrumentCreateModalOpen, closeInstrumentCreateModal } = useModalStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        code_instrument: '',
        designation: '',
        type_instrument: '',
        categorie_mesure: 'PRESSION',
        fabricant: '',
        modele: '',
        numero_serie: '',
        precision: '',
        plage_mesure_min: '',
        plage_mesure_max: '',
        unite_mesure: '',
        resolution: '',
        date_acquisition: '',
        date_derniere_calibration: '',
        periodicite_calibration_mois: 12,
        statut: 'OPERATIONNEL',
        localisation: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => instrumentsService.createInstrument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instruments'] });
            queryClient.invalidateQueries({ queryKey: ['instrument-stats'] });
            toast.success('Instrument créé avec succès !');
            closeInstrumentCreateModal();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        },
    });

    const resetForm = () => {
        setFormData({
            code_instrument: '',
            designation: '',
            type_instrument: '',
            categorie_mesure: 'PRESSION',
            fabricant: '',
            modele: '',
            numero_serie: '',
            precision: '',
            plage_mesure_min: '',
            plage_mesure_max: '',
            unite_mesure: '',
            resolution: '',
            date_acquisition: '',
            date_derniere_calibration: '',
            periodicite_calibration_mois: 12,
            statut: 'OPERATIONNEL',
            localisation: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'periodicite_calibration_mois' ? parseInt(value) : value
        }));
    };

    if (!isInstrumentCreateModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-200">
            <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Gauge className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Nouvel Instrument</h2>
                            <p className="text-xs text-gray-500 font-medium italic">Ajout d'un instrument de mesure</p>
                        </div>
                    </div>
                    <button
                        onClick={closeInstrumentCreateModal}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Identification Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            Identification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Code Instrument *
                                </label>
                                <input
                                    type="text"
                                    name="code_instrument"
                                    value={formData.code_instrument}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="INST-2024-001"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Désignation *
                                </label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Manomètre Digital"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Type d'Instrument *
                                </label>
                                <input
                                    type="text"
                                    name="type_instrument"
                                    value={formData.type_instrument}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Manomètre"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Catégorie de Mesure *
                                </label>
                                <select
                                    name="categorie_mesure"
                                    value={formData.categorie_mesure}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    required
                                >
                                    <option value="PRESSION">Pression</option>
                                    <option value="THERMIQUE">Thermique</option>
                                    <option value="MECANIQUE">Mécanique</option>
                                    <option value="ELECTRIQUE">Électrique</option>
                                    <option value="DIMENSIONNEL">Dimensionnel</option>
                                    <option value="VIBRATION">Vibration</option>
                                    <option value="CND">CND</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Technical Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Informations Techniques
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Fabricant
                                </label>
                                <input
                                    type="text"
                                    name="fabricant"
                                    value={formData.fabricant}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Modèle
                                </label>
                                <input
                                    type="text"
                                    name="modele"
                                    value={formData.modele}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    N° Série
                                </label>
                                <input
                                    type="text"
                                    name="numero_serie"
                                    value={formData.numero_serie}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Plage Min
                                </label>
                                <input
                                    type="text"
                                    name="plage_mesure_min"
                                    value={formData.plage_mesure_min}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Plage Max
                                </label>
                                <input
                                    type="text"
                                    name="plage_mesure_max"
                                    value={formData.plage_mesure_max}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Unité *
                                </label>
                                <input
                                    type="text"
                                    name="unite_mesure"
                                    value={formData.unite_mesure}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="bar"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Précision
                                </label>
                                <input
                                    type="text"
                                    name="precision"
                                    value={formData.precision}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="±0.1%"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calibration Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Calibration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Date Acquisition
                                </label>
                                <input
                                    type="date"
                                    name="date_acquisition"
                                    value={formData.date_acquisition}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Dernière Calibration
                                </label>
                                <input
                                    type="date"
                                    name="date_derniere_calibration"
                                    value={formData.date_derniere_calibration}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Périodicité (mois) *
                                </label>
                                <input
                                    type="number"
                                    name="periodicite_calibration_mois"
                                    value={formData.periodicite_calibration_mois}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status & Location Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Statut & Localisation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Statut *
                                </label>
                                <select
                                    name="statut"
                                    value={formData.statut}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    required
                                >
                                    <option value="OPERATIONNEL">Opérationnel</option>
                                    <option value="CALIBRATION">En Calibration</option>
                                    <option value="HORS_SERVICE">Hors Service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Localisation
                                </label>
                                <input
                                    type="text"
                                    name="localisation"
                                    value={formData.localisation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Atelier de métrologie"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={closeInstrumentCreateModal}
                        className="px-8 py-3 text-xs font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {createMutation.isPending ? 'Création...' : 'Créer l\'instrument'}
                    </button>
                </div>
            </div>
        </div>
    );
}

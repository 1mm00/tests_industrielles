import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Cpu, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { equipementsService } from '@/services/equipementsService';
import { toast } from 'react-hot-toast';

export default function EquipementCreationModal() {
    const { isEquipementCreateModalOpen, closeEquipementCreateModal } = useModalStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        code_equipement: '',
        designation: '',
        description: '',
        categorie_equipement: '',
        sous_categorie: '',
        fabricant: '',
        modele: '',
        numero_serie: '',
        annee_fabrication: '',
        localisation_site: '',
        localisation_precise: '',
        niveau_criticite: 3,
        statut_operationnel: 'EN_SERVICE',
        capacite_nominale: '',
        unite_capacite: '',
        puissance_installee_kw: '',
        conditions_fonctionnement: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => equipementsService.createEquipement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipements'] });
            queryClient.invalidateQueries({ queryKey: ['equipement-stats'] });
            toast.success('Équipement créé avec succès !');
            closeEquipementCreateModal();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        },
    });

    const resetForm = () => {
        setFormData({
            code_equipement: '',
            designation: '',
            description: '',
            categorie_equipement: '',
            sous_categorie: '',
            fabricant: '',
            modele: '',
            numero_serie: '',
            annee_fabrication: '',
            localisation_site: '',
            localisation_precise: '',
            niveau_criticite: 3,
            statut_operationnel: 'EN_SERVICE',
            capacite_nominale: '',
            unite_capacite: '',
            puissance_installee_kw: '',
            conditions_fonctionnement: '',
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
            [name]: name === 'niveau_criticite' ? parseInt(value) : value
        }));
    };

    if (!isEquipementCreateModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Cpu className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Nouvel Équipement</h2>
                            <p className="text-xs text-gray-500 font-medium italic">Ajout d'un actif industriel au parc</p>
                        </div>
                    </div>
                    <button
                        onClick={closeEquipementCreateModal}
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
                            <Cpu className="h-4 w-4" />
                            Identification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Code Équipement *
                                </label>
                                <input
                                    type="text"
                                    name="code_equipement"
                                    value={formData.code_equipement}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="EQ-2024-001"
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Presse Hydraulique 500T"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                placeholder="Description détaillée de l'équipement..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Catégorie *
                                </label>
                                <input
                                    type="text"
                                    name="categorie_equipement"
                                    value={formData.categorie_equipement}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Production"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Sous-catégorie
                                </label>
                                <input
                                    type="text"
                                    name="sous_categorie"
                                    value={formData.sous_categorie}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Presse"
                                />
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Localisation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Site *
                                </label>
                                <input
                                    type="text"
                                    name="localisation_site"
                                    value={formData.localisation_site}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Atelier A"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Localisation Précise
                                </label>
                                <input
                                    type="text"
                                    name="localisation_precise"
                                    value={formData.localisation_precise}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Zone 3, Ligne 2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status & Criticality Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Statut & Criticité
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Statut Opérationnel *
                                </label>
                                <select
                                    name="statut_operationnel"
                                    value={formData.statut_operationnel}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                >
                                    <option value="EN_SERVICE">En Service</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="HORS_SERVICE">Hors Service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Niveau de Criticité *
                                </label>
                                <select
                                    name="niveau_criticite"
                                    value={formData.niveau_criticite}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                >
                                    <option value="1">Niveau 1 - Faible</option>
                                    <option value="2">Niveau 2 - Modéré</option>
                                    <option value="3">Niveau 3 - Important</option>
                                    <option value="4">Niveau 4 - Critique</option>
                                    <option value="5">Niveau 5 - Vital</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={closeEquipementCreateModal}
                        className="px-8 py-3 text-xs font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {createMutation.isPending ? 'Création...' : 'Créer l\'équipement'}
                    </button>
                </div>
            </div>
        </div>
    );
}

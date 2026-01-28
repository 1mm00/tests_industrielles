import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AlertTriangle,
    X,
    Save,
    Calendar,
    User as UserIcon,
    Terminal,
    Layers,
    Activity,
    FileText,
    ShieldAlert
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';

export default function NcCreationModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isNcModalOpen, closeNcModal } = useModalStore();

    const [form, setForm] = useState<{
        test_id: string;
        equipement_id: string;
        criticite_id: string;
        type_nc: string;
        description: string;
        impact_potentiel: string;
        date_detection: string;
        detecteur_id: string;
        co_detecteurs: string[];
    }>({
        test_id: '',
        equipement_id: '',
        criticite_id: '',
        type_nc: '',
        description: '',
        impact_potentiel: '',
        date_detection: new Date().toISOString().split('T')[0],
        detecteur_id: '',
        co_detecteurs: [],
    });


    // Fetch data for creation
    const { data: creationData } = useQuery({
        queryKey: ['nc-creation-data'],
        queryFn: () => ncService.getCreationData(),
        enabled: isNcModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => ncService.createNc(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['nc-stats'] });
            closeNcModal();
            toast.success('Non-conformité déclarée avec succès !');
            setForm({
                test_id: '',
                equipement_id: '',
                criticite_id: '',
                type_nc: '',
                description: '',
                impact_potentiel: '',
                date_detection: new Date().toISOString().split('T')[0],
                detecteur_id: '',
                co_detecteurs: [],
            });

        },
        onError: (error: any) => {
            console.error('Erreur lors de la déclaration de la NC:', error.response?.data);
            toast.error(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue lors de la déclaration de la NC.'}`);
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Helper pour valider un UUID (plus souple)
        const isLikelyUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

        // Déterminer l'ID du détecteur
        let detectorId = null;
        if (form.detecteur_id && isLikelyUUID(form.detecteur_id)) {
            detectorId = form.detecteur_id;
        } else {
            // Fallback sur l'id_personnel de l'utilisateur ou son ID direct
            detectorId = user?.id_personnel || user?.id || null;
        }

        const sanitizedData = {
            ...form,
            test_id: (form.test_id && isLikelyUUID(form.test_id)) ? form.test_id : null,
            detecteur_id: detectorId
        };

        createMutation.mutate(sanitizedData);
    };

    if (!isNcModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                            Déclarer une Non-Conformité
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Signalement d'un écart qualité ou sécurité</p>
                    </div>
                    <button
                        onClick={closeNcModal}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="nc-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Équipement */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="h-3 w-3" />
                                Équipement concerné *
                            </label>
                            <select
                                name="equipement_id"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.equipement_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un équipement</option>
                                {creationData?.equipements.map((eq: any) => (
                                    <option key={eq.id_equipement} value={eq.id_equipement}>
                                        [{eq.code_equipement}] {eq.designation}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Détection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Date de Détection *
                            </label>
                            <input
                                type="date"
                                name="date_detection"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.date_detection}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Type NC */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="h-3 w-3" />
                                Type de Non-Conformité *
                            </label>
                            <select
                                name="type_nc"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.type_nc}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un type</option>
                                <option value="DIMENSIONNEL">Écart Dimensionnel</option>
                                <option value="FONCTIONNEL">Défaut Fonctionnel</option>
                                <option value="ASPECT">Défaut d'Aspect</option>
                                <option value="SECURITE">Problème de Sécurité</option>
                                <option value="MATIERE">Conformité Matière</option>
                            </select>
                        </div>

                        {/* Criticité */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 text-red-600">
                                <ShieldAlert className="h-3 w-3" />
                                Niveau de Gravité *
                            </label>
                            <select
                                name="criticite_id"
                                required
                                className="w-full px-4 py-2.5 bg-red-50/30 border border-red-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all text-red-900"
                                value={form.criticite_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Définir la gravité</option>
                                {creationData?.criticites.map((c: any) => (
                                    <option key={c.id_niveau_criticite} value={c.id_niveau_criticite}>
                                        {c.code_niveau} - {c.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Test lié (Optionnel) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                Test d'origine (Optionnel)
                            </label>
                            <select
                                name="test_id"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.test_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Aucun test spécifique</option>
                                {creationData?.tests.map((t: any) => (
                                    <option key={t.id_test} value={t.id_test}>
                                        NC détectée lors du Test #{t.numero_test}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Détecteurs (Multi-sélection) */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-50">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                Personnel ayant détecté l'écart
                            </label>

                            {/* Selected Detectors Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase shadow-sm">
                                    <span className="opacity-50">Déclarant :</span>
                                    {user?.nom} {user?.prenom}
                                </div>
                                {(form.co_detecteurs || []).map((memberId: string) => {
                                    const p = creationData?.personnels.find((pers: any) => pers.id_personnel === memberId);
                                    if (!p) return null;
                                    return (
                                        <div key={memberId} className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-full text-[10px] font-black uppercase border border-gray-200 shadow-sm animate-in zoom-in-95 duration-200">
                                            {p.nom} {p.prenom}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        co_detecteurs: prev.co_detecteurs?.filter((id: string) => id !== memberId)
                                                    }));
                                                }}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Personnel Selection */}
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    if (selectedId && !form.co_detecteurs?.includes(selectedId)) {
                                        setForm(prev => ({
                                            ...prev,
                                            co_detecteurs: [...(prev.co_detecteurs || []), selectedId]
                                        }));
                                    }
                                    e.target.value = ""; // Reset focus
                                }}
                            >
                                <option value="">Ajouter d'autres personnes ayant constaté l'anomalie...</option>
                                {creationData?.personnels
                                    .filter((p: any) => p.id_personnel !== (user?.id_personnel || user?.id))
                                    .map((p: any) => (
                                        <option key={p.id_personnel} value={p.id_personnel} disabled={form.co_detecteurs?.includes(p.id_personnel)}>
                                            {p.nom} {p.prenom}
                                        </option>
                                    ))}
                            </select>
                        </div>

                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Description détaillée de l'écart *
                        </label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Décrivez précisément ce qui a été observé..."
                            value={form.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Impact Potentiel */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="h-3 w-3" />
                            Impact potentiel sur la production / sécurité
                        </label>
                        <textarea
                            name="impact_potentiel"
                            rows={2}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Ex: Risque d'arrêt de ligne, danger opérateur, rebus matière..."
                            value={form.impact_potentiel}
                            onChange={handleInputChange}
                        />
                    </div>
                </form>

                {/* Footer Modal */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={closeNcModal}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <button
                        form="nc-form"
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all font-black text-sm shadow-xl shadow-rose-100 disabled:opacity-50 disabled:grayscale"

                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Déclaration...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Déclarer la NC
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

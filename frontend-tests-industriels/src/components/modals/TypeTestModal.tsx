import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, AlertCircle, Info, Layers } from 'lucide-react';
import { typeTestsService } from '@/services/typeTestsService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function TypeTestModal() {
    const queryClient = useQueryClient();
    const { isTypeTestModalOpen, closeTypeTestModal, selectedTypeTestId } = useModalStore();

    const [form, setForm] = useState({
        code_type: '',
        libelle: '',
        categorie_principale: 'Standard',
        sous_categorie: '',
        description: '',
        niveau_criticite_defaut: 1,
        duree_estimee_jours: '',
        frequence_recommandee: '',
        equipements_eligibles: [] as string[],
        actif: true,
    });

    // Fetch type test data if editing
    const { data: typeTestData } = useQuery({
        queryKey: ['type-test', selectedTypeTestId],
        queryFn: () => typeTestsService.getTypeTest(selectedTypeTestId!),
        enabled: !!selectedTypeTestId && isTypeTestModalOpen,
    });

    const { data: creationData } = useQuery({
        queryKey: ['type-test-creation-data'],
        queryFn: () => typeTestsService.getCreationData(),
        enabled: isTypeTestModalOpen,
    });

    useEffect(() => {
        if (typeTestData) {
            setForm({
                code_type: typeTestData.code_type,
                libelle: typeTestData.libelle,
                categorie_principale: typeTestData.categorie_principale,
                sous_categorie: typeTestData.sous_categorie || '',
                description: typeTestData.description || '',
                niveau_criticite_defaut: typeTestData.niveau_criticite_defaut || 1,
                duree_estimee_jours: typeTestData.duree_estimee_jours?.toString() || '',
                frequence_recommandee: typeTestData.frequence_recommandee || '',
                equipements_eligibles: typeTestData.equipements_eligibles || [],
                actif: typeTestData.actif,
            });
        } else {
            setForm({
                code_type: '',
                libelle: '',
                categorie_principale: 'Standard',
                sous_categorie: '',
                description: '',
                niveau_criticite_defaut: 1,
                duree_estimee_jours: '',
                frequence_recommandee: '',
                equipements_eligibles: [],
                actif: true,
            });
        }
    }, [typeTestData, isTypeTestModalOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) =>
            selectedTypeTestId
                ? typeTestsService.updateTypeTest(selectedTypeTestId, data)
                : typeTestsService.createTypeTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['type-tests'] });
            toast.success(selectedTypeTestId ? 'Type de test mis à jour' : 'Type de test créé');
            closeTypeTestModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Une erreur est survenue');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    if (!isTypeTestModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-300">
            <div className="bg-white/95 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-100">
                            <Layers className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {selectedTypeTestId ? 'Modifier le Type' : 'Nouveau Type de Test'}
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">
                                Configuration du référentiel technique
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeTypeTestModal}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {/* Identification */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-primary-600" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identification du Protocole</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase ml-1">Code Type</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: ELEC-01"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                                    value={form.code_type}
                                    onChange={(e) => setForm({ ...form, code_type: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase ml-1">Libellé</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Analyse Vibratoire"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                                    value={form.libelle}
                                    onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Paramétrage */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-primary-600" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paramètres & Criticité</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase ml-1">Catégorie</label>
                                <select
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all appearance-none"
                                    value={form.categorie_principale}
                                    onChange={(e) => setForm({ ...form, categorie_principale: e.target.value as any })}
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Obligatoire">Obligatoire (Légal)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase ml-1">Criticité par défaut</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setForm({ ...form, niveau_criticite_defaut: n })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                                                form.niveau_criticite_defaut === n
                                                    ? "bg-gray-900 text-white shadow-lg"
                                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                            )}
                                        >
                                            N{n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase ml-1">Fréquence Rec. (Mois)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 3 mois"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                                    value={form.frequence_recommandee}
                                    onChange={(e) => setForm({ ...form, frequence_recommandee: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase ml-1">Durée Estimée (Jours)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    placeholder="Ex: 0.5"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                                    value={form.duree_estimee_jours}
                                    onChange={(e) => setForm({ ...form, duree_estimee_jours: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-700 uppercase ml-1">Description Technique</label>
                        <textarea
                            rows={3}
                            placeholder="Détails sur la méthodologie de test..."
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Équipements Éligibles */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-primary-600" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Équipements Éligibles</h3>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Sélectionnez les machines sur lesquelles ce test peut être effectué.</p>

                        {/* Selected Equipment Tags */}
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            {form.equipements_eligibles.length === 0 ? (
                                <span className="text-[10px] text-gray-300 italic">Aucun équipement sélectionné (tous disponibles par défaut)</span>
                            ) : (
                                form.equipements_eligibles.map(eqId => {
                                    const eq = creationData?.equipements?.find((e: any) => e.id_equipement === eqId);
                                    if (!eq) return null;
                                    return (
                                        <div key={eqId} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase shadow-sm">
                                            <span>{eq.code_equipement}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newEligibles = form.equipements_eligibles.filter(id => id !== eqId);
                                                    setForm({ ...form, equipements_eligibles: newEligibles });
                                                }}
                                                className="hover:text-red-200 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Equipment Selection Dropdown */}
                        <select
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-primary-500 outline-none transition-all"
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (selectedId && !form.equipements_eligibles.includes(selectedId)) {
                                    setForm({ ...form, equipements_eligibles: [...form.equipements_eligibles, selectedId] });
                                }
                                e.target.value = ""; // Reset select
                            }}
                        >
                            <option value="">+ Ajouter un équipement compatible...</option>
                            {creationData?.equipements?.map((eq: any) => (
                                <option
                                    key={eq.id_equipement}
                                    value={eq.id_equipement}
                                    disabled={form.equipements_eligibles.includes(eq.id_equipement)}
                                >
                                    [{eq.code_equipement}] {eq.designation}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300",
                            form.actif ? "bg-emerald-500" : "bg-gray-300"
                        )} onClick={() => setForm({ ...form, actif: !form.actif })}>
                            <div className={cn(
                                "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                form.actif ? "translate-x-6" : "translate-x-0"
                            )} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {form.actif ? 'Type Actif' : 'Type Inactif'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={closeTypeTestModal}
                            className="px-6 py-3 text-xs font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50 active:scale-95"
                        >
                            <Save className="h-5 w-5" />
                            {mutation.isPending ? 'SYNCHRONISATION...' : (selectedTypeTestId ? 'METTRE À JOUR' : 'CRÉER LE TYPE')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

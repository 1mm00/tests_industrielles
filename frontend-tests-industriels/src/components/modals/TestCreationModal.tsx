import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FlaskConical,
    X,
    Save,
    Calendar,
    MapPin,
    AlertCircle,
    Clock,
    Terminal,
    Layers,
    User as UserIcon,
    ShieldAlert
} from 'lucide-react';
import { testsService, CreateTestData } from '@/services/testsService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';

export default function TestCreationModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isTestModalOpen, closeTestModal, selectedTestId } = useModalStore();
    const isEdit = typeof selectedTestId === 'string';

    const [form, setForm] = useState<CreateTestData>({
        type_test_id: '',
        equipement_id: '',
        phase_id: '',
        procedure_id: '',
        date_test: new Date().toISOString().split('T')[0],
        heure_debut: '08:00',
        heure_fin: '10:00',
        localisation: '',
        niveau_criticite: 1,
        responsable_test_id: '',
        equipe_test: [],
        observations_generales: '',
        arret_production_requis: false,
    });

    // Fetch data for creation (lists)
    const { data: creationData } = useQuery({
        queryKey: ['test-creation-data'],
        queryFn: () => testsService.getCreationData(),
        enabled: isTestModalOpen,
    });

    // Fetch existing test data for edit
    const { data: existingTest } = useQuery({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: isTestModalOpen && isEdit,
    });

    // Populate form when existing test is loaded
    useEffect(() => {
        if (existingTest && isEdit) {
            // Parsing robuste des heures (Y-m-d H:i:s ou H:i)
            const parseTime = (timeStr: string | null | undefined) => {
                if (!timeStr) return '08:00';
                if (typeof timeStr !== 'string') return '08:00';
                if (timeStr.includes(' ')) return timeStr.split(' ')[1].substring(0, 5);
                return timeStr.substring(0, 5);
            };

            setForm({
                type_test_id: existingTest.type_test_id,
                equipement_id: existingTest.equipement_id,
                phase_id: existingTest.phase_id || '',
                procedure_id: existingTest.procedure_id || '',
                date_test: existingTest.date_test ? existingTest.date_test.split('T')[0] : '',
                heure_debut: parseTime(existingTest.heure_debut),
                heure_fin: parseTime(existingTest.heure_fin),
                localisation: existingTest.localisation,
                niveau_criticite: existingTest.niveau_criticite,
                responsable_test_id: existingTest.responsable_test_id,
                equipe_test: existingTest.equipe_test || [],
                observations_generales: existingTest.observations_generales || '',
                arret_production_requis: existingTest.arret_production_requis,
            });
        }
    }, [existingTest, isEdit]);

    const mutation = useMutation({
        mutationFn: (data: CreateTestData) =>
            isEdit ? testsService.updateTest(selectedTestId!, data) : testsService.createTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            closeTestModal();
            toast.success(isEdit ? 'Test mis à jour !' : 'Test planifié avec succès !');
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue.'}`);
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation basique
        if (!form.equipement_id || !form.type_test_id || !form.localisation) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Helper pour valider un UUID (plus souple)
        const isLikelyUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

        const sanitizedData = {
            ...form,
            phase_id: isLikelyUUID(form.phase_id || '') ? form.phase_id : null,
            procedure_id: isLikelyUUID(form.procedure_id || '') ? form.procedure_id : null,
            responsable_test_id: isLikelyUUID(form.responsable_test_id || '') ? form.responsable_test_id : (user?.id_personnel || user?.id || null),
            heure_debut: form.heure_debut || null,
            heure_fin: form.heure_fin || null,
        };

        mutation.mutate(sanitizedData as any);
    };

    if (!isTestModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase flex items-center gap-2">
                            <FlaskConical className="h-6 w-6 text-primary-600" />
                            {isEdit ? 'Modifier le Test' : 'Nouveau Test Industriel'}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {isEdit ? `Édition du test ${existingTest?.numero_test}` : "Planification d'un nouveau contrôle"}
                        </p>
                    </div>
                    <button
                        onClick={closeTestModal}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Équipement */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="h-3 w-3" />
                                Équipement à tester *
                            </label>
                            <select
                                name="equipement_id"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.equipement_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un équipement</option>
                                {(() => {
                                    const selectedType = creationData?.types_tests?.find((t: any) => t.id_type_test === form.type_test_id);
                                    const eligibleIds = selectedType?.equipements_eligibles || [];
                                    const equipmentsToShow = eligibleIds.length > 0
                                        ? creationData?.equipements?.filter((eq: any) => eligibleIds.includes(eq.id_equipement))
                                        : creationData?.equipements;

                                    return equipmentsToShow?.map((eq: any) => (
                                        <option key={eq.id_equipement} value={eq.id_equipement}>
                                            [{eq.code_equipement}] {eq.designation}
                                        </option>
                                    ));
                                })()}
                            </select>
                            {(() => {
                                const selectedType = creationData?.types_tests?.find((t: any) => t.id_type_test === form.type_test_id);
                                const eligibleIds = selectedType?.equipements_eligibles || [];
                                if (form.type_test_id && eligibleIds.length > 0) {
                                    return (
                                        <p className="text-[9px] text-primary-600 font-bold italic mt-1">
                                            ✓ Filtré : {eligibleIds.length} équipement(s) compatible(s) pour ce test
                                        </p>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Type Test */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="h-3 w-3" />
                                Type de Contrôle *
                            </label>
                            <select
                                name="type_test_id"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.type_test_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un type</option>
                                {creationData?.types_tests.map((type: any) => (
                                    <option key={type.id_type_test} value={type.id_type_test}>
                                        {type.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Test */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Date prévue *
                            </label>
                            <input
                                type="date"
                                name="date_test"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.date_test}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Criticité */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-3 w-3" />
                                Niveau de Criticité *
                            </label>
                            <select
                                name="niveau_criticite"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.niveau_criticite}
                                onChange={handleInputChange}
                            >
                                <option value={1}>Niveau 1 - Mineur</option>
                                <option value={2}>Niveau 2 - Important</option>
                                <option value={3}>Niveau 3 - Critique</option>
                                <option value={4}>Niveau 4 - Vital</option>
                            </select>
                        </div>

                        {/* Heure Début */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Heure Début
                            </label>
                            <input
                                type="time"
                                name="heure_debut"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.heure_debut}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Heure Fin */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Heure Fin (Estimée)
                            </label>
                            <input
                                type="time"
                                name="heure_fin"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.heure_fin}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Localisation */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            Localisation spécifique *
                        </label>
                        <input
                            type="text"
                            name="localisation"
                            required
                            placeholder="Ex: Zone A, Atelier 4, Ligne 2..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            value={form.localisation}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Arrêt production */}
                    <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-900 uppercase">Arrêt de Production requis</p>
                                <p className="text-[10px] text-gray-500 font-medium">Cochez si le test nécessite l'arrêt de la machine</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            name="arret_production_requis"
                            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={form.arret_production_requis}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Observations */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observations / Instructions spéciales</label>
                        <textarea
                            name="observations_generales"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Informations complémentaires pour le responsable du test..."
                            value={form.observations_generales}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Responsables & Équipe */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <UserIcon className="h-3 w-3" />
                            Équipe & Responsables du Test
                        </label>

                        {/* Selected Members Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-900 text-white rounded-full text-[10px] font-black uppercase">
                                <span className="opacity-50">Principale :</span>
                                {user?.nom} {user?.prenom}
                            </div>
                            {(form.equipe_test || []).map(memberId => {
                                const p = creationData?.personnels.find((pers: any) => pers.id_personnel === memberId);
                                if (!p) return null;
                                return (
                                    <div key={memberId} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase border border-gray-200">
                                        {p.nom} {p.prenom}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    equipe_test: prev.equipe_test?.filter(id => id !== memberId)
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

                        {/* Personnels Selection */}
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (selectedId && !form.equipe_test?.includes(selectedId)) {
                                    setForm(prev => ({
                                        ...prev,
                                        equipe_test: [...(prev.equipe_test || []), selectedId]
                                    }));
                                }
                                e.target.value = ""; // Reset select
                            }}
                        >
                            <option value="">Ajouter des co-responsables ou membres d'équipe...</option>
                            {creationData?.personnels
                                .filter((p: any) => p.id_personnel !== (user?.id_personnel || user?.id))
                                .map((p: any) => (
                                    <option key={p.id_personnel} value={p.id_personnel} disabled={form.equipe_test?.includes(p.id_personnel)}>
                                        {p.nom} {p.prenom}
                                    </option>
                                ))}
                        </select>
                    </div>

                </form>

                {/* Footer Modal */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={closeTestModal}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all font-black text-sm shadow-xl shadow-sky-100 disabled:opacity-50 disabled:grayscale"
                    >
                        {mutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isEdit ? 'Mise à jour...' : 'Planification...'}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {isEdit ? 'Enregistrer les modifications' : 'Planifier le Test'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

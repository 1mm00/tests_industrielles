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
    ShieldAlert,
    Zap,
    Shield,
    Wrench,
    Users,
    CheckCircle2,
    ChevronDown
} from 'lucide-react';
import { testsService, CreateTestData } from '@/services/testsService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function TestCreationModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isTestModalOpen, closeTestModal, selectedTestId } = useModalStore();
    const isEdit = typeof selectedTestId === 'string';

    const [errors, setErrors] = useState<Record<string, string>>({});

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const getEndTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const [form, setForm] = useState<CreateTestData>({
        type_test_id: '',
        equipement_id: '',
        phase_id: '',
        procedure_id: '',
        date_test: new Date().toISOString().split('T')[0],
        heure_debut: getCurrentTime(),
        heure_fin: getEndTime(),
        localisation: '',
        niveau_criticite: 1,
        responsable_test_id: '',
        equipe_test: [],
        observations_generales: '',
        arret_production_requis: false,
        instrument_id: '',
        statut_final: null,
        resultat_attendu: '',
    });

    const { data: creationData } = useQuery({
        queryKey: ['test-creation-data'],
        queryFn: () => testsService.getCreationData(),
        enabled: isTestModalOpen,
        staleTime: 5 * 60 * 1000,
    });

    const { data: existingTest } = useQuery({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: isTestModalOpen && isEdit,
    });

    useEffect(() => {
        if (existingTest && isEdit) {
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

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });

        if (name === 'equipement_id' && value) {
            const selectedEquipment = creationData?.equipements?.find((eq: any) => eq.id_equipement === value);
            if (selectedEquipment && selectedEquipment.localisation_site && !form.localisation) {
                setForm(prev => ({ ...prev, [name]: val, localisation: selectedEquipment.localisation_site }));
                return;
            }
        }

        setForm(prev => ({ ...prev, [name]: val }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!form.type_test_id) newErrors.type_test_id = 'Type requis';
        if (!form.equipement_id) newErrors.equipement_id = 'Équipement requis';
        if (!form.localisation) newErrors.localisation = 'Localisation requise';
        if (!form.date_test) newErrors.date_test = 'Date requise';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!validateForm()) {
            toast.error('Veuillez remplir les champs obligatoires');
            return;
        }

        const isLikelyUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

        const sanitizedData = {
            ...form,
            phase_id: isLikelyUUID(form.phase_id || '') ? form.phase_id : null,
            procedure_id: isLikelyUUID(form.procedure_id || '') ? form.procedure_id : null,
            instrument_id: isLikelyUUID(form.instrument_id || '') ? form.instrument_id : null,
            statut_final: form.statut_final || null,
            responsable_test_id: isLikelyUUID(form.responsable_test_id || '') ? form.responsable_test_id : (user?.id_personnel || user?.id || null),
            heure_debut: form.heure_debut || null,
            heure_fin: form.heure_fin || null,
            heure_debut_planifiee: form.heure_debut || null,
            heure_fin_planifiee: form.heure_fin || null,
        };

        mutation.mutate(sanitizedData as any);
    };

    if (!isTestModalOpen) return null;

    if (!creationData || (isEdit && !existingTest)) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-xl">
                <div className="bg-white/98 p-10 rounded-[32px] shadow-2xl border border-slate-100 flex flex-col items-center gap-5">
                    <div className="h-14 w-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Chargement...</p>
                </div>
            </div>
        );
    }

    const criticalityLevels = [
        { value: 1, label: 'Mineur', color: 'emerald', icon: '●' },
        { value: 2, label: 'Important', color: 'amber', icon: '●●' },
        { value: 3, label: 'Critique', color: 'orange', icon: '●●●' },
        { value: 4, label: 'Vital', color: 'rose', icon: '●●●●' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-4xl overflow-visible flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-300">

                {/* Header Section */}
                <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50 relative z-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                            <FlaskConical className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                {isEdit ? 'Modifier le Test' : 'Nouveau Test'}
                            </h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Industrial Engineering UI</p>
                        </div>
                    </div>
                    <button onClick={closeTestModal} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content - overflow-visible on container, overflow-y-auto on inner if needed, but we want dropdowns to pop out */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-hide scroll-smooth">

                    <div className="grid grid-cols-12 gap-5">

                        {/* Type de Contrôle */}
                        <div className="col-span-12 lg:col-span-6 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Layers className="h-3 w-3 opacity-40" />
                                Type de Contrôle <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative group z-[60]">
                                <select
                                    name="type_test_id"
                                    required
                                    className={cn(
                                        "w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-800 outline-none transition-all appearance-none",
                                        errors.type_test_id ? "border-rose-200" : "border-slate-100 group-hover:border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    )}
                                    value={form.type_test_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Sélectionner...</option>
                                    {creationData?.types_tests?.map((type: any) => (
                                        <option key={type.id_type_test} value={type.id_type_test}>{type.libelle}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                            </div>
                        </div>

                        {/* Équipement */}
                        <div className="col-span-12 lg:col-span-6 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Wrench className="h-3 w-3 opacity-40" />
                                Équipement <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative group z-[60]">
                                <select
                                    name="equipement_id"
                                    required
                                    className={cn(
                                        "w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-800 outline-none transition-all appearance-none",
                                        errors.equipement_id ? "border-rose-200" : "border-slate-100 group-hover:border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    )}
                                    value={form.equipement_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Sélectionner un équipement...</option>
                                    {(() => {
                                        const selectedType = creationData?.types_tests?.find((t: any) => t.id_type_test === form.type_test_id);
                                        const eligibleIds = selectedType?.equipements_eligibles || [];
                                        const equipmentsToShow = eligibleIds.length > 0
                                            ? creationData?.equipements?.filter((eq: any) => eligibleIds.includes(eq.id_equipement))
                                            : creationData?.equipements;
                                        return equipmentsToShow?.map((eq: any) => (
                                            <option key={eq.id_equipement} value={eq.id_equipement}>[{eq.code_equipement}] {eq.designation}</option>
                                        ));
                                    })()}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                            </div>
                        </div>

                        {/* Compact Date/Time Line - 3 Columns */}
                        <div className="col-span-12 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Clock className="h-3 w-3 opacity-40" />
                                Slot Industriel (Planifié) <span className="text-rose-400">*</span>
                            </label>
                            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-slate-300 uppercase block ml-1">Date Prévue</span>
                                    <input
                                        type="date"
                                        name="date_test"
                                        required
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={form.date_test}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-slate-300 uppercase block ml-1">Début</span>
                                    <input
                                        type="time"
                                        name="heure_debut"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={form.heure_debut}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-slate-300 uppercase block ml-1">Fin Estimée</span>
                                    <input
                                        type="time"
                                        name="heure_fin"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={form.heure_fin}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Criticité */}
                        <div className="col-span-12 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Shield className="h-3 w-3 opacity-40" />
                                Niveau de Criticité <span className="text-rose-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {criticalityLevels.map((l) => (
                                    <button
                                        key={l.value}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, niveau_criticite: l.value }))}
                                        className={cn(
                                            "py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-1",
                                            form.niveau_criticite === l.value
                                                ? l.color === 'emerald' ? "bg-emerald-50/50 border-emerald-500 text-emerald-700" :
                                                    l.color === 'amber' ? "bg-amber-50/50 border-amber-500 text-amber-700" :
                                                        l.color === 'orange' ? "bg-orange-50/50 border-orange-500 text-orange-700" :
                                                            "bg-rose-50/50 border-rose-500 text-rose-700"
                                                : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <span className="text-sm">{l.icon}</span>
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Localisation & Instrument */}
                        <div className="col-span-12 lg:col-span-8 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <MapPin className="h-3 w-3 opacity-40" />
                                Localisation Spécifique <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="localisation"
                                required
                                placeholder="Site, Atelier, Ligne..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300"
                                value={form.localisation}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Zap className="h-3 w-3 opacity-40" />
                                Instrument
                            </label>
                            <div className="relative group z-[60]">
                                <select
                                    name="instrument_id"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 group-hover:border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none transition-all appearance-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    value={form.instrument_id || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Aucun</option>
                                    {creationData?.instruments?.map((inst: any) => (
                                        <option key={inst.id_instrument} value={inst.id_instrument}>N° {inst.numero_serie}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                            </div>
                        </div>

                        {/* Arrêt Production Switch */}
                        <div className="col-span-12">
                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, arret_production_requis: !prev.arret_production_requis }))}
                                className={cn(
                                    "w-full p-4 rounded-[24px] flex items-center justify-between border-2 transition-all duration-500",
                                    form.arret_production_requis
                                        ? "bg-orange-50/50 border-orange-400 shadow-lg shadow-orange-100/50"
                                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                                        form.arret_production_requis ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-400"
                                    )}>
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Arrêt Production</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Machine Offline</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "h-6 w-11 rounded-full relative transition-colors",
                                    form.arret_production_requis ? "bg-orange-500" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
                                        form.arret_production_requis ? "left-6" : "left-1"
                                    )}></div>
                                </div>
                            </button>
                        </div>

                        {/* Détails Section */}
                        <div className="col-span-12 lg:col-span-6 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Résultat Attendu</label>
                            <textarea
                                name="resultat_attendu"
                                rows={2}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                                value={form.resultat_attendu || ''}
                                onChange={handleInputChange}
                                placeholder="Paramètres de contrôle..."
                            />
                        </div>

                        <div className="col-span-12 lg:col-span-6 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observations</label>
                            <textarea
                                name="observations_generales"
                                rows={2}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                                value={form.observations_generales}
                                onChange={handleInputChange}
                                placeholder="Instructions spéciales..."
                            />
                        </div>

                        {/* Equipe Section */}
                        <div className="col-span-12 space-y-3 pt-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Users className="h-3 w-3 opacity-40" />
                                Équipe Responsable <span className="text-rose-400">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase shadow-md shadow-blue-100">
                                    <div className="h-5 w-5 rounded-full bg-blue-700 flex items-center justify-center text-[7px]">{user?.nom?.[0]}{user?.prenom?.[0]}</div>
                                    <span>{user?.nom} {user?.prenom}</span>
                                </div>
                                {form.equipe_test?.map(id => {
                                    const p = creationData?.personnels.find(per => per.id_personnel === id);
                                    return p && (
                                        <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase border border-slate-200">
                                            <span>{p.nom} {p.prenom}</span>
                                            <button type="button" onClick={() => setForm(pr => ({ ...pr, equipe_test: pr.equipe_test?.filter(mid => mid !== id) }))}>
                                                <X className="h-3 w-3 hover:text-rose-500" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="relative group z-[50]">
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 group-hover:border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none transition-all appearance-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        if (id && !form.equipe_test?.includes(id)) {
                                            setForm(pr => ({ ...pr, equipe_test: [...(pr.equipe_test || []), id] }));
                                        }
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">+ Ajouter un membre</option>
                                    {creationData?.personnels?.filter(p => p.id_personnel !== (user?.id_personnel || user?.id)).map(p => (
                                        <option key={p.id_personnel} value={p.id_personnel} disabled={form.equipe_test?.includes(p.id_personnel)}>{p.nom} {p.prenom}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                            </div>
                        </div>

                    </div>
                </form>

                {/* Footer Section */}
                <div className="px-8 py-5 flex items-center justify-end gap-3 bg-slate-50/50 border-t border-slate-100">
                    <button type="button" onClick={closeTestModal} className="px-5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors">Annuler</button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="relative group px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                        style={{ boxShadow: '0 8px 30px rgba(37, 99, 235, 0.2), 0 0 0 transparent' }}
                    >
                        {mutation.isPending ? 'Chargement...' : isEdit ? 'Enregistrer' : 'Valider la Planification'}
                    </button>
                </div>
            </div>
        </div>
    );
}

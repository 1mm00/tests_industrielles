import { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FlaskConical,
    X,
    MapPin,
    AlertCircle,
    Clock,
    Terminal,
    Layers,
    ShieldAlert,
    Zap,
    Shield,
    Wrench,
    Users,
    ChevronDown,
    Timer,
    ArrowRight,
    FileText,
    Plus,
    Link as LinkIcon,
    Search,
    Lock
} from 'lucide-react';
import { testsService, CreateTestData } from '@/services/testsService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';
import {
    format,
    addMinutes,
    parse,
    differenceInMinutes,
    startOfMinute
} from 'date-fns';

// --- Custom Portal Dropdown (Optimized -8%) ---
function PortalDropdown({
    label,
    icon: Icon,
    options,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    disabled = false
}: {
    label: string,
    icon: any,
    options: { value: string, label: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    required?: boolean,
    error?: string,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const toggle = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
    };

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="space-y-1 relative w-full" ref={containerRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 mt-1">
                <Icon className="h-3 w-3 text-blue-500/80" />
                {label} {required && <span className="text-rose-400 font-bold">*</span>}
            </label>
            <div
                onClick={toggle}
                className={cn(
                    "w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-blue-200 shadow-sm",
                    isOpen && "border-blue-500 ring-4 ring-blue-500/5 bg-white shadow-md",
                    error && "border-rose-300 bg-rose-50/30 ring-4 ring-rose-500/5",
                    disabled && "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
                )}
            >
                <span className={cn("truncate max-w-[90%]", !selectedOption && "text-slate-400 font-medium")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </div>
            {error && <p className="text-[9px] font-bold text-rose-500 ml-1.5 animate-in fade-in slide-in-from-top-1">{error}</p>}

            {isOpen && ReactDOM.createPortal(
                <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        style={{
                            position: 'absolute',
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            zIndex: 120
                        }}
                        className="bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                        <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                            {options.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={cn(
                                        "px-4.5 py-2.5 text-[11.5px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors",
                                        value === opt.value && "bg-blue-50/50 text-blue-600"
                                    )}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>,
                document.body
            )}
        </div>
    );
}

// --- Team Avatar Selector (Optimized -8%) ---
function TeamAvatarPicker({
    selectedIds,
    allPersonnel,
    onToggle,
    label,
    disabled = false
}: {
    selectedIds: string[],
    allPersonnel: any[],
    onToggle: (id: string) => void,
    label: string,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [search, setSearch] = useState('');

    const toggle = () => {
        if (disabled) return;
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 240
            });
        }
        setIsOpen(!isOpen);
    };

    const filtered = allPersonnel.filter(p =>
        (p.nom?.toLowerCase().includes(search.toLowerCase()) || p.prenom?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-blue-500" /> {label}</span>
                <span className="text-[8.5px] opacity-60 font-bold">{selectedIds.length} membres</span>
            </h4>

            <div className={cn(
                "flex items-center gap-1.5 flex-wrap min-h-[34px] p-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-inner",
                disabled && "opacity-60 cursor-not-allowed"
            )}>
                {selectedIds.map(id => {
                    const p = allPersonnel.find(x => x.id_personnel === id);
                    if (!p) return null;
                    return (
                        <div
                            key={id}
                            className="relative group h-8 w-8 rounded-full border-2 border-white shadow-md ring-1 ring-slate-100 overflow-hidden bg-white flex items-center justify-center text-[10.5px] font-black text-slate-600 hover:scale-110 transition-transform"
                        >
                            {p.nom?.[0]}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => onToggle(id)}
                                    className="absolute inset-0 bg-rose-500/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    );
                })}
                {!disabled && (
                    <button
                        type="button"
                        ref={buttonRef}
                        onClick={toggle}
                        className="h-8 w-8 rounded-full border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    </button>
                )}
            </div>

            {isOpen && ReactDOM.createPortal(
                <>
                    <div className="fixed inset-0 z-[130]" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        style={{
                            position: 'absolute',
                            top: coords.top,
                            left: coords.left,
                            width: '250px',
                            zIndex: 140
                        }}
                        className="bg-white border border-slate-100 rounded-2xl shadow-[0_22px_75px_rgba(0,0,0,0.16)] overflow-hidden"
                    >
                        <div className="p-2.5 border-b border-slate-50 flex items-center gap-2.5 bg-slate-50/50">
                            <Search className="h-3 w-3 text-slate-400" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher..."
                                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 w-full"
                            />
                        </div>
                        <div className="max-h-[190px] overflow-y-auto p-1.5 space-y-0.5 scrollbar-hide">
                            {filtered.map(p => {
                                const isSelected = selectedIds.includes(p.id_personnel);
                                return (
                                    <div
                                        key={p.id_personnel}
                                        onClick={() => onToggle(p.id_personnel)}
                                        className={cn(
                                            "flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50",
                                            isSelected && "bg-blue-50"
                                        )}
                                    >
                                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white shadow-sm shrink-0">
                                            {p.nom?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10.5px] font-black text-slate-800 truncate leading-none">{p.nom} {p.prenom}</p>
                                            <p className="text-[8.5px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">{p.fonction || 'Membre'}</p>
                                        </div>
                                        {isSelected && <Zap className="h-3 w-3 text-blue-500 fill-current shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </>,
                document.body
            )}
        </div>
    );
}

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
        date_test: format(new Date(), 'yyyy-MM-dd'),
        heure_debut: format(new Date(), 'HH:mm'),
        heure_fin: format(addMinutes(new Date(), 60), 'HH:mm'),
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

    const [isLocalisationLinked, setIsLocalisationLinked] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const [systemNow, setSystemNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setSystemNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const todayStr = useMemo(() => format(systemNow, 'yyyy-MM-dd'), [systemNow]);

    const { data: creationData } = useQuery({
        queryKey: ['test-creation-data'],
        queryFn: () => testsService.getCreationData(),
        enabled: isTestModalOpen,
    });

    const { data: existingTest } = useQuery({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: isTestModalOpen && isEdit,
    });

    // AUTO-RESET FORM when switching to CREATE MODE
    useEffect(() => {
        if (isTestModalOpen && !isEdit) {
            setForm({
                type_test_id: '',
                equipement_id: '',
                phase_id: '',
                procedure_id: '',
                date_test: format(new Date(), 'yyyy-MM-dd'),
                heure_debut: format(new Date(), 'HH:mm'),
                heure_fin: format(addMinutes(new Date(), 60), 'HH:mm'),
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
            setValidationErrors({});
            setIsLocalisationLinked(false);
        }
    }, [isTestModalOpen, isEdit]);

    useEffect(() => {
        if (existingTest && isEdit) {
            // Robust extraction of time part (HH:mm) from full timestamps or ISO strings
            const getTime = (primary: string | undefined | null, fallback: string | undefined | null) => {
                const str = primary || fallback;
                if (!str) return null;
                const timePart = str.includes('T') ? str.split('T')[1] : str.includes(' ') ? str.split(' ')[1] : str;
                return timePart?.substring(0, 5) || null;
            };

            // Ensure equipe_test is an array of IDs even if backend returns full objects
            const equipeIds = (existingTest.equipe_test || []).map((p: any) =>
                typeof p === 'string' ? p : (p.id_personnel || p.id)
            ).filter(Boolean);

            setForm({
                type_test_id: existingTest.type_test_id || '',
                equipement_id: existingTest.equipement_id || '',
                phase_id: existingTest.phase_id || '',
                procedure_id: existingTest.procedure_id || '',
                localisation: existingTest.localisation || '',
                niveau_criticite: existingTest.niveau_criticite || 1,
                responsable_test_id: existingTest.responsable_test_id || '',
                instrument_id: existingTest.instrument_id || '',
                arret_production_requis: !!existingTest.arret_production_requis,
                statut_final: existingTest.statut_final || null,
                statut_test: existingTest.statut_test || 'PLANIFIE',
                date_test: existingTest.date_test?.split('T')[0] || todayStr,
                heure_debut: getTime(existingTest.heure_debut, existingTest.heure_debut_planifiee) || '08:00',
                heure_fin: getTime(existingTest.heure_fin, existingTest.heure_fin_planifiee) || '09:00',
                equipe_test: equipeIds,
                observations_generales: existingTest.observations_generales || '',
                resultat_attendu: existingTest.resultat_attendu || '',
            });
        }
    }, [existingTest, isEdit, todayStr]);

    // Smart Sync Logic: Equipement ➔ Localisation
    const handleEquipementChange = (id: string) => {
        const eq = creationData?.equipements?.find((e: any) => e.id_equipement === id);
        // Robust detection of location property from backend object (Fix: added localisation_site)
        const autoLocalisation = eq?.localisation_site || eq?.localisation || eq?.location || eq?.zone || eq?.site || eq?.site_area || eq?.emplacement || '';

        setForm(prev => ({
            ...prev,
            equipement_id: id,
            localisation: autoLocalisation || prev.localisation
        }));

        if (validationErrors.equipement_id) setValidationErrors(prev => ({ ...prev, equipement_id: '' }));
        if (autoLocalisation && validationErrors.localisation) setValidationErrors(prev => ({ ...prev, localisation: '' }));

        if (autoLocalisation) {
            setIsLocalisationLinked(true);
            toast.success(`Zone auto-remplie : ${autoLocalisation}`, {
                icon: '📍',
                duration: 2000,
                style: { borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }
            });
        }
    };

    // Strict Anti-past Validation (System Clock)
    useEffect(() => {
        if (form.date_test === todayStr) {
            const currentStart = parse(form.heure_debut || '00:00', 'HH:mm', new Date());
            const systemStart = startOfMinute(systemNow);
            if (currentStart < systemStart) {
                setForm(prev => {
                    const newStart = format(systemNow, 'HH:mm');
                    const start = parse(newStart, 'HH:mm', new Date());
                    const newEnd = format(addMinutes(start, 60), 'HH:mm');
                    return { ...prev, heure_debut: newStart, heure_fin: newEnd };
                });
            }
        }
    }, [form.date_test, todayStr, systemNow]);

    const timeAnalysis = useMemo(() => {
        try {
            const start = parse(form.heure_debut || '00:00', 'HH:mm', new Date());
            const end = parse(form.heure_fin || '00:00', 'HH:mm', new Date());
            const diff = differenceInMinutes(end, start);
            const isToday = form.date_test === todayStr;
            const isPast = isToday && start < startOfMinute(systemNow);
            const isValid = diff >= 15 && !isPast && !!form.equipement_id && !!form.type_test_id && !!form.localisation;
            return {
                diff,
                isPast,
                isValid,
                isEndBeforeStart: diff <= 0,
                label: diff > 0 ? (diff >= 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}min`) : '0min'
            };
        } catch {
            return { diff: 0, isPast: false, isValid: false, isEndBeforeStart: false, label: 'Err' };
        }
    }, [form.heure_debut, form.heure_fin, form.date_test, todayStr, systemNow, form.equipement_id, form.type_test_id, form.localisation]);

    const filteredInstruments = useMemo(() => {
        if (!creationData?.instruments || !form.type_test_id) return creationData?.instruments || [];
        const selectedType = creationData.types_tests?.find((t: any) => t.id_type_test === form.type_test_id);

        if (!selectedType?.instruments_eligibles || selectedType.instruments_eligibles.length === 0) {
            return creationData.instruments;
        }

        return creationData.instruments.filter((ins: any) =>
            selectedType.instruments_eligibles.includes(ins.id_instrument)
        );
    }, [creationData, form.type_test_id]);

    const mutation = useMutation({
        mutationFn: (data: CreateTestData) =>
            isEdit ? testsService.updateTest(selectedTestId!, data) : testsService.createTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            closeTestModal();
            toast.success(isEdit ? 'Architecture mise à jour' : 'Planification activée', {
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        }
    });

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const errors: Record<string, string> = {};

        if (!form.equipement_id) errors.equipement_id = "L'équipement est obligatoire";
        if (!form.type_test_id) errors.type_test_id = "Le type de contrôle est obligatoire";
        if (!form.localisation) errors.localisation = "La zone est obligatoire";
        if (timeAnalysis.isPast) errors.heure_debut = "L'heure ne peut pas être dans le passé";
        if (timeAnalysis.isEndBeforeStart) errors.heure_fin = "L'heure de fin doit être après le début";

        const responsableId = creationData?.current_user?.id_personnel || user?.id_personnel;
        if (!responsableId) errors.responsable = "Le responsable est requis";
        if (!form.instrument_id) errors.instrument_id = "L'instrument de mesure est obligatoire pour la traçabilité";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Veuillez remplir tous les champs obligatoires avant de valider", {
                style: { borderRadius: '12px', fontWeight: 'bold', fontSize: '11px' }
            });
            return;
        }

        setValidationErrors({});

        const sanitized = {
            ...form,
            responsable_test_id: responsableId,
            heure_debut_planifiee: form.heure_debut,
            heure_fin_planifiee: form.heure_fin,
        };
        mutation.mutate(sanitized as any);
    };

    if (!isTestModalOpen) return null;

    const criticalityLevels = [
        { value: 1, label: 'Mineur', color: 'bg-emerald-500' },
        { value: 2, label: 'Important', color: 'bg-amber-500' },
        { value: 3, label: 'Critique', color: 'bg-orange-500' },
        { value: 4, label: 'Vital', color: 'bg-rose-500' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="px-9 py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-13 w-13 rounded-[18px] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-100">
                            <FlaskConical className="h-6.5 w-6.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                ARCHITECTURE DE TEST
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">Industrial Excellence Framework</p>
                        </div>
                    </div>
                    <button type="button" onClick={closeTestModal} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 2px, transparent 0)', backgroundSize: '18px 18px' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                    {existingTest?.est_verrouille && (
                        <div className="mb-8 p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-4 shadow-xl border-l-4 border-l-amber-500">
                            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                <Lock size={20} className="text-slate-900" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-500">Paramètres Verrouillés</h4>
                                <p className="text-[10px] font-bold text-slate-400">Ce test est certifié. Les paramètres de planification et l'instrumentation ne peuvent plus être modifiés.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Configuration */}
                        <div className="col-span-12 lg:col-span-8 space-y-7">

                            <div className="grid grid-cols-2 gap-8 mt-1">
                                <PortalDropdown
                                    label="Équipement"
                                    icon={Terminal}
                                    placeholder="Sélectionner..."
                                    options={creationData?.equipements?.map((eq: any) => ({ value: eq.id_equipement, label: `[${eq.code_equipement}] ${eq.designation}` })) || []}
                                    value={form.equipement_id}
                                    onChange={handleEquipementChange}
                                    required
                                    error={validationErrors.equipement_id}
                                    disabled={existingTest?.est_verrouille}
                                />
                                <PortalDropdown
                                    label="Type de Contrôle"
                                    icon={Layers}
                                    placeholder="Processus..."
                                    options={creationData?.types_tests?.map((t: any) => ({ value: t.id_type_test, label: t.libelle })) || []}
                                    value={form.type_test_id}
                                    onChange={(v) => {
                                        setForm(p => ({ ...p, type_test_id: v }));
                                        if (validationErrors.type_test_id) setValidationErrors(prev => ({ ...prev, type_test_id: '' }));
                                    }}
                                    required
                                    error={validationErrors.type_test_id}
                                    disabled={existingTest?.est_verrouille}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-blue-600" /> Planification Chronologique
                                    </h4>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm transition-all duration-500",
                                        timeAnalysis.isValid ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-50 text-rose-500 border-rose-100"
                                    )}>
                                        <Timer className="h-3 w-3" />
                                        Durée: {timeAnalysis.label}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-blue-200 transition-all shadow-sm">
                                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1">Exécution le</span>
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-[12px] font-bold text-slate-800 outline-none"
                                            min={todayStr}
                                            value={form.date_test}
                                            onChange={(e) => setForm(p => ({ ...p, date_test: e.target.value }))}
                                            disabled={existingTest?.est_verrouille}
                                        />
                                    </div>
                                    <div className={cn("p-3 rounded-xl border transition-all shadow-sm", (timeAnalysis.isPast || validationErrors.heure_debut) ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100 focus-within:bg-white focus-within:border-blue-200")}>
                                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start (T0)</span>
                                        <input
                                            type="time"
                                            className="w-full bg-transparent text-[12px] font-bold text-slate-800 outline-none"
                                            value={form.heure_debut}
                                            onChange={(e) => {
                                                setForm(p => ({ ...p, heure_debut: e.target.value }));
                                                if (validationErrors.heure_debut) setValidationErrors(prev => ({ ...prev, heure_debut: '' }));
                                            }}
                                            disabled={existingTest?.est_verrouille}
                                        />
                                        {validationErrors.heure_debut && <p className="text-[8px] font-bold text-rose-500 mt-1">{validationErrors.heure_debut}</p>}
                                    </div>
                                    <div className={cn("p-3 rounded-xl border transition-all shadow-sm", (timeAnalysis.isEndBeforeStart || validationErrors.heure_fin) ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100 focus-within:bg-white focus-within:border-blue-200")}>
                                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1">End (TF)</span>
                                        <input
                                            type="time"
                                            className="w-full bg-transparent text-[12px] font-bold text-slate-800 outline-none"
                                            value={form.heure_fin}
                                            onChange={(e) => {
                                                setForm(p => ({ ...p, heure_fin: e.target.value }));
                                                if (validationErrors.heure_fin) setValidationErrors(prev => ({ ...prev, heure_fin: '' }));
                                            }}
                                            disabled={existingTest?.est_verrouille}
                                        />
                                        {validationErrors.heure_fin && <p className="text-[8px] font-bold text-rose-500 mt-1">{validationErrors.heure_fin}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1 relative mt-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-blue-500" /> ZONE</span>
                                        {isLocalisationLinked && <span className="text-[8.5px] text-blue-600 font-black flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full"><LinkIcon className="h-2.5 w-2.5" /> SYNC</span>}
                                    </label>
                                    <input
                                        className={cn(
                                            "w-full px-4.5 py-2.5 bg-slate-50 shadow-sm border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none hover:bg-white focus:bg-white focus:border-blue-500 transition-all",
                                            validationErrors.localisation && "border-rose-300 bg-rose-50/20"
                                        )}
                                        placeholder="Emplacement..."
                                        value={String(form.localisation || '')}
                                        onChange={(e) => {
                                            setForm(p => ({ ...p, localisation: e.target.value }));
                                            setIsLocalisationLinked(false);
                                            if (validationErrors.localisation) setValidationErrors(prev => ({ ...prev, localisation: '' }));
                                        }}
                                        disabled={existingTest?.est_verrouille}
                                    />
                                    {validationErrors.localisation && <p className="text-[9px] font-bold text-rose-500 ml-1.5 mt-0.5">{validationErrors.localisation}</p>}
                                </div>
                                <PortalDropdown
                                    label="Instrumentation"
                                    icon={Wrench}
                                    placeholder={form.type_test_id ? "Instrument éligible..." : "Veuillez choisir un type de test..."}
                                    options={filteredInstruments?.map((i: any) => ({ value: i.id_instrument, label: `[N° ${i.numero_serie}] ${i.designation}` })) || []}
                                    value={form.instrument_id || ''}
                                    onChange={(v) => {
                                        setForm(p => ({ ...p, instrument_id: v }));
                                        if (validationErrors.instrument_id) setValidationErrors(prev => ({ ...prev, instrument_id: '' }));
                                    }}
                                    required
                                    error={validationErrors.instrument_id}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80 mt-1">
                                        <FileText className="h-3 w-3 text-blue-500/70" /> Résultats Attendus
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white focus:border-blue-500 transition-all resize-none shadow-inner"
                                        placeholder="Objectifs de conformité..."
                                        value={form.resultat_attendu || ''}
                                        onChange={(e) => setForm(p => ({ ...p, resultat_attendu: e.target.value }))}
                                        disabled={existingTest?.est_verrouille}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80 mt-1">
                                        <ArrowRight className="h-3 w-3 text-blue-500/70" /> Observations Spécifiques
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white focus:border-blue-500 transition-all resize-none shadow-inner"
                                        placeholder="Notes techniques..."
                                        value={form.observations_generales || ''}
                                        onChange={(e) => setForm(p => ({ ...p, observations_generales: e.target.value }))}
                                        disabled={existingTest?.est_verrouille}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Risk & Team */}
                        <div className="col-span-12 lg:col-span-4 space-y-9 mt-1">

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <ShieldAlert className="h-3 w-3 text-rose-500" /> Diagnostic de Risque
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {criticalityLevels.map((l) => (
                                        <button
                                            key={l.value}
                                            type="button"
                                            onClick={() => !existingTest?.est_verrouille && setForm(prev => ({ ...prev, niveau_criticite: l.value }))}
                                            className={cn(
                                                "w-full px-4.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between",
                                                form.niveau_criticite === l.value
                                                    ? "bg-slate-900 border-slate-800 text-white shadow-lg"
                                                    : "bg-white border-white text-slate-400 hover:border-slate-100",
                                                existingTest?.est_verrouille && "opacity-60 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-2.5 w-2.5 rounded-full", l.color)} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">{l.label}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-20">
                                                {Array.from({ length: l.value }).map((_, i) => <Zap key={i} className="h-3 w-3" />)}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div
                                    onClick={() => !existingTest?.est_verrouille && setForm(prev => ({ ...prev, arret_production_requis: !prev.arret_production_requis }))}
                                    className={cn(
                                        "p-4.5 rounded-[22px] border-2 transition-all flex items-center justify-between cursor-pointer group shadow-sm mt-5",
                                        form.arret_production_requis ? "bg-rose-600 border-rose-500 text-white shadow-lg" : "bg-white border-white text-slate-700",
                                        existingTest?.est_verrouille && "opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all", form.arret_production_requis ? "bg-white text-rose-600" : "bg-blue-50 text-blue-500")}>
                                            <AlertCircle className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10.5px] font-black uppercase tracking-tight">Machine Offline</h4>
                                            <p className={cn("text-[8.5px] font-bold uppercase tracking-widest opacity-60 mt-0.5", form.arret_production_requis ? "text-rose-100" : "text-slate-400")}>Arrêt Production</p>
                                        </div>
                                    </div>
                                    <div className={cn("h-4.5 w-8.5 rounded-full relative transition-all p-0.5", form.arret_production_requis ? "bg-white/30" : "bg-slate-200")}>
                                        <motion.div animate={{ x: form.arret_production_requis ? 16 : 0 }} className="h-3.5 w-3.5 rounded-full bg-white shadow-lg" />
                                    </div>
                                </div>
                            </div>

                            <TeamAvatarPicker
                                label="COHORTE OPÉRATIONNELLE"
                                selectedIds={form.equipe_test || []}
                                allPersonnel={creationData?.personnels?.filter((p: any) =>
                                    p.id_personnel !== creationData?.current_user?.id_personnel
                                ) || []}
                                onToggle={(id) => setForm(p => ({
                                    ...p,
                                    equipe_test: (p.equipe_test || []).includes(id)
                                        ? (p.equipe_test || []).filter(x => x !== id)
                                        : [...(p.equipe_test || []), id]
                                }))}
                                disabled={existingTest?.est_verrouille}
                            />

                            {/* Responsable Display - Fetched from Backend */}
                            {creationData?.current_user && (
                                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center gap-3 group">
                                    <div className="relative">
                                        <div className="h-11 w-11 rounded-full bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-[15px] font-black text-white relative z-10 transition-transform group-hover:scale-110">
                                            {creationData.current_user.nom?.[0] || 'U'}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg z-20">
                                            <Shield className="h-2 w-2 fill-current" />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10.5px] font-black text-slate-800 leading-none">
                                            Responsable: {creationData.current_user.nom} {creationData.current_user.prenom}
                                        </p>
                                        <p className="text-[8.5px] font-black text-blue-600 uppercase tracking-[1.2px]">
                                            {creationData.current_user.fonction || 'Workflow Manager'}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </form>

                <div className="px-9 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={closeTestModal} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        Abandonner
                    </button>
                    <div className="flex items-center gap-7">
                        <AnimatePresence>
                            {!timeAnalysis.isValid && (
                                <motion.div
                                    initial={{ opacity: 0, x: 15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 15 }}
                                    className="flex items-center gap-2 text-rose-500"
                                >
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-[1.2px]">Configuration Invalide</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending || existingTest?.est_verrouille}
                            className={cn(
                                "group h-13 px-13 rounded-xl text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-3 transition-all duration-500 relative shadow-2xl overflow-hidden active:scale-[0.98]",
                                (mutation.isPending || existingTest?.est_verrouille)
                                    ? "bg-slate-100 text-slate-300 pointer-events-none grayscale"
                                    : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 ring-4 ring-blue-500/10"
                            )}
                        >
                            {mutation.isPending ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Traitements...</span>
                                </>
                            ) : (
                                <>
                                    {isEdit ? "Valider" : "Lancer Planification"}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

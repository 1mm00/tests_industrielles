import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    X,
    MapPin,
    Calendar,
    Terminal,
    Layers,
    ShieldAlert,
    FileText,
    Users,
    ChevronDown,
    Zap,
    Plus,
    Search,
    Shield,
    Activity,
    ArrowRight,
    Link as LinkIcon
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

// --- Custom Portal Dropdown (Same as TestCreationModal) ---
function PortalDropdown({
    label,
    icon: Icon,
    options,
    value,
    onChange,
    placeholder,
    required = false,
    error
}: {
    label: string,
    icon: any,
    options: { value: string, label: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    required?: boolean,
    error?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const toggle = () => {
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
                <Icon className="h-3 w-3 text-rose-500/80" />
                {label} {required && <span className="text-rose-400 font-bold">*</span>}
            </label>
            <div
                onClick={toggle}
                className={cn(
                    "w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-rose-200 shadow-sm",
                    isOpen && "border-rose-500 ring-4 ring-rose-500/5 bg-white shadow-md",
                    error && "border-rose-300 bg-rose-50/30 ring-4 ring-rose-500/5"
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
                                        "px-4.5 py-2.5 text-[11.5px] font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors",
                                        value === opt.value && "bg-rose-50/50 text-rose-600"
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

// --- Team Avatar Picker (Adapted for NC Detectors) ---
function DetectorAvatarPicker({
    selectedIds,
    allPersonnel,
    onToggle,
    label
}: {
    selectedIds: string[],
    allPersonnel: any[],
    onToggle: (id: string) => void,
    label: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [search, setSearch] = useState('');

    const toggle = () => {
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
                <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-rose-500" /> {label}</span>
                <span className="text-[8.5px] opacity-60 font-bold">{selectedIds.length} détecteurs</span>
            </h4>

            <div className="flex items-center gap-1.5 flex-wrap min-h-[34px] p-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-inner">
                {selectedIds.map(id => {
                    const p = allPersonnel.find(x => x.id_personnel === id);
                    if (!p) return null;
                    return (
                        <div
                            key={id}
                            className="relative group h-8 w-8 rounded-full border-2 border-white shadow-md ring-1 ring-slate-100 overflow-hidden bg-white flex items-center justify-center text-[10.5px] font-black text-slate-600 hover:scale-110 transition-transform"
                        >
                            {p.nom?.[0]}
                            <button
                                type="button"
                                onClick={() => onToggle(id)}
                                className="absolute inset-0 bg-rose-500/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
                <button
                    type="button"
                    ref={buttonRef}
                    onClick={toggle}
                    className="h-8 w-8 rounded-full border-2 border-dashed border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                </button>
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
                                            isSelected && "bg-rose-50"
                                        )}
                                    >
                                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white shadow-sm shrink-0">
                                            {p.nom?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10.5px] font-black text-slate-800 truncate leading-none">{p.nom} {p.prenom}</p>
                                            <p className="text-[8.5px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">{p.fonction || 'Membre'}</p>
                                        </div>
                                        {isSelected && <Zap className="h-3 w-3 text-rose-500 fill-current shrink-0" />}
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

export default function NcCreationModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isNcModalOpen, closeNcModal, isNcEditModalOpen, closeNcEditModal, selectedNcId } = useModalStore();

    const isOpen = isNcModalOpen || isNcEditModalOpen;
    const isEditMode = isNcEditModalOpen && !!selectedNcId;

    const [form, setForm] = useState({
        test_id: '',
        equipement_id: '',
        criticite_id: '',
        type_nc: '',
        description: '',
        impact_potentiel: '',
        date_detection: new Date().toISOString().split('T')[0],
        detecteur_id: '',
        co_detecteurs: [] as string[],
        zone_detection: '',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isZoneLinked, setIsZoneLinked] = useState(false);

    // Récupérer les données de la NC si en mode édition
    const { data: existingNc } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: isEditMode,
    });

    const { data: creationData } = useQuery({
        queryKey: ['nc-creation-data'],
        queryFn: () => ncService.getCreationData(),
        enabled: isOpen,
    });

    // Pré-remplir le formulaire en mode édition
    useEffect(() => {
        if (isEditMode && existingNc) {
            const data = existingNc as any;
            setForm({
                test_id: data.test_id || '',
                equipement_id: data.equipement_id || '',
                criticite_id: data.criticite_id || data.niveau_criticite_id || '',
                type_nc: data.type_nc || '',
                description: data.description || '',
                impact_potentiel: data.impact_potentiel || '',
                date_detection: data.date_detection?.split('T')[0] || new Date().toISOString().split('T')[0],
                detecteur_id: data.detecteur_id || '',
                co_detecteurs: data.co_detecteurs || [],
                zone_detection: data.zone_detection || data.equipement?.localisation_site || '',
            });
        } else if (!isEditMode) {
            // Réinitialiser le formulaire en mode création
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
                zone_detection: '',
            });
        }
    }, [isEditMode, existingNc]);


    // Smart Sync Logic: Equipement → Zone de Détection
    const handleEquipementChange = (id: string) => {
        const eq = creationData?.equipements?.find((e: any) => e.id_equipement === id);
        // Robust detection of location property from backend object
        const autoZone = eq?.localisation_site || eq?.localisation_precise || eq?.localisation || eq?.location || eq?.zone || eq?.site || eq?.site_area || eq?.emplacement || '';

        setForm(prev => ({
            ...prev,
            equipement_id: id,
            zone_detection: autoZone || prev.zone_detection
        }));

        if (validationErrors.equipement_id) setValidationErrors(prev => ({ ...prev, equipement_id: '' }));

        if (autoZone) {
            setIsZoneLinked(true);
            toast.success(`Zone auto-remplie : ${autoZone}`, {
                icon: '📍',
                duration: 2000,
                style: { borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }
            });
        }
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => {
            if (isEditMode && selectedNcId) {
                return ncService.updateNc(selectedNcId, data);
            }
            return ncService.createNc(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['nc-stats'] });
            if (isEditMode) {
                queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            }

            if (isEditMode) {
                closeNcEditModal();
                toast.success('Non-conformité mise à jour avec succès !', {
                    icon: '✅',
                    style: { borderRadius: '12px', fontWeight: 'bold' }
                });
            } else {
                closeNcModal();
                toast.success('Non-conformité déclarée avec succès !', {
                    icon: '🚨',
                    style: { borderRadius: '12px', fontWeight: 'bold' }
                });
            }

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
                zone_detection: '',
            });
        },
        onError: (error: any) => {
            console.error('Erreur NC:', error.response?.data);
            const message = isEditMode ? 'Échec de la mise à jour' : 'Échec de la déclaration';
            toast.error(`Erreur: ${error.response?.data?.message || message}`, {
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        }
    });

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const errors: Record<string, string> = {};

        if (!form.equipement_id) errors.equipement_id = "L'équipement est obligatoire";
        if (!form.type_nc) errors.type_nc = "Le type de NC est obligatoire";
        if (!form.criticite_id) errors.criticite_id = "La criticité est obligatoire";
        if (!form.description || form.description.trim().length < 10) errors.description = "Description trop courte (min. 10 caractères)";

        const isLikelyUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
        const detectorId = (form.detecteur_id && isLikelyUUID(form.detecteur_id))
            ? form.detecteur_id
            : (user?.id_personnel || user?.id || null);

        if (!detectorId) errors.detecteur = "Le détecteur est requis";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Veuillez compléter tous les champs obligatoires", {
                style: { borderRadius: '12px', fontWeight: 'bold', fontSize: '11px' }
            });
            return;
        }

        setValidationErrors({});

        const sanitized = {
            ...form,
            test_id: (form.test_id && isLikelyUUID(form.test_id)) ? form.test_id : null,
            detecteur_id: detectorId
        };

        createMutation.mutate(sanitized);
    };

    if (!isOpen) return null;

    const handleClose = () => {
        if (isEditMode) {
            closeNcEditModal();
        } else {
            closeNcModal();
        }
    };

    const ncTypes = [
        { value: 'DIMENSIONNEL', label: 'Écart Dimensionnel' },
        { value: 'FONCTIONNEL', label: 'Défaut Fonctionnel' },
        { value: 'ASPECT', label: "Défaut d'Aspect" },
        { value: 'SECURITE', label: 'Problème de Sécurité' },
        { value: 'MATIERE', label: 'Conformité Matière' },
    ];

    const isFormValid = form.equipement_id && form.type_nc && form.criticite_id && form.description.length >= 10;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="px-9 py-5 bg-gradient-to-br from-rose-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-13 w-13 rounded-[18px] bg-rose-600 flex items-center justify-center shadow-2xl shadow-rose-100">
                            <AlertTriangle className="h-6.5 w-6.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                {isEditMode ? 'MODIFICATION NC' : 'DÉCLARATION NC'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">
                                {isEditMode ? 'Edit Non-Conformity Report' : 'Non-Conformity Report System'}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={handleClose} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 2px, transparent 0)', backgroundSize: '18px 18px' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                    <div className="grid grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Incident Details */}
                        <div className="col-span-12 lg:col-span-8 space-y-7">

                            <div className="grid grid-cols-2 gap-8 mt-1">
                                <PortalDropdown
                                    label="Équipement Concerné"
                                    icon={Terminal}
                                    placeholder="Sélectionner l'équipement..."
                                    options={creationData?.equipements?.map((eq: any) => ({ value: eq.id_equipement, label: `[${eq.code_equipement}] ${eq.designation}` })) || []}
                                    value={form.equipement_id}
                                    onChange={handleEquipementChange}
                                    required
                                    error={validationErrors.equipement_id}
                                />
                                <PortalDropdown
                                    label="Type de Non-Conformité"
                                    icon={Layers}
                                    placeholder="Catégorie d'écart..."
                                    options={ncTypes}
                                    value={form.type_nc}
                                    onChange={(v) => {
                                        setForm(p => ({ ...p, type_nc: v }));
                                        if (validationErrors.type_nc) setValidationErrors(prev => ({ ...prev, type_nc: '' }));
                                    }}
                                    required
                                    error={validationErrors.type_nc}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-rose-200 transition-all shadow-sm">
                                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                                        <Calendar className="h-2.5 w-2.5" /> Détection le
                                    </span>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent text-[12px] font-bold text-slate-800 outline-none"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={form.date_detection}
                                        onChange={(e) => setForm(p => ({ ...p, date_detection: e.target.value }))}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-rose-500" /> Zone de Détection</span>
                                        {isZoneLinked && <span className="text-[8.5px] text-rose-600 font-black flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded-full"><LinkIcon className="h-2.5 w-2.5" /> SYNC</span>}
                                    </label>
                                    <input
                                        className="w-full px-4.5 py-2.5 bg-slate-50 shadow-sm border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none hover:bg-white focus:bg-white focus:border-rose-500 transition-all"
                                        placeholder="Emplacement / poste..."
                                        value={form.zone_detection}
                                        onChange={(e) => {
                                            setForm(p => ({ ...p, zone_detection: e.target.value }));
                                            setIsZoneLinked(false);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><FileText className="h-3 w-3 text-rose-500" /> Description Détaillée de l'écart *</span>
                                    <span className={cn("text-[8.5px]", form.description.length >= 10 ? "text-emerald-500" : "text-rose-400")}>
                                        {form.description.length}/10 min
                                    </span>
                                </label>
                                <textarea
                                    rows={4}
                                    className={cn(
                                        "w-full p-4 bg-slate-50 border rounded-[20px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white transition-all resize-none shadow-inner",
                                        validationErrors.description ? "border-rose-300 bg-rose-50/20" : "border-slate-100 focus:border-rose-500"
                                    )}
                                    placeholder="Décrivez précisément ce qui a été observé : dimensions hors tolérance, défaut visuel, comportement anormal..."
                                    value={form.description}
                                    onChange={(e) => {
                                        setForm(p => ({ ...p, description: e.target.value }));
                                        if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: '' }));
                                    }}
                                />
                                {validationErrors.description && <p className="text-[9px] font-bold text-rose-500 ml-1.5">{validationErrors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80 mt-1">
                                    <ShieldAlert className="h-3 w-3 text-rose-500/70" /> Impact Potentiel (Production/Sécurité)
                                </label>
                                <textarea
                                    rows={2}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white focus:border-rose-500 transition-all resize-none shadow-inner"
                                    placeholder="Ex: Risque d'arrêt ligne, danger opérateur, rebus matière, non-conformité client..."
                                    value={form.impact_potentiel}
                                    onChange={(e) => setForm(p => ({ ...p, impact_potentiel: e.target.value }))}
                                />
                            </div>

                            <PortalDropdown
                                label="Test d'Origine (Optionnel)"
                                icon={Activity}
                                placeholder="Aucun test spécifique"
                                options={creationData?.tests?.map((t: any) => ({ value: t.id_test, label: `NC détectée lors du Test ${t.numero_test}` })) || []}
                                value={form.test_id}
                                onChange={(v) => setForm(p => ({ ...p, test_id: v }))}
                            />
                        </div>

                        {/* RIGHT COLUMN: Severity & Team */}
                        <div className="col-span-12 lg:col-span-4 space-y-9 mt-1">

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <ShieldAlert className="h-3 w-3 text-rose-500" /> Niveau de Gravité
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {creationData?.criticites?.map((c: any) => (
                                        <button
                                            key={c.id_niveau_criticite}
                                            type="button"
                                            onClick={() => {
                                                setForm(prev => ({ ...prev, criticite_id: c.id_niveau_criticite }));
                                                if (validationErrors.criticite_id) setValidationErrors(prev => ({ ...prev, criticite_id: '' }));
                                            }}
                                            className={cn(
                                                "w-full px-4.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between",
                                                form.criticite_id === c.id_niveau_criticite
                                                    ? "bg-rose-600 border-rose-500 text-white shadow-lg"
                                                    : "bg-white border-white text-slate-400 hover:border-slate-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-2.5 w-2.5 rounded-full",
                                                    c.code_niveau === 'NC1' || c.code_niveau === 'MINEUR' ? "bg-emerald-500" :
                                                        c.code_niveau === 'NC2' || c.code_niveau === 'MODERE' ? "bg-amber-500" :
                                                            c.code_niveau === 'NC3' || c.code_niveau === 'GRAVE' ? "bg-orange-500" :
                                                                "bg-rose-500"
                                                )} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">{c.libelle}</span>
                                            </div>
                                        </button>
                                    )) || []}
                                </div>
                                {validationErrors.criticite_id && <p className="text-[9px] font-bold text-rose-500 ml-1.5">{validationErrors.criticite_id}</p>}
                            </div>

                            <DetectorAvatarPicker
                                label="CO-DÉTECTEURS"
                                selectedIds={form.co_detecteurs || []}
                                allPersonnel={creationData?.personnels?.filter((p: any) =>
                                    p.id_personnel !== (user?.id_personnel || user?.id)
                                ) || []}
                                onToggle={(id) => setForm(p => ({
                                    ...p,
                                    co_detecteurs: (p.co_detecteurs || []).includes(id)
                                        ? (p.co_detecteurs || []).filter(x => x !== id)
                                        : [...(p.co_detecteurs || []), id]
                                }))}
                            />

                            {/* Current User Display */}
                            {user && (
                                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center gap-3 group">
                                    <div className="relative">
                                        <div className="h-11 w-11 rounded-full bg-rose-600 border-4 border-white shadow-xl flex items-center justify-center text-[15px] font-black text-white relative z-10 transition-transform group-hover:scale-110">
                                            {user.nom?.[0] || 'U'}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-rose-900 border-2 border-white flex items-center justify-center text-white shadow-lg z-20">
                                            <Shield className="h-2 w-2 fill-current" />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10.5px] font-black text-slate-800 leading-none">
                                            Déclarant: {user.nom} {user.prenom}
                                        </p>
                                        <p className="text-[8.5px] font-black text-rose-600 uppercase tracking-[1.2px]">
                                            {user.fonction || 'Quality Inspector'}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </form>

                <div className="px-9 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={handleClose} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        {isEditMode ? 'Annuler' : 'Abandonner'}
                    </button>
                    <div className="flex items-center gap-7">
                        {!isFormValid && (
                            <motion.div
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-rose-500"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-[1.2px]">Formulaire Incomplet</span>
                            </motion.div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                            className={cn(
                                "group h-13 px-13 rounded-xl text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-3 transition-all duration-500 relative shadow-2xl overflow-hidden active:scale-[0.98]",
                                createMutation.isPending
                                    ? "bg-slate-100 text-slate-300 pointer-events-none grayscale"
                                    : "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700 ring-4 ring-rose-500/10"
                            )}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{isEditMode ? 'Enregistrement...' : 'Déclaration...'}</span>
                                </>
                            ) : (
                                <>
                                    {isEditMode ? 'Enregistrer les modifications' : 'Déclarer la NC'}
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

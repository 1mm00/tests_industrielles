import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronDown,
    Clock,
    Info,
    Layers,
    Activity,
    ClipboardList,
    CornerDownRight,
    Search as SearchIcon,
    Settings,
    ArrowRight
} from 'lucide-react';
import { typeTestsService } from '@/services/typeTestsService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

// --- Custom Portal Dropdown (Premium) ---
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
                <Icon className="h-3 w-3 text-blue-500/80" />
                {label} {required && <span className="text-rose-400 font-bold">*</span>}
            </label>
            <div
                onClick={toggle}
                className={cn(
                    "w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-blue-200 shadow-sm",
                    isOpen && "border-blue-500 ring-4 ring-blue-500/5 bg-white shadow-md",
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
        instruments_eligibles: [] as string[],
        actif: true,
    });

    // Fetch type test data if editing
    const { data: typeTestData, isLoading: isLoadingTypeTest } = useQuery({
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
                instruments_eligibles: typeTestData.instruments_eligibles || [],
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
                instruments_eligibles: [],
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
            toast.success(selectedTypeTestId ? 'Protocole mis à jour' : 'Nouveau protocole enregistré');
            closeTypeTestModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la synchronisation');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    if (!isTypeTestModalOpen) return null;

    const isLegal = form.categorie_principale === 'Obligatoire';

    const criticalityStyle = [
        { level: 1, label: 'Stage N1', sub: 'Standard', color: 'bg-emerald-500 shadow-emerald-200' },
        { level: 2, label: 'Stage N2', sub: 'Modéré', color: 'bg-blue-500 shadow-blue-200' },
        { level: 3, label: 'Stage N3', sub: 'Important', color: 'bg-amber-500 shadow-amber-200' },
        { level: 4, label: 'Stage N4', sub: 'Critique', color: 'bg-rose-500 shadow-rose-200' }
    ];

    return (
        <AnimatePresence>
            {isTypeTestModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
                    {/* Innovative Glassmorphism Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
                    >
                        {/* Header Section (Synced with NC design) */}
                        <div className={cn(
                            "px-9 py-5 border-b border-slate-50 flex items-center justify-between relative overflow-hidden",
                            isLegal ? "bg-gradient-to-br from-indigo-50 to-white" : "bg-gradient-to-br from-blue-50 to-white"
                        )}>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={cn(
                                    "h-13 w-13 rounded-[18px] flex items-center justify-center shadow-2xl transition-all",
                                    isLegal ? "bg-indigo-600 shadow-indigo-100" : "bg-blue-600 shadow-blue-100"
                                )}>
                                    <Layers className="h-6.5 w-6.5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                        {selectedTypeTestId ? 'CONFIGURATION PROTOCOLE' : 'NIVEAU RÉFÉRENTIEL TEST'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">Protocol Specification Control System</p>
                                </div>
                            </div>
                            <button type="button" onClick={closeTypeTestModal} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-slate-50 rounded-xl transition-all shadow-sm group">
                                <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                            {isLoadingTypeTest ? (
                                <div className="h-96 flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                                        <div className="absolute top-0 w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin" />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Extraction du protocole...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-12 gap-10">

                                    {/* Left Column: Editor */}
                                    <div className="col-span-12 lg:col-span-8 space-y-8">
                                        {/* Basic Identification */}
                                        <div className="p-7 bg-slate-50 border border-slate-100 rounded-[25px] relative group focus-within:bg-white focus-within:border-blue-400 transition-all shadow-sm">
                                            <div className="absolute top-6 right-8 opacity-[0.05] group-focus-within:opacity-10 transition-opacity">
                                                <ClipboardList size={40} />
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px]">Identification du Référentiel</h4>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identifiant Technique *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Ex: VIBR-01"
                                                            className="w-full bg-transparent text-[13px] font-black text-slate-800 outline-none border-b border-slate-200 focus:border-blue-600 pb-2 placeholder:text-slate-300 transition-all"
                                                            value={form.code_type}
                                                            onChange={(e) => setForm({ ...form, code_type: e.target.value.toUpperCase() })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nom du Protocole *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Ex: Analyse de Vibration"
                                                            className="w-full bg-transparent text-[13px] font-black text-slate-800 outline-none border-b border-slate-200 focus:border-blue-600 pb-2 placeholder:text-slate-300 transition-all"
                                                            value={form.libelle}
                                                            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Configuration Block */}
                                        <div className="p-7 bg-slate-50 border border-slate-100 rounded-[25px] relative group focus-within:bg-white transition-all shadow-sm">
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px]">Configuration & Sévérité</h4>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <PortalDropdown
                                                        label="Catégorie Majeure"
                                                        icon={Layers}
                                                        placeholder="Sélectionner..."
                                                        options={[
                                                            { value: 'Standard', label: 'Standard (Maintenance)' },
                                                            { value: 'Obligatoire', label: 'Réglementaire (Légal)' }
                                                        ]}
                                                        value={form.categorie_principale}
                                                        onChange={(v) => setForm(p => ({ ...p, categorie_principale: v }))}
                                                        required
                                                    />

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><Clock size={11} /> Fréquence (M)</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 bg-white/50 border border-slate-100 rounded-xl text-[12px] font-black text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                                                placeholder="Ex: 6"
                                                                value={form.frequence_recommandee}
                                                                onChange={(e) => setForm({ ...form, frequence_recommandee: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><Activity size={11} /> Durée (J)</label>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                className="w-full px-4 py-2 bg-white/50 border border-slate-100 rounded-xl text-[12px] font-black text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                                                placeholder="0.5"
                                                                value={form.duree_estimee_jours}
                                                                onChange={(e) => setForm({ ...form, duree_estimee_jours: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Criticité Automatique (Alert Stage)</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {criticalityStyle.map((s) => (
                                                            <button
                                                                key={s.level}
                                                                type="button"
                                                                onClick={() => setForm({ ...form, niveau_criticite_defaut: s.level })}
                                                                className={cn(
                                                                    "relative py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5",
                                                                    form.niveau_criticite_defaut === s.level
                                                                        ? "bg-slate-900 border-slate-900 shadow-xl"
                                                                        : "bg-white border-white text-slate-400 hover:border-slate-100 shadow-sm"
                                                                )}
                                                            >
                                                                <span className={cn(
                                                                    "text-[10px] font-black transition-colors uppercase",
                                                                    form.niveau_criticite_defaut === s.level ? "text-white" : "text-slate-700"
                                                                )}>
                                                                    {s.label}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[8px] font-bold uppercase tracking-tighter opacity-60",
                                                                    form.niveau_criticite_defaut === s.level ? "text-slate-400" : "text-slate-300"
                                                                )}>
                                                                    {s.sub}
                                                                </span>
                                                                {form.niveau_criticite_defaut === s.level && (
                                                                    <div className={cn("absolute bottom-0 h-1 w-[40%] rounded-full mb-0.5", s.color)} />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Methodology */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80 mt-1">
                                                <CornerDownRight className="h-3 w-3 text-blue-500" /> Méthodologie & Spécifications Contrôle
                                            </label>
                                            <textarea
                                                rows={5}
                                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[25px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white focus:border-blue-500 transition-all resize-none shadow-inner font-mono"
                                                placeholder="Détaillez les étapes critiques du contrôle technique..."
                                                value={form.description}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: Asset Selection & Meta */}
                                    <div className="col-span-12 lg:col-span-4 space-y-9">
                                        {/* Asset Selection (Synced design) */}
                                        <div className="p-7 bg-white border border-slate-100 rounded-[30px] shadow-sm flex flex-col h-full max-h-[480px]">
                                            <div className="flex items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                        <Activity size={18} />
                                                    </div>
                                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Compatibilité</h3>
                                                </div>
                                                <div className="h-6 w-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                                                    {form.equipements_eligibles.length}
                                                </div>
                                            </div>

                                            <div className="relative mb-5">
                                                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                <select
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest appearance-none outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all shadow-sm"
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        if (selectedId && !form.equipements_eligibles.includes(selectedId)) {
                                                            setForm({ ...form, equipements_eligibles: [...form.equipements_eligibles, selectedId] });
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                >
                                                    <option value="">Ajouter une machine...</option>
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

                                            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1">
                                                {form.equipements_eligibles.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                        <Info className="h-7 w-7 text-slate-300 mb-3" />
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed max-w-[150px]">
                                                            Accès Universel. Protocole disponible pour tout le parc machine.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    form.equipements_eligibles.map(eqId => {
                                                        const eq = creationData?.equipements?.find((e: any) => e.id_equipement === eqId);
                                                        if (!eq) return null;
                                                        return (
                                                            <div
                                                                key={eqId}
                                                                className="group/tag flex items-center justify-between gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 transition-all shadow-sm"
                                                            >
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[10px] font-black text-slate-800 truncate">{eq.designation}</span>
                                                                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-tighter">{eq.code_equipement}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newEligibles = form.equipements_eligibles.filter(id => id !== eqId);
                                                                        setForm({ ...form, equipements_eligibles: newEligibles });
                                                                    }}
                                                                    className="p-1.5 opacity-0 group-hover/tag:opacity-100 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        {/* Instrument Selection (New) */}
                                        <div className="p-7 bg-white border border-slate-100 rounded-[30px] shadow-sm flex flex-col h-full max-h-[480px]">
                                            <div className="flex items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                        <Activity size={18} />
                                                    </div>
                                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Instrumentation</h3>
                                                </div>
                                                <div className="h-6 w-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                                                    {form.instruments_eligibles.length}
                                                </div>
                                            </div>

                                            <div className="relative mb-5">
                                                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                <select
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest appearance-none outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all shadow-sm"
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        if (selectedId && !form.instruments_eligibles.includes(selectedId)) {
                                                            setForm({ ...form, instruments_eligibles: [...form.instruments_eligibles, selectedId] });
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                >
                                                    <option value="">Ajouter un instrument...</option>
                                                    {creationData?.instruments?.map((ins: any) => (
                                                        <option
                                                            key={ins.id_instrument}
                                                            value={ins.id_instrument}
                                                            disabled={form.instruments_eligibles.includes(ins.id_instrument)}
                                                        >
                                                            [{ins.numero_serie}] {ins.designation}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1">
                                                {form.instruments_eligibles.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                        <Activity className="h-7 w-7 text-slate-300 mb-3" />
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed max-w-[150px]">
                                                            Instrumentation libre. Aucune restriction sur le matériel de mesure.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    form.instruments_eligibles.map(insId => {
                                                        const ins = creationData?.instruments?.find((i: any) => i.id_instrument === insId);
                                                        if (!ins) return null;
                                                        return (
                                                            <div
                                                                key={insId}
                                                                className="group/tag flex items-center justify-between gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-emerald-200 transition-all shadow-sm"
                                                            >
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[10px] font-black text-slate-800 truncate">{ins.designation}</span>
                                                                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-tighter">N° {ins.numero_serie}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newEligibles = form.instruments_eligibles.filter(id => id !== insId);
                                                                        setForm({ ...form, instruments_eligibles: newEligibles });
                                                                    }}
                                                                    className="p-1.5 opacity-0 group-hover/tag:opacity-100 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Toggle Block */}
                                        <div className="p-6 bg-slate-900 rounded-[30px] shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 h-24 w-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl transition-transform group-hover:scale-110 duration-1000" />
                                            <div className="relative flex flex-col gap-6">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Cycle de Vie</h4>
                                                    <Settings size={14} className="text-blue-500" />
                                                </div>

                                                <div
                                                    className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/[0.08] transition-all"
                                                    onClick={() => setForm({ ...form, actif: !form.actif })}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Statut Archivage</span>
                                                        <span className={cn("text-xs font-black uppercase tracking-widest", form.actif ? "text-emerald-400" : "text-slate-500")}>
                                                            {form.actif ? 'OPÉRATIONNEL' : 'OBSOLÈTE'}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-10 h-6 rounded-full p-1 transition-all duration-500",
                                                        form.actif ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-slate-700"
                                                    )}>
                                                        <div className={cn(
                                                            "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md transform",
                                                            form.actif ? "translate-x-4" : "translate-x-0"
                                                        )} />
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                                    <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                                    <p className="text-[9px] text-blue-100 font-bold leading-relaxed uppercase tracking-tight">
                                                        Un protocole désactivé entraîne la suspension automatique de tous les tests non-exécutés qui y sont liés.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Footer Actions (Synced with NC) */}
                        <div className="px-10 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={closeTypeTestModal}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all"
                            >
                                Abandonner
                            </button>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={mutation.isPending}
                                    className={cn(
                                        "group h-13 px-12 rounded-xl text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-3 transition-all duration-500 relative shadow-2xl active:scale-[0.98]",
                                        mutation.isPending
                                            ? "bg-slate-100 text-slate-300 pointer-events-none"
                                            : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 ring-4 ring-blue-500/10"
                                    )}
                                >
                                    {mutation.isPending ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {selectedTypeTestId ? 'Mettre à jour' : 'Créer le Protocole'}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

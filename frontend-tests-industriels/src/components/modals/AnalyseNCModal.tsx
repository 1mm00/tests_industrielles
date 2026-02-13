import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    X,
    Plus,
    Trash2,
    ChevronDown,
    Zap,
    Target,
    Activity,
    ArrowRight,
    FileText,
    ShieldAlert,
    Layers,
    Terminal
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

interface CauseRacine {
    categorie: string;
    description: string;
    probabilite: 'FAIBLE' | 'POSSIBLE' | 'PROBABLE' | 'CERTAIN';
    impact: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
    validee: boolean;
}

// --- Custom Portal Dropdown (Reused from NcCreationModal) ---
function PortalDropdown({
    label,
    icon: Icon,
    options,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    color = "orange"
}: {
    label: string,
    icon: any,
    options: { value: string, label: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    required?: boolean,
    error?: string,
    color?: "orange" | "rose" | "blue"
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
    const activeColor = color === "orange" ? "orange" : color === "blue" ? "blue" : "rose";

    return (
        <div className="space-y-1 relative w-full" ref={containerRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 mt-1">
                <Icon className={cn("h-3 w-3", activeColor === "orange" ? "text-orange-500/80" : activeColor === "blue" ? "text-blue-500/80" : "text-rose-500/80")} />
                {label} {required && <span className="text-orange-400 font-bold">*</span>}
            </label>
            <div
                onClick={toggle}
                className={cn(
                    "w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-orange-200 shadow-sm",
                    isOpen && cn("border-orange-500 ring-4 ring-orange-500/5 bg-white shadow-md"),
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
                                        "px-4.5 py-2.5 text-[11.5px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors",
                                        value === opt.value && "bg-orange-50/50 text-orange-600"
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

export default function AnalyseNCModal() {
    const queryClient = useQueryClient();
    const { isAnalyseNcModalOpen, closeAnalyseNcModal, selectedNcId } = useModalStore();

    const [causes, setCauses] = useState<CauseRacine[]>([
        {
            categorie: 'HUMAINE',
            description: '',
            probabilite: 'POSSIBLE',
            impact: 'MOYEN',
            validee: false,
        },
    ]);
    const [conclusions, setConclusions] = useState('');

    const { data: nc } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isAnalyseNcModalOpen,
    });

    useEffect(() => {
        if (nc?.causes_racines && nc.causes_racines.length > 0) {
            setCauses(nc.causes_racines.map((c: any) => ({
                categorie: c.categorie,
                description: c.description,
                probabilite: c.probabilite_recurrence_pct <= 25 ? 'FAIBLE' :
                    (c.probabilite_recurrence_pct <= 50 ? 'POSSIBLE' :
                        (c.probabilite_recurrence_pct <= 75 ? 'PROBABLE' : 'CERTAIN')),
                impact: 'MOYEN', // Default if missing
                validee: true
            })));
            setConclusions(nc.conclusions || '');
        } else {
            setCauses([
                {
                    categorie: 'HUMAINE',
                    description: '',
                    probabilite: 'POSSIBLE',
                    impact: 'MOYEN',
                    validee: false,
                },
            ]);
            setConclusions('');
        }
    }, [nc, isAnalyseNcModalOpen]);

    const createMutation = useMutation({
        mutationFn: (data: any) => ncService.analyserNc(selectedNcId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            closeAnalyseNcModal();
            toast.success('Analyse enregistrée avec succès !', {
                icon: '🔍',
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement', {
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        }
    });

    const ajouterCause = () => {
        setCauses([
            ...causes,
            {
                categorie: 'HUMAINE',
                description: '',
                probabilite: 'POSSIBLE',
                impact: 'MOYEN',
                validee: false,
            },
        ]);
    };

    const supprimerCause = (index: number) => {
        setCauses(causes.filter((_c, i) => i !== index));
    };

    const updateCause = (index: number, field: keyof CauseRacine, value: any) => {
        const newCauses = [...causes];
        newCauses[index] = { ...newCauses[index], [field]: value };
        setCauses(newCauses);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const causesValides = causes.filter(c => c.description.trim() !== '');
        if (causesValides.length === 0) {
            toast.error('Veuillez ajouter au moins une cause racine', {
                style: { borderRadius: '12px', fontWeight: 'bold', fontSize: '11px' }
            });
            return;
        }

        createMutation.mutate({
            causes_racines: causesValides,
            conclusions,
        });
    };

    if (!isAnalyseNcModalOpen) return null;

    const categoriesOptions = [
        { value: 'HUMAINE', label: 'Main-d\'œuvre (Humaine)' },
        { value: 'MATERIELLE', label: 'Matériel (Équipement)' },
        { value: 'METHODE', label: 'Méthode (Procédure)' },
        { value: 'MILIEU', label: 'Milieu (Environnement)' },
        { value: 'MATIERE', label: 'Matière (Composants)' },
        { value: 'AUTRE', label: 'Autre' },
    ];

    const probabilitesOptions = [
        { value: 'FAIBLE', label: 'Probabilité: Faible' },
        { value: 'POSSIBLE', label: 'Probabilité: Possible' },
        { value: 'PROBABLE', label: 'Probabilité: Probable' },
        { value: 'CERTAIN', label: 'Probabilité: Certaine' },
    ];

    const impactsOptions = [
        { value: 'FAIBLE', label: 'Impact: Faible' },
        { value: 'MOYEN', label: 'Impact: Moyen' },
        { value: 'ELEVE', label: 'Impact: Élevé' },
        { value: 'CRITIQUE', label: 'Impact: Critique' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="px-9 py-5 bg-gradient-to-br from-orange-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-13 w-13 rounded-[18px] bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-100/50">
                            <Target className="h-6.5 w-6.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                ANALYSE CAUSES RACINES
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">
                                NC: <span className="text-orange-600">{nc?.numero_nc || 'Chargement...'}</span> • Méthodologie 5M
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={closeAnalyseNcModal} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-orange-50 hover:border-orange-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 2px, transparent 0)', backgroundSize: '18px 18px' }} />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                    <div className="grid grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Causes List */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[2px] flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-orange-500" />
                                    Causes Racines (Méthode 5M)
                                </h3>
                                <button
                                    onClick={ajouterCause}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Plus className="h-3 w-3" /> Ajouter un facteur
                                </button>
                            </div>

                            <div className="space-y-4">
                                {causes.map((cause, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={index}
                                        className="p-6 bg-slate-50/50 border border-slate-100 rounded-[24px] relative group hover:bg-white hover:border-orange-100 transition-all"
                                    >
                                        {causes.length > 1 && (
                                            <button
                                                onClick={() => supprimerCause(index)}
                                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-2 gap-6">
                                            <PortalDropdown
                                                label="Catégorie (5M)"
                                                icon={Terminal}
                                                placeholder="Sélectionner..."
                                                options={categoriesOptions}
                                                value={cause.categorie}
                                                onChange={(v) => updateCause(index, 'categorie', v)}
                                            />
                                            <div className="flex items-end pb-1 px-2">
                                                <label className="flex items-center gap-3 cursor-pointer group/check">
                                                    <div className={cn(
                                                        "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                        cause.validee ? "bg-orange-500 border-orange-500 shadow-lg" : "bg-white border-slate-200"
                                                    )}>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={cause.validee}
                                                            onChange={(e) => updateCause(index, 'validee', e.target.checked)}
                                                        />
                                                        {cause.validee && <Zap className="h-3 w-3 text-white fill-current" />}
                                                    </div>
                                                    <span className={cn("text-[11px] font-black uppercase tracking-widest", cause.validee ? "text-orange-600" : "text-slate-400 group-hover/check:text-slate-600")}>
                                                        Cause validée par l'équipe
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80">
                                                <FileText className="h-3 w-3 text-orange-500/70" /> Description de la cause
                                            </label>
                                            <textarea
                                                rows={2}
                                                className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-medium text-slate-700 outline-none focus:border-orange-500 transition-all resize-none shadow-inner"
                                                placeholder="Expliquez en détail l'origine de l'écart..."
                                                value={cause.description}
                                                onChange={(e) => updateCause(index, 'description', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mt-4">
                                            <PortalDropdown
                                                label="Probabilité"
                                                icon={Activity}
                                                placeholder="Sélectionner..."
                                                options={probabilitesOptions}
                                                value={cause.probabilite}
                                                onChange={(v) => updateCause(index, 'probabilite', v)}
                                            />
                                            <PortalDropdown
                                                label="Impact"
                                                icon={ShieldAlert}
                                                placeholder="Sélectionner..."
                                                options={impactsOptions}
                                                value={cause.impact}
                                                onChange={(v) => updateCause(index, 'impact', v)}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Synthesis */}
                        <div className="col-span-12 lg:col-span-4 space-y-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-7 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[2px] flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-orange-500" />
                                        Conclusions de l'analyse
                                    </h4>
                                    <p className="text-[10.5px] font-medium text-slate-400 leading-relaxed uppercase">
                                        Résumez les conclusions de l'équipe et suggérez les prochaines étapes.
                                    </p>
                                    <textarea
                                        rows={8}
                                        className="w-full p-5 bg-white border border-slate-100 rounded-[24px] text-[12px] font-bold text-slate-700 outline-none focus:border-orange-500 transition-all resize-none shadow-inner"
                                        placeholder="Synthèse de l'analyse..."
                                        value={conclusions}
                                        onChange={(e) => setConclusions(e.target.value)}
                                    />
                                </div>

                                <div className="p-5 bg-orange-600/5 rounded-2xl border border-orange-500/10 space-y-3">
                                    <h5 className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" /> Rappel Méthodologique
                                    </h5>
                                    <p className="text-[9.5px] font-bold text-slate-600/80 leading-snug">
                                        Une analyse correcte doit isoler la cause racine réelle et non seulement les symptômes apparents.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-9 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={closeAnalyseNcModal} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        Fermer sans enregistrer
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className={cn(
                            "group h-13 px-13 rounded-xl text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-3 transition-all duration-500 relative shadow-2xl overflow-hidden active:scale-[0.98]",
                            createMutation.isPending
                                ? "bg-slate-100 text-slate-300 pointer-events-none grayscale"
                                : "bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700 ring-4 ring-orange-500/10"
                        )}
                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Enregistrement...</span>
                            </>
                        ) : (
                            <>
                                Enregistrer l'analyse
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Wrench,
    X,
    Calendar,
    RefreshCw,
    Settings,
    Shield,
    ChevronDown,
    Zap,
    ArrowRight,
    FileText,
    History,
    DollarSign
} from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

// --- Custom Portal Dropdown (Same as NcCreationModal) ---
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
                <Icon className="h-3 w-3 text-indigo-500/80" />
                {label} {required && <span className="text-rose-400 font-bold">*</span>}
            </label>
            <div
                onClick={toggle}
                className={cn(
                    "w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-indigo-200 shadow-sm",
                    isOpen && "border-indigo-500 ring-4 ring-indigo-500/5 bg-white shadow-md",
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
                                        "px-4.5 py-2.5 text-[11.5px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors",
                                        value === opt.value && "bg-indigo-50/50 text-indigo-600"
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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MaintenanceCreationModal({ isOpen, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const [form, setForm] = useState({
        equipement_id: '',
        titre: '',
        description: '',
        type: 'PREVENTIVE',
        priorite: 'MOYENNE',
        date_prevue: new Date().toISOString().split('T')[0],
        periodicite_jours: '',
        cout_estime: ''
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Charger les équipements pour le select
    const { data: equipements } = useQuery({
        queryKey: ['equipements-list'],
        queryFn: async () => {
            const res = await api.get('/equipements');
            return res.data.data;
        },
        enabled: isOpen
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/maintenances', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenances'] });
            queryClient.invalidateQueries({ queryKey: ['maintenances/stats'] });
            toast.success('Entretien planifié avec succès !', {
                icon: '🛠️',
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.message || 'Échec de la planification'}`, {
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        }
    });

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const errors: Record<string, string> = {};
        if (!form.equipement_id) errors.equipement_id = "L'équipement est obligatoire";
        if (!form.titre) errors.titre = "Le titre est obligatoire";
        if (!form.date_prevue) errors.date_prevue = "La date est obligatoire";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        createMutation.mutate(form);
    };

    if (!isOpen) return null;

    const maintenanceTypes = [
        { value: 'PREVENTIVE', label: 'Préventive (ISO 9001)' },
        { value: 'CURATIVE', label: 'Curative (Réparation)' },
        { value: 'CALIBRATION', label: 'Calibration Métrologie' },
    ];

    const isFormValid = form.equipement_id && form.titre && form.date_prevue;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="px-9 py-5 bg-gradient-to-br from-indigo-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-13 w-13 rounded-[18px] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-100">
                            <Wrench className="h-6.5 w-6.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                PLANIFIER MAINTENANCE
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">GMAO & Preventive Strategy</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 2px, transparent 0)', backgroundSize: '18px 18px' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                    <div className="grid grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Main Details */}
                        <div className="col-span-12 lg:col-span-8 space-y-7">

                            <div className="grid grid-cols-2 gap-8 mt-1">
                                <PortalDropdown
                                    label="Équipement Cible"
                                    icon={Settings}
                                    placeholder="Sélectionner l'équipement..."
                                    options={equipements?.map((eq: any) => ({ value: eq.id_equipement, label: `[${eq.code_equipement}] ${eq.designation}` })) || []}
                                    value={form.equipement_id}
                                    onChange={(v) => {
                                        setForm(p => ({ ...p, equipement_id: v }));
                                        if (validationErrors.equipement_id) setValidationErrors(prev => ({ ...prev, equipement_id: '' }));
                                    }}
                                    required
                                    error={validationErrors.equipement_id}
                                />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 mt-1">
                                        <FileText className="h-3 w-3 text-indigo-500/80" />
                                        Titre de l'intervention *
                                    </label>
                                    <input
                                        className={cn(
                                            "w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none hover:bg-white focus:bg-white focus:border-indigo-500 transition-all shadow-sm",
                                            validationErrors.titre && "border-rose-300 bg-rose-50/20"
                                        )}
                                        placeholder="Ex: Vidange annuelle..."
                                        value={form.titre}
                                        onChange={(e) => {
                                            setForm(p => ({ ...p, titre: e.target.value }));
                                            if (validationErrors.titre) setValidationErrors(prev => ({ ...prev, titre: '' }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <PortalDropdown
                                    label="Type d'Intervention"
                                    icon={Zap}
                                    placeholder="Choisir le type..."
                                    options={maintenanceTypes}
                                    value={form.type}
                                    onChange={(v) => setForm(p => ({ ...p, type: v }))}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-200 transition-all shadow-sm">
                                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                                            <Calendar className="h-2.5 w-2.5" /> Date prévue
                                        </span>
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-[12px] font-bold text-slate-800 outline-none"
                                            value={form.date_prevue}
                                            onChange={(e) => setForm(p => ({ ...p, date_prevue: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-200 transition-all shadow-sm">
                                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                                            <RefreshCw className="h-2.5 w-2.5" /> Récurrence (j)
                                        </span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent text-[12px] font-bold text-slate-800 outline-none"
                                            placeholder="Ex: 30"
                                            value={form.periodicite_jours}
                                            onChange={(e) => setForm(p => ({ ...p, periodicite_jours: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 mt-1">
                                    <History className="h-3 w-3 text-indigo-500" /> Description technique détaillée
                                </label>
                                <textarea
                                    rows={5}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white focus:border-indigo-500 transition-all resize-none shadow-inner"
                                    placeholder="Précisez les opérations à effectuer, les points de contrôle, les pièces nécessaires..."
                                    value={form.description}
                                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Priority & Costs */}
                        <div className="col-span-12 lg:col-span-4 space-y-9 mt-1">

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <Shield className="h-3 w-3 text-indigo-500" /> Niveau de Priorité
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, priorite: p }))}
                                            className={cn(
                                                "w-full px-4.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between",
                                                form.priorite === p
                                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                                                    : "bg-white border-white text-slate-400 hover:border-slate-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-2.5 w-2.5 rounded-full",
                                                    p === 'BASSE' ? "bg-emerald-500" :
                                                        p === 'MOYENNE' ? "bg-amber-500" :
                                                            p === 'HAUTE' ? "bg-orange-500" :
                                                                "bg-rose-500"
                                                )} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">{p}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <DollarSign className="h-3 w-3 text-indigo-500" /> Estimation Budgétaire
                                </h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-500 transition-all shadow-inner group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-focus-within:bg-indigo-50 transition-colors">
                                            <span className="text-lg font-black text-indigo-500">€</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Coût estimatif (HT)</p>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-[16px] font-black text-slate-800 outline-none placeholder:text-slate-300"
                                                placeholder="0.00"
                                                value={form.cout_estime}
                                                onChange={(e) => setForm(p => ({ ...p, cout_estime: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Current User Display (Same as NC modal) */}
                            {user && (
                                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center gap-3 group">
                                    <div className="relative">
                                        <div className="h-11 w-11 rounded-full bg-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-[15px] font-black text-white relative z-10 transition-transform group-hover:scale-110">
                                            {user.nom?.[0] || 'U'}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-indigo-900 border-2 border-white flex items-center justify-center text-white shadow-lg z-20">
                                            <Shield className="h-2 w-2 fill-current" />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10.5px] font-black text-slate-800 leading-none">
                                            Demandeur: {user.nom} {user.prenom}
                                        </p>
                                        <p className="text-[8.5px] font-black text-indigo-600 uppercase tracking-[1.2px]">
                                            {user.fonction || 'Responsable Maintenance'}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </form>

                <div className="px-9 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        Abandonner
                    </button>
                    <div className="flex items-center gap-7">
                        {!isFormValid && (
                            <motion.div
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-rose-500"
                            >
                                <Zap className="h-3.5 w-3.5" />
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
                                    : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 ring-4 ring-indigo-500/10"
                            )}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Traitement...</span>
                                </>
                            ) : (
                                <>
                                    Planifier l'Intervention
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

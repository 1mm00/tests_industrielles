import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    X,
    Plus,
    Trash2,
    ChevronDown,
    Zap,
    Target,
    Activity,
    ArrowRight,
    FileText,
    Shield,
    Users,
    Calendar,
    Layout,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

interface ActionCorrective {
    type_action: string;
    description: string;
    responsable_id: string;
    date_prevue: string;
    priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
}

// --- Custom Portal Dropdown ---
function PortalDropdown({
    label,
    icon: Icon,
    options,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    color = "blue"
}: {
    label: string,
    icon: any,
    options: { value: string, label: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    required?: boolean,
    error?: string,
    color?: "blue" | "rose" | "orange"
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
                <Icon className={cn("h-3 w-3", color === "blue" ? "text-blue-500/80" : "text-rose-500/80")} />
                {label} {required && <span className="text-blue-400 font-bold">*</span>}
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
                        initial={{ opacity: 0, scale: 0.98, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 4 }}
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

export default function PlanActionModal() {
    const queryClient = useQueryClient();
    const { isPlanActionModalOpen, closePlanActionModal, selectedNcId } = useModalStore();

    const [form, setForm] = useState({
        responsable_id: '',
        date_echeance: '',
        priorite: 'NORMALE' as const,
        objectifs: '',
    });

    const [actions, setActions] = useState<ActionCorrective[]>([
        {
            type_action: 'CORRECTIVE_IMMEDIATE',
            description: '',
            responsable_id: '',
            date_prevue: '',
            priorite: 'NORMALE',
        },
    ]);

    const [personnels, setPersonnels] = useState<any[]>([]);

    const { data: nc } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isPlanActionModalOpen,
    });

    useEffect(() => {
        const fetchPersonnels = async () => {
            try {
                const data = await ncService.getCreationData();
                setPersonnels(data.personnels || []);
            } catch (error) {
                console.error("Error fetching creation data", error);
            }
        };
        if (isPlanActionModalOpen) {
            fetchPersonnels();
        }
    }, [isPlanActionModalOpen]);

    useEffect(() => {
        if (nc?.plan_action) {
            setForm({
                responsable_id: nc.plan_action.responsable_id || '',
                date_echeance: nc.plan_action.date_echeance || '',
                priorite: (nc.plan_action.priorite as any) || 'NORMALE',
                objectifs: nc.plan_action.objectifs || '',
            });

            if (nc.plan_action.actions && nc.plan_action.actions.length > 0) {
                setActions(nc.plan_action.actions.map((a: any) => ({
                    type_action: a.type_action,
                    description: a.description,
                    responsable_id: a.responsable_id,
                    date_prevue: a.date_prevue,
                    priorite: a.priorite,
                })));
            }
        } else {
            setForm({
                responsable_id: '',
                date_echeance: '',
                priorite: 'NORMALE',
                objectifs: '',
            });
            setActions([
                {
                    type_action: 'CORRECTIVE_IMMEDIATE',
                    description: '',
                    responsable_id: '',
                    date_prevue: '',
                    priorite: 'NORMALE',
                },
            ]);
        }
    }, [nc, isPlanActionModalOpen]);

    const createMutation = useMutation({
        mutationFn: (data: any) => ncService.createPlanAction(selectedNcId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            closePlanActionModal();
            toast.success("Plan d'actions déployé !", {
                icon: '🎯',
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Erreur de création du plan");
        }
    });

    const ajouterAction = () => {
        setActions([...actions, {
            type_action: 'CORRECTIVE_IMMEDIATE',
            description: '',
            responsable_id: '',
            date_prevue: '',
            priorite: 'NORMALE',
        }]);
    };

    const supprimerAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const updateAction = (index: number, field: keyof ActionCorrective, value: any) => {
        const newActions = [...actions];
        newActions[index] = { ...newActions[index], [field]: value };
        setActions(newActions);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!form.responsable_id || !form.date_echeance) {
            toast.error("Veuillez remplir les informations générales");
            return;
        }

        const actionsValides = actions.filter(a => a.description.trim() !== '' && a.responsable_id && a.date_prevue);
        if (actionsValides.length === 0) {
            toast.error("Ajoutez au moins une action complète");
            return;
        }

        createMutation.mutate({ ...form, actions: actionsValides });
    };

    if (!isPlanActionModalOpen) return null;

    const actionTypesOptions = [
        { value: 'CORRECTIVE_IMMEDIATE', label: 'Corrective Immédiate' },
        { value: 'PREVENTIVE', label: 'Préventive' },
        { value: 'AMELIORATION', label: 'Amélioration' },
        { value: 'FORMATION', label: 'Formation' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'PROCEDURE', label: 'Modification Procédure' },
    ];

    const prioritesOptions = [
        { value: 'BASSE', label: 'Basse Priority' },
        { value: 'NORMALE', label: 'Normale' },
        { value: 'HAUTE', label: 'Haute' },
        { value: 'URGENTE', label: 'Urgente' },
    ];

    const personnelsOptions = personnels.map(p => ({ value: p.id_personnel, label: `${p.nom} ${p.prenom}` }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-9 py-5 bg-gradient-to-br from-blue-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-13 w-13 rounded-[18px] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-100/50">
                            <Target className="h-6.5 w-6.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                PLAN D'ACTIONS CORRECTIVES
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">
                                NC: <span className="text-blue-600">{nc?.numero_nc || '...'}</span> • Traitement & Résolution
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={closePlanActionModal} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 2px, transparent 0)', backgroundSize: '18px 18px' }} />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                    <div className="grid grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Actions List */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[2px] flex items-center gap-2">
                                    <Layout className="h-4 w-4 text-blue-500" />
                                    Actions Correctives
                                </h3>
                                <button
                                    onClick={ajouterAction}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Plus className="h-3 w-3" /> Nouvelle Action
                                </button>
                            </div>

                            <div className="space-y-4">
                                {actions.map((action, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={index}
                                        className="p-6 bg-slate-50/50 border border-slate-100 rounded-[24px] relative group hover:bg-white hover:border-blue-100 transition-all"
                                    >
                                        {actions.length > 1 && (
                                            <button
                                                onClick={() => supprimerAction(index)}
                                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-2 gap-6">
                                            <PortalDropdown
                                                label="Type d'action"
                                                icon={Activity}
                                                placeholder="Catégorie..."
                                                options={actionTypesOptions}
                                                value={action.type_action}
                                                onChange={(v) => updateAction(index, 'type_action', v)}
                                            />
                                            <PortalDropdown
                                                label="Priorité"
                                                icon={Zap}
                                                placeholder="Niveau..."
                                                options={prioritesOptions}
                                                value={action.priorite}
                                                onChange={(v) => updateAction(index, 'priorite', v)}
                                            />
                                        </div>

                                        <div className="mt-5 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80">
                                                <FileText className="h-3 w-3 text-blue-500/70" /> Description de l'Action *
                                            </label>
                                            <textarea
                                                rows={2}
                                                className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-medium text-slate-700 outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                                                placeholder="Que doit-on faire exactement ?"
                                                value={action.description}
                                                onChange={(e) => updateAction(index, 'description', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mt-4">
                                            <PortalDropdown
                                                label="Responsable *"
                                                icon={Users}
                                                placeholder="Choisir membre..."
                                                options={personnelsOptions}
                                                value={action.responsable_id}
                                                onChange={(v) => updateAction(index, 'responsable_id', v)}
                                            />
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 mt-1">
                                                    <Calendar className="h-3 w-3 text-blue-500/80" /> Date Prévue *
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4.5 py-2.5 bg-white border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                                    value={action.date_prevue}
                                                    onChange={(e) => updateAction(index, 'date_prevue', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: General Info */}
                        <div className="col-span-12 lg:col-span-4 space-y-7">
                            <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-7 space-y-6">
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[2px] flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-500" />
                                    Gestion du Plan
                                </h4>

                                <PortalDropdown
                                    label="Responsable du Plan *"
                                    icon={Users}
                                    placeholder="Superviseur..."
                                    options={personnelsOptions}
                                    value={form.responsable_id}
                                    onChange={(v) => setForm(p => ({ ...p, responsable_id: v }))}
                                />

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 mt-1">
                                        <Clock className="h-3 w-3 text-blue-500/80" /> Date d'Échéance *
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4.5 py-2.5 bg-white border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                        value={form.date_echeance}
                                        onChange={(e) => setForm(p => ({ ...p, date_echeance: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80 mt-1">
                                        <FileText className="h-3 w-3 text-blue-500/70" /> Objectifs du Plan
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-5 bg-white border border-slate-100 rounded-[24px] text-[12px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                                        placeholder="Critères de succès..."
                                        value={form.objectifs}
                                        onChange={(e) => setForm(p => ({ ...p, objectifs: e.target.value }))}
                                    />
                                </div>

                                <div className="p-5 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex items-start gap-4">
                                    <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <p className="text-[9.5px] font-bold text-slate-600/80 leading-snug pt-1">
                                        Assurez-vous que les dates des actions individuelles sont cohérentes avec l'échéance globale.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-9 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={closePlanActionModal} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className={cn(
                            "group h-13 px-13 rounded-xl text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-3 transition-all duration-500 relative shadow-2xl overflow-hidden active:scale-[0.98]",
                            createMutation.isPending
                                ? "bg-slate-100 text-slate-300 pointer-events-none grayscale"
                                : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 ring-4 ring-blue-500/10"
                        )}
                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Déploiement...</span>
                            </>
                        ) : (
                            <>
                                Créer le Plan
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

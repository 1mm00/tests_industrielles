import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    X,
    Save,
    CheckCircle,
    FileText,
    ArrowLeftRight,
    CornerDownRight,
    Info,
    Clock,
    History,
    Activity,
    MapPin
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn, formatDate } from '@/utils/helpers';
import { hasPermission, isLecteur } from '@/utils/permissions';

export default function NcEditModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isNcEditModalOpen, closeNcEditModal, selectedNcId } = useModalStore();

    const [form, setForm] = useState<any>({
        description: '',
        conclusions: '',
        statut: '',
    });

    const { data: nc, isLoading } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isNcEditModalOpen,
    });

    useEffect(() => {
        if (nc) {
            const data = nc as any;
            setForm({
                description: data.description || '',
                conclusions: data.conclusions || '',
                statut: data.statut || data.statutNc || 'OUVERTE',
            });
        }
    }, [nc]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => ncService.updateNc(selectedNcId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            toast.success('NC mise à jour avec succès');
            if (form.statut === 'CLOTUREE') {
                closeNcEditModal();
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(form);
    };

    const handleCloseNc = () => {
        if (!form.conclusions) {
            toast.error('Veuillez saisir des conclusions avant de clôturer');
            return;
        }
        updateMutation.mutate({ ...form, statut: 'CLOTUREE' });
    };

    if (!isNcEditModalOpen) return null;

    const data = nc as any;
    const isClosed = form.statut === 'CLOTUREE' || form.statut === 'RESOLUE';

    const criticalityColor: Record<string, string> = {
        'NC1': 'bg-emerald-500 shadow-emerald-500/50',
        'NC2': 'bg-blue-500 shadow-blue-500/50',
        'NC3': 'bg-amber-500 shadow-amber-500/50',
        'NC4': 'bg-rose-500 shadow-rose-500/50',
    };

    const currentCriticalityColor = criticalityColor[(data?.criticite?.code_niveau || 'NC1') as string] || 'bg-slate-500 shadow-slate-500/50';

    const criticalityLabel = data?.criticite?.libelle || 'MINEURE';

    return (
        <AnimatePresence>
            {isNcEditModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop with extreme blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeNcEditModal}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                    />

                    {/* Innovative Glassmorphism Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] border border-white/60"
                    >
                        {/* 1. Dynamic Header */}
                        <div className={cn(
                            "px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/50",
                            isClosed ? "bg-emerald-50/80" : "bg-rose-50/80"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12",
                                    isClosed ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                )}>
                                    {isClosed ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className={cn(
                                            "text-2xl font-black tracking-tighter uppercase leading-none",
                                            isClosed ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isClosed ? 'TRAITEMENT TERMINÉ' : 'MAINTENANCE & CORRECTION'}
                                        </h2>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/50 px-2 py-0.5 rounded-full border border-slate-200">
                                            {data?.numero_nc}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Édition assistée du rapport de non-conformité</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Neon Risk Badge */}
                                <div className="flex flex-col items-end">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Niveau d'urgence</p>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black tracking-[2px] text-white shadow-[0_0_15px] animate-pulse",
                                        currentCriticalityColor
                                    )}>
                                        {criticalityLabel}
                                    </div>
                                </div>
                                <button
                                    onClick={closeNcEditModal}
                                    className="p-2.5 bg-white shadow-sm border border-slate-200 rounded-2xl transition-all text-slate-400 hover:text-rose-500 hover:border-rose-100 group"
                                >
                                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 scrollbar-hide bg-gradient-to-b from-white/20 to-transparent">
                            {isLoading ? (
                                <div className="h-96 flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                                        <div className="absolute top-0 w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin" />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Extraction des métadonnées...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* Left Column: Editor */}
                                    <div className="lg:col-span-8 space-y-10">
                                        {/* Technical Observation Bloc - Description */}
                                        <div className="p-8 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-[2.5rem] relative group focus-within:border-blue-400 transition-all">
                                            <div className="absolute top-6 right-8 opacity-10 group-focus-within:opacity-30 transition-opacity">
                                                <FileText size={40} />
                                            </div>
                                            <div className="flex items-start gap-5">
                                                <CornerDownRight size={20} className="text-slate-300 mt-1 shrink-0" />
                                                <div className="space-y-4 flex-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic & Description de l'Écart</label>
                                                    <textarea
                                                        name="description"
                                                        rows={3}
                                                        className="w-full bg-transparent text-sm font-bold text-slate-700 leading-7 italic outline-none resize-none border-l-3 border-rose-500 pl-6 py-1 placeholder:text-slate-300"
                                                        placeholder="Veuillez détailler l'anomalie détectée..."
                                                        value={form.description}
                                                        onChange={handleInputChange}
                                                        disabled={isClosed || !hasPermission(user, 'non_conformites', 'update')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Action Bloc - Conclusions */}
                                        <div className="p-8 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-[2.5rem] relative group focus-within:border-emerald-400 transition-all shadow-sm">
                                            <div className="absolute top-6 right-8 opacity-10 group-focus-within:opacity-30 transition-opacity">
                                                <CheckCircle size={40} />
                                            </div>
                                            <div className="flex items-start gap-5">
                                                <CornerDownRight size={20} className="text-slate-300 mt-1 shrink-0" />
                                                <div className="space-y-4 flex-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        Conclusions & Plan d'Action Correctif
                                                        {isClosed && <span className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">ACTION TERMINÉE</span>}
                                                    </label>
                                                    <textarea
                                                        name="conclusions"
                                                        rows={6}
                                                        className="w-full bg-transparent text-sm font-black text-slate-800 leading-relaxed outline-none resize-none border-l-3 border-emerald-500 pl-6 py-1 placeholder:text-slate-300"
                                                        placeholder="Décrivez les causes racines et les actions de remédiation entreprises..."
                                                        value={form.conclusions}
                                                        onChange={handleInputChange}
                                                        disabled={isClosed || !hasPermission(user, 'non_conformites', 'update')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Picker Selector */}
                                        <div className="space-y-4 px-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                                                <Clock size={14} className="text-blue-500" />
                                                Flux de Travail (Workflow)
                                            </h4>
                                            <div className="flex flex-wrap gap-4">
                                                {['OUVERTE', 'TRAITEMENT', 'RESOLUE'].map(stat => (
                                                    <button
                                                        key={stat}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, statut: stat })}
                                                        disabled={isClosed || !hasPermission(user, 'non_conformites', 'update')}
                                                        className={cn(
                                                            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                                                            form.statut === stat
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            stat === 'OUVERTE' ? 'bg-rose-500' : stat === 'TRAITEMENT' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        )} />
                                                        {stat === 'TRAITEMENT' ? 'EN ANALYSE' : stat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Asset Info & Team */}
                                    <div className="lg:col-span-4 space-y-10">
                                        {/* Block Équipement Concerné */}
                                        <div className="p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm group">
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                    <Activity size={20} />
                                                </div>
                                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Actif de Production</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Désignation Technique</span>
                                                    <span className="text-sm font-black text-slate-900 truncate">{data?.equipement?.designation || 'Unit Standard'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Code Asset</span>
                                                        <span className="text-xs font-mono font-bold text-blue-600">{data?.equipement?.code_equipement || 'EQ-0000'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Localisation</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={12} className="text-rose-500" />
                                                            <span className="text-xs font-bold text-slate-700">{data?.equipement?.localisation_site || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Block Timeline & Tracability */}
                                        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                            <div className="absolute -right-4 -bottom-4 bg-white/5 h-32 w-32 rounded-full blur-3xl" />
                                            <div className="relative space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] flex items-center gap-2">
                                                    <History size={14} className="text-blue-400" />
                                                    Traçabilité
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase">Détection Initiale</span>
                                                        <span className="text-xs font-bold text-blue-200">
                                                            {data?.date_detection ? formatDate(data.date_detection) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase">Auteur Signalement</span>
                                                        <span className="text-xs font-black text-white">
                                                            {data?.responsable?.prenom} {data?.responsable?.nom}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 mt-1 italic">{data?.responsable?.email}</span>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase">Diagnostic Terminal</span>
                                                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-black rounded-full border border-rose-500/30">ID_{data?.id_non_conformite?.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role Specific Notice */}
                                        {isLecteur(user) && (
                                            <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                                                <Info className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                                                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                                                    Mode Consultation Uniquement. Vous n'avez pas les droits d'édition pour cette non-conformité.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            <button
                                onClick={closeNcEditModal}
                                className="flex items-center gap-2.5 px-6 py-3.5 text-slate-400 hover:text-slate-900 transition-all text-[10px] font-bold uppercase tracking-[2px] active:scale-95"
                            >
                                <ArrowLeftRight size={16} />
                                Retour au Terminal
                            </button>

                            <div className="flex items-center gap-4">
                                {!isLecteur(user) && !isClosed && (
                                    <>
                                        {hasPermission(user, 'non_conformites', 'update') && (
                                            <button
                                                onClick={handleSubmit}
                                                disabled={updateMutation.isPending}
                                                className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95 group disabled:opacity-50"
                                            >
                                                <Save size={14} className="group-hover:translate-y-px transition-transform" />
                                                Enregistrer les modifications
                                            </button>
                                        )}
                                        {hasPermission(user, 'non_conformites', 'close') && (
                                            <button
                                                onClick={handleCloseNc}
                                                disabled={updateMutation.isPending}
                                                className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center gap-3 active:scale-95 group disabled:opacity-50"
                                            >
                                                <CheckCircle size={14} className="group-hover:scale-110 transition-transform" />
                                                Clôturer définitivement
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    onClick={closeNcEditModal}
                                    className="p-3.5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                    title="Fermer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

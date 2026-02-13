import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    MapPin,
    Download,
    ShieldAlert,
    Activity,
    Mail,
    ArrowLeftRight,
    Info,
    AlertTriangle,
    CheckCircle,
    Target,
    Zap,
    Layers,
    ClipboardList,
    CheckSquare,
    Search,
    ShieldCheck,
    RotateCcw,
    Edit3,
    PlayCircle,
    Archive
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useQuery } from '@tanstack/react-query';
import { ncService } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import type { NonConformite } from '@/types';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function NcDetailsModal() {
    const {
        isNcDetailsModalOpen,
        closeNcDetailsModal,
        selectedNcId,
        openClotureNcModal,
        openVerificationModal,
        openReouvrirNcModal,
        openAnalyseNcModal,
        openPlanActionModal,
        openNcEditModal
    } = useModalStore();
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'ANALYSE' | 'PLAN'>('DETAILS');

    const { data: nc, isLoading } = useQuery<NonConformite>({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isNcDetailsModalOpen,
    });

    if (!isNcDetailsModalOpen) return null;

    const isClosed = (nc?.statut as string) === 'CLOTUREE' || (nc?.statut as string) === 'RESOLUE' || (nc?.statut as string) === 'Clôturé';

    const criticalityColor = {
        'NC1': 'bg-emerald-500 shadow-emerald-500/50',
        'NC2': 'bg-blue-500 shadow-blue-500/50',
        'NC3': 'bg-amber-500 shadow-amber-500/50',
        'NC4': 'bg-rose-500 shadow-rose-500/50',
    }[nc?.criticite?.code_niveau || 'NC1'] || 'bg-slate-500 shadow-slate-500/50';

    const criticalityLabel = nc?.criticite?.libelle || 'MINEURE';

    const handleExportPDF = () => {
        toast.error("Export PDF NC en cours de développement", {
            icon: '🚧',
            style: { borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }
        });
    };

    const tabs = [
        { id: 'DETAILS', label: 'Détails & Detection', icon: Info },
        { id: 'ANALYSE', label: 'Analyse 5M', icon: Search },
        { id: 'PLAN', label: 'Plan d\'Actions', icon: Target },
    ];

    return (
        <AnimatePresence>
            {isNcDetailsModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeNcDetailsModal}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh] border border-white/60"
                    >
                        {/* 1. Header with Tab Navigation */}
                        <div className="px-8 py-5 border-b border-slate-200/50 bg-white/40 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
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
                                                {nc?.statut || 'OUVERTE'}
                                            </h2>
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/50 px-2 py-0.5 rounded-full border border-slate-200">
                                                {nc?.numero_nc}
                                            </span>
                                            {nc?.is_archived && (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 border border-amber-200 shadow-sm animate-pulse">
                                                    <Archive size={12} /> Archivée
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Industrial Non-Conformity Lifecycle</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1 text-right">Critique</p>
                                        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black tracking-[2px] text-white shadow-lg", criticalityColor)}>
                                            {criticalityLabel}
                                        </div>
                                    </div>
                                    <button onClick={closeNcDetailsModal} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm group">
                                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs - Cumulative Visibility */}
                            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl self-start">
                                {tabs.filter(tab => {
                                    if (tab.id === 'DETAILS') return true;
                                    if (tab.id === 'ANALYSE') return nc?.causes_racines && nc.causes_racines.length > 0;
                                    if (tab.id === 'PLAN') return !!nc?.plan_action;
                                    return true;
                                }).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-all",
                                            activeTab === tab.id
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                        )}
                                    >
                                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "text-rose-500" : "text-slate-400")} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Content Area */}
                        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center space-y-4"
                                    >
                                        <div className="w-12 h-12 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Synchronisation...</p>
                                    </motion.div>
                                ) : activeTab === 'DETAILS' ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="grid grid-cols-12 gap-10"
                                    >
                                        {/* TECHNICAL DATA */}
                                        <div className="col-span-12 lg:col-span-8 space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[12.5px] font-bold text-slate-700">
                                                <div className="p-8 bg-white/60 border border-white rounded-[2rem] shadow-sm space-y-6">
                                                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 pb-4 border-b border-slate-100">
                                                        <Activity className="h-4 w-4 text-blue-500" /> Actif & Site
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter mb-1">Désignation</span>
                                                            <span className="text-slate-900 font-black">{nc?.equipement?.designation}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-slate-400 uppercase tracking-tighter mb-1">Code Asset</span>
                                                                <span className="text-blue-600 font-black">{nc?.equipement?.code_equipement}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-slate-400 uppercase tracking-tighter mb-1">Localisation</span>
                                                                <div className="flex items-center gap-1.5 text-slate-800">
                                                                    <MapPin className="h-3 w-3 text-rose-500" /> {nc?.equipement?.localisation_site}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-white/60 border border-white rounded-[2rem] shadow-sm space-y-6">
                                                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 pb-4 border-b border-slate-100">
                                                        <Calendar className="h-4 w-4 text-rose-500" /> Détection
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter mb-1">Date Constatée</span>
                                                            <span className="text-slate-900 font-black">{nc?.date_detection ? formatDate(nc.date_detection) : 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col pt-2">
                                                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter mb-1">Type d'écart</span>
                                                            <div className="flex items-center gap-1.5 text-indigo-600 font-black uppercase">
                                                                <Layers className="h-3 w-3" /> {nc?.type_nc}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-2">Description de l'Écart</h4>
                                                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
                                                    <p className="text-sm font-medium leading-relaxed opacity-90 relative z-10 italic">
                                                        "{nc?.description || 'Aucune description fournie.'}"
                                                    </p>
                                                </div>
                                            </div>

                                            {nc?.impact_potentiel && (
                                                <div className="p-8 bg-rose-50/50 border border-rose-100 rounded-[2.5rem] flex items-start gap-6">
                                                    <div className="h-12 w-12 bg-white rounded-2xl border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
                                                        <ShieldAlert className="h-6 w-6 text-rose-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h5 className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Impact Potentiel</h5>
                                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{nc.impact_potentiel}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* STATS & PERSONNEL */}
                                        <div className="col-span-12 lg:col-span-4 space-y-10">
                                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-8">
                                                <div className="space-y-4">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Acteurs Qualité</h5>
                                                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                                                        <div className="h-11 w-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                                                            {nc?.responsable?.nom?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{nc?.responsable?.prenom} {nc?.responsable?.nom}</p>
                                                            <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">{nc?.responsable?.fonction || 'Expert Qualité'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-5">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cycle de vie</h5>
                                                    <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                                        <div className="relative flex flex-col gap-1">
                                                            <div className="absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ouverture</span>
                                                            <span className="text-xs font-black text-slate-800">{nc?.created_at ? formatDate(nc.created_at) : '--'}</span>
                                                        </div>

                                                        <div className="relative flex flex-col gap-1">
                                                            <div className={cn(
                                                                "absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full transition-all",
                                                                nc?.causes_racines?.length ? "bg-blue-500 shadow-lg shadow-blue-100" : "bg-slate-200"
                                                            )} />
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase tracking-tighter",
                                                                nc?.causes_racines?.length ? "text-blue-500" : "text-slate-400"
                                                            )}>Expertise (5M)</span>
                                                            <span className="text-xs font-black text-slate-800">{nc?.causes_racines?.length ? 'Terminée' : 'En attente...'}</span>
                                                        </div>

                                                        <div className="relative flex flex-col gap-1">
                                                            <div className={cn(
                                                                "absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full transition-all",
                                                                nc?.plan_action ? "bg-violet-500 shadow-lg shadow-violet-100" : "bg-slate-200"
                                                            )} />
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase tracking-tighter",
                                                                nc?.plan_action ? "text-violet-500" : "text-slate-400"
                                                            )}>Planification</span>
                                                            <span className="text-xs font-black text-slate-800">{nc?.plan_action ? 'Approuvée' : 'À définir'}</span>
                                                        </div>

                                                        <div className="relative flex flex-col gap-1">
                                                            <div className={cn(
                                                                "absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full transition-all",
                                                                isClosed ? "bg-emerald-500 shadow-lg shadow-emerald-100" : (nc?.plan_action ? "bg-orange-500 animate-pulse ring-4 ring-orange-50" : "bg-slate-200")
                                                            )} />
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase tracking-tighter",
                                                                isClosed ? "text-emerald-500" : (nc?.plan_action ? "text-orange-500 font-black" : "text-slate-400")
                                                            )}>Clôture</span>
                                                            <span className="text-xs font-black text-slate-800">{isClosed ? formatDate(nc?.date_cloture!) : 'Étape finale'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : activeTab === 'ANALYSE' ? (
                                    <motion.div
                                        key="analyse"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="space-y-10"
                                    >
                                        {!nc?.causes_racines || nc.causes_racines.length === 0 ? (
                                            <div className="h-96 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                                                <div className="h-20 w-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center">
                                                    <Search className="h-10 w-10 text-slate-200" />
                                                </div>
                                                <div className="text-center">
                                                    <h5 className="text-lg font-black text-slate-900 uppercase tracking-tight">Analyse non effectuée</h5>
                                                    <p className="text-sm font-medium text-slate-400">Lancez l'analyse 5M pour identifier les causes racines.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-12 gap-10">
                                                <div className="col-span-12 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {nc.causes_racines.map((cause, i) => (
                                                        <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:translate-y-[-4px] transition-all group">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                <div className="h-9 w-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                                                    <Zap size={18} />
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase text-orange-600 tracking-[2px]">{cause.categorie}</span>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6 italic">"{cause.description}"</p>
                                                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase">Fiabilité</span>
                                                                <div className="h-2 flex-1 mx-4 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-orange-500 rounded-full"
                                                                        style={{ width: `${cause.probabilite_recurrence_pct}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-black text-orange-600">{cause.probabilite_recurrence_pct}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="col-span-12 p-8 bg-orange-600/5 border border-orange-500/20 rounded-[3rem] space-y-4">
                                                    <h5 className="text-[11px] font-black text-orange-600 uppercase tracking-[2px] flex items-center gap-2">
                                                        <ClipboardList className="h-4 w-4" /> Conclusions de l'Expert
                                                    </h5>
                                                    <p className="text-base font-bold text-slate-800 leading-relaxed">{nc.conclusions || "Aucune conclusion globale n'a encore été formalisée."}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="plan"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="space-y-10"
                                    >
                                        {!nc?.plan_action ? (
                                            <div className="h-96 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                                                <div className="h-20 w-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center">
                                                    <Target className="h-10 w-10 text-slate-300" />
                                                </div>
                                                <div className="text-center">
                                                    <h5 className="text-lg font-black text-slate-900 uppercase tracking-tight">Plan d'action manquant</h5>
                                                    <p className="text-sm font-medium text-slate-400">Définissez une stratégie corrective pour résoudre cette NC.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-12 gap-10">
                                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                                    <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl space-y-8 relative overflow-hidden">
                                                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
                                                        <div className="space-y-1">
                                                            <h5 className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Référence Plan</h5>
                                                            <h4 className="text-2xl font-black tracking-tighter">{nc.plan_action.numero_plan}</h4>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black opacity-60 uppercase">Pilote du Plan</span>
                                                                <span className="text-sm font-black">{nc.plan_action.responsable?.nom ? `${nc.plan_action.responsable.prenom} ${nc.plan_action.responsable.nom}` : 'Responsable désigné'}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black opacity-60 uppercase">Échéance de résolution</span>
                                                                <span className="text-sm font-black text-blue-200 uppercase">{formatDate(nc.plan_action.date_echeance)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-6 border-t border-white/10 flex items-center justify-between font-black">
                                                            <span className="text-[10px] uppercase">Progression</span>
                                                            <span className="text-lg">0%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Actions Correctives ({nc.plan_action.actions?.length || 0})</h5>
                                                    <div className="space-y-4">
                                                        {nc.plan_action.actions?.map((action, i) => (
                                                            <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6 hover:border-blue-200 transition-all">
                                                                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                                                    <CheckSquare className={cn("h-6 w-6", action.statut === 'TERMINE' ? "text-emerald-500" : "text-slate-300")} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">{action.type_action}</span>
                                                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Échéance: {formatDate(action.date_prevue)}</span>
                                                                    </div>
                                                                    <p className="text-sm font-black text-slate-800 truncate">{action.description}</p>
                                                                </div>
                                                                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-900 leading-none">{action.responsable?.nom}</p>
                                                                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 text-right">Responsable</p>
                                                                    </div>

                                                                    {!action.verification_efficacite && (action.statut === 'TERMINEE' || action.statut === 'REALISEE' || action.statut === 'FAITE') && (
                                                                        <button
                                                                            onClick={() => openVerificationModal(action.id_action, nc.id_non_conformite)}
                                                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-1.5"
                                                                        >
                                                                            <ShieldCheck size={12} />
                                                                            Vérifier l'efficacité
                                                                        </button>
                                                                    )}

                                                                    {action.verification_efficacite && (
                                                                        <div className={cn(
                                                                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                                            action.verification_efficacite.est_efficace
                                                                                ? "bg-green-50 text-green-700 border border-green-100"
                                                                                : "bg-red-50 text-red-700 border border-red-100"
                                                                        )}>
                                                                            <ShieldCheck size={12} />
                                                                            {action.verification_efficacite.est_efficace ? 'EFFICACE' : 'INEFFICACE'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. Footer Actions */}
                        <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={closeNcDetailsModal}
                                className="flex items-center gap-2.5 px-6 py-3.5 text-slate-400 hover:text-slate-900 transition-all text-[10px] font-bold uppercase tracking-[2px] active:scale-95"
                            >
                                <ArrowLeftRight size={16} /> Retour au Terminal
                            </button>


                            <div className="flex items-center gap-4">
                                {nc?.is_archived ? (
                                    <button
                                        onClick={handleExportPDF}
                                        className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center gap-3 active:scale-95 group"
                                    >
                                        <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Rapport PDF
                                    </button>
                                ) : (
                                    <>
                                        {/* ÉTAPE FINALE : CLÔTURÉE */}
                                        {isClosed ? (
                                            <>
                                                <button
                                                    onClick={() => nc && openReouvrirNcModal(nc.id_non_conformite)}
                                                    className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:from-amber-700 hover:to-amber-800 transition-all shadow-xl shadow-amber-100 flex items-center gap-3 active:scale-95 group"
                                                >
                                                    <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform text-amber-200" />
                                                    Réouvrir la NC
                                                </button>
                                                <button
                                                    onClick={handleExportPDF}
                                                    className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center gap-3 active:scale-95 group"
                                                >
                                                    <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Rapport PDF
                                                </button>
                                            </>
                                        ) : nc && (
                                            <>
                                                {/* ÉTAPE 1 : Déclaration (Aucune analyse) */}
                                                {nc && (!nc.causes_racines || nc.causes_racines.length === 0) && (
                                                    <>
                                                        <button
                                                            onClick={() => openNcEditModal(nc.id_non_conformite)}
                                                            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-slate-200 transition-all flex items-center gap-2.5 active:scale-95"
                                                        >
                                                            <Edit3 size={14} /> Modifier NC
                                                        </button>
                                                        <button
                                                            onClick={() => openAnalyseNcModal(nc.id_non_conformite)}
                                                            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:from-blue-700 hover:to-indigo-800 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95 group"
                                                        >
                                                            <Zap size={14} className="group-hover:scale-110 transition-transform" /> Lancer Analyse 5M
                                                        </button>
                                                    </>
                                                )}

                                                {/* ÉTAPE 2 : Expertise (Analyse faite, pas de plan) */}
                                                {nc?.causes_racines && nc.causes_racines.length > 0 && !nc.plan_action && (
                                                    <>
                                                        <button
                                                            onClick={() => openAnalyseNcModal(nc.id_non_conformite)}
                                                            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-slate-200 transition-all flex items-center gap-2.5 active:scale-95"
                                                        >
                                                            <Zap size={14} /> Modifier Analyse 5M
                                                        </button>
                                                        <button
                                                            onClick={() => openPlanActionModal(nc.id_non_conformite)}
                                                            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:from-violet-700 hover:to-purple-800 transition-all shadow-xl shadow-purple-100 flex items-center gap-3 active:scale-95 group"
                                                        >
                                                            <ClipboardList size={14} className="group-hover:translate-x-0.5 transition-transform" /> Élaborer Plan d'Action
                                                        </button>
                                                    </>
                                                )}

                                                {/* ÉTAPE 3 : Opérationnelle (Plan existant) */}
                                                {nc?.plan_action && (
                                                    <>
                                                        <button
                                                            onClick={() => openPlanActionModal(nc.id_non_conformite)}
                                                            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-slate-200 transition-all flex items-center gap-2.5 active:scale-95"
                                                        >
                                                            <ClipboardList size={14} /> Modifier Plan
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const actionsNonTerminees = nc.plan_action?.actions?.filter(
                                                                    (a: any) => !['TERMINEE', 'REALISEE', 'FAITE'].includes(a.statut)
                                                                ).length || 0;

                                                                if (actionsNonTerminees > 0) {
                                                                    toast.error(`Il reste ${actionsNonTerminees} action(s) à clôturer`, {
                                                                        icon: '⏳'
                                                                    });
                                                                    return;
                                                                }
                                                                openClotureNcModal(nc.id_non_conformite);
                                                            }}
                                                            className="px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 active:scale-95 group"
                                                        >
                                                            <PlayCircle size={14} className="group-hover:scale-110 transition-transform" /> Exécuter & Vérifier
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                <button className="p-3.5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                                    <Mail size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

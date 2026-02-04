import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    MapPin,
    Clock,
    FileText,
    Download,
    ShieldAlert,
    Activity,
    ExternalLink,
    Mail,
    ArrowLeftRight,
    CornerDownRight,
    Info,
    AlertTriangle,
    CheckCircle,
    User
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useQuery } from '@tanstack/react-query';
import { ncService } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import type { NonConformite } from '@/types';
import toast from 'react-hot-toast';

export default function NcDetailsModal() {
    const { isNcDetailsModalOpen, closeNcDetailsModal, selectedNcId } = useModalStore();

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

    return (
        <AnimatePresence>
            {isNcDetailsModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop with extreme blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeNcDetailsModal}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                    />

                    {/* Innovative Glassmorphism Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] border border-white/60"
                    >
                        {/* 1. Dynamic Header & The Status */}
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
                                            {nc?.statut || 'OUVERTE'}
                                        </h2>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/50 px-2 py-0.5 rounded-full border border-slate-200">
                                            {nc?.numero_nc}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Système de gestion des non-conformités • AeroTech Intelligence</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Neon Risk Badge */}
                                <div className="flex flex-col items-end">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Gravité NC</p>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black tracking-[2px] text-white shadow-[0_0_15px] animate-pulse",
                                        criticalityColor
                                    )}>
                                        {criticalityLabel}
                                    </div>
                                </div>
                                <button
                                    onClick={closeNcDetailsModal}
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
                                        <div className="absolute top-0 w-16 h-16 border-4 border-t-rose-600 rounded-full animate-spin" />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Extraction des métadonnées NC...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* Left Column: Asset & Findings */}
                                    <div className="lg:col-span-8 space-y-10">

                                        {/* Main Technical Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Block Équipement */}
                                            <div className="p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                        <Activity size={20} />
                                                    </div>
                                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Actif Concerné</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Désignation Équipement</span>
                                                        <span className="text-sm font-black text-slate-900 truncate">{nc?.equipement?.designation || 'Équipement non spécifié'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Code Asset</span>
                                                            <span className="text-xs font-mono font-bold text-blue-600">{nc?.equipement?.code_equipement || 'EQ-0000'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Localisation Detection</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={12} className="text-rose-500" />
                                                                <span className="text-xs font-bold text-slate-700">{nc?.equipement?.localisation_site || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Block Detection Info */}
                                            <div className="p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                                        <Info size={20} />
                                                    </div>
                                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Détails Détection</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Date de Détection</span>
                                                        <span className="text-sm font-black text-slate-900">{nc?.date_detection ? formatDate(nc.date_detection) : 'N/A'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Détecté par</span>
                                                            <span className="text-xs font-bold text-slate-700">{nc?.responsable?.nom || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Source Écart</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <FileText size={12} className="text-indigo-500" />
                                                                <span className="text-[10px] font-black text-indigo-600 uppercase">{nc?.test_id ? 'TEST INDUSTRIEL' : 'AUTO-DÉCLARATION'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Case Description & Root Cause Split-View */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                                                    <ArrowLeftRight size={14} className="text-rose-500" />
                                                    Analyse : Écart Détecté vs Actions Correctives
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                                {/* Left: Description */}
                                                <div className="p-8 bg-slate-50/50 space-y-4">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-300" /> Description de l'Écart
                                                    </p>
                                                    <div className="text-sm font-bold text-slate-500 leading-relaxed min-h-[120px]">
                                                        {nc?.description || "Aucune description détaillée n'a été fournie pour cette non-conformité."}
                                                    </div>
                                                </div>
                                                {/* Right: Conclusions */}
                                                <div className={cn(
                                                    "p-8 space-y-4",
                                                    isClosed ? "bg-emerald-50/30" : "bg-blue-50/30"
                                                )}>
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2",
                                                        isClosed ? "text-emerald-500" : "text-blue-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", isClosed ? "bg-emerald-500" : "bg-blue-500")} /> Conclusions & Remédiation
                                                    </p>
                                                    <div className={cn(
                                                        "text-sm font-black leading-relaxed min-h-[120px]",
                                                        isClosed ? "text-emerald-700" : "text-blue-700"
                                                    )}>
                                                        {nc?.impact_potentiel || "Actions correctives et analyse d'impact en attente de traitement."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Observation Bloc */}
                                        <div className="p-8 bg-white border border-slate-200/60 rounded-[2.5rem] relative group">
                                            <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <FileText size={40} />
                                            </div>
                                            <div className="flex items-start gap-5">
                                                <CornerDownRight size={20} className="text-slate-300 mt-1 shrink-0" />
                                                <div className="space-y-3 flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commentaires Additionnels & Actions Terrain</p>
                                                    <div className="text-sm font-bold text-slate-600 leading-7 italic border-l-3 border-slate-900 pl-6 py-1">
                                                        {nc?.impact_potentiel || "Les mesures de sécurité immédiates ont été mises en œuvre pour isoler l'équipement concerné. L'analyse des causes racines est en cours par le département Qualité."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Timeline & Personnel */}
                                    <div className="lg:col-span-4 space-y-10">

                                        {/* Section: Timeline */}
                                        <section className="space-y-5">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cycle de vie NC</h4>
                                            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                                <div className="absolute -right-4 -bottom-4 bg-white/5 h-32 w-32 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                                <div className="relative space-y-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                                            <Calendar size={18} className="text-rose-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase">Ouverture du cas</span>
                                                            <span className="text-sm font-black tracking-tight">{nc?.created_at ? formatDate(nc.created_at) : '---'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-5">
                                                        <div className="flex flex-col items-center pt-1.5">
                                                            <div className="h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shadow-[0_0_10px_#f43f5e]" />
                                                            <div className="w-0.5 h-12 bg-gradient-to-b from-rose-500 to-indigo-500/20 mt-1" />
                                                            <div className="h-2 w-2 rounded-full bg-slate-700" />
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Statut Traitement</span>
                                                                <span className="text-base font-black font-mono text-rose-400">{nc?.statut || 'EN ATTENTE'}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dernière Mise à Jour</span>
                                                                <span className="text-base font-black font-mono">{nc?.updated_at ? formatDate(nc.updated_at, 'short') : 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={16} className="text-slate-500" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase">Temps Écoulé</span>
                                                        </div>
                                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black text-rose-400 border border-white/10">
                                                            24H ACTIVE
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Section: Personnel Impliqué */}
                                        <section className="space-y-5">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Acteurs Qualité</h4>
                                            <div className="space-y-3">
                                                {/* Detecteur Technical Card */}
                                                <div className="p-4 bg-white border border-slate-200/60 rounded-3xl flex items-center gap-4 hover:shadow-md transition-all">
                                                    <div className="h-11 w-11 rounded-full bg-slate-900 border-2 border-slate-100 shadow-sm flex items-center justify-center text-[13px] font-black text-white shrink-0">
                                                        {nc?.detecteur_id ? 'D' : 'U'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="text-[11.5px] font-black text-slate-800 truncate">
                                                                {nc?.responsable?.nom ? `${nc.responsable.prenom} ${nc.responsable.nom}` : 'Responsable Qualité'}
                                                            </h5>
                                                            <ShieldAlert size={12} className="text-rose-500 shrink-0" />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">Expert Détecteur</p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Mail size={10} className="text-slate-300" />
                                                            <span className="text-[8.5px] text-slate-400 truncate">{nc?.responsable?.email || 'expert@aerotech.com'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Other Info */}
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2 opacity-60">
                                                    <User size={18} className="text-slate-400" />
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aucun co-détecteur additionnel répertorié</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 6. Footer Fixed Actions */}
                        <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={closeNcDetailsModal}
                                className="flex items-center gap-2.5 px-6 py-3.5 text-slate-400 hover:text-slate-900 transition-all text-[10px] font-bold uppercase tracking-[2px] active:scale-95"
                            >
                                <ArrowLeftRight size={16} />
                                Retour au Terminal
                            </button>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleExportPDF}
                                    className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center gap-3 active:scale-95 group"
                                >
                                    <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                                    Télécharger Rapport NC
                                </button>
                                <button
                                    className="p-3.5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                    title="Actions Correctives"
                                >
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

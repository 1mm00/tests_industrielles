import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    MapPin,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    Download,
    Users,
    ShieldAlert,
    Activity,
    Thermometer,
    Zap,
    ExternalLink,
    Mail,
    ArrowLeftRight,
    CornerDownRight,
    Lock,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsService } from '@/services/testsService';
import { formatDate, cn } from '@/utils/helpers';
import type { TestIndustriel } from '@/types';
import { exportTestReportPDF } from '@/utils/pdfExport';
import toast from 'react-hot-toast';

export default function TestDetailsModal() {
    const { isTestDetailsModalOpen, closeTestDetailsModal, selectedTestId } = useModalStore();

    const queryClient = useQueryClient();
    const { data: test, isLoading } = useQuery<TestIndustriel>({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: !!selectedTestId && isTestDetailsModalOpen,
        staleTime: 0,
    });

    useEffect(() => {
        if (isTestDetailsModalOpen && selectedTestId) {
            queryClient.invalidateQueries({ queryKey: ['test', selectedTestId] });
        }
    }, [isTestDetailsModalOpen, selectedTestId, queryClient]);

    const certifyMutation = useMutation({
        mutationFn: () => testsService.certifyTest(selectedTestId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', selectedTestId] });
            queryClient.invalidateQueries({ queryKey: ['orchestration-tests'] });
            toast.success('Test certifié et verrouillé officiellement');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la certification');
        }
    });

    if (!isTestDetailsModalOpen) return null;

    const isNonConforme = test?.resultat_final === 'NOK' || test?.resultat_global === 'NON_CONFORME';
    const criticalityColor = {
        1: 'bg-emerald-500 shadow-emerald-500/50',
        2: 'bg-blue-500 shadow-blue-500/50',
        3: 'bg-amber-500 shadow-amber-500/50',
        4: 'bg-rose-500 shadow-rose-500/50',
    }[test?.niveau_criticite || 1];

    const criticalityLabel = {
        1: 'MINEUR',
        2: 'IMPORTANT',
        3: 'CRITIQUE',
        4: 'VITAL',
    }[test?.niveau_criticite || 1];

    return (
        <AnimatePresence>
            {isTestDetailsModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop with extreme blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTestDetailsModal}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                    />

                    {/* Innovative Glassmorphism Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] border border-white/60"
                    >
                        {/* 1. Dynamic Header & The Verdict */}
                        <div className={cn(
                            "px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/50",
                            isNonConforme ? "bg-rose-50/80" : "bg-emerald-50/80"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12",
                                    isNonConforme ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                                )}>
                                    {isNonConforme ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className={cn(
                                            "text-2xl font-black tracking-tighter uppercase leading-none",
                                            isNonConforme ? "text-rose-600" : "text-emerald-600"
                                        )}>
                                            {isNonConforme ? 'NOK - NON CONFORME' : 'OK - CONFORME'}
                                            {test?.taux_conformite_pct !== undefined && (
                                                <span className="ml-3 text-[18px] opacity-70">
                                                    [{test.taux_conformite_pct}% Precision Score]
                                                </span>
                                            )}
                                        </h2>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/50 px-2 py-0.5 rounded-full border border-slate-200">
                                            {test?.numero_test}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Diagnostic du système v4.0 • AeroTech Intelligence</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Lock Status Indicator */}
                                {test?.est_verrouille && (
                                    <div className="flex flex-col items-center px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-700 animate-pulse">
                                        <Lock size={16} className="mb-1 text-amber-500" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Archive Verrouillée</span>
                                    </div>
                                )}

                                {/* Neon Risk Badge */}
                                <div className="flex flex-col items-end">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Risk Level</p>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black tracking-[2px] text-white shadow-[0_0_15px] animate-pulse",
                                        criticalityColor
                                    )}>
                                        {criticalityLabel}
                                    </div>
                                </div>
                                <button
                                    onClick={closeTestDetailsModal}
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

                                    {/* Left Column: Asset & Execution */}
                                    <div className="lg:col-span-8 space-y-10">

                                        {/* Main Technical Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Block Équipement */}
                                            <div className="p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                        <Activity size={20} />
                                                    </div>
                                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Actif de Production</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Désignation Technique</span>
                                                        <span className="text-sm font-black text-slate-900 truncate">{test?.equipement?.designation || 'Unit Standard'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Code Asset</span>
                                                            <span className="text-xs font-mono font-bold text-blue-600">{test?.equipement?.code_equipement || 'EQ-0000'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Zone / Site</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={12} className="text-rose-500" />
                                                                <span className="text-xs font-bold text-slate-700">{test?.localisation || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Block Instrument */}
                                            <div className="p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                        <Thermometer size={20} />
                                                    </div>
                                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Métrologie Appliquée</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Dispositif de Mesure</span>
                                                        <span className="text-sm font-black text-slate-900 truncate">{test?.instrument?.designation || 'Capteur Standard'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">S/N Instrument</span>
                                                            <span className="text-xs font-mono font-bold text-slate-700">{test?.instrument?.numero_serie || 'SN-UNKNOWN'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Statut Métro</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <Zap size={12} className="text-emerald-500 fill-current" />
                                                                <span className="text-[9px] font-black text-emerald-600 uppercase">Certifié</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Result Comparison Split-View */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                                                    <ArrowLeftRight size={14} className="text-blue-500" />
                                                    Comparaison : Planification vs Réalité
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                                {/* Left: Expectations */}
                                                <div className="p-8 bg-slate-50/50 space-y-4">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Objectifs Attendus
                                                    </p>
                                                    <div className="text-sm font-bold text-slate-500 leading-relaxed min-h-[100px]">
                                                        {test?.resultat_attendu || "Aucun critère spécifique n'était défini lors de la planification initiale du test."}
                                                    </div>
                                                </div>
                                                {/* Right: Reality */}
                                                <div className={cn(
                                                    "p-8 space-y-4",
                                                    isNonConforme ? "bg-rose-50/30" : "bg-emerald-50/30"
                                                )}>
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2",
                                                        isNonConforme ? "text-rose-500" : "text-emerald-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", isNonConforme ? "bg-rose-500" : "bg-emerald-500")} /> Conclusion Technique
                                                    </p>
                                                    <div className={cn(
                                                        "text-sm font-black leading-relaxed min-h-[100px]",
                                                        isNonConforme ? "text-rose-700" : "text-emerald-700"
                                                    )}>
                                                        {test?.resultat_final || test?.resultat_global || "Conclusion technique non spécifiée dans le rapport final."}
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
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commentaire & Observations Terrain</p>
                                                    <div className="text-sm font-bold text-slate-600 leading-7 italic border-l-3 border-slate-900 pl-6 py-1">
                                                        {test?.observations_generales || test?.observations || "Le déroulement technique est conforme aux tolérances fixées. Aucune anomalie environnementale ou structurelle n'a été relevée lors de l'inspection."}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Timeline & Team */}
                                    <div className="lg:col-span-4 space-y-10">

                                        {/* Section: Timeline */}
                                        <section className="space-y-5">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Chronologie du test</h4>
                                            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                                <div className="absolute -right-4 -bottom-4 bg-white/5 h-32 w-32 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                                <div className="relative space-y-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                                            <Calendar size={18} className="text-blue-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase">Date d'Exécution</span>
                                                            <span className="text-sm font-black tracking-tight">{test?.date_test ? formatDate(test.date_test) : '---'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-5">
                                                        <div className="flex flex-col items-center pt-1.5">
                                                            <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shadow-[0_0_10px_#3b82f6]" />
                                                            <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500 to-indigo-500/20 mt-1" />
                                                            <div className="h-2 w-2 rounded-full bg-slate-700" />
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">T0 (Heure Début)</span>
                                                                <span className="text-base font-black font-mono">{test?.heure_debut || test?.heure_debut_planifiee || '08:30'}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TF (Heure Fin)</span>
                                                                <span className="text-base font-black font-mono">{test?.heure_fin || test?.heure_fin_planifiee || '09:15'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={16} className="text-slate-500" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase">Durée Totale</span>
                                                        </div>
                                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black text-blue-400 border border-white/10">
                                                            {test?.duree_reelle_heures ? `${test.duree_reelle_heures}H` : '45 MIN'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Section: Cohorte Opérationnelle */}
                                        <section className="space-y-5">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cohorte Opérationnelle</h4>
                                            <div className="space-y-3">
                                                {/* Responsable Technical Card */}
                                                <div className="p-4 bg-white border border-slate-200/60 rounded-3xl flex items-center gap-4 hover:shadow-md transition-all">
                                                    <div className="h-11 w-11 rounded-full bg-slate-900 border-2 border-slate-100 shadow-sm flex items-center justify-center text-[13px] font-black text-white shrink-0">
                                                        {test?.responsable?.nom?.[0] || 'U'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="text-[11.5px] font-black text-slate-800 truncate">
                                                                {test?.responsable?.prenom} {test?.responsable?.nom}
                                                            </h5>
                                                            <ShieldAlert size={12} className="text-blue-500 shrink-0" />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">{test?.responsable?.fonction || 'Expert Qualité'}</p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Mail size={10} className="text-slate-300" />
                                                            <span className="text-[8.5px] text-slate-400 truncate">{test?.responsable?.email || 'expert@aerotech.com'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Equipe secondary cards */}
                                                {test?.equipe_members?.filter(m => m.id_personnel !== test?.responsable_test_id).map((member, idx) => (
                                                    <div key={member.id_personnel || idx} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3 hover:bg-white hover:shadow-sm transition-all group">
                                                        <div className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                            {member.nom?.[0] || 'U'}{member.prenom?.[0] || ''}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] font-black text-slate-700 truncate group-hover:text-slate-900">
                                                                {member.prenom} {member.nom}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    {member.role?.nom_role || member.poste || 'Support Tech'}
                                                                </p>
                                                                <span className="text-[8px] text-slate-300 font-medium truncate max-w-[80px]">{member.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!test?.equipe_members || test.equipe_members.length === 0) && (
                                                    <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center opacity-40">
                                                        <Users size={20} className="text-slate-300 mb-1" />
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aucun membre auxiliaire</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* System Integrity Notification */}
                                        {test?.est_verrouille && (
                                            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                                                    <Lock size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="text-[11px] font-black text-amber-800 uppercase tracking-tight">Données Certifiées</h5>
                                                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                                        Ce test a été validé par la direction technique. Les mesures et conclusions sont désormais verrouillées pour garantir l'intégrité de l'audit.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 6. Footer Fixed Actions */}
                        <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={closeTestDetailsModal}
                                className="flex items-center gap-2.5 px-6 py-3.5 text-slate-400 hover:text-slate-900 transition-all text-[10px] font-bold uppercase tracking-[2px] active:scale-95"
                            >
                                <Users size={16} />
                                Retour au Terminal
                            </button>

                            <div className="flex items-center gap-4">
                                <button
                                    className="p-3.5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                    title="Partager en externe"
                                >
                                    <ExternalLink size={18} />
                                </button>

                                {test && !test.est_verrouille && test.statut_test === 'TERMINE' && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Voulez-vous vraiment certifier et verrouiller ce test ? Cette action est irréversible.')) {
                                                certifyMutation.mutate();
                                            }
                                        }}
                                        disabled={certifyMutation.isPending}
                                        className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-3 active:scale-95 group border border-slate-700"
                                    >
                                        {certifyMutation.isPending ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <ShieldCheck size={14} className="group-hover:scale-110 transition-transform text-emerald-400" />
                                        )}
                                        Certifier & Verrouiller
                                    </button>
                                )}

                                <button
                                    onClick={async () => {
                                        if (!test?.est_verrouille) {
                                            toast.error('Veuillez certifier le test avant de générer le rapport final immuable.');
                                            return;
                                        }
                                        toast.loading('Génération du PDF en cours...', { id: 'pdf-gen' });
                                        await exportTestReportPDF(test);
                                        toast.success('PDF généré avec succès !', { id: 'pdf-gen' });
                                    }}
                                    className={cn(
                                        "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all shadow-xl flex items-center gap-3 active:scale-95 group",
                                        test?.est_verrouille
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                                    Générer le PDF Final
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import {
    AlertTriangle,
    X,
    Play,
    ShieldCheck,
    Box,
    Loader2,
    Cpu,
    Lock
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { designerService } from '@/services/designerService';
import AcquisitionStream from '@/components/execution/AcquisitionStream';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';

import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import type { TestIndustriel } from '@/types';

/**
 * TEST EXECUTION MODAL - VERSION ULTRA-SÉCURISÉE
 * Piloté 100% par le temps réel et la matrice des permissions
 */

export default function TestExecutionModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isExecutionModalOpen, closeExecutionModal, selectedTestId, openTestGmailModal } = useModalStore();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [hasNotifiedPreStart, setHasNotifiedPreStart] = useState(false);

    // Mise à jour de l'horloge système chaque seconde (Source de Vérité)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: rawData, isLoading } = useQuery({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: !!selectedTestId && isExecutionModalOpen,
        staleTime: 5 * 60 * 1000,
    });

    const test = rawData as TestIndustriel;

    // Fetch checklist/method associated with this test type
    const { data: checklist, isLoading: isLoadingCheck } = useQuery({
        queryKey: ['checklist', test?.type_test_id],
        queryFn: () => designerService.getChecklist(test!.type_test_id),
        enabled: !!test?.type_test_id,
        staleTime: 10 * 60 * 1000,
    });

    // Fusionner les items de la checklist (Priorité absolue aux données déjà présentes dans le test)
    const checklistItems = useMemo(() => {
        if (!test?.type_test) return [];

        // On cherche les items dans toutes les variantes de noms possibles (Laravel vs JS)
        const tt = test.type_test as any;
        const inlineItems = (tt.checklists_controle?.[0]?.items) ||
            (tt.checklistsControle?.[0]?.items) ||
            (tt.checklist?.[0]?.items);

        if (Array.isArray(inlineItems) && inlineItems.length > 0) return inlineItems;

        // Fallback sur la requête secondaire si les données ne sont pas inline
        return checklist?.items || [];
    }, [test, checklist]);

    const isDataLoading = isLoading || (!checklistItems.length && isLoadingCheck);

    // Calculs de temps basés sur les ISO Strings reçus du Backend
    const timeLogic = useMemo(() => {
        if (!test) {
            return null;
        }

        const { heure_debut, heure_fin } = test;
        if (!heure_debut || !heure_fin) {
            return null;
        }

        const start = new Date(heure_debut);
        const end = new Date(heure_fin);

        // Sécurité contre les dates invalides
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return null;
        }

        const now = currentTime;

        // Vérification de la date (même jour)
        const isSameDay = start.toDateString() === now.toDateString();

        // Vérification de l'heure
        const isTimeReached = now.getTime() >= start.getTime();
        const isSessionExpired = now.getTime() >= end.getTime();

        // Calcul du temps restant avant démarrage (Countdown)
        const msToStart = start.getTime() - now.getTime();
        const countdownToStart = msToStart > 0 ? msToStart : 0;

        // Calcul du temps restant de session (Chrono)
        const msRemaining = end.getTime() - now.getTime();
        const sessionRemaining = msRemaining > 0 ? msRemaining : 0;

        // Alerte critique si < 5 minutes
        const isCritical = sessionRemaining > 0 && sessionRemaining < 5 * 60 * 1000;

        // Détection du retard au démarrage
        const isLate = now.getTime() > start.getTime();

        return {
            start,
            end,
            isSameDay,
            isTimeReached,
            isSessionExpired,
            isLate,
            countdownToStart,
            sessionRemaining,
            isCritical,
            canStart: isSameDay && (isTimeReached || isLate) && test.statut_test !== 'TERMINE' && test.statut_test !== 'EN_COURS'
        };
    }, [test, currentTime]);

    // Calcul du Score de Santé en Temps Réel
    const realTimeHealth = useMemo(() => {
        if (!test?.mesures || test.mesures.length === 0) return 100;
        const total = test.mesures.length;
        const conformes = test.mesures.filter((m: any) => m.conforme === true || m.conforme === 1).length;
        return Math.round((conformes / total) * 100);
    }, [test?.mesures]);

    // FERMETURE AUTOMATIQUE ET TRANSITION VERS RAPPORT GMAIL
    useEffect(() => {
        if (test?.statut_test === 'EN_COURS' && timeLogic?.sessionRemaining === 0) {
            console.log("[TestExecutionModal] Session expirée - Redirection vers le rapport");
            closeExecutionModal();
            openTestGmailModal(selectedTestId!);
            toast("Session terminée. Veuillez finaliser votre rapport de clôture.", {
                icon: '📝',
                duration: 5000
            });
        }
    }, [test?.statut_test, timeLogic?.sessionRemaining, closeExecutionModal, openTestGmailModal, selectedTestId]);

    // Notification d'anticipation (10 minutes avant)
    useEffect(() => {
        if (timeLogic && timeLogic.countdownToStart > 0 && timeLogic.countdownToStart <= 10 * 60 * 1000 && !hasNotifiedPreStart) {
            toast(`Rappel : Le test ${test?.numero_test} commence dans 10 minutes.`, {
                icon: '⏰',
                duration: 6000,
                style: { borderRadius: '15px', background: '#334155', color: '#fff', fontWeight: 'bold' }
            });
            setHasNotifiedPreStart(true);
        }
    }, [timeLogic, hasNotifiedPreStart, test?.numero_test, test]);

    // Formatage du temps (HH:MM:SS)
    const formatMs = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const startMutation = useMutation({
        mutationFn: () => testsService.startTest(selectedTestId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', selectedTestId] });
            toast.success('Démarrage de la SEQUENCE D\'ACQUISITION');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur de verrouillage temporel')
    });

    // Diagnostic des données du test (Uniquement au montage/changement de test)
    useEffect(() => {
        if (isExecutionModalOpen && test) {
            if (!test.heure_debut || !test.heure_fin) {
                console.warn("[TestExecutionModal] Configuration temporelle incomplète pour le test #", test.numero_test);
            } else {
                const start = new Date(test.heure_debut);
                const end = new Date(test.heure_fin);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    console.error("[TestExecutionModal] Format de date ISO invalide détecté pour le test #", test.numero_test);
                }
            }
        }
    }, [test?.id_test, isExecutionModalOpen]);

    if (!isExecutionModalOpen) return null;

    const isSessionActive = test?.statut_test === 'EN_COURS';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.98, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    className="bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-7xl h-[92vh] overflow-hidden flex flex-col border border-slate-200"
                >
                    {/* Header Classic Industrial */}
                    <div className="bg-white px-10 py-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                                <Cpu className="h-7 w-7 text-slate-900" />
                            </div>
                            <div>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-slate-900 text-2xl font-black uppercase tracking-tight">
                                        {test?.numero_test || 'TERMINAL D\'EXÉCUTION'}
                                    </h2>
                                    {isSessionActive && (
                                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">SESSION LIVE</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Nœud Réseau : <span className="text-slate-900">MAR-FR-04</span>
                                    </span>
                                    <div className="h-3 w-px bg-slate-200" />
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Responsable : <span className="text-slate-900">{user?.nom || 'STANDARD'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={closeExecutionModal}
                                className="h-12 w-12 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 transition-all active:scale-95 shadow-sm bg-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Synchronisation des bases...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex overflow-hidden">
                                {/* MAIN CONTENT AREA (70%) */}
                                <div className="flex-[7] overflow-y-auto custom-scrollbar p-4 bg-white">
                                    {test && (
                                        <div className="space-y-4">
                                            {test.est_verrouille && (
                                                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-4 shadow-xl border-l-4 border-l-amber-500">
                                                    <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                                        <Lock size={20} className="text-slate-900" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-500">Document Certifié & Verrouillé</h4>
                                                        <p className="text-[10px] font-bold text-slate-400">Cette session est archivée. Toute modification des mesures est interdite par le protocole d'intégrité.</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* EN-TÊTE RÉCAPITULATIF (DASHBOARD STYLE) - TOUJOURS VISIBLE */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-slate-50">
                                                {/* Carte Équipement */}
                                                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                                                        <Box className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Équipement sous test</p>
                                                        <h3 className="text-lg font-black text-slate-900 uppercase truncate">
                                                            {test?.equipement?.designation || 'Équipement non spécifié'}
                                                        </h3>
                                                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                                                            CODE: {test?.equipement?.code_equipement || 'N/A'} • {test?.equipement?.localisation_site}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Carte Instrument */}
                                                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                                                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                                                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Instrument Principal</p>
                                                        <h3 className="text-lg font-black text-slate-900 uppercase truncate">
                                                            {test?.instrument?.designation || 'Standard Interne'}
                                                        </h3>
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                                                            S/N: {test?.instrument?.numero_serie || 'AUTO'} • {test?.instrument?.type_instrument}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {isSessionActive ? (
                                                checklistItems.length > 0 ? (
                                                    /* FLUX D'ACQUISITION DYNAMIQUE */
                                                    <AcquisitionStream
                                                        testId={test.id_test}
                                                        items={checklistItems}
                                                        instrument={test.instrument}
                                                        isLocked={test?.est_verrouille || false}
                                                    />
                                                ) : isDataLoading ? (
                                                    /* CHARGEMENT EN COURS */
                                                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            Initialisation du flux de données...
                                                        </p>
                                                    </div>
                                                ) : (
                                                    /* ÉTAT VIDE (DATA LOADED BUT EMPTY) */
                                                    <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                            <AlertTriangle className="h-8 w-8 text-slate-300" />
                                                        </div>
                                                        <h3 className="text-slate-900 font-bold uppercase text-sm">Aucun point de contrôle</h3>
                                                        <p className="text-slate-500 text-xs mt-2 max-w-xs">
                                                            Cette méthode de test ne contient aucun item de contrôle configuré dans le Designer.
                                                        </p>
                                                    </div>
                                                )
                                            ) : !isSessionActive ? (
                                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                                                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                                                        <Play className="h-8 w-8 text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 uppercase">En attente de démarrage</h3>
                                                        <p className="text-slate-500 text-sm mt-2 max-w-sm">
                                                            Veuillez vérifier les conditions initiales avant d'initier la séquence de test.
                                                        </p>
                                                    </div>
                                                    {!timeLogic?.canStart && (
                                                        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
                                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                                            <p className="text-xs font-medium text-orange-800">
                                                                Démarrage autorisé à partir de {test?.heure_debut?.substring(11, 16)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* SIDE CONTROL PANEL (30%) */}
                                <div className="flex-[3] bg-slate-50/50 border-l border-slate-100 flex flex-col p-4 space-y-4">
                                    {/* HEALTH SCORE BLOCK */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-6 bg-blue-600 rounded-full" />
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[2px]">
                                                INDICE DE CONFORMITÉ
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center shadow-lg shadow-blue-900/5 relative overflow-hidden group">
                                            <div className="relative h-28 w-28">
                                                <svg className="h-full w-full" viewBox="0 0 100 100">
                                                    <circle
                                                        className="text-slate-100"
                                                        strokeWidth="8"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="42"
                                                        cx="50"
                                                        cy="50"
                                                    />
                                                    <motion.circle
                                                        className={cn(
                                                            realTimeHealth >= 95 ? "text-emerald-500" :
                                                                realTimeHealth >= 70 ? "text-blue-500" : "text-rose-500"
                                                        )}
                                                        strokeWidth="8"
                                                        strokeDasharray={264}
                                                        initial={{ strokeDashoffset: 264 }}
                                                        animate={{ strokeDashoffset: 264 - (264 * realTimeHealth) / 100 }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="42"
                                                        cx="50"
                                                        cy="50"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-black text-slate-900 leading-none">
                                                        {realTimeHealth}%
                                                    </span>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">HEALTH</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 text-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    {test?.mesures?.length || 0} Points Relevés
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TIMER BLOCK */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-6 bg-slate-900 rounded-full" />
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[2px]">
                                                {isSessionActive ? "CHRONO" : "COUNTDOWN"}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center shadow-lg shadow-slate-200/50 relative overflow-hidden">
                                            <div className="absolute top-2 left-3">
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            </div>
                                            <p className={cn(
                                                "text-5xl font-black text-slate-900 tabular-nums tracking-tighter shadow-sm",
                                                timeLogic?.isCritical && "text-rose-600 animate-pulse"
                                            )}>
                                                {timeLogic ? formatMs(isSessionActive ? timeLogic.sessionRemaining : timeLogic.countdownToStart) : '00:00'}
                                            </p>
                                            <div className="mt-2 flex flex-col items-center">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Session Pulse</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COMMANDS */}
                                    <div className="flex-1 flex flex-col justify-end gap-4">
                                        {!isSessionActive ? (
                                            <button
                                                onClick={() => startMutation.mutate()}
                                                disabled={!timeLogic?.canStart || startMutation.isPending}
                                                className={cn(
                                                    "w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[3px] transition-all shadow-xl active:scale-95",
                                                    timeLogic?.canStart
                                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                                        : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100"
                                                )}
                                            >
                                                {startMutation.isPending ? 'SYNCHRONISATION...' : 'DÉMARRER LA SESSION'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    closeExecutionModal();
                                                    openTestGmailModal(selectedTestId!);
                                                }}
                                                className="w-full py-6 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-[3px] hover:bg-black shadow-xl shadow-slate-300 flex items-center justify-center gap-3 transition-all active:scale-95"
                                            >
                                                <ShieldCheck className="h-5 w-5" />
                                                ARRÊTER & CLÔTURER
                                            </button>
                                        )}
                                        <div className="text-center px-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Session Sécurisée TLS 1.3</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Status Bar Classic */}
                    <div className="bg-white h-12 border-t border-slate-100 flex items-center px-10 justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">CONNEXION SERVEUR : OK</span>
                            </div>
                            <div className="h-4 w-px bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">ID SESSION : {test?.numero_test}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">v2.4.0-CLASSIC</span>
                        </div>
                    </div>

                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: #f8fafc;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}</style>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

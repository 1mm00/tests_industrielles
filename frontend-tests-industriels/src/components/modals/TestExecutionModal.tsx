import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Timer,
    AlertTriangle,
    X,
    Play,
    Activity,
    Clock,
    ShieldCheck,
    Box,
} from 'lucide-react';
import { testsService } from '@/services/testsService';
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
    const { isExecutionModalOpen, closeExecutionModal, selectedTestId, openTestGmailModal } = useModalStore();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [hasNotifiedPreStart, setHasNotifiedPreStart] = useState(false);

    // Mise à jour de l'horloge système chaque seconde (Source de Vérité)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Récupération des données du test
    const { data: rawData, isLoading } = useQuery({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: !!selectedTestId && isExecutionModalOpen,
    });

    const test = rawData as TestIndustriel;

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
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px]"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white/95 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-white/40"
                >
                    {/* Header Premium */}
                    <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                                <Activity className={cn("h-6 w-6 text-emerald-500", isSessionActive && "animate-pulse")} />
                            </div>
                            <div>
                                <h2 className="text-white text-xl font-black uppercase tracking-tight">
                                    {test?.numero_test || 'EXÉCUTION DU TEST'}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-md uppercase tracking-widest border border-white/5">
                                        Site de Marignane
                                    </span>
                                    {isSessionActive && (
                                        <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-md uppercase tracking-widest animate-pulse">
                                            LIVE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={closeExecutionModal}
                            className="h-10 w-10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Initialisation de la session...</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-900 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Séquence temporelle active</span>
                                    </div>
                                    {isSessionActive && timeLogic?.isLate && (
                                        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full animate-bounce">
                                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                                            <span className="text-[9px] font-black text-orange-500 uppercase">Démarré avec retard</span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8">
                                    {/* Colonne gauche : Infos */}
                                    <div className="md:col-span-7 space-y-6">
                                        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                                    <Box className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actif lié au test</p>
                                                    <p className="text-sm font-black text-gray-900">{test?.equipement?.designation}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Code Équipement</p>
                                                    <p className="font-mono text-sm font-bold text-gray-900">{test?.equipement?.code_equipement}</p>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Responsable</p>
                                                    <p className="text-sm font-bold text-gray-900">{test?.responsable?.prenom} {test?.responsable?.nom}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Protocole Validé</h3>
                                            </div>
                                            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                                                Le type de test <span className="font-black">"{test?.type_test?.libelle}"</span> est conforme aux standards ISO-9001.
                                                Toute déviation durant l'acquisition doit être rapportée immédiatement.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Colonne droite : Chronos et Actions */}
                                    <div className="md:col-span-5 space-y-6">
                                        {/* PHASE DE CLOTURE OU CHRONO ACTIVÉ */}
                                        <div className={cn(
                                            "rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500",
                                            isSessionActive
                                                ? "bg-slate-900 text-white shadow-2xl shadow-emerald-500/20"
                                                : "bg-gray-900 text-white"
                                        )}>
                                            {(!isSessionActive && timeLogic && timeLogic.countdownToStart > 0) ? (
                                                <>
                                                    <Clock className="h-8 w-8 text-emerald-400 mb-4 animate-pulse" />
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">
                                                        Attente Planning
                                                    </p>
                                                    <p className="text-4xl font-mono font-black tabular-nums">
                                                        {formatMs(timeLogic.countdownToStart)}
                                                    </p>
                                                </>
                                            ) : !isSessionActive && timeLogic?.isLate ? (
                                                <>
                                                    <AlertTriangle className="h-8 w-8 text-orange-400 mb-4 animate-bounce" />
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-2 text-center">
                                                        Retard Constaté
                                                    </p>
                                                    <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl text-center">
                                                        <p className="text-sm font-bold text-orange-200">
                                                            Prêt pour démarrage immédiat
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Timer className={cn("h-8 w-8 mb-4", timeLogic?.isCritical ? "text-red-500 animate-bounce" : "text-emerald-400")} />
                                                    <p className={cn(
                                                        "text-[10px] font-black uppercase tracking-[0.2em] mb-2",
                                                        timeLogic?.isCritical ? "text-red-500" : "text-emerald-400"
                                                    )}>
                                                        Fin de Session dans
                                                    </p>
                                                    <p className={cn(
                                                        "text-5xl font-mono font-black tabular-nums",
                                                        timeLogic?.isCritical ? "text-red-500 animate-pulse" : "text-white"
                                                    )}>
                                                        {timeLogic ? formatMs(timeLogic.sessionRemaining) : '00:00:00'}
                                                    </p>
                                                    {(timeLogic?.isCritical || timeLogic?.isSessionExpired) && (
                                                        <div className="mt-4 flex flex-col items-center gap-2">
                                                            <div className="flex items-center gap-2 text-red-500 animate-pulse">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase">
                                                                    {timeLogic?.isSessionExpired ? "Session Terminée - Clôture Requise" : "Alerte : Temps Critique !"}
                                                                </span>
                                                            </div>
                                                            {timeLogic?.isSessionExpired && (
                                                                <button
                                                                    onClick={() => {
                                                                        closeExecutionModal();
                                                                        openTestGmailModal(selectedTestId!);
                                                                    }}
                                                                    className="mt-2 text-[9px] font-black bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full uppercase transition-all"
                                                                >
                                                                    Passer à la saisie
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* ACTION BUTTON */}
                                        <div className="space-y-4">
                                            {!isSessionActive ? (
                                                <button
                                                    onClick={() => startMutation.mutate()}
                                                    disabled={!timeLogic?.canStart || startMutation.isPending}
                                                    className={cn(
                                                        "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl",
                                                        timeLogic?.canStart
                                                            ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/30"
                                                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                    )}
                                                >
                                                    {timeLogic?.canStart ? (
                                                        <>
                                                            <Play className="h-5 w-5 fill-current" />
                                                            Démarrer la session du test
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Activity className="h-5 w-5" />
                                                            Session Verrouillée
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        closeExecutionModal();
                                                        openTestGmailModal(selectedTestId!);
                                                    }}
                                                    className="w-full py-5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition-all shadow-xl shadow-black/10"
                                                >
                                                    <X className="h-5 w-5" />
                                                    Arrêter et Clôturer
                                                </button>
                                            )}

                                            {!timeLogic?.canStart && !isSessionActive && (
                                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                    <p className="text-[9px] font-black text-orange-700 uppercase leading-relaxed">
                                                        Le bouton s'activera automatiquement dès que l'heure planifiée ({test?.heure_debut?.substring(11, 16)}) sera atteinte.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer / Status Bar */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Synchronisation Temps Réel Active
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {currentTime.toLocaleTimeString()}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

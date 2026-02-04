import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import { testsService } from '@/services/testsService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';
import type { TestIndustriel } from '@/types';

export default function TestReportGmailModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isTestGmailModalOpen, closeTestGmailModal, selectedTestId } = useModalStore();

    const [status, setStatus] = useState<'OK' | 'NOK' | ''>('');
    const [observations, setObservations] = useState('');

    // Fetch test details for context
    const { data: test } = useQuery<TestIndustriel>({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: !!selectedTestId && isTestGmailModalOpen,
    });

    // Mapping robuste de l'identité (Fallback si prenom/nom sont undefined)
    const senderFullName = useMemo(() => {
        if (!user) return 'Utilisateur inconnu';

        // Priorité 1: Prenom + Nom
        if (user.prenom && user.nom) return `${user.prenom} ${user.nom}`;

        // Priorité 2: Name (utilisé par certains frameworks/auth)
        if (user.name) return user.name;

        // Priorité 3: Personnel nested data (Si Laravel renvoie un objet lié)
        if (user.personnel?.prenom && user.personnel?.nom) return `${user.personnel.prenom} ${user.personnel.nom}`;

        return 'Administrateur Système';
    }, [user]);

    // Identification du rôle (Admin vs Technicien)
    const senderRole = useMemo(() => {
        if (!user) return 'Invite';

        const role = (user.fonction || user.personnel?.role?.nom_role || '').toUpperCase();

        if (role.includes('ADMIN')) return 'Admin';
        if (role.includes('TECHNICIEN')) return 'Technicien';

        return user.fonction || 'Opérateur';
    }, [user]);

    const reportMutation = useMutation({
        mutationFn: (data: {
            resultat_final: 'OK' | 'NOK',
            observations: string,
            date_cloture: string,
            executeur_id?: string,
            nom_executeur?: string
        }) => testsService.finishTest(selectedTestId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            queryClient.invalidateQueries({ queryKey: ['test', selectedTestId] });
            queryClient.invalidateQueries({ queryKey: ['tests-technician'] });

            toast.success('Résultat final enregistré en base de données', {
                icon: '💾',
                duration: 4000
            });

            closeTestGmailModal();
            resetForm();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    });

    const resetForm = () => {
        setStatus('');
        setObservations('');
    };

    const handleSubmit = () => {
        if (!status) {
            toast.error('Veuillez sélectionner un statut final (OK/NOK)');
            return;
        }

        if (!observations.trim()) {
            toast.error('Une observation est requise pour clôturer le test');
            return;
        }

        // Payload sécurisé avec données authentifiées directement depuis le store
        reportMutation.mutate({
            resultat_final: status,
            observations: observations,
            date_cloture: new Date().toISOString(),
            executeur_id: user?.id,
            nom_executeur: senderFullName
        });
    };

    return (
        <AnimatePresence>
            {isTestGmailModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTestGmailModal}
                        className="absolute inset-0 bg-black/10 backdrop-blur-[10px]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-white/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/40 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* HEADER */}
                        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-white text-sm font-bold tracking-tight">
                                    Saisie du Résultat Final du Test - {test?.numero_test || '...'}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-white/30" />
                                <button
                                    onClick={closeTestGmailModal}
                                    className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* CHAMPS DYNAMIQUE READ-ONLY (EXPÉDITEUR AUTOMATISÉ) */}
                        <div className="px-6 py-4 space-y-4 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-gray-400 w-14 shrink-0 font-medium">De :</span>
                                <div className="flex items-center gap-2 font-medium text-gray-700">
                                    <div className="h-6 w-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-slate-300">
                                        {user?.prenom?.[0]}{user?.nom?.[0]}
                                    </div>
                                    <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-md border border-gray-200 select-none cursor-not-allowed">
                                        {senderFullName} <span className="text-gray-400 font-normal ml-1">({senderRole})</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-gray-400 w-14 shrink-0 font-medium">Objet :</span>
                                <span className="font-bold text-slate-800 bg-gray-100 px-3 py-1 rounded-md border border-gray-200 w-full">
                                    Clôture finale et archivage des données - {test?.numero_test}
                                </span>
                            </div>
                        </div>

                        {/* STATUS SELECTION */}
                        <div className="px-6 py-3 bg-gray-50 flex items-center gap-6 border-b border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Décision Finale :</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setStatus('OK')}
                                    className={cn(
                                        "px-4 py-1.5 text-[10px] font-black rounded-full transition-all border shadow-sm",
                                        status === 'OK'
                                            ? "bg-emerald-500 text-white border-emerald-500 ring-4 ring-emerald-500/10"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
                                    )}
                                >
                                    OK - CONFORME
                                </button>
                                <button
                                    onClick={() => setStatus('NOK')}
                                    className={cn(
                                        "px-4 py-1.5 text-[10px] font-black rounded-full transition-all border shadow-sm",
                                        status === 'NOK'
                                            ? "bg-red-500 text-white border-red-500 ring-4 ring-red-500/10"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-red-300"
                                    )}
                                >
                                    NOK - NON-CONFORME
                                </button>
                            </div>
                        </div>

                        {/* OBSERVATIONS AREA */}
                        <div className="relative flex-1 min-h-[350px] flex bg-white">
                            <div className={cn(
                                "w-1.5 shrink-0 transition-colors duration-500",
                                status === 'OK' ? "bg-emerald-500" : status === 'NOK' ? "bg-red-500" : "bg-gray-100"
                            )} />

                            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
                                {status === 'NOK' && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="p-1.5 bg-red-100 rounded-lg">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-red-800 uppercase mb-0.5 tracking-wider">Alerte : Dossier Critique</p>
                                            <p className="text-[11px] text-red-700 leading-relaxed">
                                                Ce rapport sera archivé avec une mention <strong>Critique</strong>. Justifiez l'arrêt ou la non-conformité pour le département qualité.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    placeholder="Décrivez précisément les résultats techniques du test..."
                                    className="flex-1 w-full text-sm text-gray-800 placeholder:text-gray-300 resize-none outline-none font-medium leading-relaxed bg-transparent"
                                />
                            </div>
                        </div>

                        {/* ACTIONS BAR */}
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={reportMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2.5 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {reportMutation.isPending ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Enregistrer le Résultat Final
                                </button>
                            </div>

                            <button
                                onClick={resetForm}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Réinitialiser"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    FileText,
    Loader2,
    AlertTriangle,
    Target,
    User,
    Calendar
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ncService } from '@/services/ncService';
import { actionService, ActionCorrective } from '@/services/actionService';
import toast from 'react-hot-toast';
import { useFormErrors } from '@/hooks/useFormErrors';
import { cn } from '@/utils/helpers';

export default function ClotureNcModal() {
    const { isClotureNcModalOpen, closeClotureNcModal, selectedNcId } = useModalStore();
    const queryClient = useQueryClient();
    const [commentaires, setCommentaires] = useState('');
    const [actions, setActions] = useState<ActionCorrective[]>([]);
    const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
    const { handleApiError, clearErrors, getError } = useFormErrors();

    // Récupérer les détails de la NC
    const { data: nc } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isClotureNcModalOpen,
    });

    // Récupérer les actions du plan d'action
    useEffect(() => {
        const fetchActions = async () => {
            if (nc?.plan_action?.id_plan) {
                try {
                    const fetchedActions = await actionService.getByPlan(nc.plan_action.id_plan);
                    setActions(fetchedActions);

                    // Pré-cocher les actions déjà réalisées (tous les statuts terminés)
                    const alreadyCompleted = new Set(
                        fetchedActions
                            .filter(a => ['REALISEE', 'TERMINEE', 'FAITE'].includes(a.statut))
                            .map(a => a.id_action)
                    );
                    setCompletedActions(alreadyCompleted);
                } catch (error) {
                    console.error('Error fetching actions:', error);
                }
            }
        };

        if (isClotureNcModalOpen && nc) {
            fetchActions();
        }
    }, [nc, isClotureNcModalOpen]);

    const toggleActionCompletion = async (actionId: string) => {
        const isCurrentlyCompleted = completedActions.has(actionId);
        const isNowCompleted = !isCurrentlyCompleted;

        const newCompleted = new Set(completedActions);
        if (isNowCompleted) {
            newCompleted.add(actionId);
        } else {
            newCompleted.delete(actionId);
        }

        setCompletedActions(newCompleted);

        // Mettre à jour le backend immédiatement
        try {
            await actionService.updateAction(actionId, {
                statut: isNowCompleted ? 'REALISEE' : 'EN_COURS',
                date_realisee: isNowCompleted ? new Date().toISOString() : undefined
            });

            // Mettre à jour localement
            setActions(prev => prev.map(a =>
                a.id_action === actionId
                    ? { ...a, statut: isNowCompleted ? 'REALISEE' : 'EN_COURS' }
                    : a
            ));
        } catch (error) {
            console.error('Error updating action status:', error);
            toast.error('Erreur lors de la mise à jour de l\'action');
            // Annuler le changement local
            if (isNowCompleted) {
                newCompleted.delete(actionId);
            } else {
                newCompleted.add(actionId);
            }
            setCompletedActions(newCompleted);
        }
    };

    const clotureMutation = useMutation({
        mutationFn: () => ncService.cloturerNc(selectedNcId!, commentaires),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            queryClient.invalidateQueries({ queryKey: ['nc-stats'] });

            toast.success('Non-conformité clôturée officiellement et verrouillée', {
                icon: '🔒',
                duration: 5000
            });

            handleClose();
        },
        onError: (err: any) => {
            // Afficher le message d'erreur du backend
            const errorMessage = err?.response?.data?.message || 'Erreur lors de la clôture';
            toast.error(errorMessage, {
                duration: 6000,
                style: { maxWidth: '500px' }
            });
            handleApiError(err, 'Détails de l\'erreur');
        }
    });

    const handleClose = () => {
        setCommentaires('');
        setActions([]);
        setCompletedActions(new Set());
        clearErrors();
        closeClotureNcModal();
    };

    const handleSubmit = () => {
        clearErrors();

        // Vérifier que toutes les actions sont terminées
        if (actions.length > 0 && completedActions.size !== actions.length) {
            toast.error('Toutes les actions doivent être marquées comme réalisées avant de clôturer');
            return;
        }

        if (!commentaires || commentaires.trim().length < 20) {
            toast.error('Les commentaires de clôture doivent contenir au moins 20 caractères');
            return;
        }

        if (!window.confirm('⚠️ Voulez-vous vraiment clôturer cette NC ? Cette action est irréversible et verrouillera définitivement la fiche.')) {
            return;
        }

        clotureMutation.mutate();
    };

    if (!isClotureNcModalOpen || !nc) return null;

    const hasPlanAction = !!nc.plan_action;
    const progressPercent = actions.length > 0 ? Math.round((completedActions.size / actions.length) * 100) : 0;
    const canClose = hasPlanAction && actions.length > 0 && completedActions.size === actions.length;

    return (
        <AnimatePresence>
            {isClotureNcModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header with gradient */}
                        <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-8 pb-24">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="relative flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
                                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        Exécuter & Vérifier
                                    </h2>
                                    <p className="text-slate-300 text-sm mt-1">
                                        Validation finale du Plan d'Action et Clôture
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 -mt-16 relative">
                            {/* NC Info Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{nc.numero_nc}</h3>
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{nc.description}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${nc.criticite?.code_niveau === 'NC4' ? 'bg-red-100 text-red-700' :
                                        nc.criticite?.code_niveau === 'NC3' ? 'bg-orange-100 text-orange-700' :
                                            nc.criticite?.code_niveau === 'NC2' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {nc.criticite?.libelle || 'N/A'}
                                    </span>
                                </div>

                                {/* Pré-requis de clôture */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Vérification des pré-requis
                                    </p>

                                    <div className={`flex items-center gap-3 p-3 rounded-xl ${hasPlanAction ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {hasPlanAction ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${hasPlanAction ? 'text-green-900' : 'text-red-900'}`}>
                                                Plan d'action
                                            </p>
                                            <p className={`text-xs ${hasPlanAction ? 'text-green-700' : 'text-red-700'}`}>
                                                {hasPlanAction ? 'Créé et actif' : 'Aucun plan d\'action défini'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Liste des actions correctives */}
                            {hasPlanAction && actions.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                            Actions Correctives à Valider
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs font-bold text-slate-600">
                                                {completedActions.size}/{actions.length}
                                            </div>
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {actions.map((action, index) => {
                                            const isCompleted = completedActions.has(action.id_action);
                                            return (
                                                <motion.div
                                                    key={action.id_action}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md",
                                                        isCompleted
                                                            ? "bg-emerald-50 border-emerald-200"
                                                            : "bg-slate-50 border-slate-200 hover:border-blue-300"
                                                    )}
                                                    onClick={() => toggleActionCompletion(action.id_action)}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(
                                                            "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                                                            isCompleted
                                                                ? "bg-emerald-500 border-emerald-500"
                                                                : "bg-white border-slate-300 group-hover:border-blue-400"
                                                        )}>
                                                            {isCompleted && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                >
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Target className="h-3.5 w-3.5 text-blue-500" />
                                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                                    {action.type_action?.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                            <p className={cn(
                                                                "text-sm font-medium mb-2",
                                                                isCompleted ? "text-emerald-900 line-through" : "text-slate-900"
                                                            )}>
                                                                {action.description}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-slate-600">
                                                                <div className="flex items-center gap-1.5">
                                                                    <User className="h-3 w-3" />
                                                                    <span>{action.responsable?.nom} {action.responsable?.prenom}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{new Date(action.date_prevue).toLocaleDateString('fr-FR')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {completedActions.size < actions.length && (
                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-800 font-medium">
                                                Toutes les actions doivent être cochées et validées avant de pouvoir clôturer la NC.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Commentaires de clôture */}
                            {canClose ? (
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <FileText size={16} />
                                        Commentaires de clôture finale
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={commentaires}
                                        onChange={(e) => setCommentaires(e.target.value)}
                                        placeholder="Décrivez les mesures prises, les résultats obtenus et la validation de l'efficacité... (minimum 20 caractères)"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none text-sm transition-all ${getError('commentaires_cloture')
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/30'
                                            : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                                            }`}
                                        rows={5}
                                    />
                                    {getError('commentaires_cloture') && (
                                        <p className="text-red-600 text-[10px] font-bold mt-1 animate-pulse">
                                            {getError('commentaires_cloture')}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`font-semibold ${commentaires.length >= 20 ? 'text-green-600' : 'text-slate-400'
                                            }`}>
                                            {commentaires.length} / 20 caractères minimum
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900">Clôture impossible</p>
                                        <p className="text-xs text-red-700 mt-1">
                                            {!hasPlanAction
                                                ? 'Vous devez créer un plan d\'action avant de clôturer cette NC.'
                                                : `Il reste ${actions.length - completedActions.size} action(s) corrective(s) non terminée(s). Veuillez les compléter avant la clôture.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 pt-0 flex items-center justify-end gap-3">
                            <button
                                onClick={handleClose}
                                disabled={clotureMutation.isPending}
                                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!canClose || commentaires.length < 20 || clotureMutation.isPending}
                                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                            >
                                {clotureMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Clôture en cours...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        Clôturer la NC
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

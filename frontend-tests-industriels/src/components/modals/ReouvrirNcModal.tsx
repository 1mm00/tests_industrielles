import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    RotateCcw,
    AlertCircle,
    Loader2,
    FileText,
    History
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ncService } from '@/services/ncService';
import toast from 'react-hot-toast';
import { useFormErrors } from '@/hooks/useFormErrors';

export default function ReouvrirNcModal() {
    const { isReouvrirNcModalOpen, closeReouvrirNcModal, selectedNcId } = useModalStore();
    const queryClient = useQueryClient();
    const [motif, setMotif] = useState('');
    const { handleApiError, clearErrors, getError } = useFormErrors();

    const { data: nc } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isReouvrirNcModalOpen,
    });

    const reouvrirMutation = useMutation({
        mutationFn: () => ncService.reouvrirNc(selectedNcId!, motif),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });

            toast.success('Non-conformité réouverte avec succès', {
                icon: '🔄',
                duration: 5000
            });

            handleClose();
        },
        onError: (err: any) => {
            handleApiError(err, 'Erreur lors de la réouverture');
        }
    });

    const handleClose = () => {
        setMotif('');
        clearErrors();
        closeReouvrirNcModal();
    };

    const handleSubmit = () => {
        clearErrors();
        if (!motif || motif.trim().length < 20) {
            toast.error('Le motif de réouverture doit contenir au moins 20 caractères');
            return;
        }

        reouvrirMutation.mutate();
    };

    if (!isReouvrirNcModalOpen || !nc) return null;

    return (
        <AnimatePresence>
            {isReouvrirNcModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-6 text-white text-center">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <div className="mx-auto h-16 w-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30 mb-4 shadow-xl">
                                <RotateCcw className="h-8 w-8 text-white animate-spin-slow" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Réouverture de NC</h2>
                            <p className="text-amber-100 text-xs mt-1">Reprise du traitement pour {nc.numero_nc}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                    La réouverture est une action documentée. Elle invalide la clôture précédente et remet la NC en statut <span className="font-bold">TRAITEMENT</span>.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <FileText size={16} className="text-amber-600" />
                                    Justification de la réouverture <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={motif}
                                    onChange={(e) => setMotif(e.target.value)}
                                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:ring-4 outline-none transition-all text-sm h-32 resize-none ${getError('motif_reouverture')
                                            ? 'border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                            : 'border-slate-200 focus:ring-amber-500/20'
                                        }`}
                                    placeholder="Expliquez pourquoi la clôture n'est plus valide (ex: récidive du défaut, efficacité nulle des actions...)"
                                    required
                                />
                                {getError('motif_reouverture') && (
                                    <p className="text-red-600 text-[10px] font-bold mt-1">
                                        {getError('motif_reouverture')}
                                    </p>
                                )}
                                <div className="text-[10px] font-bold text-right text-slate-400">
                                    {motif.length} / 20 caractères minimum
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={reouvrirMutation.isPending || motif.length < 20}
                                className="flex-[2] px-6 py-3 bg-amber-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {reouvrirMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Réouverture...
                                    </>
                                ) : (
                                    <>
                                        <History size={16} />
                                        Confirmer la Réouverture
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

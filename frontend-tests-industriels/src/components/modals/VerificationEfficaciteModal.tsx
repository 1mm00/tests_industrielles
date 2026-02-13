import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ShieldCheck,
    Loader2,
    Search,
    TextQuote,
    ClipboardCheck,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationService } from '@/services/verificationService';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';
import { useFormErrors } from '@/hooks/useFormErrors';

export default function VerificationEfficaciteModal() {
    const { isVerificationModalOpen, closeVerificationModal, selectedActionId, selectedNcId } = useModalStore();
    const queryClient = useQueryClient();
    const { handleApiError, clearErrors, getError } = useFormErrors();

    const [form, setForm] = useState({
        methode_verification: '',
        resultats_constates: '',
        est_efficace: true,
        commentaires: '',
        date_verification: new Date().toISOString().split('T')[0]
    });

    const verificationMutation = useMutation({
        mutationFn: (data: any) => verificationService.store(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            toast.success('Vérification d\'efficacité enregistrée', {
                icon: '🛡️',
                duration: 4000
            });
            handleClose();
        },
        onError: (err: any) => {
            handleApiError(err, 'Erreur lors de l\'enregistrement');
        }
    });

    const handleClose = () => {
        setForm({
            methode_verification: '',
            resultats_constates: '',
            est_efficace: true,
            commentaires: '',
            date_verification: new Date().toISOString().split('T')[0]
        });
        clearErrors();
        closeVerificationModal();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        if (!form.methode_verification || !form.resultats_constates) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        verificationMutation.mutate({
            ...form,
            action_corrective_id: selectedActionId
        });
    };

    if (!isVerificationModalOpen) return null;

    return (
        <AnimatePresence>
            {isVerificationModalOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white relative">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                                    <ClipboardCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">Vérification d'Efficacité</h2>
                                    <p className="text-indigo-100 text-xs">Validation de l'action corrective</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                                    Date de vérification
                                </label>
                                <input
                                    type="date"
                                    value={form.date_verification}
                                    onChange={(e) => setForm({ ...form, date_verification: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                                />
                            </div>

                            {/* Méthode */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                                    <Search size={14} className="text-indigo-500" />
                                    Méthode de vérification <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.methode_verification}
                                    onChange={(e) => setForm({ ...form, methode_verification: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all text-sm font-bold ${getError('methode_verification')
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                    required
                                >
                                    <option value="">Sélectionner une méthode...</option>
                                    <option value="EXAMEN_DOCUMENTAIRE">Examen documentaire</option>
                                    <option value="OBSERVATION_DIRECTE">Observation directe</option>
                                    <option value="AUDIT">Audit / Flash Audit</option>
                                    <option value="RETEST">Re-test / Mesure</option>
                                    <option value="ENTRETIEN">Entretien avec les acteurs</option>
                                </select>
                                {getError('methode_verification') && (
                                    <p className="text-red-600 text-[10px] font-bold mt-1">
                                        {getError('methode_verification')}
                                    </p>
                                )}
                            </div>

                            {/* Résultats */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                                    <TextQuote size={14} className="text-indigo-500" />
                                    Résultats constatés <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={form.resultats_constates}
                                    onChange={(e) => setForm({ ...form, resultats_constates: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all text-sm h-24 ${getError('resultats_constates')
                                            ? 'border-red-500 focus:ring-red-500 bg-red-50/30'
                                            : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                    placeholder="Décrivez les observations factuelles..."
                                    required
                                />
                                {getError('resultats_constates') && (
                                    <p className="text-red-600 text-[10px] font-bold mt-1">
                                        {getError('resultats_constates')}
                                    </p>
                                )}
                            </div>

                            {/* Verdict */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase">Verdict d'efficacité</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, est_efficace: true })}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest",
                                            form.est_efficace
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <ThumbsUp size={16} /> Efficace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, est_efficace: false })}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest",
                                            !form.est_efficace
                                                ? "bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-100"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <ThumbsDown size={16} /> Inefficace
                                    </button>
                                </div>
                            </div>

                            {/* Commentaires additionnels */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase">Commentaires additionnels</label>
                                <textarea
                                    value={form.commentaires}
                                    onChange={(e) => setForm({ ...form, commentaires: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm h-16"
                                    placeholder="Notes facultatives..."
                                />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={verificationMutation.isPending}
                                className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {verificationMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        Valider la Vérification
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

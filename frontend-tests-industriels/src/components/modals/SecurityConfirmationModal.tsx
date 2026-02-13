import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { ncService } from '@/services/ncService';
import toast from 'react-hot-toast';

export default function SecurityConfirmationModal() {
    const { isSecurityModalOpen, closeSecurityModal, selectedNcId } = useModalStore();
    const queryClient = useQueryClient();
    const [password, setPassword] = useState('');
    const [isError, setIsError] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const isValid = await authService.verifyPassword(password);
            if (!isValid) throw new Error('Mot de passe incorrect');
            return ncService.deleteNc(selectedNcId!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['nc-stats'] });
            toast.success('Suppression effectuée avec succès', {
                icon: '✅',
                className: 'font-bold text-xs'
            });
            handleClose();
        },
        onError: (error: any) => {
            setIsError(true);
            setTimeout(() => setIsError(false), 500);
            const message = error.response?.data?.message || error.message || 'Erreur de validation';
            toast.error(message, {
                icon: '🚫',
                className: 'font-bold text-xs'
            });
        }
    });

    const handleClose = () => {
        setPassword('');
        setIsError(false);
        closeSecurityModal();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setIsError(true);
            setTimeout(() => setIsError(false), 500);
            return;
        }
        deleteMutation.mutate();
    };

    if (!isSecurityModalOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={handleClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: isError ? [0, -10, 10, -10, 10, 0] : 0
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, x: { duration: 0.4, ease: "easeInOut" } }}
                    className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="pt-8 pb-4 flex flex-col items-center">
                        <ShieldAlert className="text-red-600 h-8 w-8 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                            Confirmation Administrateur
                        </h3>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="px-10 pb-8">
                        <p className="text-gray-600 text-[13px] text-center mb-6 leading-relaxed">
                            Veuillez saisir votre mot de passe pour confirmer la suppression définitive.
                        </p>

                        <div className="flex justify-center mb-8">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (isError) setIsError(false);
                                }}
                                placeholder="Mot de passe..."
                                className={`w-full max-w-[280px] px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-center transition-all outline-none
                                    ${isError ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-red-500'}`}
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end items-center gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={deleteMutation.isPending}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-red-100"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        En cours...
                                    </>
                                ) : (
                                    "Supprimer"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

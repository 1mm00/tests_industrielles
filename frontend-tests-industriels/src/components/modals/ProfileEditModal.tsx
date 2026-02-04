import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Zap, Sparkles, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function ProfileEditModal() {
    const { isProfileEditModalOpen, closeProfileEditModal } = useModalStore();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telephone: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const [activeField, setActiveField] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                telephone: user.telephone || (user.personnel as any)?.telephone || '',
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        }
    }, [user, isProfileEditModalOpen]);

    const profileMutation = useMutation({
        mutationFn: (data: any) => authService.updateProfile(data),
    });

    const passwordMutation = useMutation({
        mutationFn: (data: any) => authService.updatePassword(data),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loadingToast = toast.loading('Synchronisation des données...', {
            style: { borderRadius: '1rem', background: '#1a1a1a', color: '#fff' }
        });

        try {
            // 1. Update Profile (Name, Email, Tel)
            const profileData = {
                name: formData.name,
                email: formData.email,
                telephone: formData.telephone
            };
            const updatedProfile = await profileMutation.mutateAsync(profileData);

            // 2. Update Password if fields are filled
            if (formData.new_password) {
                if (formData.new_password !== formData.new_password_confirmation) {
                    throw new Error('Les nouveaux mots de passe ne correspondent pas');
                }
                if (!formData.current_password) {
                    throw new Error('Veuillez saisir votre mot de passe actuel pour le changer');
                }
                await passwordMutation.mutateAsync({
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                    new_password_confirmation: formData.new_password_confirmation
                });
            }

            // Success handling
            queryClient.invalidateQueries({ queryKey: ['auth-me'] });
            useAuthStore.getState().updateUser(updatedProfile.user);

            toast.success('Compte mis à jour avec succès !', { id: loadingToast, icon: '🚀' });
            closeProfileEditModal();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || error.response?.data?.message || 'Erreur lors de la mise à jour', { id: loadingToast });
        }
    };

    if (!isProfileEditModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-300">
            <div className="bg-white/95 rounded-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">

                {/* Left Side: Visual & Branding */}
                <div className="md:w-1/3 bg-gray-900 p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-[60px]" />
                        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-400 mb-6 backdrop-blur-md border border-white/10">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase">
                            Gestion <br />
                            <span className="text-primary-500">Unifiée</span>
                        </h2>
                        <p className="text-gray-400 text-xs mt-4 font-medium leading-relaxed">
                            Mettez à jour vos informations personnelles et vos paramètres de sécurité dans un environnement chiffré.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-white/60">
                            <Shield size={16} className="text-green-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">SSL 256-bit Encrypted</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-primary-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-hide bg-white relative">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase">Paramètres du Compte</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identité & Sécurité</p>
                        </div>
                        <button
                            onClick={closeProfileEditModal}
                            className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Informations Générales */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="text-primary-600" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Identité</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className={cn("relative p-4 rounded-3xl bg-gray-50 border transition-all duration-300", activeField === 'name' ? 'border-primary-500 shadow-sm bg-white' : 'border-transparent')}>
                                        <label className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase">Nom Complet</label>
                                        <input
                                            type="text"
                                            required
                                            onFocus={() => setActiveField('name')}
                                            onBlur={() => setActiveField(null)}
                                            className="w-full mt-2 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className={cn("relative p-4 rounded-3xl bg-gray-50 border transition-all duration-300", activeField === 'tel' ? 'border-primary-500 shadow-sm bg-white' : 'border-transparent')}>
                                        <label className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase">Téléphone</label>
                                        <input
                                            type="text"
                                            onFocus={() => setActiveField('tel')}
                                            onBlur={() => setActiveField(null)}
                                            className="w-full mt-2 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900"
                                            value={formData.telephone}
                                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={cn("relative p-4 rounded-3xl bg-gray-50 border transition-all duration-300", activeField === 'email' ? 'border-primary-500 shadow-sm bg-white' : 'border-transparent')}>
                                <label className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase">Email Professionnel</label>
                                <input
                                    type="email"
                                    required
                                    onFocus={() => setActiveField('email')}
                                    onBlur={() => setActiveField(null)}
                                    className="w-full mt-2 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Section 2: Sécurité (Nouveau) */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Lock className="text-primary-600" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sécurité (Laisser vide pour ne pas changer)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="text-[10px] font-black text-primary-600 uppercase hover:underline"
                                >
                                    {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            <div className={cn("relative p-4 rounded-3xl bg-gray-50 border transition-all duration-300", activeField === 'cur_pass' ? 'border-primary-500 shadow-sm bg-white' : 'border-transparent')}>
                                <label className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase">Ancien Mot de Passe</label>
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    onFocus={() => setActiveField('cur_pass')}
                                    onBlur={() => setActiveField(null)}
                                    className="w-full mt-2 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900"
                                    placeholder="••••••••"
                                    value={formData.current_password}
                                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={cn("relative p-4 rounded-3xl bg-gray-50 border transition-all duration-300", activeField === 'new_pass' ? 'border-primary-500 shadow-sm bg-white' : 'border-transparent')}>
                                    <label className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase">Nouveau Mot de Passe</label>
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        onFocus={() => setActiveField('new_pass')}
                                        onBlur={() => setActiveField(null)}
                                        className="w-full mt-2 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900"
                                        placeholder="••••••••"
                                        value={formData.new_password}
                                        onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    />
                                </div>
                                <div className={cn("relative p-4 rounded-3xl bg-gray-50 border transition-all duration-300", activeField === 'new_pass_conf' ? 'border-primary-500 shadow-sm bg-white' : 'border-transparent')}>
                                    <label className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase">Confirmation</label>
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        onFocus={() => setActiveField('new_pass_conf')}
                                        onBlur={() => setActiveField(null)}
                                        className="w-full mt-2 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900"
                                        placeholder="••••••••"
                                        value={formData.new_password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={profileMutation.isPending || passwordMutation.isPending}
                                className="w-full group relative overflow-hidden py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Zap size={16} className="text-yellow-400" />
                                    Confirmer les Modifications
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AlertTriangle,
    X,
    Save,
    CheckCircle2,
    FileText,
    ShieldAlert,
    Clock,
    History
} from 'lucide-react';
import { ncService } from '@/services/ncService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';
import { hasPermission, isLecteur } from '@/utils/permissions';
import { Eye } from 'lucide-react';

export default function NcEditModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isNcEditModalOpen, closeNcEditModal, selectedNcId } = useModalStore();

    const [form, setForm] = useState<any>({
        description: '',
        conclusions: '',
        statut: '',
    });

    const { data: nc, isLoading } = useQuery({
        queryKey: ['non-conformite', selectedNcId],
        queryFn: () => ncService.getNc(selectedNcId!),
        enabled: !!selectedNcId && isNcEditModalOpen,
    });

    useEffect(() => {
        if (nc) {
            const data = nc as any;
            setForm({
                description: data.description || '',
                conclusions: data.conclusions || '',
                statut: data.statut || data.statutNc || 'OUVERTE',
            });
        }
    }, [nc]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => ncService.updateNc(selectedNcId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            queryClient.invalidateQueries({ queryKey: ['non-conformite', selectedNcId] });
            toast.success('NC mise à jour avec succès');
            if (form.statut === 'CLOTUREE') {
                closeNcEditModal();
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(form);
    };

    const handleCloseNc = () => {
        if (!form.conclusions) {
            toast.error('Veuillez saisir des conclusions avant de clôturer');
            return;
        }
        updateMutation.mutate({ ...form, statut: 'CLOTUREE' });
    };

    if (!isNcEditModalOpen) return null;

    const data = nc as any;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-200">
            <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Suivi Non-Conformité</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-widest">
                                    {data?.numero_nc || data?.numeroNc}
                                </span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">
                                    {data?.equipement?.designation}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={closeNcEditModal} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
                        <div className="h-12 w-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Synchro Données...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                        {/* Info Panel */}
                        <div className="lg:w-1/3 bg-gray-50/50 p-8 border-r border-gray-50 overflow-y-auto space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Statut Actuel</h3>
                                <div className={cn(
                                    "p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all",
                                    (data?.statut === 'OUVERTE' || data?.statutNc === 'Ouvert') ? "bg-red-50 border-red-100 text-red-600" :
                                        (data?.statut === 'TRAITEMENT' || data?.statutNc === 'En traitement') ? "bg-amber-50 border-amber-100 text-amber-600" :
                                            "bg-emerald-50 border-emerald-100 text-emerald-600"
                                )}>
                                    <Clock className="h-8 w-8 mb-1" />
                                    <p className="text-xl font-black uppercase tracking-tighter">{data?.statut || data?.statutNc}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Gravité Technique</h4>
                                <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                                    <ShieldAlert className="h-6 w-6 text-red-500" />
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase">{data?.criticite?.libelle || data?.niveauNc}</p>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">{data?.criticite?.code_niveau || ''}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Détection</h4>
                                <p className="text-xs font-bold text-gray-700">Le {new Date(data?.date_detection || data?.dateDetection).toLocaleDateString()}</p>
                                <p className="text-[10px] text-gray-400 font-medium italic">Par {data?.detecteur?.nom || data?.responsable?.nom || 'N/A'} {data?.detecteur?.prenom || data?.responsable?.prenom || ''}</p>
                            </div>
                        </div>

                        {/* Edit Panel */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-white space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="h-3 w-3" />
                                        Description de l'Écart
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-inner"
                                        value={form.description}
                                        onChange={handleInputChange}
                                        disabled={(data?.statut === 'CLOTUREE' || data?.statutNc === 'Clôturé') || !hasPermission(user, 'non_conformites', 'update')}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        Conclusions & Actions Correctives
                                    </label>
                                    <textarea
                                        name="conclusions"
                                        rows={4}
                                        placeholder="Synthèse technique, causes racines et actions de remédiation entreprises..."
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                        value={form.conclusions}
                                        onChange={handleInputChange}
                                        disabled={(data?.statut === 'CLOTUREE' || data?.statutNc === 'Clôturé') || !hasPermission(user, 'non_conformites', 'update')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase de Traitement</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['OUVERTE', 'TRAITEMENT', 'RESOLUE'].map(stat => (
                                            <button
                                                key={stat}
                                                type="button"
                                                onClick={() => setForm({ ...form, statut: stat })}
                                                disabled={(data?.statut === 'CLOTUREE' || data?.statutNc === 'Clôturé') || !hasPermission(user, 'non_conformites', 'update')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    form.statut === stat ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                                                )}
                                            >
                                                {stat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between sticky bottom-0 z-10">
                    <div className="flex items-center gap-4 text-gray-400">
                        <History className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Traçabilité Qualité</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isLecteur(user) ? (
                            <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-black uppercase tracking-widest text-[10px]">
                                <Eye className="h-5 w-5" />
                                Mode Consultation Uniquement
                            </div>
                        ) : (
                            <>
                                {(data?.statut !== 'CLOTUREE' && data?.statutNc !== 'Clôturé') && hasPermission(user, 'non_conformites', 'update') && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={updateMutation.isPending}
                                        className="flex items-center gap-2 px-8 py-3 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100"
                                    >
                                        <Save className="h-4 w-4" />
                                        Enregistrer
                                    </button>
                                )}

                                {(data?.statut !== 'CLOTUREE' && data?.statutNc !== 'Clôturé') && hasPermission(user, 'non_conformites', 'close') && (
                                    <button
                                        onClick={handleCloseNc}
                                        disabled={updateMutation.isPending}
                                        className="flex items-center gap-2 px-8 py-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Clôturer NC
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={closeNcEditModal}
                            className="px-6 py-3 text-xs font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-widest"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

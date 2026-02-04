import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Wrench,
    X,
    Save,
    Cpu,
    ShieldCheck,
    AlertCircle,
    Settings,
    MapPin,
    Calendar,
    PenTool,
    Activity
} from 'lucide-react';
import { equipementsService } from '@/services/equipementsService';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';
import { isLecteur } from '@/utils/permissions';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';
import { Eye } from 'lucide-react';

export default function EquipementEditModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isEquipementEditModalOpen, closeEquipementEditModal, selectedEquipementId } = useModalStore();

    const [form, setForm] = useState<any>({
        designation: '',
        statut_operationnel: '',
        localisation_precise: '',
        fabricant: '',
        modele: '',
    });

    const { data: equipement, isLoading } = useQuery({
        queryKey: ['equipement', selectedEquipementId],
        queryFn: () => equipementsService.getEquipement(selectedEquipementId!),
        enabled: !!selectedEquipementId && isEquipementEditModalOpen,
    });

    useEffect(() => {
        if (equipement) {
            setForm({
                designation: equipement.designation || '',
                statut_operationnel: equipement.statut_operationnel || 'EN_SERVICE',
                localisation_precise: equipement.localisation_precise || '',
                fabricant: equipement.fabricant || '',
                modele: equipement.modele || '',
            });
        }
    }, [equipement]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => equipementsService.updateEquipement(selectedEquipementId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipements'] });
            queryClient.invalidateQueries({ queryKey: ['equipement', selectedEquipementId] });
            toast.success('Données équipement mises à jour');
            closeEquipementEditModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(form);
    };

    if (!isEquipementEditModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-200">
            <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Wrench className="h-8 w-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Maintenance Actif</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-2 py-0.5 rounded uppercase tracking-widest">
                                    {equipement?.code_equipement}
                                </span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">
                                    {equipement?.designation}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={closeEquipementEditModal} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
                        <div className="h-12 w-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Récupération Inventaire...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                        {/* Status Panel */}
                        <div className="lg:w-1/3 bg-gray-50/50 p-8 border-r border-gray-50 overflow-y-auto space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Disponibilité</h3>
                                <div className={cn(
                                    "p-8 rounded-3xl border flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all",
                                    form.statut_operationnel === 'EN_SERVICE' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                        form.statut_operationnel === 'MAINTENANCE' ? "bg-orange-50 border-orange-100 text-orange-600" :
                                            "bg-red-50 border-red-100 text-red-600"
                                )}>
                                    {form.statut_operationnel === 'EN_SERVICE' && <ShieldCheck className="h-10 w-10 mb-2" />}
                                    {form.statut_operationnel === 'MAINTENANCE' && <Settings className="h-10 w-10 mb-2" />}
                                    {form.statut_operationnel === 'HORS_SERVICE' && <AlertCircle className="h-10 w-10 mb-2" />}
                                    <p className="text-2xl font-black uppercase tracking-tighter">{form.statut_operationnel.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modifier le statut</label>
                                <select
                                    name="statut_operationnel"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 shadow-sm disabled:opacity-50"
                                    value={form.statut_operationnel}
                                    onChange={handleInputChange}
                                    disabled={isLecteur(user)}
                                >
                                    <option value="EN_SERVICE">EN SERVICE</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                    <option value="HORS_SERVICE">HORS SERVICE</option>
                                </select>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analyse Criticité</h4>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-3 w-3 rounded-full animate-pulse",
                                        (equipement?.niveau_criticite ?? 0) >= 3 ? "bg-red-500" : "bg-emerald-500"
                                    )} />
                                    <span className="text-sm font-black text-gray-900">Niveau {equipement?.niveau_criticite ?? 'N/A'}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Impact élevé sur la continuité de service en cas de panne majeure.</p>
                            </div>
                        </div>

                        {/* Details Panel */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 bg-white space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Cpu className="h-3 w-3" />
                                        Désignation de l'actif
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner disabled:opacity-60"
                                        value={form.designation}
                                        onChange={handleInputChange}
                                        disabled={isLecteur(user)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        Localisation précise
                                    </label>
                                    <input
                                        type="text"
                                        name="localisation_precise"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner disabled:opacity-60"
                                        value={form.localisation_precise}
                                        onChange={handleInputChange}
                                        disabled={isLecteur(user)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <PenTool className="h-3 w-3" />
                                        Fabricant
                                    </label>
                                    <input
                                        type="text"
                                        name="fabricant"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner disabled:opacity-60"
                                        value={form.fabricant}
                                        onChange={handleInputChange}
                                        disabled={isLecteur(user)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Settings className="h-3 w-3" />
                                        Modèle
                                    </label>
                                    <input
                                        type="text"
                                        name="modele"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner disabled:opacity-60"
                                        value={form.modele}
                                        onChange={handleInputChange}
                                        disabled={isLecteur(user)}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-8 text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 opacity-50" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest">Service depuis</p>
                                        <p className="text-xs font-bold text-gray-700">{equipement?.date_mise_service ? new Date(equipement.date_mise_service).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 opacity-50" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest">Dernier Test</p>
                                        <p className="text-xs font-bold text-gray-700">Il y a 12 jours</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between sticky bottom-0 z-10">
                    <div className="flex items-center gap-4 text-gray-400">
                        <Settings className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gestion de Configuration</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={closeEquipementEditModal}
                            className="px-6 py-3 text-xs font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        {isLecteur(user) ? (
                            <div className="flex items-center gap-3 px-6 py-3 bg-primary-50 border border-primary-100 rounded-2xl text-primary-600 font-black uppercase tracking-widest text-[10px]">
                                <Eye className="h-5 w-5" />
                                Mode Consultation Uniquement
                            </div>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 px-10 py-3 bg-cyan-500 text-white rounded-2xl hover:bg-cyan-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-100"

                            >
                                {updateMutation.isPending ? "Sync..." : (
                                    <>
                                        <Save className="h-4 w-4 text-primary-400" />
                                        Mettre à jour l'actif
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    X,
    Cpu,
    MapPin,
    AlertTriangle,
    Settings,
    Info,
    Activity,
    ArrowRight,
    Zap,
    Box,
    Terminal
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { equipementsService } from '@/services/equipementsService';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function EquipementCreationModal() {
    const { isEquipementCreateModalOpen, closeEquipementCreateModal } = useModalStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        code_equipement: '',
        designation: '',
        description: '',
        categorie_equipement: '',
        sous_categorie: '',
        fabricant: '',
        modele: '',
        numero_serie: '',
        annee_fabrication: '',
        localisation_site: '',
        localisation_precise: '',
        niveau_criticite: 3,
        statut_operationnel: 'EN_SERVICE',
        capacite_nominale: '',
        unite_capacite: '',
        puissance_installee_kw: '',
        conditions_fonctionnement: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => equipementsService.createEquipement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipements'] });
            queryClient.invalidateQueries({ queryKey: ['equipement-stats'] });
            toast.success('Équipement initialisé avec succès', {
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
            closeEquipementCreateModal();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Échec de l\'initialisation technique');
        },
    });

    const resetForm = () => {
        setFormData({
            code_equipement: '',
            designation: '',
            description: '',
            categorie_equipement: '',
            sous_categorie: '',
            fabricant: '',
            modele: '',
            numero_serie: '',
            annee_fabrication: '',
            localisation_site: '',
            localisation_precise: '',
            niveau_criticite: 3,
            statut_operationnel: 'EN_SERVICE',
            capacite_nominale: '',
            unite_capacite: '',
            puissance_installee_kw: '',
            conditions_fonctionnement: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code_equipement || !formData.designation || !formData.localisation_site) {
            toast.error("Veuillez remplir les paramètres obligatoires");
            return;
        }
        createMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'niveau_criticite' ? parseInt(value) : value
        }));
    };

    if (!isEquipementCreateModalOpen) return null;

    const criticalityLevels = [
        { value: 1, label: 'Mineur', color: 'bg-emerald-500' },
        { value: 2, label: 'Important', color: 'bg-amber-500' },
        { value: 3, label: 'Critique', color: 'bg-orange-500' },
        { value: 4, label: 'Vital', color: 'bg-rose-500' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[30px] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.35)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="px-9 py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-13 w-13 rounded-[18px] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-100">
                            <Cpu className="h-6.5 w-6.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                ENREGISTREMENT ÉQUIPEMENT
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1.5">Asset Intelligence Registry</p>
                        </div>
                    </div>
                    <button type="button" onClick={closeEquipementCreateModal} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-4.5 w-4.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 2px, transparent 0)', backgroundSize: '18px 18px' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-9 py-7">
                    <div className="grid grid-cols-12 gap-10">

                        {/* LEFT COLUMN: Configuration */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <Terminal className="h-3 w-3 text-blue-600" /> IDENTIFICATION SYSTÈME
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Asset</label>
                                        <input
                                            type="text"
                                            name="code_equipement"
                                            value={formData.code_equipement}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Ex: PMP-402"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Désignation Technique</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Ex: Pompe Centrifuge Haute Pression"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <Settings className="h-3 w-3 text-blue-600" /> SPÉCIFICATIONS ARCHITECTURE
                                </h4>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                                        <input
                                            type="text"
                                            name="categorie_equipement"
                                            value={formData.categorie_equipement}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Production"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fabricant</label>
                                        <input
                                            type="text"
                                            name="fabricant"
                                            value={formData.fabricant}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Ex: Siemens"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Modèle</label>
                                        <input
                                            type="text"
                                            name="modele"
                                            value={formData.modele}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Ex: NX-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-blue-600" /> LOCALISATION GÉOGRAPHIQUE
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Site / Atelier</label>
                                        <input
                                            type="text"
                                            name="localisation_site"
                                            value={formData.localisation_site}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Ex: Atelier Nord"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Position Précise</label>
                                        <input
                                            type="text"
                                            name="localisation_precise"
                                            value={formData.localisation_precise}
                                            onChange={handleChange}
                                            className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                            placeholder="Ex: Zone 4, Ligne B"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5 opacity-80 mt-1">
                                    <Info className="h-3 w-3 text-blue-500/70" /> DESCRIPTION TECHNIQUE & NOTES
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[12px] font-medium text-slate-700 outline-none hover:bg-white focus:bg-white focus:border-blue-500 transition-all resize-none shadow-inner"
                                    placeholder="Spécifications additionnelles, historique abrégé..."
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Status & Risk */}
                        <div className="col-span-12 lg:col-span-4 space-y-10">

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <AlertTriangle className="h-3 w-3 text-rose-500" /> DIAGNOSTIC CRITICITÉ
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {criticalityLevels.map((l) => (
                                        <button
                                            key={l.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, niveau_criticite: l.value }))}
                                            className={cn(
                                                "w-full px-4.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between",
                                                formData.niveau_criticite === l.value
                                                    ? "bg-slate-900 border-slate-800 text-white shadow-lg"
                                                    : "bg-white border-white text-slate-400 hover:border-slate-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-2.5 w-2.5 rounded-full", l.color)} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">{l.label}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-20">
                                                {Array.from({ length: l.value }).map((_, i) => <Zap key={i} className="h-3 w-3" />)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2px] ml-1 flex items-center gap-1.5">
                                    <Activity className="h-3 w-3 text-emerald-500" /> ÉTAT OPÉRATIONNEL INITIAL
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'EN_SERVICE', label: 'En service actif', color: 'emerald' },
                                        { id: 'MAINTENANCE', label: 'En maintenance', color: 'amber' },
                                        { id: 'HORS_SERVICE', label: 'Hors service technique', color: 'rose' }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, statut_operationnel: s.id }))}
                                            className={cn(
                                                "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                                                formData.statut_operationnel === s.id
                                                    ? "bg-slate-50 border-slate-900 shadow-sm"
                                                    : "bg-white border-transparent hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                                formData.statut_operationnel === s.id ? `bg-${s.color}-500 text-white` : "bg-slate-100 text-slate-400"
                                            )}>
                                                <Activity size={20} />
                                            </div>
                                            <span className={cn("text-[11px] font-black uppercase tracking-widest", formData.statut_operationnel === s.id ? "text-slate-900" : "text-slate-400")}>
                                                {s.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-3">
                                <div className="flex items-center gap-2.5 text-blue-600">
                                    <Box size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Metadata Sync</span>
                                </div>
                                <p className="text-[10px] text-blue-800/70 font-bold leading-relaxed">
                                    Cet équipement sera indexé dans le registre global. Tous les tests et rapports ultérieurs seront rattachés à ce code asset unique.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-9 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={closeEquipementCreateModal} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        Abandonner
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className={cn(
                            "group h-13 px-13 rounded-xl text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-3 transition-all duration-500 relative shadow-2xl overflow-hidden active:scale-[0.98]",
                            createMutation.isPending
                                ? "bg-slate-100 text-slate-300 pointer-events-none grayscale"
                                : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 ring-4 ring-blue-500/10"
                        )}
                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Initialisation...</span>
                            </>
                        ) : (
                            <>
                                Enregistrer Asset
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

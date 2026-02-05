import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    X,
    Gauge,
    Calendar,
    CheckCircle2,
    Activity,
    ArrowRight,
    Zap,
    Terminal,
    MapPin,
    Settings,
    Maximize,
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { instrumentsService } from '@/services/instrumentsService';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function InstrumentCreationModal() {
    const { isInstrumentCreateModalOpen, closeInstrumentCreateModal } = useModalStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        code_instrument: '',
        designation: '',
        type_instrument: '',
        categorie_mesure: 'PRESSION',
        fabricant: '',
        modele: '',
        numero_serie: '',
        precision: '',
        plage_mesure_min: '',
        plage_mesure_max: '',
        unite_mesure: '',
        resolution: '',
        date_acquisition: '',
        date_derniere_calibration: '',
        periodicite_calibration_mois: 12,
        statut: 'OPERATIONNEL',
        localisation: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => instrumentsService.createInstrument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instruments'] });
            queryClient.invalidateQueries({ queryKey: ['instrument-stats'] });
            toast.success('Instrument initialisé avec succès', {
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
            closeInstrumentCreateModal();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Échec de l\'enregistrement métrologique');
        },
    });

    const resetForm = () => {
        setFormData({
            code_instrument: '',
            designation: '',
            type_instrument: '',
            categorie_mesure: 'PRESSION',
            fabricant: '',
            modele: '',
            numero_serie: '',
            precision: '',
            plage_mesure_min: '',
            plage_mesure_max: '',
            unite_mesure: '',
            resolution: '',
            date_acquisition: '',
            date_derniere_calibration: '',
            periodicite_calibration_mois: 12,
            statut: 'OPERATIONNEL',
            localisation: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code_instrument || !formData.designation || !formData.unite_mesure) {
            toast.error("Veuillez remplir les paramètres obligatoires");
            return;
        }
        createMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'periodicite_calibration_mois' ? parseInt(value) : value
        }));
    };

    if (!isInstrumentCreateModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[35px] shadow-[0_50px_130px_-30px_rgba(0,0,0,0.4)] border border-slate-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="px-10 py-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-7 relative z-10">
                        <div className="h-14 w-14 rounded-[20px] bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-100/50">
                            <Gauge className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                INITIALISATION MÉTROLOGIQUE
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3.5px] mt-2">Precision Control Protocol</p>
                        </div>
                    </div>
                    <button type="button" onClick={closeInstrumentCreateModal} className="h-11 w-11 flex items-center justify-center bg-white border border-slate-100 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm group">
                        <X className="h-5 w-5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 0)', backgroundSize: '20px 20px' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-10 py-8">
                    <div className="grid grid-cols-12 gap-10">

                        {/* LEFT COLUMN: Configuration */}
                        <div className="col-span-12 lg:col-span-8 space-y-9">

                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1 flex items-center gap-2">
                                    <Terminal className="h-3.5 w-3.5 text-emerald-600" /> IDENTIFICATION INSTRUMENT
                                </h4>
                                <div className="grid grid-cols-2 gap-7">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block text-left">Code Metro ID</label>
                                        <input
                                            type="text"
                                            name="code_instrument"
                                            value={formData.code_instrument}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            placeholder="Ex: INST-TRM-88"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block text-left">Désignation</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            placeholder="Ex: Capteur Température Laser"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1 flex items-center gap-2">
                                    <Maximize className="h-3.5 w-3.5 text-emerald-600" /> MATRICE DE MESURE
                                </h4>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unité (SI)</label>
                                        <input
                                            type="text"
                                            name="unite_mesure"
                                            value={formData.unite_mesure}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            placeholder="Ex: bar, °C..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plage MIN</label>
                                        <input
                                            type="text"
                                            name="plage_mesure_min"
                                            value={formData.plage_mesure_min}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plage MAX</label>
                                        <input
                                            type="text"
                                            name="plage_mesure_max"
                                            value={formData.plage_mesure_max}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            placeholder="200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Précision</label>
                                        <input
                                            type="text"
                                            name="precision"
                                            value={formData.precision}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[13px] font-black text-emerald-700 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                            placeholder="±0.05"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-emerald-600" /> ARCHITECTURE CALIBRATION
                                </h4>
                                <div className="grid grid-cols-3 gap-7">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dernière Calibration</label>
                                        <input
                                            type="date"
                                            name="date_derniere_calibration"
                                            value={formData.date_derniere_calibration}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Intervalle (Mois)</label>
                                        <input
                                            type="number"
                                            name="periodicite_calibration_mois"
                                            value={formData.periodicite_calibration_mois}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Acquisition</label>
                                        <input
                                            type="date"
                                            name="date_acquisition"
                                            value={formData.date_acquisition}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-7">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1 flex items-center gap-2">
                                        <Settings className="h-3.5 w-3.5 text-emerald-600" /> TYPE D'UNITÉ
                                    </label>
                                    <input
                                        type="text"
                                        name="type_instrument"
                                        value={formData.type_instrument}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                        placeholder="Ex: Manomètre Digital"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-600" /> LOCALISATION
                                    </label>
                                    <input
                                        type="text"
                                        name="localisation"
                                        value={formData.localisation}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                                        placeholder="Ex: Labo Métrologie, Armoire B1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LifeCycle & Status */}
                        <div className="col-span-12 lg:col-span-4 space-y-10">

                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1 flex items-center gap-2">
                                    <Activity className="h-3.5 w-3.5 text-emerald-600" /> ÉTAT MÉTROLOGIQUE
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'OPERATIONNEL', label: 'CERTIFIÉ / ACTIF', color: 'emerald' },
                                        { id: 'CALIBRATION', label: 'SYNCHRONISATION', color: 'amber' },
                                        { id: 'HORS_SERVICE', label: 'HORS TOLÉRANCE', color: 'rose' }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, statut: s.id }))}
                                            className={cn(
                                                "w-full p-4.5 rounded-2xl border-2 transition-all flex items-center gap-5",
                                                formData.statut === s.id
                                                    ? `bg-slate-900 border-slate-800 text-white shadow-xl`
                                                    : "bg-white border-transparent hover:bg-slate-50 text-slate-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-11 w-11 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                                formData.statut === s.id ? `bg-${s.color}-500 text-white shadow-${s.color}-200/50` : "bg-slate-100 text-slate-400"
                                            )}>
                                                <Zap size={22} className={formData.statut === s.id ? "fill-current" : ""} />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-left">
                                                {s.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] ml-1">IDENTIFIANTS TECHNIQUE</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Constructeur & Modèle</p>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                name="fabricant"
                                                value={formData.fabricant}
                                                onChange={handleChange}
                                                className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold outline-none border-transparent focus:border-emerald-500 transition-all font-mono"
                                                placeholder="MARQUE"
                                            />
                                            <input
                                                type="text"
                                                name="modele"
                                                value={formData.modele}
                                                onChange={handleChange}
                                                className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold outline-none border-transparent focus:border-emerald-500 transition-all font-mono"
                                                placeholder="MODÈLE"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50/30 p-5 border border-emerald-100/50 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-2.5 text-emerald-600">
                                            <CheckCircle2 size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Calibration Assurance</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-900/60 font-medium leading-relaxed italic">
                                            "L'intégrité de la chaîne de mesure dépend de la précision initiale déclarée ici. Assurez-vous des certificats constructeurs."
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>

                <div className="px-10 py-6 bg-white border-t border-slate-50 flex items-center justify-between">
                    <button type="button" onClick={closeInstrumentCreateModal} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-slate-900 transition-all">
                        Abandonner
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className={cn(
                            "group h-13 px-13 rounded-[20px] text-[11.5px] font-black uppercase tracking-[3.5px] flex items-center gap-4 transition-all duration-500 relative shadow-2xl overflow-hidden active:scale-[0.98]",
                            createMutation.isPending
                                ? "bg-slate-100 text-slate-300 pointer-events-none grayscale"
                                : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 ring-4 ring-emerald-500/10"
                        )}
                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Analyse...</span>
                            </>
                        ) : (
                            <>
                                Initialiser Node
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

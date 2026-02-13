import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    X,
    Save,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Settings2,
    Activity,
    Info,
    AlertCircle,
    Zap
} from 'lucide-react';
import { designerService } from '@/services/designerService';
import { instrumentsService } from '@/services/instrumentsService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

interface MethodItem {
    id_item?: string;
    numero_item: number;
    libelle: string;
    type_verif: string;
    valeur_reference?: string;
    tolerance?: string;
    unite_mesure?: string;
    obligatoire: boolean;
    criticite?: number;
}

export default function MethodDesignerModal() {
    const queryClient = useQueryClient();
    const { isMethodDesignerModalOpen, closeMethodDesignerModal, selectedTypeTestId } = useModalStore();

    const [items, setItems] = useState<MethodItem[]>([]);
    const [headerInfo, setHeaderInfo] = useState({
        titre: '',
        code_checklist: '',
        version: '1.0'
    });

    // Fetch existing checklist
    const { data: checklistData, isLoading } = useQuery({
        queryKey: ['method-designer', selectedTypeTestId],
        queryFn: () => designerService.getChecklist(selectedTypeTestId!),
        enabled: !!selectedTypeTestId && isMethodDesignerModalOpen,
    });

    // Fetch instruments to get available units
    const { data: instrumentsData } = useQuery({
        queryKey: ['instruments-list'],
        queryFn: () => instrumentsService.getPaginatedInstruments({ per_page: 100 }),
        enabled: isMethodDesignerModalOpen,
    });

    const availableUnits = useMemo(() => {
        if (!instrumentsData?.data) return [];
        const units = instrumentsData.data
            .map(i => i.unite_mesure)
            .filter((u, index, self) => u && self.indexOf(u) === index);
        return units;
    }, [instrumentsData]);

    useEffect(() => {
        if (checklistData) {
            setHeaderInfo({
                titre: checklistData.titre,
                code_checklist: checklistData.code_checklist,
                version: checklistData.version || '1.0'
            });
            const mappedItems = (checklistData.items || []).map(item => ({
                ...item,
                valeur_reference: item.valeur_reference || '',
                tolerance: item.tolerance || '',
                unite_mesure: item.unite_mesure || ''
            }));
            setItems(mappedItems);
        } else {
            setHeaderInfo({ titre: '', code_checklist: '', version: '1.0' });
            setItems([]);
        }
    }, [checklistData]);

    const mutation = useMutation({
        mutationFn: (data: any) => designerService.saveChecklist(selectedTypeTestId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['method-designer', selectedTypeTestId] });
            toast.success('Méthode de contrôle déployée au parc industriel');
            closeMethodDesignerModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Écart détecté lors du déploiement');
        }
    });

    const addItem = () => {
        const newItem: MethodItem = {
            numero_item: items.length + 1,
            libelle: '',
            type_verif: 'MEASURE',
            valeur_reference: '',
            tolerance: '0.05',
            unite_mesure: '',
            obligatoire: true,
            criticite: 2
        };
        setItems([...items, newItem]);
    };

    const updateItem = (index: number, field: keyof MethodItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, numero_item: i + 1 }));
        setItems(newItems);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        const reordered = newItems.map((item, i) => ({ ...item, numero_item: i + 1 }));
        setItems(reordered);
    };

    const handleSave = () => {
        if (!headerInfo.titre || !headerInfo.code_checklist) {
            toast.error('Veuillez compléter le registre identitaire');
            return;
        }
        if (items.length === 0) {
            toast.error('Protocole vide : aucune vérification détectée');
            return;
        }
        mutation.mutate({
            ...headerInfo,
            items: items
        });
    };

    if (!isMethodDesignerModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-white/40"
            >
                {/* 1. Integrated Header HUD */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white/50 relative">
                    <div className="flex items-center gap-8">
                        <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group hover:rotate-6 transition-transform">
                            <Settings2 className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Proto.Designer</h2>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100 uppercase tracking-widest">v{headerInfo.version}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-indigo-500" />
                                Ingénierie des flux techniques • Mode Configuration Experte
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end pr-6 border-r border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Système Node</span>
                            <span className="text-sm font-black text-emerald-500 uppercase flex items-center gap-2">
                                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                Opérationnel
                            </span>
                        </div>
                        <button
                            onClick={closeMethodDesignerModal}
                            className="p-4 bg-white/80 border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 rounded-2xl transition-all text-slate-400 group shadow-sm active:scale-95"
                        >
                            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* 2. Control Sidebar (Premium) */}
                    <div className="w-85 border-r border-slate-100 p-10 space-y-10 bg-slate-50/20 overflow-y-auto no-scrollbar">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                <Info className="h-4 w-4 text-indigo-500" />
                                Paramètres Core
                            </h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Label Protocole</label>
                                    <input
                                        type="text"
                                        placeholder="Identification visuelle..."
                                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[13px] text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all shadow-sm"
                                        value={headerInfo.titre}
                                        onChange={(e) => setHeaderInfo({ ...headerInfo, titre: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Technique (Réf)</label>
                                    <input
                                        type="text"
                                        placeholder="REF-NODE-XXX"
                                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[13px] text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all shadow-sm"
                                        value={headerInfo.code_checklist}
                                        onChange={(e) => setHeaderInfo({ ...headerInfo, code_checklist: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Itération Logicielle</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="1.0"
                                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[13px] text-slate-800 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                                            value={headerInfo.version}
                                            onChange={(e) => setHeaderInfo({ ...headerInfo, version: e.target.value })}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[8px] font-black text-slate-400">BUILD</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group border border-white/10">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-2">
                                <Zap className="h-4 w-4 fill-current" />
                                R&D Insights
                            </h4>
                            <p className="text-[11px] font-bold leading-relaxed italic opacity-85">
                                "La rigueur des tolérances définit la <span className="text-indigo-400">qualité prédictive</span>. Un écart de 0.05v sur un capteur N4 peut anticiper un arrêt critique de 72h."
                            </p>
                        </section>
                    </div>

                    {/* 3. Steps Canvas (Designer) */}
                    <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-white no-scrollbar">
                        <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-20 pb-6 mb-2 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Flow Technique ({items.length} Étapes)</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Séquencement interactif des contrôles</p>
                                </div>
                            </div>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                            >
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                                Injecter une Étape
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialisation du Canvas...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 border-[3px] border-dashed border-slate-50 rounded-[4rem] text-slate-200 group hover:border-indigo-100/50 transition-all">
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                                    <Activity className="h-20 w-20 mb-8 opacity-10 group-hover:opacity-20 transition-opacity" />
                                </motion.div>
                                <p className="font-black uppercase text-xs tracking-[0.3em] opacity-30 group-hover:opacity-50 transition-opacity">Sequence vide • Prêt pour injection</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={index}
                                        className="group bg-slate-50/50 hover:bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 space-y-8 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-2 h-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" />

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="h-12 w-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl group-hover:rotate-6 transition-transform">
                                                    {String(item.numero_item).padStart(2, '0')}
                                                </div>
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Libellé du point de contrôle..."
                                                        className="bg-transparent border-none focus:ring-0 outline-none font-black text-slate-900 text-xl w-[450px] placeholder:text-slate-200 transition-all uppercase tracking-tighter"
                                                        value={item.libelle}
                                                        onChange={(e) => updateItem(index, 'libelle', e.target.value)}
                                                    />
                                                    <div className="h-0.5 w-full bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => moveItem(index, 'up')} className="p-3 bg-white border border-slate-100 hover:bg-white hover:text-indigo-600 rounded-xl text-slate-300 transition-all shadow-sm active:scale-90"><MoveUp className="h-4 w-4" /></button>
                                                <button onClick={() => moveItem(index, 'down')} className="p-3 bg-white border border-slate-100 hover:bg-white hover:text-indigo-600 rounded-xl text-slate-300 transition-all shadow-sm active:scale-90"><MoveDown className="h-4 w-4" /></button>
                                                <button onClick={() => removeItem(index)} className="p-3 bg-white border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 rounded-xl text-slate-300 transition-all shadow-sm active:scale-90"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 relative z-10">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de Logique</label>
                                                <select
                                                    className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-2xl font-black text-[11px] text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm uppercase tracking-widest"
                                                    value={item.type_verif}
                                                    onChange={(e) => updateItem(index, 'type_verif', e.target.value)}
                                                >
                                                    <option value="MEASURE">Vecteur Numérique</option>
                                                    <option value="VISUAL">Audit Visuel (P/F)</option>
                                                    <option value="SENSORY">Analyse Sensorielle</option>
                                                </select>
                                            </div>

                                            {item.type_verif === 'MEASURE' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cible Réf.</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-2xl font-black text-[11px] text-slate-900 placeholder:text-slate-200 outline-none transition-all shadow-sm"
                                                            placeholder="VALEUR"
                                                            value={item.valeur_reference}
                                                            onChange={(e) => updateItem(index, 'valeur_reference', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Delta (±)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-2xl font-black text-[11px] text-indigo-600 placeholder:text-slate-200 outline-none transition-all shadow-sm"
                                                            placeholder="TOLÉRANCE"
                                                            value={item.tolerance}
                                                            onChange={(e) => updateItem(index, 'tolerance', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unité Métrique</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                list="instrument-units"
                                                                className="w-full bg-indigo-50/50 border border-indigo-100 px-4 py-3.5 rounded-2xl font-black text-[11px] text-indigo-700 placeholder:text-indigo-300 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm uppercase italic"
                                                                placeholder="UNITÉ LIÉE"
                                                                value={item.unite_mesure}
                                                                onChange={(e) => updateItem(index, 'unite_mesure', e.target.value)}
                                                            />
                                                            <datalist id="instrument-units">
                                                                {availableUnits.map(unit => (
                                                                    <option key={unit} value={unit} />
                                                                ))}
                                                            </datalist>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Criticité Impact</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4].map(n => (
                                                        <button
                                                            key={n}
                                                            onClick={() => updateItem(index, 'criticite', n)}
                                                            className={cn(
                                                                "flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter",
                                                                item.criticite === n
                                                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                                                    : "bg-white border border-slate-100 text-slate-300 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            N{n}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Functional Footer HUD */}
                <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
                    <div className="flex items-center gap-4 text-rose-500 bg-rose-50 px-8 py-3.5 rounded-2xl border border-rose-100">
                        <AlertCircle className="h-5 w-5 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Attention : Mise à jour affecte les cycles futurs</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={closeMethodDesignerModal}
                            className="px-8 py-4 text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest group"
                        >
                            Abandonner <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" />
                            {mutation.isPending ? 'SYNCHRONISATION...' : 'Déployer au Parc'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    CheckCircle2
} from 'lucide-react';
import { designerService } from '@/services/designerService';
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

    useEffect(() => {
        if (checklistData) {
            setHeaderInfo({
                titre: checklistData.titre,
                code_checklist: checklistData.code_checklist,
                version: checklistData.version || '1.0'
            });
            // Map items to ensure the state has the correct structure
            const mappedItems = (checklistData.items || []).map(item => ({
                ...item,
                valeur_reference: item.valeur_reference || '',
                tolerance: item.tolerance || ''
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
            toast.success('Méthode de contrôle enregistrée avec succès');
            closeMethodDesignerModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    });

    const addItem = () => {
        const newItem: MethodItem = {
            numero_item: items.length + 1,
            libelle: '',
            type_verif: 'MEASURE',
            valeur_reference: '',
            tolerance: '0.05',
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

        // Update order numbers
        const reordered = newItems.map((item, i) => ({ ...item, numero_item: i + 1 }));
        setItems(reordered);
    };

    const handleSave = () => {
        if (!headerInfo.titre || !headerInfo.code_checklist) {
            toast.error('Veuillez remplir les informations générales');
            return;
        }
        if (items.length === 0) {
            toast.error('Veuillez ajouter au moins une étape de contrôle');
            return;
        }
        mutation.mutate({
            ...headerInfo,
            items: items
        });
    };

    if (!isMethodDesignerModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                            <Settings2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Designer de Méthodes</h2>
                            <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">Conception des protocoles d'expertise industrielle</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end px-6 border-r border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Status</span>
                            <span className="text-sm font-black text-emerald-500 uppercase flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Connecté au Système
                            </span>
                        </div>
                        <button
                            onClick={closeMethodDesignerModal}
                            className="p-4 hover:bg-red-50 hover:text-red-500 rounded-[1.5rem] transition-all text-gray-400 group"
                        >
                            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Configuration Sidebar */}
                    <div className="w-80 border-r border-gray-50 p-8 space-y-8 bg-gray-50/30 overflow-y-auto">
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Info className="h-3 w-3" /> Général
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-700 uppercase ml-1">Titre de la Méthode</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Protocole Vibratoire v2"
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        value={headerInfo.titre}
                                        onChange={(e) => setHeaderInfo({ ...headerInfo, titre: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-700 uppercase ml-1">Numéro Référentiel</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: REF-METH-001"
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        value={headerInfo.code_checklist}
                                        onChange={(e) => setHeaderInfo({ ...headerInfo, code_checklist: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-700 uppercase ml-1">Version</label>
                                    <input
                                        type="text"
                                        placeholder="1.0"
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        value={headerInfo.version}
                                        onChange={(e) => setHeaderInfo({ ...headerInfo, version: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Conseil d'Expert</h4>
                            <p className="text-xs font-medium leading-relaxed italic">
                                "Définissez des seuils de tolérance stricts pour les machines de criticité N4 afin de prévenir les arrêts non-planifiés."
                            </p>
                        </section>
                    </div>

                    {/* Right: Steps Designer */}
                    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                                <Activity className="h-6 w-6 text-indigo-600" />
                                Étapes de Contrôle ({items.length})
                            </h3>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                            >
                                <Plus className="h-4 w-4" /> Ajouter une Étape
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className="h-12 w-12 bg-gray-100 rounded-full mb-4" />
                                <div className="h-4 w-48 bg-gray-50 rounded" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-[3rem] text-gray-300">
                                <Activity className="h-16 w-16 mb-4 opacity-20" />
                                <p className="font-black uppercase text-sm tracking-widest">Aucune étape définie pour ce protocole</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="group bg-gray-50/50 hover:bg-white p-6 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:shadow-xl transition-all duration-300 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="h-10 w-10 flex items-center justify-center bg-gray-900 text-white rounded-2xl font-black text-xs shadow-lg">
                                                    {item.numero_item}
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="Libellé de l'étape / Point de contrôle..."
                                                    className="bg-transparent border-b-2 border-transparent focus:border-indigo-600 outline-none font-black text-gray-900 text-lg w-96 transition-all"
                                                    value={item.libelle}
                                                    onChange={(e) => updateItem(index, 'libelle', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => moveItem(index, 'up')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><MoveUp className="h-4 w-4" /></button>
                                                <button onClick={() => moveItem(index, 'down')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><MoveDown className="h-4 w-4" /></button>
                                                <button onClick={() => removeItem(index)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type de Vérif</label>
                                                <select
                                                    className="w-full bg-white border border-gray-100 p-3 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/10"
                                                    value={item.type_verif}
                                                    onChange={(e) => updateItem(index, 'type_verif', e.target.value)}
                                                >
                                                    <option value="MEASURE">Mesure Numérique</option>
                                                    <option value="VISUAL">Contrôle Visuel (Pass/Fail)</option>
                                                    <option value="SENSORY">Contrôle Sensoriel</option>
                                                </select>
                                            </div>

                                            {item.type_verif === 'MEASURE' && (
                                                <>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Valeur Réf.</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white border border-gray-100 p-3 rounded-xl font-bold text-xs"
                                                            placeholder="Ex: 5.0"
                                                            value={item.valeur_reference}
                                                            onChange={(e) => updateItem(index, 'valeur_reference', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tolérance (±)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white border border-gray-100 p-3 rounded-xl font-bold text-xs"
                                                            placeholder="Ex: 0.2"
                                                            value={item.tolerance}
                                                            onChange={(e) => updateItem(index, 'tolerance', e.target.value)}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Criticité</label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map(n => (
                                                        <button
                                                            key={n}
                                                            onClick={() => updateItem(index, 'criticite', n)}
                                                            className={cn(
                                                                "flex-1 py-2 rounded-lg text-[10px] font-black transition-all",
                                                                item.criticite === n
                                                                    ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                                                                    : "bg-white border border-gray-50 text-gray-300 hover:bg-gray-100"
                                                            )}
                                                        >
                                                            N{n}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-white relative overflow-hidden">
                    <div className="flex items-center gap-3 text-red-500 bg-red-50 px-6 py-3 rounded-2xl animate-pulse">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Toute modification impactera les futurs rapports</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={closeMethodDesignerModal}
                            className="px-8 py-4 text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest"
                        >
                            Annuler les changements
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="flex items-center gap-3 px-12 py-5 bg-gray-900 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-[0.1em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" />
                            {mutation.isPending ? 'SYNCHRONISATION...' : 'DÉPLOYER LA MÉTHODE'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

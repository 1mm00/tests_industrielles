import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { cn } from '@/utils/helpers';
import {
    AlertCircle,
    CheckCircle2,
    Save,
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { ItemChecklist, InstrumentMesure } from '@/types';
import toast from 'react-hot-toast';

interface Props {
    testId: string;
    items: ItemChecklist[];
    instrument?: InstrumentMesure;
    isLocked: boolean;
}

export default function AcquisitionStream({ testId, items, instrument, isLocked }: Props) {
    const queryClient = useQueryClient();
    const [values, setValues] = useState<Record<string, string>>({});
    const [verdicts, setVerdicts] = useState<Record<string, boolean | null>>({});
    const [conditions, setConditions] = useState<Record<string, { temp: string, hum: string, pressure: string, obs: string }>>({});

    // Cycle de vie des points de test
    const [submittedItems, setSubmittedItems] = useState<Record<string, boolean>>({});
    const [editingItems, setEditingItems] = useState<Record<string, boolean>>({});

    const saveMutation = useMutation({
        mutationFn: ({ item, value, conforme, condStr }: { item: ItemChecklist; value: any; conforme: boolean; condStr?: any }) =>
            testsService.addTestMesure(testId, {
                item_id: item.id_item,
                criticite: item.criticite || 1,
                instrument_id: instrument?.id_instrument || null,
                type_mesure: item.type_verif,
                parametre_mesure: item.libelle,
                valeur_mesuree: parseFloat(value.toString().replace(',', '.')),
                unite_mesure: instrument?.unite_mesure || 'N/A',
                valeur_reference: item.valeur_reference ? parseFloat(item.valeur_reference) : null,
                tolerance_min: item.tolerance ? parseFloat(item.tolerance) : 0,
                tolerance_max: item.tolerance ? parseFloat(item.tolerance) : 0,
                conforme: conforme,
                conditions_mesure: condStr || null,
                incertitude_mesure: instrument?.precision || null,
                timestamp_mesure: new Date().toISOString()
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['test', testId] });
            // Verrouiller après succès
            setSubmittedItems(prev => ({ ...prev, [variables.item.id_item]: true }));
            setEditingItems(prev => ({ ...prev, [variables.item.id_item]: false }));
        }
    });

    const handleValueChange = (itemId: string, val: string, item: ItemChecklist) => {
        setValues(prev => ({ ...prev, [itemId]: val }));

        if (item.type_verif === 'MEASURE' && item.valeur_reference && item.tolerance) {
            const numVal = parseFloat(val.replace(',', '.'));
            const ref = parseFloat(item.valeur_reference);
            const tol = parseFloat(item.tolerance);

            if (!isNaN(numVal) && !isNaN(ref) && !isNaN(tol)) {
                const conforme = (numVal >= (ref - tol)) && (numVal <= (ref + tol));
                const previousVerdict = verdicts[itemId];

                if (previousVerdict !== conforme) {
                    if (conforme) {
                        toast.success(`Valeur Conforme détectée (${val})`, {
                            icon: '✅',
                            duration: 2000,
                        });
                    } else {
                        toast.error(`Hors-tolérance détecté (${val})`, {
                            icon: '⚠️',
                            duration: 2000,
                        });
                    }
                }

                setVerdicts(prev => ({ ...prev, [itemId]: conforme }));
            }
        }
    };

    const updateCondition = (itemId: string, field: keyof typeof conditions[string], val: string) => {
        setConditions(prev => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || { temp: '', hum: '', pressure: '', obs: '' }),
                [field]: val
            }
        }));
    };

    const submitPoint = async (item: ItemChecklist) => {
        const val = values[item.id_item];
        const conforme = verdicts[item.id_item] ?? false;
        const condObj = conditions[item.id_item];

        if (val === undefined || val === '') {
            toast.error('Veuillez saisir une valeur avant de valider.');
            return;
        }

        try {
            await toast.promise(
                saveMutation.mutateAsync({
                    item: item,
                    value: val,
                    conforme,
                    condStr: condObj // Passage de l'objet structuré
                }),
                {
                    loading: `Envoi du point ${item.numero_item}...`,
                    success: `Point ${item.numero_item} validé (${conforme ? 'Conforme' : 'Non-Conforme'})`,
                    error: 'Erreur lors de l\'enregistrement'
                }
            );
        } catch (error) {
            console.error("Erreur saving:", error);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Flux d'acquisition des données</span>
                </div>
            </div>

            {items.map((item) => {
                const isSubmitted = !!submittedItems[item.id_item];
                const isEditing = !!editingItems[item.id_item];
                const isLockedLocal = (isLocked || isSubmitted) && !isEditing;

                return (
                    <div
                        key={item.id_item}
                        className={cn(
                            "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                            isSubmitted ? "border-emerald-100 shadow-sm opacity-90" : "border-slate-100 shadow-xl shadow-slate-200/40 border-l-4 border-l-blue-600"
                        )}
                    >
                        {/* Header Item */}
                        <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 flex items-center justify-center bg-slate-900 text-white rounded-lg font-black text-xs shadow-lg shadow-slate-200">
                                    {item.numero_item.toString().padStart(2, '0')}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.libelle}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-100">
                                            Méthode: {item.type_verif}
                                        </span>
                                        {item.obligatoire && (
                                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-widest border border-amber-100">
                                                Obligatoire
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {item.criticite && item.criticite >= 3 && (
                                <div className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[2px]">
                                    CRITIQUE LVL {item.criticite}
                                </div>
                            )}
                        </div>

                        <div className="p-2 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                <div className="md:col-span-8 space-y-3">
                                    {item.type_verif === 'MEASURE' ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                                {/* Saisie Valeur Principal */}
                                                <div className="md:col-span-12 lg:col-span-8">
                                                    <div className="flex flex-col sm:flex-row gap-6 items-end">
                                                        <div className="flex-1 w-full">
                                                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                                                                Saisie de la Valeur ({instrument?.unite_mesure || 'UNIT'})
                                                            </label>
                                                            <div className="relative group">
                                                                <input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    className={cn(
                                                                        "w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 font-black text-xl outline-none transition-all tabular-nums",
                                                                        "focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 placeholder:text-slate-200 group-hover:border-slate-300",
                                                                        verdicts[item.id_item] === true ? "border-emerald-500 bg-emerald-50/10" :
                                                                            verdicts[item.id_item] === false ? "border-rose-500 bg-rose-50/10" : ""
                                                                    )}
                                                                    value={values[item.id_item] || ''}
                                                                    onChange={(e) => handleValueChange(item.id_item, e.target.value, item)}
                                                                    disabled={isLockedLocal}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Bloc Paramètres Attendus */}
                                                        {item.valeur_reference && (
                                                            <div className="w-full sm:w-auto min-w-[170px] h-[52px] bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col justify-center shadow-sm">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard de Référence</p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-lg font-black text-slate-800 tabular-nums">{item.valeur_reference}</span>
                                                                    <span className="text-[10px] font-black text-slate-400 px-1.5 py-0.5 bg-white rounded-md border border-slate-100">± {item.tolerance || '0'}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Conditions Terrain - Ligne Horizontale Propre */}
                                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-1 w-8 bg-slate-200 rounded-full" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Conditions d'Acquisition Automatiques</span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Température (°C)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="22.5"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300"
                                                            value={conditions[item.id_item]?.temp || ''}
                                                            onChange={(e) => updateCondition(item.id_item, 'temp', e.target.value)}
                                                            disabled={isLockedLocal}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Humidité (%)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="45"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300"
                                                            value={conditions[item.id_item]?.hum || ''}
                                                            onChange={(e) => updateCondition(item.id_item, 'hum', e.target.value)}
                                                            disabled={isLockedLocal}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pression (hPa)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="1013"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300"
                                                            value={conditions[item.id_item]?.pressure || ''}
                                                            onChange={(e) => updateCondition(item.id_item, 'pressure', e.target.value)}
                                                            disabled={isLockedLocal}
                                                        />
                                                    </div>
                                                    <div className="space-y-1 md:col-span-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Observations terrain</label>
                                                        <textarea
                                                            rows={1}
                                                            placeholder="Notes ou conditions spécifiques..."
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 resize-none"
                                                            value={conditions[item.id_item]?.obs || ''}
                                                            onChange={(e) => updateCondition(item.id_item, 'obs', e.target.value)}
                                                            disabled={isLockedLocal}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : item.type_verif === 'VISUAL' ? (
                                        <div className="flex gap-3">
                                            <button
                                                disabled={isLockedLocal}
                                                onClick={() => {
                                                    setValues(prev => ({ ...prev, [item.id_item]: 'OK' }));
                                                    setVerdicts(prev => ({ ...prev, [item.id_item]: true }));
                                                }}
                                                className={cn(
                                                    "flex-1 py-1.5 px-3 rounded-lg border font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2",
                                                    values[item.id_item] === 'OK'
                                                        ? "bg-emerald-600 border-emerald-700 text-white shadow-sm"
                                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                                                    isLockedLocal && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Conforme
                                            </button>
                                            <button
                                                disabled={isLockedLocal}
                                                onClick={() => {
                                                    setValues(prev => ({ ...prev, [item.id_item]: 'NOK' }));
                                                    setVerdicts(prev => ({ ...prev, [item.id_item]: false }));
                                                }}
                                                className={cn(
                                                    "flex-1 py-1.5 px-3 rounded-lg border font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2",
                                                    values[item.id_item] === 'NOK'
                                                        ? "bg-rose-600 border-rose-700 text-white shadow-sm"
                                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                                                    isLockedLocal && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                Défaut Détecté
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Notes et observations</label>
                                            <textarea
                                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 font-medium text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                placeholder="Saisissez vos observations ici..."
                                                rows={2}
                                                value={values[item.id_item] || ''}
                                                onChange={(e) => handleValueChange(item.id_item, e.target.value, item)}
                                                disabled={isLockedLocal}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Action Block - Centré au milieu pour accès rapide */}
                                <div className="md:col-span-12 flex flex-col items-center pt-2">
                                    <button
                                        onClick={() => {
                                            if (isSubmitted && !isEditing) {
                                                setEditingItems(prev => ({ ...prev, [item.id_item]: true }));
                                            } else {
                                                submitPoint(item);
                                            }
                                        }}
                                        disabled={(!isEditing && isLocked) || saveMutation.isPending || (!isSubmitted && !values[item.id_item])}
                                        className={cn(
                                            "w-full max-w-sm py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 shadow-lg",
                                            isSubmitted && !isEditing
                                                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
                                                : values[item.id_item] || isEditing
                                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200"
                                                    : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100"
                                        )}
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                        {isSubmitted && !isEditing
                                            ? "Modifier le point relevé"
                                            : isEditing
                                                ? "Mettre à jour le point"
                                                : "Valider le point déterminé"}
                                    </button>
                                    <p className="mt-1 text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Enregistrement automatique</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

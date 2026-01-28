import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Activity,
    X,
    Play,
    CheckCircle2,
    Trash2,
    Clock,
    Plus,
    AlertTriangle,
    Thermometer
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function TestExecutionModal() {
    const queryClient = useQueryClient();
    const { isExecutionModalOpen, closeExecutionModal, selectedTestId } = useModalStore();

    const [newMeasure, setNewMeasure] = useState({
        type_mesure: 'TECHNIQUE',
        parametre_mesure: '',
        valeur_mesuree: '',
        unite_mesure: '',
        valeur_reference: '',
        tolerance_min: '0.05',
        tolerance_max: '0.05',
        instrument_id: '',
    });

    // Fetch test details
    const { data: rawData, isLoading: isLoadingTest, error: testError } = useQuery({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: !!selectedTestId && isExecutionModalOpen,
    });

    // Robust extraction: API returns { success: true, data: test }
    // But testsService.getTest already extracts response.data.data
    const test = rawData;

    // Fetch measures
    const { data: mesures } = useQuery({
        queryKey: ['test-mesures', selectedTestId],
        queryFn: () => testsService.getTestMesures(selectedTestId!),
        enabled: !!selectedTestId && isExecutionModalOpen,
    });

    const startMutation = useMutation({
        mutationFn: () => testsService.startTest(selectedTestId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', selectedTestId] });
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast.success('Test démarré ! Statut mis à jour.');
        }
    });

    const finishMutation = useMutation({
        mutationFn: () => testsService.finishTest(selectedTestId!, {
            resultat_global: 'CONFORME',
            observations: 'Test finalisé via interface expertise.'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', selectedTestId] });
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast.success('Test finalisé ! Résultats calculés.');
            closeExecutionModal();
        }
    });

    const addMeasureMutation = useMutation({
        mutationFn: (data: any) => testsService.addTestMesure(selectedTestId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test-mesures', selectedTestId] });
            toast.success('Mesure enregistrée');
            setNewMeasure(prev => ({ ...prev, parametre_mesure: '', valeur_mesuree: '' }));
        }
    });

    const deleteMeasureMutation = useMutation({
        mutationFn: (id: string) => testsService.deleteMesure(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test-mesures', selectedTestId] });
            toast.success('Mesure supprimée');
        }
    });

    if (!isExecutionModalOpen) return null;

    const handleAddMeasure = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMeasure.parametre_mesure || !newMeasure.valeur_mesuree) {
            toast.error('Veuillez remplir les champs obligatoires');
            return;
        }
        addMeasureMutation.mutate(newMeasure);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Activity className="h-8 w-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Exécution & Mesures</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-2 py-0.5 rounded uppercase tracking-widest">
                                    {test?.numero_test}
                                </span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">
                                    {test?.equipement?.designation}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={closeExecutionModal} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Left Panel: Info & Actions */}
                    <div className="lg:w-1/3 bg-gray-50/50 p-8 border-r border-gray-50 flex flex-col gap-6 overflow-y-auto">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Statut Opérationnel</h3>

                            {/* Debug Panel */}
                            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs space-y-1">
                                <p className="font-bold text-red-600">DEBUG:</p>
                                <p>Statut brut: {test?.statut_test || 'NON DÉFINI'}</p>
                                <p>Test ID: {selectedTestId}</p>
                                <p>Test chargé: {test ? 'OUI' : 'NON'}</p>
                                <p>Chargement: {isLoadingTest ? 'EN COURS...' : 'TERMINÉ'}</p>
                                {testError && (
                                    <p className="text-red-600">
                                        ERREUR: {(testError as any)?.message || 'Erreur inconnue'}
                                    </p>
                                )}
                                {test && (
                                    <>
                                        <p className="text-green-600">✓ Données reçues</p>
                                        <p>Équipement: {test.equipement?.designation || 'N/A'}</p>
                                    </>
                                )}
                            </div>

                            <div className={cn(
                                "p-6 rounded-3xl border flex flex-col items-center justify-center text-center gap-2 transition-all shadow-sm",
                                test?.statut_test?.toUpperCase() === 'PLANIFIE' ? "bg-amber-50 border-amber-100 text-amber-600" :
                                    test?.statut_test?.toUpperCase() === 'EN_COURS' ? "bg-emerald-50 border-emerald-100 text-emerald-600 animate-pulse" :
                                        "bg-blue-50 border-blue-100 text-blue-600"
                            )}>
                                {test?.statut_test?.toUpperCase() === 'PLANIFIE' && <Clock className="h-8 w-8 mb-1" />}
                                {test?.statut_test?.toUpperCase() === 'EN_COURS' && <Activity className="h-8 w-8 mb-1" />}
                                {test?.statut_test?.toUpperCase() === 'TERMINE' && <CheckCircle2 className="h-8 w-8 mb-1" />}
                                <p className="text-xl font-black uppercase tracking-tighter">{test?.statut_test || 'INCONNU'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {test?.statut_test?.toUpperCase() === 'PLANIFIE' && (
                                <button
                                    onClick={() => startMutation.mutate()}
                                    disabled={startMutation.isPending}
                                    className="w-full py-4 bg-sky-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-sky-600 transition-all shadow-xl shadow-sky-100 disabled:opacity-50"
                                >
                                    <Play className="h-5 w-5" />
                                    DÉMARRER LA SESSION
                                </button>
                            )}

                            {test?.statut_test?.toUpperCase() === 'EN_COURS' && (
                                <button
                                    onClick={() => finishMutation.mutate()}
                                    disabled={finishMutation.isPending}
                                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    FINALISER & CALCULER
                                </button>
                            )}
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Détails Techniques</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase">Type</span>
                                    <span className="font-black text-gray-700">{test?.type_test?.libelle || test?.type_test?.code_type || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase">Localisation</span>
                                    <span className="font-black text-gray-700">{test?.localisation}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase">Criticité</span>
                                    <span className={cn(
                                        "font-black",
                                        (test?.niveau_criticite ?? 0) >= 3 ? "text-red-600" : "text-emerald-600"
                                    )}>Niveau {test?.niveau_criticite}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Measures Table & Form */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Mesures</p>
                                <p className="text-xl font-black text-gray-900">{mesures?.length || 0}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Conformes</p>
                                <p className="text-xl font-black text-emerald-700">{mesures?.filter((m: any) => m.conforme).length || 0}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Non-Conformes</p>
                                <p className="text-xl font-black text-red-700">{mesures?.filter((m: any) => !m.conforme).length || 0}</p>
                            </div>
                        </div>

                        {/* Add Measure Form (Only if En cours) */}
                        {test?.statut_test === 'EN_COURS' && (

                            <div className="p-6 bg-gray-900 rounded-[2rem] text-white shadow-2xl space-y-6">
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5 text-primary-400" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Enregistrer une nouvelle mesure</h3>
                                </div>
                                <form onSubmit={handleAddMeasure} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Paramètre / Grandeur</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Pression Pompe"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold focus:bg-white/20 outline-none transition-all"
                                            value={newMeasure.parametre_mesure}
                                            onChange={(e) => setNewMeasure({ ...newMeasure, parametre_mesure: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Valeur</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="0.00"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold focus:bg-white/20 outline-none transition-all"
                                            value={newMeasure.valeur_mesuree}
                                            onChange={(e) => setNewMeasure({ ...newMeasure, valeur_mesuree: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Unité</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Bar, °C"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold focus:bg-white/20 outline-none transition-all"
                                            value={newMeasure.unite_mesure}
                                            onChange={(e) => setNewMeasure({ ...newMeasure, unite_mesure: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Réf. (Cible)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Cible"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold focus:bg-white/20 outline-none transition-all"
                                            value={newMeasure.valeur_reference}
                                            onChange={(e) => setNewMeasure({ ...newMeasure, valeur_reference: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tolérance ±</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold focus:bg-white/20 outline-none transition-all"
                                            value={newMeasure.tolerance_max}
                                            onChange={(e) => setNewMeasure({ ...newMeasure, tolerance_min: e.target.value, tolerance_max: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-end">
                                        <button
                                            type="submit"
                                            disabled={addMeasureMutation.isPending}
                                            className="w-full bg-indigo-500 text-white py-2 rounded-xl font-black text-xs uppercase hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                                        >
                                            {addMeasureMutation.isPending ? "Sync..." : "Enregistrer la mesure"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Measures List */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Journal des Mesures</h3>
                            <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase">Paramètre</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase">Valeur / Cible</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase">Tolérance</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase">Conformité</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {mesures?.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-xs">
                                                    Aucune mesure enregistrée pour le moment.
                                                </td>
                                            </tr>
                                        ) : (
                                            mesures?.map((m: any) => (
                                                <tr key={m.id_mesure} className="group hover:bg-gray-50/50 transition-all">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-black text-gray-900">{m.parametre_mesure}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{m.type_mesure}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-gray-900">{m.valeur_mesuree} {m.unite_mesure}</span>
                                                            <span className="text-[10px] text-gray-400">/ {m.valeur_reference}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-bold text-gray-500">±{m.tolerance_max}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                                            m.conforme ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                        )}>
                                                            {m.conforme ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                                            {m.conforme ? "Conforme" : "Non-Conforme"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => deleteMeasureMutation.mutate(m.id_mesure)}
                                                            className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between sticky bottom-0 z-10">
                    <div className="flex items-center gap-4 text-gray-400">
                        <Thermometer className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Monitoring Métrologique Actif</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={closeExecutionModal}
                            className="px-8 py-3 text-xs font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-widest"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

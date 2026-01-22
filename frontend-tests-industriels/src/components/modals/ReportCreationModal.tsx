import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FileText,
    X,
    Save,
    Calendar,
    User as UserIcon,
    Layers,
    Activity,
    ClipboardCheck,
    AlertCircle
} from 'lucide-react';
import { reportingService } from '@/services/reportingService';
import { testsService } from '@/services/testsService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';

export default function ReportCreationModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isReportModalOpen, closeReportModal } = useModalStore();

    const [form, setForm] = useState({
        test_id: '',
        type_rapport: 'TECHNIQUE',
        date_edition: new Date().toISOString().split('T')[0],
        resume_executif: '',
        redacteur_id: '',
    });

    // Fetch personnel for redacteur selection
    const { data: personnelData } = useQuery({
        queryKey: ['test-creation-data'],
        queryFn: () => testsService.getCreationData(),
        enabled: isReportModalOpen,
    });

    // Fetch latest tests for selection
    const { data: testsData } = useQuery({
        queryKey: ['tests', { per_page: 50 }],
        queryFn: () => testsService.getTests({ per_page: 50 }),
        enabled: isReportModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => reportingService.createReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reporting-reports'] });
            closeReportModal();
            alert('Rapport généré avec succès !');
            setForm({
                test_id: '',
                type_rapport: 'TECHNIQUE',
                date_edition: new Date().toISOString().split('T')[0],
                resume_executif: '',
                redacteur_id: '',
            });
        },
        onError: (error: any) => {
            console.error('Erreur lors de la génération du rapport:', error.response?.data);
            alert(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue lors de la génération du rapport.'}`);
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Helper pour valider un UUID (plus souple)
        const isLikelyUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

        if (!form.test_id || !isLikelyUUID(form.test_id)) {
            alert('Veuillez sélectionner un test valide');
            return;
        }

        // Déterminer l'ID du rédacteur
        let redacteurId = null;
        if (form.redacteur_id && isLikelyUUID(form.redacteur_id)) {
            redacteurId = form.redacteur_id;
        } else {
            // Fallback sur l'id_personnel de l'utilisateur ou son ID direct
            redacteurId = user?.id_personnel || user?.id || null;
        }

        if (!redacteurId) {
            alert('Impossible de déterminer le rédacteur du rapport. Veuillez en sélectionner un.');
            return;
        }

        const sanitizedData = {
            ...form,
            redacteur_id: redacteurId
        };

        createMutation.mutate(sanitizedData);
    };

    if (!isReportModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase flex items-center gap-2">
                            <FileText className="h-6 w-6 text-indigo-600" />
                            Générer un Rapport
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Édition et validation d'un rapport industriel</p>
                    </div>
                    <button
                        onClick={closeReportModal}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="report-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Test Industriel */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                Sélectionner le Test *
                            </label>
                            <select
                                name="test_id"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={form.test_id}
                                onChange={handleInputChange}
                            >
                                {testsData?.data && testsData.data.length > 0 ? (
                                    testsData.data.map((test: any) => (
                                        <option key={test.id_test} value={test.id_test}>
                                            #{test.numero_test} - {test.equipement?.designation} ({test.type_test?.libelle}) [{test.statut_test}]
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Aucun test trouvé dans la base</option>
                                )}
                            </select>
                        </div>

                        {/* Type de Rapport */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="h-3 w-3" />
                                Type de Rapport *
                            </label>
                            <select
                                name="type_rapport"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={form.type_rapport}
                                onChange={handleInputChange}
                            >
                                <option value="TECHNIQUE">Rapport Technique</option>
                                <option value="FINAL">Rapport Final</option>
                                <option value="PERFORMANCE">Analyse de Performance</option>
                                <option value="MAINTENANCE">Rapport de Maintenance</option>
                            </select>
                        </div>

                        {/* Date d'édition */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Date d'édition *
                            </label>
                            <input
                                type="date"
                                name="date_edition"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={form.date_edition}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Rédacteur */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                Rédacteur
                            </label>
                            <select
                                name="redacteur_id"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={form.redacteur_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Utilisateur actuel ({user?.nom} {user?.prenom})</option>
                                {personnelData?.personnels.map((p: any) => (
                                    <option key={p.id_personnel} value={p.id_personnel}>
                                        {p.nom} {p.prenom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Info (Visual Only) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardCheck className="h-3 w-3" />
                                Statut Initial
                            </label>
                            <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-700 uppercase tracking-widest">
                                BROUILLON
                            </div>
                        </div>
                    </div>

                    {/* Résumé Exécutif */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Résumé Exécutif
                        </label>
                        <textarea
                            name="resume_executif"
                            rows={4}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Synthèse des points clés et conclusions du test..."
                            value={form.resume_executif}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-amber-900 uppercase">Information</p>
                            <p className="text-[10px] text-amber-700 font-medium italic mt-1">
                                Le numéro de rapport sera généré automatiquement selon la nomenclature de l'entreprise.
                                Vous pourrez l'exporter en PDF après la validation finale.
                            </p>
                        </div>
                    </div>
                </form>

                {/* Footer Modal */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={closeReportModal}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <button
                        form="report-form"
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:grayscale"
                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Génération...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Générer le Rapport
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

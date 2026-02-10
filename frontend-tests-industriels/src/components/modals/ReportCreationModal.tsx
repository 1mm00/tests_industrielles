import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FileText,
    X,
    Cpu,
    Maximize2,
    Minus,
    Trash2,
    Save,
    Send,
    MapPin,
    AlertCircle,
    Layers,
    Lock,
    Loader2
} from 'lucide-react';
import { reportingService } from '@/services/reportingService';
import { testsService } from '@/services/testsService';
import { rapportsService } from '@/services/rapportsService';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function ReportCreationModal() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { isReportModalOpen, closeReportModal, selectedReportId } = useModalStore();

    const [form, setForm] = useState({
        test_id: '',
        titre_rapport: '',
        type_rapport: 'TECHNIQUE',
        date_edition: new Date().toISOString().split('T')[0],
        resume_executif: '',
        recommandations: '',
        redacteur_id: '',
        statut: 'BROUILLON'
    });

    // Rôles
    const userRole = user?.personnel?.role?.nom_role?.toUpperCase() || 'TECHNICIEN';
    const isAdminOrEngineer = userRole === 'ADMIN' || userRole === 'INGÉNIEUR' || userRole === 'RESPONSABLE';

    // Fetch latest tests
    const { data: testsData } = useQuery({
        queryKey: ['tests', { per_page: 50 }],
        queryFn: () => testsService.getTests({ per_page: 50 }),
        enabled: isReportModalOpen && !selectedReportId,
    });

    // Fetch existing report if selectedReportId is present
    const { data: existingReport, isLoading: isLoadingReport } = useQuery({
        queryKey: ['report', selectedReportId],
        queryFn: () => rapportsService.getRapport(selectedReportId!),
        enabled: !!selectedReportId && isReportModalOpen,
    });

    // Populate form if existing report is loaded
    useEffect(() => {
        if (existingReport && isReportModalOpen) {
            setForm({
                test_id: existingReport.test_id || '',
                titre_rapport: existingReport.titre_rapport || existingReport.numero_rapport || '',
                type_rapport: existingReport.type_rapport || 'TECHNIQUE',
                date_edition: (existingReport.date_edition as string)?.split(' ')[0] || new Date().toISOString().split('T')[0],
                resume_executif: existingReport.resume_executif || '',
                recommandations: existingReport.recommandations || '',
                redacteur_id: existingReport.redacteur_id || '',
                statut: existingReport.statut || 'BROUILLON'
            });
        }
    }, [existingReport, isReportModalOpen]);

    // Détails du test sélectionné
    const { data: selectedTest } = useQuery({
        queryKey: ['test', form.test_id],
        queryFn: () => testsService.getTest(form.test_id),
        enabled: !!form.test_id && isReportModalOpen,
    });

    // État de verrouillage : Validé ou en cours de chargement
    const isActuallyLocked = existingReport?.statut?.toUpperCase().includes('VALID');
    const isEditing = !!selectedReportId;

    const updateMutation = useMutation({
        mutationFn: (data: any) => rapportsService.updateRapport(selectedReportId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rapports'] });
            toast.success('Rapport mis à jour avec succès !');
            closeReportModal();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => reportingService.createReport(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['reporting-reports'] });
            queryClient.invalidateQueries({ queryKey: ['rapports'] });

            if (data.statut?.toUpperCase().includes('VALID')) {
                handleGeneratePDF(data);
            } else {
                toast.success('Rapport enregistré avec succès !');
            }

            closeReportModal();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    });

    const resetForm = () => {
        setForm({
            test_id: '',
            titre_rapport: '',
            type_rapport: 'TECHNIQUE',
            date_edition: new Date().toISOString().split('T')[0],
            resume_executif: '',
            recommandations: '',
            redacteur_id: '',
            statut: 'BROUILLON'
        });
    };

    const handleGeneratePDF = async (data?: any) => {
        const id = data?.id_rapport || selectedReportId;

        if (!id) {
            toast.error('Veuillez d\'abord enregistrer le rapport.');
            return;
        }

        try {
            toast.loading('Génération du PDF officiel...', { id: 'pdf-gen' });

            const response = await fetch(rapportsService.getPdfDownloadUrl(id), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) throw new Error('Erreur serveur');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rapport_${id.substring(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Rapport PDF téléchargé !', { id: 'pdf-gen' });
        } catch (e) {
            console.error("Erreur PDF:", e);
            toast.error('Erreur lors de la génération par le serveur', { id: 'pdf-gen' });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (isActuallyLocked) return;
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (finalStatus: string) => {
        if (isActuallyLocked) return;
        if (!form.test_id) {
            toast.error('Veuillez sélectionner un test');
            return;
        }

        const redacteurId = form.redacteur_id || user?.id_personnel || user?.id;
        const payload = {
            ...form,
            statut: finalStatus,
            redacteur_id: redacteurId,
            // S'assurer que le titre est rempli par numéro de rapport si vide
            titre_rapport: form.titre_rapport || `Rapport Expertise ${selectedTest?.numero_test || ''}`
        };

        if (isEditing) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    if (!isReportModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-300 font-['Inter']">

            {/* GMAIL COMPOSE STYLE CONTAINER */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-500 border border-slate-100 relative">

                {isLoadingReport && (
                    <div className="absolute inset-x-0 top-[44px] bottom-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Chargement du rapport...</p>
                        </div>
                    </div>
                )}

                {/* 1. GMAIL HEADER (SLIM & DARK) */}
                <div className={cn(
                    "flex items-center justify-between px-5 py-2.5 select-none rounded-t-2xl text-gray-100 transition-colors",
                    isActuallyLocked ? "bg-slate-800" : "bg-[#404040]"
                )}>
                    <div className="flex items-center gap-2.5 text-xs">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-bold truncate tracking-wide">
                            {isEditing ? `RAPPORT EXPERTISE : ${existingReport?.numero_rapport || '...'}` : "NOUVEAU RAPPORT D'EXPERTISE"}
                        </span>
                        {isActuallyLocked && (
                            <span className="ml-3 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                                <Lock className="h-2.5 w-2.5" /> Certifié & Verrouillé
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80">
                        <button className="p-1 hover:bg-white/10 rounded transition-colors"><Minus className="h-4 w-4" /></button>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors"><Maximize2 className="h-3.5 w-3.5" /></button>
                        <button onClick={closeReportModal} className="p-1 hover:bg-red-500 rounded transition-colors group"><X className="h-4 w-4 group-hover:scale-110" /></button>
                    </div>
                </div>

                {/* 2. CHAMPS D'EN-TÊTE (HORIZONTAL LINES) */}
                <div className="flex flex-col text-sm bg-white">
                    {/* Line 1: Data badges */}
                    <div className="px-6 py-2.5 border-b border-gray-100 flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500 w-full max-w-xl">
                            <span className="text-[10px] font-black uppercase text-gray-400 w-20">Test Réf :</span>
                            <div className="flex-1 flex items-center">
                                <select
                                    name="test_id"
                                    className="flex-1 bg-transparent font-bold text-gray-900 border-none focus:ring-0 cursor-pointer p-0 text-sm disabled:text-gray-900 disabled:opacity-100"
                                    value={form.test_id}
                                    onChange={handleInputChange}
                                    disabled={isEditing || isActuallyLocked}
                                >
                                    <option value="">Choisir un test référentiel...</option>
                                    {!isEditing && testsData?.data?.map((test: any) => (
                                        <option key={test.id_test} value={test.id_test}>#{test.numero_test} - {test.equipement?.designation}</option>
                                    ))}
                                    {isEditing && (
                                        <option value={existingReport?.test_id}>
                                            #{existingReport?.test?.numero_test} - {existingReport?.test?.equipement?.designation}
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            {(selectedTest || existingReport?.test) && (
                                <>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                                        <Cpu className="h-3 w-3" /> EQ: {(selectedTest || existingReport?.test).equipement?.code_equipement}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                                        <MapPin className="h-3 w-3" /> {(selectedTest || existingReport?.test).localisation}
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-md border text-white shadow-sm",
                                        (selectedTest || existingReport?.test).statut_final === 'OK' ? "bg-emerald-500 border-emerald-600" : "bg-orange-500 border-orange-600"
                                    )}>
                                        <AlertCircle className="h-3 w-3" /> VERDICT: {(selectedTest || existingReport?.test).statut_final || 'WAIT'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Line 2 (Subject): Titre */}
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-gray-400 w-20">Objet :</span>
                        <input
                            type="text"
                            name="titre_rapport"
                            placeholder="Titre de l'expertise (ex: Contrôle des vibrations moteur)..."
                            className="flex-1 bg-transparent font-bold text-gray-900 border-none focus:ring-0 p-0 text-sm placeholder:text-gray-300 transition-all disabled:opacity-100"
                            value={form.titre_rapport}
                            onChange={handleInputChange}
                            readOnly={isActuallyLocked}
                        />
                    </div>

                    {/* Line 3: Type & Meta */}
                    <div className="px-6 py-2.5 border-b border-gray-100 flex items-center gap-10">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-gray-400 w-20">Type :</span>
                            <select
                                name="type_rapport"
                                className="bg-transparent font-bold text-gray-900 border-none focus:ring-0 p-0 text-[11px] cursor-pointer disabled:opacity-100"
                                value={form.type_rapport}
                                onChange={handleInputChange}
                                disabled={isActuallyLocked}
                            >
                                <option value="TECHNIQUE">RAPPORT TECHNIQUE DÉTAILLÉ</option>
                                <option value="FINAL">RAPPORT DE CLÔTURE FINAL</option>
                                <option value="PERFORMANCE">ANALYSE KPI & PERFORMANCE</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 ml-auto">
                            <span className="text-[10px] font-black uppercase text-gray-400">Date Édition :</span>
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black ml-2 border border-slate-200">
                                {new Date(form.date_edition).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. MAIN BODY AREA (70/30 GRID) */}
                <div className="flex-1 flex overflow-hidden min-h-0 bg-white">

                    {/* LEFT: THE EDITOR (70%) */}
                    <div className="flex-1 flex flex-col p-8 overflow-hidden">
                        <textarea
                            name="resume_executif"
                            className="flex-1 w-full text-[15px] font-medium text-gray-800 border-none focus:ring-0 leading-loose resize-none p-0 scrollbar-hide read-only:text-gray-600"
                            placeholder="Rédigez ici la synthèse détaillée de l'expertise..."
                            value={form.resume_executif}
                            onChange={handleInputChange}
                            readOnly={isActuallyLocked}
                        />

                        {/* Fake Signature Style line */}
                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-black text-lg">
                                {(existingReport?.redacteur?.nom_complet || user?.name || '?').charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-tight tracking-tight">{existingReport?.redacteur?.nom_complet || user?.name}</p>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Expert en Systèmes Industriels — Division Aéronautique</p>
                            </div>
                            {isActuallyLocked && (
                                <div className="ml-auto opacity-30 select-none transform rotate-[-5deg] border-2 border-emerald-600 rounded-lg p-2 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase leading-none">Certifié OK</span>
                                    <span className="text-[8px] font-bold text-emerald-800 mt-1">{new Date(existingReport?.date_validation || '').toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: SIDEBAR (30%) */}
                    <div className="w-[380px] bg-gray-50/50 border-l border-gray-100 flex flex-col p-6 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="h-4 w-4 text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Recommandations & Actions PT</span>
                        </div>

                        <textarea
                            name="recommandations"
                            className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-5 text-[13px] font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all leading-relaxed resize-none shadow-sm placeholder:text-gray-300 read-only:bg-gray-50/50"
                            placeholder="Actions prioritaires à entreprendre : maintenance préventive, remplacement, calibration..."
                            value={form.recommandations}
                            onChange={handleInputChange}
                            readOnly={isActuallyLocked}
                        />

                        {/* Audit info */}
                        <div className="mt-8 pt-6 border-t border-gray-200/60 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Traceability Hash:</span>
                                <span className="text-[10px] font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-100">
                                    {isEditing ? existingReport?.id_rapport.substring(0, 12) : 'TEMP-SIGN-NEW'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Workflow Status:</span>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                    isActuallyLocked
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                )}>
                                    {form.statut}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. GMAIL ACTION FOOTER */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 overflow-hidden rounded-b-2xl">
                    <div className="flex items-center gap-3">
                        {!isActuallyLocked ? (
                            <>
                                {isAdminOrEngineer ? (
                                    <button
                                        onClick={() => handleSave('VALIDE')}
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex items-center gap-2.5 px-10 py-3 bg-[#1a73e8] hover:bg-[#185abc] text-white rounded-lg font-black text-[13px] uppercase tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                        Valider l'Expertise
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSave('BROUILLON')}
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex items-center gap-2.5 px-10 py-3 bg-[#1a73e8] hover:bg-[#185abc] text-white rounded-lg font-black text-[13px] uppercase tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                        Soumettre Rédac
                                    </button>
                                )}

                                <button
                                    onClick={() => handleSave('BROUILLON')}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center gap-2 px-5 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg font-black text-[11px] uppercase tracking-widest transition-all group border border-transparent hover:border-gray-200"
                                >
                                    <Save className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    <span>Brouillon</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleGeneratePDF()}
                                className="flex items-center gap-2.5 px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[13px] uppercase tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                <FileText className="h-4 w-4" />
                                Télécharger PDF Officiel Certifié
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {!isActuallyLocked && (
                            <button
                                onClick={closeReportModal}
                                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all group"
                                title="Supprimer le document"
                            >
                                <Trash2 className="h-5 w-5 group-hover:shake" />
                            </button>
                        )}
                        {isActuallyLocked && (
                            <button
                                onClick={closeReportModal}
                                className="px-8 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-all"
                            >
                                Fermer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FlaskConical,
    Play,
    CheckCircle2,
    Clock,
    ChevronRight,
    ClipboardList,
    Activity,
    Thermometer,
    FileText
} from 'lucide-react';
import { testsService, TestFilters } from '@/services/testsService';
import { formatDate, getCriticalityColor, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

export default function Tests_Technician() {
    const [filters, setFilters] = useState<TestFilters>({
        statut: 'PLANIFIE', // Par défaut voir ce qui est planifié
        per_page: 10
    });

    const { data: tests, isLoading } = useQuery({
        queryKey: ['tests-technician', filters],
        queryFn: () => testsService.getTests(filters)
    });

    const { openExecutionModal, openTestGmailModal, openTestDetailsModal } = useModalStore();

    const handleExecute = (testId: string) => {
        openExecutionModal(testId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                            <ClipboardList size={24} />
                        </div>
                        Orchestration des Tests
                    </h1>
                    <p className="text-gray-500 mt-1">Exécutez vos missions de contrôle et mesures</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setFilters(f => ({ ...f, statut: 'PLANIFIE' }))}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            filters.statut === 'PLANIFIE' ? "bg-primary-100 text-primary-700 shadow-sm" : "text-gray-400 hover:bg-gray-50"
                        )}
                    >
                        À Faire
                    </button>
                    <button
                        onClick={() => setFilters(f => ({ ...f, statut: 'EN_COURS' }))}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            filters.statut === 'EN_COURS' ? "bg-amber-100 text-amber-700 shadow-sm" : "text-gray-400 hover:bg-gray-50"
                        )}
                    >
                        En Cours
                    </button>
                    <button
                        onClick={() => setFilters(f => ({ ...f, statut: 'TERMINE' }))}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            filters.statut === 'TERMINE' ? "bg-emerald-100 text-emerald-700 shadow-sm" : "text-gray-400 hover:bg-gray-50"
                        )}
                    >
                        Terminés
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-[2rem] animate-pulse" />
                    ))
                ) : tests?.data.length === 0 ? (
                    <div className="bg-white rounded-[2/rem] p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FlaskConical className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Aucun test trouvé</h3>
                        <p className="text-gray-500">Aucune mission correspondante à ce statut.</p>
                    </div>
                ) : (
                    tests?.data.map((test) => (
                        <div
                            key={test.id_test}
                            className="group bg-white rounded-[2rem] p-1 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300"
                        >
                            <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Visual Indicator */}
                                <div className={cn(
                                    "hidden lg:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0",
                                    test.statut_test === 'PLANIFIE' ? "bg-blue-50 text-blue-600" :
                                        test.statut_test === 'EN_COURS' ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                                )}>
                                    <Activity size={32} className={test.statut_test === 'EN_COURS' ? 'animate-pulse' : ''} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            getCriticalityColor(test.niveau_criticite)
                                        )}>
                                            Priorité {test.niveau_criticite}
                                        </span>
                                        <span className="text-gray-400 text-xs font-medium">•</span>
                                        <span className="text-gray-500 text-xs font-bold">{test.type_test?.libelle || 'Test standard'}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                        {test.equipement?.designation || 'Équipement inconnu'}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            {formatDate(test.date_test)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Thermometer size={16} />
                                            {test.equipement?.numero_serie}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 lg:border-l lg:pl-6 border-gray-100">
                                    {test.statut_test === 'TERMINE' ? (
                                        <button
                                            onClick={() => openTestDetailsModal(test.id_test)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
                                        >
                                            <CheckCircle2 size={18} />
                                            Voir Rapport
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {/* Bouton spécifique si le temps est écoulé */}
                                            {test.heure_fin && new Date(test.heure_fin) < new Date() ? (
                                                <button
                                                    onClick={() => openTestGmailModal(test.id_test)}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white font-black text-sm transition-all active:scale-95 shadow-lg shadow-orange-200 hover:bg-orange-600 animate-in fade-in zoom-in duration-300"
                                                >
                                                    <FileText size={18} />
                                                    Finaliser le Rapport
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleExecute(test.id_test)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 border",
                                                        test.statut_test === 'EN_COURS'
                                                            ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                                                            : "bg-primary-50 text-primary-600 border-primary-100 hover:bg-primary-100"
                                                    )}
                                                >
                                                    {test.statut_test === 'EN_COURS' ? 'Reprendre' : 'Démarrer'}
                                                    <Play size={18} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => openTestDetailsModal(test.id_test)}
                                        className="p-3 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

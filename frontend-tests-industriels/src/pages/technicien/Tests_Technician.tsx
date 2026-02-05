import { useState, useMemo } from 'react';
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
    FileText,
    TrendingUp,
    ShieldAlert,
    Target,
    Layers
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

    const stats = useMemo(() => {
        const items = tests?.data || [];
        return {
            total: items.length,
            inProgress: items.filter((t: any) => t.statut_test === 'EN_COURS').length,
            completed: items.filter((t: any) => t.statut_test === 'TERMINE').length,
            critical: items.filter((t: any) => t.niveau_criticite >= 4).length
        };
    }, [tests]);

    const handleExecute = (testId: string) => {
        openExecutionModal(testId);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <ClipboardList className="h-7 w-7 text-indigo-600" />
                        Missions Terrain
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Exécution des protocoles de mesures et validation industrielle</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-slate-100">
                    {[
                        { id: 'PLANIFIE', label: 'À Faire' },
                        { id: 'EN_COURS', label: 'En Cours' },
                        { id: 'TERMINE', label: 'Terminés' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilters(f => ({ ...f, statut: tab.id }))}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filters.statut === tab.id
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Missions</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Exécution</p>
                            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{stats.inProgress}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critiques</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats.critical}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complétées</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.completed}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. List Layout */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
                    ))
                ) : tests?.data.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <FlaskConical className="h-16 w-16 text-slate-300" />
                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucune mission disponible</p>
                        </div>
                    </div>
                ) : (
                    tests?.data.map((test) => (
                        <div
                            key={test.id_test}
                            className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                                {/* Activity Icon */}
                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                                    test.statut_test === 'PLANIFIE' ? "bg-slate-50 border-slate-100 text-slate-400" :
                                        test.statut_test === 'EN_COURS' ? "bg-blue-50 border-blue-100 text-blue-600" :
                                            "bg-emerald-50 border-emerald-100 text-emerald-600"
                                )}>
                                    <Activity size={28} className={test.statut_test === 'EN_COURS' ? 'animate-pulse' : ''} />
                                </div>

                                {/* Info Block */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            test.niveau_criticite >= 4 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            Nv.{test.niveau_criticite}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{test.type_test?.libelle || 'Protocole Standard'}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                                        {test.equipement?.designation || 'Équipement non spécifié'}
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4 opacity-70">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                            <Clock size={16} className="text-slate-300" />
                                            {formatDate(test.date_test)}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                            <Thermometer size={16} className="text-slate-300" />
                                            S/N: {test.equipement?.numero_serie}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Block */}
                                <div className="flex items-center gap-3 lg:border-l lg:pl-8 border-slate-50 pt-4 lg:pt-0">
                                    {test.statut_test === 'TERMINE' ? (
                                        <button
                                            onClick={() => openTestDetailsModal(test.id_test)}
                                            className="h-12 px-6 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-[11px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            Rapport
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {test.heure_fin && new Date(test.heure_fin) < new Date() ? (
                                                <button
                                                    onClick={() => openTestGmailModal(test.id_test)}
                                                    className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center gap-2"
                                                >
                                                    <FileText size={16} />
                                                    Finaliser
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleExecute(test.id_test)}
                                                    className={cn(
                                                        "h-12 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-sm border flex items-center gap-2",
                                                        test.statut_test === 'EN_COURS'
                                                            ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                                            : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-white"
                                                    )}
                                                >
                                                    {test.statut_test === 'EN_COURS' ? 'Reprendre' : 'Démarrer'}
                                                    <Play size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => openTestDetailsModal(test.id_test)}
                                        className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center active:scale-95"
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

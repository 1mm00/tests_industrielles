import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Play,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    Plus,
    Calendar,
    Settings,
    ChevronRight,
    MapPin,
    Layers,
    User
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

export default function Projets_Engineer() {
    const { openTestModal, openExecutionModal } = useModalStore();
    const [filter, setFilter] = useState('all');

    const { data: tests, isLoading } = useQuery({
        queryKey: ['orchestration-tests', filter],
        queryFn: () => testsService.getTests({ statut: filter === 'all' ? '' : filter }),
    });

    const statusConfig = {
        'PLANIFIE': { color: 'blue', icon: Clock, label: 'Planifié' },
        'EN_COURS': { color: 'primary', icon: Play, label: 'En cours' },
        'TERMINE': { color: 'emerald', icon: CheckCircle2, label: 'Terminé' },
        'ANNULE': { color: 'gray', icon: AlertCircle, label: 'Annulé' },
        'SUSPENDU': { color: 'red', icon: AlertCircle, label: 'Suspendu' },
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Layers className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Orchestration des Tests</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Définition des protocoles et supervision de l'exécution technique</p>
                </div>

                <button
                    onClick={openTestModal}
                    className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-sm shadow-xl hover:scale-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    NOUVELLE CAMPAGNE
                </button>
            </div>

            {/* Quick Stats / Filters */}
            <div className="flex flex-wrap items-center gap-4">
                {[
                    { val: 'all', label: 'Tous les tests' },
                    { val: 'PLANIFIE', label: 'Planifié' },
                    { val: 'EN_COURS', label: 'En cours' },
                    { val: 'TERMINE', label: 'Terminé' },
                    { val: 'SUSPENDU', label: 'Suspendu' }
                ].map((s) => (
                    <button
                        key={s.val}
                        onClick={() => setFilter(s.val)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
                            filter === s.val
                                ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200"
                                : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                        )}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Search & Bulk Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par ID, Équipement ou Matricule..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] flex items-center gap-2 text-sm font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                    <Filter className="h-4 w-4" />
                    Filtres Avancés
                </button>
            </div>

            {/* Main Content Table/Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {tests?.data?.map((test: any) => {
                        const config = (statusConfig as any)[test.statut_test] || statusConfig['PLANIFIE'];
                        const Icon = config.icon;

                        return (
                            <div key={test.id_test} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500">
                                <div className="flex flex-col md:flex-row md:items-center gap-8">

                                    {/* Status Icon */}
                                    <div className={cn(
                                        "h-20 w-20 rounded-[2rem] flex flex-col items-center justify-center shrink-0 border shadow-sm group-hover:scale-105 transition-transform duration-500",
                                        `bg-${config.color}-50 border-${config.color}-100 text-${config.color}-600`
                                    )}>
                                        <Icon className="h-8 w-8 mb-1" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">{config.label}</span>
                                    </div>

                                    {/* Test Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                                                {test.numero_test}
                                            </span>
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {test.type_test?.libelle_type || 'Contrôle Technique Standard'}
                                            </h3>
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                test.niveau_criticite >= 3 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                CRITICITÉ NIV. {test.niveau_criticite}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Settings className="h-3 w-3" /> Équipement
                                                </p>
                                                <p className="text-sm font-bold text-gray-700">{test.equipement?.designation}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" /> Date Prévue
                                                </p>
                                                <p className="text-sm font-bold text-gray-700">{formatDate(test.date_test)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" /> Site / Zone
                                                </p>
                                                <p className="text-sm font-bold text-gray-700">{test.localisation || 'Atelier Central'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <User className="h-3 w-3" /> Responsable
                                                </p>
                                                <p className="text-sm font-bold text-gray-700">{test.responsable?.nom || 'Non assigné'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Indicator */}
                                    <div className="flex md:flex-col items-center justify-center gap-4 border-l border-gray-50 pl-8">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Qualité</p>
                                            <div className="relative h-14 w-14 flex items-center justify-center">
                                                <svg className="h-full w-full rotate-[-90deg]">
                                                    <circle cx="28" cy="28" r="24" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                                                    <circle
                                                        cx="28" cy="28" r="24" fill="none"
                                                        stroke={test.taux_conformite_pct >= 80 ? "#10B981" : "#F59E0B"}
                                                        strokeWidth="4"
                                                        strokeDasharray={`${2 * Math.PI * 24}`}
                                                        strokeDashoffset={`${2 * Math.PI * 24 * (1 - (test.taux_conformite_pct || 0) / 100)}`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute text-[10px] font-black">{test.taux_conformite_pct || 0}%</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openExecutionModal(test.id_test)}
                                            className="p-4 bg-gray-50 rounded-2xl hover:bg-primary-600 hover:text-white transition-all group/btn"
                                            title="Superviser l'exécution"
                                        >
                                            <ChevronRight className="h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

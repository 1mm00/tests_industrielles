import { useState, useMemo } from 'react';
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
    User,
    Search as SearchIcon,
    TrendingUp,
    ShieldAlert,
    Target
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

export default function Projets_Engineer() {
    const { openTestModal, openExecutionModal, openTestDetailsModal } = useModalStore();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const { data: tests, isLoading } = useQuery({
        queryKey: ['orchestration-tests', filter, search],
        queryFn: () => testsService.getTests({
            statut: filter === 'all' ? '' : filter,
            search: search
        }),
    });

    const stats = useMemo(() => {
        const items = tests?.data || [];
        return {
            total: items.length,
            inProgress: items.filter((t: any) => t.statut_test === 'EN_COURS').length,
            critical: items.filter((t: any) => t.niveau_criticite >= 4).length,
            completed: items.filter((t: any) => t.statut_test === 'TERMINE').length
        };
    }, [tests]);

    const statusConfig = {
        'PLANIFIE': { color: 'blue', icon: Clock, label: 'Planifié' },
        'EN_COURS': { color: 'primary', icon: Play, label: 'En cours' },
        'TERMINE': { color: 'emerald', icon: CheckCircle2, label: 'Terminé' },
        'ANNULE': { color: 'gray', icon: AlertCircle, label: 'Annulé' },
        'SUSPENDU': { color: 'rose', icon: AlertCircle, label: 'Suspendu' },
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Layers className="h-7 w-7 text-indigo-600" />
                        Orchestration Tests
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Pilotage des campagnes de validation et protocoles R&D</p>
                </div>
                <button
                    onClick={() => openTestModal()}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Nouvelle Campagne
                </button>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Campagnes</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-slate-400 rounded-r-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Cours</p>
                            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{stats.inProgress}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-blue-500 rounded-r-full" style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }}></div>
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
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${stats.total ? (stats.critical / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complétés</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.completed}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 3. Filters & Search Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher par ID, équipement ou matricule..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { val: 'all', label: 'Tous' },
                        { val: 'PLANIFIE', label: 'Planifiés' },
                        { val: 'EN_COURS', label: 'Actifs' },
                        { val: 'TERMINE', label: 'Terminés' }
                    ].map((s) => (
                        <button
                            key={s.val}
                            onClick={() => setFilter(s.val)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                filter === s.val
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Dense Test Cards / Table Alternative Layout */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
                    ))
                ) : tests?.data?.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <Layers className="h-16 w-16 text-slate-300" />
                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucune campagne identifiée</p>
                        </div>
                    </div>
                ) : (
                    tests.data.map((test: any) => {
                        const config = (statusConfig as any)[test.statut_test] || statusConfig['PLANIFIE'];
                        const Icon = config.icon;

                        return (
                            <div key={test.id_test} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden">
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 rounded-full transition-all group-hover:opacity-10",
                                    `bg-${config.color}-500`
                                )} />

                                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                                    {/* Status Badge Block */}
                                    <div className={cn(
                                        "h-16 w-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-sm",
                                        test.statut_test === 'TERMINE' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                            test.statut_test === 'EN_COURS' ? "bg-blue-50 border-blue-100 text-blue-600" :
                                                "bg-slate-50 border-slate-100 text-slate-400"
                                    )}>
                                        <Icon className="h-6 w-6 mb-1" />
                                        <span className="text-[7px] font-black uppercase tracking-widest">{config.label}</span>
                                    </div>

                                    {/* Info Block */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                {test.numero_test}
                                            </span>
                                            <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                                                {test.type_test?.libelle || 'Protocole Standard'}
                                            </h3>
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                test.niveau_criticite >= 4 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                            )}>
                                                Criticité Lv.{test.niveau_criticite}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Settings className="h-3 w-3" /> Équipement
                                                </p>
                                                <p className="text-[12px] font-black text-slate-700">{test.equipement?.designation}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" /> Planifié le
                                                </p>
                                                <p className="text-[12px] font-black text-slate-700">{formatDate(test.date_test)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" /> Localisation
                                                </p>
                                                <p className="text-[12px] font-black text-slate-700">{test.localisation || 'Atelier Central'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <User className="h-3 w-3" /> Responsable
                                                </p>
                                                <p className="text-[12px] font-black text-slate-700">{test.responsable?.nom || 'Non assigné'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action & Quality Block */}
                                    <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-50 pt-4 lg:pt-0 lg:pl-8 justify-between lg:justify-end">
                                        <div className="flex flex-col items-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Conformité</p>
                                            <div className="h-12 w-12 rounded-full border-4 border-slate-50 flex items-center justify-center relative">
                                                <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                                                    <circle
                                                        cx="24" cy="24" r="20" fill="none"
                                                        stroke={test.taux_conformite_pct >= 80 ? "#10B981" : "#F59E0B"}
                                                        strokeWidth="4"
                                                        strokeDasharray="125.6"
                                                        strokeDashoffset={125.6 * (1 - (test.taux_conformite_pct || 0) / 100)}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-1000"
                                                    />
                                                </svg>
                                                <span className="text-[9px] font-black text-slate-900">{test.taux_conformite_pct || 0}%</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (test.statut_test === 'TERMINE') {
                                                    openTestDetailsModal(test.id_test);
                                                } else {
                                                    openExecutionModal(test.id_test);
                                                }
                                            }}
                                            className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg active:scale-95 group/btn"
                                        >
                                            <ChevronRight className="h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

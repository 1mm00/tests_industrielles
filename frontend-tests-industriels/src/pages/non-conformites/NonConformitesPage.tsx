import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    AlertTriangle,
    Search,
    Filter,
    Plus,
    Eye,
    CheckCircle2,
    ShieldAlert,
    MapPin,
    Calendar,
    Trash2,
    Activity,
    Target,
    Zap,
    ShieldCheck,
    MoreVertical,
    FileDown,
    Archive,
    Inbox,
    Edit3,
    PlayCircle,
    RotateCcw,
    History
} from 'lucide-react';
import { ncService, NcFilters } from '@/services/ncService';
import { formatDate, cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permissions';
import { exportNonConformitePDF } from '@/utils/pdfExportNC';

// ActionsMenu component - Clean dropdown with Portal
const ActionsMenu = ({ nc }: { nc: any }) => {
    const { user } = useAuthStore();
    const { openReouvrirNcModal } = useModalStore();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, right: 0 });

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                title="Plus d'actions"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && ReactDOM.createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="fixed w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[101] overflow-hidden"
                        style={{ top: `${position.top}px`, right: `${position.right}px` }}
                    >
                        {hasPermission(user, 'non_conformites', 'update') && (
                            <>
                                {/* On ne montre dans le menu que ce qui n'est pas déjà en bouton principal dans la ligne */}
                                {nc.statut === 'CLOTUREE' && !nc.is_archived && (
                                    <button
                                        onClick={() => {
                                            openReouvrirNcModal(nc.id_non_conformite);
                                            setIsOpen(false);
                                        }}
                                        className="w-full px-4 py-3.5 text-left hover:bg-amber-50 transition-all flex items-center gap-3 group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                            <RotateCcw className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">Réouvrir la NC</p>
                                            <p className="text-xs text-slate-500">Repasser en traitement</p>
                                        </div>
                                    </button>
                                )}

                                {/* Ici on peut ajouter d'autres actions secondaires si besoin (Historique, Transfert, etc.) */}
                                <div className="px-4 py-2 border-t border-slate-50 mt-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Options supplémentaires</p>
                                </div>
                                <button
                                    onClick={() => {
                                        toast.success('Historique en cours de chargement...');
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-4 py-3.5 text-left hover:bg-slate-50 transition-all flex items-center gap-3 group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                        <History className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">Journal d'Audit</p>
                                        <p className="text-xs text-slate-500">Traçabilité complète</p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export default function NonConformitesPage() {
    const { user } = useAuthStore();
    const {
        openNcModal,
        openNcDetailsModal,
        openNcEditModal,
        openAnalyseNcModal,
        openPlanActionModal,
        openClotureNcModal,
        openSecurityModal
    } = useModalStore();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<NcFilters>({
        page: 1,
        per_page: 10,
        search: '',
        statut: '',
        is_archived: false,
    });

    // Main data queries
    const { data, isLoading } = useQuery({
        queryKey: ['non-conformites', filters],
        queryFn: () => ncService.getPaginatedNc(filters),
    });

    const { data: stats } = useQuery({
        queryKey: ['nc-stats'],
        queryFn: () => ncService.getNcStats(),
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, statut: e.target.value, page: 1 }));
    };



    const handleDeleteClick = (id: string, _numero: string) => {
        openSecurityModal(id);
    };

    const executeArchive = async (id: string, numero: string, isCurrentlyArchived: boolean) => {
        const loadingToast = toast.loading(isCurrentlyArchived ? `Désarchivage de ${numero}...` : `Archivage de ${numero}...`);
        try {
            await ncService.archiveNc(id);
            queryClient.invalidateQueries({ queryKey: ['non-conformites'] });
            toast.success(isCurrentlyArchived ? `La NC ${numero} a été désarchivée.` : `La NC ${numero} a été déplacée aux archives.`, {
                id: loadingToast,
                icon: '📦',
                className: 'font-bold text-xs'
            });
        } catch (error: any) {
            console.error(error);
            toast.error("Erreur lors de l'archivage.", { id: loadingToast });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <ShieldAlert className="h-7 w-7 text-rose-600" />
                        Registre Non-Conformités
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Audit, gestion des écarts et orchestration du plan d'actions correctives</p>
                </div>

                <div className="flex items-center gap-3">

                    {hasPermission(user, 'non_conformites', 'create') && (
                        <button
                            onClick={openNcModal}
                            className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                            Déclarer une NC
                        </button>
                    )}
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform shadow-sm">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total NC</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats?.summary?.total || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Analyse</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats?.summary?.en_cours || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-sm">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haute Criticité</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats?.summary?.critiques || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clôturées (Optimisées)</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.summary?.cloturees || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par n° de NC, description technique, expert..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voir Archives</span>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, is_archived: !prev.is_archived, page: 1 }))}
                            className={cn(
                                "w-11 h-6 rounded-full transition-all relative",
                                filters.is_archived ? "bg-rose-600" : "bg-slate-300"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                filters.is_archived ? "left-6" : "left-1"
                            )} />
                        </button>
                    </div>

                    <div className="h-10 w-px bg-slate-100 hidden md:block mx-1" />

                    <div className="flex items-center gap-2 flex-1 md:w-auto">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            className="flex-1 md:w-52 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all appearance-none"
                            value={filters.statut}
                            onChange={handleStatusFilter}
                        >
                            <option value="">Tous les Statuts ({filters.is_archived ? 'Archivés' : 'Actifs'})</option>
                            <option value="OUVERTE">Ouverte (Action Requise)</option>
                            <option value="TRAITEMENT">En Traitement Analytique</option>
                            <option value="CLOTUREE">Clôturée & Validée</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. Main Table View */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Identification</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Description de l'Écart</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Asset & Protocole</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Audit Detection</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-7 py-6">
                                            <div className="h-10 bg-slate-50 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-7 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-20">
                                            <ShieldCheck className="h-20 w-20 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[4px] text-xs underline underline-offset-8">Registre Nominal (Zéro Défaut)</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.data.map((nc: any) => (
                                    <tr key={nc.id_non_conformite} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-rose-500">
                                        <td className="px-7 py-6">
                                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-widest shadow-sm">
                                                {nc.numero_nc}
                                            </span>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="max-w-xs">
                                                <p className="text-[13px] font-black text-slate-800 line-clamp-1 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{nc.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                    <Target className="h-3 w-3" />
                                                    {nc.type_nc}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black text-slate-700 truncate max-w-[180px] flex items-center gap-2">
                                                    <Activity className="h-3.5 w-3.5 text-slate-300" />
                                                    {nc.equipement?.designation || 'Équipement non spécifié'}
                                                </span>
                                                <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                                                    {nc.test?.numero_test || 'Intervention Directe'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-700">{formatDate(nc.date_detection)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{nc.zone_detection || 'Zone de Tests Flux A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                                                    nc.statut === 'OUVERTE' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                        nc.statut === 'TRAITEMENT' || nc.statut === 'EN_ANALYSE' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                            "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                )}>
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        nc.statut === 'OUVERTE' ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" :
                                                            nc.statut === 'TRAITEMENT' || nc.statut === 'EN_ANALYSE' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                                                                "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                                                    )} />
                                                    {nc.statut === 'TRAITEMENT' ? 'ANALYSE ACTIVE' : nc.statut}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Primary Actions - Always visible */}
                                                {/* Étape 1 : Juste après Déclaration (Pas de 5M) */}
                                                {!nc.is_archived && (!nc.causes_racines || nc.causes_racines.length === 0) && (
                                                    <>
                                                        <button
                                                            onClick={() => openNcDetailsModal(nc.id_non_conformite)}
                                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Détails"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {hasPermission(user, 'non_conformites', 'update') && (
                                                            <>
                                                                <button
                                                                    onClick={() => openNcEditModal(nc.id_non_conformite)}
                                                                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                                    title="Modifier NC"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => openAnalyseNcModal(nc.id_non_conformite)}
                                                                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                                    title="Lancer Analyse 5M"
                                                                >
                                                                    <Zap className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {/* Étape 2 : Après enregistrement de l'Analyse 5M (Pas de Plan) */}
                                                {!nc.is_archived && nc.causes_racines && nc.causes_racines.length > 0 && !nc.plan_action && (
                                                    <>
                                                        <button
                                                            onClick={() => openNcDetailsModal(nc.id_non_conformite)}
                                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Détails"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {hasPermission(user, 'non_conformites', 'update') && (
                                                            <>
                                                                <button
                                                                    onClick={() => openAnalyseNcModal(nc.id_non_conformite)}
                                                                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                                    title="Modifier Analyse 5M"
                                                                >
                                                                    <Zap className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => openPlanActionModal(nc.id_non_conformite)}
                                                                    className="p-2.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                                                    title="Ajouter Plan d'Action"
                                                                >
                                                                    <Target className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {/* Étape 3 : Après enregistrement du Plan d'Action (Pas encore clôturée) */}
                                                {!nc.is_archived && nc.plan_action && nc.statut !== 'CLOTUREE' && (
                                                    <>
                                                        <button
                                                            onClick={() => openNcDetailsModal(nc.id_non_conformite)}
                                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Détails"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {hasPermission(user, 'non_conformites', 'update') && (
                                                            <>
                                                                <button
                                                                    onClick={() => openPlanActionModal(nc.id_non_conformite)}
                                                                    className="p-2.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                                                    title="Modifier Plan d'Action"
                                                                >
                                                                    <Target className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => openClotureNcModal(nc.id_non_conformite)}
                                                                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                                    title="Exécuter & Vérifier"
                                                                >
                                                                    <PlayCircle className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {/* Étape 4 : Après Clôture de la NC */}
                                                {!nc.is_archived && nc.statut === 'CLOTUREE' && (
                                                    <>
                                                        <button
                                                            onClick={() => openNcDetailsModal(nc.id_non_conformite)}
                                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Détails (L'œil)"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => executeArchive(nc.id_non_conformite, nc.numero_nc, false)}
                                                            className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                            title="Archiver"
                                                        >
                                                            <Archive className="h-4 w-4" />
                                                        </button>
                                                        {hasPermission(user, 'non_conformites', 'export') && (
                                                            <button
                                                                onClick={() => exportNonConformitePDF(nc.id_non_conformite)}
                                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Exporter en PDF"
                                                            >
                                                                <FileDown className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* ARCHIVÉE - Sortir des archives */}
                                                {nc.is_archived && (
                                                    <>
                                                        <button
                                                            onClick={() => openNcDetailsModal(nc.id_non_conformite)}
                                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Consulter"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => executeArchive(nc.id_non_conformite, nc.numero_nc, true)}
                                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Sortir des archives"
                                                        >
                                                            <Inbox className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Delete - Always reserved for Admin with signature */}
                                                {(
                                                    user?.personnel?.role?.nom_role?.toLowerCase().includes('admin') ||
                                                    user?.personnel?.role?.nom_role === 'Administrateur'
                                                ) && (
                                                        <button
                                                            onClick={() => handleDeleteClick(nc.id_non_conformite, nc.numero_nc)}
                                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Supprimer (Requiert Signature)"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                {/* Secondary Actions Menu - Only for non-closed active NCs */}
                                                {!nc.is_archived && nc.statut !== 'CLOTUREE' && (
                                                    <ActionsMenu nc={nc} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Optional: Footer Pagination */}
                {!isLoading && data && data.meta.total > 0 && (
                    <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {data.meta.total} Anomalies détectées sur le cycle actuel
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={data.meta.current_page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            >
                                Archive Précédente
                            </button>
                            <button
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={data.meta.current_page === data.meta.last_page}
                                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            >
                                Page Suivante
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Layers,
    Plus,
    Pencil,
    Trash2,
    Search,
    Calendar,
    Clock,
    ShieldAlert,
    Target,
    Activity,
    FileCheck,
    Filter,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { typeTestsService } from '@/services/typeTestsService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function TypeTestsPage() {
    const queryClient = useQueryClient();
    const { openTypeTestModal } = useModalStore();
    const [search, setSearch] = useState('');

    const { data: typeTests = [], isLoading } = useQuery({
        queryKey: ['type-tests', search],
        queryFn: () => typeTestsService.getTypeTests({ search }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => typeTestsService.deleteTypeTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['type-tests'] });
            toast.success('Protocole technique archivé');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    });

    const handleDelete = (id: string, name: string) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 uppercase">Supprimer le protocole ?</p>
                        <p className="text-[10px] text-gray-500 font-bold">{name}</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Cette action supprimera définitivement le référentiel de test. Les tests historiques ne seront pas affectés.
                </p>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            deleteMutation.mutate(id);
                        }}
                        className="px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '24px',
                background: '#fff',
                padding: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #fee2e2'
            },
        });
    };

    // Derived Statistics (Dashboard Style)
    const stats = useMemo(() => {
        return {
            total: typeTests.length,
            mandatory: typeTests.filter(t => t.categorie_principale === 'Obligatoire').length,
            active: typeTests.filter(t => t.actif).length,
            critical: typeTests.filter(t => (t.niveau_criticite_defaut || 0) >= 3).length
        };
    }, [typeTests]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Dashboard Style) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Layers className="h-7 w-7 text-blue-600" />
                        Référentiel Technique
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Configuration et gestion des protocoles de tests industriels</p>
                </div>
                <button
                    onClick={() => openTypeTestModal()}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Définir un Protocole
                </button>
            </div>

            {/* 2. KPI Cards Row (The core "Dashboard" look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocoles</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-blue-500 rounded-r-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actifs</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.active}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-amber-500 rounded-r-full" style={{ width: `${(stats.active / stats.total) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haut Risque</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.critical}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${(stats.critical / stats.total) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <FileCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réglementaires</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.mandatory}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${(stats.mandatory / stats.total) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 3. Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, libellé, méthodologie..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all">
                        <option value="">Toutes Catégories</option>
                        <option value="Standard">Standard (Maint.)</option>
                        <option value="Obligatoire">Réglementaire</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Content: Dense Table View (The Professional Dashboard look) */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Code & Libellé</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Catégorie</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Périodicité</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Sévérité</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Status</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-7 py-6"><div className="h-8 bg-slate-50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : typeTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-7 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Layers className="h-16 w-16 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun protocole identifié</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                typeTests.map((type) => (
                                    <tr key={type.id_type_test} className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-blue-500">
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{type.code_type}</span>
                                                <span className="text-[13px] font-black text-slate-800 capitalize mt-0.5">{type.libelle}</span>
                                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 italic mt-1">{type.description || 'Sans description technique'}</p>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight",
                                                type.categorie_principale === 'Obligatoire' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                                            )}>
                                                {type.categorie_principale || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-700">{type.frequence_recommandee || 'Ponctuel'} M</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-700">{type.duree_estimee_jours || '0'} J</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex -space-x-1.5">
                                                {[1, 2, 3, 4].map(n => (
                                                    <div
                                                        key={n}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black transition-all",
                                                            n <= (type.niveau_criticite_defaut || 1)
                                                                ? "bg-slate-900 text-white shadow-sm z-10"
                                                                : "bg-slate-100 text-slate-300 z-0"
                                                        )}
                                                    >
                                                        N{n}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    type.actif ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-300"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    type.actif ? "text-emerald-600" : "text-slate-400"
                                                )}>
                                                    {type.actif ? 'Actif' : 'Archivé'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openTypeTestModal(type.id_type_test)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(type.id_type_test, type.libelle)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Optional: Footer Pagination (Dashboard Style) */}
                <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Total de {typeTests.length} protocoles techniques répertoriés
                    </span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30" disabled>
                            Précèdent
                        </button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

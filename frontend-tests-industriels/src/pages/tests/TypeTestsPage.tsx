import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Layers,
    Plus,
    Pencil,
    Trash2,
    Search,
    Calendar,
    Clock
} from 'lucide-react';
import { typeTestsService } from '@/services/typeTestsService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';

export default function TypeTestsPage() {
    const queryClient = useQueryClient();
    const { openTypeTestModal } = useModalStore();
    const [search, setSearch] = useState('');

    const { data: typeTests, isLoading } = useQuery({
        queryKey: ['type-tests', search],
        queryFn: () => typeTestsService.getTypeTests({ search }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => typeTestsService.deleteTypeTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['type-tests'] });
            toast.success('Type de test supprimé');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le type "${name}" ?`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header Profilé */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-primary-400 shadow-2xl shadow-gray-200">
                        <Layers size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Référentiel des Tests</h1>
                        <p className="text-gray-500 font-medium italic mt-1">Gestion des protocoles et types de contrôles industriels</p>
                    </div>
                </div>

                <button
                    onClick={() => openTypeTestModal()}
                    className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-200 transition-all duration-300 active:scale-95 group shadow-xl shadow-gray-200 border border-white/10"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Nouveau Protocole
                </button>
            </div>

            {/* Barre de Recherche Premium */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Filtrer par code, libellé ou catégorie..."
                    className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm text-lg font-bold focus:shadow-2xl focus:border-primary-100 outline-none transition-all placeholder:text-gray-300 placeholder:italic"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grille de types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : typeTests?.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 flex flex-col items-center justify-center">
                        <Layers className="h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Aucun protocole configuré</h3>
                    </div>
                ) : (
                    typeTests?.map((type) => (
                        <div
                            key={type.id_type_test}
                            className="group bg-white rounded-[2.5rem] p-2 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary-100 transition-all duration-500 flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        type.categorie_principale === 'Obligatoire' ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary-600"
                                    )}>
                                        {type.categorie_principale}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            type.actif ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                                        )} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {type.actif ? 'Actif' : 'Obsolète'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{type.code_type}</span>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors capitalize">
                                        {type.libelle}
                                    </h3>
                                    {type.description && (
                                        <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed italic">
                                            "{type.description}"
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">{type.frequence_recommandee || 'Ponctuel'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                                        <Clock size={14} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">{type.duree_estimee_jours || '0'} Jours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer Panel */}
                            <div className="p-4 bg-gray-50/50 rounded-[2rem] flex items-center justify-between mt-auto">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(n => (
                                        <div
                                            key={n}
                                            className={cn(
                                                "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black",
                                                n <= (type.niveau_criticite_defaut || 1) ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"
                                            )}
                                        >
                                            N{n}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openTypeTestModal(type.id_type_test)}
                                        className="p-3 bg-white text-gray-400 hover:text-primary-600 hover:shadow-lg rounded-2xl transition-all"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type.id_type_test, type.libelle)}
                                        className="p-3 bg-white text-gray-400 hover:text-red-500 hover:shadow-lg rounded-2xl transition-all"
                                    >
                                        <Trash2 size={18} />
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

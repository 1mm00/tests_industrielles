import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FlaskConical,
    Plus,
    ShieldCheck,
    Search,
    BookOpen,
    Clock,
    Trash2,
    Settings,
    FileText,
    Activity,
    Target,
    Zap,
    History,
    ChevronRight,
    Filter
} from 'lucide-react';
import { typeTestsService } from '@/services/typeTestsService';
import { useModalStore } from '@/store/modalStore';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function ProtocolManagementPage() {
    const queryClient = useQueryClient();
    const { openTypeTestModal, openMethodDesignerModal } = useModalStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch type tests directly using the dedicated service
    const { data: protocolTypes = [], isLoading } = useQuery({
        queryKey: ['type-tests', searchTerm],
        queryFn: () => typeTestsService.getTypeTests({ search: searchTerm }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => typeTestsService.deleteTypeTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['type-tests'] });
            toast.success('Protocole technique supprimé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    });

    const handleDelete = (id: string, label: string) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[300px]">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Supprimer le protocole ?</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    Cette action est irréversible. Toutes les configurations de mesures associées seront également supprimées.
                </p>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            deleteMutation.mutate(id);
                        }}
                        className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                    >
                        Confirmer Suppression
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '32px',
                background: '#fff',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #fee2e2'
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <BookOpen className="h-7 w-7 text-indigo-600" />
                        Bibliothèque de Protocoles
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Standardisation des méthodologies et critères de conformité</p>
                </div>

                <button
                    onClick={() => openTypeTestModal()}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Créer un Protocole
                </button>
            </div>

            {/* 2. Search & Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par libellé ou code technique..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                    {['Tous', 'Production', 'Qualité', 'R&D'].map((cat) => (
                        <button key={cat} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 transition-all shrink-0">
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl animate-pulse space-y-4">
                            <div className="h-14 w-14 bg-slate-50 rounded-2xl" />
                            <div className="h-4 bg-slate-50 rounded w-2/3" />
                            <div className="h-12 bg-slate-50 rounded w-full" />
                        </div>
                    ))
                ) : protocolTypes.length === 0 ? (
                    <div className="col-span-full py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Aucun Protocole Référencé</h3>
                        <p className="text-slate-400 mt-2 font-medium italic">Commencez par définir un nouveau flow de test pour le parc industriel.</p>
                        <button
                            onClick={() => openTypeTestModal()}
                            className="mt-8 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all active:scale-95"
                        >
                            Initialiser le premier node
                        </button>
                    </div>
                ) : (
                    protocolTypes.map((type: any) => (
                        <div key={type.id_type_test} className="group bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
                            <div className="absolute -right-6 -top-6 h-32 w-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-all" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                        <FlaskConical className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest">
                                            {type.code_type}
                                        </span>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                                            type.actif ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full", type.actif ? "bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]" : "bg-rose-500")} />
                                            {type.actif ? "Actif" : "Archivé"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 flex-1">
                                    <h3 className="text-lg font-black text-slate-900 uppercase leading-tight mb-2 flex items-center gap-2">
                                        {type.libelle}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 italic leading-relaxed">
                                        {type.description || "Protocole technique standard sans description additionnelle."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <History className="h-3.5 w-3.5 text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type.frequence_recommandee || "Ponctuel"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau {type.niveau_criticite_defaut}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4">
                                    <button
                                        onClick={() => openMethodDesignerModal(type.id_type_test)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-900 group-hover:bg-slate-900 text-slate-500 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                    >
                                        <Settings className="h-3.5 w-3.5" />
                                        Designer
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type.id_type_test, type.libelle)}
                                        disabled={deleteMutation.isPending}
                                        className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50 text-slate-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. Advanced Designer Footer (Premium Promo) */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-600/30 to-transparent pointer-events-none" />
                <div className="absolute left-0 bottom-0 h-1/2 w-full bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                                <Zap className="h-6 w-6 text-indigo-400 fill-current" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Configuration de l'Expertise</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed italic opacity-80">
                            "Définissez les <span className="text-indigo-400 font-black">critères de tolérance</span> et les <span className="text-indigo-400 font-black">seuils d'alerte</span> pour chaque type de test. Le moteur d'analyse calculera automatiquement la conformité technique en temps réel."
                        </p>
                    </div>
                    <button
                        onClick={() => protocolTypes.length > 0 && openMethodDesignerModal(protocolTypes[0].id_type_test)}
                        className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl group/btn"
                    >
                        Explorer le Flow Designer
                        <ChevronRight className="inline-block ml-3 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FlaskConical,
    Plus,
    ShieldCheck,
    Search,
    BookOpen,
    Trash2,
    Settings,
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
            toast.success('Protocole technique archivé avec succès');
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
                    Cette action désactivera définitivement ce modèle analytique dans tout le parc industriel.
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area (Executive Premium HUD) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <BookOpen className="h-6.5 w-6.5" />
                        </div>
                        Bibliothèque de Protocoles
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic mt-1 ml-16">Standardisation des méthodologies et critères de conformité analytique</p>
                </div>

                <button
                    onClick={() => openTypeTestModal()}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black hover:scale-105 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-95 group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Créer un Protocole
                </button>
            </div>

            {/* 2. Search & Ultra-Thin Filters HUD */}
            <div className="p-3 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-[2rem] flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Rechercher par libellé ou code technique..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 outline-none transition-all placeholder:italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0 px-2">
                    <Filter className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
                    {['Tous', 'Production', 'Qualité', 'R&D'].map((cat, idx) => (
                        <button key={cat} className={cn(
                            "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                            idx === 0
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                : "bg-white text-slate-400 border-slate-100 hover:text-indigo-600 hover:border-indigo-100"
                        )}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. High-Fidelity Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm animate-pulse space-y-6">
                            <div className="h-16 w-16 bg-slate-50 rounded-[1.5rem]" />
                            <div className="space-y-3">
                                <div className="h-5 bg-slate-50 rounded-lg w-2/3" />
                                <div className="h-16 bg-slate-50 rounded-2xl w-full" />
                            </div>
                        </div>
                    ))
                ) : protocolTypes.length === 0 ? (
                    <div className="col-span-full py-28 bg-white/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-12">
                            <BookOpen className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Aucun Protocole Référencé</h3>
                        <p className="text-slate-400 mt-3 font-medium italic text-sm">Initialisez la standardisation technique de votre parc industriel.</p>
                        <button
                            onClick={() => openTypeTestModal()}
                            className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100"
                        >
                            Initialiser le Master-Node
                        </button>
                    </div>
                ) : (
                    protocolTypes.map((type: any) => (
                        <div key={type.id_type_test} className="group bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-30px_rgba(99,102,241,0.15)] hover:border-indigo-100 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-all duration-700" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="h-16 w-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                                        <FlaskConical className="h-8 w-8" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100 uppercase tracking-widest shadow-sm">
                                            {type.code_type}
                                        </span>
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border shadow-sm transition-all",
                                            type.actif ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full", type.actif ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-rose-500")} />
                                            {type.actif ? "Master" : "Archivé"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8 flex-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase leading-[1.1] mb-3 tracking-tighter group-hover:text-indigo-600 transition-colors">
                                        {type.libelle}
                                    </h3>
                                    <p className="text-[13px] text-slate-500 font-medium line-clamp-2 italic leading-relaxed opacity-80">
                                        {type.description || "Protocole technique standard sans description additionnelle."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 py-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                            <History className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fréquence</p>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{type.frequence_recommandee || "Ponctuel"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Criticité</p>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Niveau {type.niveau_criticite_defaut}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <button
                                        onClick={() => openMethodDesignerModal(type.id_type_test)}
                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 active:scale-95 shadow-sm"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Designer
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type.id_type_test, type.libelle)}
                                        disabled={deleteMutation.isPending}
                                        className="p-4 bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all disabled:opacity-50 text-slate-400 shadow-sm"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. Advanced Designer Footer (Premium Promo HUD) */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
                <div className="absolute left-0 bottom-0 h-1/2 w-full bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="h-14 w-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:rotate-12 transition-all duration-500">
                                <Zap className="h-8 w-8 text-indigo-400 fill-current" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Engineering Hub</h2>
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Standardization Engine v4.0</p>
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium text-xl leading-relaxed italic opacity-90 max-w-2xl">
                            "L'orchestration des données commence par un <span className="text-white font-black underline underline-offset-8">protocole rigoureux</span>. Définissez vos seuils, simplifiez vos expertises."
                        </p>
                    </div>
                    <button
                        onClick={() => protocolTypes.length > 0 && openMethodDesignerModal(protocolTypes[0].id_type_test)}
                        className="px-12 py-6 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.25em] hover:bg-indigo-400 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-2xl group/btn overflow-hidden relative"
                    >
                        <span className="relative z-10">Lancer le Designer</span>
                        <ChevronRight className="inline-block ml-4 h-5 w-5 group-hover/btn:translate-x-2 transition-transform relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>
        </div>
    );
}

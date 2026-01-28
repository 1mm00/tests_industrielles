import { useQuery } from '@tanstack/react-query';
import {
    FlaskConical,
    Plus,
    ShieldCheck,
    Search,
    BookOpen,
    Clock,
    Trash2,
    Settings
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { cn } from '@/utils/helpers';

export default function ProtocolManagementPage() {
    // In a real app, this would be its own service, but we'll use creation-data to get types
    const { data: creationData, isLoading } = useQuery({
        queryKey: ['test-creation-data'],
        queryFn: () => testsService.getCreationData(),
    });

    const protocolTypes = creationData?.types_tests || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Gestion des Protocoles</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Définition des méthodologies, critères d'acceptation et checklists de contrôle</p>
                </div>

                <button className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-sm shadow-xl">
                    <Plus className="h-5 w-5" />
                    CRÉER UN PROTOCOLE
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher un protocole technique..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['Tous', 'Production', 'Qualité', 'Sécurité'].map((cat) => (
                        <button key={cat} className="px-5 py-2.5 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-gray-300 transition-all">
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl animate-pulse space-y-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                            <div className="h-3 bg-gray-50 rounded w-full" />
                        </div>
                    ))
                ) : protocolTypes.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <BookOpen className="h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-black text-gray-900 uppercase">Aucun Protocole Défini</h3>
                        <p className="text-gray-400 mt-2 font-medium">Commencez par définir un nouveau type de test pour le parc industriel.</p>
                    </div>
                ) : (
                    protocolTypes.map((type: any) => (
                        <div key={type.id_type_test} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 h-24 w-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="h-14 w-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <FlaskConical className="h-8 w-8" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded border border-indigo-100 uppercase tracking-widest">
                                            {type.code_type}
                                        </span>
                                        <div className={cn(
                                            "flex items-center gap-1 text-[8px] font-black uppercase",
                                            type.actif ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full", type.actif ? "bg-emerald-500" : "bg-red-500")} />
                                            {type.actif ? "Actif" : "Inactif"}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase leading-tight mb-2">
                                        {type.libelle}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium line-clamp-2">
                                        {type.description || "Aucune description détaillée pour ce protocole technique."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-300" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{type.frequence_recommandee || "Ponctuel"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-gray-300" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Niveau {type.niveau_criticite_defaut}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <button className="flex-1 px-4 py-3 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        Paramétrage
                                    </button>
                                    <button className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Advanced Settings Placeholder */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-600/20 to-transparent" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Settings className="h-8 w-8 text-indigo-400" />
                            <h2 className="text-2xl font-black uppercase">Configuration de l'Expertise</h2>
                        </div>
                        <p className="text-gray-400 font-medium text-lg leading-relaxed">
                            Définissez les <span className="text-white font-black">critères de tolérance</span> et les <span className="text-white font-black">seuils d'alerte</span> pour chaque type de test.
                            Le système calculera automatiquement la conformité lors de la saisie des mesures.
                        </p>
                    </div>
                    <button className="px-10 py-5 bg-white text-gray-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                        Ouvrir le Designer de Méthodes
                    </button>
                </div>
            </div>
        </div>
    );
}

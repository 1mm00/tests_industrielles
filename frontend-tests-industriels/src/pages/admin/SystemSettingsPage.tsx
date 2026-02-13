import React, { useState, useEffect } from 'react';
import {
    Settings,
    Book,
    Building2,
    Briefcase,
    Search,
    Plus,
    ShieldCheck,
    AlertCircle,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Globe,
    Scale,
    Users,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService } from '@/services/settingsService';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import SystemSettingsModal from '@/components/modals/SystemSettingsModal';

type TabType = 'normes' | 'departements' | 'postes';

const SystemSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('normes');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'normes') res = await settingsService.getNormes({ search });
            else if (activeTab === 'departements') res = await settingsService.getDepartements();
            else res = await settingsService.getPostes({ search });

            // Handle paginated vs non-paginated response
            setData(res.data.data.data || res.data.data);
        } catch (error) {
            toast.error("Erreur lors de la récupération des données");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

        try {
            if (activeTab === 'normes') await settingsService.deleteNorme(id);
            else if (activeTab === 'departements') await settingsService.deleteDepartement(id);
            else await settingsService.deletePoste(id);

            toast.success("Élément supprimé");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur de suppression");
        }
    };

    const tabs = [
        { id: 'normes', label: 'Normes ISO', icon: Book },
        { id: 'departements', label: 'Départements', icon: Building2 },
        { id: 'postes', label: 'Postes de Travail', icon: Briefcase },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header / Navigation Support */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 rotate-3 transition-transform hover:rotate-0">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5 uppercase">Paramètres Système</h1>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Gestion des référentiels industriels certifiés
                                </p>
                            </div>
                        </div>

                        {/* Search & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Indexation rapide..."
                                    className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[12.5px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none w-full md:w-[280px] transition-all placeholder:text-slate-400"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                                />
                            </div>
                            <button
                                className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleAdd}
                            >
                                <Plus className="h-4 w-4" /> Ajouter
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11.5px] font-black uppercase tracking-widest transition-all border-2",
                                    activeTab === tab.id
                                        ? "bg-white border-slate-900 text-slate-900 shadow-md"
                                        : "bg-transparent border-transparent text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-blue-600" : "")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {/* Content Area */}
                <div className="grid grid-cols-12 gap-8">

                    {/* Left Panel: Statistics Recap */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <div className="bg-slate-900 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Statistiques</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-[11px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">Total {activeTab}</span>
                                    <span className="text-2xl font-black">{data.length}</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-[11px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">Actifs %</span>
                                    <span className="text-2xl font-black text-emerald-400">100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Aide à l'Administration</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                                    <div className="h-10 w-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl shrink-0">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11.5px] font-black text-slate-900 leading-tight">Audit de Conformité</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Vérifier l'immuabilité</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                                    <div className="h-10 w-10 flex items-center justify-center bg-amber-50 text-amber-600 rounded-xl shrink-0">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11.5px] font-black text-slate-900 leading-tight">Mise à jour ISO</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Importer via API externe</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Listing Panel */}
                    <div className="col-span-12 lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl p-4 min-h-[500px]"
                            >
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sychronisation des référentiels...</p>
                                    </div>
                                ) : data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[500px] gap-6 text-center px-12">
                                        <div className="p-6 bg-slate-50 rounded-[2.5rem]">
                                            <AlertCircle className="h-12 w-12 text-slate-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase">Aucun élément</h4>
                                            <p className="text-slate-500 text-sm mt-2">La base de données pour cette catégorie est actuellement vide ou aucun résultat ne correspond à votre recherche.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden">
                                        <table className="w-full text-left border-separate border-spacing-y-3">
                                            <thead>
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    <th className="px-8 pb-4">Identifiant / Code</th>
                                                    <th className="px-6 pb-4">Désignation / Détails</th>
                                                    <th className="px-6 pb-4">Statut</th>
                                                    <th className="px-6 pb-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.map((item, idx) => (
                                                    <motion.tr
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group bg-white hover:bg-slate-50 transition-all rounded-3xl"
                                                    >
                                                        <td className="px-8 py-5 first:rounded-l-[2rem]">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 bg-slate-100 group-hover:bg-white rounded-xl flex items-center justify-center text-slate-400 transition-colors">
                                                                    {activeTab === 'normes' ? <Scale className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[12.5px] font-black text-slate-900 tracking-tight leading-none uppercase">
                                                                        {activeTab === 'normes' ? item.code_norme : activeTab === 'departements' ? item.code_departement : item.code_poste}
                                                                    </p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {item.id_norme || item.id_departement || item.id_poste}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <p className="text-[11.5px] font-bold text-slate-700 leading-snug max-w-xs">{item.titre || item.libelle}</p>
                                                            {activeTab === 'normes' && <p className="text-[9px] font-bold text-blue-500 uppercase mt-1 tracking-wider">{item.organisme_emission} | Ver. {item.version}</p>}
                                                            {activeTab === 'postes' && <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1 tracking-wider">{item.categorie}</p>}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                                item.actif !== false || item.statut === 'ACTIF' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                                            )}>
                                                                {item.actif !== false || item.statut === 'ACTIF' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                                {item.actif !== false || item.statut === 'ACTIF' ? "Actif" : "Inactif"}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 last:rounded-r-[2rem] text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                                <button
                                                                    className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                                                    onClick={() => handleEdit(item)}
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                                                    onClick={() => handleDelete(item.id_norme || item.id_departement || item.id_poste)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <SystemSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={activeTab}
                initialData={selectedItem}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default SystemSettingsPage;

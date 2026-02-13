import React, { useState, useEffect } from 'react';
import {
    Shield,
    Search,
    Clock,
    User,
    ChevronDown,
    ChevronUp,
    Eye,
    History,
    AlertCircle,
    Database,
    ArrowRight,
    Activity
} from 'lucide-react';
import api from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLog {
    id: string;
    user_id: string;
    event: 'created' | 'updated' | 'deleted';
    auditable_type: string;
    auditable_id: string;
    old_values: any;
    new_values: any;
    url: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user?: {
        personnel?: {
            nom: string;
            prenom: string;
        }
    }
}

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        event: '',
        type: '',
        search: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/audit-logs', { params: filters });
            setLogs(response.data.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventBadge = (event: string) => {
        switch (event) {
            case 'created':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">CRÉATION</span>;
            case 'updated':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">MODIFICATION</span>;
            case 'deleted':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">SUPPRESSION</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{event.toUpperCase()}</span>;
        }
    };

    const formatEntityName = (type: string) => {
        const parts = type.split('\\');
        return parts[parts.length - 1];
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Journal d'Audit ISO</h1>
                                <p className="text-slate-500 font-medium">Traçabilité complète et immuable du système</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-700 border border-indigo-100">
                                <History className="h-4 w-4" />
                                <span className="text-sm font-semibold">Lecture Seule</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Filtres */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une entité ID ou utilisateur..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4">
                        <select
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                            value={filters.event}
                            onChange={(e) => setFilters({ ...filters, event: e.target.value })}
                        >
                            <option value="">Tous les évènements</option>
                            <option value="created">Créations</option>
                            <option value="updated">Modifications</option>
                            <option value="deleted">Suppressions</option>
                        </select>

                        <select
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">Toutes les entités</option>
                            <option value="NonConformite">Non-Conformités</option>
                            <option value="TestIndustriel">Tests Industriels</option>
                            <option value="Equipement">Équipements</option>
                            <option value="InstrumentMesure">Instruments</option>
                        </select>
                    </div>
                </div>

                {/* Liste des Logs */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Chargement du journal d'audit...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Aucun log trouvé</h3>
                            <p className="text-slate-500">Modifiez vos filtres de recherche.</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className={`bg-white rounded-2xl border transition-all duration-300 ${expandedLog === log.id ? 'border-indigo-500 shadow-xl' : 'border-slate-200 shadow-sm hover:border-indigo-200 shadow-indigo-100/10'}`}
                            >
                                {/* Ligne Principale */}
                                <div
                                    className="p-5 cursor-pointer flex items-center justify-between gap-6"
                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                >
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className={`p-2.5 rounded-xl ${log.event === 'created' ? 'bg-emerald-50 text-emerald-600' :
                                            log.event === 'updated' ? 'bg-amber-50 text-amber-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                            <Activity className="h-5 w-5" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-8 flex-1">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getEventBadge(log.event)}
                                                    <span className="text-sm font-bold text-slate-900">{formatEntityName(log.auditable_type)}</span>
                                                </div>
                                                <span className="text-xs text-slate-400 font-mono tracking-tight">{log.auditable_id}</span>
                                            </div>

                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span className="text-sm font-semibold">
                                                        {log.user?.personnel ? `${log.user.personnel.prenom} ${log.user.personnel.nom}` : 'Système / Automatique'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium">IP: {log.ip_address}</span>
                                            </div>

                                            <div className="flex flex-col justify-center items-end hidden md:flex">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className="text-sm font-medium">
                                                        {format(new Date(log.created_at), 'd MMMM yyyy (HH:mm)', { locale: fr })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                                        {expandedLog === log.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>

                                {/* Détails étendus */}
                                {expandedLog === log.id && (
                                    <div className="px-5 pb-6 border-t border-slate-100 pt-6 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Old Values */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-rose-600">
                                                    <Eye className="h-4 w-4" />
                                                    <h4 className="text-sm font-bold uppercase tracking-wider">État Précédent</h4>
                                                </div>
                                                <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100 font-mono text-xs text-slate-700 overflow-x-auto min-h-[100px]">
                                                    {log.old_values ? (
                                                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.old_values, null, 2)}</pre>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-rose-400 italic">Aucune donnée précédente (Création)</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* New Values */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <ArrowRight className="h-4 w-4" />
                                                    <h4 className="text-sm font-bold uppercase tracking-wider">Nouvel État</h4>
                                                </div>
                                                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 font-mono text-xs text-slate-700 overflow-x-auto min-h-[100px]">
                                                    {log.new_values ? (
                                                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.new_values, null, 2)}</pre>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-rose-400 italic">Objet supprimé</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Database className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase tracking-tighter">Contexte Web</span>
                                            </div>
                                            <div className="text-xs text-slate-600 font-medium truncate max-w-lg">
                                                {log.user_agent}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;

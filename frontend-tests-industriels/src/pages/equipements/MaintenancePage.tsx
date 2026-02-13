import React, { useState, useEffect } from 'react';
import {
    Wrench,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Plus,
    Search,
    Settings,
    Timer
} from 'lucide-react';
import api from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import MaintenanceCreationModal from '@/components/modals/MaintenanceCreationModal';

interface Maintenance {
    id_maintenance: string;
    numero_intervention: string;
    titre: string;
    type: 'PREVENTIVE' | 'CURATIVE' | 'CALIBRATION';
    statut: 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'ANNULEE';
    priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
    date_prevue: string;
    equipement: {
        designation: string;
        code_equipement: string;
    };
    periodicite_jours?: number;
}

const MaintenancePage: React.FC = () => {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        statut: ''
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [listRes, statsRes] = await Promise.all([
                api.get('/maintenances', { params: filters }),
                api.get('/maintenances/stats')
            ]);
            setMaintenances(listRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            toast.error("Erreur lors du chargement des maintenances");
        } finally {
            setLoading(false);
        }
    };

    const getStatutBadge = (statut: string) => {
        const styles: any = {
            PLANIFIEE: 'bg-blue-50 text-blue-700 border-blue-100',
            EN_COURS: 'bg-amber-50 text-amber-700 border-amber-100',
            REALISEE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            ANNULEE: 'bg-slate-50 text-slate-700 border-slate-100'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[statut] || styles.PLANIFIEE}`}>
                {statut}
            </span>
        );
    };

    const getPrioriteBadge = (priorite: string) => {
        const styles: any = {
            BASSE: 'text-slate-500',
            MOYENNE: 'text-blue-500',
            HAUTE: 'text-orange-500',
            CRITIQUE: 'text-rose-600 font-black'
        };
        return (
            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${styles[priorite]}`}>
                {priorite}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Industriel */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-100">
                                <Wrench className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance Préventive</h1>
                                <p className="text-slate-500 font-medium">GMAO & Planification des interventions</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200 transform active:scale-95 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvel Entretien
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'À Réaliser', val: stats?.a_faire, icon: Clock, color: 'blue' },
                        { label: 'En Retard', val: stats?.retard, icon: AlertCircle, color: 'rose' },
                        { label: 'Terminées (Mois)', val: stats?.realisees_mois, icon: CheckCircle2, color: 'emerald' },
                        { label: 'Coûts (Mois)', val: `${stats?.cout_total_mois || 0} €`, icon: Settings, color: 'amber' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between hover:border-primary-200 transition-colors group">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                <h3 className="text-2xl font-black text-slate-900">{s.val}</h3>
                            </div>
                            <div className={`p-3 bg-${s.color}-50 text-${s.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <s.icon className="h-6 w-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtres & Liste */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <select
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.type}
                                onChange={e => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">Tous les Types</option>
                                <option value="PREVENTIVE">Préventive</option>
                                <option value="CURATIVE">Curative</option>
                                <option value="CALIBRATION">Calibration</option>
                            </select>
                        </div>
                        <div className="flex-1 max-w-md relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" placeholder="Rechercher par équipement ou numéro..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervention</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipement</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Planifiée pour</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorité</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-500 font-bold italic">Chargement des données...</td></tr>
                            ) : maintenances.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-500 font-bold italic">Aucune intervention planifiée</td></tr>
                            ) : maintenances.map(m => (
                                <tr key={m.id_maintenance} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 uppercase">{m.numero_intervention}</span>
                                            <span className="text-sm font-medium text-slate-600">{m.titre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-primary-600 uppercase tracking-tighter">{m.equipement.code_equipement}</span>
                                            <span className="text-xs font-medium text-slate-600">{m.equipement.designation}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold">{format(new Date(m.date_prevue), 'dd MMM yyyy', { locale: fr })}</span>
                                        </div>
                                        {m.periodicite_jours && (
                                            <span className="text-[10px] font-black text-primary-500 uppercase flex items-center gap-1 mt-1">
                                                <Timer className="h-3 w-3" /> Récurrent ({m.periodicite_jours}j)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{getPrioriteBadge(m.priorite)}</td>
                                    <td className="px-6 py-4">{getStatutBadge(m.statut)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                            <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <MaintenanceCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default MaintenancePage;

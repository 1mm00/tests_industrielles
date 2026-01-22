import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Calendar,
    Clock,
    ChevronRight,
    ShieldAlert,
    Thermometer,
    Bell,
    CheckCircle2,
    Settings,
    ArrowRight,
    Zap
} from 'lucide-react';
import { instrumentsService } from '@/services/instrumentsService';
import { formatDate } from '@/utils/helpers';
import { Link } from 'react-router-dom';

export default function CalibrationAlertsPage() {
    const { data: alerts, isLoading } = useQuery({
        queryKey: ['calibration-alerts'],
        queryFn: () => instrumentsService.getCalibrationAlerts(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const expiredCount = alerts?.expired?.length || 0;
    const upcomingCount = alerts?.upcoming?.length || 0;

    return (
        <div className="space-y-8">
            {/* Header simplifié */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            Centre d'Alertes Métrologie
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Surveillance en temps réel des échéances de calibration</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-red-100 rounded-xl flex items-center justify-center">
                                    <ShieldAlert className="h-7 w-7 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Calibrations Échues</p>
                                    <p className="text-3xl font-black text-gray-900">{expiredCount}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-widest">
                                    Critique
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Clock className="h-7 w-7 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prochaines (30j)</p>
                                    <p className="text-3xl font-black text-gray-900">{upcomingCount}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-widest">
                                    À venir
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Instruments Échues - Design Moderne */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Instruments avec Calibration Échue</h2>
                        <p className="text-xs text-gray-500 font-medium">Action immédiate requise pour maintenir la conformité</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    {expiredCount === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center gap-4">
                            <div className="h-20 w-20 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Tout est en ordre</h3>
                                <p className="text-sm text-gray-500">Aucun instrument n'a dépassé sa date de calibration.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {alerts?.expired.map((inst: any, index: number) => (
                                <div key={inst.id_instrument} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-red-50/50 transition-all group">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                                            <Thermometer className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="inline-block text-xs font-black px-3 py-1 bg-gray-900 text-white rounded-lg shadow-sm">
                                                    {inst.code_instrument}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">{inst.designation}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                <span className="font-bold text-gray-700">Localisation:</span> {inst.localisation || 'Non définie'} •
                                                <span className="font-bold text-gray-700 ml-2">Fabricant:</span> {inst.fabricant}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date d'échéance</p>
                                            <p className="text-sm font-black text-red-600 flex items-center gap-2 justify-end">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(inst.date_prochaine_calibration)}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/instruments/${inst.id_instrument}`}
                                            className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Section Prochaines Échéances - Design Moderne */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Zap className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Prochaines Échéances (30 jours)</h2>
                        <p className="text-xs text-gray-500 font-medium">Planification et anticipation des calibrations</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    {upcomingCount === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-gray-400 italic text-sm">Aucune calibration prévue dans les 30 prochains jours.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
                            {alerts?.upcoming.map((inst: any) => (
                                <div key={inst.id_instrument} className="bg-white p-6 hover:bg-orange-50/50 transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                                                <Settings className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-400 mb-1">{inst.code_instrument}</p>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{inst.designation}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black">
                                            {formatDate(inst.date_prochaine_calibration)}
                                        </span>
                                        <Link
                                            to={`/instruments/${inst.id_instrument}`}
                                            className="text-xs font-black text-gray-400 hover:text-orange-600 flex items-center gap-1 uppercase tracking-widest transition-colors"
                                        >
                                            Voir <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

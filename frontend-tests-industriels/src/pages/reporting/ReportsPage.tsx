import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    FileText,
    Download,
    Search,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    MoreVertical,
    Activity
} from 'lucide-react';
import { rapportsService, type RapportTest } from '@/services/rapportsService';
import { formatDate, cn } from '@/utils/helpers';
import { exportToPDF } from '@/utils/pdfExport';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permissions';
import { useModalStore } from '@/store/modalStore';

export default function ReportsPage() {
    const { user } = useAuthStore();
    const { openReportModal } = useModalStore();
    const [filters] = useState({ page: 1, per_page: 10 });

    const { data: rapportsData, isLoading } = useQuery({
        queryKey: ['rapports', filters],
        queryFn: () => rapportsService.getRapports(filters),
    });

    const { data: stats } = useQuery({
        queryKey: ['rapports-stats'],
        queryFn: () => rapportsService.getStats(),
    });

    const reports = rapportsData?.data || [];

    const handleExportPDF = () => {
        if (!reports) return;

        const headers = ["ID Rapport", "Type", "Test Associé", "Date Édition", "Rédacteur", "Statut"];
        const body = reports.map((report: RapportTest) => [
            report.numero_rapport,
            report.type_rapport,
            `${report.test?.numero_test || 'N/A'} \n(${report.test?.equipement?.designation || 'N/A'})`,
            formatDate(report.date_edition),
            report.redacteur ? `${report.redacteur.nom_complet}` : 'N/A',
            report.statut
        ]);

        exportToPDF({
            title: "Registre des Rapports de Tests Industriels",
            filename: "liste_rapports",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    const handleDownloadReport = async (report: RapportTest) => {
        if (report.statut === 'BROUILLON') {
            toast.error("Veuillez valider le rapport avant de l'exporter en PDF officiel.", {
                icon: '⚠️',
                duration: 4000
            });
            return;
        }

        try {
            toast.loading('Génération du PDF par le serveur...', { id: 'pdf-gen' });

            // On utilise axios pour récupérer le blob (car besoin du token Auth)
            const response = await fetch(rapportsService.getPdfDownloadUrl(report.id_rapport), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erreur serveur');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${report.numero_rapport}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Rapport PDF téléchargé !', { id: 'pdf-gen' });
        } catch (error) {
            console.error('Erreur PDF:', error);
            toast.error('Erreur lors de la génération du PDF par le serveur', { id: 'pdf-gen' });
        }
    };



    const getStatutColor = (statut: string) => {
        switch (statut.toUpperCase()) {
            case 'VALIDÉ':
            case 'VALIDE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'EN RÉVISION':
            case 'EN_REVISION':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'BROUILLON':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-900">
                        <FileText className="h-8 w-8 text-primary-600" />
                        Centre de Rapports
                    </h1>
                    <p className="text-gray-500 font-medium italic text-sm mt-1">Gestion et archivage des documents de contrôle industriel</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un rapport..."
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    {hasPermission(user, 'rapports', 'export') && (
                        <button
                            onClick={handleExportPDF}
                            className="p-2 bg-black border border-black rounded-xl hover:bg-gray-900 text-white shadow-sm transition-all"
                            title="Exporter la liste en PDF"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                    )}
                    {hasPermission(user, 'rapports', 'create') && (
                        <button
                            onClick={openReportModal}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300"
                        >
                            <Activity className="h-4 w-4" />
                            Générer Rapport Global
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Validés</p>
                        <h4 className="text-2xl font-black text-gray-900">{stats?.valides || 0}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Révision</p>
                        <h4 className="text-2xl font-black text-gray-900">{stats?.en_revision || 0}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Brouillons</p>
                        <h4 className="text-2xl font-black text-gray-900">{stats?.brouillons || 0}</h4>
                    </div>
                </div>
            </div>

            {/* Reports Grid/List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rapport / ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Test Associé</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date Édition</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rédacteur</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : reports?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-12 w-12 text-gray-200 mb-4" />
                                            <p className="text-gray-400 font-bold">Aucun rapport disponible</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports?.map((report: RapportTest) => (
                                    <tr key={report.id_rapport} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                                    <FileText className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{report.numero_rapport}</p>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{report.type_rapport}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-gray-700">{report.test?.numero_test || 'N/A'}</p>
                                            <p className="text-[10px] text-gray-400 font-medium italic">{report.test?.equipement?.designation || 'Équipement non spécifié'}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {formatDate(report.date_edition, 'short')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-700 border border-primary-200">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{report.redacteur ? `${report.redacteur.nom_complet}` : 'Utilisateur'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                getStatutColor(report.statut)
                                            )}>
                                                {report.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {hasPermission(user, 'rapports', 'read') && (
                                                    <button
                                                        onClick={() => openReportModal(report.id_rapport)}
                                                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                                                        title="Voir le rapport"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'rapports', 'export') && (
                                                    <button
                                                        onClick={() => handleDownloadReport(report)}
                                                        className={cn(
                                                            "p-2 rounded-lg border border-transparent transition-all",
                                                            report.statut === 'BROUILLON'
                                                                ? "text-gray-200 cursor-not-allowed"
                                                                : "text-gray-400 hover:bg-white hover:text-green-600 hover:shadow-sm hover:border-gray-200"
                                                        )}
                                                        title={report.statut === 'BROUILLON' ? "Rapport non validé" : "Télécharger PDF Officiel"}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'rapports', 'delete') && (
                                                    <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400">Affichage de {reports?.length || 0} rapports</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed">Précédent</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all">Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

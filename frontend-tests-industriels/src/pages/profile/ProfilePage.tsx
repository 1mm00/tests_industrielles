import { useQuery } from '@tanstack/react-query';
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Edit,
    Key,
    CheckCircle2,
    Activity,
    Briefcase,
    Building,
    Award,
    Clock
} from 'lucide-react';
import { authService } from '@/services/authService';

export default function ProfilePage() {
    const { data, isLoading } = useQuery({
        queryKey: ['auth-me'],
        queryFn: () => authService.me(),
    });

    const user = data?.user;
    const personnel = data?.personnel;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Profile Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-blue-500"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-xl">
                                <div className="h-full w-full rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 border border-primary-50">
                                    <User className="h-12 w-12" />
                                </div>
                            </div>
                            <div className="pb-2">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {personnel ? `${personnel.nom} ${personnel.prenom}` : user?.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full border border-green-200">
                                        Compte Actif
                                    </span>
                                    <span className="text-gray-400 font-bold text-xs">
                                        Matricule: {personnel?.matricule || 'TT-0000'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm bg-white">
                                <Edit className="h-4 w-4" />
                                Modifier Profil
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-md shadow-primary-200">
                                <Key className="h-4 w-4" />
                                Sécurité
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-t border-gray-50 pt-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                Informations de Contact
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">E-mail Professionnel</p>
                                        <p className="text-sm font-black text-gray-900">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Téléphone</p>
                                        <p className="text-sm font-black text-gray-900">{personnel?.telephone || 'Non renseigné'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                Profil Professionnel
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                                        <Building className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Département / Service</p>
                                        <p className="text-sm font-black text-gray-900">{personnel?.departement || personnel?.service || 'Qualité Industrielle'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Poste occupé</p>
                                        <p className="text-sm font-black text-gray-900">{personnel?.poste || personnel?.fonction || 'Technicien Senior'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics / Badges */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Award className="h-3 w-3" />
                                Habilitations & Qualités
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {personnel?.habilitations && Array.isArray(personnel.habilitations) ? (
                                    personnel.habilitations.map((h: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase rounded-lg border border-primary-100">
                                            {h}
                                        </span>
                                    ))
                                ) : (
                                    <>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">Qualité ISO</span>
                                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-lg border border-purple-100">Sécurité ATEX</span>
                                        <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100">Audit Interné</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary-600" />
                            Activité Récente
                        </h3>
                        <Activity className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-green-600 shadow-sm">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Test #TS-2026-001 validé</p>
                                <p className="text-xs text-gray-500 font-medium">Il y a 2 heures</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Rapport trimestriel généré</p>
                                <p className="text-xs text-gray-500 font-medium">Hier à 14:30</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary-600" />
                            Planning Personnel
                        </h3>
                        <Clock className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-[10px] font-black text-primary-600 leading-none">JAN</span>
                                    <span className="text-sm font-black text-gray-900 leading-none">20</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Inspection Turbine B4</p>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">09:00 - 12:00</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-[8px] font-black uppercase rounded-lg">Urgent</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

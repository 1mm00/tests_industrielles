import { FileText, Search, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Dashboard_Reader() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                    Interface Consultation (Lecteur)
                </h1>
                <p className="text-gray-500 font-medium italic mt-1">
                    Bienvenue, {user?.prenom}. Accès en mode lecture seule.
                </p>
            </div>

            {/* View Only Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                        <Search className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Rechercher un Test</h3>
                    <p className="text-gray-500 text-sm mt-1">Consulter les rapports de tests validés</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Bibliothèque Rapports</h3>
                    <p className="text-gray-500 text-sm mt-1">Accéder aux archives PDF</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Suivi KPIs</h3>
                    <p className="text-gray-500 text-sm mt-1">Visualiser l'évolution de la qualité</p>
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6">
                <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Mode Consultation Sécurisée</h3>
                    <p className="text-blue-100 text-sm mt-1">
                        Votre compte Lecteur vous permet de visualiser toutes les données industrielles sans possibilité de modification.
                        Pour toute demande de correction, contactez un administrateur.
                    </p>
                </div>
            </div>
        </div>
    );
}

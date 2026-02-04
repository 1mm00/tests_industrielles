import { FileText, Search, BarChart3, ShieldCheck, FlaskConical, Wrench, Microscope, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

export default function Dashboard_Reader() {
    const { user } = useAuthStore();

    const modules = [
        {
            title: "Tests Industriels",
            desc: "Consulter l'historique et l'avancement des contrôles en cours",
            icon: FlaskConical,
            link: "/tests",
            color: "bg-emerald-50 text-emerald-600 border-emerald-100"
        },
        {
            title: "Parc Équipements",
            desc: "Inventaire complet et état métrologique des actifs machines",
            icon: Wrench,
            link: "/equipements",
            color: "bg-primary-50 text-primary-600 border-primary-100"
        },
        {
            title: "Non-Conformités",
            desc: "Suivi des écarts techniques et des plans d'action qualité",
            icon: Microscope,
            link: "/non-conformites",
            color: "bg-rose-50 text-rose-600 border-rose-100"
        },
        {
            title: "Référentiel Rapports",
            desc: "Accès à l'archive des rapports PDF et documents de clôture",
            icon: FileText,
            link: "/reports",
            color: "bg-blue-50 text-blue-600 border-blue-100"
        },
        {
            title: "Instruments",
            desc: "Gestion du parc métrologique et des certificats de calibration",
            icon: Microscope,
            link: "/instruments",
            color: "bg-emerald-50 text-emerald-600 border-emerald-100"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative p-10 xl:p-14 rounded-[3rem] bg-gray-900 overflow-hidden shadow-2xl shadow-gray-200">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-500/10 to-transparent" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        Accès Consultation Sécurisé
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black text-white uppercase tracking-tight leading-none">
                        Supervision <span className="text-primary-400 italic">Qualité</span>
                    </h1>
                    <p className="text-gray-400 font-medium max-w-xl text-lg italic">
                        Bienvenue, <span className="text-white font-bold">{user?.personnel?.prenom || user?.name}</span>.
                        Votre interface de consultation vous donne accès à l'ensemble de la donnée industrielle en temps réel.
                    </p>
                </div>

                {/* Visual Accent */}
                <BarChart3 className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12" />
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {modules.map((mod, idx) => (
                    <Link
                        key={idx}
                        to={mod.link}
                        className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex items-start gap-8"
                    >
                        <div className={`h-20 w-20 shrink-0 rounded-[1.8rem] flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${mod.color}`}>
                            <mod.icon className="h-10 w-10" />
                        </div>
                        <div className="flex-1 space-y-2 py-1">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-primary-600 transition-colors">
                                {mod.title}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed italic">
                                {mod.desc}
                            </p>
                            <div className="pt-2 flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                Explorer le module <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom Insight */}
            <div className="mx-4 p-8 bg-primary-50/50 border border-primary-100 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary-600 border border-primary-100">
                        <Search className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">Besoin d'un rapport spécifique ?</h4>
                        <p className="text-sm text-gray-400 font-medium">Utilisez les filtres avancés dans chaque module pour une extraction précise.</p>
                    </div>
                </div>
                <Link to="/reports" className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200">
                    Accéder au registre PDF
                </Link>
            </div>
        </div>
    );
}

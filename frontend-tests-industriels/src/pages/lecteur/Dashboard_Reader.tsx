import { FileText, Search, BarChart3, ShieldCheck, FlaskConical, Wrench, Microscope, ArrowRight, Activity, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/helpers';

export default function Dashboard_Reader() {
    const { user } = useAuthStore();

    const modules = [
        {
            title: "Tests Industriels",
            desc: "Historique et avancement des contrôles en cours",
            icon: FlaskConical,
            link: "/tests",
            color: "emerald",
            detail: "Certification Terrain"
        },
        {
            title: "Parc Équipements",
            desc: "Inventaire complet et état métrologique des actifs",
            icon: Wrench,
            link: "/equipements",
            color: "blue",
            detail: "Gestion Assets"
        },
        {
            title: "Non-Conformités",
            desc: "Suivi des écarts techniques et plans d'action",
            icon: ShieldCheck,
            link: "/non-conformites",
            color: "orange",
            detail: "Contrôle Qualité"
        },
        {
            title: "Référentiel Rapports",
            desc: "Accès à l'archive des rapports PDF officiels",
            icon: FileText,
            link: "/reports",
            color: "indigo",
            detail: "Audit & Documentation"
        },
        {
            title: "Instruments",
            desc: "Gestion du parc métrologique et calibrations",
            icon: Microscope,
            link: "/instruments",
            color: "emerald",
            detail: "Précision Mesure"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header consistent with Admin style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Poste de Supervision</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-bold italic">Consultation sécurisée des données industrielles</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm backdrop-blur-sm">
                        <span>Lecteur</span>
                        <ChevronRight className="h-2.5 w-2.5" />
                        <span className="text-indigo-600">Vue Globale</span>
                    </div>
                </div>
            </div>

            {/* Hero Card style matching premium feel */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Authentication Validated
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
                            Système de <span className="text-indigo-400">Monitoring Central</span>
                        </h2>
                        <p className="text-slate-400 font-medium max-w-xl text-sm italic leading-relaxed">
                            Bienvenue, <span className="text-white font-bold">{user?.personnel?.prenom || user?.name || 'Expert'}</span>.
                            Accédez aux modules critiques ci-dessous pour l'extraction de rapports et l'analyse de conformité.
                        </p>
                    </div>
                </div>
                <BarChart3 className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod, idx) => (
                    <Link
                        key={idx}
                        to={mod.link}
                        className="group relative bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-500 overflow-hidden"
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 rounded-full transition-all group-hover:opacity-10",
                            mod.color === 'emerald' ? "bg-emerald-500" :
                                mod.color === 'blue' ? "bg-blue-500" :
                                    mod.color === 'orange' ? "bg-orange-500" :
                                        "bg-indigo-500"
                        )} />

                        <div className="relative z-10 flex flex-col gap-5">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md",
                                mod.color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white" :
                                    mod.color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" :
                                        mod.color === 'orange' ? "bg-gradient-to-br from-orange-400 to-red-500 text-white" :
                                            "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                            )}>
                                <mod.icon className="h-7 w-7" />
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {mod.title}
                                </h3>
                                <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic opacity-80">
                                    {mod.desc}
                                </p>
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mod.detail}</span>
                                <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom Insight Widget */}
            <div className="p-6 bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner text-indigo-600 border border-indigo-100/50">
                        <Search className="h-7 w-7" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">Extraction Analytique Spécifique ?</h4>
                        <p className="text-[11px] text-slate-500 font-medium italic">Utilisez les filtres de datation pour isoler les rapports de performance critiques.</p>
                    </div>
                </div>
                <Link to="/reports" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Registre Central PDF
                </Link>
            </div>
        </div>
    );
}

import { useQuery } from '@tanstack/react-query';
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Key,
    CheckCircle2,
    Activity,
    Briefcase,
    Award,
    Clock,
    MapPin,
    Cpu,
    ExternalLink,
    Zap,
    FlaskConical,
    FileBarChart,
    Settings
} from 'lucide-react';
import { authService } from '@/services/authService';
import { useModalStore } from '@/store/modalStore';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { openProfileEditModal } = useModalStore();
    const { data, isLoading } = useQuery({
        queryKey: ['auth-me'],
        queryFn: () => authService.me(),
    });

    const user = data?.user;
    const personnel = data?.personnel;
    const activitiesData = data?.activities || [];
    const habilitationsData = data?.habilitations || [
        { name: 'Formation Sécurité ATEX', progress: 85, expiry: 'Déc 2026' },
        { name: 'Certification ISO 9001:2015', progress: 100, expiry: 'Permanent' },
        { name: 'Habilitation Électrique H0B0', progress: 60, expiry: 'Juin 2026' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-10 pb-16 xl:px-6"
        >
            {/* Header / Hero Section - Multi-Tone Soft Azure Gradient */}
            <div className="relative bg-gradient-to-br from-azure-50/50 via-white to-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[380px]">
                {/* Subtle blueprint texture for industrial feel */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(90deg, #1D4ED8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Visual Glassmorphism Shapes */}
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-blue-100/40 blur-[100px] rounded-full"
                ></motion.div>

                <div className="relative z-10 p-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-10 h-full">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-10">
                        {/* Refined Avatar Container */}
                        <div className="relative">
                            <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-xl"></div>
                            <div className="relative h-44 w-44 rounded-full border-[6px] border-white p-1.5 bg-slate-50 shadow-2xl overflow-hidden flex items-center justify-center">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-slate-200">
                                    <User className="h-24 w-24" />
                                </div>
                            </div>
                            {/* Operational Status Light */}
                            <div className="absolute bottom-4 right-4 h-8 w-8 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                <div className="h-3.5 w-3.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5">
                                <span className="px-3.5 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-blue-100">
                                    {personnel?.role?.nom_role || 'UTILISATEUR'}
                                </span>
                                <span className="px-3.5 py-1.5 bg-white border border-slate-100 text-[#1E293B] text-[9px] font-black uppercase tracking-[0.1em] rounded-full shadow-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> ISO 9001:2015
                                </span>
                                <span className="px-3.5 py-1.5 bg-white border border-slate-100 text-[#1E293B] text-[9px] font-black uppercase tracking-[0.1em] rounded-full shadow-sm flex items-center gap-2">
                                    <Award className="h-3.5 w-3.5 text-amber-500" /> Expert Certifié
                                </span>
                            </div>
                            <h1 className="text-6xl font-black text-[#1E293B] tracking-tight mb-4 leading-none">
                                {personnel ? personnel.nom_complet : user?.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-6 text-slate-500 font-bold font-mono text-sm uppercase tracking-widest">
                                <div className="flex items-center gap-2.5">
                                    <Cpu className="h-5 w-5 text-blue-500/70" />
                                    Matricule <span className="text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded-md">{personnel?.matricule || 'ST-001-HQ'}</span>
                                </div>
                                <div className="h-1.5 w-1.5 bg-blue-200 rounded-full"></div>
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="h-5 w-5 text-blue-500/70" />
                                    {personnel?.departement || 'Opérations'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row gap-4 mb-2">
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={openProfileEditModal}
                            className="flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-[#1E293B] rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md"
                        >
                            <Settings className="h-4 w-4 text-blue-500" />
                            Configuration
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={openProfileEditModal}
                            className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700"
                        >
                            <Key className="h-4 w-4" />
                            Sécurité
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Info Panel */}
                <div className="lg:col-span-1 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-8"
                    >
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Détails de Compte
                        </h3>

                        <div className="space-y-5">
                            {[
                                { label: 'Contact Pro', val: user?.email, icon: Mail },
                                { label: 'Ligne Directe', val: personnel?.telephone || '+33 4 91 XX XX XX', icon: Phone },
                                { label: 'Poste', val: personnel?.poste || 'Cadre Technique', icon: Shield },
                                { label: 'Localisation', val: personnel?.site || 'Siège Principal', icon: MapPin },
                            ].map((item, idx) => (
                                <div key={idx} className="group p-5 rounded-3xl border border-slate-50 bg-slate-50/40 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all text-left">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{item.label}</p>
                                            <p className="text-sm font-black text-[#1E293B]">{item.val}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-[#1E293B] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-100"
                            >
                                <ExternalLink className="h-4 w-4 text-blue-400" />
                                Dossier Personnel PDF
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-8"
                    >
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                            <Zap className="h-5 w-5 text-blue-600" />
                            Certifications
                        </h3>
                        <div className="space-y-8">
                            {habilitationsData.map((h: any, i: number) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <p className="text-xs font-black text-[#1E293B] uppercase tracking-tight">{h.name}</p>
                                        <p className="text-[11px] font-black text-blue-600">{h.progress}%</p>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${h.progress}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                        ></motion.div>
                                    </div>
                                    <div className="flex justify-between px-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Validité : {h.expiry}</p>
                                        <CheckCircle2 className={`h-3.5 w-3.5 ${h.progress === 100 ? 'text-emerald-500' : 'text-slate-200'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Activity & Planning */}
                <div className="lg:col-span-2 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-[#1E293B] uppercase tracking-tight flex items-center gap-4">
                                <Activity className="h-6 w-6 text-blue-600" />
                                Journal d'Activité
                            </h3>
                            <div className="bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
                                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En Direct</span>
                            </div>
                        </div>

                        <div className="relative pl-12 space-y-10 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            {activitiesData.length > 0 ? (
                                activitiesData.map((item: any, i: number) => (
                                    <motion.div key={i} className="relative">
                                        <div className={`absolute -left-[43px] top-0 h-11 w-11 rounded-2xl border-4 border-white shadow-md flex items-center justify-center bg-white ${item.type === 'test' ? 'text-primary-500' : 'text-emerald-500'}`}>
                                            {item.type === 'test' ? <FlaskConical className="h-5 w-5" /> : <FileBarChart className="h-5 w-5" />}
                                        </div>
                                        <div className="p-7 rounded-3xl border border-slate-50 bg-slate-50/20 hover:border-primary-100 hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-base font-black text-[#1E293B] tracking-tight">{item.title}</p>
                                                <span className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" /> {item.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.subtitle} • État: <span className="font-bold uppercase text-[10px]">{item.statut}</span></p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-10 text-center opacity-40">
                                    <Activity className="h-12 w-12 mx-auto mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Aucune activité récente</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-[#1E293B] uppercase tracking-tight flex items-center gap-4">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                Planning des Opérations
                            </h3>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(v => <div key={v} className={`h-1.5 w-8 rounded-full ${v === 1 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-6">
                            {['LUN', 'MAR', 'MER', 'JEU', 'VEN'].map((day, i) => (
                                <div key={i} className="space-y-5 text-center">
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">{day}</p>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-5 transition-all cursor-pointer
                                        ${i === 1 ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50/50 border-slate-100 text-slate-400'}`}
                                    >
                                        {i === 1 ? (
                                            <div className="space-y-4">
                                                <div className="h-14 w-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-blue-600 shadow-md">
                                                    <Zap className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black leading-tight uppercase tracking-tighter">Turbine B4</p>
                                                    <p className="text-[10px] font-black opacity-60 uppercase mt-2">09h15</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <div className="h-10 w-10 border-2 border-slate-200 rounded-xl"></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest">Libre</span>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

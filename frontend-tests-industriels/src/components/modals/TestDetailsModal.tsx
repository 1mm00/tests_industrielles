import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    MapPin,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    Download
} from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { useQuery } from '@tanstack/react-query';
import { testsService } from '@/services/testsService';
import { formatDate, cn } from '@/utils/helpers';
import type { TestIndustriel } from '@/types';

export default function TestDetailsModal() {
    const { isTestDetailsModalOpen, closeTestDetailsModal, selectedTestId } = useModalStore();

    const { data: test, isLoading } = useQuery<TestIndustriel>({
        queryKey: ['test', selectedTestId],
        queryFn: () => testsService.getTest(selectedTestId!),
        enabled: !!selectedTestId && isTestDetailsModalOpen,
    });

    if (!isTestDetailsModalOpen) return null;

    const StatusBadge = ({ status }: { status?: string }) => {
        const config = {
            'TERMINE': { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'Clôturé' },
            'EN_COURS': { color: 'bg-amber-50 text-amber-700 border-amber-100', text: 'En cours' },
            'PLANIFIE': { color: 'bg-blue-50 text-blue-700 border-blue-100', text: 'Planifié' },
            'default': { color: 'bg-gray-50 text-gray-700 border-gray-100', text: status || 'Inconnu' }
        };
        const s = config[status as keyof typeof config] || config.default;
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border", s.color)}>
                {s.text}
            </span>
        );
    };

    return (
        <AnimatePresence>
            {isTestDetailsModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTestDetailsModal}
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[10px]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-white/40"
                    >
                        {/* 1. Header Minimaliste */}
                        <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-transparent">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-black text-xl uppercase tracking-tight">Rapport d'Intervention Industrielle</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Référence : {test?.numero_test || 'N/A'}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeTestDetailsModal}
                                className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* 2. Verdict Banner (Impact Visuel Immédiat) */}
                        <div className={cn(
                            "mx-10 mt-6 p-6 rounded-[2rem] border-2 flex items-center justify-between",
                            test?.resultat_final === 'OK' ? "bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-100" :
                                test?.resultat_final === 'NOK' ? "bg-red-500 border-red-400 text-white shadow-xl shadow-red-100" :
                                    "bg-slate-100 border-slate-200 text-slate-500"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                    {test?.resultat_final === 'OK' ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Conclusion du Système</p>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">
                                        {test?.resultat_final === 'OK' ? 'OK - CONFORME' : 'NOK - NON CONFORME'}
                                    </h2>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Status Final</p>
                                <StatusBadge status={test?.statut_test} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronisation des données...</p>
                                </div>
                            ) : (
                                <>
                                    {/* 3. Grid 3 Colonnes */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                        {/* Identification */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="h-1 w-3 bg-slate-900 rounded-full" />
                                                Identification
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Équipement</p>
                                                    <p className="text-xs font-black text-slate-900 uppercase">{test?.equipement?.designation || 'STD-UNIT'}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Site Opérationnel</p>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={10} className="text-slate-400" />
                                                        <p className="text-xs font-black text-slate-900 uppercase">{test?.localisation || 'Marignane'}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Date d'Intervention</p>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={10} className="text-slate-400" />
                                                        <p className="text-xs font-black text-slate-900">{test?.date_test ? formatDate(test.date_test) : 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Protocole */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="h-1 w-3 bg-slate-900 rounded-full" />
                                                Protocole & Mesure
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Instrument de Mesure</p>
                                                    <p className="text-xs font-black text-slate-900 uppercase text-indigo-600">{test?.instrument?.designation || 'Pyromètre'}</p>
                                                </div>
                                                <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200 group">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Spécification Client</p>
                                                    <p className="text-xs font-black text-slate-700 italic">{test?.resultat_attendu || 'Critères AMS2750F'}</p>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Durée du Test</p>
                                                        <p className="text-xs font-black text-slate-900">45 Minutes</p>
                                                    </div>
                                                    <Clock size={16} className="text-slate-200" />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Exécuteur */}
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="h-1 w-3 bg-slate-900 rounded-full" />
                                                L'Exécuteur
                                            </h4>
                                            <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl flex flex-col items-center text-center">
                                                <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center text-xl font-black mb-4 border border-white/20">
                                                    {test?.responsable?.prenom?.[0]}{test?.responsable?.nom?.[0]}
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Technicien Responsable</p>
                                                <p className="text-lg font-black tracking-tight">{test?.responsable?.prenom} {test?.responsable?.nom}</p>
                                                <div className="mt-6 w-full h-16 border border-white/10 rounded-2xl bg-white/5 flex items-center justify-center opacity-40 italic text-[9px] font-serif text-slate-300">
                                                    Signature Électronique Certifiée
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* 4. Commentaires Techniques (Full Width) */}
                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="h-1 w-3 bg-slate-900 rounded-full" />
                                            Commentaires Techniques & Observations
                                        </h4>
                                        <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] relative group border-l-4 border-l-slate-900">
                                            <div className="relative z-10 text-[13px] text-slate-600 leading-relaxed font-bold italic">
                                                "{test?.observations_generales || test?.observations || "Aucune observation particulière n'a été signalée pour cette intervention. Le déroulement technique semble nominal selon les tolérances définies."}"
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        {/* 5. Footer */}
                        <div className="px-10 py-8 bg-transparent border-t border-gray-100 flex items-center justify-end gap-4">
                            <button
                                onClick={closeTestDetailsModal}
                                className="px-8 py-3.5 bg-white/50 backdrop-blur-sm text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Revenir au Terminal
                            </button>
                            <button
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95"
                            >
                                <Download size={14} />
                                Générer le Rapport PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

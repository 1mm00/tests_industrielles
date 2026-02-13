import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    Shield,
    Zap,
    Clock,
    Box,
    ChevronRight,
    Search,
    RefreshCw,
    BarChart3,
    Terminal,
    Crosshair,
    FileDown,
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { equipementsService } from '@/services/equipementsService';
import { ncService } from '@/services/ncService';
import { instrumentsService } from '@/services/instrumentsService';
import { generateCalibrationWorkOrderPDF } from '@/utils/pdfExportBonTravail';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { format } from 'date-fns';
import ReactApexChart from "react-apexcharts";
import { useModalStore } from '@/store/modalStore';

export default function MissionControlPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { openExecutionModal, openTestDetailsModal, openAnalyseNcModal } = useModalStore();

    const { data: tests, isLoading: isLoadingTests, refetch: refetchTests } = useQuery({
        queryKey: ['tests-today'],
        queryFn: () => testsService.getCalendarTests(new Date().getMonth() + 1, new Date().getFullYear()),
    });

    const { data: equipStats } = useQuery({
        queryKey: ['equipement-stats'],
        queryFn: () => equipementsService.getEquipementStats(),
    });

    const { data: recentTests } = useQuery({
        queryKey: ['tests-recent'],
        queryFn: () => testsService.getTests({ per_page: 5 }),
    });

    const { data: recentNc } = useQuery({
        queryKey: ['nc-recent'],
        queryFn: () => ncService.getPaginatedNc({ per_page: 5 }),
    });

    const { data: heatmapEquips } = useQuery({
        queryKey: ['equipements-heatmap'],
        queryFn: () => equipementsService.getPaginatedEquipements({ per_page: 24 }),
    });

    const { data: calibrationAlerts } = useQuery({
        queryKey: ['calibration-alerts'],
        queryFn: () => instrumentsService.getCalibrationAlerts(),
    });

    interface AuditEvent {
        id: string;
        time: string;
        user: string;
        action: string;
        color: string;
        type: string;
        raw?: any;
    }

    // Merge events for Audit Log
    const auditEvents: AuditEvent[] = [
        ...(recentTests?.data?.map(t => ({
            id: t.id_test,
            time: t.heure_fin || t.heure_debut_planifiee || 'NOW',
            user: t.responsable?.nom || 'SYSTEM',
            action: `${t.statut_test === 'TERMINE' ? 'Validated' : 'Started'} Test #${t.numero_test}`,
            color: t.statut_test === 'TERMINE' ? 'emerald' : 'blue',
            type: 'TEST'
        })) || []),
        ...(recentNc?.data?.map(nc => ({
            id: nc.id_non_conformite,
            time: nc.created_at?.split('T')[1]?.substring(0, 5) || 'NOW',
            user: nc.detecteur_id || 'SYSTEM',
            action: `Critical NC #${nc.numero_nc} Detected`,
            color: 'rose',
            type: 'NC'
        })) || []),
        ...(calibrationAlerts?.expired?.map(inst => ({
            id: inst.id_instrument,
            time: 'EXPIRED',
            user: 'METROLOGY',
            action: `Instrument ${inst.code_instrument} Calibration Expired`,
            color: 'rose',
            type: 'METRO',
            raw: inst
        })) || []),
        ...(calibrationAlerts?.upcoming?.map(inst => ({
            id: inst.id_instrument,
            time: 'ALERT',
            user: 'METROLOGY',
            action: `Instrument ${inst.code_instrument} Calibration Imminent`,
            color: 'orange',
            type: 'METRO',
            raw: inst
        })) || [])
    ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);

    // Filter tests for TODAY only
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayTests = tests?.filter(t => t.date_test === todayStr) || [];

    const stats = {
        completed: todayTests.filter(t => t.statut_test === 'TERMINE').length,
        inProgress: todayTests.filter(t => t.statut_test === 'EN_COURS').length,
        planned: todayTests.filter(t => t.statut_test === 'PLANIFIE').length,
        critical: todayTests.filter(t => (t.niveau_criticite || 0) >= 4).length
    };

    const yieldRate = todayTests.length > 0
        ? Math.round((todayTests.filter(t => t.statut_test === 'TERMINE').length / todayTests.length) * 100)
        : 88;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* --- TOP HUD (Heads-Up Display) --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 group hover:rotate-6 transition-transform">
                        <Terminal className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Mission Control
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-indigo-500" />
                            Node Alpha-01 // Live Operations Supervisions
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span>UTC+1</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-slate-900 font-black tabular-nums">{format(new Date(), 'HH:mm:ss')}</span>
                    </div>
                    <button
                        onClick={() => refetchTests()}
                        className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all group shadow-sm active:scale-95"
                    >
                        <RefreshCw className="h-5 w-5 text-slate-400 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                    <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Système Optimisé
                    </div>
                </div>
            </div>

            {/* --- CORE ANALYTICS STRIP --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <HudCard
                    icon={Activity}
                    label="Yield Journalier"
                    value={`${yieldRate}%`}
                    subValue="Objectif > 95%"
                    color="blue"
                    trend={[65, 78, 82, 85, 88, 92, 90, 94]}
                />
                <HudCard
                    icon={Zap}
                    label="Live Streams"
                    value={stats.inProgress}
                    subValue="Tests en cours"
                    color="orange"
                    trend={[10, 15, 25, 20, 30, 45, 40, 52]}
                />
                <HudCard
                    icon={Shield}
                    label="Critical Assets"
                    value={equipStats?.critiques || 0}
                    subValue="Requérant attention"
                    color="rose"
                    trend={[5, 4, 3, 6, 2, 1, 0]}
                />
                <HudCard
                    icon={Box}
                    label="Metrology Risk"
                    value={calibrationAlerts ? calibrationAlerts.expired.length + calibrationAlerts.upcoming.length : 0}
                    subValue="Calibration alerts"
                    color={calibrationAlerts?.expired.length ? "rose" : "orange"}
                    trend={[12, 11, 10.5, 9, 8.5, 8, 7.8, 7.5]}
                />
            </div>

            {/* --- MAIN GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: LIVE TRACKING (70%) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Crosshair className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Live Operations Tracker</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Flux analytique des interventions temps réel</p>
                                </div>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="FILTRER PAR JOB ID..."
                                    className="bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-2.5 text-[10px] font-black text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 uppercase tracking-widest"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 max-h-[600px] min-h-[400px]">
                            {isLoadingTests ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-50">
                                    <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronisation du flux...</p>
                                </div>
                            ) : todayTests.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                        <Clock className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aucune opération programmée pour aujourd'hui</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {todayTests.map((test, i) => (
                                        <OperationRow
                                            key={test.id_test}
                                            test={test}
                                            index={i}
                                            onAction={() => {
                                                if (test.statut_test === 'TERMINE') {
                                                    openTestDetailsModal(test.id_test);
                                                } else {
                                                    openExecutionModal(test.id_test);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: ASSET HEATMAP & FEED (30%) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* ASSET HEATMAP */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Box className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Global Asset Map</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Status du parc machines</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-2">
                            {heatmapEquips?.data?.map((eq) => (
                                <AssetSquare
                                    key={eq.id_equipement}
                                    status={eq.statut_operationnel === 'En service' ? 'active' : eq.statut_operationnel === 'Hors service' ? 'alert' : 'idle'}
                                    label={eq.code_equipement}
                                />
                            )) || Array(24).fill(0).map((_, i) => (
                                <AssetSquare key={i} index={i} status="idle" />
                            ))}
                        </div>
                        <div className="mt-8 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> ACTIVE
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-slate-200" /> IDLE
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> ALERT
                            </div>
                        </div>
                    </div>

                    {/* LIVE AUDIT FEED */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 flex-1 flex flex-col text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <BarChart3 className="h-4 w-4 text-indigo-400" /> System Audit Log
                        </h3>
                        <div className="space-y-6 overflow-y-auto no-scrollbar relative z-10 flex-1">
                            {auditEvents.length > 0 ? auditEvents.map((event) => (
                                <AuditItem
                                    key={`${event.type}-${event.id}`}
                                    time={event.time}
                                    user={event.user}
                                    action={event.action}
                                    color={event.color}
                                    type={event.type}
                                    onMainAction={() => {
                                        if (event.type === 'NC') openAnalyseNcModal(event.id);
                                        else if (event.color === 'emerald') openTestDetailsModal(event.id);
                                        else if (event.type === 'TEST') openExecutionModal(event.id);
                                    }}
                                    onSecondAction={() => {
                                        if (event.type === 'METRO' && event.raw) {
                                            generateCalibrationWorkOrderPDF(event.raw);
                                        }
                                    }}
                                />
                            )) : (
                                <div className="py-10 text-center opacity-20">
                                    <p className="text-[10px] font-black uppercase">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}

function HudCard({ icon: Icon, label, value, subValue, color, trend }: any) {
    const sparklineOptions: any = {
        chart: { sparkline: { enabled: true }, animations: { enabled: true } },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        colors: [color === 'blue' ? '#6366f1' : color === 'orange' ? '#f59e0b' : color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#6366f1'],
        tooltip: { enabled: false }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden h-full group transition-all duration-500"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-50/50 transition-colors" />

            <div className="relative z-10 text-left">
                <div className="flex justify-between items-start mb-5">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110",
                        color === 'blue' ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-100" :
                            color === 'orange' ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-100" :
                                color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-100" :
                                    color === 'rose' ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-100" :
                                        "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-100"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60 italic">{subValue}</p>
                </div>

                <div className="mt-5 h-12">
                    <ReactApexChart
                        options={sparklineOptions}
                        series={[{ data: trend }]}
                        type="area"
                        height="100%"
                    />
                </div>
            </div>
        </motion.div>
    );
}

function OperationRow({ test, index, onAction }: any) {
    const isTermine = test.statut_test === 'TERMINE';
    const isEnCours = test.statut_test === 'EN_COURS';

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={onAction}
            className="group flex items-center gap-6 p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
        >
            <div className="w-16 h-10 shrink-0 flex flex-col justify-center border-r border-slate-100 pr-4">
                <span className="text-[9px] font-black text-slate-400 uppercase">Start</span>
                <span className="text-xs font-black text-slate-900 tabular-nums">{test.heure_debut_planifiee || '--:--'}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-widest">{test.numero_test}</span>
                    <h3 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{test.type_test?.nom || 'TECHNICAL_JOB'}</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5 italic">
                    {test.equipement?.designation} <span className="text-slate-200 px-1">//</span> {test.equipement?.code_equipement}
                </p>
            </div>

            <div className="flex-1 hidden md:block">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isTermine ? '100%' : isEnCours ? '65%' : '0%' }}
                        className={cn(
                            "h-full rounded-full transition-all",
                            isTermine ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : isEnCours ? "bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]" : "bg-slate-300"
                        )}
                    />
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progress Index</span>
                    <span className="text-[8px] font-black text-slate-900">{isTermine ? '100' : isEnCours ? '65' : '0'}%</span>
                </div>
            </div>

            <div className="w-32 flex justify-end items-center gap-4">
                <span className={cn(
                    "text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.2em] border",
                    isTermine ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        isEnCours ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                    {test.statut_test}
                </span>
                <div className="h-9 w-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </motion.div>
    );
}

function AssetSquare({ status, label }: any) {
    const colors = {
        active: 'bg-emerald-50 border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        idle: 'bg-slate-50 border-slate-100',
        alert: 'bg-rose-50 border-rose-200 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.15)]'
    };

    return (
        <div
            title={label}
            className={cn(
                "aspect-square rounded-xl border transition-all cursor-pointer hover:scale-110 flex items-center justify-center text-[7px] font-black text-slate-300",
                colors[status as keyof typeof colors]
            )}
        >
            {label?.substring(0, 3)}
        </div>
    );
}

function AuditItem({ time, user, action, color, type, onMainAction, onSecondAction }: any) {
    const colors = {
        emerald: 'bg-emerald-500 text-emerald-500',
        rose: 'bg-rose-500 text-rose-500',
        blue: 'bg-blue-500 text-blue-500',
        indigo: 'bg-indigo-500 text-indigo-500',
        orange: 'bg-amber-500 text-amber-500'
    };

    return (
        <div className="flex items-start gap-4 group/item">
            <div className="h-full flex flex-col items-center gap-2 mt-1.5">
                <div className={cn("h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]", colors[color as keyof typeof colors])} />
                <div className="w-px h-full bg-slate-700/50" />
            </div>
            <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white tabular-nums opacity-40">{time}</span>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{user}</span>
                    </div>
                    {type === 'METRO' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSecondAction?.();
                            }}
                            className="p-1.5 bg-white/5 hover:bg-indigo-500 text-white/40 hover:text-white rounded-lg transition-all border border-white/10 group-hover/item:border-indigo-500/50"
                            title="Générer Bon de Travail"
                        >
                            <FileDown size={12} />
                        </button>
                    )}
                </div>
                <p
                    className="text-[11px] font-bold text-slate-300 leading-tight group-hover/item:text-white transition-colors cursor-pointer"
                    onClick={onMainAction}
                >
                    {action}
                </p>
            </div>
        </div>
    );
}

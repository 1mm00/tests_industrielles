import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    FlaskConical,
    Activity,
    Plus,
    CalendarDays,
    Clock,
    User,
    X,
    MapPin,
    ArrowRight,
    GanttChart,
    LayoutGrid,
    Search,
    RefreshCw,
    Calendar,
    Hammer,
    Zap
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
    addDays
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { testsService } from '@/services/testsService';
import { useModalStore } from '@/store/modalStore';
import { cn } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'calendar' | 'timeline';

export default function PlanningCalendarPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const { openTestModal, openExecutionModal, openTestDetailsModal } = useModalStore();

    // Fetch tests for the current month
    const { data: tests, isLoading, refetch } = useQuery({
        queryKey: ['calendar-tests', currentMonth.getMonth() + 1, currentMonth.getFullYear()],
        queryFn: () => testsService.getCalendarTests(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
    });

    // Filter tests based on search
    const filteredTests = useMemo(() => {
        if (!tests) return [];
        return tests.filter(test =>
            test.numero_test.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.equipement?.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.type_test?.libelle.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tests, searchQuery]);

    // Calendar Calculations
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    // Timeline Calculations (Group by Equipment)
    const equipmentGroups = useMemo(() => {
        if (!filteredTests) return {};
        const groups: Record<string, any[]> = {};
        filteredTests.forEach(test => {
            const eqId = test.equipement?.id_equipement || 'unassigned';
            if (!groups[eqId]) groups[eqId] = [];
            groups[eqId].push(test);
        });
        return groups;
    }, [filteredTests]);

    const timelineDays = useMemo(() => {
        const start = startOfWeek(currentMonth, { weekStartsOn: 1 });
        return Array.from({ length: 14 }, (_, i) => addDays(start, i));
    }, [currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    const getTestsForDay = (day: Date) => {
        return filteredTests?.filter(test => isSameDay(parseISO(test.date_test), day)) || [];
    };

    const selectedDayTests = selectedDate ? getTestsForDay(selectedDate) : [];

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 pb-6">

            {/* 1. Header Area (AeroTech Executive) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 group hover:rotate-6 transition-transform">
                        <CalendarDays className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none flex items-center gap-3">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2.5 flex items-center gap-2">
                            <Activity className="h-3 w-3 text-indigo-500" />
                            Planification Industrielle Certifiée
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* View Switcher */}
                    <div className="bg-slate-100/50 p-1.5 rounded-[1.2rem] flex items-center border border-slate-200/50 shadow-inner">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'calendar' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Grille
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'timeline' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <GanttChart className="h-3.5 w-3.5" />
                            Timeline
                        </button>
                    </div>

                    <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm relative group">
                        <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600 active:scale-90">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            AUJOURD'HUI
                        </button>
                        <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600 active:scale-90">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => openTestModal()}
                        className="flex items-center gap-2.5 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                        Programmer un flux
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* 2. Main Content Area */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    {/* Search & Actions Bar */}
                    <div className="bg-white/70 backdrop-blur-md p-3 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="RECHERCHER UN TEST, ÉQUIPEMENT OU CODE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            />
                        </div>
                        <button onClick={() => refetch()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col relative">
                        {viewMode === 'calendar' ? (
                            <>
                                {/* Calendar Grid Name Row */}
                                <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/20">
                                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                        <div key={day} className="py-4 text-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{day}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Grid Body */}
                                <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto no-scrollbar">
                                    {calendarDays.map((date, i) => {
                                        const dayTests = getTestsForDay(date);
                                        const active = selectedDate && isSameDay(date, selectedDate);
                                        const current = isToday(date);
                                        const otherMonth = !isSameMonth(date, currentMonth);

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    if (!isSidebarOpen) setIsSidebarOpen(true);
                                                }}
                                                className={cn(
                                                    "relative min-h-[140px] p-4 border-r border-b border-slate-50 transition-all cursor-pointer flex flex-col gap-2.5",
                                                    otherMonth ? "bg-slate-50/10 opacity-30" : "bg-white hover:bg-slate-50/80",
                                                    active && "ring-2 ring-indigo-500 ring-inset z-10 bg-indigo-50/20",
                                                    current && "border-indigo-100/50"
                                                )}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={cn(
                                                        "text-[11px] font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                                                        current ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" :
                                                            otherMonth ? "text-slate-300" : "text-slate-400",
                                                        active && !current && "bg-slate-900 text-white shadow-lg"
                                                    )}>
                                                        {format(date, 'd')}
                                                    </span>
                                                    {dayTests.length > 0 && (
                                                        <div className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                            <span className="text-[9px] font-black text-indigo-600 tracking-tighter">
                                                                {dayTests.length} FLUX
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1.5 flex-1 overflow-hidden h-0">
                                                    {dayTests.slice(0, 3).map((test) => (
                                                        <motion.div
                                                            layoutId={test.id_test}
                                                            key={test.id_test}
                                                            className={cn(
                                                                "px-2.5 py-1.5 rounded-lg text-[9px] font-black truncate transition-all shadow-sm border border-transparent uppercase tracking-tight flex items-center gap-2",
                                                                test.statut_test === 'TERMINE'
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                                                                    : test.statut_test === 'EN_COURS'
                                                                        ? "bg-amber-50 text-amber-700 border-amber-100/50"
                                                                        : "bg-indigo-50 text-indigo-700 border-indigo-100/50"
                                                            )}
                                                        >
                                                            <div className={cn("w-1 h-1 rounded-full",
                                                                test.statut_test === 'TERMINE' ? "bg-emerald-500" :
                                                                    test.statut_test === 'EN_COURS' ? "bg-amber-500" : "bg-indigo-500"
                                                            )} />
                                                            <span className="opacity-80 font-bold">{test.numero_test.split('-').pop()}</span>
                                                            <span className="flex-1 truncate">{test.equipement?.designation}</span>
                                                        </motion.div>
                                                    ))}
                                                    {dayTests.length > 3 && (
                                                        <div className="text-[9px] font-black text-slate-300 px-2 uppercase tracking-widest mt-1">
                                                            + {dayTests.length - 3} PLUS
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col h-full">
                                {/* Timeline Header */}
                                <div className="flex border-b border-slate-100 bg-slate-50/30">
                                    <div className="w-56 p-5 border-r border-slate-100 flex items-center gap-3">
                                        <Hammer className="h-4 w-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipements</span>
                                    </div>
                                    <div className="flex-1 overflow-x-auto no-scrollbar flex">
                                        {timelineDays.map((day, idx) => (
                                            <div key={idx} className={cn(
                                                "min-w-[120px] p-4 text-center border-r border-slate-50 flex flex-col gap-1",
                                                isToday(day) && "bg-indigo-50/50"
                                            )}>
                                                <span className="text-[9px] font-black text-slate-400 uppercase">{format(day, 'EEE', { locale: fr })}</span>
                                                <span className={cn(
                                                    "text-[11px] font-black",
                                                    isToday(day) ? "text-indigo-600" : "text-slate-600"
                                                )}>{format(day, 'dd/MM')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline Groups */}
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    {Object.entries(equipmentGroups).map(([eqId, eqTests]) => (
                                        <div key={eqId} className="flex border-b border-slate-50 hover:bg-slate-50/30 transition-colors group/row">
                                            <div className="w-56 p-5 border-r border-slate-100 bg-white group-hover/row:bg-slate-50/50 transition-colors shrink-0 flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-10 rounded-full shrink-0",
                                                    eqTests.some(t => t.statut_test === 'EN_COURS') ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" :
                                                        eqTests.some(t => t.statut_test === 'PLANIFIE') ? "bg-indigo-400" : "bg-emerald-400"
                                                )} />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">
                                                        {eqTests[0]?.equipement?.designation || 'Sans Équipement'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                        {eqTests[0]?.equipement?.code_equipement || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 relative flex">
                                                {timelineDays.map((day, dIdx) => {
                                                    const testsOnDay = eqTests.filter(t => isSameDay(parseISO(t.date_test), day));
                                                    return (
                                                        <div key={dIdx} className={cn(
                                                            "min-w-[120px] p-2 border-r border-slate-50 min-h-[80px] flex flex-col gap-1.5",
                                                            isToday(day) && "bg-indigo-50/20"
                                                        )}>
                                                            {testsOnDay.map(test => (
                                                                <div
                                                                    key={test.id_test}
                                                                    onClick={() => {
                                                                        setSelectedDate(day);
                                                                        setIsSidebarOpen(true);
                                                                    }}
                                                                    className={cn(
                                                                        "p-2 rounded-xl text-[8px] font-black border uppercase tracking-tighter cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95",
                                                                        test.statut_test === 'TERMINE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                                            test.statut_test === 'EN_COURS' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                                "bg-white text-indigo-700 border-indigo-100"
                                                                    )}
                                                                >
                                                                    {test.numero_test.split('-').pop()}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50"
                                >
                                    <div className="flex flex-col items-center gap-5">
                                        <div className="h-14 w-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-100" />
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">Syncing Aero-Planning...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. Detail Sidebar (Dynamic Drawer Style) */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: 420 }}
                            animate={{ x: 0 }}
                            exit={{ x: 420 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-[420px] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col z-20"
                        >
                            <div className="p-8 pb-10 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[64px] -mr-24 -mt-24" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -ml-12 -mb-12" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white border border-indigo-400/30">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-[11px] font-black uppercase tracking-[3px] text-indigo-400">
                                            Flux Programmés
                                        </h3>
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">
                                        {selectedDate ? format(selectedDate, 'eeee d MMMM', { locale: fr }) : 'Aujourd\'hui'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.1em] opacity-70 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                        Système en veille opérationnelle
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="relative z-10 h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all shadow-sm active:scale-90"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                                {selectedDayTests.length === 0 ? (
                                    <div className="py-24 flex flex-col items-center text-center">
                                        <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                                            <Zap className="h-10 w-10 text-slate-200" />
                                        </div>
                                        <h4 className="text-slate-900 font-black uppercase text-xs tracking-[5px]">Créneau Libre</h4>
                                        <p className="text-slate-400 text-[10px] mt-4 max-w-[220px] leading-relaxed font-bold uppercase tracking-widest opacity-60">
                                            Aucune intervention programmée. Les ressources sont en statut de maintenance prédictive.
                                        </p>
                                        <button
                                            onClick={() => openTestModal()}
                                            className="mt-8 px-6 py-3 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            Programmer Maintenant
                                        </button>
                                    </div>
                                ) : (
                                    selectedDayTests.map((test, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={test.id_test}
                                            className="group p-6 bg-slate-50/80 rounded-[2.5rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden"
                                        >
                                            <div className={cn(
                                                "absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3",
                                                test.statut_test === 'TERMINE' ? "bg-emerald-500 shadow-[2px_0_12px_#10b98144]" :
                                                    test.statut_test === 'EN_COURS' ? "bg-amber-500 shadow-[2px_0_12px_#f59e0b44]" :
                                                        "bg-indigo-600 shadow-[2px_0_12px_#6366f144]"
                                            )} />

                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black bg-slate-900 text-white px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-xl">
                                                        {test.numero_test}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-900 font-black uppercase tracking-widest">
                                                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                                        {test.heure_debut_planifiee || '08:30'}
                                                    </div>
                                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">ESTIM : 2H 15M</span>
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                {test.type_test?.libelle || 'Test de Validation Flux'}
                                            </h4>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl border border-slate-100/50">
                                                    <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                        <FlaskConical className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ASSET</span>
                                                        <span className="text-[11px] font-black text-slate-800 uppercase truncate max-w-[200px]">{test.equipement?.designation}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl border border-slate-100/50">
                                                    <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hub Localisation</span>
                                                        <span className="text-[11px] font-black text-slate-800 uppercase">{test.localisation || 'Hangar de Production C'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg border border-slate-700">
                                                        <User className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Propriétaire</span>
                                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                                            {test.responsable ? `${test.responsable.nom} ${test.responsable.prenom.charAt(0)}.` : 'ING. NON DÉFINI'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (test.statut_test === 'TERMINE') {
                                                            openTestDetailsModal(test.id_test);
                                                        } else {
                                                            openExecutionModal(test.id_test);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 group/btn",
                                                        test.statut_test === 'TERMINE'
                                                            ? "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                                    )}
                                                >
                                                    {test.statut_test === 'TERMINE' ? 'Rapport' : 'Lancer'}
                                                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Resource Health Box */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Optimisation Parc</span>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg">88% SLA</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '88%' }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-[0_0_12px_#6366f1]"
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Planning sécurisé. Aucune collision de ressources identifiée pour ce nœud de temps.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

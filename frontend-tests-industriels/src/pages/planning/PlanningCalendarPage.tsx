import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    FlaskConical,
    Activity,
    Plus,
    CalendarDays,
    Info,
    Clock,
    User,
    X,
    Filter,
    Target,
    Zap,
    MapPin,
    ArrowRight
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
    parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { testsService } from '@/services/testsService';
import { useModalStore } from '@/store/modalStore';
import { cn } from '@/utils/helpers';


export default function PlanningCalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { openTestModal, openExecutionModal, openTestDetailsModal } = useModalStore();

    // Fetch tests for the current month
    const { data: tests, isLoading } = useQuery({
        queryKey: ['calendar-tests', currentMonth.getMonth() + 1, currentMonth.getFullYear()],
        queryFn: () => testsService.getCalendarTests(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
    });

    // Calendar Calculations
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    const getTestsForDay = (day: Date) => {
        return tests?.filter(test => isSameDay(parseISO(test.date_test), day)) || [];
    };

    const selectedDayTests = selectedDate ? getTestsForDay(selectedDate) : [];

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 pb-6">

            {/* 1. Header Area (Executive Premium) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 group hover:rotate-6 transition-transform">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none flex items-center gap-3">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">HUB de Planification des Interventions</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            AUJOURD'HUI
                        </button>
                        <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => openTestModal()}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                        Nouveau Test
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* 2. Main Calendar Grid */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col relative group/calendar">
                    {/* Day Names Row */}
                    <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50">
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                            <div key={day} className="py-4 text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
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
                                        "relative min-h-[120px] p-3 border-r border-b border-slate-50 transition-all cursor-pointer flex flex-col gap-2",
                                        otherMonth ? "bg-slate-50/20" : "bg-white hover:bg-indigo-50/10",
                                        active && "ring-2 ring-indigo-500 ring-inset z-10 bg-indigo-50/30",
                                        current && "border-indigo-100"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-xs font-black p-2 rounded-xl w-8 h-8 flex items-center justify-center transition-all",
                                            current ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" :
                                                otherMonth ? "text-slate-300" : "text-slate-400 hover:text-slate-900",
                                            active && !current && "bg-slate-900 text-white"
                                        )}>
                                            {format(date, 'd')}
                                        </span>
                                        {dayTests.length > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tight">
                                                    {dayTests.length}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                                        {dayTests.slice(0, 3).map((test) => (
                                            <div
                                                key={test.id_test}
                                                className={cn(
                                                    "px-2 py-1.5 rounded-lg text-[9px] font-black truncate transition-all shadow-sm border uppercase tracking-tight",
                                                    test.statut_test === 'TERMINE'
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : test.statut_test === 'EN_COURS'
                                                            ? "bg-amber-50 text-amber-700 border-amber-100"
                                                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                )}
                                            >
                                                {test.numero_test} • {test.equipement?.designation}
                                            </div>
                                        ))}
                                        {dayTests.length > 3 && (
                                            <div className="text-[9px] font-black text-slate-400 pl-2 uppercase italic tracking-widest mt-1">
                                                + {dayTests.length - 3} and more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50">
                            <div className="flex flex-col items-center gap-5">
                                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-100" />
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Synchro Planning...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Detail Sidebar */}
                {isSidebarOpen && (
                    <div className="w-[420px] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col animate-in slide-in-from-right-10 duration-500">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white relative overflow-hidden group/sidebar-header">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="relative z-10">
                                <h3 className="text-sm font-black uppercase tracking-[2px] text-indigo-400">
                                    {selectedDate ? format(selectedDate, 'eeee d MMMM', { locale: fr }) : 'Interventions'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.1em] opacity-70">
                                    Exploration des {selectedDayTests.length} interventions programmées
                                </p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="relative z-10 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all shadow-sm">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
                            {selectedDayTests.length === 0 ? (
                                <div className="py-24 flex flex-col items-center text-center opacity-40">
                                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Activity className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h4 className="text-slate-900 font-black uppercase text-xs tracking-[4px]">Status de Veille</h4>
                                    <p className="text-slate-400 text-[10px] mt-2 italic px-8 font-medium font-black uppercase tracking-widest">Aucune intervention programmée pour ce créneau node.</p>
                                </div>
                            ) : (
                                selectedDayTests.map((test) => (
                                    <div
                                        key={test.id_test}
                                        className="group p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden"
                                    >
                                        <div className={cn(
                                            "absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2",
                                            test.statut_test === 'TERMINE' ? "bg-emerald-500Shadow-[0_0_8px_#10b981]" :
                                                test.statut_test === 'EN_COURS' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-indigo-500 shadow-[0_0_8px_#6366f1]"
                                        )} />

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                                                    {test.numero_test}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                <Clock className="h-3.5 w-3.5" />
                                                08:30 <span className="text-slate-200">|</span> 2h
                                            </div>
                                        </div>

                                        <h4 className="text-[15px] font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            {test.type_test?.libelle || 'Test Industriel'}
                                        </h4>
                                        <div className="flex flex-col gap-2 mb-6">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                <FlaskConical className="h-3.5 w-3.5 text-indigo-500" />
                                                {test.equipement?.designation}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                Zone d'Ingénierie Flux A
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Responsable</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">J. Dupont</span>
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
                                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-90 group/btn"
                                            >
                                                {test.statut_test === 'TERMINE' ? 'Rapport' : 'Lancer'}
                                                <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Occupation Node</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Capacité Globale : 35%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner p-0.5">
                                <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_#6366f1]" style={{ width: '35%' }} />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Zap className="h-3.5 w-3.5 text-amber-500 fill-current" />
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed">
                                    * Mise à jour prédictive basée sur les cycles de tests.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

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
    X
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
        <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-700">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">Planning des Interventions</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-4 py-1.5 text-[10px] font-black uppercase text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            Aujourd'hui
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "p-3 rounded-xl border transition-all relative hidden lg:block",
                            isSidebarOpen ? "bg-primary-50 border-primary-100 text-primary-600" : "bg-white border-gray-100 text-gray-400"
                        )}
                        title="Toggled Sidebar"
                    >
                        <Info className="h-5 w-5" />
                        {selectedDayTests.length > 0 && !isSidebarOpen && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black animate-bounce">
                                {selectedDayTests.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => openTestModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Test
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Main Calendar Grid */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col relative">
                    {/* Day Names Row */}
                    <div className="grid grid-cols-7 border-b border-gray-50 bg-gray-50/30">
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                            <div key={day} className="py-4 text-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
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
                                        "relative min-h-[120px] p-2 border-r border-b border-gray-50 transition-all cursor-pointer group flex flex-col gap-1",
                                        otherMonth ? "bg-gray-50/20" : "bg-white hover:bg-primary-50/10",
                                        active && "ring-2 ring-primary-500 ring-inset z-10 bg-primary-50/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={cn(
                                            "text-xs font-black p-1.5 rounded-lg w-7 h-7 flex items-center justify-center",
                                            current ? "bg-primary-600 text-white shadow-lg shadow-primary-200" :
                                                otherMonth ? "text-gray-300" : "text-gray-400 group-hover:text-gray-900"
                                        )}>
                                            {format(date, 'd')}
                                        </span>
                                        {dayTests.length > 0 && (
                                            <span className="text-[8px] font-black text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded uppercase">
                                                {dayTests.length} Items
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                                        {dayTests.slice(0, 3).map((test) => (
                                            <div
                                                key={test.id_test}
                                                className={cn(
                                                    "px-2 py-1 rounded-md text-[9px] font-bold truncate transition-all shadow-sm border",
                                                    test.statut_test === 'TERMINE'
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : test.statut_test === 'EN_COURS'
                                                            ? "bg-orange-50 text-orange-700 border-orange-100"
                                                            : "bg-blue-50 text-blue-700 border-blue-100"
                                                )}
                                            >
                                                {test.numero_test} • {test.equipement?.designation}
                                            </div>
                                        ))}
                                        {dayTests.length > 3 && (
                                            <div className="text-[8px] font-black text-gray-400 pl-2 uppercase italic">
                                                + {dayTests.length - 3} autres...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Mise à jour du planning...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Sidebar: Day Details */}
                {isSidebarOpen && (
                    <div className="w-[380px] bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-right-10 duration-500">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-900 text-white">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary-400">
                                    {selectedDate ? format(selectedDate, 'eeee d MMMM', { locale: fr }) : 'Sélectionnez un jour'}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">
                                    {selectedDayTests.length} Interventions Prévues
                                </p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-white opacity-40 hover:opacity-100 transition-opacity">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedDayTests.length === 0 ? (
                                <div className="py-20 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Activity className="h-8 w-8 text-gray-200" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold uppercase text-xs tracking-widest">Aucune activité</h4>
                                    <p className="text-gray-400 text-xs mt-2 italic px-8 font-medium">Le programme est vierge pour cette date.</p>
                                </div>
                            ) : (
                                selectedDayTests.map((test) => (
                                    <div
                                        key={test.id_test}
                                        className="group p-5 bg-gray-50 rounded-3xl border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-xl transition-all relative overflow-hidden"
                                    >
                                        <div className={cn(
                                            "absolute top-0 left-0 w-1.5 h-full",
                                            test.statut_test === 'TERMINE' ? "bg-emerald-500" :
                                                test.statut_test === 'EN_COURS' ? "bg-orange-500" : "bg-blue-500"
                                        )} />

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded uppercase">
                                                    {test.numero_test}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                                <Clock className="h-3 w-3" />
                                                08:30
                                            </div>
                                        </div>

                                        <h4 className="text-sm font-black text-gray-900 mb-1 leading-tight group-hover:text-primary-600 transition-colors">
                                            {test.type_test?.libelle || 'Test Industriel'}
                                        </h4>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mb-4 flex items-center gap-2">
                                            <FlaskConical className="h-3 w-3 text-primary-500" />
                                            {test.equipement?.designation}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700">
                                                    <User className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">J. Dupont</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (test.statut_test === 'TERMINE') {
                                                        openTestDetailsModal(test.id_test);
                                                    } else {
                                                        openExecutionModal(test.id_test);
                                                    }
                                                }}
                                                className="px-4 py-1.5 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                                            >
                                                {test.statut_test === 'TERMINE' ? 'Voir Rapport' : 'Ouvrir Test'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Occupation Hub</span>
                                <span className="text-[10px] font-black text-gray-900 uppercase">35%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 rounded-full" style={{ width: '35%' }} />
                            </div>
                            <p className="text-[9px] text-gray-400 mt-4 leading-relaxed font-bold italic">
                                * Cliquez sur un test pour accéder au terminal de mesures ou consulter les rapports associés.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



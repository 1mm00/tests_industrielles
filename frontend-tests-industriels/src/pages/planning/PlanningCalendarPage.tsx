import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    MapPin,
    FlaskConical,
    Activity,
    MoreHorizontal,
    Plus,
    CalendarDays
} from 'lucide-react';
import { testsService } from '@/services/testsService';
import { useModalStore } from '@/store/modalStore';
import { formatDate, cn } from '@/utils/helpers';
import type { TestIndustriel } from '@/types';

export default function PlanningCalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { data: tests, isLoading } = useQuery({
        queryKey: ['calendar-tests', currentMonth.getMonth() + 1, currentMonth.getFullYear()],
        queryFn: () => testsService.getCalendarTests(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
    });

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    // Adjust for Monday start (0 is Sunday in JS, but 1 is Monday)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const prevMonthDays = Array.from({ length: startOffset }, (_, i) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
        return d.getDate() - startOffset + i + 1;
    });

    const nextMonthDays = Array.from({ length: 42 - (days.length + prevMonthDays.length) }, (_, i) => i + 1);

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
    };

    const isSelected = (day: number) => {
        return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
    };

    const hasTests = (day: number) => {
        return tests?.some(test => {
            const d = new Date(test.date_test);
            return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
        });
    };

    const selectedDayTests = tests?.filter(test => {
        const d = new Date(test.date_test);
        return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    }) || [];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();

    const { openTestModal } = useModalStore();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">

                    {/* Left Side: Upcoming Meetings Style List */}
                    <div className="lg:col-span-7 p-8 md:p-12 border-r border-gray-50">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Prochains Tests & Interventions</h2>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-600">
                                    +5
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="h-12 w-12 bg-gray-100 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-1/4" />
                                            <div className="h-3 bg-gray-50 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : selectedDayTests.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                        <CalendarDays className="h-10 w-10 text-gray-300" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold mb-1">Aucun test pour ce jour</h4>
                                    <p className="text-gray-400 text-sm">Sélectionnez une autre date sur le calendrier.</p>
                                </div>
                            ) : (
                                selectedDayTests.map((test: TestIndustriel) => (
                                    <div key={test.id_test} className="flex items-start justify-between group">
                                        <div className="flex gap-4">
                                            {/* Avatar/Icon Circle */}
                                            <div className="h-12 w-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-primary-600 overflow-hidden ring-4 ring-transparent group-hover:ring-primary-50 transition-all">
                                                <FlaskConical className="h-6 w-6 opacity-60" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {test.equipement?.designation || 'Équipement non spécifié'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <CalendarIcon className="h-3.5 w-3.5 text-gray-300" />
                                                        {formatDate(test.date_test, 'long')} à {new Date(test.date_test).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <span className="text-gray-200">|</span>
                                                        <MapPin className="h-3.5 w-3.5 text-gray-300" />
                                                        {test.localisation || 'Secteur Alpha'}
                                                    </div>
                                                </div>

                                                {/* Mini Tags */}
                                                <div className="flex gap-2 mt-3">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                        test.statut_test === 'Terminé' ? "bg-green-50 text-green-600 border-green-100" :
                                                            test.statut_test === 'En cours' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                "bg-gray-50 text-gray-500 border-gray-100"
                                                    )}>
                                                        {test.statut_test}
                                                    </span>
                                                    {test.resultat_global && (
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                            test.resultat_global === 'Conforme' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                        )}>
                                                            {test.resultat_global}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: Mini Calendar */}
                    <div className="lg:col-span-5 p-8 md:p-12 bg-white flex flex-col">
                        <div className="max-w-[320px] mx-auto w-full">
                            {/* Calendar Navigation */}
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <h3 className="text-sm font-bold text-gray-900 capitalize">
                                    {monthName} <span className="text-gray-400 font-medium">{year}</span>
                                </h3>
                                <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-y-2 mb-8">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                                    <div key={idx} className="text-center text-[11px] font-bold text-gray-400 py-2">
                                        {day}
                                    </div>
                                ))}

                                {prevMonthDays.map((day, i) => (
                                    <div key={`prev-${i}`} className="text-center text-sm text-gray-200 py-3 font-medium">
                                        {day}
                                    </div>
                                ))}

                                {days.map(day => {
                                    const active = isSelected(day);
                                    const current = isToday(day);
                                    const hasT = hasTests(day);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                                            className={cn(
                                                "relative text-center text-sm py-3 font-semibold transition-all rounded-full w-10 h-10 mx-auto flex items-center justify-center",
                                                active ? "bg-gray-900 text-white shadow-xl shadow-gray-200" :
                                                    current ? "text-primary-600 border border-primary-100" :
                                                        "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {day}
                                            {hasT && !active && (
                                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}

                                {nextMonthDays.map((day, i) => (
                                    <div key={`next-${i}`} className="text-center text-sm text-gray-200 py-3 font-medium">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={openTestModal}
                                className="w-full mt-auto bg-black hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-gray-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Plus className="h-5 w-5" />
                                Planifier un Test
                            </button>

                            {/* Summary Card */}
                            <div className="mt-8 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-primary-600">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aperçu du jour</p>
                                    <p className="text-xs font-bold text-gray-900">
                                        {selectedDayTests.length > 0
                                            ? `${selectedDayTests.length} interventions planifiées`
                                            : "Aucune intervention prévue"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

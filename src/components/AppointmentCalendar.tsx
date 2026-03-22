import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, ChevronLeft, Clock, CheckCircle, XCircle, AlertCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Appointment, Patient } from '@/data/types';

interface AppointmentCalendarProps {
    appointments: Appointment[];
    patients: Patient[];
    selectedDate: string;
    onSelectDate: (date: string) => void;
    onEditAppointment: (appt: Appointment) => void;
    onUpdateStatus: (appt: Appointment, status: Appointment['status']) => void;
}

// ── helpers ───────────────────────────────────────────────────────
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    // Original JS getDay(): 0 = Sunday, 1 = Monday, 6 = Saturday
    // We want: 0 = Saturday, 1 = Sunday, 2 = Monday, 6 = Friday
    const jsDay = new Date(year, month, 1).getDay();
    return (jsDay + 1) % 7;
}

export function buildCalendarGrid(year: number, month: number): (string | null)[][] {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const weeks: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];

    // fill leading nulls for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        currentWeek.push(dateStr);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // fill trailing nulls
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    return weeks;
}

export function groupAppointmentsByDate(appointments: Appointment[]): Record<string, Appointment[]> {
    const map: Record<string, Appointment[]> = {};
    for (const a of appointments) {
        if (!map[a.date]) map[a.date] = [];
        map[a.date].push(a);
    }
    return map;
}

// ── status helpers ────────────────────────────────────────────────
const statusAr = (s: string) => {
    switch (s) {
        case 'scheduled': return 'مجدول';
        case 'completed': return 'مكتمل';
        case 'cancelled': return 'ملغي';
        case 'no-show': return 'لم يحضر';
        default: return s;
    }
};

const statusVariant = (s: string) => {
    switch (s) {
        case 'completed': return 'default' as const;
        case 'cancelled': return 'destructive' as const;
        case 'no-show': return 'secondary' as const;
        default: return 'outline' as const;
    }
};

const statusDotColor = (s: string) => {
    switch (s) {
        case 'scheduled': return 'bg-blue-500';
        case 'completed': return 'bg-emerald-500';
        case 'cancelled': return 'bg-red-500';
        case 'no-show': return 'bg-yellow-500';
        default: return 'bg-gray-400';
    }
};

const statusIcon = (s: string) => {
    switch (s) {
        case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
        case 'no-show': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
};

const WEEKDAYS_AR = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
const MONTHS_AR = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// ── main component ────────────────────────────────────────────────
export default function AppointmentCalendar({
    appointments,
    patients,
    selectedDate,
    onSelectDate,
    onEditAppointment,
    onUpdateStatus,
}: AppointmentCalendarProps) {
    const parsedSelected = new Date(selectedDate + 'T00:00');
    const [viewYear, setViewYear] = useState(parsedSelected.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsedSelected.getMonth());

    const today = new Date().toISOString().split('T')[0];

    const grid = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
    const grouped = useMemo(() => groupAppointmentsByDate(appointments), [appointments]);

    const navigateMonth = (dir: number) => {
        let m = viewMonth + dir;
        let y = viewYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setViewMonth(m);
        setViewYear(y);
    };

    const goToday = () => {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        onSelectDate(today);
    };

    const selectedAppts = grouped[selectedDate] || [];

    return (
        <TooltipProvider delayDuration={200}>
            <div className="space-y-4">
                {/* Month header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <h2 className="text-lg font-bold min-w-[140px] text-center">
                            {MONTHS_AR[viewMonth]} {viewYear}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={goToday}>
                        اليوم
                    </Button>
                </div>

                {/* Calendar grid */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Weekday header */}
                        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                            {WEEKDAYS_AR.map((d) => (
                                <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Weeks */}
                        {grid.map((week, wi) => (
                            <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
                                {week.map((dateStr, di) => {
                                    if (!dateStr) {
                                        return <div key={`e-${wi}-${di}`} className="min-h-[80px] bg-muted/10" />;
                                    }

                                    const dayNum = new Date(dateStr + 'T00:00').getDate();
                                    const dayAppts = grouped[dateStr] || [];
                                    const isToday = dateStr === today;
                                    const isSelected = dateStr === selectedDate;

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => onSelectDate(dateStr)}
                                            className={cn(
                                                'min-h-[80px] p-1.5 text-right transition-colors relative flex flex-col',
                                                'hover:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/40',
                                                'border-l border-border first:border-l-0',
                                                isSelected && 'bg-primary/10 ring-1 ring-primary/30',
                                            )}
                                        >
                                            {/* Day number */}
                                            <span
                                                className={cn(
                                                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium self-end',
                                                    isToday && !isSelected && 'bg-primary text-primary-foreground',
                                                    isToday && isSelected && 'bg-primary text-primary-foreground',
                                                    !isToday && !isSelected && 'text-foreground',
                                                )}
                                            >
                                                {dayNum}
                                            </span>

                                            {/* Appointment dots / mini list */}
                                            {dayAppts.length > 0 && (
                                                <div className="mt-1 space-y-0.5 w-full overflow-hidden">
                                                    {dayAppts.slice(0, 3).map((a) => {
                                                        const patient = patients.find((p) => p.id === a.patientId);
                                                        return (
                                                            <Tooltip key={a.id}>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className={cn(
                                                                            'flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight truncate cursor-pointer',
                                                                            a.status === 'scheduled' && 'bg-blue-500/15 text-blue-400',
                                                                            a.status === 'completed' && 'bg-emerald-500/15 text-emerald-400',
                                                                            a.status === 'cancelled' && 'bg-red-500/15 text-red-400',
                                                                            a.status === 'no-show' && 'bg-yellow-500/15 text-yellow-400',
                                                                        )}
                                                                    >
                                                                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotColor(a.status))} />
                                                                        <span className="truncate">{patient?.name || '—'}</span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" className="text-xs max-w-[200px]">
                                                                    <p className="font-medium">{patient?.name}</p>
                                                                    <p>{a.type} · {statusAr(a.status)}</p>
                                                                    {a.notes && <p className="text-muted-foreground">{a.notes}</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                    {dayAppts.length > 3 && (
                                                        <span className="text-[10px] text-muted-foreground px-1">
                                                            +{dayAppts.length - 3} أخرى
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Selected day detail panel */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-base mb-3">
                            {selectedDate === today ? 'مواعيد اليوم' : `مواعيد ${new Date(selectedDate + 'T00:00').toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                            <span className="text-muted-foreground font-normal text-sm mr-2">({selectedAppts.length})</span>
                        </h3>

                        {selectedAppts.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-6 text-center">لا توجد مواعيد لهذا التاريخ</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedAppts.map((a) => {
                                    const patient = patients.find((p) => p.id === a.patientId);
                                    return (
                                        <div
                                            key={a.id}
                                            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                                        >
                                            {statusIcon(a.status)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{patient?.name || 'غير معروف'}</p>
                                                    {patient?.phone && (
                                                        <span className="text-xs text-muted-foreground">{patient.phone}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant={statusVariant(a.status)} className="text-[10px] px-1.5 py-0">
                                                        {statusAr(a.status)}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{a.type}</span>
                                                    {a.notes && <span className="text-xs text-muted-foreground">· {a.notes}</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 items-center shrink-0">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEditAppointment(a)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                {a.status === 'scheduled' && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdateStatus(a, 'completed')}>
                                                            ✓ مكتمل
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdateStatus(a, 'cancelled')}>
                                                            ✕ إلغاء
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdateStatus(a, 'no-show')}>
                                                            لم يحضر
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}

import { describe, it, expect } from 'vitest';
import {
    getDaysInMonth,
    getFirstDayOfMonth,
    buildCalendarGrid,
    groupAppointmentsByDate,
} from '@/components/AppointmentCalendar';
import type { Appointment } from '@/data/types';

// ── getDaysInMonth ───────────────────────────────────────────────

describe('getDaysInMonth', () => {
    it('returns 31 for January', () => {
        expect(getDaysInMonth(2026, 0)).toBe(31);
    });

    it('returns 28 for February in a non-leap year', () => {
        expect(getDaysInMonth(2025, 1)).toBe(28);
    });

    it('returns 29 for February in a leap year', () => {
        expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('returns 30 for April', () => {
        expect(getDaysInMonth(2026, 3)).toBe(30);
    });

    it('returns 28 for February 2026', () => {
        expect(getDaysInMonth(2026, 1)).toBe(28);
    });
});

// ── getFirstDayOfMonth ──────────────────────────────────────────

describe('getFirstDayOfMonth', () => {
    it('returns correct day-of-week for a known date (March 2026 starts on Sunday (1))', () => {
        // 2026-03-01 is a Sunday. Our new index: Saturday=0, Sunday=1.
        expect(getFirstDayOfMonth(2026, 2)).toBe(1);
    });

    it('returns correct day-of-week for January 2026 (Thursday = 5)', () => {
        // 2026-01-01 is a Thursday. Our new index: Saturday=0, Sunday=1, Monday=2, Tuesday=3, Wednesday=4, Thursday=5.
        expect(getFirstDayOfMonth(2026, 0)).toBe(5);
    });
});

// ── buildCalendarGrid ───────────────────────────────────────────

describe('buildCalendarGrid', () => {
    it('returns an array of weeks (arrays of 7)', () => {
        const grid = buildCalendarGrid(2026, 2); // March 2026
        for (const week of grid) {
            expect(week).toHaveLength(7);
        }
    });

    it('contains every day of the month exactly once', () => {
        const grid = buildCalendarGrid(2026, 2); // March 2026 has 31 days
        const allDays = grid.flat().filter(Boolean) as string[];
        expect(allDays).toHaveLength(31);

        // Check first and last
        expect(allDays[0]).toBe('2026-03-01');
        expect(allDays[allDays.length - 1]).toBe('2026-03-31');
    });

    it('pads leading nulls before the first day', () => {
        // January 2026 starts on Thursday (index 5), so 5 leading nulls
        const grid = buildCalendarGrid(2026, 0);
        const firstWeek = grid[0];
        expect(firstWeek.slice(0, 5).every(d => d === null)).toBe(true);
        expect(firstWeek[5]).toBe('2026-01-01');
    });

    it('pads trailing nulls after the last day', () => {
        // Feb 2026: 28 days, starts on Sunday (1). 
        const grid = buildCalendarGrid(2026, 1);
        const lastWeek = grid[grid.length - 1];

        // Starts Sunday (1), ends Saturday (0). It will wrap into exactly 5 weeks 
        // 1 leading null + 28 days = 29 cells -> 4 weeks + 1 day = 5 weeks total.
        // Last week will have 1 day (Saturday, index 0).
        expect(lastWeek[0]).toBe('2026-02-28');
    });

    it('handles leap year February (2024)', () => {
        const grid = buildCalendarGrid(2024, 1);
        const allDays = grid.flat().filter(Boolean) as string[];
        expect(allDays).toHaveLength(29);
        expect(allDays[allDays.length - 1]).toBe('2024-02-29');
    });

    it('generates correct dates — no duplicates', () => {
        const grid = buildCalendarGrid(2026, 5); // June 2026
        const allDays = grid.flat().filter(Boolean) as string[];
        const unique = new Set(allDays);
        expect(unique.size).toBe(allDays.length);
        expect(allDays).toHaveLength(30);
    });
});

// ── groupAppointmentsByDate ─────────────────────────────────────

describe('groupAppointmentsByDate', () => {
    const makeAppt = (id: string, date: string): Appointment => ({
        id,
        patientId: 'p1',
        date,
        time: '10:00',
        duration: 30,
        type: 'كشف',
        status: 'scheduled',
        notes: '',
        createdBy: 'u1',
    });

    it('returns empty object for empty array', () => {
        expect(groupAppointmentsByDate([])).toEqual({});
    });

    it('groups appointments by date correctly', () => {
        const appts = [
            makeAppt('a1', '2026-03-14'),
            makeAppt('a2', '2026-03-14'),
            makeAppt('a3', '2026-03-15'),
        ];
        const grouped = groupAppointmentsByDate(appts);
        expect(Object.keys(grouped)).toHaveLength(2);
        expect(grouped['2026-03-14']).toHaveLength(2);
        expect(grouped['2026-03-15']).toHaveLength(1);
    });

    it('single appointment per date', () => {
        const appts = [
            makeAppt('a1', '2026-01-01'),
            makeAppt('a2', '2026-01-02'),
            makeAppt('a3', '2026-01-03'),
        ];
        const grouped = groupAppointmentsByDate(appts);
        expect(Object.keys(grouped)).toHaveLength(3);
        for (const key of Object.keys(grouped)) {
            expect(grouped[key]).toHaveLength(1);
        }
    });

    it('preserves appointment data', () => {
        const appt = makeAppt('a1', '2026-03-14');
        const grouped = groupAppointmentsByDate([appt]);
        expect(grouped['2026-03-14'][0]).toBe(appt);
    });
});

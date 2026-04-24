/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Patient, Treatment, Payment, Appointment, Debt, DebtPayment, Clinic } from '@/data/types';
// NOTE: Supabase import kept but not used — offline mode active
// import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ── localStorage helpers ───────────────────────────────────────────
const LS_KEYS = {
  users: 'offline_users',
  patients: 'offline_patients',
  treatments: 'offline_treatments',
  payments: 'offline_payments',
  appointments: 'offline_appointments',
  debts: 'offline_debts',
  debtPayments: 'offline_debtPayments',
} as const;

function lsGet<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function lsSet<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
function uid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
// ────────────────────────────────────────────────────────────────────

interface AppContextType {
  clinicId: string | null;
  clinicName: string;
  setClinic: (id: string, name: string) => void;
  updateClinicName: (name: string) => Promise<void>;
  currentUser: User | null;
  users: User[];
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  registerDoctor: (name: string, password: string) => void;
  addAssistant: (name: string, password: string) => void;
  updateUser: (id: string, name: string, password: string) => void;
  isDoctor: boolean;
  patients: Patient[];
  addPatient: (p: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>) => Promise<string | null>;
  updatePatient: (p: Patient) => void;
  deletePatient: (id: string) => Promise<boolean>;
  treatments: Treatment[];
  addTreatment: (t: Omit<Treatment, 'id' | 'addedBy'>) => void;
  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id' | 'recordedBy'>) => void;
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, 'id' | 'createdBy'>) => void;
  updateAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => Promise<boolean>;
  debts: Debt[];
  addDebt: (d: Omit<Debt, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateDebt: (d: Debt) => void;
  deleteDebt: (id: string) => Promise<boolean>;
  debtPayments: DebtPayment[];
  addDebtPayment: (p: Omit<DebtPayment, 'id' | 'createdAt' | 'recordedBy'>) => void;
  deleteDebtPayment: (id: string) => Promise<boolean>;
  loading: boolean;
  hasDoctor: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [clinicId, setClinicId] = useState<string | null>(localStorage.getItem('clinicId'));
  const [clinicName, setClinicName] = useState(localStorage.getItem('clinicName') || '');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const isDoctor = currentUser?.role === 'doctor';
  const hasDoctor = users.some(u => u.role === 'doctor');

  // ── persist helpers (auto-save to localStorage on every state change) ──
  const persist = useCallback((key: string, data: any[]) => lsSet(key, data), []);

  const setClinic = useCallback((id: string, name: string) => {
    setClinicId(id);
    setClinicName(name);
    localStorage.setItem('clinicId', id);
    localStorage.setItem('clinicName', name);
  }, []);

  const updateClinicName = useCallback(async (name: string) => {
    if (!clinicId) return;
    setClinicName(name);
    localStorage.setItem('clinicName', name);
  }, [clinicId]);

  // ── Load all data from localStorage on mount ──
  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    setUsers(lsGet<User>(LS_KEYS.users));
    setPatients(lsGet<Patient>(LS_KEYS.patients));
    setTreatments(lsGet<Treatment>(LS_KEYS.treatments));
    setPayments(lsGet<Payment>(LS_KEYS.payments));
    setAppointments(lsGet<Appointment>(LS_KEYS.appointments));
    setDebts(lsGet<Debt>(LS_KEYS.debts));
    setDebtPayments(lsGet<DebtPayment>(LS_KEYS.debtPayments));
    setLoading(false);
  }, [clinicId]);

  const login = useCallback((userId: string, password: string) => {
    const user = users.find(u => u.id === userId && u.password === password);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerDoctor = useCallback(async (name: string, password: string) => {
    if (!clinicId) return;
    const user: User = { id: uid(), name, password, role: 'doctor', clinicId, createdAt: new Date().toISOString() };
    const next = [user];
    setUsers(next);
    persist(LS_KEYS.users, next);
    setCurrentUser(user);
  }, [clinicId, persist]);

  const addAssistant = useCallback(async (name: string, password: string) => {
    if (!clinicId) return;
    const user: User = { id: uid(), name, password, role: 'assistant', clinicId, createdAt: new Date().toISOString() };
    setUsers(prev => { const next = [...prev, user]; persist(LS_KEYS.users, next); return next; });
  }, [clinicId, persist]);

  const updateUser = useCallback(async (id: string, name: string, password: string) => {
    setUsers(prev => { const next = prev.map(u => u.id === id ? { ...u, name, password } : u); persist(LS_KEYS.users, next); return next; });
  }, [persist]);

  const addPatient = useCallback(async (p: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>): Promise<string | null> => {
    if (!clinicId) return null;
    const id = uid();
    const patient: Patient = { ...p, id, createdAt: new Date().toISOString(), createdBy: currentUser?.id || '' };
    setPatients(prev => { const next = [...prev, patient]; persist(LS_KEYS.patients, next); return next; });
    return id;
  }, [currentUser, clinicId, persist]);

  const updatePatient = useCallback(async (p: Patient) => {
    setPatients(prev => { const next = prev.map(pt => pt.id === p.id ? p : pt); persist(LS_KEYS.patients, next); return next; });
  }, [persist]);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    setPatients(prev => { const next = prev.filter(p => p.id !== id); persist(LS_KEYS.patients, next); return next; });
    setTreatments(prev => { const next = prev.filter(t => t.patientId !== id); persist(LS_KEYS.treatments, next); return next; });
    setPayments(prev => { const next = prev.filter(p => p.patientId !== id); persist(LS_KEYS.payments, next); return next; });
    setAppointments(prev => { const next = prev.filter(a => a.patientId !== id); persist(LS_KEYS.appointments, next); return next; });
    return true;
  }, [persist]);

  const addTreatment = useCallback(async (t: Omit<Treatment, 'id' | 'addedBy'>) => {
    if (!clinicId) return;
    const treatment: Treatment = { ...t, id: uid(), addedBy: currentUser?.id || '' };
    setTreatments(prev => { const next = [...prev, treatment]; persist(LS_KEYS.treatments, next); return next; });
  }, [currentUser, clinicId, persist]);

  const addPayment = useCallback(async (p: Omit<Payment, 'id' | 'recordedBy'>) => {
    if (!clinicId) return;
    const payment: Payment = { ...p, id: uid(), recordedBy: currentUser?.id || '' };
    setPayments(prev => { const next = [...prev, payment]; persist(LS_KEYS.payments, next); return next; });
  }, [currentUser, clinicId, persist]);

  const addAppointment = useCallback(async (a: Omit<Appointment, 'id' | 'createdBy'>) => {
    if (!clinicId) return;
    const appointment: Appointment = { ...a, id: uid(), createdBy: currentUser?.id || '' };
    setAppointments(prev => { const next = [...prev, appointment]; persist(LS_KEYS.appointments, next); return next; });
  }, [currentUser, clinicId, persist]);

  const updateAppointment = useCallback(async (a: Appointment) => {
    setAppointments(prev => { const next = prev.map(ap => ap.id === a.id ? a : ap); persist(LS_KEYS.appointments, next); return next; });
  }, [persist]);

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    setAppointments(prev => { const next = prev.filter(a => a.id !== id); persist(LS_KEYS.appointments, next); return next; });
    return true;
  }, [persist]);

  const addDebt = useCallback(async (d: Omit<Debt, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!clinicId) return;
    const debt: Debt = { ...d, id: uid(), createdAt: new Date().toISOString(), createdBy: currentUser?.id || '' };
    setDebts(prev => { const next = [debt, ...prev]; persist(LS_KEYS.debts, next); return next; });
  }, [currentUser, clinicId, persist]);

  const updateDebt = useCallback(async (d: Debt) => {
    setDebts(prev => { const next = prev.map(db => db.id === d.id ? d : db); persist(LS_KEYS.debts, next); return next; });
  }, [persist]);

  const deleteDebt = useCallback(async (id: string) => {
    setDebts(prev => { const next = prev.filter(db => db.id !== id); persist(LS_KEYS.debts, next); return next; });
    setDebtPayments(prev => { const next = prev.filter(dp => dp.debtId !== id); persist(LS_KEYS.debtPayments, next); return next; });
    return true;
  }, [persist]);

  const addDebtPayment = useCallback(async (p: Omit<DebtPayment, 'id' | 'createdAt' | 'recordedBy'>) => {
    if (!clinicId) return;
    const dp: DebtPayment = { ...p, id: uid(), createdAt: new Date().toISOString(), recordedBy: currentUser?.id || '' };
    setDebtPayments(prev => { const next = [dp, ...prev]; persist(LS_KEYS.debtPayments, next); return next; });
  }, [currentUser, clinicId, persist]);

  const deleteDebtPayment = useCallback(async (id: string) => {
    setDebtPayments(prev => { const next = prev.filter(dp => dp.id !== id); persist(LS_KEYS.debtPayments, next); return next; });
    return true;
  }, [persist]);

  return (
    <AppContext.Provider value={{
      clinicId, clinicName, setClinic, updateClinicName,
      currentUser, users, login, logout, registerDoctor, addAssistant, updateUser, isDoctor, hasDoctor,
      patients, addPatient, updatePatient, deletePatient,
      treatments, addTreatment,
      payments, addPayment,
      appointments, addAppointment, updateAppointment, deleteAppointment,
      debts, addDebt, updateDebt, deleteDebt,
      debtPayments, addDebtPayment, deleteDebtPayment,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

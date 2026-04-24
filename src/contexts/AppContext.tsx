/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Patient, Treatment, Payment, Appointment, Debt, DebtPayment, Clinic } from '@/data/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Map DB rows (snake_case) to app types (camelCase)
const mapUser = (r: any): User => ({ id: r.id, name: r.name, password: r.password, role: r.role === 'receptionist' ? 'assistant' : r.role, clinicId: r.clinic_id, createdAt: r.created_at });
const mapPatient = (r: any): Patient => ({ id: r.id, name: r.name, phone: r.phone, email: r.email, dateOfBirth: r.date_of_birth, bloodType: r.blood_type, medicalHistory: r.medical_history, allergies: r.allergies, age: r.age, country: r.country || '', createdAt: r.created_at, createdBy: r.created_by });
const mapTreatment = (r: any): Treatment => ({ id: r.id, patientId: r.patient_id, description: r.description, tooth: r.tooth, cost: Number(r.cost), date: r.date, notes: r.notes, addedBy: r.added_by });
const mapPayment = (r: any): Payment => {
  let note = r.note || '';
  let referenceNumber = undefined;
  if (note.startsWith('[REF:')) {
    const end = note.indexOf(']');
    if (end > -1) {
      referenceNumber = note.substring(5, end);
      note = note.substring(end + 1).trim();
    }
  }
  return { id: r.id, patientId: r.patient_id, amount: Number(r.amount), date: r.date, method: r.method, note, referenceNumber, recordedBy: r.recorded_by };
};
const mapAppointment = (r: any): Appointment => ({ id: r.id, patientId: r.patient_id, date: r.date, time: r.time, duration: r.duration, type: r.type, status: r.status, notes: r.notes, createdBy: r.created_by });
const mapDebt = (r: any): Debt => ({ id: r.id, name: r.name, phone: r.phone, amount: Number(r.amount), date: r.date, notes: r.notes, isPaid: r.is_paid, createdAt: r.created_at, createdBy: r.created_by });
const mapDebtPayment = (r: any): DebtPayment => ({ id: r.id, debtId: r.debt_id, amount: Number(r.amount), date: r.date, note: r.note, createdAt: r.created_at, recordedBy: r.recorded_by });

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

  const setClinic = useCallback((id: string, name: string) => {
    setClinicId(id);
    setClinicName(name);
    localStorage.setItem('clinicId', id);
    localStorage.setItem('clinicName', name);
  }, []);

  const updateClinicName = useCallback(async (name: string) => {
    if (!clinicId) return;
    const { data } = await supabase.from('clinics').update({ name }).eq('id', clinicId).select().single();
    if (data) {
      setClinicName(data.name);
      localStorage.setItem('clinicName', data.name);
    }
  }, [clinicId]);

  // Load all data from Supabase on mount (scoped to clinicId)
  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [usersRes, patientsRes, treatmentsRes, paymentsRes, appointmentsRes, debtsRes, debtPaymentsRes] = await Promise.all([
        supabase.from('clinic_users').select('*').eq('clinic_id', clinicId),
        supabase.from('patients').select('*').eq('clinic_id', clinicId),
        supabase.from('treatments').select('*').eq('clinic_id', clinicId),
        supabase.from('payments').select('*').eq('clinic_id', clinicId),
        supabase.from('appointments').select('*').eq('clinic_id', clinicId),
        supabase.from('debts').select('*').eq('clinic_id', clinicId).order('date', { ascending: false }),
        supabase.from('debt_payments').select('*').eq('clinic_id', clinicId).order('date', { ascending: false }),
      ]);
      if (usersRes.data) setUsers(usersRes.data.map(mapUser));
      if (patientsRes.data) setPatients(patientsRes.data.map(mapPatient));
      if (treatmentsRes.data) setTreatments(treatmentsRes.data.map(mapTreatment));
      if (paymentsRes.data) setPayments(paymentsRes.data.map(mapPayment));
      if (appointmentsRes.data) setAppointments(appointmentsRes.data.map(mapAppointment));
      if (debtsRes.data) setDebts(debtsRes.data.map(mapDebt));
      if (debtPaymentsRes.data) setDebtPayments(debtPaymentsRes.data.map(mapDebtPayment));
      setLoading(false);
    };
    load();
  }, [clinicId]);

  const login = useCallback((userId: string, password: string) => {
    const user = users.find(u => u.id === userId && u.password === password);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerDoctor = useCallback(async (name: string, password: string) => {
    if (!clinicId) return;
    const { data } = await supabase.from('clinic_users').insert({ name, password, role: 'doctor', clinic_id: clinicId }).select().single();
    if (data) {
      const user = mapUser(data);
      setUsers([user]);
      setCurrentUser(user);
    }
  }, [clinicId]);

  const addAssistant = useCallback(async (name: string, password: string) => {
    if (!clinicId) return;
    const { data } = await supabase.from('clinic_users').insert({ name, password, role: 'assistant', clinic_id: clinicId }).select().single();
    if (data) setUsers(prev => [...prev, mapUser(data)]);
  }, [clinicId]);

  const updateUser = useCallback(async (id: string, name: string, password: string) => {
    const { data } = await supabase.from('clinic_users').update({ name, password }).eq('id', id).select().single();
    if (data) setUsers(prev => prev.map(u => u.id === id ? mapUser(data) : u));
  }, []);

  const addPatient = useCallback(async (p: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>): Promise<string | null> => {
    if (!clinicId) return null;
    const { data } = await supabase.from('patients').insert({
      name: p.name, phone: p.phone, email: p.email, date_of_birth: p.dateOfBirth,
      blood_type: p.bloodType, medical_history: p.medicalHistory, allergies: p.allergies,
      age: p.age, country: p.country,
      created_by: currentUser?.id, clinic_id: clinicId,
    }).select().single();
    if (data) {
      setPatients(prev => [...prev, mapPatient(data)]);
      return data.id;
    }
    return null;
  }, [currentUser, clinicId]);

  const updatePatient = useCallback(async (p: Patient) => {
    const { data } = await supabase.from('patients').update({
      name: p.name, phone: p.phone, email: p.email, date_of_birth: p.dateOfBirth,
      blood_type: p.bloodType, medical_history: p.medicalHistory, allergies: p.allergies,
      age: p.age, country: p.country,
    }).eq('id', p.id).select().single();
    if (data) setPatients(prev => prev.map(pt => pt.id === p.id ? mapPatient(data) : pt));
  }, []);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    await supabase.from('treatments').delete().eq('patient_id', id);
    await supabase.from('payments').delete().eq('patient_id', id);
    await supabase.from('appointments').delete().eq('patient_id', id);
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (!error) {
      setPatients(prev => prev.filter(p => p.id !== id));
      setTreatments(prev => prev.filter(t => t.patientId !== id));
      setPayments(prev => prev.filter(p => p.patientId !== id));
      setAppointments(prev => prev.filter(a => a.patientId !== id));
      return true;
    }
    return false;
  }, []);

  const addTreatment = useCallback(async (t: Omit<Treatment, 'id' | 'addedBy'>) => {
    if (!clinicId) return;
    const { data } = await supabase.from('treatments').insert({
      patient_id: t.patientId, description: t.description, tooth: t.tooth,
      cost: t.cost, date: t.date, notes: t.notes, added_by: currentUser?.id, clinic_id: clinicId,
    }).select().single();
    if (data) setTreatments(prev => [...prev, mapTreatment(data)]);
  }, [currentUser, clinicId]);

  const addPayment = useCallback(async (p: Omit<Payment, 'id' | 'recordedBy'>) => {
    if (!clinicId) return;
    const finalNote = p.referenceNumber ? `[REF:${p.referenceNumber}] ${p.note}` : p.note;
    const { data } = await supabase.from('payments').insert({
      patient_id: p.patientId, amount: p.amount, date: p.date,
      method: p.method, note: finalNote.trim(), recorded_by: currentUser?.id, clinic_id: clinicId,
    } as any).select().single();
    if (data) setPayments(prev => [...prev, mapPayment(data)]);
  }, [currentUser, clinicId]);

  const addAppointment = useCallback(async (a: Omit<Appointment, 'id' | 'createdBy'>) => {
    if (!clinicId) return;
    const { data } = await supabase.from('appointments').insert({
      patient_id: a.patientId, date: a.date, time: a.time, duration: a.duration,
      type: a.type, status: a.status, notes: a.notes, created_by: currentUser?.id, clinic_id: clinicId,
    }).select().single();
    if (data) setAppointments(prev => [...prev, mapAppointment(data)]);
  }, [currentUser, clinicId]);

  const updateAppointment = useCallback(async (a: Appointment) => {
    const { data } = await supabase.from('appointments').update({
      status: a.status, notes: a.notes, date: a.date, time: a.time,
      duration: a.duration, type: a.type,
    }).eq('id', a.id).select().single();
    if (data) setAppointments(prev => prev.map(ap => ap.id === a.id ? mapAppointment(data) : ap));
  }, []);

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    }
    return false;
  }, []);

  const addDebt = useCallback(async (d: Omit<Debt, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!clinicId) return;
    const { data } = await supabase.from('debts').insert({
      name: d.name, phone: d.phone, amount: d.amount, date: d.date,
      notes: d.notes, is_paid: d.isPaid, created_by: currentUser?.id, clinic_id: clinicId,
    } as any).select().single();
    if (data) setDebts(prev => [mapDebt(data), ...prev]);
  }, [currentUser, clinicId]);

  const updateDebt = useCallback(async (d: Debt) => {
    const { data } = await supabase.from('debts').update({
      name: d.name, phone: d.phone, amount: d.amount, date: d.date,
      notes: d.notes, is_paid: d.isPaid
    } as any).eq('id', d.id).select().single();
    if (data) setDebts(prev => prev.map(db => db.id === d.id ? mapDebt(data) : db));
  }, []);

  const deleteDebt = useCallback(async (id: string) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (!error) {
      setDebts(prev => prev.filter(db => db.id !== id));
      setDebtPayments(prev => prev.filter(dp => dp.debtId !== id));
      return true;
    }
    return false;
  }, []);

  const addDebtPayment = useCallback(async (p: Omit<DebtPayment, 'id' | 'createdAt' | 'recordedBy'>) => {
    if (!clinicId) return;
    const { data } = await supabase.from('debt_payments').insert({
      debt_id: p.debtId, amount: p.amount, date: p.date,
      note: p.note, recorded_by: currentUser?.id, clinic_id: clinicId,
    } as any).select().single();
    if (data) setDebtPayments(prev => [mapDebtPayment(data), ...prev]);
  }, [currentUser, clinicId]);

  const deleteDebtPayment = useCallback(async (id: string) => {
    const { error } = await supabase.from('debt_payments').delete().eq('id', id);
    if (!error) {
      setDebtPayments(prev => prev.filter(dp => dp.id !== id));
      return true;
    }
    return false;
  }, []);

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

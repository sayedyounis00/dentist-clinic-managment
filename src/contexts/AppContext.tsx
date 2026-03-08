import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Patient, Treatment, Payment, Appointment } from '@/data/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  registerDoctor: (name: string, password: string) => void;
  addReceptionist: (name: string, password: string) => void;
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
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// Map DB rows (snake_case) to app types (camelCase)
const mapUser = (r: any): User => ({ id: r.id, name: r.name, password: r.password, role: r.role, createdAt: r.created_at });
const mapPatient = (r: any): Patient => ({ id: r.id, name: r.name, phone: r.phone, email: r.email, dateOfBirth: r.date_of_birth, bloodType: r.blood_type, medicalHistory: r.medical_history, allergies: r.allergies, age: r.age, country: r.country || '', createdAt: r.created_at, createdBy: r.created_by });
const mapTreatment = (r: any): Treatment => ({ id: r.id, patientId: r.patient_id, description: r.description, tooth: r.tooth, cost: Number(r.cost), date: r.date, notes: r.notes, addedBy: r.added_by });
const mapPayment = (r: any): Payment => ({ id: r.id, patientId: r.patient_id, amount: Number(r.amount), date: r.date, method: r.method, note: r.note, recordedBy: r.recorded_by });
const mapAppointment = (r: any): Appointment => ({ id: r.id, patientId: r.patient_id, date: r.date, time: r.time, duration: r.duration, type: r.type, status: r.status, notes: r.notes, createdBy: r.created_by });

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const isDoctor = currentUser?.role === 'doctor';

  // Load all data from Supabase on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [usersRes, patientsRes, treatmentsRes, paymentsRes, appointmentsRes] = await Promise.all([
        supabase.from('clinic_users').select('*'),
        supabase.from('patients').select('*'),
        supabase.from('treatments').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('appointments').select('*'),
      ]);
      if (usersRes.data) setUsers(usersRes.data.map(mapUser));
      if (patientsRes.data) setPatients(patientsRes.data.map(mapPatient));
      if (treatmentsRes.data) setTreatments(treatmentsRes.data.map(mapTreatment));
      if (paymentsRes.data) setPayments(paymentsRes.data.map(mapPayment));
      if (appointmentsRes.data) setAppointments(appointmentsRes.data.map(mapAppointment));
      setLoading(false);
    };
    load();
  }, []);

  const login = useCallback((userId: string, password: string) => {
    const user = users.find(u => u.id === userId && u.password === password);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerDoctor = useCallback(async (name: string, password: string) => {
    const { data, error } = await supabase.from('clinic_users').insert({ name, password, role: 'doctor' }).select().single();
    if (data) {
      const user = mapUser(data);
      setUsers([user]);
      setCurrentUser(user);
    }
  }, []);

  const addReceptionist = useCallback(async (name: string, password: string) => {
    const { data } = await supabase.from('clinic_users').insert({ name, password, role: 'receptionist' }).select().single();
    if (data) setUsers(prev => [...prev, mapUser(data)]);
  }, []);

  const updateUser = useCallback(async (id: string, name: string, password: string) => {
    const { data } = await supabase.from('clinic_users').update({ name, password }).eq('id', id).select().single();
    if (data) setUsers(prev => prev.map(u => u.id === id ? mapUser(data) : u));
  }, []);

  const addPatient = useCallback(async (p: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>): Promise<string | null> => {
    const { data } = await supabase.from('patients').insert({
      name: p.name, phone: p.phone, email: p.email, date_of_birth: p.dateOfBirth,
      blood_type: p.bloodType, medical_history: p.medicalHistory, allergies: p.allergies,
      age: p.age, country: p.country,
      created_by: currentUser?.id,
    }).select().single();
    if (data) {
      setPatients(prev => [...prev, mapPatient(data)]);
      return data.id;
    }
    return null;
  }, [currentUser]);

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
    const { data } = await supabase.from('treatments').insert({
      patient_id: t.patientId, description: t.description, tooth: t.tooth,
      cost: t.cost, date: t.date, notes: t.notes, added_by: currentUser?.id,
    }).select().single();
    if (data) setTreatments(prev => [...prev, mapTreatment(data)]);
  }, [currentUser]);

  const addPayment = useCallback(async (p: Omit<Payment, 'id' | 'recordedBy'>) => {
    const { data } = await supabase.from('payments').insert({
      patient_id: p.patientId, amount: p.amount, date: p.date,
      method: p.method, note: p.note, recorded_by: currentUser?.id,
    }).select().single();
    if (data) setPayments(prev => [...prev, mapPayment(data)]);
  }, [currentUser]);

  const addAppointment = useCallback(async (a: Omit<Appointment, 'id' | 'createdBy'>) => {
    const { data } = await supabase.from('appointments').insert({
      patient_id: a.patientId, date: a.date, time: a.time, duration: a.duration,
      type: a.type, status: a.status, notes: a.notes, created_by: currentUser?.id,
    }).select().single();
    if (data) setAppointments(prev => [...prev, mapAppointment(data)]);
  }, [currentUser]);

  const updateAppointment = useCallback(async (a: Appointment) => {
    const { data } = await supabase.from('appointments').update({
      status: a.status, notes: a.notes, date: a.date, time: a.time,
      duration: a.duration, type: a.type,
    }).eq('id', a.id).select().single();
    if (data) setAppointments(prev => prev.map(ap => ap.id === a.id ? mapAppointment(data) : ap));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, users, login, logout, registerDoctor, addReceptionist, updateUser, isDoctor,
      patients, addPatient, updatePatient, deletePatient,
      treatments, addTreatment,
      payments, addPayment,
      appointments, addAppointment, updateAppointment,
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

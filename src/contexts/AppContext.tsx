import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Patient, Treatment, Payment, Appointment } from '@/data/types';
import { seedUsers, seedPatients, seedTreatments, seedPayments, seedAppointments } from '@/data/seed';

interface AppContextType {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  registerDoctor: (name: string, password: string) => void;
  addReceptionist: (name: string, password: string) => void;
  updateUser: (id: string, name: string, password: string) => void;
  isDoctor: boolean;

  // Patients
  patients: Patient[];
  addPatient: (p: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>) => void;
  updatePatient: (p: Patient) => void;

  // Treatments
  treatments: Treatment[];
  addTreatment: (t: Omit<Treatment, 'id' | 'addedBy'>) => void;

  // Payments
  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id' | 'recordedBy'>) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, 'id' | 'createdBy'>) => void;
  updateAppointment: (a: Appointment) => void;
}

const AppContext = createContext<AppContextType | null>(null);

let idCounter = 100;
const genId = (prefix: string) => `${prefix}${++idCounter}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>(seedPatients);
  const [treatments, setTreatments] = useState<Treatment[]>(seedTreatments);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);

  const isDoctor = currentUser?.role === 'doctor';

  const login = useCallback((userId: string, password: string) => {
    const user = users.find(u => u.id === userId && u.password === password);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerDoctor = useCallback((name: string, password: string) => {
    const doc: User = { id: genId('u'), name, password, role: 'doctor', createdAt: new Date().toISOString().split('T')[0] };
    setUsers([doc]);
    setCurrentUser(doc);
  }, []);

  const addReceptionist = useCallback((name: string, password: string) => {
    setUsers(prev => [...prev, { id: genId('u'), name, password, role: 'receptionist', createdAt: new Date().toISOString().split('T')[0] }]);
  }, []);

  const updateUser = useCallback((id: string, name: string, password: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, name, password } : u));
  }, []);

  const addPatient = useCallback((p: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>) => {
    setPatients(prev => [...prev, { ...p, id: genId('p'), createdAt: new Date().toISOString().split('T')[0], createdBy: currentUser!.id }]);
  }, [currentUser]);

  const updatePatient = useCallback((p: Patient) => {
    setPatients(prev => prev.map(pt => pt.id === p.id ? p : pt));
  }, []);

  const addTreatment = useCallback((t: Omit<Treatment, 'id' | 'addedBy'>) => {
    setTreatments(prev => [...prev, { ...t, id: genId('t'), addedBy: currentUser!.id }]);
  }, [currentUser]);

  const addPayment = useCallback((p: Omit<Payment, 'id' | 'recordedBy'>) => {
    setPayments(prev => [...prev, { ...p, id: genId('pay'), recordedBy: currentUser!.id }]);
  }, [currentUser]);

  const addAppointment = useCallback((a: Omit<Appointment, 'id' | 'createdBy'>) => {
    setAppointments(prev => [...prev, { ...a, id: genId('a'), createdBy: currentUser!.id }]);
  }, [currentUser]);

  const updateAppointment = useCallback((a: Appointment) => {
    setAppointments(prev => prev.map(ap => ap.id === a.id ? a : ap));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, users, login, logout, registerDoctor, addReceptionist, updateUser, isDoctor,
      patients, addPatient, updatePatient,
      treatments, addTreatment,
      payments, addPayment,
      appointments, addAppointment, updateAppointment,
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

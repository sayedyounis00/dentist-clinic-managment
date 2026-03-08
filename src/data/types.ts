export interface User {
  id: string;
  name: string;
  password: string;
  role: 'doctor' | 'receptionist';
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  bloodType: string;
  medicalHistory: string;
  allergies: string;
  createdAt: string;
  createdBy: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  description: string;
  tooth?: string;
  cost: number;
  date: string;
  notes: string;
  addedBy: string;
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'insurance';
  note: string;
  recordedBy: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  createdBy: string;
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Overpaid';

export function getPatientFinancials(patientId: string, treatments: Treatment[], payments: Payment[]) {
  const totalCharged = treatments.filter(t => t.patientId === patientId).reduce((s, t) => s + t.cost, 0);
  const totalPaid = payments.filter(p => p.patientId === patientId).reduce((s, p) => s + p.amount, 0);
  const balance = totalCharged - totalPaid;
  let status: PaymentStatus = 'Unpaid';
  if (totalCharged === 0 && totalPaid === 0) status = 'Unpaid';
  else if (totalPaid >= totalCharged && totalCharged > 0) status = totalPaid > totalCharged ? 'Overpaid' : 'Paid';
  else if (totalPaid > 0) status = 'Partial';
  return { totalCharged, totalPaid, balance, status };
}

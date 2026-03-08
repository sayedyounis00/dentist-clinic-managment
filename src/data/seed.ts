import { User, Patient, Treatment, Payment, Appointment } from './types';

export const seedUsers: User[] = [
  { id: 'u1', name: 'Dr. Ahmed Hassan', password: 'doctor123', role: 'doctor', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Sara Ali', password: 'reception1', role: 'receptionist', createdAt: '2024-01-15' },
  { id: 'u3', name: 'Nour Ibrahim', password: 'reception2', role: 'receptionist', createdAt: '2024-02-01' },
];

export const seedPatients: Patient[] = [
  { id: 'p1', name: 'Mohamed Khalil', phone: '0501234567', email: 'mkhalil@email.com', dateOfBirth: '1985-03-15', bloodType: 'A+', medicalHistory: 'No significant history', allergies: 'Penicillin', age: 39, country: 'مصر', createdAt: '2024-06-01', createdBy: 'u1' },
  { id: 'p2', name: 'Fatima Al-Rashid', phone: '0557654321', email: 'fatima@email.com', dateOfBirth: '1990-07-22', bloodType: 'O-', medicalHistory: 'Diabetes Type 2', allergies: 'None', age: 34, country: 'مصر', createdAt: '2024-06-05', createdBy: 'u1' },
  { id: 'p3', name: 'Omar Youssef', phone: '0509876543', email: 'omar.y@email.com', dateOfBirth: '1978-11-08', bloodType: 'B+', medicalHistory: 'Hypertension', allergies: 'Latex', age: 46, country: 'مصر', createdAt: '2024-07-10', createdBy: 'u1' },
  { id: 'p4', name: 'Layla Mansour', phone: '0551122334', email: 'layla.m@email.com', dateOfBirth: '1995-01-30', bloodType: 'AB+', medicalHistory: 'None', allergies: 'Sulfa drugs', age: 29, country: 'مصر', createdAt: '2024-08-01', createdBy: 'u1' },
  { id: 'p5', name: 'Karim Abdel-Nasser', phone: '0504455667', email: 'karim.an@email.com', dateOfBirth: '1982-09-14', bloodType: 'A-', medicalHistory: 'Asthma', allergies: 'Aspirin', age: 42, country: 'مصر', createdAt: '2024-08-15', createdBy: 'u1' },
];

const today = new Date().toISOString().split('T')[0];

export const seedTreatments: Treatment[] = [
  { id: 't1', patientId: 'p1', description: 'Root Canal Treatment', tooth: '#14', cost: 1500, date: '2024-06-10', notes: 'Completed successfully', addedBy: 'u1' },
  { id: 't2', patientId: 'p1', description: 'Dental Crown (Porcelain)', tooth: '#14', cost: 2000, date: '2024-06-25', notes: 'Permanent crown placed', addedBy: 'u1' },
  { id: 't3', patientId: 'p2', description: 'Teeth Cleaning', cost: 300, date: '2024-06-15', notes: 'Routine cleaning', addedBy: 'u1' },
  { id: 't4', patientId: 'p2', description: 'Cavity Filling', tooth: '#22', cost: 500, date: '2024-07-01', notes: 'Composite filling', addedBy: 'u1' },
  { id: 't5', patientId: 'p3', description: 'Tooth Extraction', tooth: '#38', cost: 800, date: '2024-07-15', notes: 'Wisdom tooth removal', addedBy: 'u1' },
  { id: 't6', patientId: 'p4', description: 'Teeth Whitening', cost: 1200, date: '2024-08-10', notes: 'In-office whitening', addedBy: 'u1' },
  { id: 't7', patientId: 'p5', description: 'Dental Implant', tooth: '#36', cost: 5000, date: '2024-08-20', notes: 'Titanium implant placed', addedBy: 'u1' },
  { id: 't8', patientId: 'p5', description: 'Bone Grafting', tooth: '#36', cost: 1500, date: '2024-08-18', notes: 'Pre-implant bone graft', addedBy: 'u1' },
];

export const seedPayments: Payment[] = [
  { id: 'pay1', patientId: 'p1', amount: 2000, date: '2024-06-10', method: 'card', note: 'First payment', recordedBy: 'u1' },
  { id: 'pay2', patientId: 'p1', amount: 1000, date: '2024-06-30', method: 'cash', note: 'Second payment', recordedBy: 'u2' },
  { id: 'pay3', patientId: 'p2', amount: 800, date: '2024-07-01', method: 'insurance', note: 'Full payment', recordedBy: 'u1' },
  { id: 'pay4', patientId: 'p3', amount: 400, date: '2024-07-15', method: 'cash', note: 'Partial payment', recordedBy: 'u2' },
  { id: 'pay5', patientId: 'p4', amount: 1200, date: '2024-08-10', method: 'card', note: 'Full payment', recordedBy: 'u3' },
  { id: 'pay6', patientId: 'p5', amount: 3000, date: '2024-08-20', method: 'card', note: 'Initial payment', recordedBy: 'u1' },
];

export const seedAppointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', date: today, time: '09:00', duration: 30, type: 'Follow-up', status: 'scheduled', notes: 'Crown check', createdBy: 'u2' },
  { id: 'a2', patientId: 'p2', date: today, time: '10:30', duration: 45, type: 'Cleaning', status: 'scheduled', notes: 'Routine cleaning', createdBy: 'u2' },
  { id: 'a3', patientId: 'p3', date: today, time: '14:00', duration: 30, type: 'Consultation', status: 'scheduled', notes: 'Post-extraction check', createdBy: 'u3' },
  { id: 'a4', patientId: 'p4', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '11:00', duration: 60, type: 'Treatment', status: 'scheduled', notes: 'Follow-up whitening', createdBy: 'u2' },
  { id: 'a5', patientId: 'p5', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '09:30', duration: 90, type: 'Surgery', status: 'scheduled', notes: 'Implant stage 2', createdBy: 'u1' },
  { id: 'a6', patientId: 'p1', date: '2024-06-10', time: '09:00', duration: 60, type: 'Root Canal', status: 'completed', notes: 'Completed', createdBy: 'u1' },
  { id: 'a7', patientId: 'p2', date: '2024-06-15', time: '10:00', duration: 30, type: 'Cleaning', status: 'completed', notes: 'Done', createdBy: 'u2' },
];

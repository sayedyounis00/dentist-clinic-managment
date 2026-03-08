import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelRightClose } from 'lucide-react';
import Sidebar from './Sidebar';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import PatientDetail from '@/pages/PatientDetail';
import AppointmentsPage from '@/pages/Appointments';
import Finance from '@/pages/Finance';
import Staff from '@/pages/Staff';
import { useApp } from '@/contexts/AppContext';

export default function AppLayout() {
  const { isDoctor } = useApp();
  const [page, setPage] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const navigate = (p: string) => {
    setPage(p);
    setSelectedPatientId(null);
  };

  const openPatient = (id: string) => {
    setSelectedPatientId(id);
    setPage('patient-detail');
  };

  const renderPage = () => {
    if (page === 'patient-detail' && selectedPatientId) {
      return <PatientDetail patientId={selectedPatientId} onBack={() => navigate('patients')} />;
    }
    switch (page) {
      case 'dashboard': return <Dashboard onViewPatient={openPatient} onNavigate={navigate} />;
      case 'patients': return <Patients onViewPatient={openPatient} />;
      case 'appointments': return <AppointmentsPage />;
      case 'finance': return isDoctor ? <Finance /> : <Dashboard onViewPatient={openPatient} onNavigate={navigate} />;
      case 'staff': return isDoctor ? <Staff /> : <Dashboard onViewPatient={openPatient} onNavigate={navigate} />;
      default: return <Dashboard onViewPatient={openPatient} onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={page} onNavigate={navigate} />
      <main className="flex-1 overflow-auto bg-muted/30 p-6">
        {renderPage()}
      </main>
    </div>
  );
}

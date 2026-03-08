import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Calendar, DollarSign, UserCog, LogOut, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard', doctorOnly: false },
  { label: 'Patients', icon: Users, path: 'patients', doctorOnly: false },
  { label: 'Appointments', icon: Calendar, path: 'appointments', doctorOnly: false },
  { label: 'Finance', icon: DollarSign, path: 'finance', doctorOnly: true },
  { label: 'Staff', icon: UserCog, path: 'staff', doctorOnly: true },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { currentUser, isDoctor, logout } = useApp();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar-background text-sidebar-foreground">
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-sidebar-primary-foreground text-lg">DentalCare</h1>
          <p className="text-xs text-sidebar-foreground/60">Clinic Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.filter(n => !n.doctorOnly || isDoctor).map(item => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              currentPage === item.path
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-sidebar-primary-foreground">{currentUser?.name}</p>
          <p className="text-xs capitalize text-sidebar-foreground/60">{currentUser?.role}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent" onClick={logout}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

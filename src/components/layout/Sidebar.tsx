import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, CalendarDays, Wallet, UserCog, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, path: 'dashboard', doctorOnly: false },
  { label: 'المرضى', icon: Users, path: 'patients', doctorOnly: false },
  { label: 'المواعيد', icon: CalendarDays, path: 'appointments', doctorOnly: false },
  { label: 'المالية', icon: Wallet, path: 'finance', doctorOnly: true },
  { label: 'الموظفين', icon: UserCog, path: 'staff', doctorOnly: true },
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
          <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-sidebar-primary-foreground text-lg">عيادة الأسنان</h1>
          <p className="text-xs text-sidebar-foreground/60">نظام إدارة العيادة</p>
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
          <p className="text-xs text-sidebar-foreground/60">{currentUser?.role === 'doctor' ? 'طبيب' : 'موظف استقبال'}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent" onClick={logout}>
          <LogOut className="h-4 w-4" /> تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

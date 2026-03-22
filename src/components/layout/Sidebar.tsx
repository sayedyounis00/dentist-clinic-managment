import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, CalendarDays, Wallet, UserCog, LogOut, Stethoscope, PanelRightClose, PanelRightOpen, BookMinus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, path: 'dashboard', doctorOnly: false },
  { label: 'المرضى', icon: Users, path: 'patients', doctorOnly: false },
  { label: 'المواعيد', icon: CalendarDays, path: 'appointments', doctorOnly: false },
  { label: 'المالية', icon: Wallet, path: 'finance', doctorOnly: true },
  { label: 'المديونيات', icon: BookMinus, path: 'debts', doctorOnly: true },
  { label: 'المساعدين', icon: UserCog, path: 'staff', doctorOnly: true },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const { currentUser, isDoctor, logout, clinicName, updateClinicName } = useApp();
  const { toast } = useToast();
  const [showEditClinic, setShowEditClinic] = useState(false);
  const [editName, setEditName] = useState('');

  const openEditClinic = () => {
    setEditName(clinicName);
    setShowEditClinic(true);
  };

  const handleSaveClinicName = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast({ title: 'خطأ', description: 'اسم العيادة مطلوب', variant: 'destructive' });
      return;
    }
    await updateClinicName(trimmed);
    setShowEditClinic(false);
    toast({ title: 'تم بنجاح', description: 'تم تحديث اسم العيادة' });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        'flex h-screen flex-col bg-gradient-to-b from-sidebar-background to-sidebar-accent text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-30'
      )}>
        <div className={cn('flex items-center gap-3 p-4 border-b border-sidebar-border', collapsed && 'justify-center')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-sidebar-primary-foreground text-base truncate">{clinicName}</h1>
                {isDoctor && (
                  <button onClick={openEditClinic} className="shrink-0 p-0.5 rounded hover:bg-sidebar-accent transition-colors">
                    <Pencil className="h-3 w-3 text-sidebar-foreground/60" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-sidebar-foreground/80 truncate">نظام إدارة العيادة</p>
            </div>
          )}
        </div>

        <div className={cn('flex justify-end p-2', collapsed && 'justify-center')}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
            onClick={onToggleCollapse}
          >
            {collapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navItems.filter(n => !n.doctorOnly || isDoctor).map(item => {
            const btn = (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  currentPage === item.path
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.label}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="left">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          {!collapsed && (
            <div className="mb-2 px-3">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{currentUser?.name}</p>
              <p className="text-xs text-sidebar-foreground/80">{currentUser?.role === 'doctor' ? 'طبيب' : 'مساعد'}</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full gap-2 text-sidebar-accent-foreground hover:text-destructive hover:bg-sidebar-accent',
                  collapsed ? 'justify-center px-0' : 'justify-start'
                )}
                onClick={logout}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && 'تسجيل الخروج'}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="left">تسجيل الخروج</TooltipContent>}
          </Tooltip>
        </div>
      </div>

      <Dialog open={showEditClinic} onOpenChange={setShowEditClinic}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل اسم العيادة</DialogTitle>
            <DialogDescription>قم بتعديل اسم العيادة الذي يظهر في جميع أنحاء التطبيق.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>اسم العيادة</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveClinicName(); }}
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditClinic(false)}>إلغاء</Button>
            <Button onClick={handleSaveClinicName}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

import { useApp } from '@/contexts/AppContext';
import { getPatientFinancials } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Wallet, Clock, AlertCircle, BookMinus } from 'lucide-react';

interface Props {
  onViewPatient: (id: string) => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onViewPatient, onNavigate }: Props) {
  const { patients, treatments, payments, appointments, debts, debtPayments, isDoctor, clinicName } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const todayAppts = appointments.filter(a => a.date === today && a.status === 'scheduled');
  const pendingPayments = patients.filter(p => {
    const f = getPatientFinancials(p.id, treatments, payments);
    return f.balance > 0;
  });

  const now = new Date();
  const startOfWeek = new Date(now);
  // Get 0-6 where 0=Sunday, 6=Saturday. We want Saturday to be the start (0 offset).
  const dayOffset = (now.getDay() + 1) % 7;
  startOfWeek.setDate(now.getDate() - dayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 5); // Start on Sat + 5 days = Thursday
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRevenue = payments.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0);
  const weekRevenue = payments.filter(p => {
    const d = new Date(p.date);
    return d >= startOfWeek && d <= endOfWeek;
  }).reduce((s, p) => s + p.amount, 0);
  const monthRevenue = payments.filter(p => new Date(p.date) >= startOfMonth).reduce((s, p) => s + p.amount, 0);

  const totalDebtOutstanding = debts.reduce((sum, d) => {
    const paid = debtPayments.filter(p => p.debtId === d.id).reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, d.amount - paid);
  }, 0);

  const upcoming = appointments
    .filter(a => a.date >= today && a.status === 'scheduled')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const recentPatients = [...patients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const statusAr = (s: string) => s === 'Paid' ? 'مدفوع' : s === 'Partial' ? 'جزئي' : s === 'Unpaid' ? 'غير مدفوع' : 'زائد';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك! هذه نظرة عامة على {clinicName}.</p>
      </div>

      <div className={`grid gap-4 grid-cols-2 sm:grid-cols-3 ${isDoctor ? 'xl:grid-cols-7' : 'xl:grid-cols-3'}`}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => onNavigate('appointments')}>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">مواعيد اليوم</p>
            <p className="text-xl font-bold mt-1">{todayAppts.length}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => onNavigate('patients')}>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 mb-2 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground">إجمالي المرضى</p>
            <p className="text-xl font-bold mt-1">{patients.length}</p>
          </CardContent>
        </Card>

        <Card className="group">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 mb-2 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground">مدفوعات معلقة</p>
            <p className="text-xl font-bold mt-1">{pendingPayments.length}</p>
          </CardContent>
        </Card>

        {isDoctor && (
          <>
            <Card className="group">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">إيرادات اليوم</p>
                <p className="text-xl font-bold mt-1">{todayRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ج.م</span></p>
              </CardContent>
            </Card>
            <Card className="group">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">هذا الأسبوع</p>
                <p className="text-xl font-bold mt-1">{weekRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ج.م</span></p>
              </CardContent>
            </Card>
            <Card className="group">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">هذا الشهر</p>
                <p className="text-xl font-bold mt-1">{monthRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ج.م</span></p>
              </CardContent>
            </Card>
            <Card className="group cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('debts')}>
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 mb-2 group-hover:scale-110 transition-transform">
                  <BookMinus className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-xs text-muted-foreground">المديونيات</p>
                <p className="text-xl font-bold mt-1">{totalDebtOutstanding.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ج.م</span></p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" /> المواعيد القادمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا توجد مواعيد قادمة</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(a => {
                  const patient = patients.find(p => p.id === a.patientId);
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50" onClick={() => patient && onViewPatient(patient.id)}>
                      <div>
                        <p className="font-medium text-sm">{patient?.name}</p>
                        <p className="text-xs text-muted-foreground">{a.type} · {a.notes}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{a.time}</p>
                        <p className="text-xs text-muted-foreground">{a.date === today ? 'اليوم' : a.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" /> المرضى الجدد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map(p => {
                const fin = getPatientFinancials(p.id, treatments, payments);
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50" onClick={() => onViewPatient(p.id)}>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.phone}</p>
                    </div>
                    <Badge variant={fin.status === 'Paid' ? 'default' : fin.status === 'Partial' ? 'secondary' : 'destructive'}>
                      {statusAr(fin.status)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

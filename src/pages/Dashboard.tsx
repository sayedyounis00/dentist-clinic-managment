import { useApp } from '@/contexts/AppContext';
import { getPatientFinancials } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Wallet, Clock, AlertCircle } from 'lucide-react';

interface Props {
  onViewPatient: (id: string) => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onViewPatient, onNavigate }: Props) {
  const { patients, treatments, payments, appointments, isDoctor } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const todayAppts = appointments.filter(a => a.date === today && a.status === 'scheduled');
  const pendingPayments = patients.filter(p => {
    const f = getPatientFinancials(p.id, treatments, payments);
    return f.balance > 0;
  });

  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRevenue = payments.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0);
  const weekRevenue = payments.filter(p => new Date(p.date) >= startOfWeek).reduce((s, p) => s + p.amount, 0);
  const monthRevenue = payments.filter(p => new Date(p.date) >= startOfMonth).reduce((s, p) => s + p.amount, 0);

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
        <p className="text-muted-foreground">مرحباً بك! هذه نظرة عامة على عيادتك.</p>
      </div>

      <div className={`grid gap-4 ${isDoctor ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('appointments')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مواعيد اليوم</p>
              <p className="text-2xl font-bold">{todayAppts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مدفوعات معلقة</p>
              <p className="text-2xl font-bold">{pendingPayments.length}</p>
            </div>
          </CardContent>
        </Card>

        {isDoctor && (
          <>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إيرادات اليوم</p>
                  <p className="text-2xl font-bold">{todayRevenue.toLocaleString()} ج.م</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
                  <p className="text-2xl font-bold">{weekRevenue.toLocaleString()} ج.م</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">هذا الشهر</p>
                  <p className="text-2xl font-bold">{monthRevenue.toLocaleString()} ج.م</p>
                </div>
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
                    {isDoctor && (
                      <Badge variant={fin.status === 'Paid' ? 'default' : fin.status === 'Partial' ? 'secondary' : 'destructive'}>
                        {statusAr(fin.status)}
                      </Badge>
                    )}
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

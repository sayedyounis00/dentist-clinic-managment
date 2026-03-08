import { useApp } from '@/contexts/AppContext';
import { getPatientFinancials } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, TrendingUp, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

export default function Finance() {
  const { patients, treatments, payments } = useApp();

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalCharged = treatments.reduce((s, t) => s + t.cost, 0);
  const totalOwed = totalCharged - totalCollected;

  const cashTotal = payments.filter(p => p.method === 'cash').reduce((s, p) => s + p.amount, 0);
  const cardTotal = payments.filter(p => p.method === 'card').reduce((s, p) => s + p.amount, 0);
  const insuranceTotal = payments.filter(p => p.method === 'insurance').reduce((s, p) => s + p.amount, 0);

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRev = payments.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0);
  const weekRev = payments.filter(p => new Date(p.date) >= startOfWeek).reduce((s, p) => s + p.amount, 0);
  const monthRev = payments.filter(p => new Date(p.date) >= startOfMonth).reduce((s, p) => s + p.amount, 0);

  const statusAr = (s: string) => s === 'Paid' ? 'مدفوع' : s === 'Partial' ? 'جزئي' : s === 'Unpaid' ? 'غير مدفوع' : 'زائد';

  const patientBalances = patients.map(p => {
    const fin = getPatientFinancials(p.id, treatments, payments);
    return { ...p, ...fin };
  }).filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">المالية</h1><p className="text-muted-foreground">الإيرادات والنظرة المالية العامة للعيادة</p></div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-6"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Wallet className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">إجمالي المحصّل</p><p className="text-2xl font-bold">{totalCollected.toLocaleString()} ج.م</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><TrendingUp className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">إجمالي الرسوم</p><p className="text-2xl font-bold">{totalCharged.toLocaleString()} ج.م</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10"><Wallet className="h-6 w-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground">إجمالي المستحق</p><p className="text-2xl font-bold">{totalOwed.toLocaleString()} ج.م</p></div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">اليوم</p><p className="text-xl font-bold">{todayRev.toLocaleString()} ر.س</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">هذا الأسبوع</p><p className="text-xl font-bold">{weekRev.toLocaleString()} ر.س</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">هذا الشهر</p><p className="text-xl font-bold">{monthRev.toLocaleString()} ر.س</p></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">تفصيل طرق الدفع</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-primary" /><span>نقداً</span></div><span className="font-bold">{cashTotal.toLocaleString()} ر.س</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /><span>بطاقة</span></div><span className="font-bold">{cardTotal.toLocaleString()} ر.س</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><span>تأمين</span></div><span className="font-bold">{insuranceTotal.toLocaleString()} ر.س</span></div>
            {totalCollected > 0 && (
              <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-muted">
                <div className="bg-primary" style={{ width: `${(cashTotal / totalCollected) * 100}%` }} />
                <div className="bg-primary/70" style={{ width: `${(cardTotal / totalCollected) * 100}%` }} />
                <div className="bg-primary/40" style={{ width: `${(insuranceTotal / totalCollected) * 100}%` }} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">أعلى الأرصدة المستحقة</CardTitle></CardHeader>
          <CardContent>
            {patientBalances.length === 0 ? <p className="text-muted-foreground text-sm">لا توجد أرصدة مستحقة</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>المريض</TableHead><TableHead>المستحق</TableHead><TableHead>الحالة</TableHead></TableRow></TableHeader>
                <TableBody>
                  {patientBalances.slice(0, 10).map(p => (
                    <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.balance.toLocaleString()} ر.س</TableCell><TableCell><Badge variant={p.status === 'Partial' ? 'secondary' : 'destructive'}>{statusAr(p.status)}</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

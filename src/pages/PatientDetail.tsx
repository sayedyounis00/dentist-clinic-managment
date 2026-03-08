import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getPatientFinancials } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Printer, Heart, Droplets, AlertTriangle, FileText } from 'lucide-react';
import Invoice from '@/components/Invoice';

interface Props { patientId: string; onBack: () => void; }

export default function PatientDetail({ patientId, onBack }: Props) {
  const { patients, treatments, payments, appointments, isDoctor, addTreatment, addPayment } = useApp();
  const { toast } = useToast();
  const patient = patients.find(p => p.id === patientId)!;
  const fin = getPatientFinancials(patientId, treatments, payments);
  const ptTreatments = treatments.filter(t => t.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  const ptPayments = payments.filter(p => p.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  const ptAppts = appointments.filter(a => a.patientId === patientId).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const [showTreatment, setShowTreatment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [tForm, setTForm] = useState({ description: '', tooth: '', cost: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [pForm, setPForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash' as 'cash' | 'card' | 'insurance', note: '' });

  const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000) : 'غير محدد';

  const statusAr = (s: string) => s === 'Paid' ? 'مدفوع' : s === 'Partial' ? 'جزئي' : s === 'Unpaid' ? 'غير مدفوع' : 'زائد';
  const apptStatusAr = (s: string) => s === 'scheduled' ? 'مجدول' : s === 'completed' ? 'مكتمل' : s === 'cancelled' ? 'ملغي' : 'لم يحضر';
  const methodAr = (m: string) => m === 'cash' ? 'نقداً' : m === 'card' ? 'بطاقة' : 'تأمين';

  const handleAddTreatment = () => {
    if (!tForm.description || !tForm.cost) { toast({ title: 'خطأ', description: 'الوصف والتكلفة مطلوبان', variant: 'destructive' }); return; }
    addTreatment({ patientId, description: tForm.description, tooth: tForm.tooth || undefined, cost: parseFloat(tForm.cost), date: tForm.date, notes: tForm.notes });
    setTForm({ description: '', tooth: '', cost: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowTreatment(false);
    toast({ title: 'تم بنجاح', description: 'تمت إضافة العلاج' });
  };

  const handleAddPayment = () => {
    if (!pForm.amount || parseFloat(pForm.amount) <= 0) { toast({ title: 'خطأ', description: 'المبلغ مطلوب', variant: 'destructive' }); return; }
    addPayment({ patientId, amount: parseFloat(pForm.amount), date: pForm.date, method: pForm.method, note: pForm.note });
    setPForm({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', note: '' });
    setShowPayment(false);
    toast({ title: 'تم بنجاح', description: 'تم تسجيل الدفعة' });
  };

  if (showInvoice) {
    return <Invoice patient={patient} treatments={ptTreatments} payments={ptPayments} onBack={() => setShowInvoice(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ArrowRight className="ml-2 h-4 w-4" /> رجوع</Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.phone} · {patient.email}</p>
        </div>
        <Button variant="outline" onClick={() => setShowInvoice(true)}><Printer className="ml-2 h-4 w-4" /> فاتورة</Button>
      </div>

      {isDoctor && (
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">إجمالي الرسوم</p><p className="text-xl font-bold">{fin.totalCharged.toLocaleString()} ج.م</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">إجمالي المدفوع</p><p className="text-xl font-bold">{fin.totalPaid.toLocaleString()} ج.م</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">الرصيد</p><p className="text-xl font-bold">{fin.balance.toLocaleString()} ج.م</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">الحالة</p><Badge variant={fin.status === 'Paid' ? 'default' : fin.status === 'Partial' ? 'secondary' : 'destructive'} className="mt-1">{statusAr(fin.status)}</Badge></CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="demographics">
        <TabsList>
          <TabsTrigger value="demographics">البيانات الشخصية</TabsTrigger>
          <TabsTrigger value="treatments">العلاجات ({ptTreatments.length})</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات ({ptPayments.length})</TabsTrigger>
          <TabsTrigger value="appointments">المواعيد ({ptAppts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3"><Heart className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">العمر</p><p className="font-medium">{age} سنة</p></div></div>
                <div className="flex items-center gap-3"><Droplets className="h-5 w-5 text-destructive" /><div><p className="text-xs text-muted-foreground">فصيلة الدم</p><p className="font-medium">{patient.bloodType || 'غير محدد'}</p></div></div>
                <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-destructive" /><div><p className="text-xs text-muted-foreground">الحساسية</p><p className="font-medium">{patient.allergies || 'لا يوجد'}</p></div></div>
                <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">تاريخ الميلاد</p><p className="font-medium">{patient.dateOfBirth || 'غير محدد'}</p></div></div>
              </div>
              <div className="mt-6"><p className="text-sm text-muted-foreground mb-1">التاريخ المرضي</p><p className="text-sm">{patient.medicalHistory || 'لا توجد سجلات'}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">العلاجات</CardTitle>
              {isDoctor && <Button size="sm" onClick={() => setShowTreatment(true)}><Plus className="ml-1 h-4 w-4" /> إضافة</Button>}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>الوصف</TableHead><TableHead>السن</TableHead><TableHead>التكلفة</TableHead><TableHead>ملاحظات</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ptTreatments.map(t => (
                    <TableRow key={t.id}><TableCell>{t.date}</TableCell><TableCell className="font-medium">{t.description}</TableCell><TableCell>{t.tooth || '—'}</TableCell><TableCell>{t.cost.toLocaleString()} ج.م</TableCell><TableCell className="text-muted-foreground">{t.notes}</TableCell></TableRow>
                  ))}
                  {ptTreatments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا توجد علاجات مسجلة</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">المدفوعات</CardTitle>
              <Button size="sm" onClick={() => setShowPayment(true)}><Plus className="ml-1 h-4 w-4" /> إضافة دفعة</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>المبلغ</TableHead><TableHead>الطريقة</TableHead><TableHead>ملاحظة</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ptPayments.map(p => (
                    <TableRow key={p.id}><TableCell>{p.date}</TableCell><TableCell className="font-medium">{p.amount.toLocaleString()} ر.س</TableCell><TableCell><Badge variant="outline">{methodAr(p.method)}</Badge></TableCell><TableCell className="text-muted-foreground">{p.note}</TableCell></TableRow>
                  ))}
                  {ptPayments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد مدفوعات مسجلة</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-6">
              {ptAppts.length === 0 ? <p className="text-center text-muted-foreground py-8">لا توجد مواعيد</p> : (
                <div className="space-y-3">
                  {ptAppts.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div><p className="font-medium text-sm">{a.type}</p><p className="text-xs text-muted-foreground">{a.notes}</p></div>
                      <div className="text-left"><p className="text-sm">{a.date} في {a.time}</p>
                        <Badge variant={a.status === 'completed' ? 'default' : a.status === 'cancelled' ? 'destructive' : 'secondary'}>{apptStatusAr(a.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showTreatment} onOpenChange={setShowTreatment}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة علاج</DialogTitle><DialogDescription>تسجيل علاج جديد لـ {patient.name}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>الوصف *</Label><Input value={tForm.description} onChange={e => setTForm({ ...tForm, description: e.target.value })} placeholder="مثال: حشو عصب" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>السن</Label><Input value={tForm.tooth} onChange={e => setTForm({ ...tForm, tooth: e.target.value })} placeholder="مثال: #14" /></div>
              <div className="space-y-2"><Label>التكلفة *</Label><Input type="number" value={tForm.cost} onChange={e => setTForm({ ...tForm, cost: e.target.value })} placeholder="0.00" /></div>
            </div>
            <div className="space-y-2"><Label>التاريخ</Label><Input type="date" value={tForm.date} onChange={e => setTForm({ ...tForm, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={tForm.notes} onChange={e => setTForm({ ...tForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowTreatment(false)}>إلغاء</Button><Button onClick={handleAddTreatment}>إضافة العلاج</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader><DialogTitle>تسجيل دفعة</DialogTitle><DialogDescription>تسجيل دفعة لـ {patient.name}. الرصيد: {fin.balance.toLocaleString()} ر.س</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>المبلغ *</Label><Input type="number" value={pForm.amount} onChange={e => setPForm({ ...pForm, amount: e.target.value })} placeholder="0.00" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>التاريخ</Label><Input type="date" value={pForm.date} onChange={e => setPForm({ ...pForm, date: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={pForm.method} onValueChange={(v: 'cash' | 'card' | 'insurance') => setPForm({ ...pForm, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">نقداً</SelectItem><SelectItem value="card">بطاقة</SelectItem><SelectItem value="insurance">تأمين</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>ملاحظة</Label><Input value={pForm.note} onChange={e => setPForm({ ...pForm, note: e.target.value })} placeholder="ملاحظة الدفع" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPayment(false)}>إلغاء</Button><Button onClick={handleAddPayment}>تسجيل الدفعة</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

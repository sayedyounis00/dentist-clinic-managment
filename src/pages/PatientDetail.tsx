import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getPatientFinancials } from '@/data/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Printer, Heart, MapPin, Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Invoice from '@/components/Invoice';

interface Props { patientId: string; onBack: () => void; }

export default function PatientDetail({ patientId, onBack }: Props) {
  const { patients, treatments, payments, appointments, isDoctor, addTreatment, addPayment, addAppointment, updatePatient, deletePatient } = useApp();
  const { toast } = useToast();
  const patient = patients.find(p => p.id === patientId)!;
  const fin = getPatientFinancials(patientId, treatments, payments);
  const ptTreatments = treatments.filter(t => t.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  const ptPayments = payments.filter(p => p.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  const ptAppts = appointments.filter(a => a.patientId === patientId).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEditTotal, setShowEditTotal] = useState(false);
  const [newTotal, setNewTotal] = useState('');
  const [pForm, setPForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash' as 'cash' | 'card' | 'insurance', note: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', age: '', country: '' });
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [apptForm, setApptForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'كشف', notes: '' });

  const statusAr = (s: string) => s === 'Paid' ? 'مدفوع' : s === 'Partial' ? 'جزئي' : s === 'Unpaid' ? 'غير مدفوع' : 'زائد';
  const apptStatusAr = (s: string) => s === 'scheduled' ? 'مجدول' : s === 'completed' ? 'مكتمل' : s === 'cancelled' ? 'ملغي' : 'لم يحضر';
  const methodAr = (m: string) => m === 'cash' ? 'نقداً' : m === 'card' ? 'بطاقة' : 'تأمين';

  const handleAddPayment = () => {
    if (!pForm.amount || parseFloat(pForm.amount) <= 0) { toast({ title: 'خطأ', description: 'المبلغ مطلوب', variant: 'destructive' }); return; }
    addPayment({ patientId, amount: parseFloat(pForm.amount), date: pForm.date, method: pForm.method, note: pForm.note });
    setPForm({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', note: '' });
    setShowPayment(false);
    toast({ title: 'تم بنجاح', description: 'تم تسجيل الدفعة' });
  };

  const openEditDialog = () => {
    setEditForm({
      name: patient.name,
      phone: patient.phone,
      age: patient.age?.toString() || '',
      country: patient.country || '',
    });
    setShowEdit(true);
  };

  const handleEditPatient = () => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      toast({ title: 'خطأ', description: 'الاسم ورقم الهاتف مطلوبان', variant: 'destructive' });
      return;
    }
    updatePatient({
      ...patient,
      name: editForm.name,
      phone: editForm.phone,
      age: editForm.age ? parseInt(editForm.age) : null,
      country: editForm.country,
    });
    setShowEdit(false);
    toast({ title: 'تم بنجاح', description: 'تم تحديث بيانات المريض' });
  };

  const openEditTotal = () => {
    setNewTotal(fin.totalCharged.toString());
    setShowEditTotal(true);
  };

  const handleEditTotal = async () => {
    const targetTotal = parseFloat(newTotal);
    if (isNaN(targetTotal) || targetTotal < 0) {
      toast({ title: 'خطأ', description: 'أدخل مبلغ صحيح', variant: 'destructive' });
      return;
    }
    const diff = targetTotal - fin.totalCharged;
    if (diff === 0) { setShowEditTotal(false); return; }
    // Add a treatment to adjust the total
    await addTreatment({
      patientId,
      description: diff > 0 ? 'تعديل المبلغ (زيادة)' : 'تعديل المبلغ (تخفيض)',
      cost: diff,
      date: new Date().toISOString().split('T')[0],
      notes: `تعديل من ${fin.totalCharged} إلى ${targetTotal}`,
      tooth: undefined,
    });
    setShowEditTotal(false);
    toast({ title: 'تم بنجاح', description: `تم تعديل إجمالي الرسوم إلى ${targetTotal.toLocaleString()} ج.م` });
  };

  const handleDeletePatient = async () => {
    const success = await deletePatient(patientId);
    if (success) {
      toast({ title: 'تم بنجاح', description: 'تم حذف المريض وجميع بياناته' });
      onBack();
    } else {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حذف المريض', variant: 'destructive' });
    }
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
          <p className="text-muted-foreground">{patient.phone}</p>
        </div>
        <Button variant="outline" size="sm" onClick={openEditDialog}><Pencil className="ml-2 h-4 w-4" /> تعديل</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm"><Trash2 className="ml-2 h-4 w-4" /> حذف</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذا المريض؟</AlertDialogTitle>
              <AlertDialogDescription>سيتم حذف المريض "{patient.name}" وجميع بياناته نهائياً. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف نهائياً</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" onClick={() => setShowInvoice(true)}><Printer className="ml-2 h-4 w-4" /> فاتورة</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={openEditTotal}>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">إجمالي الرسوم</p>
            <p className="text-xl font-bold">{fin.totalCharged.toLocaleString()} ج.م</p>
            <p className="text-xs text-primary mt-1">اضغط للتعديل</p>
          </CardContent>
        </Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">إجمالي المدفوع</p><p className="text-xl font-bold">{fin.totalPaid.toLocaleString()} ج.م</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">الرصيد</p><p className="text-xl font-bold">{fin.balance.toLocaleString()} ج.م</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">الحالة</p><Badge variant={fin.status === 'Paid' ? 'default' : fin.status === 'Partial' ? 'secondary' : 'destructive'} className="mt-1">{statusAr(fin.status)}</Badge></CardContent></Card>
      </div>

      <Tabs defaultValue="demographics">
        <TabsList>
          <TabsTrigger value="demographics">البيانات الشخصية</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات ({ptPayments.length})</TabsTrigger>
          <TabsTrigger value="appointments">المواعيد ({ptAppts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3"><Heart className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">العمر</p><p className="font-medium">{patient.age ? `${patient.age} سنة` : 'غير محدد'}</p></div></div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">البلد</p><p className="font-medium">{patient.country || 'غير محدد'}</p></div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">المدفوعات</h3>
                <Button size="sm" onClick={() => setShowPayment(true)}><Plus className="ml-1 h-4 w-4" /> إضافة دفعة</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>المبلغ</TableHead><TableHead>الطريقة</TableHead><TableHead>ملاحظة</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ptPayments.map(p => (
                    <TableRow key={p.id}><TableCell>{p.date}</TableCell><TableCell className="font-medium">{p.amount.toLocaleString()} ج.م</TableCell><TableCell><Badge variant="outline">{methodAr(p.method)}</Badge></TableCell><TableCell className="text-muted-foreground">{p.note}</TableCell></TableRow>
                  ))}
                  {ptPayments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد مدفوعات مسجلة</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">المواعيد</h3>
                <Button size="sm" onClick={() => setShowAddAppt(true)}><Plus className="ml-1 h-4 w-4" /> إضافة موعد</Button>
              </div>
              {ptAppts.length === 0 ? <p className="text-center text-muted-foreground py-8">لا توجد مواعيد</p> : (
                <div className="space-y-3">
                  {ptAppts.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                     <div><p className="font-medium text-sm">{a.type}</p><p className="text-xs text-muted-foreground">{a.notes}</p></div>
                      <div className="text-left"><p className="text-sm">{a.date}</p>
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

      {/* Edit Total Dialog */}
      <Dialog open={showEditTotal} onOpenChange={setShowEditTotal}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل إجمالي الرسوم</DialogTitle><DialogDescription>تعديل المبلغ الكلي لـ {patient.name}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>المبلغ الحالي</Label>
              <p className="text-lg font-bold">{fin.totalCharged.toLocaleString()} ج.م</p>
            </div>
            <div className="space-y-2">
              <Label>المبلغ الجديد *</Label>
              <Input type="number" value={newTotal} onChange={e => setNewTotal(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEditTotal(false)}>إلغاء</Button><Button onClick={handleEditTotal}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل بيانات المريض</DialogTitle><DialogDescription>تعديل بيانات {patient.name}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الاسم الكامل *</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>الهاتف *</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>السن</Label><Input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} placeholder="مثال: 30" /></div>
              <div className="space-y-2"><Label>البلد</Label><Input value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} placeholder="مثال: مصر" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEdit(false)}>إلغاء</Button><Button onClick={handleEditPatient}>حفظ التعديلات</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader><DialogTitle>تسجيل دفعة</DialogTitle><DialogDescription>تسجيل دفعة لـ {patient.name}. الرصيد: {fin.balance.toLocaleString()} ج.م</DialogDescription></DialogHeader>
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

      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppt} onOpenChange={setShowAddAppt}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة موعد</DialogTitle><DialogDescription>إضافة موعد جديد لـ {patient.name}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>التاريخ</Label><Input type="date" value={apptForm.date} onChange={e => setApptForm({ ...apptForm, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>النوع</Label><Input value={apptForm.type} onChange={e => setApptForm({ ...apptForm, type: e.target.value })} placeholder="مثال: كشف، متابعة" /></div>
            <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={apptForm.notes} onChange={e => setApptForm({ ...apptForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAppt(false)}>إلغاء</Button>
            <Button onClick={() => {
              if (!apptForm.type) { toast({ title: 'خطأ', description: 'نوع الموعد مطلوب', variant: 'destructive' }); return; }
              addAppointment({ patientId, date: apptForm.date, time: '00:00', duration: 0, type: apptForm.type, status: 'scheduled', notes: apptForm.notes });
              setApptForm({ date: new Date().toISOString().split('T')[0], type: 'كشف', notes: '' });
              setShowAddAppt(false);
              toast({ title: 'تم بنجاح', description: 'تم إضافة الموعد' });
            }}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

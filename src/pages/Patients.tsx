import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getPatientFinancials } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search } from 'lucide-react';

interface Props { onViewPatient: (id: string) => void; }

export default function Patients({ onViewPatient }: Props) {
  const { patients, treatments, payments, isDoctor, addPatient, appointments } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', dateOfBirth: '', bloodType: '', medicalHistory: '', allergies: '' });

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));

  const getLastVisit = (patientId: string) => {
    const completed = appointments.filter(a => a.patientId === patientId && a.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));
    return completed[0]?.date || 'لا يوجد';
  };

  const statusAr = (s: string) => s === 'Paid' ? 'مدفوع' : s === 'Partial' ? 'جزئي' : s === 'Unpaid' ? 'غير مدفوع' : 'زائد';

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim()) { toast({ title: 'خطأ', description: 'الاسم ورقم الهاتف مطلوبان', variant: 'destructive' }); return; }
    addPatient(form);
    setForm({ name: '', phone: '', email: '', dateOfBirth: '', bloodType: '', medicalHistory: '', allergies: '' });
    setShowAdd(false);
    toast({ title: 'تم بنجاح', description: 'تمت إضافة المريض بنجاح' });
  };

  const statusBadge = (status: string) => {
    const v = status === 'Paid' ? 'default' : status === 'Partial' ? 'secondary' : status === 'Overpaid' ? 'outline' : 'destructive';
    return <Badge variant={v}>{statusAr(status)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المرضى</h1>
          <p className="text-muted-foreground">{patients.length} مريض مسجل</p>
        </div>
        {isDoctor && <Button onClick={() => setShowAdd(true)}><Plus className="ml-2 h-4 w-4" /> إضافة مريض</Button>}
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pr-10" placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>آخر زيارة</TableHead>
                {isDoctor && <TableHead>الرصيد</TableHead>}
                {isDoctor && <TableHead>الحالة</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const fin = getPatientFinancials(p.id, treatments, payments);
                return (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewPatient(p.id)}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{getLastVisit(p.id)}</TableCell>
                    {isDoctor && <TableCell>{fin.balance.toLocaleString()} ر.س</TableCell>}
                    {isDoctor && <TableCell>{statusBadge(fin.status)}</TableCell>}
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={isDoctor ? 5 : 3} className="text-center text-muted-foreground py-8">لا يوجد مرضى</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة مريض جديد</DialogTitle>
            <DialogDescription>أدخل بيانات المريض أدناه.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الاسم الكامل *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>الهاتف *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>البريد الإلكتروني</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>تاريخ الميلاد</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>فصيلة الدم</Label>
                <Select value={form.bloodType} onValueChange={v => setForm({ ...form, bloodType: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>الحساسية</Label><Input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>التاريخ المرضي</Label><Textarea value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
            <Button onClick={handleAdd}>إضافة المريض</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

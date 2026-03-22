import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, UserCog } from 'lucide-react';

export default function Staff() {
  const { users, currentUser, addAssistant, updateUser } = useApp();
  const { toast } = useToast();
  const assistants = users.filter(u => u.role === 'assistant');

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [doctorPw, setDoctorPw] = useState('');
  const [form, setForm] = useState({ name: '', password: '' });

  const handleAdd = () => {
    if (doctorPw !== currentUser?.password) { toast({ title: 'خطأ', description: 'كلمة مرور الطبيب غير صحيحة', variant: 'destructive' }); return; }
    if (!form.name.trim() || !form.password.trim()) { toast({ title: 'خطأ', description: 'جميع الحقول مطلوبة', variant: 'destructive' }); return; }
    addAssistant(form.name.trim(), form.password.trim());
    setShowAdd(false); setForm({ name: '', password: '' }); setDoctorPw('');
    toast({ title: 'تم بنجاح', description: 'تمت إضافة المساعد' });
  };

  const handleEdit = () => {
    if (!showEdit || !form.name.trim() || !form.password.trim()) { toast({ title: 'خطأ', description: 'جميع الحقول مطلوبة', variant: 'destructive' }); return; }
    updateUser(showEdit, form.name.trim(), form.password.trim());
    setShowEdit(null); setForm({ name: '', password: '' });
    toast({ title: 'تم بنجاح', description: 'تم تحديث بيانات المساعد' });
  };

  const openEdit = (id: string) => {
    const u = users.find(u => u.id === id);
    if (u) { setForm({ name: u.name, password: u.password }); setShowEdit(id); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">إدارة المساعدين</h1><p className="text-muted-foreground">إدارة حسابات المساعدين</p></div>
        <Button onClick={() => { setForm({ name: '', password: '' }); setDoctorPw(''); setShowAdd(true); }}><Plus className="ml-2 h-4 w-4" /> إضافة مساعد</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserCog className="h-5 w-5 text-primary" /> المساعدون</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>الاسم</TableHead><TableHead>تاريخ الإنشاء</TableHead><TableHead className="text-left">الإجراءات</TableHead></TableRow></TableHeader>
            <TableBody>
              {assistants.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.createdAt}</TableCell>
                  <TableCell className="text-left"><Button size="sm" variant="outline" onClick={() => openEdit(r.id)}><Pencil className="ml-1 h-3 w-3" /> تعديل</Button></TableCell>
                </TableRow>
              ))}
              {assistants.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">لا يوجد مساعدون</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة مساعد</DialogTitle><DialogDescription>أدخل كلمة المرور الخاصة بك للتأكيد، ثم أدخل بيانات المساعد الجديد.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>كلمة مرور الطبيب *</Label><Input type="password" value={doctorPw} onChange={e => setDoctorPw(e.target.value)} placeholder="أكد كلمة مرورك" /></div>
            <div className="space-y-2"><Label>اسم المساعد *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>كلمة مرور المساعد *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button><Button onClick={handleAdd}>إضافة المساعد</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل المساعد</DialogTitle><DialogDescription>تحديث اسم أو كلمة مرور المساعد.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>الاسم *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>كلمة المرور *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEdit(null)}>إلغاء</Button><Button onClick={handleEdit}>حفظ التغييرات</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Pencil, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Appointment } from '@/data/types';

export default function AppointmentsPage() {
  const { appointments, patients, addAppointment, updateAppointment } = useApp();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ patientId: '', date: selectedDate, type: 'كشف', notes: '' });
  const [editForm, setEditForm] = useState({ date: '', type: '', notes: '', status: '' as string });

  const today = new Date().toISOString().split('T')[0];

  // Generate week days around selected date
  const getWeekDays = (centerDate: string) => {
    const center = new Date(centerDate + 'T00:00');
    const days: string[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(center);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  const navigateWeek = (dir: number) => {
    const d = new Date(selectedDate + 'T00:00');
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const filtered = appointments
    .filter(a => a.date === selectedDate);

  const todayAppointments = appointments.filter(a => a.date === today);
  const scheduledCount = todayAppointments.filter(a => a.status === 'scheduled').length;
  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;
  const cancelledCount = todayAppointments.filter(a => a.status === 'cancelled' || a.status === 'no-show').length;

  const statusIcon = (s: string) => {
    switch (s) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'no-show': return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      default: return <Clock className="h-5 w-5 text-chart-4" />;
    }
  };

  const statusAr = (s: string) => {
    switch (s) {
      case 'scheduled': return 'مجدول';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'no-show': return 'لم يحضر';
      default: return s;
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case 'completed': return 'default' as const;
      case 'cancelled': return 'destructive' as const;
      case 'no-show': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'م' : 'ص';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00');
    return {
      dayName: d.toLocaleDateString('ar', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: dateStr === today,
      hasAppts: appointments.some(a => a.date === dateStr),
    };
  };

  const updateStatus = (appt: Appointment, status: Appointment['status']) => {
    updateAppointment({ ...appt, status });
    toast({ title: 'تم التحديث', description: `تم تحديث حالة الموعد إلى ${statusAr(status)}` });
  };

  const openEditDialog = (appt: Appointment) => {
    setEditingAppt(appt);
    setEditForm({
      date: appt.date,
      type: appt.type,
      notes: appt.notes,
      status: appt.status,
    });
    setShowEdit(true);
  };

  const handleEdit = () => {
    if (!editingAppt) return;
    updateAppointment({
      ...editingAppt,
      date: editForm.date,
      type: editForm.type,
      notes: editForm.notes,
      status: editForm.status as Appointment['status'],
    });
    setShowEdit(false);
    setEditingAppt(null);
    toast({ title: 'تم بنجاح', description: 'تم تحديث الموعد' });
  };

  const handleAdd = () => {
    if (!form.patientId || !form.type) { toast({ title: 'خطأ', description: 'المريض ونوع الموعد مطلوبان', variant: 'destructive' }); return; }
    addAppointment({ patientId: form.patientId, date: form.date, time: '00:00', duration: 0, type: form.type, status: 'scheduled', notes: form.notes });
    setShowAdd(false);
    setForm({ patientId: '', date: selectedDate, type: 'كشف', notes: '' });
    toast({ title: 'تم بنجاح', description: 'تم جدولة الموعد' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المواعيد</h1>
          <p className="text-muted-foreground">إدارة جدول العيادة</p>
        </div>
        <Button onClick={() => { setForm({ ...form, date: selectedDate }); setShowAdd(true); }}><Plus className="ml-2 h-4 w-4" /> موعد جديد</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">مجدول اليوم</p><p className="text-2xl font-bold">{scheduledCount}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">مكتمل اليوم</p><p className="text-2xl font-bold">{completedCount}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">ملغي / لم يحضر</p><p className="text-2xl font-bold">{cancelledCount}</p></CardContent></Card>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}><ChevronRight className="h-4 w-4" /></Button>
        <div className="flex gap-1 flex-1 justify-center">
          {weekDays.map(d => {
            const info = formatDay(d);
            return (
              <Button
                key={d}
                variant={d === selectedDate ? 'default' : 'ghost'}
                size="sm"
                className={`flex flex-col items-center px-3 py-2 h-auto min-w-[52px] ${info.isToday && d !== selectedDate ? 'border border-primary' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                <span className="text-xs">{info.dayName}</span>
                <span className="text-sm font-bold">{info.dayNum}</span>
                {info.hasAppts && d !== selectedDate && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />}
              </Button>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}><ChevronLeft className="h-4 w-4" /></Button>
      </div>

      {/* Date picker + Today button */}
      <div className="flex gap-2 items-center">
        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
        {selectedDate !== today && (
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(today)}>اليوم</Button>
        )}
        <span className="text-sm text-muted-foreground mr-auto">{filtered.length} موعد</span>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد مواعيد لهذا التاريخ</CardContent></Card>
        ) : filtered.map(a => {
          const patient = patients.find(p => p.id === a.patientId);
          return (
            <Card key={a.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex flex-col items-center min-w-[60px]">
                  <p className="text-lg font-bold">{formatTime(a.time)}</p>
                  <p className="text-xs text-muted-foreground">{a.duration} د</p>
                </div>
                <div className="w-px h-10 bg-border" />
                {statusIcon(a.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{patient?.name || 'غير معروف'}</p>
                    {patient?.phone && <span className="text-xs text-muted-foreground">{patient.phone}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={statusVariant(a.status)}>{statusAr(a.status)}</Badge>
                    <span className="text-sm text-muted-foreground">{a.type}</span>
                    {a.notes && <span className="text-xs text-muted-foreground">· {a.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(a)}><Pencil className="h-4 w-4" /></Button>
                  {a.status === 'scheduled' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a, 'completed')}>✓ مكتمل</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a, 'cancelled')}>✕ إلغاء</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a, 'no-show')}>لم يحضر</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>موعد جديد</DialogTitle><DialogDescription>جدولة موعد جديد</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>المريض *</Label>
              <Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المريض" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.phone}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>التاريخ</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>الوقت</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
              <div className="space-y-2"><Label>المدة (دقيقة)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>النوع *</Label><Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="مثال: كشف، تنظيف، متابعة" /></div>
            <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button><Button onClick={handleAdd}>جدولة</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الموعد</DialogTitle>
            <DialogDescription>تعديل بيانات الموعد لـ {editingAppt ? patients.find(p => p.id === editingAppt.patientId)?.name : ''}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>التاريخ</Label><Input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>الوقت</Label><Input type="time" value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} /></div>
              <div className="space-y-2"><Label>المدة (دقيقة)</Label><Input type="number" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>النوع</Label><Input value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="no-show">لم يحضر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEdit(false)}>إلغاء</Button><Button onClick={handleEdit}>حفظ التعديلات</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

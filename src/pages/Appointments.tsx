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
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { Appointment } from '@/data/types';

export default function AppointmentsPage() {
  const { appointments, patients, addAppointment, updateAppointment } = useApp();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ patientId: '', date: selectedDate, time: '09:00', duration: '30', type: '', notes: '' });

  const filtered = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const allDates = [...new Set(appointments.map(a => a.date))].sort();

  const statusIcon = (s: string) => {
    switch (s) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'no-show': return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const updateStatus = (appt: Appointment, status: Appointment['status']) => {
    updateAppointment({ ...appt, status });
    toast({ title: 'Updated', description: `Appointment marked as ${status}` });
  };

  const handleAdd = () => {
    if (!form.patientId || !form.type) { toast({ title: 'Error', description: 'Patient and type are required', variant: 'destructive' }); return; }
    addAppointment({ patientId: form.patientId, date: form.date, time: form.time, duration: parseInt(form.duration), type: form.type, status: 'scheduled', notes: form.notes });
    setShowAdd(false);
    setForm({ patientId: '', date: selectedDate, time: '09:00', duration: '30', type: '', notes: '' });
    toast({ title: 'Success', description: 'Appointment scheduled' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage clinic schedule</p>
        </div>
        <Button onClick={() => { setForm({ ...form, date: selectedDate }); setShowAdd(true); }}><Plus className="mr-2 h-4 w-4" /> New Appointment</Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
        <div className="flex gap-2 flex-wrap">
          {allDates.filter(d => d >= new Date().toISOString().split('T')[0]).slice(0, 7).map(d => (
            <Button key={d} variant={d === selectedDate ? 'default' : 'outline'} size="sm" onClick={() => setSelectedDate(d)}>
              {new Date(d + 'T00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments for this date</CardContent></Card>
        ) : filtered.map(a => {
          const patient = patients.find(p => p.id === a.patientId);
          return (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {statusIcon(a.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{patient?.name || 'Unknown'}</p>
                    <Badge variant="outline" className="capitalize">{a.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.type} · {a.duration} min · {a.notes}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{a.time}</p>
                  <p className="text-xs text-muted-foreground">{a.duration} min</p>
                </div>
                {a.status === 'scheduled' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(a, 'completed')}>Complete</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(a, 'cancelled')}>Cancel</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(a, 'no-show')}>No-Show</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Appointment</DialogTitle><DialogDescription>Schedule a new appointment</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Type *</Label><Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. Cleaning, Consultation" /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={handleAdd}>Schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

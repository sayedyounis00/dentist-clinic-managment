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
    return completed[0]?.date || 'N/A';
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim()) { toast({ title: 'Error', description: 'Name and phone are required', variant: 'destructive' }); return; }
    addPatient(form);
    setForm({ name: '', phone: '', email: '', dateOfBirth: '', bloodType: '', medicalHistory: '', allergies: '' });
    setShowAdd(false);
    toast({ title: 'Success', description: 'Patient added successfully' });
  };

  const statusBadge = (status: string) => {
    const v = status === 'Paid' ? 'default' : status === 'Partial' ? 'secondary' : status === 'Overpaid' ? 'outline' : 'destructive';
    return <Badge variant={v}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">{patients.length} registered patients</p>
        </div>
        {isDoctor && <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Patient</Button>}
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search patients by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last Visit</TableHead>
                {isDoctor && <TableHead>Balance</TableHead>}
                {isDoctor && <TableHead>Status</TableHead>}
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
                    {isDoctor && <TableCell>${fin.balance.toLocaleString()}</TableCell>}
                    {isDoctor && <TableCell>{statusBadge(fin.status)}</TableCell>}
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={isDoctor ? 5 : 3} className="text-center text-muted-foreground py-8">No patients found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Enter the patient's details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select value={form.bloodType} onValueChange={v => setForm({ ...form, bloodType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Allergies</Label><Input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Medical History</Label><Textarea value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

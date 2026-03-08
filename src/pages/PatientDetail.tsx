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
import { ArrowLeft, Plus, Printer, Heart, Droplets, AlertTriangle, FileText } from 'lucide-react';
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

  const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000) : 'N/A';

  const handleAddTreatment = () => {
    if (!tForm.description || !tForm.cost) { toast({ title: 'Error', description: 'Description and cost are required', variant: 'destructive' }); return; }
    addTreatment({ patientId, description: tForm.description, tooth: tForm.tooth || undefined, cost: parseFloat(tForm.cost), date: tForm.date, notes: tForm.notes });
    setTForm({ description: '', tooth: '', cost: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowTreatment(false);
    toast({ title: 'Success', description: 'Treatment added' });
  };

  const handleAddPayment = () => {
    if (!pForm.amount || parseFloat(pForm.amount) <= 0) { toast({ title: 'Error', description: 'Valid amount is required', variant: 'destructive' }); return; }
    addPayment({ patientId, amount: parseFloat(pForm.amount), date: pForm.date, method: pForm.method, note: pForm.note });
    setPForm({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', note: '' });
    setShowPayment(false);
    toast({ title: 'Success', description: 'Payment recorded' });
  };

  if (showInvoice) {
    return <Invoice patient={patient} treatments={ptTreatments} payments={ptPayments} onBack={() => setShowInvoice(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.phone} · {patient.email}</p>
        </div>
        <Button variant="outline" onClick={() => setShowInvoice(true)}><Printer className="mr-2 h-4 w-4" /> Invoice</Button>
      </div>

      {isDoctor && (
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Charged</p><p className="text-xl font-bold">${fin.totalCharged.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-xl font-bold">${fin.totalPaid.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Balance</p><p className="text-xl font-bold">${fin.balance.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Status</p><Badge variant={fin.status === 'Paid' ? 'default' : fin.status === 'Partial' ? 'secondary' : 'destructive'} className="mt-1">{fin.status}</Badge></CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="demographics">
        <TabsList>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="treatments">Treatments ({ptTreatments.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({ptPayments.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({ptAppts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3"><Heart className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Age</p><p className="font-medium">{age} years</p></div></div>
                <div className="flex items-center gap-3"><Droplets className="h-5 w-5 text-destructive" /><div><p className="text-xs text-muted-foreground">Blood Type</p><p className="font-medium">{patient.bloodType || 'N/A'}</p></div></div>
                <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-yellow-500" /><div><p className="text-xs text-muted-foreground">Allergies</p><p className="font-medium">{patient.allergies || 'None'}</p></div></div>
                <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">DOB</p><p className="font-medium">{patient.dateOfBirth || 'N/A'}</p></div></div>
              </div>
              <div className="mt-6"><p className="text-sm text-muted-foreground mb-1">Medical History</p><p className="text-sm">{patient.medicalHistory || 'No records'}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Treatments</CardTitle>
              {isDoctor && <Button size="sm" onClick={() => setShowTreatment(true)}><Plus className="mr-1 h-4 w-4" /> Add</Button>}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Tooth</TableHead><TableHead>Cost</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ptTreatments.map(t => (
                    <TableRow key={t.id}><TableCell>{t.date}</TableCell><TableCell className="font-medium">{t.description}</TableCell><TableCell>{t.tooth || '—'}</TableCell><TableCell>${t.cost.toLocaleString()}</TableCell><TableCell className="text-muted-foreground">{t.notes}</TableCell></TableRow>
                  ))}
                  {ptTreatments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No treatments recorded</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payments</CardTitle>
              <Button size="sm" onClick={() => setShowPayment(true)}><Plus className="mr-1 h-4 w-4" /> Add Payment</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ptPayments.map(p => (
                    <TableRow key={p.id}><TableCell>{p.date}</TableCell><TableCell className="font-medium">${p.amount.toLocaleString()}</TableCell><TableCell><Badge variant="outline" className="capitalize">{p.method}</Badge></TableCell><TableCell className="text-muted-foreground">{p.note}</TableCell></TableRow>
                  ))}
                  {ptPayments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No payments recorded</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-6">
              {ptAppts.length === 0 ? <p className="text-center text-muted-foreground py-8">No appointments</p> : (
                <div className="space-y-3">
                  {ptAppts.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div><p className="font-medium text-sm">{a.type}</p><p className="text-xs text-muted-foreground">{a.notes}</p></div>
                      <div className="text-right"><p className="text-sm">{a.date} at {a.time}</p>
                        <Badge variant={a.status === 'completed' ? 'default' : a.status === 'cancelled' ? 'destructive' : 'secondary'} className="capitalize">{a.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Dialog */}
      <Dialog open={showTreatment} onOpenChange={setShowTreatment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Treatment</DialogTitle><DialogDescription>Record a new treatment for {patient.name}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Description *</Label><Input value={tForm.description} onChange={e => setTForm({ ...tForm, description: e.target.value })} placeholder="e.g. Root Canal" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tooth</Label><Input value={tForm.tooth} onChange={e => setTForm({ ...tForm, tooth: e.target.value })} placeholder="e.g. #14" /></div>
              <div className="space-y-2"><Label>Cost *</Label><Input type="number" value={tForm.cost} onChange={e => setTForm({ ...tForm, cost: e.target.value })} placeholder="0.00" /></div>
            </div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={tForm.date} onChange={e => setTForm({ ...tForm, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={tForm.notes} onChange={e => setTForm({ ...tForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowTreatment(false)}>Cancel</Button><Button onClick={handleAddTreatment}>Add Treatment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle><DialogDescription>Record a payment for {patient.name}. Balance: ${fin.balance.toLocaleString()}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Amount *</Label><Input type="number" value={pForm.amount} onChange={e => setPForm({ ...pForm, amount: e.target.value })} placeholder="0.00" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={pForm.date} onChange={e => setPForm({ ...pForm, date: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={pForm.method} onValueChange={(v: 'cash' | 'card' | 'insurance') => setPForm({ ...pForm, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="insurance">Insurance</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Note</Label><Input value={pForm.note} onChange={e => setPForm({ ...pForm, note: e.target.value })} placeholder="Payment note" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPayment(false)}>Cancel</Button><Button onClick={handleAddPayment}>Record Payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

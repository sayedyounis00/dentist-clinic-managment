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
  const { users, currentUser, addReceptionist, updateUser } = useApp();
  const { toast } = useToast();
  const receptionists = users.filter(u => u.role === 'receptionist');

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [doctorPw, setDoctorPw] = useState('');
  const [form, setForm] = useState({ name: '', password: '' });

  const handleAdd = () => {
    if (doctorPw !== currentUser?.password) { toast({ title: 'Error', description: 'Doctor password incorrect', variant: 'destructive' }); return; }
    if (!form.name.trim() || !form.password.trim()) { toast({ title: 'Error', description: 'All fields required', variant: 'destructive' }); return; }
    addReceptionist(form.name.trim(), form.password.trim());
    setShowAdd(false); setForm({ name: '', password: '' }); setDoctorPw('');
    toast({ title: 'Success', description: 'Receptionist added' });
  };

  const handleEdit = () => {
    if (!showEdit || !form.name.trim() || !form.password.trim()) { toast({ title: 'Error', description: 'All fields required', variant: 'destructive' }); return; }
    updateUser(showEdit, form.name.trim(), form.password.trim());
    setShowEdit(null); setForm({ name: '', password: '' });
    toast({ title: 'Success', description: 'Receptionist updated' });
  };

  const openEdit = (id: string) => {
    const u = users.find(u => u.id === id);
    if (u) { setForm({ name: u.name, password: u.password }); setShowEdit(id); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Staff Management</h1><p className="text-muted-foreground">Manage receptionist accounts</p></div>
        <Button onClick={() => { setForm({ name: '', password: '' }); setDoctorPw(''); setShowAdd(true); }}><Plus className="mr-2 h-4 w-4" /> Add Receptionist</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserCog className="h-5 w-5 text-primary" /> Receptionists</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {receptionists.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.createdAt}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => openEdit(r.id)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button></TableCell>
                </TableRow>
              ))}
              {receptionists.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No receptionists added</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Receptionist</DialogTitle><DialogDescription>Enter your password to confirm, then fill in the new receptionist's details.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Your Doctor Password *</Label><Input type="password" value={doctorPw} onChange={e => setDoctorPw(e.target.value)} placeholder="Confirm your password" /></div>
            <div className="space-y-2"><Label>Receptionist Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Receptionist Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={handleAdd}>Add Receptionist</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Receptionist</DialogTitle><DialogDescription>Update the receptionist's name or password.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEdit(null)}>Cancel</Button><Button onClick={handleEdit}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

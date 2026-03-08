import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope } from 'lucide-react';

export default function Login() {
  const { users, login, registerDoctor } = useApp();
  const { toast } = useToast();
  const hasDoctor = users.some(u => u.role === 'doctor');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!hasDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Stethoscope className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Dental Clinic Setup</CardTitle>
            <CardDescription>Register the Doctor account to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Dr. Full Name" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Choose a password" />
            </div>
            <Button className="w-full" onClick={() => {
              if (!regName.trim() || !regPassword.trim()) { toast({ title: 'Error', description: 'All fields required', variant: 'destructive' }); return; }
              registerDoctor(regName.trim(), regPassword.trim());
              toast({ title: 'Welcome!', description: 'Doctor account created successfully' });
            }}>Create Doctor Account</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Stethoscope className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Dental Clinic</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger><SelectValue placeholder="Choose your account" /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
              onKeyDown={e => { if (e.key === 'Enter') document.getElementById('login-btn')?.click(); }} />
          </div>
          <Button id="login-btn" className="w-full" onClick={() => {
            if (!selectedUserId) { toast({ title: 'Error', description: 'Please select a user', variant: 'destructive' }); return; }
            const ok = login(selectedUserId, password);
            if (!ok) toast({ title: 'Error', description: 'Incorrect password', variant: 'destructive' });
          }}>Sign In</Button>
        </CardContent>
      </Card>
    </div>
  );
}

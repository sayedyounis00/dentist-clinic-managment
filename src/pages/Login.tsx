import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Loader2 } from 'lucide-react';

export default function Login() {
  const { users, login, loading, clinicName } = useApp();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogin = () => {
    if (!selectedUserId) { toast({ title: 'خطأ', description: 'الرجاء اختيار مستخدم', variant: 'destructive' }); return; }
    const ok = login(selectedUserId, password);
    if (!ok) toast({ title: 'خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Stethoscope className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{clinicName}</CardTitle>
          <CardDescription>نظام إدارة العيادة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">لا يوجد مستخدمون في النظام.</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>اختر المستخدم</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger><SelectValue placeholder="اختر حسابك" /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role === 'doctor' ? 'طبيب' : 'مساعد'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور"
                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
                </div>
                <Button className="w-full" onClick={handleLogin}>تسجيل الدخول</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

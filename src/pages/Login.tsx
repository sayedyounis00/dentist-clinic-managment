import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Loader2, LogIn, UserPlus, UserCog } from 'lucide-react';

export default function Login() {
  const { users, login, registerDoctor, addReceptionist, loading } = useApp();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [doctorAuthPw, setDoctorAuthPw] = useState('');

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

  const handleRegisterDoctor = () => {
    if (!regName.trim() || !regPassword.trim()) { toast({ title: 'خطأ', description: 'جميع الحقول مطلوبة', variant: 'destructive' }); return; }
    registerDoctor(regName.trim(), regPassword.trim());
    toast({ title: 'مرحباً!', description: 'تم إنشاء حساب الطبيب بنجاح' });
  };

  const handleAddStaff = () => {
    if (!staffName.trim() || !staffPassword.trim() || !doctorAuthPw.trim()) {
      toast({ title: 'خطأ', description: 'جميع الحقول مطلوبة', variant: 'destructive' }); return;
    }
    const doctor = users.find(u => u.role === 'doctor');
    if (!doctor || doctor.password !== doctorAuthPw) {
      toast({ title: 'خطأ', description: 'كلمة مرور الطبيب غير صحيحة', variant: 'destructive' }); return;
    }
    addReceptionist(staffName.trim(), staffPassword.trim());
    setStaffName(''); setStaffPassword(''); setDoctorAuthPw('');
    toast({ title: 'تم بنجاح', description: 'تمت إضافة موظف الاستقبال' });
  };

  const hasDoctor = users.some(u => u.role === 'doctor');

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Stethoscope className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">عيادة الأسنان</CardTitle>
          <CardDescription>نظام إدارة العيادة</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={hasDoctor ? 'login' : 'register'} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" className="flex items-center gap-1 text-xs">
                <LogIn className="h-3 w-3" /> تسجيل دخول
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-1 text-xs">
                <UserPlus className="h-3 w-3" /> دكتور جديد
              </TabsTrigger>
              <TabsTrigger value="staff" disabled={!hasDoctor} className="flex items-center gap-1 text-xs">
                <UserCog className="h-3 w-3" /> موظف جديد
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">لا يوجد مستخدمون. سجّل طبيب أولاً.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>اختر المستخدم</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger><SelectValue placeholder="اختر حسابك" /></SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.role === 'doctor' ? 'طبيب' : 'موظف استقبال'})
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
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="د. الاسم الكامل" />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="اختر كلمة مرور" />
              </div>
              <Button className="w-full" onClick={handleRegisterDoctor}>إنشاء حساب الطبيب</Button>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>كلمة مرور الطبيب *</Label>
                <Input type="password" value={doctorAuthPw} onChange={e => setDoctorAuthPw(e.target.value)} placeholder="أدخل كلمة مرور الطبيب للتأكيد" />
              </div>
              <div className="space-y-2">
                <Label>اسم الموظف *</Label>
                <Input value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="اسم موظف الاستقبال" />
              </div>
              <div className="space-y-2">
                <Label>كلمة مرور الموظف *</Label>
                <Input type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} placeholder="كلمة مرور موظف الاستقبال" />
              </div>
              <Button className="w-full" onClick={handleAddStaff}>إضافة موظف الاستقبال</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

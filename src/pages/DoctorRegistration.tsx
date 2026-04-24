import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Loader2 } from 'lucide-react';
// NOTE: Supabase import kept but not used — offline mode active
// import { supabase } from '@/integrations/supabase/client';

interface Props {
    clinicId: string;
    clinicName: string;
    onDoctorCreated: () => void;
}

export default function DoctorRegistration({ clinicId, clinicName, onDoctorCreated }: Props) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName || !password) {
            toast({ title: 'خطأ', description: 'جميع الحقول مطلوبة', variant: 'destructive' });
            return;
        }
        if (password !== confirmPassword) {
            toast({ title: 'خطأ', description: 'كلمتا المرور غير متطابقتين', variant: 'destructive' });
            return;
        }
        setLoading(true);
        // Offline: create the doctor locally
        const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        const user = {
            id,
            name: trimmedName,
            password,
            role: 'doctor' as const,
            clinicId,
            createdAt: new Date().toISOString(),
        };
        // Save to localStorage
        localStorage.setItem('offline_users', JSON.stringify([user]));
        setLoading(false);
        toast({ title: 'تم بنجاح', description: 'تم إنشاء حساب الطبيب' });
        onDoctorCreated();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                        <Stethoscope className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{clinicName}</CardTitle>
                    <CardDescription>إنشاء حساب الطبيب الرئيسي</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>اسم الطبيب</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="أدخل اسم الطبيب"
                                dir="rtl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>كلمة المرور</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="أدخل كلمة المرور"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>تأكيد كلمة المرور</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="أعد إدخال كلمة المرور"
                                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                            />
                        </div>
                        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                            إنشاء حساب الطبيب
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

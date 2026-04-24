import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2 } from 'lucide-react';
// NOTE: Supabase import kept but not used — offline mode active
// import { supabase } from '@/integrations/supabase/client';

interface Props {
    onClinicCreated: (clinicId: string, clinicName: string) => void;
}

export default function ClinicSetup({ onClinicCreated }: Props) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            toast({ title: 'خطأ', description: 'الرجاء إدخال اسم العيادة', variant: 'destructive' });
            return;
        }
        setLoading(true);
        // Offline: generate a local ID
        const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem('clinicId', id);
        localStorage.setItem('clinicName', trimmed);
        setLoading(false);
        onClinicCreated(id, trimmed);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                        <Building2 className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">إعداد العيادة</CardTitle>
                    <CardDescription>أدخل اسم عيادتك للبدء</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>اسم العيادة</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="مثال: عيادة الأسنان"
                                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                                dir="rtl"
                            />
                        </div>
                        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                            إنشاء العيادة
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

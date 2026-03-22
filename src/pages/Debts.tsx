import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Debt, DebtPayment } from '@/data/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, CreditCard, ChevronDown, ChevronUp, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const today = () => new Date().toISOString().split('T')[0];

const emptyDebt = (): Omit<Debt, 'id' | 'createdAt' | 'createdBy'> => ({
    name: '', phone: '', amount: 0, date: today(), notes: '', isPaid: false,
});

export default function Debts() {
    const { debts, debtPayments, addDebt, updateDebt, deleteDebt, addDebtPayment, deleteDebtPayment } = useApp();
    const { toast } = useToast();

    const [form, setForm] = useState(emptyDebt());
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);

    // Payment dialog state
    const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
    const [paymentForm, setPaymentForm] = useState({ amount: '', date: today(), note: '' });
    const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

    const totalOutstanding = useMemo(
        () => debts.filter(d => !d.isPaid).reduce((sum, d) => {
            const paid = debtPayments.filter(p => p.debtId === d.id).reduce((s, p) => s + p.amount, 0);
            return sum + Math.max(0, d.amount - paid);
        }, 0),
        [debts, debtPayments]
    );

    const getDebtStatus = (d: Debt) => {
        const paid = debtPayments.filter(p => p.debtId === d.id).reduce((s, p) => s + p.amount, 0);
        if (paid >= d.amount) return 'paid';
        if (paid > 0) return 'partial';
        return 'unpaid';
    };

    const getRemainingAmount = (d: Debt) => {
        const paid = debtPayments.filter(p => p.debtId === d.id).reduce((s, p) => s + p.amount, 0);
        return Math.max(0, d.amount - paid);
    };

    const openAdd = () => { setForm(emptyDebt()); setEditingDebt(null); setShowDialog(true); };
    const openEdit = (d: Debt) => { setEditingDebt(d); setForm({ name: d.name, phone: d.phone || '', amount: d.amount, date: d.date, notes: d.notes || '', isPaid: d.isPaid }); setShowDialog(true); };

    const handleSave = async () => {
        if (!form.name.trim() || !form.amount || !form.date) {
            toast({ title: 'خطأ', description: 'الاسم والمبلغ والتاريخ مطلوبة', variant: 'destructive' }); return;
        }
        if (editingDebt) {
            await updateDebt({ ...editingDebt, ...form });
            toast({ title: 'تم التحديث', description: 'تم تعديل السجل بنجاح' });
        } else {
            await addDebt(form);
            toast({ title: 'تمت الإضافة', description: 'تمت إضافة الدين بنجاح' });
        }
        setShowDialog(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteDebt(deleteId);
        setDeleteId(null);
        toast({ title: 'تم الحذف', description: 'تم حذف السجل' });
    };

    const handleAddPayment = async () => {
        if (!paymentDebt || !paymentForm.amount || !paymentForm.date) {
            toast({ title: 'خطأ', description: 'المبلغ والتاريخ مطلوبان', variant: 'destructive' }); return;
        }
        const amount = Number(paymentForm.amount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: 'خطأ', description: 'أدخل مبلغاً صحيحاً', variant: 'destructive' }); return;
        }
        await addDebtPayment({ debtId: paymentDebt.id, amount, date: paymentForm.date, note: paymentForm.note });
        setPaymentForm({ amount: '', date: today(), note: '' });
        toast({ title: 'تم تسجيل الدفعة', description: `تم إضافة دفعة ${amount.toLocaleString()} ج.م` });
    };

    const statusBadge = (d: Debt) => {
        const status = getDebtStatus(d);
        if (status === 'paid') return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">مسدَّد</Badge>;
        if (status === 'partial') return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">جزئي</Badge>;
        return <Badge variant="destructive">غير مسدَّد</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">سجل المديونيات</h1>
                    <p className="text-muted-foreground text-sm">تتبع المبالغ المستحقة للآخرين</p>
                </div>
                <Button onClick={openAdd} className="gap-2">
                    <Plus className="h-4 w-4" /> إضافة دين جديد
                </Button>
            </div>

            {/* Summary card */}
            <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex items-center justify-between p-4">
                    <p className="text-sm font-medium text-muted-foreground">إجمالي المبالغ المستحقة</p>
                    <p className="text-2xl font-bold text-destructive">{totalOutstanding.toLocaleString()} <span className="text-base font-normal">ج.م</span></p>
                </CardContent>
            </Card>

            {/* Debt list */}
            <div className="space-y-3">
                {debts.length === 0 && (
                    <Card><CardContent className="py-10 text-center text-muted-foreground">لا توجد سجلات مديونيات</CardContent></Card>
                )}
                {debts.map(d => {
                    const status = getDebtStatus(d);
                    const remaining = getRemainingAmount(d);
                    const dPayments = debtPayments.filter(p => p.debtId === d.id);
                    const expanded = expandedDebtId === d.id;

                    return (
                        <Card key={d.id} className={cn('transition-all', status === 'paid' && 'opacity-70')}>
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div>
                                            <p className={cn('font-semibold', status === 'paid' && 'line-through text-muted-foreground')}>{d.name}</p>
                                            {d.phone && <p className="text-xs text-muted-foreground">{d.phone}</p>}
                                        </div>
                                        {statusBadge(d)}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(d.id)}><Trash2 className="h-4 w-4" /></Button>
                                        {status !== 'paid' && (
                                            <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => { setPaymentDebt(d); setPaymentForm({ amount: '', date: today(), note: '' }); }}>
                                                <CreditCard className="h-3 w-3" /> دفعة
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedDebtId(expanded ? null : d.id)}>
                                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-sm mt-1">
                                    <span>المبلغ: <strong>{d.amount.toLocaleString()} ج.م</strong></span>
                                    {status !== 'paid' && <span className="text-destructive">الباقي: <strong>{remaining.toLocaleString()} ج.م</strong></span>}
                                    <span className="text-muted-foreground">{d.date}</span>
                                </div>
                                {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                            </CardHeader>

                            {expanded && (
                                <CardContent className="px-4 pb-4">
                                    <div className="border-t pt-3 mt-1">
                                        <p className="text-sm font-medium flex items-center gap-1 mb-3"><History className="h-4 w-4" /> سجل الدفعات</p>
                                        {dPayments.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">لا توجد دفعات مسجلة</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {dPayments.map(p => (
                                                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                                        <div>
                                                            <span className="font-medium text-green-600 dark:text-green-400">{p.amount.toLocaleString()} ج.م</span>
                                                            {p.note && <span className="text-muted-foreground ms-2">— {p.note}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">{p.date}</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeletePaymentId(p.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Add/Edit debt dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{editingDebt ? 'تعديل سجل الدين' : 'إضافة دين جديد'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>الاسم الكامل *</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الشخص" />
                        </div>
                        <div className="space-y-1">
                            <Label>رقم الهاتف</Label>
                            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="رقم الهاتف (اختياري)" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>المبلغ (ج.م) *</Label>
                                <Input type="number" min="0" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} placeholder="0" />
                            </div>
                            <div className="space-y-1">
                                <Label>تاريخ الدين *</Label>
                                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>ملاحظات</Label>
                            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية (اختياري)" rows={3} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
                        <Button onClick={handleSave}>{editingDebt ? 'حفظ التعديلات' : 'إضافة'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Record payment dialog */}
            <Dialog open={!!paymentDebt} onOpenChange={v => { if (!v) setPaymentDebt(null); }}>
                <DialogContent className="max-w-sm" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تسجيل دفعة — {paymentDebt?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">الباقي: <strong className="text-foreground">{paymentDebt ? getRemainingAmount(paymentDebt).toLocaleString() : 0} ج.م</strong></p>
                        <div className="space-y-1">
                            <Label>المبلغ المدفوع *</Label>
                            <Input type="number" min="0" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                        </div>
                        <div className="space-y-1">
                            <Label>تاريخ الدفع *</Label>
                            <Input type="date" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <Label>ملاحظة</Label>
                            <Input value={paymentForm.note} onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))} placeholder="مثال: دفع نقداً" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setPaymentDebt(null)}>إلغاء</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddPayment}>تسجيل الدفعة</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete debt confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من حذف هذا السجل؟ سيتم حذف جميع الدفعات المرتبطة به أيضاً.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete payment confirm */}
            <AlertDialog open={!!deletePaymentId} onOpenChange={v => { if (!v) setDeletePaymentId(null); }}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الدفعة</AlertDialogTitle>
                        <AlertDialogDescription>هل تريد حذف هذه الدفعة من السجل؟</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { if (deletePaymentId) { await deleteDebtPayment(deletePaymentId); setDeletePaymentId(null); } }}>حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

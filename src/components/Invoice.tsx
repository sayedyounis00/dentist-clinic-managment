import { useRef } from 'react';
import { Patient, Treatment, Payment, getPatientFinancials } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Stethoscope } from 'lucide-react';

interface Props {
  patient: Patient;
  treatments: Treatment[];
  payments: Payment[];
  onBack: () => void;
}

export default function Invoice({ patient, treatments, payments, onBack }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const fin = getPatientFinancials(patient.id, treatments, payments);
  const invoiceNum = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoiceNum}</title><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #1a1a2e; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
      .logo { display: flex; align-items: center; gap: 12px; }
      .logo-icon { width: 40px; height: 40px; background: #0d9488; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
      .clinic-name { font-size: 24px; font-weight: bold; color: #1a1a2e; }
      .invoice-title { font-size: 28px; font-weight: bold; color: #0d9488; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
      .meta-section { } .meta-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
      td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
      .totals { text-align: right; margin-top: 20px; }
      .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 6px 0; font-size: 14px; }
      .total-row.final { font-size: 18px; font-weight: bold; border-top: 2px solid #1a1a2e; padding-top: 10px; }
      .status { display: inline-block; padding: 4px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
      .status-paid { background: #d1fae5; color: #065f46; }
      .status-partial { background: #fef3c7; color: #92400e; }
      .status-unpaid { background: #fee2e2; color: #991b1b; }
      .status-overpaid { background: #dbeafe; color: #1e40af; }
      @media print { body { margin: 20px; } }
    </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 no-print">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="flex-1" />
        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
      </div>

      <div ref={invoiceRef} className="bg-card rounded-lg border p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-primary pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">DentalCare Clinic</h2>
              <p className="text-xs text-muted-foreground">Professional Dental Services</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-primary">INVOICE</h1>
            <p className="text-sm text-muted-foreground">{invoiceNum}</p>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Bill To</p>
            <p className="font-semibold">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{patient.phone}</p>
            <p className="text-sm text-muted-foreground">{patient.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase mb-1">Patient ID</p>
            <p className="font-semibold">{patient.id.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">DOB: {patient.dateOfBirth || 'N/A'}</p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Treatments</h3>
        <table className="w-full mb-6 text-sm">
          <thead><tr className="border-b-2 border-border"><th className="text-left py-2 text-muted-foreground text-xs uppercase">Date</th><th className="text-left py-2 text-muted-foreground text-xs uppercase">Description</th><th className="text-left py-2 text-muted-foreground text-xs uppercase">Tooth</th><th className="text-right py-2 text-muted-foreground text-xs uppercase">Cost</th></tr></thead>
          <tbody>
            {treatments.map(t => (<tr key={t.id} className="border-b border-border/50"><td className="py-2">{t.date}</td><td className="py-2">{t.description}</td><td className="py-2">{t.tooth || '—'}</td><td className="py-2 text-right">${t.cost.toLocaleString()}</td></tr>))}
          </tbody>
        </table>

        {payments.length > 0 && (
          <>
            <h3 className="font-semibold mb-2">Payments</h3>
            <table className="w-full mb-6 text-sm">
              <thead><tr className="border-b-2 border-border"><th className="text-left py-2 text-muted-foreground text-xs uppercase">Date</th><th className="text-left py-2 text-muted-foreground text-xs uppercase">Method</th><th className="text-right py-2 text-muted-foreground text-xs uppercase">Amount</th></tr></thead>
              <tbody>
                {payments.map(p => (<tr key={p.id} className="border-b border-border/50"><td className="py-2">{p.date}</td><td className="py-2 capitalize">{p.method}</td><td className="py-2 text-right">${p.amount.toLocaleString()}</td></tr>))}
              </tbody>
            </table>
          </>
        )}

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal:</span><span>${fin.totalCharged.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Paid:</span><span>-${fin.totalPaid.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-lg border-t-2 border-foreground pt-2"><span>Balance Due:</span><span>${fin.balance.toLocaleString()}</span></div>
            <div className="flex justify-end pt-1">
              <Badge variant={fin.status === 'Paid' ? 'default' : fin.status === 'Partial' ? 'secondary' : 'destructive'} className="text-sm">{fin.status}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

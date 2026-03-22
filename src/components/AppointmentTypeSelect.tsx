import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export default function AppointmentTypeSelect({ value, onValueChange, placeholder = "اختر نوع الموعد" }: Props) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
            <SelectContent>
                <SelectItem value="كشف">كشف</SelectItem>
                <SelectItem value="متابعة">متابعة</SelectItem>
                <SelectItem value="تنظيف">تنظيف</SelectItem>
                <SelectItem value="حشو">حشو</SelectItem>
                <SelectItem value="خلع">خلع</SelectItem>
                <SelectItem value="تقويم">تقويم</SelectItem>
                <SelectItem value="تركيبات">تركيبات</SelectItem>
                <SelectItem value="زراعة">زراعة</SelectItem>
                <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
        </Select>
    );
}

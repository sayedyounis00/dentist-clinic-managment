import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    value?: string;
    onChange?: (date: string) => void;
    className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
    const date = value ? parseISO(value) : undefined;
    const validDate = isValid(date) ? date : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-right font-normal",
                        !validDate && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {validDate ? format(validDate, "dd/MM/yy") : <span>اختر تاريخاً</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={validDate}
                    onSelect={(d) => {
                        if (d && onChange) {
                            // Format back to YYYY-MM-DD for value state
                            onChange(format(d, "yyyy-MM-dd"));
                        }
                    }}
                    initialFocus
                    locale={ar}
                />
            </PopoverContent>
        </Popover>
    );
}

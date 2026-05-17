"use client";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayInputValue } from "@/lib/inventaris/daily-inventory-utils";

type DailyInventoryDateControlProps = {
  selectedDate: string;
  isToday: boolean;
  onDateChange: (date: string) => void;
};

export function DailyInventoryDateControl({
  selectedDate,
  isToday,
  onDateChange,
}: DailyInventoryDateControlProps) {
  return (
    <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto sm:justify-end">
      <div className="w-full space-y-1 sm:w-auto">
        <Label
          htmlFor="daily-inventory-date"
          className="flex items-center gap-1.5 text-xs font-bold text-primary/80"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Pilih Tanggal
        </Label>
        <Input
          id="daily-inventory-date"
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="h-10 w-full border-border bg-primary-foreground shadow-sm sm:w-44"
        />
      </div>
      {!isToday && (
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-full bg-primary-foreground sm:w-auto"
          onClick={() => onDateChange(todayInputValue())}
        >
          Hari Ini
        </Button>
      )}
    </div>
  );
}

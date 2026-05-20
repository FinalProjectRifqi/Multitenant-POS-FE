"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TransactionHistoryPaymentMethod,
  TransactionHistorySortBy,
} from "@/lib/orders/types";
import type { TransactionHistoryFilters } from "@/lib/transactions/use-transaction-history-page";

const ALL_VALUE = "__all__";

const SORT_BY_OPTIONS: Array<{
  value: TransactionHistorySortBy;
  label: string;
}> = [
  { value: "ordered_at", label: "Tanggal dipesan" },
  { value: "completed_at", label: "Tanggal selesai" },
  { value: "total_amount", label: "Total transaksi" },
  { value: "customer_name", label: "Nama pelanggan" },
  { value: "payment_status", label: "Status pembayaran" },
];

type TransactionHistoryFiltersProps = {
  filters: TransactionHistoryFilters;
  onChange: (next: Partial<TransactionHistoryFilters>) => void;
  onReset: () => void;
};

export function TransactionHistoryFilters({
  filters,
  onChange,
  onReset,
}: TransactionHistoryFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-1.5">
        <Label>Dari Tanggal</Label>
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(event) => onChange({ dateFrom: event.target.value || undefined })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Sampai Tanggal</Label>
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(event) => onChange({ dateTo: event.target.value || undefined })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Metode Bayar</Label>
        <Select
          value={filters.paymentMethod ?? ALL_VALUE}
          onValueChange={(value) =>
            onChange({
              paymentMethod:
                value === ALL_VALUE
                  ? undefined
                  : (value as TransactionHistoryPaymentMethod),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua metode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Semua metode</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="cashless">Cashless</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Urutkan</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onChange({ sortBy: value as TransactionHistorySortBy })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_BY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}

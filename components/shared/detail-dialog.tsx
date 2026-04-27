"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export type DetailFieldDef<T> = {
  label: string;
  /**
   * Derive the display value from the data object.
   * Return a string for plain text, or ReactNode for custom rendering
   * (e.g. status badges, links, formatted dates).
   */
  render: (data: T) => ReactNode;
  /** Extra className applied to the value element */
  valueClassName?: string | ((data: T) => string);
};

type DetailDialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T | null;
  title: string;
  description?: string;
  fields: DetailFieldDef<T>[];
  /** Optional footer slot — e.g. Edit / Delete action buttons */
  footer?: (data: T) => ReactNode;
};

// ── DetailField (internal) ─────────────────────────────────────────────────────

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

function DetailField({ label, value, valueClassName }: DetailFieldProps) {
  return (
    <div className="space-y-1 border-b border-border/60 pb-4 last:border-0 last:pb-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div
        className={cn(
          "text-base font-semibold text-foreground",
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ── DetailDialog ───────────────────────────────────────────────────────────────

export function DetailDialog<T>({
  open,
  onOpenChange,
  data,
  title,
  description,
  fields,
  footer,
}: DetailDialogProps<T>) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,480px)] bg-primary-foreground p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {fields.map((field) => {
            const valueClassName =
              typeof field.valueClassName === "function"
                ? field.valueClassName(data)
                : field.valueClassName;

            return (
              <DetailField
                key={field.label}
                label={field.label}
                value={field.render(data)}
                valueClassName={valueClassName}
              />
            );
          })}
        </div>

        {footer && (
          <div className="mt-4 flex justify-end gap-2 border-t border-border/60 pt-4">
            {footer(data)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

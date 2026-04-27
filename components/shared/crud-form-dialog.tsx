"use client";

import { Loader2 } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CrudFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPending: boolean;
  errorMessage?: string | null;
  submitLabel: string;
  submitPendingLabel?: string;
  cancelLabel?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  contentClassName?: string;
  formClassName?: string;
};

export function CrudFormDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending,
  errorMessage,
  submitLabel,
  submitPendingLabel = "Menyimpan...",
  cancelLabel = "Batalkan",
  onSubmit,
  children,
  contentClassName,
  formClassName,
}: CrudFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <DialogContent
        className={cn(
          "w-[min(92vw,480px)] bg-primary-foreground p-4",
          contentClassName,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className={cn("space-y-3", formClassName)} onSubmit={onSubmit}>
          {children}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {submitPendingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

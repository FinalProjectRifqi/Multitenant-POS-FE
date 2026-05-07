"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserCredentialsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: {
    user_name: string;
    password?: string;
  } | null;
};

export function UserCredentialsDialog({
  open,
  onOpenChange,
  credentials,
}: UserCredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<
    "user_name" | "password" | null
  >(null);

  if (!credentials) return null;

  const handleCopy = async (field: "user_name" | "password", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(
        `${field === "user_name" ? "Username" : "Password"} berhasil disalin`,
        {
          description: "Teks telah disalin ke clipboard.",
          position: "top-right",
          richColors: true,
          duration: 3000,
        },
      );
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Gagal menyalin ke clipboard", {
        description: "Pastikan Anda memberi izin akses clipboard.",
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salin Username dan Password</DialogTitle>
          <DialogDescription>
            Untuk melanjutkan login sebagai Pengguna Baru
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="copy-username">Username</Label>
            <div className="relative">
              <Input
                id="copy-username"
                readOnly
                value={credentials.user_name}
                className="pr-10"
              />
              <Button
                type="Button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 hover:bg-muted"
                onClick={() => handleCopy("user_name", credentials.user_name)}
              >
                {copiedField === "user_name" ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" />
                )}
                <span className="sr-only">Copy username</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="copy-password">Password</Label>
            <div className="relative">
              <Input
                id="copy-password"
                readOnly
                value={credentials.password ?? ""}
                className="pr-10"
              />
              <Button
                type="Button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 hover:bg-muted"
                onClick={() =>
                  handleCopy("password", credentials.password ?? "")
                }
              >
                {copiedField === "password" ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" />
                )}
                <span className="sr-only">Copy password</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

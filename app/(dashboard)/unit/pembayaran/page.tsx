"use client";

import { CreditCard, Banknote, Smartphone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const PAYMENT_METHODS = [
  { id: "cash", label: "Tunai", icon: Banknote },
  { id: "qris", label: "QRIS", icon: Smartphone },
  { id: "card", label: "Kartu Debit", icon: CreditCard },
];

export default function ProsesPembayaranPage() {
  const [selected, setSelected] = useState("cash");
  const [done, setDone] = useState(false);
  const total = 132000;

  if (done) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Pembayaran Berhasil!
          </h2>
          <p className="text-muted-foreground">
            Total {formatRupiah(total)} telah diterima.
          </p>
          <Button
            onClick={() => setDone(false)}
            className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Transaksi Baru
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Proses Pembayaran"
        description="Pilih metode pembayaran & konfirmasi transaksi"
      />

      <div className="max-w-lg space-y-6">
        {/* Order summary */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Ringkasan Pesanan</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Pizza Margherita</span>
              <span>{formatRupiah(65000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ayam Bakar</span>
              <span>{formatRupiah(45000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Coca-Cola</span>
              <span>{formatRupiah(15000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jus Jeruk</span>
              <span>{formatRupiah(7000)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary text-lg">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Metode Pembayaran</h2>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setSelected(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selected === id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${selected === id ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-xs font-semibold ${selected === id ? "text-primary" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setDone(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <CreditCard className="w-4 h-4" /> Konfirmasi Pembayaran{" "}
          {formatRupiah(total)}
        </Button>
      </div>
    </div>
  );
}

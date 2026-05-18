import type { Metadata } from "next";

import { TransactionHistoryPageContent } from "@/components/transactions/transaction-history-page-content";

export const metadata: Metadata = {
  title: "Riwayat Transaksi | XYZ POS",
};

export default function RiwayatTransaksiPage() {
  return <TransactionHistoryPageContent />;
}

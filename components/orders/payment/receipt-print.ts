import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import type { PaymentMethod } from "./order-payment-constants";
import { formatRupiah, getMethodLabel } from "./order-payment-utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PrintReceiptParams {
  detail: OrderDetail | undefined;
  source: OrderDetail | OrderListItem;
  method: PaymentMethod;
  reference?: string;
  paidAmount?: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── CSS ───────────────────────────────────────────────────────────────────────

const PRINT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    margin: 0;
    size: 80mm auto;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .no-print { display: none !important; }
  }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #FFFCF9;
    color: #1A1412;
    width: 80mm;
    padding: 0;
    margin: 0 auto;
    font-size: 12px;
    line-height: 1.4;
  }

  .receipt {
    padding: 16px 20px 20px;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    margin-bottom: 12px;
  }
  .header .brand-mark {
    width: 32px;
    height: 32px;
    background: #1A1412;
    color: #FFFCF9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 14px;
    margin: 0 auto 6px;
    letter-spacing: -0.02em;
  }
  .header h1 {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #1A1412;
    margin-bottom: 2px;
  }
  .header p {
    font-size: 11px;
    color: #666;
    line-height: 1.5;
  }

  /* ── Dashed separator ── */
  .divider {
    position: relative;
    height: 1px;
    margin: 10px 0;
    border: 0;
    border-top: 1px dashed #ccc;
  }
  .divider-dots {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
  }
  .divider-dots::before,
  .divider-dots::after {
    content: '';
    flex: 1;
    height: 0;
    border-top: 1px dashed #ccc;
  }
  .divider-dots .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ccc;
    flex-shrink: 0;
  }

  /* ── Meta ── */
  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-bottom: 2px;
  }
  .meta .left { color: #666; }
  .meta .right { text-align: right; font-weight: 600; }
  .meta .right .ref { font-family: 'Courier New', monospace; letter-spacing: 0.05em; }
  .meta .right .highlight { color: #49111C; }

  .customer-line {
    font-size: 11px;
    color: #666;
    margin-top: 6px;
  }
  .customer-line strong { color: #1A1412; }
  .notes-line {
    font-size: 11px;
    font-style: italic;
    color: #666;
    margin-top: 2px;
  }

  /* ── Items table ── */
  .items-table {
    width: 100%;
    margin: 2px 0;
  }
  .items-table th {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #999;
    text-align: left;
    padding-bottom: 6px;
  }
  .items-table th:last-child { text-align: right; }
  .items-table td {
    font-size: 12px;
    padding: 4px 0;
    vertical-align: top;
  }
  .items-table .item-row td {
    padding-top: 6px;
  }
  .items-table .item-row + .item-row td {
    border-top: 1px dashed #eee;
    padding-top: 6px;
  }
  .items-table .qty {
    font-weight: 700;
    color: #49111C;
    width: 30px;
  }
  .items-table .name-col { padding-left: 4px; }
  .items-table .name {
    font-weight: 600;
    color: #1A1412;
  }
  .items-table .item-notes {
    font-size: 10px;
    font-style: italic;
    color: #999;
  }
  .items-table .unit-price {
    font-size: 10px;
    color: #999;
  }
  .items-table .price-col {
    text-align: right;
    font-weight: 700;
    color: #1A1412;
    white-space: nowrap;
    width: 70px;
  }

  /* ── Totals ── */
  .totals {
    margin-top: 4px;
  }
  .totals .line {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 2px 0;
  }
  .totals .line .label { color: #666; }

  .total-box {
    margin-top: 8px;
    padding: 10px 14px;
    background: #F5EFEA;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .total-box .label {
    font-size: 16px;
    font-weight: 900;
    color: #1A1412;
  }
  .total-box .value {
    font-size: 18px;
    font-weight: 900;
    color: #49111C;
  }

  /* ── Payment details ── */
  .payment {
    margin-top: 8px;
  }
  .payment .line {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 2px 0;
  }
  .payment .line .label { color: #666; }
  .payment .change-box {
    display: flex;
    justify-content: space-between;
    background: #ECFDF5;
    padding: 6px 10px;
    border-radius: 4px;
    margin-top: 4px;
    font-weight: 700;
    color: #047857;
  }

  /* ── QR ── */
  .qr-section {
    text-align: center;
    margin-top: 10px;
  }
  .qr-grid {
    display: inline-grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    padding: 6px;
    background: #F5EFEA;
    border-radius: 8px;
    width: 64px;
    height: 64px;
  }
  .qr-grid .cell {
    border-radius: 1px;
  }
  .qr-grid .cell.fill { background: #49111C; }
  .qr-label {
    font-size: 10px;
    color: #999;
    margin-top: 4px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
  }
  .footer .thanks {
    font-size: 13px;
    font-weight: 600;
    color: #1A1412;
  }
  .footer .sub {
    font-size: 11px;
    color: #666;
    margin-top: 1px;
  }
  .footer .legal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #bbb;
  }
  .footer .legal .star { color: #ccc; }

  .print-button {
    text-align: center;
    margin: 16px 0;
  }
  .print-button button {
    background: #1A1412;
    color: #FFFCF9;
    border: none;
    border-radius: 8px;
    padding: 10px 32px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .print-button button:hover { opacity: 0.9; }
`;

// ─── HTML Builder ──────────────────────────────────────────────────────────────

function buildReceiptHtml(params: PrintReceiptParams): string {
  const { detail, source, method, reference, paidAmount } = params;

  const subtotal =
    detail?.subtotal ?? Math.round((source.total_amount ?? 0) / 1.1);
  const taxAmount = detail?.tax_amount ?? source.total_amount - subtotal;
  const totalAmount = source.total_amount;
  const now = new Date();
  const isCash = method === "cash";
  const hasChange = isCash && paidAmount != null && paidAmount > totalAmount;
  const changeAmount = hasChange ? paidAmount! - totalAmount : 0;
  const methodLabel = getMethodLabel(method);

  const itemsHtml = (detail?.items ?? [])
    .map(
      (item) => `
        <tr class="item-row">
          <td class="qty">${item.quantity}x</td>
          <td class="name-col">
            <div class="name">${escapeHtml(item.menu_item_name)}</div>
            ${item.notes ? `<div class="item-notes">${escapeHtml(item.notes)}</div>` : ""}
            <div class="unit-price">@ ${formatRupiah(item.item_price)}</div>
          </td>
          <td class="price-col">${formatRupiah(item.subtotal)}</td>
        </tr>`,
    )
    .join("");

  const changeHtml = hasChange
    ? `
      <div class="line">
        <span class="label">Dibayar</span>
        <span>${formatRupiah(paidAmount!)}</span>
      </div>
      <div class="change-box">
        <span>Kembalian</span>
        <span>${formatRupiah(changeAmount)}</span>
      </div>`
    : "";

  const qrSquares = Array.from({ length: 16 })
    .map((_, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const isCorner =
        (row === 0 && col === 0) ||
        (row === 0 && col === 3) ||
        (row === 3 && col === 0);
      const isFill = isCorner || (row + col) % 2 === 0;
      return `<span class="cell${isFill ? " fill" : ""}"></span>`;
    })
    .join("");

  // Build the full HTML document
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=80mm">
  <title>Struk Pembayaran - ${source.order_number}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body onload="window.print()">
  <div class="receipt">

    <!-- Header -->
    <div class="header">
      <div class="brand-mark">P</div>
      <h1>POS KITCHEN</h1>
      <p>Jl. Sudirman No. 1<br>Jakarta Pusat, 10210</p>
      <p>Telp: (021) 555-0100</p>
    </div>

    <hr class="divider">

    <!-- Meta -->
    <div class="meta">
      <div class="left">
        <div>${formatDate(now)}</div>
        <div>No. Ref</div>
        ${source.table_number ? "<div>Meja</div>" : ""}
      </div>
      <div class="right">
        <div class="highlight">${formatTime(now)}</div>
        <div class="ref">${escapeHtml(reference ?? source.order_number)}</div>
        ${source.table_number ? `<div class="highlight">#${escapeHtml(source.table_number)}</div>` : ""}
      </div>
    </div>

    ${source.customer_name ? `<div class="customer-line"><strong>Pelanggan:</strong> ${escapeHtml(source.customer_name)}</div>` : ""}
    ${detail?.notes ? `<div class="notes-line">“${escapeHtml(detail.notes)}”</div>` : ""}

    <hr class="divider">

    <!-- Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Qty</th>
          <th>Item</th>
          <th>Harga</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <hr class="divider">

    <!-- Totals -->
    <div class="totals">
      <div class="line">
        <span class="label">Subtotal</span>
        <span>${formatRupiah(subtotal)}</span>
      </div>
      <div class="line">
        <span class="label">Pajak (10%)</span>
        <span>${formatRupiah(taxAmount)}</span>
      </div>
    </div>

    <div class="total-box">
      <span class="label">TOTAL</span>
      <span class="value">${formatRupiah(totalAmount)}</span>
    </div>

    <!-- Payment -->
    <div class="payment">
      <div class="line">
        <span class="label">Metode Bayar</span>
        <span>${methodLabel}</span>
      </div>
      ${changeHtml}
    </div>

    <hr class="divider">

    <!-- QR -->
    <div class="qr-section">
      <div class="qr-grid">
        ${qrSquares}
      </div>
      <div class="qr-label">Scan untuk struk digital</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thanks">Terima kasih telah mempercayai kami</div>
      <div class="sub">Selamat menikmati hidangan Anda</div>
      <div class="legal">
        <span class="star">✦</span>
        <span>Struk ini adalah bukti pembayaran sah</span>
        <span class="star">✦</span>
      </div>
    </div>

  </div>

  <div class="print-button no-print">
    <button onclick="window.print()">Cetak Struk</button>
  </div>
</body>
</html>`;
}

// ─── Escape HTML to prevent XSS ────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

// ─── Print Function ────────────────────────────────────────────────────────────

/**
 * Opens a clean thermal-receipt print preview in a new window.
 * The receipt auto-triggers the print dialog on load.
 */
export function printReceipt(params: PrintReceiptParams): void {
  const html = buildReceiptHtml(params);

  const printWindow = window.open("", "_blank", "width=400,height=600");

  if (!printWindow) {
    // Fallback: if popup blocked, try printing via an iframe in the current page
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "80mm";
    iframe.style.height = "0";
    document.body.appendChild(iframe);

    const iframeDoc =
      iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Wait for fonts/content to render, then print
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
        } catch {
          // Silent fallback
        }
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

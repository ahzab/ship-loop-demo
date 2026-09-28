export interface LineItem {
  description: string;
  quantity: number;
  /** Unit price in cents, to keep money out of floating point. */
  unitCents: number;
}

export interface Invoice {
  number: string;
  customer: string;
  items: LineItem[];
  /** Tax rate as a fraction, e.g. 0.2 for 20%. */
  taxRate: number;
}

export function subtotalCents(inv: Invoice): number {
  return inv.items.reduce((sum, i) => sum + i.quantity * i.unitCents, 0);
}

export function taxCents(inv: Invoice): number {
  return Math.round(subtotalCents(inv) * inv.taxRate);
}

export function totalCents(inv: Invoice): number {
  return subtotalCents(inv) + taxCents(inv);
}

export function formatCents(cents: number, currency = "EUR", locale = "en-IE"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

/** Plain decimal with two places, e.g. 12000 -> "120.00". Integer maths only. */
function decimalCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Quote a field per RFC 4180 when it contains a comma, quote, CR or LF. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Invoice as RFC 4180 CSV (CRLF line breaks), ending with subtotal, tax and total rows. */
export function toCsv(inv: Invoice): string {
  const rows = [
    ["description", "quantity", "unit", "line_total"],
    ...inv.items.map((i) => [
      csvField(i.description),
      String(i.quantity),
      decimalCents(i.unitCents),
      decimalCents(i.quantity * i.unitCents),
    ]),
    ["subtotal", "", "", decimalCents(subtotalCents(inv))],
    ["tax", "", "", decimalCents(taxCents(inv))],
    ["total", "", "", decimalCents(totalCents(inv))],
  ];
  return rows.map((r) => r.join(",")).join("\r\n") + "\r\n";
}

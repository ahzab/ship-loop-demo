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

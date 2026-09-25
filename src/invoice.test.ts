import { describe, expect, it } from "vitest";
import { formatCents, subtotalCents, taxCents, totalCents, type Invoice } from "./invoice.js";

const inv: Invoice = {
  number: "INV-001",
  customer: "Acme",
  taxRate: 0.2,
  items: [
    { description: "Design", quantity: 3, unitCents: 12_000 },
    { description: "Hosting", quantity: 1, unitCents: 2_550 },
  ],
};

describe("invoice totals", () => {
  it("adds line items", () => expect(subtotalCents(inv)).toBe(38_550));
  it("rounds tax to the cent", () => expect(taxCents(inv)).toBe(7_710));
  it("totals subtotal and tax", () => expect(totalCents(inv)).toBe(46_260));
  it("formats money", () => expect(formatCents(46_260)).toBe("€462.60"));
});

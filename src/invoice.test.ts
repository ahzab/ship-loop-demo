import { describe, expect, it } from "vitest";
import { formatCents, subtotalCents, taxCents, toCsv, totalCents, type Invoice } from "./invoice.js";

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

describe("toCsv", () => {
  const lines = (csv: string) => csv.split("\r\n");

  it("writes a header and one row per line item with plain decimals", () => {
    expect(lines(toCsv(inv)).slice(0, 3)).toEqual([
      "description,quantity,unit,line_total",
      "Design,3,120.00,360.00",
      "Hosting,1,25.50,25.50",
    ]);
  });

  it("ends with subtotal, tax and total rows in line_total", () => {
    expect(lines(toCsv(inv)).slice(-4)).toEqual([
      "subtotal,,,385.50",
      "tax,,,77.10",
      "total,,,462.60",
      "",
    ]);
  });

  it("formats sub-unit and negative amounts", () => {
    const csv = toCsv({ ...inv, taxRate: 0, items: [{ description: "Refund", quantity: 1, unitCents: -5 }] });
    expect(lines(csv)[1]).toBe("Refund,1,-0.05,-0.05");
  });

  it("escapes commas, quotes and newlines per RFC 4180", () => {
    const csv = toCsv({
      ...inv,
      items: [
        { description: "Design, round 2", quantity: 1, unitCents: 100 },
        { description: 'The "big" one', quantity: 1, unitCents: 100 },
        { description: "Line one\nline two", quantity: 1, unitCents: 100 },
        { description: "Plain", quantity: 1, unitCents: 100 },
      ],
    });
    expect(csv).toContain('\r\n"Design, round 2",1,1.00,1.00\r\n');
    expect(csv).toContain('\r\n"The ""big"" one",1,1.00,1.00\r\n');
    expect(csv).toContain('\r\n"Line one\nline two",1,1.00,1.00\r\n');
    expect(csv).toContain("\r\nPlain,1,1.00,1.00\r\n");
  });
});

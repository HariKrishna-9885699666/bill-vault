import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatBytes } from "@/utils/formatters";

describe("formatCurrency", () => {
  it("formats INR by default", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1,000");
  });

  it("formats USD", () => {
    const result = formatCurrency(50.5, "USD");
    expect(result).toMatch(/50/);
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats decimal amounts", () => {
    const result = formatCurrency(99.99, "INR");
    expect(result).toContain("99");
  });

  it("falls back gracefully for invalid currency code", () => {
    const result = formatCurrency(100, "INVALID");
    expect(result).toBe("INVALID 100.00");
  });

  it("formats large amounts with separators", () => {
    const result = formatCurrency(1_00_000, "INR");
    expect(result).toMatch(/1,00,000|100,000/);
  });
});

describe("formatDate", () => {
  it("formats ISO date to default display format", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBe("Jan 15, 2024");
  });

  it("formats with custom format string", () => {
    const result = formatDate("2024-06-30", "dd/MM/yyyy");
    expect(result).toBe("30/06/2024");
  });

  it("formats with year-only format", () => {
    const result = formatDate("2023-03-10", "yyyy");
    expect(result).toBe("2023");
  });

  it("returns the raw input for an unparseable date", () => {
    const result = formatDate("not-a-date");
    expect(result).toBe("not-a-date");
  });

  it("handles empty string gracefully", () => {
    const result = formatDate("");
    expect(typeof result).toBe("string");
  });
});

describe("formatBytes", () => {
  it("formats values below 1 KB as bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats values in the KB range", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats values in the MB range", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });

  it("formats 10 MB correctly (max attachment size)", () => {
    expect(formatBytes(10 * 1024 * 1024)).toBe("10.0 MB");
  });
});

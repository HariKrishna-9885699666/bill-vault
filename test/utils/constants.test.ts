import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  CATEGORY_MAP,
  PAYMENT_METHODS,
  CURRENCIES,
  MAX_FILES_PER_BILL,
  MAX_FILE_SIZE_BYTES,
  DRIVE_ROOT_FOLDER,
} from "@/utils/constants";

describe("CATEGORIES", () => {
  it("has exactly 16 categories", () => {
    expect(CATEGORIES).toHaveLength(16);
  });

  it("all category ids are unique", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each category has id, label, icon, and token", () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(typeof cat.icon).toBe("function");
      expect(cat.token).toBeTruthy();
    }
  });

  it("contains expected category types", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(ids).toContain("medical");
    expect(ids).toContain("groceries");
    expect(ids).toContain("miscellaneous");
  });
});

describe("CATEGORY_MAP", () => {
  it("has one entry per category", () => {
    expect(Object.keys(CATEGORY_MAP)).toHaveLength(16);
  });

  it("maps medical category correctly", () => {
    expect(CATEGORY_MAP.medical.label).toBe("Medical & Healthcare");
    expect(CATEGORY_MAP.medical.id).toBe("medical");
  });

  it("maps groceries category correctly", () => {
    expect(CATEGORY_MAP.groceries.label).toBe("Groceries");
  });

  it("maps miscellaneous as last category", () => {
    expect(CATEGORY_MAP.miscellaneous.label).toBe("Miscellaneous");
  });

  it("every CATEGORIES entry is in CATEGORY_MAP", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_MAP[cat.id]).toBeDefined();
      expect(CATEGORY_MAP[cat.id]).toStrictEqual(cat);
    }
  });
});

describe("PAYMENT_METHODS", () => {
  it("has exactly 7 payment methods", () => {
    expect(PAYMENT_METHODS).toHaveLength(7);
  });

  it("all payment method ids are unique", () => {
    const ids = PAYMENT_METHODS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes all common payment types", () => {
    const ids = PAYMENT_METHODS.map((m) => m.id);
    expect(ids).toContain("cash");
    expect(ids).toContain("upi");
    expect(ids).toContain("credit_card");
    expect(ids).toContain("debit_card");
    expect(ids).toContain("net_banking");
    expect(ids).toContain("wallet");
    expect(ids).toContain("cheque");
  });

  it("each payment method has a label", () => {
    for (const method of PAYMENT_METHODS) {
      expect(method.label).toBeTruthy();
    }
  });
});

describe("CURRENCIES", () => {
  it("has 4 supported currencies", () => {
    expect(CURRENCIES).toHaveLength(4);
  });

  it("INR is the default (first) currency", () => {
    expect(CURRENCIES[0]).toBe("INR");
  });

  it("includes USD, EUR, and GBP", () => {
    expect(CURRENCIES).toContain("USD");
    expect(CURRENCIES).toContain("EUR");
    expect(CURRENCIES).toContain("GBP");
  });
});

describe("file upload constraints", () => {
  it("MAX_FILES_PER_BILL is 5", () => {
    expect(MAX_FILES_PER_BILL).toBe(5);
  });

  it("MAX_FILE_SIZE_BYTES is exactly 10 MB", () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });
});

describe("DRIVE_ROOT_FOLDER", () => {
  it("is BillVault", () => {
    expect(DRIVE_ROOT_FOLDER).toBe("BillVault");
  });
});

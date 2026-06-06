import { describe, it, expect } from "vitest";
import type { Bill, Attachment, CategoryType, PaymentMethod } from "@/types";

// Type-level tests — these verify the shape of the interfaces at compile time
// and confirm that valid objects can be constructed without TypeScript errors.

function makeBill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "test-id",
    title: "Sample Bill",
    category: "groceries",
    amount: 250,
    currency: "INR",
    date: "2024-03-10",
    attachments: [],
    createdAt: "2024-03-10T10:00:00.000Z",
    updatedAt: "2024-03-10T10:00:00.000Z",
    ...overrides,
  };
}

function makeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: "att-1",
    fileName: "receipt.jpg",
    mimeType: "image/jpeg",
    size: 102400,
    ...overrides,
  };
}

describe("Bill interface", () => {
  it("constructs a valid minimal bill", () => {
    const bill = makeBill();
    expect(bill.id).toBe("test-id");
    expect(bill.attachments).toEqual([]);
  });

  it("accepts all optional fields", () => {
    const bill = makeBill({
      vendor: "BigBasket",
      paymentMethod: "upi",
      notes: "Weekly groceries",
      tags: ["household", "weekly"],
    });
    expect(bill.vendor).toBe("BigBasket");
    expect(bill.paymentMethod).toBe("upi");
    expect(bill.tags).toHaveLength(2);
  });

  it("stores attachments correctly", () => {
    const att = makeAttachment();
    const bill = makeBill({ attachments: [att] });
    expect(bill.attachments).toHaveLength(1);
    expect(bill.attachments[0].fileName).toBe("receipt.jpg");
  });
});

describe("Attachment interface", () => {
  it("constructs a minimal attachment", () => {
    const att = makeAttachment();
    expect(att.id).toBe("att-1");
    expect(att.size).toBe(102400);
  });

  it("accepts Drive metadata when present", () => {
    const att = makeAttachment({
      driveFileId: "drive-123",
      driveUrl: "https://drive.google.com/file/d/drive-123/view",
      thumbnailUrl: "https://drive.google.com/thumbnail?id=drive-123&sz=w400",
    });
    expect(att.driveFileId).toBe("drive-123");
    expect(att.thumbnailUrl).toContain("drive-123");
  });

  it("accepts IndexedDB blob flag", () => {
    const att = makeAttachment({ hasLocalBlob: true });
    expect(att.hasLocalBlob).toBe(true);
  });
});

describe("CategoryType values", () => {
  it("accepts all 16 valid category strings", () => {
    const cats: CategoryType[] = [
      "medical",
      "groceries",
      "entertainment",
      "utilities",
      "rent",
      "transportation",
      "dining",
      "shopping",
      "education",
      "insurance",
      "travel",
      "electronics",
      "home_furniture",
      "personal_care",
      "taxes",
      "miscellaneous",
    ];
    expect(cats).toHaveLength(16);
    cats.forEach((c) => expect(typeof c).toBe("string"));
  });
});

describe("PaymentMethod values", () => {
  it("accepts all 7 valid payment method strings", () => {
    const methods: PaymentMethod[] = [
      "cash",
      "upi",
      "credit_card",
      "debit_card",
      "net_banking",
      "wallet",
      "cheque",
    ];
    expect(methods).toHaveLength(7);
    methods.forEach((m) => expect(typeof m).toBe("string"));
  });
});

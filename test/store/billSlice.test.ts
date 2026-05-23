import { describe, it, expect } from "vitest";
import billReducer, { addBill, updateBill, deleteBill } from "@/store/billSlice";
import type { Bill } from "@/types";

function makeBill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "bill-1",
    title: "Test Bill",
    category: "groceries",
    amount: 100,
    currency: "INR",
    date: "2024-01-15",
    attachments: [],
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
    ...overrides,
  };
}

const empty = { items: [] };

describe("billSlice", () => {
  it("returns the initial state when called with undefined", () => {
    expect(billReducer(undefined, { type: "@@INIT" })).toEqual(empty);
  });

  describe("addBill", () => {
    it("inserts the bill at the start of the list", () => {
      const bill = makeBill();
      const state = billReducer(empty, addBill(bill));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(bill);
    });

    it("prepends so the newest bill appears first", () => {
      const first = makeBill({ id: "a" });
      const second = makeBill({ id: "b" });
      let state = billReducer(empty, addBill(first));
      state = billReducer(state, addBill(second));
      expect(state.items[0].id).toBe("b");
      expect(state.items[1].id).toBe("a");
    });

    it("stores all bill fields without modification", () => {
      const bill = makeBill({
        id: "full",
        title: "Apollo Pharmacy",
        category: "medical",
        amount: 450.75,
        currency: "INR",
        vendor: "Apollo",
        paymentMethod: "upi",
        notes: "Monthly medicines",
        tags: ["health", "regular"],
      });
      const state = billReducer(empty, addBill(bill));
      expect(state.items[0]).toEqual(bill);
    });
  });

  describe("updateBill", () => {
    it("replaces the matching bill in-place", () => {
      const original = makeBill({ id: "x", title: "Old title" });
      let state = billReducer(empty, addBill(original));
      const updated = { ...original, title: "New title", amount: 999 };
      state = billReducer(state, updateBill(updated));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].title).toBe("New title");
      expect(state.items[0].amount).toBe(999);
    });

    it("does nothing when the id is not found", () => {
      const existing = makeBill({ id: "exists" });
      let state = billReducer(empty, addBill(existing));
      state = billReducer(state, updateBill(makeBill({ id: "ghost" })));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe("exists");
    });

    it("preserves position of other items when updating one", () => {
      const a = makeBill({ id: "a" });
      const b = makeBill({ id: "b" });
      const c = makeBill({ id: "c" });
      let state = billReducer(empty, addBill(a));
      state = billReducer(state, addBill(b));
      state = billReducer(state, addBill(c));
      // items order is [c, b, a] after prepending
      state = billReducer(state, updateBill({ ...b, title: "Updated B" }));
      expect(state.items[0].id).toBe("c");
      expect(state.items[1].title).toBe("Updated B");
      expect(state.items[2].id).toBe("a");
    });
  });

  describe("deleteBill", () => {
    it("removes the bill with the given id", () => {
      const bill = makeBill({ id: "del-me" });
      let state = billReducer(empty, addBill(bill));
      state = billReducer(state, deleteBill("del-me"));
      expect(state.items).toHaveLength(0);
    });

    it("leaves other bills untouched", () => {
      const keep = makeBill({ id: "keep" });
      const remove = makeBill({ id: "remove" });
      let state = billReducer(empty, addBill(keep));
      state = billReducer(state, addBill(remove));
      state = billReducer(state, deleteBill("remove"));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe("keep");
    });

    it("is a no-op when the id does not exist", () => {
      const bill = makeBill({ id: "present" });
      let state = billReducer(empty, addBill(bill));
      state = billReducer(state, deleteBill("absent"));
      expect(state.items).toHaveLength(1);
    });

    it("removes the correct bill when multiple exist", () => {
      const bills = ["a", "b", "c"].map((id) => makeBill({ id }));
      let state = bills.reduce((s, b) => billReducer(s, addBill(b)), empty);
      state = billReducer(state, deleteBill("b"));
      const ids = state.items.map((b) => b.id);
      expect(ids).not.toContain("b");
      expect(ids).toContain("a");
      expect(ids).toContain("c");
    });
  });
});

import { describe, it, expect } from "vitest";
import uiReducer, { toggleTheme, setViewMode, setFilters, resetFilters } from "@/store/uiSlice";

const initial = {
  theme: "light" as const,
  viewMode: "grid" as const,
  filters: {
    search: "",
    category: "all" as const,
    paymentMethod: "all" as const,
  },
};

describe("uiSlice", () => {
  it("returns the default initial state", () => {
    const state = uiReducer(undefined, { type: "@@INIT" });
    expect(state.theme).toBe("light");
    expect(state.viewMode).toBe("grid");
    expect(state.filters.search).toBe("");
    expect(state.filters.category).toBe("all");
    expect(state.filters.paymentMethod).toBe("all");
  });

  describe("toggleTheme", () => {
    it("switches light → dark", () => {
      const state = uiReducer(initial, toggleTheme());
      expect(state.theme).toBe("dark");
    });

    it("switches dark → light", () => {
      const dark = { ...initial, theme: "dark" as const };
      const state = uiReducer(dark, toggleTheme());
      expect(state.theme).toBe("light");
    });

    it("is idempotent over two toggles", () => {
      let state = uiReducer(initial, toggleTheme());
      state = uiReducer(state, toggleTheme());
      expect(state.theme).toBe("light");
    });
  });

  describe("setViewMode", () => {
    it("sets view mode to list", () => {
      const state = uiReducer(initial, setViewMode("list"));
      expect(state.viewMode).toBe("list");
    });

    it("sets view mode back to grid", () => {
      const listState = { ...initial, viewMode: "list" as const };
      const state = uiReducer(listState, setViewMode("grid"));
      expect(state.viewMode).toBe("grid");
    });

    it("does not touch other state slices", () => {
      const state = uiReducer(initial, setViewMode("list"));
      expect(state.theme).toBe("light");
      expect(state.filters).toEqual(initial.filters);
    });
  });

  describe("setFilters", () => {
    it("merges a partial search update", () => {
      const state = uiReducer(initial, setFilters({ search: "grocery" }));
      expect(state.filters.search).toBe("grocery");
      expect(state.filters.category).toBe("all");
    });

    it("sets the category filter", () => {
      const state = uiReducer(initial, setFilters({ category: "medical" }));
      expect(state.filters.category).toBe("medical");
      expect(state.filters.search).toBe("");
    });

    it("sets the payment method filter", () => {
      const state = uiReducer(initial, setFilters({ paymentMethod: "upi" }));
      expect(state.filters.paymentMethod).toBe("upi");
    });

    it("sets amount range filters", () => {
      const state = uiReducer(initial, setFilters({ minAmount: 100, maxAmount: 5000 }));
      expect(state.filters.minAmount).toBe(100);
      expect(state.filters.maxAmount).toBe(5000);
    });

    it("sets date range filters", () => {
      const state = uiReducer(
        initial,
        setFilters({ dateFrom: "2024-01-01", dateTo: "2024-12-31" }),
      );
      expect(state.filters.dateFrom).toBe("2024-01-01");
      expect(state.filters.dateTo).toBe("2024-12-31");
    });

    it("merges multiple updates cumulatively", () => {
      let state = uiReducer(initial, setFilters({ search: "apollo" }));
      state = uiReducer(state, setFilters({ category: "medical" }));
      expect(state.filters.search).toBe("apollo");
      expect(state.filters.category).toBe("medical");
    });
  });

  describe("resetFilters", () => {
    it("resets all filters back to initial values", () => {
      let state = uiReducer(
        initial,
        setFilters({ search: "test", category: "travel", paymentMethod: "cash" }),
      );
      state = uiReducer(state, resetFilters());
      expect(state.filters.search).toBe("");
      expect(state.filters.category).toBe("all");
      expect(state.filters.paymentMethod).toBe("all");
      expect(state.filters.minAmount).toBeUndefined();
      expect(state.filters.dateTo).toBeUndefined();
    });

    it("does not touch theme or viewMode", () => {
      const dark = { ...initial, theme: "dark" as const, viewMode: "list" as const };
      const state = uiReducer(dark, resetFilters());
      expect(state.theme).toBe("dark");
      expect(state.viewMode).toBe("list");
    });
  });
});

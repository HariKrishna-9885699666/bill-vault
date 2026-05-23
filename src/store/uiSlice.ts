import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CategoryType, PaymentMethod } from "@/types";

export type ViewMode = "grid" | "list";

interface UIState {
  theme: "light" | "dark";
  viewMode: ViewMode;
  filters: {
    search: string;
    category: CategoryType | "all";
    paymentMethod: PaymentMethod | "all";
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    tag?: string;
  };
}

const initialState: UIState = {
  theme: "light",
  viewMode: "grid",
  filters: {
    search: "",
    category: "all",
    paymentMethod: "all",
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<UIState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { toggleTheme, setViewMode, setFilters, resetFilters } = uiSlice.actions;
export default uiSlice.reducer;
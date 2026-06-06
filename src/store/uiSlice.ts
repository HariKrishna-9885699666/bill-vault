import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CategoryType, PaymentMethod, ReportType } from "@/types";

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
  reportViewMode: ViewMode;
  reportFilters: {
    search: string;
    reportType: ReportType | "all";
    patient: string;
    dateFrom?: string;
    dateTo?: string;
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
  reportViewMode: "grid",
  reportFilters: {
    search: "",
    reportType: "all",
    patient: "all",
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
    setReportViewMode(state, action: PayloadAction<ViewMode>) {
      state.reportViewMode = action.payload;
    },
    setReportFilters(state, action: PayloadAction<Partial<UIState["reportFilters"]>>) {
      state.reportFilters = { ...state.reportFilters, ...action.payload };
    },
    resetReportFilters(state) {
      state.reportFilters = initialState.reportFilters;
    },
  },
});

export const {
  toggleTheme,
  setViewMode,
  setFilters,
  resetFilters,
  setReportViewMode,
  setReportFilters,
  resetReportFilters,
} = uiSlice.actions;
export default uiSlice.reducer;

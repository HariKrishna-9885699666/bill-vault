import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Report } from "@/types";

interface ReportsState {
  items: Report[];
}

const initialState: ReportsState = { items: [] };

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setReports(state, action: PayloadAction<Report[]>) {
      state.items = action.payload;
    },
    addReport(state, action: PayloadAction<Report>) {
      state.items.unshift(action.payload);
    },
    updateReport(state, action: PayloadAction<Report>) {
      const idx = state.items.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deleteReport(state, action: PayloadAction<string>) {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },
  },
});

export const { setReports, addReport, updateReport, deleteReport } = reportSlice.actions;
export default reportSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Bill } from "@/types";

interface BillsState {
  items: Bill[];
}

const initialState: BillsState = { items: [] };

const billSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {
    setBills(state, action: PayloadAction<Bill[]>) {
      state.items = action.payload;
    },
    addBill(state, action: PayloadAction<Bill>) {
      state.items.unshift(action.payload);
    },
    updateBill(state, action: PayloadAction<Bill>) {
      const idx = state.items.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deleteBill(state, action: PayloadAction<string>) {
      state.items = state.items.filter((b) => b.id !== action.payload);
    },
  },
});

export const { setBills, addBill, updateBill, deleteBill } = billSlice.actions;
export default billSlice.reducer;

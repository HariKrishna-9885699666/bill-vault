import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { setFilters, resetFilters, setViewMode } from "@/store/uiSlice";
import { CATEGORIES, PAYMENT_METHODS } from "@/utils/constants";
import { FaSearch, FaTh, FaList, FaUndo } from "react-icons/fa";

export function BillFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ui.filters);
  const viewMode = useAppSelector((s) => s.ui.viewMode);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="relative">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
          placeholder="Search title, vendor, notes…"
          className="pl-9"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          value={filters.category}
          onValueChange={(v) => dispatch(setFilters({ category: v as never }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.paymentMethod}
          onValueChange={(v) => dispatch(setFilters({ paymentMethod: v as never }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENT_METHODS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => dispatch(setFilters({ dateFrom: e.target.value || undefined }))}
          />
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => dispatch(setFilters({ dateTo: e.target.value || undefined }))}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Min amount"
          value={filters.minAmount ?? ""}
          onChange={(e) =>
            dispatch(setFilters({ minAmount: e.target.value ? Number(e.target.value) : undefined }))
          }
        />
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Max amount"
          value={filters.maxAmount ?? ""}
          onChange={(e) =>
            dispatch(setFilters({ maxAmount: e.target.value ? Number(e.target.value) : undefined }))
          }
        />
        <Input
          placeholder="Tag"
          value={filters.tag ?? ""}
          onChange={(e) => dispatch(setFilters({ tag: e.target.value || undefined }))}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => dispatch(setViewMode("grid"))}
            className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <FaTh /> Grid
          </button>
          <button
            type="button"
            onClick={() => dispatch(setViewMode("list"))}
            className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <FaList /> List
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilters())}>
          <FaUndo /> Reset filters
        </Button>
      </div>
    </div>
  );
}

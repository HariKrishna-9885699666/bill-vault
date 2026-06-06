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
import { setReportFilters, resetReportFilters, setReportViewMode } from "@/store/uiSlice";
import { REPORT_TYPES, FAMILY_MEMBERS } from "@/utils/constants";
import { FaSearch, FaTh, FaList, FaUndo } from "react-icons/fa";

export function ReportFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ui.reportFilters) || {
    search: "",
    reportType: "all",
    patient: "all",
  };
  const viewMode = useAppSelector((s) => s.ui.reportViewMode) || "grid";

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="relative">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => dispatch(setReportFilters({ search: e.target.value }))}
          placeholder="Search title, doctor, hospital, notes…"
          className="pl-9"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          value={filters.reportType}
          onValueChange={(v) => dispatch(setReportFilters({ reportType: v as never }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All report types</SelectItem>
            {REPORT_TYPES.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.patient}
          onValueChange={(v) => dispatch(setReportFilters({ patient: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All patients</SelectItem>
            {FAMILY_MEMBERS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => dispatch(setReportFilters({ dateFrom: e.target.value || undefined }))}
          />
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => dispatch(setReportFilters({ dateTo: e.target.value || undefined }))}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => dispatch(setReportViewMode("grid"))}
            className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <FaTh /> Grid
          </button>
          <button
            type="button"
            onClick={() => dispatch(setReportViewMode("list"))}
            className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <FaList /> List
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch(resetReportFilters())}>
          <FaUndo /> Reset filters
        </Button>
      </div>
    </div>
  );
}

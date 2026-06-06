import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { ReportFilters } from "@/components/Reports/ReportFilters";
import { ReportList } from "@/components/Reports/ReportList";
import { EmptyState } from "@/components/Common/EmptyState";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "All reports — BillVault" },
      {
        name: "description",
        content: "Search, filter and browse every medical report you've logged.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const reports = useAppSelector((s) => s.reports?.items || []);
  const filters = useAppSelector((s) => s.ui.reportFilters || {
    search: "",
    reportType: "all",
    patient: "all",
  });

  const filtered = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    return reports.filter((r) => {
      if (filters.reportType !== "all" && r.reportType !== filters.reportType) return false;
      if (filters.patient !== "all" && r.patient !== filters.patient) return false;
      if (filters.dateFrom && r.date < filters.dateFrom) return false;
      if (filters.dateTo && r.date > filters.dateTo) return false;
      if (filters.tag) {
        const tag = filters.tag.toLowerCase();
        if (!r.tags?.some((t) => t.toLowerCase().includes(tag))) return false;
      }
      if (q) {
        const hay =
          `${r.title} ${r.doctor ?? ""} ${r.hospital ?? ""} ${r.notes ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reports, filters]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All reports</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {reports.length} reports
          </p>
        </div>
        <Button asChild>
          <Link to="/reports/add">
            <FaPlus /> Add report
          </Link>
        </Button>
      </header>
      <ReportFilters />
      {filtered.length === 0 ? (
        <EmptyState
          title={reports.length === 0 ? "No reports yet" : "No matches"}
          description={
            reports.length === 0
              ? "Add your first medical report to get started."
              : "Try clearing some filters."
          }
          action={
            reports.length === 0 ? (
              <Button asChild>
                <Link to="/reports/add">
                  <FaPlus /> Add report
                </Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <ReportList reports={filtered} />
      )}
    </div>
  );
}

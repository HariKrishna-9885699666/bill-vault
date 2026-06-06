import type { Report } from "@/types";
import { Link } from "@tanstack/react-router";
import { ReportCard } from "./ReportCard";
import { useAppSelector } from "@/store";
import { REPORT_TYPE_MAP } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import { FaUserInjured } from "react-icons/fa";

export function ReportList({ reports }: { reports: Report[] }) {
  const viewMode = useAppSelector((s) => s.ui.reportViewMode) || "grid";

  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {reports.map((r) => {
        const meta = REPORT_TYPE_MAP[r.reportType];
        const Icon = meta.icon;
        return (
          <li key={r.id}>
            <Link
              to="/reports/$id"
              params={{ id: r.id }}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: "var(--cat-medical)" }}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {meta.label}
                  {r.doctor ? ` · Dr. ${r.doctor}` : ""} · {formatDate(r.date)}
                </p>
              </div>
              <p className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <FaUserInjured size={11} /> {r.patient}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

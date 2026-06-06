import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppSelector } from "@/store";
import { ReportForm } from "@/components/Reports/ReportForm";
import { useEffect } from "react";

export const Route = createFileRoute("/reports/$id/edit")({
  head: () => ({
    meta: [{ title: "Edit report — BillVault" }],
  }),
  component: EditReportPage,
});

function EditReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const report = useAppSelector((s) => s.reports.items.find((r) => r.id === id));

  useEffect(() => {
    if (!report) navigate({ to: "/reports" });
  }, [report, navigate]);

  if (!report) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Edit report</h1>
      </header>
      <ReportForm initial={report} mode="edit" />
    </div>
  );
}

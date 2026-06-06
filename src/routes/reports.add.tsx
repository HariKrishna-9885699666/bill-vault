import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/Reports/ReportForm";

export const Route = createFileRoute("/reports/add")({
  head: () => ({
    meta: [{ title: "Add report — BillVault" }],
  }),
  component: AddReportPage,
});

function AddReportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Add medical report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload medical documents, prescriptions, or lab results.
        </p>
      </header>
      <ReportForm mode="create" />
    </div>
  );
}

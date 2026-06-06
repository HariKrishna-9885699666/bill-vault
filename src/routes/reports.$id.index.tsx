import { createFileRoute } from "@tanstack/react-router";
import { ReportDetail } from "@/components/Reports/ReportDetail";

export const Route = createFileRoute("/reports/$id/")({
  head: () => ({
    meta: [{ title: "Report details — BillVault" }],
  }),
  component: ReportDetailPage,
});

function ReportDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="mx-auto max-w-4xl">
      <ReportDetail reportId={id} />
    </div>
  );
}

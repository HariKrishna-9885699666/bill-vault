import { createFileRoute } from "@tanstack/react-router";
import { BillDetail } from "@/components/Bills/BillDetail";

export const Route = createFileRoute("/bills/$id/")({
  head: () => ({
    meta: [
      { title: "Bill — BillVault" },
      { name: "description", content: "Bill details and attachments." },
    ],
  }),
  component: BillDetailPage,
});

function BillDetailPage() {
  const { id } = Route.useParams();
  return <BillDetail billId={id} />;
}

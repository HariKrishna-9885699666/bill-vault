import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppSelector } from "@/store";
import { BillForm } from "@/components/Bills/BillForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/bills/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit bill — BillVault" },
    ],
  }),
  component: EditBillPage,
});

function EditBillPage() {
  const { id } = Route.useParams();
  const bill = useAppSelector((s) => s.bills.items.find((b) => b.id === id));
  if (!bill) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Bill not found.</p>
        <Button asChild className="mt-4"><Link to="/bills">Back to bills</Link></Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Edit bill</h1>
      </header>
      <BillForm initial={bill} mode="edit" />
    </div>
  );
}
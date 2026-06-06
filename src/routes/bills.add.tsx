import { createFileRoute } from "@tanstack/react-router";
import { BillForm } from "@/components/Bills/BillForm";

export const Route = createFileRoute("/bills/add")({
  head: () => ({
    meta: [
      { title: "Add bill — BillVault" },
      {
        name: "description",
        content: "Capture a new bill with attachments backed up to Google Drive.",
      },
    ],
  }),
  component: AddBillPage,
});

function AddBillPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Add a bill</h1>
        <p className="text-sm text-muted-foreground">
          Files are uploaded to your Google Drive under <code>BillVault/{`{category}`}</code>.
        </p>
      </header>
      <BillForm />
    </div>
  );
}

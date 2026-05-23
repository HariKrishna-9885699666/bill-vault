import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BillVault — Dashboard" },
      { name: "description", content: "Your monthly spending summary and recent bills." },
    ],
  }),
  component: Dashboard,
});

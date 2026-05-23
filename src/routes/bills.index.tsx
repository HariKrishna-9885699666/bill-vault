import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { BillFilters } from "@/components/Bills/BillFilters";
import { BillList } from "@/components/Bills/BillList";
import { EmptyState } from "@/components/Common/EmptyState";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/bills/")({
  head: () => ({
    meta: [
      { title: "All bills — BillVault" },
      { name: "description", content: "Search, filter and browse every receipt you've logged." },
    ],
  }),
  component: BillsPage,
});

function BillsPage() {
  const bills = useAppSelector((s) => s.bills.items);
  const filters = useAppSelector((s) => s.ui.filters);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return bills.filter((b) => {
      if (filters.category !== "all" && b.category !== filters.category) return false;
      if (filters.paymentMethod !== "all" && b.paymentMethod !== filters.paymentMethod) return false;
      if (filters.dateFrom && b.date < filters.dateFrom) return false;
      if (filters.dateTo && b.date > filters.dateTo) return false;
      if (filters.minAmount !== undefined && b.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && b.amount > filters.maxAmount) return false;
      if (filters.tag) {
        const tag = filters.tag.toLowerCase();
        if (!b.tags?.some((t) => t.toLowerCase().includes(tag))) return false;
      }
      if (q) {
        const hay = `${b.title} ${b.vendor ?? ""} ${b.notes ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bills, filters]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All bills</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {bills.length} bills
          </p>
        </div>
        <Button asChild>
          <Link to="/bills/add"><FaPlus /> Add bill</Link>
        </Button>
      </header>
      <BillFilters />
      {filtered.length === 0 ? (
        <EmptyState
          title={bills.length === 0 ? "No bills yet" : "No matches"}
          description={
            bills.length === 0
              ? "Add your first bill to get started."
              : "Try clearing some filters."
          }
          action={
            bills.length === 0 ? (
              <Button asChild><Link to="/bills/add"><FaPlus /> Add bill</Link></Button>
            ) : null
          }
        />
      ) : (
        <BillList bills={filtered} />
      )}
    </div>
  );
}
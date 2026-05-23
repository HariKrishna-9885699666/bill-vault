import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { CATEGORIES, CATEGORY_MAP } from "@/utils/constants";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import { BillCard } from "@/components/Bills/BillCard";
import { EmptyState } from "@/components/Common/EmptyState";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { FaPlus, FaArrowRight } from "react-icons/fa";
import type { CategoryType } from "@/types";

export function Dashboard() {
  const bills = useAppSelector((s) => s.bills.items);

  const monthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = useMemo(
    () => bills.filter((b) => b.date.startsWith(monthKey)),
    [bills, monthKey],
  );

  const totalsByCategory = useMemo(() => {
    const totals = new Map<CategoryType, number>();
    for (const b of thisMonth) {
      totals.set(b.category, (totals.get(b.category) ?? 0) + b.amount);
    }
    return totals;
  }, [thisMonth]);

  const monthTotal = useMemo(
    () => thisMonth.reduce((sum, b) => sum + b.amount, 0),
    [thisMonth],
  );

  const topCategories = useMemo(
    () =>
      Array.from(totalsByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4),
    [totalsByCategory],
  );

  const recent = bills.slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Your bill vault</h1>
        </div>
        <Button asChild>
          <Link to="/bills/add">
            <FaPlus /> Add bill
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-sm">
          <p className="text-xs uppercase tracking-wide opacity-80">This month</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(monthTotal)}</p>
          <p className="mt-1 text-xs opacity-80">{thisMonth.length} bills logged</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">All-time bills</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{bills.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across {totalsByCategory.size} categories</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{CATEGORIES.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Pre-configured types</p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Spending by category</h2>
        </div>
        {topCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No spending this month yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topCategories.map(([cat, total]) => {
              const meta = CATEGORY_MAP[cat];
              const pct = monthTotal ? Math.round((total / monthTotal) * 100) : 0;
              return (
                <Link
                  key={cat}
                  to="/bills"
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={cat} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">{pct}% of month</p>
                    </div>
                  </div>
                  <p className="mt-3 text-lg font-bold text-foreground">{formatCurrency(total)}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: `var(--color-${meta.token})`,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent bills</h2>
          <Link to="/bills" className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            View all <FaArrowRight />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No bills yet"
            description="Add your first receipt to start tracking spending."
            action={
              <Button asChild>
                <Link to="/bills/add">
                  <FaPlus /> Add your first bill
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b) => (
              <BillCard key={b.id} bill={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
import type { Bill } from "@/types";
import { Link } from "@tanstack/react-router";
import { BillCard } from "./BillCard";
import { useAppSelector } from "@/store";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { CATEGORY_MAP } from "@/utils/constants";

export function BillList({ bills }: { bills: Bill[] }) {
  const viewMode = useAppSelector((s) => s.ui.viewMode);

  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bills.map((b) => (
          <BillCard key={b.id} bill={b} />
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {bills.map((b) => {
        const meta = CATEGORY_MAP[b.category];
        return (
          <li key={b.id}>
            <Link
              to="/bills/$id"
              params={{ id: b.id }}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <CategoryIcon category={b.category} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{b.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {meta.label}
                  {b.vendor ? ` · ${b.vendor}` : ""} · {formatDate(b.date)}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {formatCurrency(b.amount, b.currency)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

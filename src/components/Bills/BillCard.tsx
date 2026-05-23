import { Link } from "@tanstack/react-router";
import type { Bill } from "@/types";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import { AttachmentThumb } from "@/components/Common/FileUploader";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { CATEGORY_MAP } from "@/utils/constants";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { FaPaperclip } from "react-icons/fa";

export function BillCard({ bill }: { bill: Bill }) {
  const meta = CATEGORY_MAP[bill.category];
  const firstAttachment = bill.attachments[0];
  const thumb = useBlobUrl(firstAttachment);
  return (
    <Link
      to="/bills/$id"
      params={{ id: bill.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden bg-muted">
        {firstAttachment ? (
          <AttachmentThumb
            thumb={thumb}
            mime={firstAttachment.mimeType}
            fileName={firstAttachment.fileName}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-4xl text-white"
            style={{ backgroundColor: `var(--${meta.token})` }}
          >
            <meta.icon />
          </div>
        )}
        {bill.attachments.length > 1 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
            <FaPaperclip /> {bill.attachments.length}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{bill.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {meta.label}
              {bill.vendor ? ` · ${bill.vendor}` : ""}
            </p>
          </div>
          <CategoryIcon category={bill.category} size="sm" />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(bill.amount, bill.currency)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(bill.date)}</p>
        </div>
      </div>
    </Link>
  );
}
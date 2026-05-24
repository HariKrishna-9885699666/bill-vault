import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryIcon } from "@/components/Common/CategoryIcon";
import { AttachmentThumb } from "@/components/Common/FileUploader";
import { CATEGORY_MAP, PAYMENT_METHODS } from "@/utils/constants";
import { formatCurrency, formatDate, formatBytes } from "@/utils/formatters";
import { useAppDispatch, useAppSelector } from "@/store";
import { deleteBill } from "@/store/billSlice";
import { removeAttachment, saveBills } from "@/services/drive.functions";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { FaPen, FaTrash, FaDownload, FaArrowLeft, FaExpand } from "react-icons/fa";
import type { Bill, Attachment } from "@/types";

export function BillDetail({ billId }: { billId: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const allBills = useAppSelector((s) => s.bills.items);
  const bill: Bill | undefined = allBills.find((b) => b.id === billId);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!bill) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Bill not found.</p>
        <Button asChild className="mt-4">
          <Link to="/bills">Back to bills</Link>
        </Button>
      </div>
    );
  }

  const meta = CATEGORY_MAP[bill.category];
  const payment = PAYMENT_METHODS.find((p) => p.id === bill.paymentMethod);

  async function handleDelete() {
    if (!bill) return;
    for (const a of bill.attachments) {
      if (a.driveFileId) {
        try {
          await removeAttachment({ fileId: a.driveFileId });
        } catch {
          // ignore — file may already be gone
        }
      }
    }
    const updatedBills = allBills.filter((b) => b.id !== bill.id);
    try {
      await saveBills({ bills: updatedBills });
    } catch {
      // non-fatal: Drive sync failed but local state will update
    }
    dispatch(deleteBill(bill.id));
    toast.success("Bill deleted");
    navigate({ to: "/bills" });
  }

  const current = bill.attachments[active];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bills"><FaArrowLeft /> Back</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/bills/$id/edit" params={{ id: bill.id }}>
              <FaPen /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><FaTrash /> Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this bill?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the bill and its attachments from Google Drive. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <header className="flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-card p-5">
        <CategoryIcon category={bill.category} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{meta.label}</p>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{bill.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bill.vendor ? `${bill.vendor} · ` : ""}{formatDate(bill.date, "EEEE, MMM d, yyyy")}
          </p>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {formatCurrency(bill.amount, bill.currency)}
        </p>
      </header>

      {bill.attachments.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          {/* Attachment preview — click to open fullscreen */}
          <div
            className="relative flex h-72 cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-muted sm:h-96"
            onClick={() => setLightbox(true)}
          >
            {current?.mimeType.includes("pdf") && current.driveUrl ? (
              <iframe
                src={current.driveUrl.replace("/view", "/preview")}
                title={current.fileName}
                className="pointer-events-none h-full w-full"
              />
            ) : (
              <ActiveAttachmentThumb attachment={current} />
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur hover:bg-black/70"
              aria-label="View fullscreen"
            >
              <FaExpand size={13} />
            </button>
          </div>

          {/* Lightbox dialog */}
          <Dialog open={lightbox} onOpenChange={setLightbox}>
            <DialogContent className="max-h-[95dvh] max-w-[95dvw] overflow-hidden p-0">
              <div className="flex h-[90dvh] w-full items-center justify-center bg-black">
                {current?.mimeType.includes("pdf") && current.driveUrl ? (
                  <iframe
                    src={current.driveUrl.replace("/view", "/preview")}
                    title={current.fileName}
                    className="h-full w-full"
                  />
                ) : (
                  <LightboxThumb attachment={current} />
                )}
              </div>
            </DialogContent>
          </Dialog>
          {bill.attachments.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {bill.attachments.map((a, i) => (
                <StripThumb
                  key={a.id}
                  attachment={a}
                  active={i === active}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {current?.fileName} · {formatBytes(current?.size ?? 0)}
            </span>
            {current?.driveUrl && (
              <a
                href={current.driveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary"
              >
                <FaDownload /> Open in Drive
              </a>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <Detail label="Amount" value={formatCurrency(bill.amount, bill.currency)} />
        <Detail label="Category" value={meta.label} />
        {bill.patient && <Detail label="Patient" value={bill.patient} />}
        <Detail label="Date" value={formatDate(bill.date, "MMM d, yyyy")} />
        <Detail label="Vendor" value={bill.vendor || "—"} />
        <Detail label="Payment method" value={payment?.label || "—"} />
        <Detail label="Currency" value={bill.currency} />
        {bill.tags && bill.tags.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {bill.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
        {bill.notes && (
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{bill.notes}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ActiveAttachmentThumb({ attachment }: { attachment: Attachment | undefined }) {
  const thumb = useBlobUrl(attachment);
  return (
    <AttachmentThumb
      thumb={thumb}
      mime={attachment?.mimeType ?? ""}
      fileName={attachment?.fileName ?? ""}
    />
  );
}

function LightboxThumb({ attachment }: { attachment: Attachment | undefined }) {
  const thumb = useBlobUrl(attachment);
  if (!thumb) {
    return (
      <div className="flex items-center justify-center text-sm text-white/60">
        {attachment?.fileName ?? "No preview"}
      </div>
    );
  }
  return (
    <img
      src={thumb}
      alt={attachment?.fileName ?? ""}
      className="max-h-full max-w-full object-contain"
    />
  );
}

function StripThumb({
  attachment,
  active,
  onClick,
}: {
  attachment: Attachment;
  active: boolean;
  onClick: () => void;
}) {
  const thumb = useBlobUrl(attachment);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
        active ? "border-primary" : "border-transparent"
      }`}
    >
      <AttachmentThumb thumb={thumb} mime={attachment.mimeType} fileName={attachment.fileName} />
    </button>
  );
}

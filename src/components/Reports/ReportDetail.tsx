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
import { AttachmentThumb } from "@/components/Common/FileUploader";
import { REPORT_TYPE_MAP } from "@/utils/constants";
import { formatDate, formatBytes } from "@/utils/formatters";
import { useAppDispatch, useAppSelector } from "@/store";
import { deleteReport } from "@/store/reportSlice";
import { removeAttachment, saveReports } from "@/services/drive.functions";
import { useBlobUrl } from "@/hooks/use-blob-url";
import {
  FaPen,
  FaTrash,
  FaDownload,
  FaArrowLeft,
  FaExpand,
  FaUserInjured,
  FaSpinner,
} from "react-icons/fa";
import type { Report, Attachment } from "@/types";

export function ReportDetail({ reportId }: { reportId: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const allReports = useAppSelector((s) => s.reports.items);
  const report: Report | undefined = allReports.find((r) => r.id === reportId);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  if (!report) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Report not found.</p>
        <Button asChild className="mt-4">
          <Link to="/reports">Back to reports</Link>
        </Button>
      </div>
    );
  }

  const meta = REPORT_TYPE_MAP[report.reportType];
  const Icon = meta.icon;

  async function handleDelete() {
    if (!report) return;
    setIsDeleting(true);
    for (const a of report.attachments) {
      if (a.driveFileId) {
        try {
          await removeAttachment({ fileId: a.driveFileId });
        } catch {
          // ignore — file may already be gone
        }
      }
    }
    const updatedReports = allReports.filter((r) => r.id !== report.id);
    try {
      await saveReports({ reports: updatedReports });
    } catch {
      // non-fatal
    }
    dispatch(deleteReport(report.id));
    toast.success("Report deleted");
    setIsDeleting(false);
    navigate({ to: "/reports" });
  }

  const current = report.attachments[active];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reports">
            <FaArrowLeft /> Back
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports/$id/edit" params={{ id: report.id }}>
              <FaPen /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the report and its attachments from Google Drive. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="animate-spin" /> Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <header className="flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-card p-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-white"
          style={{ backgroundColor: "var(--cat-medical)" }}
        >
          <Icon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{meta.label}</p>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{report.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(report.date, "EEEE, MMM d, yyyy")}
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
          <FaUserInjured /> {report.patient}
        </p>
      </header>

      {report.attachments.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
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
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(true);
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur hover:bg-black/70"
              aria-label="View fullscreen"
            >
              <FaExpand size={13} />
            </button>
          </div>

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
          {report.attachments.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {report.attachments.map((a, i) => (
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
        <Detail label="Report Type" value={meta.label} />
        <Detail label="Patient" value={report.patient} />
        <Detail label="Date" value={formatDate(report.date, "MMM d, yyyy")} />
        <Detail label="Doctor" value={report.doctor || "—"} />
        <Detail label="Hospital/Lab" value={report.hospital || "—"} />
        {report.tags && report.tags.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {report.tags.map((t) => (
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
        {report.notes && (
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{report.notes}</p>
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

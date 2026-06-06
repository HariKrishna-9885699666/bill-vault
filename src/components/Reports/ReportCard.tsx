import { Link } from "@tanstack/react-router";
import type { Report } from "@/types";
import { AttachmentThumb } from "@/components/Common/FileUploader";
import { REPORT_TYPE_MAP } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { FaPaperclip, FaUserInjured } from "react-icons/fa";

export function ReportCard({ report }: { report: Report }) {
  const meta = REPORT_TYPE_MAP[report.reportType];
  const Icon = meta.icon;
  const firstAttachment = report.attachments[0];
  const thumb = useBlobUrl(firstAttachment);

  return (
    <Link
      to="/reports/$id"
      params={{ id: report.id }}
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
            style={{ backgroundColor: "var(--cat-medical)" }}
          >
            <Icon />
          </div>
        )}
        {report.attachments.length > 1 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
            <FaPaperclip /> {report.attachments.length}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{report.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {meta.label}
              {report.doctor ? ` · Dr. ${report.doctor}` : ""}
            </p>
          </div>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: "var(--cat-medical)" }}
          >
            <Icon size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <FaUserInjured size={11} /> {report.patient}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(report.date)}</p>
        </div>
      </div>
    </Link>
  );
}

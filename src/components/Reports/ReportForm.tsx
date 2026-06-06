import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader, type PendingFile } from "@/components/Common/FileUploader";
import { REPORT_TYPES, FAMILY_MEMBERS, type FamilyMember } from "@/utils/constants";
import type { Attachment, Report, ReportType } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { addReport, updateReport } from "@/store/reportSlice";
import { uploadAttachment, saveReports } from "@/services/drive.functions";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { FaSpinner } from "react-icons/fa";

interface Props {
  initial?: Report;
  mode?: "create" | "edit";
}

export function ReportForm({ initial, mode = "create" }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const allReports = useAppSelector((s) => s.reports.items);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [reportType, setReportType] = useState<ReportType>(initial?.reportType ?? "lab_test");
  const [patient, setPatient] = useState<FamilyMember | "">(
    (initial?.patient as FamilyMember | undefined) ?? "",
  );
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [doctor, setDoctor] = useState(initial?.doctor ?? "");
  const [hospital, setHospital] = useState(initial?.hospital ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(", ") ?? "");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    initial?.attachments ?? [],
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!patient) return toast.error("Patient is required");

    setSubmitting(true);
    const newAttachments: Attachment[] = [...existingAttachments];

    for (const pf of files) {
      try {
        const fd = new FormData();
        fd.set("file", pf.file);
        fd.set("category", "_report");
        if (patient) fd.set("patient", patient);
        const result = await uploadAttachment(fd);
        newAttachments.push({
          id: crypto.randomUUID(),
          fileName: result.name,
          mimeType: result.mimeType,
          size: result.size || pf.file.size,
          driveFileId: result.fileId,
          driveUrl: result.webViewLink,
          thumbnailUrl: result.thumbnailLink,
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        toast.error("Attachment upload failed", { description: detail.slice(0, 160) });
        setSubmitting(false);
        return;
      }
    }

    const now = new Date().toISOString();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const report: Report = {
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      reportType,
      patient,
      date,
      doctor: doctor.trim() || undefined,
      hospital: hospital.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.length ? tags : undefined,
      attachments: newAttachments,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };

    const updatedReports =
      mode === "edit"
        ? allReports.map((r) => (r.id === report.id ? report : r))
        : [report, ...allReports];

    try {
      await saveReports({ reports: updatedReports });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      toast.error("Failed to save to Drive", { description: detail.slice(0, 160) });
      setSubmitting(false);
      return;
    }

    if (mode === "edit") {
      dispatch(updateReport(report));
      toast.success("Report updated");
    } else {
      dispatch(addReport(report));
      toast.success("Report saved");
    }
    setSubmitting(false);
    navigate({ to: "/reports/$id", params: { id: report.id } });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title / Description *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Complete Blood Count (CBC)"
            required
          />
        </div>

        <div>
          <Label>Report Type *</Label>
          <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Patient *</Label>
          <Select
            value={patient || "none"}
            onValueChange={(v) => setPatient(v === "none" ? "" : (v as FamilyMember))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>
                — Select Patient —
              </SelectItem>
              {FAMILY_MEMBERS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="doctor">Doctor</Label>
          <Input
            id="doctor"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            placeholder="e.g., Dr. Smith"
          />
        </div>

        <div>
          <Label htmlFor="hospital">Hospital / Clinic / Lab</Label>
          <Input
            id="hospital"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            placeholder="e.g., Apollo Diagnostics"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. annual_checkup, fasting"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes / Observations</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional remarks…"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <Label>Attachments</Label>
        {existingAttachments.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {existingAttachments.map((a) => (
              <ExistingAttachmentItem
                key={a.id}
                attachment={a}
                onRemove={() => setExistingAttachments((cur) => cur.filter((x) => x.id !== a.id))}
              />
            ))}
          </ul>
        )}
        <FileUploader files={files} onChange={setFiles} disabled={submitting} />
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/reports" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="animate-spin" /> Saving...
            </span>
          ) : mode === "edit" ? (
            "Save changes"
          ) : (
            "Save report"
          )}
        </Button>
      </div>
    </form>
  );
}

function ExistingAttachmentItem({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: () => void;
}) {
  const thumb = useBlobUrl(attachment);
  return (
    <li className="relative overflow-hidden rounded-lg border border-border bg-muted">
      {thumb ? (
        <img src={thumb} alt={attachment.fileName} className="h-24 w-full object-cover" />
      ) : (
        <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
          {attachment.fileName}
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white"
      >
        Remove
      </button>
    </li>
  );
}

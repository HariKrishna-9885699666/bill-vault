import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
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
import {
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  FAMILY_MEMBERS,
  type FamilyMember,
} from "@/utils/constants";
import type { Attachment, Bill, CategoryType, PaymentMethod } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { addBill, updateBill } from "@/store/billSlice";
import { uploadAttachment, saveBills } from "@/services/drive.functions";
import { useBlobUrl } from "@/hooks/use-blob-url";

interface Props {
  initial?: Bill;
  mode?: "create" | "edit";
}

export function BillForm({ initial, mode = "create" }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const allBills = useAppSelector((s) => s.bills.items);
  const upload = useServerFn(uploadAttachment);
  const save = useServerFn(saveBills);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<CategoryType>(initial?.category ?? "miscellaneous");
  const [patient, setPatient] = useState<FamilyMember | "">(
    (initial?.patient as FamilyMember | undefined) ?? "",
  );
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? "INR");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState(initial?.vendor ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    initial?.paymentMethod ?? "",
  );
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
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt) || amt < 0) return toast.error("Enter a valid amount");

    setSubmitting(true);
    const newAttachments: Attachment[] = [...existingAttachments];

    for (const pf of files) {
      try {
        const fd = new FormData();
        fd.set("file", pf.file);
        fd.set("category", category);
        if (category === "medical" && patient) fd.set("patient", patient);
        const result = await upload({ data: fd });
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

    const bill: Bill = {
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      category,
      patient: category === "medical" && patient ? patient : undefined,
      amount: amt,
      currency,
      date,
      vendor: vendor.trim() || undefined,
      paymentMethod: (paymentMethod || undefined) as PaymentMethod | undefined,
      notes: notes.trim() || undefined,
      tags: tags.length ? tags : undefined,
      attachments: newAttachments,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };

    // Build the updated bills array for Drive persistence
    const updatedBills =
      mode === "edit"
        ? allBills.map((b) => (b.id === bill.id ? bill : b))
        : [bill, ...allBills];

    try {
      await save({ data: { bills: updatedBills } });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      toast.error("Failed to save to Drive", { description: detail.slice(0, 160) });
      setSubmitting(false);
      return;
    }

    if (mode === "edit") {
      dispatch(updateBill(bill));
      toast.success("Bill updated");
    } else {
      dispatch(addBill(bill));
      toast.success("Bill saved");
    }
    setSubmitting(false);
    navigate({ to: "/bills/$id", params: { id: bill.id } });
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
            placeholder="Apollo Pharmacy — Feb medicines"
            required
          />
        </div>

        <div>
          <Label>Category *</Label>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v as CategoryType);
              if (v !== "medical") setPatient("");
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {category === "medical" && (
          <div>
            <Label>Patient</Label>
            <Select
              value={patient || "none"}
              onValueChange={(v) => setPatient(v === "none" ? "" : (v as FamilyMember))}
            >
              <SelectTrigger><SelectValue placeholder="Select patient…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {FAMILY_MEMBERS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vendor">Vendor / Store</Label>
          <Input
            id="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. BigBasket"
          />
        </div>

        <div>
          <Label>Payment method</Label>
          <Select
            value={paymentMethod || "none"}
            onValueChange={(v) => setPaymentMethod(v === "none" ? "" : (v as PaymentMethod))}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {PAYMENT_METHODS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. reimbursable, family"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
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
                onRemove={() =>
                  setExistingAttachments((cur) => cur.filter((x) => x.id !== a.id))
                }
              />
            ))}
          </ul>
        )}
        <FileUploader files={files} onChange={setFiles} disabled={submitting} />
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/bills" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Save bill"}
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

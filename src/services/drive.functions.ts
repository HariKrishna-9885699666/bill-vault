import type { Bill, Report } from "@/types";

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  thumbnailLink?: string;
  mimeType: string;
  name: string;
  size: number;
}

const BASE = "/.netlify/functions";

export async function uploadAttachment(formData: FormData): Promise<DriveUploadResult> {
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<DriveUploadResult>;
}

export async function getDriveStatus(): Promise<{ configured: boolean }> {
  const res = await fetch(`${BASE}/drive-status`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ configured: boolean }>;
}

export async function removeAttachment(data: { fileId: string }): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE}/remove-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ ok: boolean }>;
}

export async function loadBills(): Promise<Bill[]> {
  const res = await fetch(`${BASE}/bills`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Bill[]>;
}

export async function saveBills(data: { bills: Bill[] }): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE}/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ ok: boolean }>;
}

export async function loadReports(): Promise<Report[]> {
  const res = await fetch(`${BASE}/reports`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Report[]>;
}

export async function saveReports(data: { reports: Report[] }): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ ok: boolean }>;
}

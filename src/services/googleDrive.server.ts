import type { Bill, Report } from "@/types";

const GOOGLE_API_BASE = "https://www.googleapis.com";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

let _tokenCache: { access_token: string; expires_at: number } | null = null;

// ── Service-account JWT flow (GOOGLE_SERVICE_ACCOUNT_JSON) ──────────────────

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

async function getServiceAccountToken(json: string): Promise<string> {
  const sa = JSON.parse(json) as ServiceAccount;
  const now = Math.floor(Date.now() / 1000);

  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const b64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = { alg: "RS256", typ: "JWT" };
  const signingInput = `${b64url(header)}.${b64url(claim)}`;

  const { createSign } = await import("crypto");
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = signer.sign(sa.private_key, "base64url");
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Service-account token failed ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// ── OAuth 2.0 refresh-token flow (GOOGLE_CLIENT_ID + SECRET + REFRESH_TOKEN) ─

async function getOAuthToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Drive not configured. " +
        "Set GOOGLE_SERVICE_ACCOUNT_JSON (recommended) or " +
        "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN in your .env file.",
    );
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let hint = "";
    if (body.includes("unauthorized_client") || body.includes("invalid_grant")) {
      hint =
        " Hint: the refresh token may have been generated with different credentials. " +
        "Re-generate it via https://developers.google.com/oauthplayground using your own Client ID/Secret.";
    }
    throw new Error(`Google token refresh failed ${res.status}: ${body}${hint}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return data.access_token;
}

// ── Shared token cache ───────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  if (_tokenCache && _tokenCache.expires_at > Date.now() + 60_000) {
    return _tokenCache.access_token;
  }

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const token = saJson ? await getServiceAccountToken(saJson) : await getOAuthToken();

  _tokenCache = { access_token: token, expires_at: Date.now() + 3500 * 1000 };
  return token;
}

export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    (process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN)
  );
}

// ── Drive API helpers ────────────────────────────────────────────────────────

async function driveFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${GOOGLE_API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive API ${res.status}: ${text}`);
  }
  return res;
}

async function findFolder(name: string, parentId?: string): Promise<string | null> {
  const q = [
    `name='${name.replace(/'/g, "\\'")}'`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    parentId ? `'${parentId}' in parents` : null,
  ]
    .filter(Boolean)
    .join(" and ");
  const res = await driveFetch(
    `/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`,
  );
  const data = (await res.json()) as { files?: { id: string }[] };
  return data.files?.[0]?.id ?? null;
}

async function createFolder(name: string, parentId?: string): Promise<string> {
  const res = await driveFetch(`/drive/v3/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    }),
  });
  const data = (await res.json()) as { id: string };
  return data.id;
}

async function ensureFolder(name: string, parentId?: string): Promise<string> {
  const existing = await findFolder(name, parentId);
  if (existing) return existing;
  return createFolder(name, parentId);
}

// ── Root Folders ─────────────────────────────────────────────────────────────

async function ensureBillsRootFolder(): Promise<string> {
  const root = await ensureFolder("BillVault");
  return ensureFolder("Bills", root);
}

async function ensureReportsRootFolder(): Promise<string> {
  const root = await ensureFolder("BillVault");
  return ensureFolder("Reports", root);
}

/** Returns the Drive folder ID where attachments for this category (and optionally patient) go. */
export async function ensureCategoryFolder(category: string, patient?: string): Promise<string> {
  const billsRoot = await ensureBillsRootFolder();
  const catFolder = await ensureFolder(category, billsRoot);
  if (patient) {
    return ensureFolder(patient, catFolder);
  }
  return catFolder;
}

// ── Multipart upload helper ──────────────────────────────────────────────────

function buildMultipart(
  boundary: string,
  metadata: object,
  contentType: string,
  body: Uint8Array,
): Uint8Array {
  const enc = new TextEncoder();
  const head = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata,
    )}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
  );
  const tail = enc.encode(`\r\n--${boundary}--`);
  const out = new Uint8Array(head.length + body.byteLength + tail.length);
  out.set(head, 0);
  out.set(body, head.length);
  out.set(tail, head.length + body.byteLength);
  return out;
}

// ── File upload ──────────────────────────────────────────────────────────────

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  thumbnailLink?: string;
  mimeType: string;
  name: string;
  size: number;
}

export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  bytes: ArrayBuffer,
  category: string,
  patient?: string,
): Promise<DriveUploadResult> {
  // If category is "medical" AND we're uploading a report, this gets tricky because 
  // we now use `uploadFileToDrive` for both bills and reports.
  // Wait, in `ReportForm.tsx` I hardcoded `category: "medical"`. 
  // Let's check if the caller is for a report. Actually, we should probably add a parameter 
  // or change how ReportForm uploads to use the reports folder!
  // I'll adjust this function to check a special category name.
  let folderId = "";
  if (category === "_report") {
    folderId = await ensureReportFolder(patient || "Unknown");
  } else {
    folderId = await ensureCategoryFolder(category, patient);
  }

  const boundary = `boundary_${Math.random().toString(36).slice(2)}`;
  const metadata = { name: fileName, parents: [folderId] };
  const body = buildMultipart(boundary, metadata, mimeType, new Uint8Array(bytes));

  const res = await driveFetch(
    `/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,thumbnailLink`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as BodyInit,
    },
  );
  const data = (await res.json()) as {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    webViewLink?: string;
    thumbnailLink?: string;
  };

  try {
    await driveFetch(`/drive/v3/files/${data.id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });
  } catch {
    // permission step is best-effort
  }

  return {
    fileId: data.id,
    webViewLink: data.webViewLink ?? `https://drive.google.com/file/d/${data.id}/view`,
    thumbnailLink: data.thumbnailLink ?? `https://drive.google.com/thumbnail?id=${data.id}&sz=w400`,
    mimeType: data.mimeType,
    name: data.name,
    size: Number(data.size ?? 0),
  };
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  await driveFetch(`/drive/v3/files/${fileId}`, { method: "DELETE" });
}

// ── bills.json persistence ───────────────────────────────────────────────────

let _billsFileId: string | null | undefined = undefined; // undefined = not yet looked up

async function findBillsFileId(): Promise<string | null> {
  if (_billsFileId !== undefined) return _billsFileId;
  const billsRoot = await ensureBillsRootFolder();
  const q = `name='bills.json' and '${billsRoot}' in parents and trashed=false`;
  const res = await driveFetch(
    `/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`,
  );
  const data = (await res.json()) as { files?: { id: string }[] };
  _billsFileId = data.files?.[0]?.id ?? null;
  return _billsFileId;
}

export async function loadBillsFromDrive(): Promise<Bill[]> {
  try {
    const fileId = await findBillsFileId();
    if (!fileId) return [];
    const res = await driveFetch(`/drive/v3/files/${fileId}?alt=media`);
    const text = await res.text();
    return JSON.parse(text) as Bill[];
  } catch (err) {
    console.error("[Drive] loadBillsFromDrive failed:", err);
    return [];
  }
}

export async function saveBillsToDrive(bills: Bill[]): Promise<void> {
  const billsRoot = await ensureBillsRootFolder();
  const content = JSON.stringify(bills);
  const bytes = new TextEncoder().encode(content);
  const boundary = `boundary_${Math.random().toString(36).slice(2)}`;

  const existingId = await findBillsFileId();

  if (existingId) {
    const body = buildMultipart(boundary, { name: "bills.json" }, "application/json", bytes);
    await driveFetch(`/upload/drive/v3/files/${existingId}?uploadType=multipart`, {
      method: "PATCH",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as BodyInit,
    });
  } else {
    const metadata = { name: "bills.json", parents: [billsRoot] };
    const body = buildMultipart(boundary, metadata, "application/json", bytes);
    const res = await driveFetch(`/upload/drive/v3/files?uploadType=multipart&fields=id`, {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as BodyInit,
    });
    const data = (await res.json()) as { id: string };
    _billsFileId = data.id;
  }
}

// ── Report folder structure: BillVault/Reports/{patient}/ ─────────────

export async function ensureReportFolder(patient: string): Promise<string> {
  const reportsRoot = await ensureReportsRootFolder();
  return ensureFolder(patient, reportsRoot);
}

// ── reports.json persistence ─────────────────────────────────────────────────

let _reportsFileId: string | null | undefined = undefined;

async function findReportsFileId(): Promise<string | null> {
  if (_reportsFileId !== undefined) return _reportsFileId;
  const reportsRoot = await ensureReportsRootFolder();
  const q = `name='reports.json' and '${reportsRoot}' in parents and trashed=false`;
  const res = await driveFetch(
    `/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`,
  );
  const data = (await res.json()) as { files?: { id: string }[] };
  _reportsFileId = data.files?.[0]?.id ?? null;
  return _reportsFileId;
}

export async function loadReportsFromDrive(): Promise<Report[]> {
  try {
    const fileId = await findReportsFileId();
    if (!fileId) return [];
    const res = await driveFetch(`/drive/v3/files/${fileId}?alt=media`);
    const text = await res.text();
    return JSON.parse(text) as Report[];
  } catch (err) {
    console.error("[Drive] loadReportsFromDrive failed:", err);
    return [];
  }
}

export async function saveReportsToDrive(reports: Report[]): Promise<void> {
  const reportsRoot = await ensureReportsRootFolder();
  const content = JSON.stringify(reports);
  const bytes = new TextEncoder().encode(content);
  const boundary = `boundary_${Math.random().toString(36).slice(2)}`;

  const existingId = await findReportsFileId();

  if (existingId) {
    const body = buildMultipart(boundary, { name: "reports.json" }, "application/json", bytes);
    await driveFetch(`/upload/drive/v3/files/${existingId}?uploadType=multipart`, {
      method: "PATCH",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as BodyInit,
    });
  } else {
    const metadata = { name: "reports.json", parents: [reportsRoot] };
    const body = buildMultipart(boundary, metadata, "application/json", bytes);
    const res = await driveFetch(`/upload/drive/v3/files?uploadType=multipart&fields=id`, {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as BodyInit,
    });
    const data = (await res.json()) as { id: string };
    _reportsFileId = data.id;
  }
}

import { createServerFn } from "@tanstack/react-start";
import {
  uploadFileToDrive,
  deleteDriveFile,
  isDriveConfigured,
  loadBillsFromDrive,
  saveBillsToDrive,
  type DriveUploadResult,
} from "./googleDrive.server";
import type { Bill } from "@/types";

export const uploadAttachment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const file = data.get("file");
    const category = data.get("category");
    const patient = data.get("patient");
    if (!(file instanceof File)) throw new Error("file is required");
    if (typeof category !== "string" || !category) {
      throw new Error("category is required");
    }
    if (file.size > 10 * 1024 * 1024) throw new Error("File exceeds 10MB");
    return {
      file,
      category,
      patient: typeof patient === "string" && patient ? patient : undefined,
    };
  })
  .handler(async ({ data }): Promise<DriveUploadResult> => {
    try {
      const buf = await data.file.arrayBuffer();
      return await uploadFileToDrive(
        data.file.name,
        data.file.type || "application/octet-stream",
        buf,
        data.category,
        data.patient,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Drive Upload]", message);
      throw new Error(message);
    }
  });

export const getDriveStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: isDriveConfigured(),
}));

export const removeAttachment = createServerFn({ method: "POST" })
  .inputValidator((data: { fileId: string }) => {
    if (!data?.fileId) throw new Error("fileId required");
    return data;
  })
  .handler(async ({ data }) => {
    await deleteDriveFile(data.fileId);
    return { ok: true };
  });

export const loadBills = createServerFn({ method: "GET" }).handler(
  async (): Promise<Bill[]> => {
    return loadBillsFromDrive();
  },
);

export const saveBills = createServerFn({ method: "POST" })
  .inputValidator((data: { bills: Bill[] }) => {
    if (!Array.isArray(data?.bills)) throw new Error("bills array required");
    return data;
  })
  .handler(async ({ data }) => {
    await saveBillsToDrive(data.bills);
    return { ok: true };
  });

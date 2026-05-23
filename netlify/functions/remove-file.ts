import { deleteDriveFile } from "../../src/services/googleDrive.server";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { fileId } = (await req.json()) as { fileId: string };
    if (!fileId) {
      return Response.json({ error: "fileId is required" }, { status: 400 });
    }

    await deleteDriveFile(fileId);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[remove-file]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

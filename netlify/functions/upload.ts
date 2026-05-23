import { uploadFileToDrive } from "../../src/services/googleDrive.server";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const category = formData.get("category");
    const patient = formData.get("patient");

    if (!(file instanceof File)) {
      return Response.json({ error: "file is required" }, { status: 400 });
    }
    if (typeof category !== "string" || !category) {
      return Response.json({ error: "category is required" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File exceeds 10MB" }, { status: 400 });
    }

    const buf = await file.arrayBuffer();
    const result = await uploadFileToDrive(
      file.name,
      file.type || "application/octet-stream",
      buf,
      category,
      typeof patient === "string" && patient ? patient : undefined,
    );

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

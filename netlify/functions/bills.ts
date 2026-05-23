import { loadBillsFromDrive, saveBillsToDrive } from "../../src/services/googleDrive.server";

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === "GET") {
      const bills = await loadBillsFromDrive();
      return Response.json(bills);
    }

    if (req.method === "POST") {
      const body = (await req.json()) as { bills: Parameters<typeof saveBillsToDrive>[0] };
      await saveBillsToDrive(body.bills);
      return Response.json({ ok: true });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bills]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

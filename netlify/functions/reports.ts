import { loadReportsFromDrive, saveReportsToDrive } from "../../src/services/googleDrive.server";

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === "GET") {
      const reports = await loadReportsFromDrive();
      return Response.json(reports);
    }

    if (req.method === "POST") {
      const body = (await req.json()) as { reports: Parameters<typeof saveReportsToDrive>[0] };
      await saveReportsToDrive(body.reports);
      return Response.json({ ok: true });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[reports]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

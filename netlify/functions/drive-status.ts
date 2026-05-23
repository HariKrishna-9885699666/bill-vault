import { isDriveConfigured } from "../../src/services/googleDrive.server";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  return Response.json({ configured: isDriveConfigured() });
}

import { NextRequest } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return Response.json({ error: "url param required" }, { status: 400 });

  try {
    const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
    return Response.json({ svg });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

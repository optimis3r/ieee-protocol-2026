import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { transaction } from "@/lib/event/persistence";
import { authenticate } from "@/lib/event/engine";
export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ file: string }> },
) {
  try {
    const { file } = await ctx.params;
    if (!/^[a-f0-9-]+\.(mp3|wav|ogg|png|jpg|webp|pdf|mp4)$/.test(file))
      return new Response(null, { status: 404 });
    await transaction((d) => {
      if (!verifyAdminRequest(req)) {
        const p = authenticate(
          d,
          req.cookies.get("protocol_session")?.value || "",
        );
        if (
          !p.checkedIn ||
          !d.nodes.some(
            (n) =>
              n.enabled &&
              n.published &&
              n.assets.some((a) => a.url.endsWith("/" + file)),
          )
        )
          throw new Error("Forbidden");
      }
    });
    const data = fs.readFileSync(
      path.join(
        process.env.PROTOCOL_DATA_DIR || path.join(process.cwd(), ".data"),
        "assets",
        file,
      ),
    );
    const types: Record<string, string> = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      png: "image/png",
      jpg: "image/jpeg",
      webp: "image/webp",
      pdf: "application/pdf",
      mp4: "video/mp4",
    };
    return new Response(data, {
      headers: {
        "Content-Type": types[file.split(".").pop()!],
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 403 });
  }
}

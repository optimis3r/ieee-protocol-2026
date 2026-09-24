import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { verifyAdminRequest } from "@/lib/admin-auth";
export const runtime = "nodejs";
const formats: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
};
export async function POST(req: Request) {
  if (!verifyAdminRequest(req))
    return Response.json(
      { error: "Admin authorization required" },
      { status: 401 },
    );
  if (Number(req.headers.get("content-length")) > 21 * 1024 * 1024)
    return Response.json(
      { error: "Maximum upload size is 20 MB" },
      { status: 413 },
    );
  try {
    const data = await req.formData(),
      file = data.get("file");
    if (
      !(file instanceof File) ||
      !formats[file.type] ||
      file.size > 20 * 1024 * 1024
    )
      return Response.json(
        {
          error:
            "Choose an MP3, WAV, OGG, PNG, JPG, WebP, PDF or MP4 up to 20 MB",
        },
        { status: 400 },
      );
    const dir = path.join(
      process.env.PROTOCOL_DATA_DIR || path.join(process.cwd(), ".data"),
      "assets",
    );
    fs.mkdirSync(dir, { recursive: true });
    const name = `${randomUUID()}.${formats[file.type]}`;
    fs.writeFileSync(
      path.join(dir, name),
      Buffer.from(await file.arrayBuffer()),
      { mode: 0o600 },
    );
    return Response.json({
      name: file.name,
      url: `/api/event/assets/${name}`,
      kind: file.type.startsWith("audio")
        ? "audio"
        : file.type.startsWith("image")
          ? "image"
          : file.type.startsWith("video")
            ? "video"
            : "document",
    });
  } catch {
    return Response.json({ error: "Upload failed" }, { status: 400 });
  }
}

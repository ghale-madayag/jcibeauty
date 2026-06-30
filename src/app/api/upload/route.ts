import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { canAccessPanel } from "@/lib/permissions";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Canonical, safe extensions keyed by allowed image MIME type. The stored
// filename's extension is ALWAYS taken from this whitelist — never from the
// (spoofable) uploaded filename — so a forged image MIME paired with a
// dangerous name (e.g. ".svg" / ".html" / ".php") can't be written and later
// served from our own origin.
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

export async function POST(req: Request) {
  const session = await auth();
  if (!canAccessPanel(session?.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
  }

  // Resolve a safe extension: prefer the canonical ext for the declared MIME;
  // otherwise fall back to the filename ext only if it's in the whitelist.
  const nameExt = path.extname(file.name).toLowerCase();
  const ext =
    MIME_TO_EXT[file.type] ?? (ALLOWED_EXT.includes(nameExt) ? nameExt : "");
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "images", "uploads");

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({ url: `/images/uploads/${filename}` });
}

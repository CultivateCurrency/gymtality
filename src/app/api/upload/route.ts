import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    // Auth: extract the httpOnly access token cookie and forward as Bearer
    const accessToken = req.cookies.get("gymtality_at")?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    if (file) {
      const ALLOWED_TYPES = [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/quicktime", "video/webm",
      ];
      const MAX_SIZE = 50 * 1024 * 1024;
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, error: "File type not allowed" }, { status: 415 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, error: "File too large (max 50 MB)" }, { status: 413 });
      }
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/storage/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}

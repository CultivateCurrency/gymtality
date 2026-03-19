import { NextRequest, NextResponse } from "next/server";
import { uploadFile, generateFileKey, validateFile } from "@/lib/storage";
import type { FileCategory } from "@/lib/storage";

// POST /api/upload — Upload a file to Oracle Cloud Object Storage
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const category = (formData.get("category") as FileCategory) || "image";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file.type, file.size, category);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique key and upload
    const key = generateFileKey(folder, file.name, userId);
    const url = await uploadFile(buffer, key, file.type);

    return NextResponse.json({
      success: true,
      data: { url, key, filename: file.name, size: file.size, contentType: file.type },
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

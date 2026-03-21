import { NextRequest, NextResponse } from "next/server";
import { listDialogs, createDialog } from "@/lib/quickblox";

// GET /api/messages/dialogs — list conversations
export async function GET(req: NextRequest) {
  try {
    const qbToken = req.headers.get("x-qb-token");
    if (!qbToken) {
      return NextResponse.json({ success: false, error: "No QB token" }, { status: 401 });
    }

    const dialogs = await listDialogs(qbToken);
    return NextResponse.json({ success: true, data: dialogs });
  } catch (error: any) {
    console.error("GET /api/messages/dialogs error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/messages/dialogs — create a 1:1 dialog
export async function POST(req: NextRequest) {
  try {
    const qbToken = req.headers.get("x-qb-token");
    if (!qbToken) {
      return NextResponse.json({ success: false, error: "No QB token" }, { status: 401 });
    }

    const body = await req.json();
    const { occupantId, name } = body;

    if (!occupantId) {
      return NextResponse.json({ success: false, error: "occupantId required" }, { status: 400 });
    }

    const dialog = await createDialog(qbToken, occupantId, name || "Chat");
    return NextResponse.json({ success: true, data: dialog });
  } catch (error: any) {
    console.error("POST /api/messages/dialogs error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { listMessages, sendMessage } from "@/lib/quickblox";

// GET /api/messages/chat?dialogId=xxx — list messages in a dialog
export async function GET(req: NextRequest) {
  try {
    const qbToken = req.headers.get("x-qb-token");
    if (!qbToken) {
      return NextResponse.json({ success: false, error: "No QB token" }, { status: 401 });
    }

    const dialogId = req.nextUrl.searchParams.get("dialogId");
    if (!dialogId) {
      return NextResponse.json({ success: false, error: "dialogId required" }, { status: 400 });
    }

    const messages = await listMessages(qbToken, dialogId);
    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("GET /api/messages/chat error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/messages/chat — send a message
export async function POST(req: NextRequest) {
  try {
    const qbToken = req.headers.get("x-qb-token");
    if (!qbToken) {
      return NextResponse.json({ success: false, error: "No QB token" }, { status: 401 });
    }

    const body = await req.json();
    const { dialogId, message, recipientId } = body;

    if (!dialogId || !message || !recipientId) {
      return NextResponse.json({ success: false, error: "dialogId, message, and recipientId required" }, { status: 400 });
    }

    const result = await sendMessage(qbToken, dialogId, message, recipientId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/messages/chat error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

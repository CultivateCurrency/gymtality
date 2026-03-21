import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createAppSession,
  createQBUser,
  createUserSession,
} from "@/lib/quickblox";

// QB password is derived from the app user ID (deterministic, not guessable)
function qbPassword(userId: string): string {
  return `qb_${userId}_gymtality`;
}

// POST /api/messages/session — get or create a QB session for the logged-in user
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, username: true, qbUserId: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const qbLogin = `gymtality_${user.id}`;
    const qbPass = qbPassword(user.id);

    // If user doesn't have a QB account yet, create one
    if (!user.qbUserId) {
      const appToken = await createAppSession();
      const qbUserId = await createQBUser(appToken, qbLogin, qbPass, user.fullName);

      await prisma.user.update({
        where: { id: userId },
        data: { qbUserId },
      });
    }

    // Create a user session (login to QB)
    const { token, userId: qbId } = await createUserSession(qbLogin, qbPass);

    return NextResponse.json({
      success: true,
      data: {
        token,
        qbUserId: qbId,
        appId: process.env.NEXT_PUBLIC_QUICKBLOX_APP_ID,
        accountKey: process.env.NEXT_PUBLIC_QUICKBLOX_ACCOUNT_KEY,
      },
    });
  } catch (error: any) {
    console.error("POST /api/messages/session error:", error);
    return NextResponse.json({ success: false, error: error.message || "Something went wrong" }, { status: 500 });
  }
}

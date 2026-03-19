import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSupportEmail, sendSupportConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required (name, email, subject, message)" },
        { status: 400 }
      );
    }

    // Store as a notification to the user as confirmation, and log it.
    // In production, this would also send an email via AWS SES.
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: "Support Request Submitted",
          message: `Subject: ${subject} — ${message}`,
          data: { name, email, subject, message },
        },
      });
    }

    // Send support request email to team + confirmation to user (non-blocking)
    sendSupportEmail(name, email, subject, message).catch((err) =>
      console.error("Support email failed:", err)
    );
    sendSupportConfirmationEmail(email, name, subject).catch((err) =>
      console.error("Support confirmation email failed:", err)
    );

    return NextResponse.json({
      success: true,
      data: { message: "Support request submitted successfully" },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Help POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit support request" },
      { status: 500 }
    );
  }
}

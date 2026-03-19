import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAccountStatusEmail } from "@/lib/email";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;
    const body = await req.json();

    const { role, suspended, action } = body;

    const user = await prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (role) updateData.role = role;

    if (suspended === true) {
      updateData.role = "MEMBER";
    }

    // Block / Unblock
    if (action === 'block') updateData.isBlocked = true;
    if (action === 'unblock') updateData.isBlocked = false;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        isBlocked: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send account status email on block/unblock (non-blocking)
    if (action === "block" || action === "unblock") {
      sendAccountStatusEmail(
        user.email,
        user.fullName,
        action === "block"
      ).catch((err) => console.error("Account status email failed:", err));
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;

    const user = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

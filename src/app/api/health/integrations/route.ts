import { NextRequest, NextResponse } from "next/server";
import { runAllTests } from "@/lib/test-integrations";

export const dynamic = "force-dynamic";

// GET /api/health/integrations — Test all external API integrations
export async function GET(req: NextRequest) {
  try {
    const results = await runAllTests();

    const summary = {
      timestamp: new Date(),
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      results,
    };

    // Return 200 if all tests passed or were skipped (not failed)
    const hasFailed = results.some((r) => r.status === "failed");
    const statusCode = hasFailed ? 503 : 200;

    return NextResponse.json(summary, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

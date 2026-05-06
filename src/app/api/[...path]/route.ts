import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Internal backend URL — only reachable server-side, never exposed to the browser
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// Catch-all proxy: forwards /api/* requests to the Express backend at port 4000.
// This prevents the browser from ever calling localhost:4000 directly (which fails
// in production since that port is internal).
// More specific routes (/api/auth/*, /api/upload, /api/payments/webhook) take
// precedence over this catch-all automatically in Next.js App Router.

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const pathname = `/api/${path.join("/")}`;
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  // Read access token from httpOnly cookie — client JS never touches it
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gymtality_at")?.value;

  const forwardHeaders: Record<string, string> = {
    "content-type": req.headers.get("content-type") || "application/json",
    "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
    "x-real-ip": req.headers.get("x-real-ip") || "",
  };

  // Proxy injects Authorization from the httpOnly cookie — client never sends raw tokens
  if (accessToken) forwardHeaders["authorization"] = `Bearer ${accessToken}`;

  let body: BodyInit | undefined;
  const method = req.method;

  if (!["GET", "HEAD", "DELETE"].includes(method)) {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Forward form data as-is (file uploads)
      body = await req.formData();
      // Don't set content-type — fetch sets it with boundary automatically
      delete forwardHeaders["content-type"];
    } else {
      body = await req.text();
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      // Don't follow redirects — pass them back to the client
      redirect: "manual",
    });
  } catch (err) {
    console.error(`[api/proxy] Failed to reach backend at ${targetUrl}:`, err);
    return NextResponse.json(
      { success: false, error: "Backend unavailable" },
      { status: 503 }
    );
  }

  // Stream response body back to client
  const responseBody = await backendRes.text();
  const responseHeaders = new Headers();

  // Forward relevant response headers
  const forwardResponseHeaders = ["content-type", "x-request-id", "x-total-count", "location"];
  forwardResponseHeaders.forEach((h) => {
    const val = backendRes.headers.get(h);
    if (val) responseHeaders.set(h, val);
  });

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

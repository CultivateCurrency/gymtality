import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "https://gymtality.fit/api";

export async function GET() {
  const oauthUrl = `${BACKEND_URL}/api/auth/google`;
  redirect(oauthUrl);
}

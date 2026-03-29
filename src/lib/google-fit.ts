// Google Fit API helper
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_FIT_API = "https://www.googleapis.com/fitness/v1/users/me";

// Scopes needed for fitness data
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.location.read",
].join(" ");

function getRedirectUri() {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/wearables/callback`;
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: data.expires_in as number,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return {
    accessToken: data.access_token as string,
    expiresIn: data.expires_in as number,
  };
}

// Fetch aggregated data from Google Fit
async function fetchAggregate(
  accessToken: string,
  dataTypeName: string,
  startTimeMillis: number,
  endTimeMillis: number,
  bucketByTime: number = 86400000 // 1 day in ms
) {
  const res = await fetch(`${GOOGLE_FIT_API}/dataset:aggregate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aggregateBy: [{ dataTypeName }],
      bucketByTime: { durationMillis: bucketByTime },
      startTimeMillis,
      endTimeMillis,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Fit API error: ${res.status} ${err}`);
  }

  return res.json();
}

interface DailyMetric {
  date: string; // YYYY-MM-DD
  value: number;
}

function extractBucketValues(data: any, valueKey: "intVal" | "fpVal" = "intVal"): DailyMetric[] {
  const results: DailyMetric[] = [];
  for (const bucket of data.bucket || []) {
    const startMs = parseInt(bucket.startTimeMillis);
    const date = new Date(startMs).toISOString().split("T")[0];
    let value = 0;
    for (const ds of bucket.dataset || []) {
      for (const point of ds.point || []) {
        for (const v of point.value || []) {
          value += v[valueKey] || v.fpVal || v.intVal || 0;
        }
      }
    }
    results.push({ date, value });
  }
  return results;
}

export async function fetchSteps(accessToken: string, startMs: number, endMs: number): Promise<DailyMetric[]> {
  const data = await fetchAggregate(accessToken, "com.google.step_count.delta", startMs, endMs);
  return extractBucketValues(data, "intVal");
}

export async function fetchCalories(accessToken: string, startMs: number, endMs: number): Promise<DailyMetric[]> {
  const data = await fetchAggregate(accessToken, "com.google.calories.expended", startMs, endMs);
  return extractBucketValues(data, "fpVal");
}

export async function fetchHeartRate(accessToken: string, startMs: number, endMs: number): Promise<DailyMetric[]> {
  const data = await fetchAggregate(accessToken, "com.google.heart_rate.bpm", startMs, endMs);
  // Heart rate returns average, extract fpVal
  const results: DailyMetric[] = [];
  for (const bucket of data.bucket || []) {
    const startMsB = parseInt(bucket.startTimeMillis);
    const date = new Date(startMsB).toISOString().split("T")[0];
    let total = 0, count = 0;
    for (const ds of bucket.dataset || []) {
      for (const point of ds.point || []) {
        for (const v of point.value || []) {
          if (v.fpVal) { total += v.fpVal; count++; }
        }
      }
    }
    results.push({ date, value: count > 0 ? Math.round(total / count) : 0 });
  }
  return results;
}

export async function fetchSleep(accessToken: string, startMs: number, endMs: number): Promise<DailyMetric[]> {
  // Sleep uses sessions API
  const res = await fetch(
    `${GOOGLE_FIT_API}/sessions?startTime=${new Date(startMs).toISOString()}&endTime=${new Date(endMs).toISOString()}&activityType=72`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();

  // Group sleep sessions by date
  const sleepByDate: Record<string, number> = {};
  for (const session of data.session || []) {
    const startNanos = parseInt(session.startTimeMillis);
    const endNanos = parseInt(session.endTimeMillis);
    const date = new Date(startNanos).toISOString().split("T")[0];
    const minutes = (endNanos - startNanos) / 60000;
    sleepByDate[date] = (sleepByDate[date] || 0) + minutes;
  }

  return Object.entries(sleepByDate).map(([date, value]) => ({
    date,
    value: Math.round(value),
  }));
}

export async function fetchDistance(accessToken: string, startMs: number, endMs: number): Promise<DailyMetric[]> {
  const data = await fetchAggregate(accessToken, "com.google.distance.delta", startMs, endMs);
  return extractBucketValues(data, "fpVal");
}

export async function fetchActiveMinutes(accessToken: string, startMs: number, endMs: number): Promise<DailyMetric[]> {
  const data = await fetchAggregate(accessToken, "com.google.active_minutes", startMs, endMs);
  return extractBucketValues(data, "intVal");
}

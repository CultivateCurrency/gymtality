// Integration testing utilities for external APIs
// Run these to verify credentials are working

import { createAppSession } from "./quickblox";

export interface IntegrationTestResult {
  service: string;
  status: "success" | "failed" | "skipped";
  message: string;
  timestamp: Date;
}

const results: IntegrationTestResult[] = [];

export async function testQuickBlox(): Promise<IntegrationTestResult> {
  const result: IntegrationTestResult = {
    service: "QuickBlox",
    status: "skipped",
    message: "Credentials not configured",
    timestamp: new Date(),
  };

  try {
    const appId = process.env.QUICKBLOX_APP_ID;
    const authKey = process.env.QUICKBLOX_AUTH_KEY;
    const authSecret = process.env.QUICKBLOX_AUTH_SECRET;

    if (!appId || !authKey || !authSecret) {
      result.message = "Missing QUICKBLOX_APP_ID, QUICKBLOX_AUTH_KEY, or QUICKBLOX_AUTH_SECRET";
      return result;
    }

    const token = await createAppSession();
    if (token && token.length > 0) {
      result.status = "success";
      result.message = `Connected successfully. Token: ${token.substring(0, 20)}...`;
    } else {
      result.status = "failed";
      result.message = "Session created but no token returned";
    }
  } catch (error) {
    result.status = "failed";
    result.message = error instanceof Error ? error.message : String(error);
  }

  return result;
}

export async function testOpenAI(): Promise<IntegrationTestResult> {
  const result: IntegrationTestResult = {
    service: "OpenAI",
    status: "skipped",
    message: "Credentials not configured",
    timestamp: new Date(),
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    result.message = "Missing OPENAI_API_KEY";
    return result;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      result.status = "success";
      result.message = "API key is valid";
    } else if (response.status === 401) {
      result.status = "failed";
      result.message = "API key is invalid or expired";
    } else {
      result.status = "failed";
      result.message = `API returned status ${response.status}`;
    }
  } catch (error) {
    result.status = "failed";
    result.message = error instanceof Error ? error.message : String(error);
  }

  return result;
}

export async function testStripe(): Promise<IntegrationTestResult> {
  const result: IntegrationTestResult = {
    service: "Stripe",
    status: "skipped",
    message: "Credentials not configured",
    timestamp: new Date(),
  };

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    result.message = "Missing STRIPE_SECRET_KEY";
    return result;
  }

  try {
    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    const response = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (response.ok) {
      result.status = "success";
      result.message = "API key is valid";
    } else if (response.status === 401) {
      result.status = "failed";
      result.message = "API key is invalid";
    } else {
      result.status = "failed";
      result.message = `API returned status ${response.status}`;
    }
  } catch (error) {
    result.status = "failed";
    result.message = error instanceof Error ? error.message : String(error);
  }

  return result;
}

export async function testResend(): Promise<IntegrationTestResult> {
  const result: IntegrationTestResult = {
    service: "Resend",
    status: "skipped",
    message: "Credentials not configured",
    timestamp: new Date(),
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    result.message = "Missing RESEND_API_KEY";
    return result;
  }

  try {
    const response = await fetch("https://api.resend.com/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      result.status = "success";
      result.message = "API key is valid";
    } else if (response.status === 401) {
      result.status = "failed";
      result.message = "API key is invalid";
    } else {
      result.status = "failed";
      result.message = `API returned status ${response.status}`;
    }
  } catch (error) {
    result.status = "failed";
    result.message = error instanceof Error ? error.message : String(error);
  }

  return result;
}

export async function testAWSIVS(): Promise<IntegrationTestResult> {
  const result: IntegrationTestResult = {
    service: "AWS IVS",
    status: "skipped",
    message: "Credentials not configured",
    timestamp: new Date(),
  };

  const accessKey = process.env.AWS_IVS_ACCESS_KEY;
  const secretKey = process.env.AWS_IVS_SECRET_KEY;

  if (!accessKey || !secretKey) {
    result.message = "Missing AWS_IVS_ACCESS_KEY or AWS_IVS_SECRET_KEY";
    return result;
  }

  try {
    // Just verify keys exist and are non-empty
    if (accessKey.length > 0 && secretKey.length > 0) {
      result.status = "success";
      result.message = "Credentials are configured (full validation requires channel operations)";
    } else {
      result.status = "failed";
      result.message = "Credentials are empty";
    }
  } catch (error) {
    result.status = "failed";
    result.message = error instanceof Error ? error.message : String(error);
  }

  return result;
}

export async function runAllTests(): Promise<IntegrationTestResult[]> {
  const tests = [testQuickBlox, testOpenAI, testStripe, testResend, testAWSIVS];
  const allResults = await Promise.all(tests.map((test) => test()));
  return allResults;
}

export function getTestResults(): IntegrationTestResult[] {
  return results;
}

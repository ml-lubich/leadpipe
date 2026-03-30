import { createClient } from "@supabase/supabase-js";

const SUPABASE_TIMEOUT_MS = 5000;

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type CheckStatus = "pass" | "fail";

interface HealthCheck {
  status: CheckStatus;
  message: string;
  duration_ms?: number;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    env_vars: HealthCheck;
    supabase_connection: HealthCheck;
  };
}

function checkEnvVars(): HealthCheck {
  const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    return {
      status: "fail",
      message: `Missing env vars: ${missing.join(", ")}`,
    };
  }

  return { status: "pass", message: "All required env vars configured" };
}

async function checkSupabaseConnection(): Promise<HealthCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { status: "fail", message: "Supabase credentials not configured" };
  }

  const start = Date.now();

  try {
    const supabase = createClient(url, key);

    const result = await Promise.race([
      supabase.from("_health_check_ping").select("count").limit(0),
      new Promise<{ error: Error }>((_, reject) =>
        setTimeout(
          () => reject(new Error("Supabase connection timed out")),
          SUPABASE_TIMEOUT_MS
        )
      ),
    ]);

    const duration_ms = Date.now() - start;

    if (result && "error" in result && result.error) {
      const errorMessage = String(
        (result.error as Record<string, unknown>).message ?? result.error
      );
      const isTableNotFound =
        errorMessage.includes("does not exist") ||
        errorMessage.includes("relation");
      if (isTableNotFound) {
        return {
          status: "pass",
          message: "Supabase connected (table not found is OK for health check)",
          duration_ms,
        };
      }
      return {
        status: "fail",
        message: `Supabase query error: ${errorMessage}`,
        duration_ms,
      };
    }

    return {
      status: "pass",
      message: "Supabase connected",
      duration_ms,
    };
  } catch (error) {
    const duration_ms = Date.now() - start;
    return {
      status: "fail",
      message: `Supabase connection failed: ${error instanceof Error ? error.message : String(error)}`,
      duration_ms,
    };
  }
}

export async function GET() {
  const envCheck = checkEnvVars();
  const supabaseCheck = await checkSupabaseConnection();

  const allPass =
    envCheck.status === "pass" && supabaseCheck.status === "pass";
  const allFail =
    envCheck.status === "fail" && supabaseCheck.status === "fail";

  let status: HealthResponse["status"];
  if (allPass) {
    status = "healthy";
  } else if (allFail) {
    status = "unhealthy";
  } else {
    status = "degraded";
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      env_vars: envCheck,
      supabase_connection: supabaseCheck,
    },
  };

  return Response.json(response, {
    status: status === "healthy" ? 200 : 503,
  });
}

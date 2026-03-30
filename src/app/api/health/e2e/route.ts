import { createClient } from "@supabase/supabase-js";

const TIMEOUT_MS = 5000;

interface E2ECheck {
  status: "pass" | "fail";
  message: string;
  duration_ms: number;
}

interface E2EResponse {
  status: "pass" | "fail";
  timestamp: string;
  checks: {
    supabase_read: E2ECheck;
    supabase_auth: E2ECheck;
  };
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

async function withTimeout<T>(
  promiseLike: PromiseLike<T>,
  label: string
): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), TIMEOUT_MS)
    ),
  ]);
}

async function checkSupabaseRead(): Promise<E2ECheck> {
  const start = Date.now();
  try {
    const supabase = getSupabaseClient();
    const { error } = await withTimeout(
      supabase.from("campaigns").select("id").limit(1),
      "Supabase read"
    );
    const duration_ms = Date.now() - start;

    if (error) {
      return { status: "fail", message: `Read failed: ${error.message}`, duration_ms };
    }
    return { status: "pass", message: "Supabase read OK", duration_ms };
  } catch (error) {
    return {
      status: "fail",
      message: `Read error: ${error instanceof Error ? error.message : String(error)}`,
      duration_ms: Date.now() - start,
    };
  }
}

async function checkSupabaseAuth(): Promise<E2ECheck> {
  const start = Date.now();
  try {
    const supabase = getSupabaseClient();
    const { error } = await withTimeout(
      supabase.auth.getSession(),
      "Supabase auth"
    );
    const duration_ms = Date.now() - start;

    if (error) {
      return { status: "fail", message: `Auth failed: ${error.message}`, duration_ms };
    }
    return { status: "pass", message: "Supabase auth reachable", duration_ms };
  } catch (error) {
    return {
      status: "fail",
      message: `Auth error: ${error instanceof Error ? error.message : String(error)}`,
      duration_ms: Date.now() - start,
    };
  }
}

export async function GET() {
  const [supabaseRead, supabaseAuth] = await Promise.all([
    checkSupabaseRead(),
    checkSupabaseAuth(),
  ]);

  const allPass =
    supabaseRead.status === "pass" && supabaseAuth.status === "pass";

  const response: E2EResponse = {
    status: allPass ? "pass" : "fail",
    timestamp: new Date().toISOString(),
    checks: {
      supabase_read: supabaseRead,
      supabase_auth: supabaseAuth,
    },
  };

  return Response.json(response, {
    status: allPass ? 200 : 503,
  });
}

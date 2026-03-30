import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, rateLimitResponse, _resetStore } from "./rate-limit";

beforeEach(() => {
  _resetStore();
  vi.restoreAllMocks();
});

describe("checkRateLimit", () => {
  const config = { windowMs: 60_000, maxRequests: 3 };

  it("allows requests under the limit", () => {
    const result = checkRateLimit("user-1", config);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("allows up to maxRequests in the window", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("user-1", config).allowed).toBe(true);
    }
  });

  it("blocks after maxRequests exceeded", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user-1", config);
    }
    const result = checkRateLimit("user-1", config);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("isolates keys from each other", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user-1", config);
    }
    expect(checkRateLimit("user-1", config).allowed).toBe(false);
    expect(checkRateLimit("user-2", config).allowed).toBe(true);
  });

  it("allows requests again after the window expires", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    for (let i = 0; i < 3; i++) {
      checkRateLimit("user-1", config);
    }
    expect(checkRateLimit("user-1", config).allowed).toBe(false);

    vi.spyOn(Date, "now").mockReturnValue(now + 60_001);
    expect(checkRateLimit("user-1", config).allowed).toBe(true);
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 with Retry-After header", async () => {
    const response = rateLimitResponse(30_000);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");

    const body = await response.json();
    expect(body.error).toContain("Too many requests");
  });

  it("rounds Retry-After up to nearest second", async () => {
    const response = rateLimitResponse(1_500);
    expect(response.headers.get("Retry-After")).toBe("2");
  });
});

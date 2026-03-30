import { describe, it, expect, vi, beforeEach } from "vitest";
import { TEST_USER } from "@/__tests__/helpers";

const { mockClient } = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue({ data: null, error: null });
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  return {
    mockClient: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      from: vi.fn().mockReturnValue(chain),
      rpc: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      _chain: chain,
    },
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}));

vi.mock("openai", () => ({
  default: vi.fn(),
}));

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  mockClient.auth.getUser.mockResolvedValue({ data: { user: TEST_USER }, error: null });
});

describe("POST /api/outreach/generate", () => {
  it("returns 401 without auth", async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const request = new Request("http://localhost/api/outreach/generate", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: "c1",
        template_id: "t1",
        lead_ids: ["l1"],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 with missing fields", async () => {
    const request = new Request("http://localhost/api/outreach/generate", {
      method: "POST",
      body: JSON.stringify({ campaign_id: "c1" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 400 with empty lead_ids", async () => {
    const request = new Request("http://localhost/api/outreach/generate", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: "c1",
        template_id: "t1",
        lead_ids: [],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 400 when lead_ids exceeds 50", async () => {
    const leadIds = Array.from({ length: 51 }, (_, i) => `lead-${i}`);

    const request = new Request("http://localhost/api/outreach/generate", {
      method: "POST",
      body: JSON.stringify({
        campaign_id: "c1",
        template_id: "t1",
        lead_ids: leadIds,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("50");
  });
});

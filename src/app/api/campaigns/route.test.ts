import { describe, it, expect, vi, beforeEach } from "vitest";
import { TEST_USER, TEST_CAMPAIGN } from "@/__tests__/helpers";

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

import { GET, POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset chain defaults
  mockClient._chain.select.mockReturnValue(mockClient._chain);
  mockClient._chain.insert.mockReturnValue(mockClient._chain);
  mockClient._chain.update.mockReturnValue(mockClient._chain);
  mockClient._chain.delete.mockReturnValue(mockClient._chain);
  mockClient._chain.eq.mockReturnValue(mockClient._chain);
  mockClient._chain.in.mockReturnValue(mockClient._chain);
  mockClient._chain.order.mockReturnValue(mockClient._chain);
  mockClient._chain.single.mockResolvedValue({ data: null, error: null });
  mockClient.from.mockReturnValue(mockClient._chain);
  mockClient.auth.getUser.mockResolvedValue({ data: { user: TEST_USER }, error: null });
});

describe("GET /api/campaigns", () => {
  it("returns 401 without auth", async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns user campaigns", async () => {
    const campaigns = [TEST_CAMPAIGN];
    mockClient._chain.order.mockResolvedValueOnce({ data: campaigns, error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.campaigns).toEqual(campaigns);
    expect(mockClient.from).toHaveBeenCalledWith("campaigns");
    expect(mockClient._chain.eq).toHaveBeenCalledWith("user_id", TEST_USER.id);
  });
});

describe("POST /api/campaigns", () => {
  it("returns 401 without auth", async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const request = new Request("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ trade_type: "Plumbers", location: "Austin, TX" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 without required fields", async () => {
    const request = new Request("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ trade_type: "Plumbers" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("creates a campaign", async () => {
    const created = { ...TEST_CAMPAIGN };
    mockClient._chain.single.mockResolvedValueOnce({ data: created, error: null });

    const request = new Request("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ trade_type: "Plumbers", location: "Austin, TX" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.campaign).toEqual(created);
    expect(mockClient._chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER.id,
        trade_type: "Plumbers",
        location: "Austin, TX",
        status: "active",
      })
    );
  });
});

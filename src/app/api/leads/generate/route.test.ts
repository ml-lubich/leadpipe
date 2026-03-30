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

vi.mock("openai", () => ({
  default: vi.fn(),
}));

const originalEnv = process.env;

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
  delete process.env.OPENAI_API_KEY;

  // Reset chain defaults
  mockClient._chain.select.mockReturnValue(mockClient._chain);
  mockClient._chain.insert.mockReturnValue(mockClient._chain);
  mockClient._chain.update.mockReturnValue(mockClient._chain);
  mockClient._chain.eq.mockReturnValue(mockClient._chain);
  mockClient._chain.single.mockResolvedValue({ data: null, error: null });
  mockClient.from.mockReturnValue(mockClient._chain);
  mockClient.auth.getUser.mockResolvedValue({ data: { user: TEST_USER }, error: null });
});

describe("POST /api/leads/generate", () => {
  it("returns 401 without auth", async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const request = new Request("http://localhost/api/leads/generate", {
      method: "POST",
      body: JSON.stringify({ campaign_id: "campaign-456" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 without campaign_id", async () => {
    const request = new Request("http://localhost/api/leads/generate", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("campaign_id");
  });

  it("returns 403 when lead limit reached", async () => {
    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { subscription_tier: "free", scrape_count_this_month: 25 },
        error: null,
      }),
    };

    mockClient.from.mockReturnValueOnce(profileChain as never);

    const request = new Request("http://localhost/api/leads/generate", {
      method: "POST",
      body: JSON.stringify({ campaign_id: "campaign-456" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain("Lead limit reached");
  });

  it("returns 404 when campaign not found", async () => {
    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { subscription_tier: "free", scrape_count_this_month: 0 },
        error: null,
      }),
    };

    const campaignChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockClient.from
      .mockReturnValueOnce(profileChain as never)
      .mockReturnValueOnce(campaignChain as never);

    const request = new Request("http://localhost/api/leads/generate", {
      method: "POST",
      body: JSON.stringify({ campaign_id: "nonexistent-id" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Campaign not found");
  });

  it("generates mock leads when no OPENAI_API_KEY", async () => {
    const mockLeads = [
      { id: "lead-1", business_name: "Pro Plumbing", lead_score: 65 },
      { id: "lead-2", business_name: "Elite Pipes", lead_score: 45 },
    ];

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { subscription_tier: "free", scrape_count_this_month: 0 },
        error: null,
      }),
    };

    const campaignChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: TEST_CAMPAIGN, error: null }),
    };

    const leadsChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: mockLeads, error: null }),
    };

    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockClient.from
      .mockReturnValueOnce(profileChain as never)
      .mockReturnValueOnce(campaignChain as never)
      .mockReturnValueOnce(leadsChain as never)
      .mockReturnValueOnce(updateChain as never);

    mockClient.rpc.mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const request = new Request("http://localhost/api/leads/generate", {
      method: "POST",
      body: JSON.stringify({ campaign_id: TEST_CAMPAIGN.id }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.leads).toEqual(mockLeads);
    expect(body.source).toBe("mock");
  });
});

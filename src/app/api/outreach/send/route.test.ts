import { describe, it, expect, vi, beforeEach } from "vitest";
import { TEST_USER, TEST_CAMPAIGN, TEST_LEAD } from "@/__tests__/helpers";

const TEST_OUTREACH = {
  id: "outreach-001",
  lead_id: TEST_LEAD.id,
  campaign_id: TEST_CAMPAIGN.id,
  subject: "Grow your business",
  body: "Hello, I noticed your business...",
  status: "draft" as const,
  sent_at: null,
  leads: {
    email: TEST_LEAD.email,
    business_name: TEST_LEAD.business_name,
    campaign_id: TEST_CAMPAIGN.id,
  },
};

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
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      _chain: chain,
    },
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  rateLimitResponse: vi.fn(),
}));

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/outreach/send", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.RESEND_API_KEY;

  mockClient._chain.select.mockReturnValue(mockClient._chain);
  mockClient._chain.insert.mockReturnValue(mockClient._chain);
  mockClient._chain.update.mockReturnValue(mockClient._chain);
  mockClient._chain.delete.mockReturnValue(mockClient._chain);
  mockClient._chain.eq.mockReturnValue(mockClient._chain);
  mockClient._chain.in.mockReturnValue(mockClient._chain);
  mockClient._chain.order.mockReturnValue(mockClient._chain);
  mockClient._chain.single.mockResolvedValue({ data: null, error: null });
  mockClient.from.mockReturnValue(mockClient._chain);
  mockClient.rpc.mockResolvedValue({ data: null, error: null });
  mockClient.auth.getUser.mockResolvedValue({ data: { user: TEST_USER }, error: null });
});

describe("POST /api/outreach/send", () => {
  it("returns 401 without auth", async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await POST(makeRequest({ outreach_ids: ["id-1"] }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 with missing outreach_ids", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("outreach_ids");
  });

  it("returns 400 with empty outreach_ids", async () => {
    const response = await POST(makeRequest({ outreach_ids: [] }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("outreach_ids");
  });

  it("returns 400 when outreach_ids exceeds max batch size", async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `id-${i}`);

    const response = await POST(makeRequest({ outreach_ids: ids }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Maximum 50");
  });

  it("returns 404 when no draft outreach items found", async () => {
    // First from("outreach") call returns empty
    const outreachChain: Record<string, ReturnType<typeof vi.fn>> = {};
    outreachChain.select = vi.fn().mockReturnValue(outreachChain);
    outreachChain.in = vi.fn().mockReturnValue(outreachChain);
    outreachChain.eq = vi.fn().mockResolvedValue({ data: [], error: null });

    mockClient.from.mockReturnValueOnce(outreachChain);

    const response = await POST(makeRequest({ outreach_ids: ["id-1"] }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toContain("No draft outreach items found");
  });

  it("returns 403 when user does not own the campaigns", async () => {
    const outreachItem = { ...TEST_OUTREACH, campaign_id: "other-campaign" };

    // from("outreach") - returns items
    const outreachChain: Record<string, ReturnType<typeof vi.fn>> = {};
    outreachChain.select = vi.fn().mockReturnValue(outreachChain);
    outreachChain.in = vi.fn().mockReturnValue(outreachChain);
    outreachChain.eq = vi.fn().mockResolvedValue({ data: [outreachItem], error: null });

    // from("campaigns") - ownership check returns empty (user doesn't own)
    const campaignChain: Record<string, ReturnType<typeof vi.fn>> = {};
    campaignChain.select = vi.fn().mockReturnValue(campaignChain);
    campaignChain.in = vi.fn().mockReturnValue(campaignChain);
    campaignChain.eq = vi.fn().mockResolvedValue({ data: [], error: null });

    mockClient.from
      .mockReturnValueOnce(outreachChain)   // from("outreach")
      .mockReturnValueOnce(campaignChain);  // from("campaigns") ownership

    const response = await POST(makeRequest({ outreach_ids: [outreachItem.id] }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Unauthorized");
  });

  it("successfully sends and updates outreach items in simulated mode", async () => {
    const outreachItem = { ...TEST_OUTREACH };
    const updatedItem = { ...outreachItem, status: "sent", sent_at: expect.any(String) };

    // from("outreach") - fetch drafts
    const outreachChain: Record<string, ReturnType<typeof vi.fn>> = {};
    outreachChain.select = vi.fn().mockReturnValue(outreachChain);
    outreachChain.in = vi.fn().mockReturnValue(outreachChain);
    outreachChain.eq = vi.fn().mockResolvedValue({ data: [outreachItem], error: null });

    // from("campaigns") - ownership check
    const campaignChain: Record<string, ReturnType<typeof vi.fn>> = {};
    campaignChain.select = vi.fn().mockReturnValue(campaignChain);
    campaignChain.in = vi.fn().mockReturnValue(campaignChain);
    campaignChain.eq = vi.fn().mockResolvedValue({
      data: [{ id: TEST_CAMPAIGN.id }],
      error: null,
    });

    // from("outreach") - update status to sent
    const updateChain: Record<string, ReturnType<typeof vi.fn>> = {};
    updateChain.update = vi.fn().mockReturnValue(updateChain);
    updateChain.in = vi.fn().mockReturnValue(updateChain);
    updateChain.select = vi.fn().mockResolvedValue({ data: [updatedItem], error: null });

    // from("leads") - update status to contacted
    const leadsChain: Record<string, ReturnType<typeof vi.fn>> = {};
    leadsChain.update = vi.fn().mockReturnValue(leadsChain);
    leadsChain.in = vi.fn().mockReturnValue(leadsChain);
    leadsChain.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    mockClient.from
      .mockReturnValueOnce(outreachChain)   // from("outreach") fetch
      .mockReturnValueOnce(campaignChain)   // from("campaigns") ownership
      .mockReturnValueOnce(updateChain)     // from("outreach") update
      .mockReturnValueOnce(leadsChain);     // from("leads") update

    const response = await POST(makeRequest({ outreach_ids: [outreachItem.id] }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.outreach).toHaveLength(1);
    expect(body.outreach[0].status).toBe("sent");

    // Verify atomic increment was called via RPC
    expect(mockClient.rpc).toHaveBeenCalledWith("increment_campaign_emails_sent", {
      p_campaign_id: TEST_CAMPAIGN.id,
      p_count: 1,
    });
  });
});

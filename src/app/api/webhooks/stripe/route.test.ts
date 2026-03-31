import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mocks ---

const { mockStripe, mockAdminClient } = vi.hoisted(() => {
  const mockStripe = {
    webhooks: {
      constructEvent: vi.fn(),
    },
  };

  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockResolvedValue({ error: null });

  const mockAdminClient = {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  };

  return { mockStripe, mockAdminClient };
});

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => mockStripe),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockAdminClient),
}));

import { POST } from "./route";
import { getStripe } from "@/lib/stripe";

// --- Helpers ---

function makeRequest(body: string, signature: string | null = "sig_test") {
  const headers = new Headers();
  if (signature !== null) {
    headers.set("stripe-signature", signature);
  }
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers,
  });
}

function makeEvent(type: string, data: Record<string, unknown>) {
  return { type, data: { object: data } };
}

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();

  // Reset chain defaults
  mockAdminClient._chain.select.mockReturnValue(mockAdminClient._chain);
  mockAdminClient._chain.update.mockReturnValue(mockAdminClient._chain);
  mockAdminClient._chain.eq.mockResolvedValue({ error: null });
  mockAdminClient.from.mockReturnValue(mockAdminClient._chain);

  // Default env vars
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-test";
});

describe("POST /api/webhooks/stripe", () => {
  // --- Error cases ---

  describe("error handling", () => {
    it("returns 503 when Stripe is not configured", async () => {
      vi.mocked(getStripe).mockReturnValueOnce(null);

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error).toBe("Stripe not configured");
    });

    it("returns 400 when stripe-signature header is missing", async () => {
      const response = await POST(makeRequest("{}", null));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing signature");
    });

    it("returns 400 when STRIPE_WEBHOOK_SECRET is not set", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing signature");
    });

    it("returns 400 when signature verification fails", async () => {
      mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error("Invalid signature");
      });

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Webhook signature verification failed");
      expect(body.error).toContain("Invalid signature");
    });

    it("returns 503 when database is not configured", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {})
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error).toBe("Database not configured");
    });

    it("returns 503 when SUPABASE_SERVICE_ROLE_KEY is not set", async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {})
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error).toBe("Database not configured");
    });
  });

  // --- checkout.session.completed ---

  describe("checkout.session.completed", () => {
    it("updates user subscription tier and status on successful checkout", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: { supabase_user_id: "user-123", tier: "pro" },
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(mockAdminClient.from).toHaveBeenCalledWith("profiles");
      expect(mockAdminClient._chain.update).toHaveBeenCalledWith({
        subscription_tier: "pro",
        subscription_status: "active",
        stripe_customer_id: "cus_abc123",
      });
      expect(mockAdminClient._chain.eq).toHaveBeenCalledWith("id", "user-123");
    });

    it("handles agency tier checkout", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: { supabase_user_id: "user-456", tier: "agency" },
          customer: "cus_def456",
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);

      expect(mockAdminClient._chain.update).toHaveBeenCalledWith({
        subscription_tier: "agency",
        subscription_status: "active",
        stripe_customer_id: "cus_def456",
      });
      expect(mockAdminClient._chain.eq).toHaveBeenCalledWith("id", "user-456");
    });

    it("handles null metadata gracefully", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: null,
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);
      expect(mockAdminClient._chain.update).not.toHaveBeenCalled();
    });

    it("skips update when metadata is missing user_id", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: { tier: "pro" },
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(mockAdminClient._chain.update).not.toHaveBeenCalled();
    });

    it("skips update when metadata is missing tier", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: { supabase_user_id: "user-123" },
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);
      expect(mockAdminClient._chain.update).not.toHaveBeenCalled();
    });
  });

  // --- customer.subscription.updated ---

  describe("customer.subscription.updated", () => {
    it("updates subscription status to active", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.updated", {
          customer: "cus_abc123",
          status: "active",
          current_period_start: 1735689600, // 2025-01-01T00:00:00Z
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);

      expect(mockAdminClient.from).toHaveBeenCalledWith("profiles");
      expect(mockAdminClient._chain.update).toHaveBeenCalledWith({
        subscription_status: "active",
        current_period_start: new Date(1735689600 * 1000).toISOString(),
      });
      expect(mockAdminClient._chain.eq).toHaveBeenCalledWith(
        "stripe_customer_id",
        "cus_abc123"
      );
    });

    it("maps trialing status correctly", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.updated", {
          customer: "cus_abc123",
          status: "trialing",
          current_period_start: 1735689600,
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);

      expect(mockAdminClient._chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_status: "trialing",
        })
      );
    });

    it("maps past_due status correctly", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.updated", {
          customer: "cus_abc123",
          status: "past_due",
          current_period_start: 1735689600,
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);

      expect(mockAdminClient._chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_status: "past_due",
        })
      );
    });

    it("maps unknown statuses to canceled", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.updated", {
          customer: "cus_abc123",
          status: "unpaid",
          current_period_start: 1735689600,
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);

      expect(mockAdminClient._chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_status: "canceled",
        })
      );
    });

    it("handles missing current_period_start gracefully", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.updated", {
          customer: "cus_abc123",
          status: "active",
        })
      );

      const response = await POST(makeRequest("{}"));
      expect(response.status).toBe(200);

      expect(mockAdminClient._chain.update).toHaveBeenCalledWith({
        subscription_status: "active",
        current_period_start: null,
      });
    });
  });

  // --- customer.subscription.deleted ---

  describe("customer.subscription.deleted", () => {
    it("resets user to free tier on subscription deletion", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.deleted", {
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      expect(mockAdminClient.from).toHaveBeenCalledWith("profiles");
      expect(mockAdminClient._chain.update).toHaveBeenCalledWith({
        subscription_tier: "free",
        subscription_status: "canceled",
        current_period_start: null,
      });
      expect(mockAdminClient._chain.eq).toHaveBeenCalledWith(
        "stripe_customer_id",
        "cus_abc123"
      );
    });
  });

  // --- Database error handling ---

  describe("database error handling", () => {
    it("returns 500 when checkout profile update fails", async () => {
      mockAdminClient._chain.eq.mockResolvedValueOnce({
        error: { message: "Row not found", code: "PGRST116" },
      });

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: { supabase_user_id: "user-123", tier: "pro" },
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database update failed");
    });

    it("returns 500 when subscription update fails", async () => {
      mockAdminClient._chain.eq.mockResolvedValueOnce({
        error: { message: "Connection refused", code: "08006" },
      });

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.updated", {
          customer: "cus_abc123",
          status: "active",
          current_period_start: 1735689600,
        })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database update failed");
    });

    it("returns 500 when subscription deletion update fails", async () => {
      mockAdminClient._chain.eq.mockResolvedValueOnce({
        error: { message: "Timeout", code: "57014" },
      });

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("customer.subscription.deleted", {
          customer: "cus_abc123",
        })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database update failed");
    });
  });

  // --- Unhandled event types ---

  describe("unhandled event types", () => {
    it("returns success for unrecognized event types", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("payment_intent.succeeded", { id: "pi_123" })
      );

      const response = await POST(makeRequest("{}"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
      // No DB updates for unhandled events
      expect(mockAdminClient._chain.update).not.toHaveBeenCalled();
    });
  });

  // --- Signature verification ---

  describe("signature verification", () => {
    it("passes correct arguments to constructEvent", async () => {
      mockStripe.webhooks.constructEvent.mockReturnValueOnce(
        makeEvent("checkout.session.completed", {
          metadata: {},
          customer: "cus_test",
        })
      );

      const requestBody = '{"test":"payload"}';
      await POST(makeRequest(requestBody, "sig_test_123"));

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        requestBody,
        "sig_test_123",
        "whsec_test"
      );
    });
  });
});

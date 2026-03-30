import { vi } from "vitest";

interface MockUser {
  id: string;
  email: string;
}

const DEFAULT_USER: MockUser = {
  id: "user-123",
  email: "test@example.com",
};

function createChainMock() {
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

  return chain;
}

export function createMockSupabaseClient(user: MockUser | null = DEFAULT_USER) {
  const chain = createChainMock();

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue(chain),
    rpc: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    _chain: chain,
  };

  return client;
}

export const TEST_USER = DEFAULT_USER;

export const TEST_CAMPAIGN = {
  id: "campaign-456",
  user_id: DEFAULT_USER.id,
  name: "Plumbers in Austin",
  trade_type: "Plumbers",
  location: "Austin, TX",
  status: "active" as const,
  leads_found: 5,
  emails_sent: 0,
  replies_received: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export const TEST_LEAD = {
  id: "lead-789",
  campaign_id: TEST_CAMPAIGN.id,
  business_name: "Pro Plumbing",
  owner_name: "Mike Johnson",
  phone: "(555) 100-1000",
  email: "contact@proplumbing.com",
  website: "https://proplumbing.com",
  address: "100 Main St, Austin, TX",
  google_rating: 4.2,
  review_count: 15,
  has_website: true,
  lead_score: 40,
  status: "new" as const,
  created_at: "2026-01-01T00:00:00Z",
};

export const TEST_TEMPLATE = {
  id: "template-101",
  user_id: DEFAULT_USER.id,
  name: "Default Outreach",
  trade_type: "Plumbers",
  subject_template: "Hi {{owner_name}}, grow your {{trade_type}} business",
  body_template: "Hello {{owner_name}}, I noticed {{business_name}} has {{review_count}} reviews.",
  created_at: "2026-01-01T00:00:00Z",
};

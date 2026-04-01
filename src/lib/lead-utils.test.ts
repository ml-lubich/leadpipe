import { describe, it, expect } from "vitest";
import {
  getGapsList,
  getScoreColor,
  getScoreTextColor,
  buildConversionFunnel,
  calculateCampaignHealth,
} from "./lead-utils";
import { DigitalGaps, Lead, LeadStatus } from "@/types";

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    user_id: "user-1",
    campaign_id: "camp-1",
    business_name: "Test Plumbing",
    owner_name: "John",
    trade: "plumber",
    city: "Austin",
    phone: "555-0100",
    email: "john@test.com",
    website: "https://test.com",
    address: "123 Main St",
    google_rating: 4.5,
    review_count: 20,
    website_score: 60,
    lead_score: 7,
    digital_gaps: {
      no_website: false,
      no_online_booking: false,
      no_reviews_page: false,
      poor_mobile: false,
      no_seo: false,
      no_social_media: false,
      no_ssl: false,
      outdated_design: false,
    },
    status: "new",
    notes: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getGapsList
// ---------------------------------------------------------------------------
describe("getGapsList", () => {
  it("returns empty array when gaps is null or undefined", () => {
    expect(getGapsList(null as unknown as DigitalGaps)).toEqual([]);
    expect(getGapsList(undefined as unknown as DigitalGaps)).toEqual([]);
  });

  it("returns empty array when gaps is not an object", () => {
    expect(getGapsList("bad" as unknown as DigitalGaps)).toEqual([]);
    expect(getGapsList(42 as unknown as DigitalGaps)).toEqual([]);
  });

  it("returns empty array when no gaps are true", () => {
    const gaps = {
      no_website: false,
      no_online_booking: false,
      no_reviews_page: false,
      poor_mobile: false,
      no_seo: false,
      no_social_media: false,
      no_ssl: false,
      outdated_design: false,
    };
    expect(getGapsList(gaps)).toEqual([]);
  });

  it("returns short labels by default", () => {
    const gaps = { no_website: true, no_ssl: true };
    expect(getGapsList(gaps as unknown as DigitalGaps)).toEqual(["No website", "No SSL"]);
  });

  it("returns long labels when variant is 'long'", () => {
    const gaps = { no_website: true, poor_mobile: true };
    expect(getGapsList(gaps as unknown as DigitalGaps, "long")).toEqual([
      "No website",
      "Poor mobile experience",
    ]);
  });

  it("returns all gap labels when all are true", () => {
    const gaps = {
      no_website: true,
      no_online_booking: true,
      no_reviews_page: true,
      poor_mobile: true,
      no_seo: true,
      no_social_media: true,
      no_ssl: true,
      outdated_design: true,
    };
    expect(getGapsList(gaps)).toHaveLength(8);
  });

  it("uses the key as fallback for unknown gap keys", () => {
    const gaps = { unknown_gap: true };
    expect(getGapsList(gaps as unknown as DigitalGaps)).toEqual(["unknown_gap"]);
  });

  it("ignores gap entries that are not exactly true", () => {
    const gaps = { no_website: "yes", no_ssl: 1, poor_mobile: true };
    expect(getGapsList(gaps as unknown as DigitalGaps)).toEqual(["Poor mobile"]);
  });
});

// ---------------------------------------------------------------------------
// getScoreColor
// ---------------------------------------------------------------------------
describe("getScoreColor", () => {
  it("returns score-high for scores >= 7", () => {
    expect(getScoreColor(7)).toBe("score-high");
    expect(getScoreColor(10)).toBe("score-high");
  });

  it("returns score-medium for scores 4-6", () => {
    expect(getScoreColor(4)).toBe("score-medium");
    expect(getScoreColor(6)).toBe("score-medium");
  });

  it("returns score-low for scores < 4", () => {
    expect(getScoreColor(3)).toBe("score-low");
    expect(getScoreColor(0)).toBe("score-low");
  });
});

// ---------------------------------------------------------------------------
// getScoreTextColor
// ---------------------------------------------------------------------------
describe("getScoreTextColor", () => {
  it("returns green for scores >= 7", () => {
    expect(getScoreTextColor(7)).toBe("text-green-400");
    expect(getScoreTextColor(10)).toBe("text-green-400");
  });

  it("returns yellow for scores 4-6", () => {
    expect(getScoreTextColor(4)).toBe("text-yellow-400");
    expect(getScoreTextColor(6)).toBe("text-yellow-400");
  });

  it("returns red for scores < 4", () => {
    expect(getScoreTextColor(3)).toBe("text-red-400");
    expect(getScoreTextColor(0)).toBe("text-red-400");
  });
});

// ---------------------------------------------------------------------------
// buildConversionFunnel
// ---------------------------------------------------------------------------
describe("buildConversionFunnel", () => {
  it("returns empty array for no leads", () => {
    expect(buildConversionFunnel([])).toEqual([]);
  });

  it("returns all 6 stages with correct labels", () => {
    const funnel = buildConversionFunnel([makeLead()]);
    expect(funnel).toHaveLength(6);
    expect(funnel.map((s) => s.status)).toEqual([
      "new",
      "researched",
      "contacted",
      "replied",
      "meeting",
      "closed",
    ]);
    expect(funnel.map((s) => s.label)).toEqual([
      "New",
      "Researched",
      "Contacted",
      "Replied",
      "Meeting",
      "Closed",
    ]);
  });

  it("computes cumulative counts correctly", () => {
    // 2 new, 1 researched, 1 contacted
    const leads = [
      makeLead({ status: "new" }),
      makeLead({ status: "new" }),
      makeLead({ status: "researched" }),
      makeLead({ status: "contacted" }),
    ];
    const funnel = buildConversionFunnel(leads);

    // cumulative: new=4 (all), researched=2 (researched+contacted), contacted=1, replied=0, meeting=0, closed=0
    expect(funnel[0].count).toBe(4); // new: 2+1+1+0+0+0
    expect(funnel[1].count).toBe(2); // researched: 1+1+0+0+0
    expect(funnel[2].count).toBe(1); // contacted: 1+0+0+0
    expect(funnel[3].count).toBe(0); // replied
    expect(funnel[4].count).toBe(0); // meeting
    expect(funnel[5].count).toBe(0); // closed
  });

  it("computes percentages as rounded integers", () => {
    const leads = [
      makeLead({ status: "new" }),
      makeLead({ status: "new" }),
      makeLead({ status: "contacted" }),
    ];
    const funnel = buildConversionFunnel(leads);

    expect(funnel[0].percentage).toBe(100); // 3/3
    expect(funnel[1].percentage).toBe(33); // 1/3 rounded
    expect(funnel[2].percentage).toBe(33); // 1/3 rounded
  });

  it("sets conversionFromPrevious to null for the first stage", () => {
    const funnel = buildConversionFunnel([makeLead()]);
    expect(funnel[0].conversionFromPrevious).toBeNull();
  });

  it("computes conversion rates between stages", () => {
    // 3 new, 2 researched, 1 contacted
    const leads = [
      makeLead({ status: "new" }),
      makeLead({ status: "new" }),
      makeLead({ status: "new" }),
      makeLead({ status: "researched" }),
      makeLead({ status: "researched" }),
      makeLead({ status: "contacted" }),
    ];
    const funnel = buildConversionFunnel(leads);

    // cumulative: new=6, researched=3, contacted=1
    expect(funnel[0].conversionFromPrevious).toBeNull();
    expect(funnel[1].conversionFromPrevious).toBe(50); // 3/6 * 100
    expect(funnel[2].conversionFromPrevious).toBe(33); // 1/3 * 100 rounded
  });

  it("sets conversionFromPrevious to null when previous cumulative is 0", () => {
    // Only closed leads — earlier stages have 0 cumulative
    const leads = [makeLead({ status: "closed" })];
    const funnel = buildConversionFunnel(leads);

    // cumulative: new=1, researched=1 (closed counted), ..., closed=1
    // Actually all cumulative include closed: new=1, researched=1, etc.
    expect(funnel[0].count).toBe(1);
    expect(funnel[5].count).toBe(1);
  });

  it("handles single lead at each status", () => {
    const statuses: LeadStatus[] = [
      "new",
      "researched",
      "contacted",
      "replied",
      "meeting",
      "closed",
    ];
    const leads = statuses.map((status) => makeLead({ status }));
    const funnel = buildConversionFunnel(leads);

    expect(funnel[0].count).toBe(6); // all
    expect(funnel[1].count).toBe(5); // researched onward
    expect(funnel[2].count).toBe(4);
    expect(funnel[3].count).toBe(3);
    expect(funnel[4].count).toBe(2);
    expect(funnel[5].count).toBe(1);

    expect(funnel[0].percentage).toBe(100);
    expect(funnel[5].percentage).toBe(17); // 1/6 rounded
  });

  it("all leads in same status gives 100% at that stage", () => {
    const leads = [
      makeLead({ status: "new" }),
      makeLead({ status: "new" }),
      makeLead({ status: "new" }),
    ];
    const funnel = buildConversionFunnel(leads);

    expect(funnel[0].count).toBe(3);
    expect(funnel[0].percentage).toBe(100);
    expect(funnel[1].count).toBe(0);
    expect(funnel[1].percentage).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateCampaignHealth
// ---------------------------------------------------------------------------
describe("calculateCampaignHealth", () => {
  it("returns 0 for empty leads array", () => {
    expect(calculateCampaignHealth([])).toBe(0);
  });

  it("returns 0 when all leads are new (weight 0)", () => {
    const leads = [makeLead({ status: "new" }), makeLead({ status: "new" })];
    expect(calculateCampaignHealth(leads)).toBe(0);
  });

  it("returns 100 when all leads are closed (max weight)", () => {
    const leads = [
      makeLead({ status: "closed" }),
      makeLead({ status: "closed" }),
    ];
    expect(calculateCampaignHealth(leads)).toBe(100);
  });

  it("computes weighted health for mixed statuses", () => {
    // weights: new=0, researched=1, contacted=2, replied=4, meeting=6, closed=10
    // 1 new (0) + 1 contacted (2) = 2 actual, max = 2 * 10 = 20
    // health = round(2/20 * 100) = 10
    const leads = [
      makeLead({ status: "new" }),
      makeLead({ status: "contacted" }),
    ];
    expect(calculateCampaignHealth(leads)).toBe(10);
  });

  it("rounds the result to nearest integer", () => {
    // 1 researched (1), max = 10
    // health = round(1/10 * 100) = 10
    const leads = [makeLead({ status: "researched" })];
    expect(calculateCampaignHealth(leads)).toBe(10);
  });

  it("handles a single closed lead as 100", () => {
    expect(calculateCampaignHealth([makeLead({ status: "closed" })])).toBe(100);
  });

  it("computes correctly with all statuses represented", () => {
    // new=0, researched=1, contacted=2, replied=4, meeting=6, closed=10 => sum=23
    // max = 6 * 10 = 60
    // health = round(23/60 * 100) = round(38.33) = 38
    const leads: LeadStatus[] = [
      "new",
      "researched",
      "contacted",
      "replied",
      "meeting",
      "closed",
    ];
    expect(
      calculateCampaignHealth(leads.map((s) => makeLead({ status: s })))
    ).toBe(38);
  });

  it("handles unknown status gracefully (weight defaults to 0)", () => {
    const leads = [makeLead({ status: "unknown" as LeadStatus })];
    expect(calculateCampaignHealth(leads)).toBe(0);
  });
});

import { Lead, LeadStatus, LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/types";

const GAP_LABELS_SHORT: Record<string, string> = {
  no_website: "No website",
  no_online_booking: "No booking",
  no_reviews_page: "No reviews",
  poor_mobile: "Poor mobile",
  no_seo: "No SEO",
  no_social_media: "No social",
  no_ssl: "No SSL",
  outdated_design: "Outdated design",
};

const GAP_LABELS_LONG: Record<string, string> = {
  no_website: "No website",
  no_online_booking: "No online booking system",
  no_reviews_page: "No reviews/testimonials page",
  poor_mobile: "Poor mobile experience",
  no_seo: "Missing basic SEO",
  no_social_media: "No social media presence",
  no_ssl: "No SSL certificate",
  outdated_design: "Outdated website design",
};

export function getGapsList(
  gaps: Lead["digital_gaps"],
  variant: "short" | "long" = "short"
): string[] {
  if (!gaps || typeof gaps !== "object") return [];
  const labels = variant === "long" ? GAP_LABELS_LONG : GAP_LABELS_SHORT;
  return Object.entries(gaps)
    .filter(([, v]) => v === true)
    .map(([k]) => labels[k] || k);
}

export function getScoreColor(score: number): string {
  if (score >= 7) return "score-high";
  if (score >= 4) return "score-medium";
  return "score-low";
}

export function getScoreTextColor(score: number): string {
  if (score >= 7) return "text-green-400";
  if (score >= 4) return "text-yellow-400";
  return "text-red-400";
}

export interface FunnelStage {
  status: LeadStatus;
  label: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number | null;
}

export function buildConversionFunnel(leads: Lead[]): FunnelStage[] {
  const total = leads.length;
  if (total === 0) return [];

  const countByStatus: Record<LeadStatus, number> = {
    new: 0,
    researched: 0,
    contacted: 0,
    replied: 0,
    meeting: 0,
    closed: 0,
  };

  for (const lead of leads) {
    if (LEAD_STATUSES.includes(lead.status)) {
      countByStatus[lead.status]++;
    }
  }

  const cumulativeCounts = LEAD_STATUSES.map((status, i) => {
    let sum = 0;
    for (let j = i; j < LEAD_STATUSES.length; j++) {
      sum += countByStatus[LEAD_STATUSES[j]];
    }
    return sum;
  });

  return LEAD_STATUSES.map((status, i) => ({
    status,
    label: LEAD_STATUS_LABELS[status],
    count: cumulativeCounts[i],
    percentage: total > 0 ? Math.round((cumulativeCounts[i] / total) * 100) : 0,
    conversionFromPrevious:
      i === 0 || cumulativeCounts[i - 1] === 0
        ? null
        : Math.round((cumulativeCounts[i] / cumulativeCounts[i - 1]) * 100),
  }));
}

const HEALTH_SCORE_WEIGHTS: Record<LeadStatus, number> = {
  new: 0,
  researched: 1,
  contacted: 2,
  replied: 4,
  meeting: 6,
  closed: 10,
};

export function calculateCampaignHealth(leads: Lead[]): number {
  if (leads.length === 0) return 0;

  const maxPossible = leads.length * HEALTH_SCORE_WEIGHTS.closed;
  const actual = leads.reduce(
    (sum, lead) => sum + (HEALTH_SCORE_WEIGHTS[lead.status] ?? 0),
    0
  );

  return Math.round((actual / maxPossible) * 100);
}

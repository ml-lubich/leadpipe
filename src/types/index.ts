export type LeadStatus =
  | "new"
  | "researched"
  | "contacted"
  | "replied"
  | "meeting"
  | "closed";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "researched",
  "contacted",
  "replied",
  "meeting",
  "closed",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  researched: "Researched",
  contacted: "Contacted",
  replied: "Replied",
  meeting: "Meeting",
  closed: "Closed",
};

export interface DigitalGaps {
  no_website: boolean;
  no_online_booking: boolean;
  no_reviews_page: boolean;
  poor_mobile: boolean;
  no_seo: boolean;
  no_social_media: boolean;
  no_ssl: boolean;
  outdated_design: boolean;
}

export interface Lead {
  id: string;
  user_id: string;
  campaign_id: string | null;
  business_name: string;
  owner_name: string;
  trade: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  google_rating: number;
  review_count: number;
  website_score: number;
  digital_gaps: DigitalGaps;
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OutreachHistory {
  id: string;
  lead_id: string;
  type: "email" | "call" | "note";
  content: string;
  sent_at: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  trade: string;
  city: string;
  status: "active" | "paused" | "completed";
  leads_count: number;
  contacted_count: number;
  replied_count: number;
  meetings_count: number;
  revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  trade: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const TRADES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Landscaping",
  "Painting",
] as const;

export type Trade = (typeof TRADES)[number];

export const TIER_LIMITS = {
  free: { leads_per_month: 25, campaigns: 1 },
  starter: { leads_per_month: 100, campaigns: 5 },
  pro: { leads_per_month: 500, campaigns: 0 }, // 0 = unlimited
  enterprise: { leads_per_month: 0, campaigns: 0 }, // 0 = unlimited
} as const;

export const TEMPLATE_VARIABLES = [
  "{{business_name}}",
  "{{owner_name}}",
  "{{trade}}",
  "{{city}}",
  "{{gaps_found}}",
  "{{website_score}}",
  "{{google_rating}}",
  "{{review_count}}",
];

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_tier: "free" | "pro" | "agency";
  subscription_status: "active" | "canceled" | "past_due" | "trialing";
  scrape_count_this_month: number;
  current_period_start: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  trade_type: string;
  location: string;
  status: "active" | "paused" | "completed";
  leads_found: number;
  emails_sent: number;
  replies_received: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  campaign_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  google_rating: number;
  review_count: number;
  has_website: boolean;
  lead_score: number;
  status: "new" | "contacted" | "replied" | "converted";
  created_at: string;
}

export interface Outreach {
  id: string;
  lead_id: string;
  campaign_id: string;
  template_id: string | null;
  subject: string;
  body: string;
  status: "draft" | "sent" | "opened" | "replied";
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  trade_type: string;
  subject_template: string;
  body_template: string;
  created_at: string;
}

// Subscription tier limits
export const TIER_LIMITS = {
  free: { leads_per_month: 25, campaigns: 1 },
  pro: { leads_per_month: 500, campaigns: -1 },
  agency: { leads_per_month: -1, campaigns: -1 },
} as const;

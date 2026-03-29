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
  template_id: string;
  subject: string;
  body: string;
  status: "draft" | "sent" | "opened" | "replied";
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
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

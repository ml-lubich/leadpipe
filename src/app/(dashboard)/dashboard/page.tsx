import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { Campaign } from "@/types";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
};

const STAT_ICONS: Record<string, string> = {
  "Total Leads": "🎯",
  "Emails Sent": "📧",
  Replies: "💬",
  "Active Campaigns": "🚀",
};

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedCampaigns: Campaign[] = campaigns ?? [];

  const stats = [
    {
      label: "Total Leads",
      value: typedCampaigns.reduce((sum, c) => sum + c.leads_found, 0),
    },
    {
      label: "Emails Sent",
      value: typedCampaigns.reduce((sum, c) => sum + c.emails_sent, 0),
    },
    {
      label: "Replies",
      value: typedCampaigns.reduce((sum, c) => sum + c.replies_received, 0),
    },
    {
      label: "Active Campaigns",
      value: typedCampaigns.filter((c) => c.status === "active").length,
    },
  ];

  // Empty state for new users
  if (typedCampaigns.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to LeadPipe AI</h1>
          <p className="text-muted-foreground mt-1">
            Start generating leads for your trade business in minutes.
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold mb-2">
              Create your first campaign
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Pick your trade and target city, and we&apos;ll use AI to find and
              score the best leads for your business.
            </p>
            <Link href="/campaigns/new">
              <Button size="lg">Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">1. Create a Campaign</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Choose your trade type and target location to start discovering
              leads.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                2. Review AI-Scored Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Our AI analyzes each lead and assigns a quality score so you can
              focus on the best prospects.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">3. Send Outreach</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use AI-generated personalized emails to reach out and start winning
              new customers.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your lead generation campaigns
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button>New Campaign</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm flex items-center gap-1.5">
                <span>{STAT_ICONS[stat.label]}</span>
                {stat.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
        <div className="grid gap-4">
          {typedCampaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge className={statusColors[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {campaign.trade_type} &middot; {campaign.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>
                      <strong className="text-foreground">
                        {campaign.leads_found}
                      </strong>{" "}
                      leads
                    </span>
                    <span>
                      <strong className="text-foreground">
                        {campaign.emails_sent}
                      </strong>{" "}
                      sent
                    </span>
                    <span>
                      <strong className="text-foreground">
                        {campaign.replies_received}
                      </strong>{" "}
                      replies
                    </span>
                    <span
                      className="ml-auto text-xs"
                      title={new Date(campaign.updated_at).toLocaleString()}
                    >
                      Updated {formatRelativeTime(campaign.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

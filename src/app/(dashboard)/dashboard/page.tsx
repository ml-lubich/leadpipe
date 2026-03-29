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
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
};

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
              <CardDescription className="text-sm">{stat.label}</CardDescription>
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
        {typedCampaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="text-lg mb-2">No campaigns yet</p>
              <p className="text-sm mb-4">
                Create your first campaign to start finding leads.
              </p>
              <Link href="/campaigns/new">
                <Button>Create Campaign</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
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
                      <span className="ml-auto">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

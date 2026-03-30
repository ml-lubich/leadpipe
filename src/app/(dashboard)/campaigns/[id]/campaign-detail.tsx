"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Campaign, Lead } from "@/types";
import {
  buildConversionFunnel,
  calculateCampaignHealth,
  FunnelStage,
} from "@/lib/lead-utils";

const campaignStatusColors: Record<Campaign["status"], string> = {
  active: "status-contacted",
  paused: "status-new",
  completed: "status-closed",
};

const STAGE_COLORS = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-green-500",
];

function getHealthLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Excellent", color: "text-green-400" };
  if (score >= 40) return { text: "Good", color: "text-yellow-400" };
  if (score >= 15) return { text: "Needs Work", color: "text-orange-400" };
  return { text: "Just Started", color: "text-muted-foreground" };
}

function ConversionFunnel({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) return null;

  const maxCount = stages[0].count;

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const barWidth = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 4) : 0;
        return (
          <div key={stage.status} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{stage.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {stage.count}
                </span>
              </div>
              {stage.conversionFromPrevious !== null && (
                <span className="text-xs text-muted-foreground">
                  {stages[i - 1].label} &rarr; {stage.label}:{" "}
                  <span className="font-medium text-foreground">
                    {stage.conversionFromPrevious}%
                  </span>
                </span>
              )}
            </div>
            <div className="h-6 bg-muted/30 rounded-md overflow-hidden">
              <div
                className={`h-full rounded-md ${STAGE_COLORS[i]} transition-all duration-500`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CampaignDetail({
  campaign,
  leads,
}: {
  campaign: Campaign;
  leads: Lead[];
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const statusCounts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    replied: leads.filter((l) => l.status === "replied").length,
    meeting: leads.filter((l) => l.status === "meeting").length,
    closed: leads.filter((l) => l.status === "closed").length,
  };

  const funnelStages = useMemo(() => buildConversionFunnel(leads), [leads]);
  const healthScore = useMemo(() => calculateCampaignHealth(leads), [leads]);
  const healthLabel = getHealthLabel(healthScore);

  const deleteCampaign = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete campaign");
      }
      router.push("/campaigns");
    } catch {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/campaigns"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        &larr; Back to Campaigns
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <Badge className={campaignStatusColors[campaign.status]}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {campaign.trade} &middot;{" "}
            {campaign.city}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Leads", value: leads.length },
          { label: "Contacted", value: statusCounts.contacted },
          { label: "Replied", value: statusCounts.replied },
          { label: "Meetings", value: statusCounts.meeting },
          { label: "Closed", value: statusCounts.closed },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Analytics */}
      {leads.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversion Funnel</CardTitle>
              <CardDescription>
                Cumulative leads at or beyond each pipeline stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionFunnel stages={funnelStages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Campaign Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-2">
              <p className={`text-5xl font-bold tabular-nums ${healthLabel.color}`}>
                {healthScore}
              </p>
              <p className={`text-sm font-medium ${healthLabel.color}`}>
                {healthLabel.text}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Based on how far leads have progressed through the pipeline
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leads list */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No leads in this campaign</p>
            <p className="text-sm">
              Scrape new leads from the pipeline and assign them to this campaign.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {lead.business_name}
                    </CardTitle>
                    <Badge className={`status-${lead.status} text-xs`}>
                      {lead.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {lead.trade} &middot; {lead.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Score: {lead.website_score}/10</span>
                    {lead.google_rating > 0 && (
                      <span>
                        {lead.google_rating} &#9733; ({lead.review_count})
                      </span>
                    )}
                    {lead.phone && <span>{lead.phone}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteCampaign}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

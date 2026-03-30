"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Campaign, Lead } from "@/types";

function getScoreColor(score: number) {
  if (score >= 70)
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (score >= 50)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function getScoreLabel(score: number) {
  if (score >= 70) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  contacted:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  replied:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  converted:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const campaignStatusColors: Record<Campaign["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

type SortKey = "lead_score" | "review_count" | "business_name";

function StatusSummary({ leads }: { leads: Lead[] }) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      new: 0,
      contacted: 0,
      replied: 0,
      converted: 0,
    };
    for (const l of leads) {
      map[l.status] = (map[l.status] || 0) + 1;
    }
    return map;
  }, [leads]);

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(counts).map(([status, count]) => (
        <Badge key={status} className={statusColors[status]}>
          {status}: {count}
        </Badge>
      ))}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium">{lead.business_name}</p>
          <Badge className={getScoreColor(lead.lead_score)}>
            {lead.lead_score} — {getScoreLabel(lead.lead_score)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{lead.owner_name}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>{lead.phone}</span>
          <span className="text-muted-foreground">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {lead.has_website ? (
            <Badge variant="outline" className="text-xs">
              Has site
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              No site
            </Badge>
          )}
          <span className="font-medium">{lead.google_rating} ★</span>
          <span className="text-muted-foreground">
            ({lead.review_count} reviews)
          </span>
        </div>
        <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
      </CardContent>
    </Card>
  );
}

export default function CampaignDetail({
  campaign,
  leads: allLeads,
}: {
  campaign: Campaign;
  leads: Lead[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lead_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    const leads = allLeads.filter(
      (l) =>
        l.business_name.toLowerCase().includes(search.toLowerCase()) ||
        l.owner_name.toLowerCase().includes(search.toLowerCase())
    );
    leads.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return leads;
  }, [allLeads, search, sortBy, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortBy !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const handleGenerateLeads = async () => {
    setGeneratingLeads(true);
    setGenerateError("");
    try {
      const res = await fetch("/api/leads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaign.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate leads");
      }
      window.location.reload();
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Failed to generate leads"
      );
    } finally {
      setGeneratingLeads(false);
    }
  };

  const updateCampaignStatus = async (status: Campaign["status"]) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update campaign");
      }
      window.location.reload();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update campaign"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCampaign = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete campaign");
      }
      router.push("/dashboard");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete campaign"
      );
      setActionLoading(false);
    }
  };

  const scoreBreakdownColors = {
    Hot: "text-green-600 dark:text-green-400",
    Warm: "text-yellow-600 dark:text-yellow-400",
    Cold: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <Badge className={campaignStatusColors[campaign.status]}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {campaign.trade_type} &middot; {campaign.location} &middot;{" "}
            {allLeads.length} leads found
          </p>
          <div className="mt-2">
            <StatusSummary leads={allLeads} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateLeads}
            disabled={generatingLeads}
          >
            {generatingLeads ? "Generating..." : "Generate More Leads"}
          </Button>
          {allLeads.length > 0 && (
            <a
              href={`/api/campaigns/${campaign.id}/export`}
              download
            >
              <Button variant="outline">Export CSV</Button>
            </a>
          )}
          <Link href={`/campaigns/${campaign.id}/outreach`}>
            <Button>Generate Outreach</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" disabled={actionLoading}>
                {actionLoading ? "Updating..." : "Actions"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {campaign.status === "active" && (
                <DropdownMenuItem onClick={() => updateCampaignStatus("paused")}>
                  Pause Campaign
                </DropdownMenuItem>
              )}
              {campaign.status === "paused" && (
                <DropdownMenuItem onClick={() => updateCampaignStatus("active")}>
                  Resume Campaign
                </DropdownMenuItem>
              )}
              {campaign.status !== "completed" && (
                <DropdownMenuItem onClick={() => updateCampaignStatus("completed")}>
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(generateError || actionError) && (
        <p className="text-sm text-destructive">{generateError || actionError}</p>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This
              will permanently remove the campaign and all its leads. This action
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

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {(["Hot", "Warm", "Cold"] as const).map((label) => {
          const count = allLeads.filter(
            (l) => getScoreLabel(l.lead_score) === label
          ).length;
          return (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardDescription>{label} Leads</CardDescription>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-3xl font-bold ${scoreBreakdownColors[label]}`}
                >
                  {count}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <div className="mx-auto mb-4 text-4xl">📋</div>
            <p className="text-lg font-medium mb-2">No leads yet</p>
            <p className="text-sm mb-4">
              Generate leads for this campaign to get started with outreach.
            </p>
            <Button onClick={handleGenerateLeads} disabled={generatingLeads}>
              {generatingLeads ? "Generating..." : "Generate Leads"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="flex gap-4">
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Lead table — desktop */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("business_name")}
                    >
                      Business{sortIndicator("business_name")}
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("review_count")}
                    >
                      Reviews{sortIndicator("review_count")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("lead_score")}
                    >
                      Score{sortIndicator("lead_score")}
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.business_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.owner_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{lead.phone}</p>
                          <p className="text-muted-foreground">{lead.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.has_website ? (
                          <Badge variant="outline" className="text-xs">
                            Has site
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            No site
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">
                            {lead.google_rating} ★
                          </span>
                          <span className="text-muted-foreground ml-1">
                            ({lead.review_count})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreColor(lead.lead_score)}>
                          {lead.lead_score} — {getScoreLabel(lead.lead_score)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status]}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lead cards — mobile */}
          <div className="md:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}

      {/* Scoring explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Lead Scoring Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">
                Higher Score = Needs Your Help More
              </p>
              <ul className="space-y-1">
                <li>+25 pts — No website</li>
                <li>+20 pts — Under 10 Google reviews</li>
                <li>+15 pts — Rating below 4.0</li>
                <li>+10 pts — No social media presence</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Score Ranges</p>
              <ul className="space-y-1">
                <li>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mr-2">
                    70-100
                  </Badge>{" "}
                  Hot — likely to convert
                </li>
                <li>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 mr-2">
                    50-69
                  </Badge>{" "}
                  Warm — worth reaching out
                </li>
                <li>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 mr-2">
                    20-49
                  </Badge>{" "}
                  Cold — lower priority
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

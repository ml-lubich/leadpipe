"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  Lead,
  LeadStatus,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  TRADES,
} from "@/types";

function getScoreColor(score: number) {
  if (score >= 7) return "score-high";
  if (score >= 4) return "score-medium";
  return "score-low";
}

function getGapsList(gaps: Lead["digital_gaps"]): string[] {
  if (!gaps || typeof gaps !== "object") return [];
  const labels: Record<string, string> = {
    no_website: "No website",
    no_online_booking: "No booking",
    no_reviews_page: "No reviews",
    poor_mobile: "Poor mobile",
    no_seo: "No SEO",
    no_social_media: "No social",
    no_ssl: "No SSL",
    outdated_design: "Outdated design",
  };
  return Object.entries(gaps)
    .filter(([, v]) => v === true)
    .map(([k]) => labels[k] || k);
}

function LeadCard({ lead }: { lead: Lead }) {
  const gaps = getGapsList(lead.digital_gaps);

  return (
    <Link href={`/leads/${lead.id}`}>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer group">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {lead.business_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {lead.trade} &middot; {lead.city}
              </p>
            </div>
            <div className={`text-lg font-bold tabular-nums ${getScoreColor(lead.website_score)}`}>
              {lead.website_score}/10
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {lead.google_rating > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-400">&#9733;</span>
                {lead.google_rating}
                <span className="text-muted-foreground/60">
                  ({lead.review_count})
                </span>
              </span>
            )}
            {lead.phone && <span>{lead.phone}</span>}
          </div>

          {gaps.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {gaps.slice(0, 3).map((gap) => (
                <Badge
                  key={gap}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/20"
                >
                  {gap}
                </Badge>
              ))}
              {gaps.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{gaps.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function PipelineColumn({
  status,
  leads,
  onDrop,
}: {
  status: LeadStatus;
  leads: Lead[];
  onDrop: (leadId: string, status: LeadStatus) => void;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-accent/30");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-accent/30");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-accent/30");
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) onDrop(leadId, status);
  };

  return (
    <div
      className="flex-1 min-w-[260px] max-w-[320px]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <Badge className={`status-${status} text-xs font-medium`}>
          {LEAD_STATUS_LABELS[status]}
        </Badge>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {leads.map((lead) => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
            className="cursor-grab active:cursor-grabbing"
          >
            <LeadCard lead={lead} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PipelineDashboard({
  leads: initialLeads,
  userId,
}: {
  leads: Lead[];
  userId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const cities = useMemo(() => {
    const set = new Set(initialLeads.map((l) => l.city).filter(Boolean));
    return Array.from(set).sort();
  }, [initialLeads]);

  const filteredLeads = useMemo(() => {
    return initialLeads.filter((lead) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !lead.business_name.toLowerCase().includes(q) &&
          !lead.city.toLowerCase().includes(q) &&
          !lead.trade.toLowerCase().includes(q)
        )
          return false;
      }
      if (tradeFilter !== "all" && lead.trade !== tradeFilter) return false;
      if (cityFilter !== "all" && lead.city !== cityFilter) return false;
      return true;
    });
  }, [initialLeads, search, tradeFilter, cityFilter]);

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      new: [],
      researched: [],
      contacted: [],
      replied: [],
      meeting: [],
      closed: [],
    };
    for (const lead of filteredLeads) {
      const status = LEAD_STATUSES.includes(lead.status as LeadStatus)
        ? (lead.status as LeadStatus)
        : "new";
      map[status].push(lead);
    }
    return map;
  }, [filteredLeads]);

  const stats = useMemo(() => {
    const total = initialLeads.length;
    const avgScore =
      total > 0
        ? (
            initialLeads.reduce((sum, l) => sum + (l.website_score || 0), 0) /
            total
          ).toFixed(1)
        : "0";
    const highOpp = initialLeads.filter(
      (l) => (l.website_score || 0) >= 7
    ).length;
    const contacted = initialLeads.filter(
      (l) => l.status !== "new" && l.status !== "researched"
    ).length;
    return { total, avgScore, highOpp, contacted };
  }, [initialLeads]);

  const handleDrop = async (leadId: string, newStatus: LeadStatus) => {
    const supabase = createClient();
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    router.refresh();
  };

  const handleScrape = async () => {
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade: tradeFilter !== "all" ? tradeFilter : "HVAC", city: "Los Angeles", radius: 25 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Scrape failed");
      }
      router.refresh();
    } catch (err) {
      setScrapeError(
        err instanceof Error ? err.message : "Scrape failed"
      );
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} businesses &middot; {stats.highOpp} high opportunity &middot; {stats.contacted} contacted
          </p>
        </div>
        <Button onClick={handleScrape} disabled={scraping}>
          {scraping ? "Scraping..." : "Scrape New Leads"}
        </Button>
      </div>

      {scrapeError && (
        <p className="text-sm text-destructive">{scrapeError}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: stats.total },
          { label: "Avg Website Score", value: stats.avgScore + "/10" },
          { label: "High Opportunity", value: stats.highOpp },
          { label: "Contacted", value: stats.contacted },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={tradeFilter} onValueChange={setTradeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All trades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All trades</SelectItem>
            {TRADES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            leads={leadsByStatus[status]}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

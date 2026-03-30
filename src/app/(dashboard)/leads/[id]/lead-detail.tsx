"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  OutreachHistory,
  LeadStatus,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "@/types";

function getGapsList(gaps: Lead["digital_gaps"]): string[] {
  if (!gaps || typeof gaps !== "object") return [];
  const labels: Record<string, string> = {
    no_website: "No website",
    no_online_booking: "No online booking system",
    no_reviews_page: "No reviews/testimonials page",
    poor_mobile: "Poor mobile experience",
    no_seo: "Missing basic SEO",
    no_social_media: "No social media presence",
    no_ssl: "No SSL certificate",
    outdated_design: "Outdated website design",
  };
  return Object.entries(gaps)
    .filter(([, v]) => v === true)
    .map(([k]) => labels[k] || k);
}

function getScoreColor(score: number) {
  if (score >= 7) return "text-green-400";
  if (score >= 4) return "text-yellow-400";
  return "text-red-400";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadDetail({
  lead,
  outreach,
}: {
  lead: Lead;
  outreach: OutreachHistory[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const gaps = getGapsList(lead.digital_gaps);

  const handleStatusChange = async (newStatus: string) => {
    const s = newStatus as LeadStatus;
    setStatus(s);
    const supabase = createClient();
    await supabase.from("leads").update({ status: s }).eq("id", lead.id);
    router.refresh();
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("leads").update({ notes }).eq("id", lead.id);
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const supabase = createClient();
    await supabase.from("outreach_history").insert({
      lead_id: lead.id,
      type: "note",
      content: newNote.trim(),
    });
    setNewNote("");
    setAddingNote(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        &larr; Back to Pipeline
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lead.business_name}</h1>
          <p className="text-muted-foreground">
            {lead.trade} &middot; {lead.city}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Website Score */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Website Score</p>
            <p className={`text-4xl font-bold ${getScoreColor(lead.website_score)}`}>
              {lead.website_score}/10
            </p>
          </CardContent>
        </Card>

        {/* Google Rating */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Google Rating</p>
            <p className="text-4xl font-bold text-yellow-400">
              {lead.google_rating > 0 ? `${lead.google_rating}` : "N/A"}
              {lead.google_rating > 0 && <span className="text-lg"> &#9733;</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {lead.review_count} reviews
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pipeline Stage</p>
            <Badge className={`status-${status} text-sm px-3 py-1 mt-1`}>
              {LEAD_STATUS_LABELS[status]}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {lead.phone && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <a
                  href={`tel:${lead.phone}`}
                  className="text-primary hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.email && (
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-primary hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            )}
            {lead.website && (
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                <a
                  href={
                    lead.website.startsWith("http")
                      ? lead.website
                      : `https://${lead.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {lead.website}
                </a>
              </div>
            )}
            {lead.address && (
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p>{lead.address}</p>
              </div>
            )}
            {lead.owner_name && (
              <div>
                <p className="text-xs text-muted-foreground">Owner / Contact</p>
                <p>{lead.owner_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Digital Gaps / Website Audit */}
      {gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Digital Gaps Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2">
              {gaps.map((gap) => (
                <div
                  key={gap}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-destructive/5 border border-destructive/10"
                >
                  <span className="text-destructive">&#10005;</span>
                  {gap}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {lead.phone && (
          <a href={`tel:${lead.phone}`}>
            <Button variant="outline" size="sm">
              Call
            </Button>
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`}>
            <Button variant="outline" size="sm">
              Email
            </Button>
          </a>
        )}
        {status !== "closed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextIdx =
                LEAD_STATUSES.indexOf(status) + 1;
              if (nextIdx < LEAD_STATUSES.length) {
                handleStatusChange(LEAD_STATUSES[nextIdx]);
              }
            }}
          >
            Move to {LEAD_STATUS_LABELS[LEAD_STATUSES[Math.min(LEAD_STATUSES.indexOf(status) + 1, LEAD_STATUSES.length - 1)]]}
          </Button>
        )}
      </div>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this business..."
            rows={4}
          />
          <Button
            size="sm"
            onClick={handleSaveNotes}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Notes"}
          </Button>
        </CardContent>
      </Card>

      {/* Outreach History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Outreach History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add note */}
          <div className="space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Log a call, email, or note..."
              rows={2}
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
            >
              {addingNote ? "Adding..." : "Add Entry"}
            </Button>
          </div>

          {outreach.length > 0 && <Separator />}

          {outreach.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No outreach history yet.
            </p>
          ) : (
            <div className="space-y-3">
              {outreach.map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-3 text-sm p-3 rounded-lg bg-muted/30"
                >
                  <Badge
                    variant="outline"
                    className="text-xs h-fit shrink-0 capitalize"
                  >
                    {entry.type}
                  </Badge>
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

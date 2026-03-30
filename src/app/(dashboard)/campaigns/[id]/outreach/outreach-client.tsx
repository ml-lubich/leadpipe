"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Campaign, Lead, Template } from "@/types";

const MAX_EMAIL_CHARS = 5000;

function personalizeTemplate(
  template: string,
  lead: Lead,
  tradeType: string
): string {
  return template
    .replace(/\{\{business_name\}\}/g, lead.business_name)
    .replace(/\{\{owner_name\}\}/g, lead.owner_name)
    .replace(/\{\{trade_type\}\}/g, tradeType.toLowerCase())
    .replace(/\{\{review_count\}\}/g, String(lead.review_count))
    .replace(/\{\{google_rating\}\}/g, String(lead.google_rating));
}

function CharCount({ current, max }: { current: number; max: number }) {
  const isOver = current > max;
  return (
    <p
      className={`text-xs text-right ${isOver ? "text-destructive" : "text-muted-foreground"}`}
    >
      {current} / {max}
    </p>
  );
}

export default function OutreachClient({
  campaign,
  leads: hotLeads,
  templates,
}: {
  campaign: Campaign;
  leads: Lead[];
  templates: Template[];
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(
    templates[0]?.id || ""
  );
  const [selectedLeadId, setSelectedLeadId] = useState(hotLeads[0]?.id || "");
  const [generatedEmails, setGeneratedEmails] = useState<
    { id: string; leadId: string; subject: string; body: string }[]
  >([]);
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [sendingAll, setSendingAll] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [previewEmail, setPreviewEmail] = useState<{
    leadId: string;
    subject: string;
    body: string;
  } | null>(null);

  const template = templates.find((t) => t.id === selectedTemplate);
  const selectedLead = hotLeads.find((l) => l.id === selectedLeadId);

  const previewSubject =
    selectedLead && template
      ? personalizeTemplate(
          template.subject_template,
          selectedLead,
          campaign.trade_type
        )
      : template?.subject_template ?? "";

  const previewBody =
    selectedLead && template
      ? personalizeTemplate(
          template.body_template,
          selectedLead,
          campaign.trade_type
        )
      : template?.body_template ?? "";

  const handleGenerateAll = async () => {
    if (!template) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          template_id: template.id,
          lead_ids: hotLeads.slice(0, 10).map((l) => l.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate emails");
      }

      const data = await res.json();
      setGeneratedEmails(
        data.outreach.map(
          (o: { id: string; lead_id: string; subject: string; body: string }) => ({
            id: o.id,
            leadId: o.lead_id,
            subject: o.subject,
            body: o.body,
          })
        )
      );
      setEditedBodies({});
      setSentIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
      const emails = hotLeads.slice(0, 10).map((lead) => ({
        id: "",
        leadId: lead.id,
        subject: personalizeTemplate(
          template.subject_template,
          lead,
          campaign.trade_type
        ),
        body: personalizeTemplate(
          template.body_template,
          lead,
          campaign.trade_type
        ),
      }));
      setGeneratedEmails(emails);
      setEditedBodies({});
      setSentIds(new Set());
    } finally {
      setGenerating(false);
    }
  };

  const getEmailBody = (email: { leadId: string; body: string }) =>
    editedBodies[email.leadId] ?? email.body;

  const draftEmails = generatedEmails.filter(
    (e) => e.id && !sentIds.has(e.id)
  );

  const sendOutreach = async (outreachIds: string[]) => {
    const res = await fetch("/api/outreach/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreach_ids: outreachIds }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send emails");
    }
    return res.json();
  };

  const handleSendOne = async (outreachId: string) => {
    setSending((prev) => ({ ...prev, [outreachId]: true }));
    setError("");
    setSuccessMessage("");
    try {
      await sendOutreach([outreachId]);
      setSentIds((prev) => new Set([...prev, outreachId]));
      setSuccessMessage("Email sent successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending((prev) => ({ ...prev, [outreachId]: false }));
    }
  };

  const handleSendAll = async () => {
    const ids = draftEmails.map((e) => e.id);
    if (ids.length === 0) return;
    setSendingAll(true);
    setError("");
    setSuccessMessage("");
    try {
      await sendOutreach(ids);
      setSentIds((prev) => new Set([...prev, ...ids]));
      setSuccessMessage(`${ids.length} email${ids.length > 1 ? "s" : ""} sent successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSendingAll(false);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Outreach</h1>
          <p className="text-muted-foreground">{campaign.name}</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg mb-2">No templates available</p>
            <p className="text-sm">
              Create an email template first before generating outreach.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outreach</h1>
        <p className="text-muted-foreground">
          {campaign.name} &middot; {hotLeads.length} warm/hot leads ready for
          outreach
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Template selector & preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Template</CardTitle>
              <CardDescription>
                Choose a template and preview how it looks for each lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedTemplate}
                onValueChange={(v) => setSelectedTemplate(v ?? selectedTemplate)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hotLeads.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Preview for:</label>
                  <Select
                    value={selectedLeadId}
                    onValueChange={(v) =>
                      setSelectedLeadId(v ?? selectedLeadId)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hotLeads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.business_name} (Score: {l.lead_score})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subject
                </p>
                <p className="font-medium">{previewSubject}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Body
                </p>
                <div className="whitespace-pre-wrap text-sm bg-muted/50 dark:bg-muted/20 p-4 rounded-md border dark:border-border">
                  {previewBody}
                </div>
                <CharCount current={previewBody.length} max={MAX_EMAIL_CHARS} />
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleGenerateAll}
            disabled={generating || hotLeads.length === 0}
            className="w-full"
            size="lg"
          >
            {generating
              ? "Generating Emails..."
              : hotLeads.length === 0
                ? "No leads to email"
                : `Generate Emails for Top ${Math.min(10, hotLeads.length)} Leads`}
          </Button>

          {generating && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin mx-auto mb-3 h-8 w-8 rounded-full border-4 border-muted border-t-primary" />
                <p className="text-sm text-muted-foreground">
                  AI is generating personalized emails...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take a few seconds
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated emails list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Generated Emails{" "}
              {generatedEmails.length > 0 && (
                <Badge variant="secondary">{generatedEmails.length}</Badge>
              )}
            </h2>
            {draftEmails.length > 0 && (
              <Button
                onClick={handleSendAll}
                disabled={sendingAll}
                size="sm"
              >
                {sendingAll ? (
                  <>
                    <span className="animate-spin mr-2 inline-block h-4 w-4 rounded-full border-2 border-muted border-t-primary-foreground" />
                    Sending...
                  </>
                ) : (
                  `Send All (${draftEmails.length})`
                )}
              </Button>
            )}
          </div>

          {successMessage && (
            <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3">
              <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          )}

          {generatedEmails.length === 0 && !generating ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-2">No emails generated yet</p>
                <p className="text-sm">
                  Select a template and click &quot;Generate Emails&quot; to
                  create personalized outreach for your top leads.
                </p>
              </CardContent>
            </Card>
          ) : (
            generatedEmails.map((email) => {
              const lead = hotLeads.find((l) => l.id === email.leadId);
              const body = getEmailBody(email);
              return (
                <Card key={email.leadId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {lead?.business_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPreviewEmail({
                              ...email,
                              body,
                            })
                          }
                        >
                          Preview
                        </Button>
                        {email.id && !sentIds.has(email.id) ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSendOne(email.id)}
                              disabled={sending[email.id] || sendingAll}
                            >
                              {sending[email.id] ? (
                                <span className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-muted border-t-primary-foreground" />
                              ) : (
                                "Send"
                              )}
                            </Button>
                            <Badge
                              variant="outline"
                              className="dark:border-border"
                            >
                              Draft
                            </Badge>
                          </>
                        ) : email.id ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Sent
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="dark:border-border"
                          >
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      To: {lead?.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium">{email.subject}</p>
                    <Separator />
                    <Textarea
                      value={body}
                      onChange={(e) =>
                        setEditedBodies((prev) => ({
                          ...prev,
                          [email.leadId]: e.target.value,
                        }))
                      }
                      rows={6}
                      className="text-sm"
                    />
                    <CharCount current={body.length} max={MAX_EMAIL_CHARS} />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPreviewEmail(null)}
        >
          <div
            className="bg-background border rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewEmail(null)}
                >
                  Close
                </Button>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subject
                </p>
                <p className="font-medium">{previewEmail.subject}</p>
              </div>
              <Separator />
              <div className="whitespace-pre-wrap text-sm bg-muted/50 dark:bg-muted/20 p-4 rounded-md border dark:border-border">
                {previewEmail.body}
              </div>
              <CharCount
                current={previewEmail.body.length}
                max={MAX_EMAIL_CHARS}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

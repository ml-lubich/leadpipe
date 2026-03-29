"use client";

import { use, useState, useMemo } from "react";
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
import { mockCampaigns, generateLeads, mockTemplates } from "@/lib/mock-data";
import { Lead } from "@/types";

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

export default function OutreachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const campaign = mockCampaigns.find((c) => c.id === id) || mockCampaigns[0];
  const leads = useMemo(() => generateLeads(campaign), [campaign]);
  const hotLeads = leads
    .filter((l) => l.lead_score >= 50)
    .sort((a, b) => b.lead_score - a.lead_score);

  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0].id);
  const [selectedLeadId, setSelectedLeadId] = useState(hotLeads[0]?.id || "");
  const [generatedEmails, setGeneratedEmails] = useState<
    { leadId: string; subject: string; body: string }[]
  >([]);
  const [generating, setGenerating] = useState(false);

  const template = mockTemplates.find((t) => t.id === selectedTemplate)!;
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const previewSubject = selectedLead
    ? personalizeTemplate(template.subject_template, selectedLead, campaign.trade_type)
    : template.subject_template;

  const previewBody = selectedLead
    ? personalizeTemplate(template.body_template, selectedLead, campaign.trade_type)
    : template.body_template;

  const handleGenerateAll = async () => {
    setGenerating(true);
    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 1500));

    const emails = hotLeads.slice(0, 10).map((lead) => ({
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
    setGenerating(false);
  };

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
                  {mockTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm font-medium">Preview for:</label>
                <Select
                  value={selectedLeadId}
                  onValueChange={(v) => setSelectedLeadId(v ?? selectedLeadId)}
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
                <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">
                  {previewBody}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerateAll}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating
              ? "Generating Emails..."
              : `Generate Emails for Top ${Math.min(10, hotLeads.length)} Leads`}
          </Button>
        </div>

        {/* Generated emails list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Generated Emails{" "}
            {generatedEmails.length > 0 && (
              <Badge variant="secondary">{generatedEmails.length}</Badge>
            )}
          </h2>

          {generatedEmails.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-2">No emails generated yet</p>
                <p className="text-sm">
                  Select a template and click &quot;Generate Emails&quot; to create
                  personalized outreach for your top leads.
                </p>
              </CardContent>
            </Card>
          ) : (
            generatedEmails.map((email, i) => {
              const lead = leads.find((l) => l.id === email.leadId);
              return (
                <Card key={email.leadId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {lead?.business_name}
                      </CardTitle>
                      <Badge variant="outline">Draft</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      To: {lead?.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium">{email.subject}</p>
                    <Separator />
                    <Textarea
                      defaultValue={email.body}
                      rows={6}
                      className="text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm">Send</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

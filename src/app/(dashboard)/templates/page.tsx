"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockTemplates } from "@/lib/mock-data";
import { Template } from "@/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");

  const handleCreate = () => {
    if (!newName || !newSubject || !newBody) return;
    const t: Template = {
      id: `t-${Date.now()}`,
      user_id: "user-1",
      name: newName,
      trade_type: "General",
      subject_template: newSubject,
      body_template: newBody,
      created_at: new Date().toISOString(),
    };
    setTemplates([t, ...templates]);
    setNewName("");
    setNewSubject("");
    setNewBody("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Email templates for outreach campaigns
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>New Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>
                Use variables like {"{{business_name}}"}, {"{{owner_name}}"},{" "}
                {"{{trade_type}}"}, {"{{review_count}}"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g. Website Pitch"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  placeholder="e.g. Quick question about {{business_name}}"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  placeholder="Hi {{owner_name}},..."
                  rows={8}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t.name}</CardTitle>
                <Badge variant="secondary">{t.trade_type}</Badge>
              </div>
              <CardDescription>Subject: {t.subject_template}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md max-h-40 overflow-y-auto">
                {t.body_template}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

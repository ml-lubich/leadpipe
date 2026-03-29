"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";
import { Template } from "@/types";

export default function TemplatesClient({
  initialTemplates,
  userId,
}: {
  initialTemplates: Template[];
  userId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!newName || !newSubject || !newBody) return;

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("templates").insert({
        user_id: userId,
        name: newName,
        trade_type: "General",
        subject_template: newSubject,
        body_template: newBody,
      });

      if (insertError) throw insertError;

      setNewName("");
      setNewSubject("");
      setNewBody("");
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("templates").delete().eq("id", id);
    router.refresh();
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={saving || !newName || !newSubject || !newBody}
              >
                {saving ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {initialTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg mb-2">No templates yet</p>
            <p className="text-sm">
              Create your first email template to start sending outreach.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {initialTemplates.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{t.trade_type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Subject: {t.subject_template}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md max-h-40 overflow-y-auto">
                  {t.body_template}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

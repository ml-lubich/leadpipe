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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { Template, TRADES, TEMPLATE_VARIABLES } from "@/types";

function VariableHints() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TEMPLATE_VARIABLES.map((v) => (
        <Badge
          key={v}
          variant="secondary"
          className="text-xs font-mono"
        >
          {v}
        </Badge>
      ))}
    </div>
  );
}

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
  const [newTrade, setNewTrade] = useState("General");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTrade, setEditTrade] = useState("General");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const handleCreate = async () => {
    if (!newName || !newSubject || !newBody) return;

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("templates").insert({
        user_id: userId,
        name: newName,
        subject: newSubject,
        body: newBody,
        trade: newTrade,
        // Keep old columns populated for backwards compat
        subject_template: newSubject,
        body_template: newBody,
        trade_type: newTrade,
      });

      if (insertError) throw insertError;

      setNewName("");
      setNewSubject("");
      setNewBody("");
      setNewTrade("General");
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

  const handleStartEdit = (t: Template) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditSubject(t.subject || (t as Record<string, string>).subject_template || "");
    setEditBody(t.body || (t as Record<string, string>).body_template || "");
    setEditTrade(t.trade || (t as Record<string, string>).trade_type || "General");
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editSubject || !editBody) return;

    setEditSaving(true);
    setEditError("");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("templates")
        .update({
          name: editName,
          subject: editSubject,
          body: editBody,
          trade: editTrade,
          subject_template: editSubject,
          body_template: editBody,
          trade_type: editTrade,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setEditingId(null);
      router.refresh();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update template"
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("templates").delete().eq("id", id);
    router.refresh();
  };

  const getSubject = (t: Template) =>
    t.subject || (t as Record<string, string>).subject_template || "";
  const getBody = (t: Template) =>
    t.body || (t as Record<string, string>).body_template || "";
  const getTrade = (t: Template) =>
    t.trade || (t as Record<string, string>).trade_type || "General";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outreach Templates</h1>
          <p className="text-sm text-muted-foreground">
            Email templates for consulting outreach
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
                Create an outreach template with personalization variables
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <VariableHints />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g. Website Pitch"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trade</Label>
                  <Select value={newTrade} onValueChange={setNewTrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      {TRADES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            <p className="text-lg font-medium mb-2">No templates yet</p>
            <p className="text-sm mb-4">
              Create your first email template for consulting outreach.
            </p>
            <Button onClick={() => setIsOpen(true)}>Create Template</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {initialTemplates.map((t) =>
            editingId === t.id ? (
              <Card
                key={t.id}
                className="border-primary/50"
              >
                <CardHeader>
                  <CardTitle className="text-lg">Edit Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <VariableHints />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trade</Label>
                      <Select value={editTrade} onValueChange={setEditTrade}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          {TRADES.map((tr) => (
                            <SelectItem key={tr} value={tr}>
                              {tr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={8}
                    />
                  </div>
                  {editError && (
                    <p className="text-sm text-destructive">{editError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveEdit(t.id)}
                      disabled={
                        editSaving || !editName || !editSubject || !editBody
                      }
                    >
                      {editSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={t.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getTrade(t)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Subject: {getSubject(t)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-3" />
                  <div className="whitespace-pre-wrap text-sm bg-muted/20 p-4 rounded-md border max-h-40 overflow-y-auto">
                    {getBody(t)}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}

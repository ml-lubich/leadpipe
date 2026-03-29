"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const tradeTypes = [
  "HVAC",
  "Plumbers",
  "Electricians",
  "Roofers",
  "Landscapers",
  "Painters",
  "Cleaners",
  "Pest Control",
  "General Contractors",
  "Taco Trucks",
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade || !city) return;

    setLoading(true);
    // Simulate campaign creation delay
    await new Promise((r) => setTimeout(r, 1000));
    // In a real app, this would create in Supabase and redirect to the campaign
    router.push("/campaigns/1");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground">
          Pick a trade and city to start finding leads
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            We&apos;ll search for {trade || "businesses"} in{" "}
            {city || "your target area"} and build your lead list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trade">Trade Type</Label>
              <Select value={trade} onValueChange={(v) => setTrade(v ?? "")}>
                <SelectTrigger id="trade">
                  <SelectValue placeholder="Select a trade..." />
                </SelectTrigger>
                <SelectContent>
                  {tradeTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City / Location</Label>
              <Input
                id="city"
                placeholder="e.g. Austin, TX"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!trade || !city || loading}
            >
              {loading ? "Creating Campaign..." : "Create Campaign & Find Leads"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { TRADES } from "@/types";

export default function NewCampaignPage() {
  const router = useRouter();
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputErrors, setInputErrors] = useState({ trade: "", city: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade || !city.trim()) {
      setInputErrors({
        trade: trade ? "" : "Please select a trade.",
        city: city.trim() ? "" : "City cannot be empty."
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade_type: trade,
          location: city,
          trade,
          city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push(`/campaigns/${data.campaign.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign"
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/campaigns"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6"
      >
        &larr; Back to Campaigns
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Campaign</h1>
        <p className="text-sm text-muted-foreground">
          Pick a trade and city to organize your outreach
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Details</CardTitle>
          <CardDescription>
            We&apos;ll group leads for {trade || "businesses"} in{" "}
            {city || "your target area"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trade">Trade</Label>
              <Select value={trade} onValueChange={(v) => setTrade(v ?? "")}>
                <SelectTrigger id="trade">
                  <SelectValue placeholder="Select a trade..." />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {inputErrors.trade && (
                <p className="text-sm text-destructive">{inputErrors.trade}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Los Angeles, CA"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setInputErrors((prev) => ({ ...prev, city: e.target.value.trim() ? "" : "City cannot be empty." }));
                }}
                maxLength={100}
              />
              {inputErrors.city && (
                <p className="text-sm text-destructive">{inputErrors.city}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full flex justify-center items-center gap-2"
              size="lg"
              disabled={!trade || !city.trim() || loading}
            >
              {loading && <span className='loader spinner-border spinner-border-sm' />} {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
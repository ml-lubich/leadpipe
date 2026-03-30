"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";

export default function SettingsClient({
  profile,
  limits,
}: {
  profile: User;
  limits: { leads_per_month: number; campaigns: number };
}) {
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "pro" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Stripe not configured yet
    } finally {
      setUpgrading(false);
    }
  };

  const handlePortal = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Stripe not configured
    }
  };

  const leadsLimit = limits.leads_per_month;
  const leadsUsed = profile.leads_used_this_month;
  const usagePercent =
    leadsLimit > 0 ? Math.min(100, Math.round((leadsUsed / leadsLimit) * 100)) : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <Badge variant="secondary">Google</Badge>
          </div>
          {profile.full_name && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.full_name}
                  </p>
                </div>
              </div>
            </>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Member since</p>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Your current subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">
                {profile.subscription_tier} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                {leadsLimit > 0 ? `${leadsLimit} leads/month` : "Unlimited leads"}
                {" "}&middot;{" "}
                {limits.campaigns > 0
                  ? `${limits.campaigns} campaign`
                  : "Unlimited campaigns"}
              </p>
            </div>
            <Badge>{profile.subscription_status}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Usage this month</p>
              <p className="text-sm text-muted-foreground">
                {leadsUsed} / {leadsLimit > 0 ? leadsLimit : "\u221e"} leads used
              </p>
            </div>
            <div className="w-32 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          {profile.subscription_tier === "free" ? (
            <Button
              className="w-full"
              onClick={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading ? "Redirecting..." : "Upgrade to Pro \u2014 $39/month"}
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={handlePortal}
            >
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

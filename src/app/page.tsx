import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">LP</span>
          </div>
          <span className="text-lg font-bold">LeadPipe</span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Find trade businesses with{" "}
            <span className="text-primary">weak digital presence</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Scrape local HVAC, plumbing, electrical, roofing, and landscaping
            businesses. Score their online presence. Send personalized consulting
            outreach. Close deals.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
            {[
              {
                title: "Auto-Scrape",
                desc: "Find businesses by trade + city with opportunity scoring",
              },
              {
                title: "Pipeline CRM",
                desc: "Kanban board: New to Researched to Contacted to Closed",
              },
              {
                title: "Outreach",
                desc: "Email templates with smart variables for personalization",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <p className="font-semibold mb-1">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

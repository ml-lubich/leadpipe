import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const trades = [
  "HVAC", "Plumbers", "Electricians", "Roofers", "Landscapers",
  "Painters", "Cleaners", "Pest Control",
];

const features = [
  {
    title: "Lead Discovery",
    description:
      "Enter a trade + city and instantly find businesses that need your services. We scan directories, maps, and review sites.",
    icon: "🔍",
  },
  {
    title: "AI Lead Scoring",
    description:
      "Our AI scores every lead 0-100 based on website quality, review count, social presence, and listing freshness.",
    icon: "🎯",
  },
  {
    title: "Personalized Outreach",
    description:
      "AI-generated cold emails tailored to each lead. \"I noticed your Google listing only has 3 reviews...\"",
    icon: "✉️",
  },
  {
    title: "Campaign Management",
    description:
      "Track sent, opened, replied, and booked across all your campaigns. See what's converting.",
    icon: "📊",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Try it out",
    features: ["25 leads/month", "Basic lead scoring", "1 campaign", "Email support"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing agencies",
    features: [
      "500 leads/month",
      "AI outreach emails",
      "Unlimited campaigns",
      "Advanced scoring",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$149",
    period: "/month",
    description: "Scale your operation",
    features: [
      "Unlimited leads",
      "White-label reports",
      "Team members",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">LeadPipe</span>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center">
        <Badge variant="outline" className="mb-6">
          Built for local trade businesses
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
          Find leads that{" "}
          <span className="text-primary">actually need</span>{" "}
          your services
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
          AI-powered lead generation for local trades. Discover businesses with
          weak online presence, score them, and send personalized outreach — all
          on autopilot.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/login">
            <Button size="lg" className="text-base px-8">
              Start Finding Leads
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="text-base px-8">
              See How It Works
            </Button>
          </a>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {trades.map((trade) => (
            <Badge key={trade} variant="secondary" className="text-sm">
              {trade}
            </Badge>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to fill your pipeline
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              From finding the right prospects to closing deals — LeadPipe handles the heavy lifting.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">
            Three steps to more customers
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Pick a Trade + City", desc: "\"Plumbers in Austin TX\" — that's it. We handle the rest." },
              { step: "2", title: "Review Scored Leads", desc: "See which businesses have weak websites, few reviews, and need your help the most." },
              { step: "3", title: "Send AI Outreach", desc: "One click to generate personalized emails. Follow up automatically." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Simple pricing</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start free. Upgrade when you're ready.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "border-primary shadow-lg scale-105"
                    : "border"
                }
              >
                <CardHeader>
                  {plan.highlighted && (
                    <Badge className="w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span className="text-primary font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className="block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to fill your pipeline?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join agencies and marketers already using LeadPipe to find and close
            local trade businesses.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-base px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">LeadPipe</span>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </div>
          <p>&copy; {new Date().getFullYear()} LeadPipe AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
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
import { ThemeToggle } from "@/components/theme-toggle";

const trades = [
  "HVAC",
  "Plumbers",
  "Electricians",
  "Roofers",
  "Landscapers",
  "Painters",
  "Cleaners",
  "Pest Control",
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
      'AI-generated cold emails tailored to each lead. "I noticed your Google listing only has 3 reviews..."',
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
    features: [
      "25 leads/month",
      "Basic lead scoring",
      "1 campaign",
      "Email support",
    ],
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

const testimonials = [
  {
    name: "Mike Rodriguez",
    role: "Owner, CoolBreeze HVAC",
    trade: "HVAC",
    quote:
      "We went from cold-calling 50 businesses a week to closing 12 deals in our first month with LeadPipe. The AI scoring is scary accurate — it knew exactly which companies had outdated websites and no reviews.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Founder, FlowRight Plumbing Services",
    trade: "Plumbing",
    quote:
      "I was skeptical about AI-generated emails, but the personalization is genuinely impressive. One prospect replied saying it was the best cold email they'd ever received. Our reply rate went from 3% to 18%.",
    rating: 5,
  },
  {
    name: "James Whitfield",
    role: "CEO, GreenScape Landscaping",
    trade: "Landscaping",
    quote:
      "Before LeadPipe, I was spending $2,000/month on generic leads from HomeAdvisor. Now I spend $49 and get better results because every lead is pre-scored and the outreach is personalized to their specific gaps.",
    rating: 5,
  },
];

const faqs = [
  {
    question: "What trades does LeadPipe work for?",
    answer:
      "LeadPipe works for any local trade business — HVAC, plumbing, electrical, roofing, landscaping, painting, cleaning, pest control, and more. If the business serves a local area and could benefit from better online presence, LeadPipe can find and score those leads for you.",
  },
  {
    question: "How does the AI lead scoring work?",
    answer:
      "Our AI analyzes multiple signals for each business: website quality and freshness, Google review count and rating, social media presence, directory listing completeness, and more. Each lead gets a score from 0-100 — higher scores mean the business has more gaps you can help fill, making them more likely to convert.",
  },
  {
    question: "Can I customize the outreach emails?",
    answer:
      "Absolutely. The AI generates a personalized draft for each lead based on their specific weaknesses (e.g., low reviews, outdated website). You can edit any email before sending, set your own tone and style preferences, and create templates that the AI will adapt for each prospect.",
  },
  {
    question: "Is this spam? Will it hurt my reputation?",
    answer:
      "No. LeadPipe generates targeted, one-to-one business outreach — not bulk spam. Each email is personalized with specific observations about the recipient's business. We enforce sending limits, include proper unsubscribe options, and follow CAN-SPAM guidelines. This is professional B2B outreach, not mass marketing.",
  },
  {
    question: "How quickly will I see ROI?",
    answer:
      "Most users see their first replies within the first week. On average, Pro users close 3-5 new clients in their first month, which more than covers the subscription cost. The Free plan lets you test with 25 leads before committing, so you can validate the results risk-free.",
  },
];

const trustLogos = [
  "AirTech Pro Services",
  "Summit Roofing Co.",
  "BlueWave Plumbing",
  "Precision Electric",
  "GreenField Landscaping",
  "ClearView Painting",
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">LeadPipe</span>
            <Badge variant="secondary" className="text-xs">
              AI
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground transition"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-80" : "max-h-0"}`}
        >
          <nav className="flex flex-col gap-2 px-4 pb-4">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <div className="flex gap-3 pt-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center overflow-hidden">
        <Badge variant="outline" className="mb-6 relative z-10">
          Built for local trade businesses
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight relative z-10">
          Find leads that{" "}
          <span className="text-primary">actually need</span> your services
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl relative z-10">
          AI-powered lead generation for local trades. Discover businesses with
          weak online presence, score them, and send personalized outreach — all
          on autopilot.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 relative z-10">
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
        {/* Trust bar */}
        <p className="mt-6 text-sm text-muted-foreground relative z-10">
          Join <span className="font-semibold text-foreground">500+</span> trade
          businesses already using LeadPipe
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-2 relative z-10">
          {trades.map((trade) => (
            <Badge key={trade} variant="secondary" className="text-sm">
              {trade}
            </Badge>
          ))}
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by <span className="font-semibold">500+</span> trade
            businesses across the country
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {trustLogos.map((name) => (
              <div
                key={name}
                className="text-muted-foreground/60 font-semibold text-sm tracking-wide whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
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
              From finding the right prospects to closing deals — LeadPipe
              handles the heavy lifting.
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
              {
                step: "1",
                title: "Pick a Trade + City",
                desc: '"Plumbers in Austin TX" — that\'s it. We handle the rest.',
              },
              {
                step: "2",
                title: "Review Scored Leads",
                desc: "See which businesses have weak websites, few reviews, and need your help the most.",
              },
              {
                step: "3",
                title: "Send AI Outreach",
                desc: "One click to generate personalized emails. Follow up automatically.",
              },
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Real results from real trade businesses
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              See how LeadPipe is helping contractors and agencies grow their
              client base.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-500">
                        ★
                      </span>
                    ))}
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Simple pricing</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start free. Upgrade when you&apos;re ready.
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
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
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

      {/* FAQ */}
      <section id="faq" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Everything you need to know about LeadPipe.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg bg-background">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-medium hover:bg-muted/50 transition rounded-lg"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.question}
                  <span
                    className={`text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-96" : "max-h-0"}`}
                >
                  <p className="px-6 pb-4 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop guessing. Start closing.
          </h2>
          <p className="text-muted-foreground text-lg mb-4 max-w-xl mx-auto">
            Every day without LeadPipe is another day your competitors are
            landing the clients you should be winning.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Free plan available — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-base px-8">
                Get Started Free
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="text-base px-8">
                Compare Plans
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-foreground text-lg">
                  LeadPipe
                </span>
                <Badge variant="secondary" className="text-xs">
                  AI
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered lead generation for local trade businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-foreground transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-foreground transition"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-foreground transition"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Use Cases</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>HVAC Lead Generation</li>
                <li>Plumber Lead Generation</li>
                <li>Electrician Leads</li>
                <li>Roofing Contractor Leads</li>
                <li>Landscaping Leads</li>
              </ul>
            </div>

            {/* Company / Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@leadpipe.ai"
                    className="hover:text-foreground transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} LeadPipe AI. All rights
              reserved.
            </p>
            <p>Made for trade businesses, by people who get it.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

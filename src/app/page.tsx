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
  { name: "HVAC", icon: "🌡️" },
  { name: "Plumbing", icon: "🔧" },
  { name: "Electrical", icon: "⚡" },
  { name: "Roofing", icon: "🏠" },
  { name: "Landscaping", icon: "🌿" },
  { name: "Painting", icon: "🎨" },
  { name: "Cleaning", icon: "✨" },
  { name: "Pest Control", icon: "🛡️" },
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
      "Track sent, opened, replied, and booked across all your campaigns. See what\u2019s converting.",
    icon: "📊",
  },
  {
    title: "Real-Time Analytics",
    description:
      "Live dashboards showing open rates, reply rates, and conversion metrics. Know exactly what\u2019s working.",
    icon: "📈",
  },
  {
    title: "Smart Follow-ups",
    description:
      "Automated follow-up sequences that adapt based on prospect behavior and engagement signals.",
    icon: "🔄",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Try it out risk-free",
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
    price: "$39",
    period: "/month",
    description: "For growing trade businesses",
    features: [
      "500 leads/month",
      "AI outreach emails",
      "Unlimited campaigns",
      "Advanced scoring",
      "Priority support",
      "Analytics dashboard",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$79",
    period: "/month",
    description: "Scale your operation",
    features: [
      "Unlimited leads",
      "White-label reports",
      "Team members",
      "API access",
      "Dedicated support",
      "Custom integrations",
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
      "We went from cold-calling 50 businesses a week to closing 12 deals in our first month with LeadPipe. The AI scoring is scary accurate.",
    rating: 5,
    metric: "12 deals in month 1",
  },
  {
    name: "Sarah Chen",
    role: "Founder, FlowRight Plumbing",
    trade: "Plumbing",
    quote:
      "The personalization is genuinely impressive. One prospect replied saying it was the best cold email they\u2019d ever received. Reply rate went from 3% to 18%.",
    rating: 5,
    metric: "6x reply rate increase",
  },
  {
    name: "James Whitfield",
    role: "CEO, GreenScape Landscaping",
    trade: "Landscaping",
    quote:
      "Before LeadPipe, I was spending $2,000/month on generic leads from HomeAdvisor. Now I spend $39 and get better results.",
    rating: 5,
    metric: "$1,961 saved/month",
  },
];

const roiStats = [
  { value: "18%", label: "Average reply rate", sub: "vs 2-3% industry avg" },
  { value: "12x", label: "ROI in first month", sub: "for Pro users" },
  { value: "500+", label: "Trade businesses", sub: "trust LeadPipe" },
  { value: "4.8/5", label: "Customer rating", sub: "127 reviews" },
];

const faqs = [
  {
    question: "What trades does LeadPipe work for?",
    answer:
      "LeadPipe works for any local trade business \u2014 HVAC, plumbing, electrical, roofing, landscaping, painting, cleaning, pest control, and more. If the business serves a local area and could benefit from better online presence, LeadPipe can find and score those leads for you.",
  },
  {
    question: "How does the AI lead scoring work?",
    answer:
      "Our AI analyzes multiple signals for each business: website quality and freshness, Google review count and rating, social media presence, directory listing completeness, and more. Each lead gets a score from 0-100 \u2014 higher scores mean the business has more gaps you can help fill, making them more likely to convert.",
  },
  {
    question: "Can I customize the outreach emails?",
    answer:
      "Absolutely. The AI generates a personalized draft for each lead based on their specific weaknesses (e.g., low reviews, outdated website). You can edit any email before sending, set your own tone and style preferences, and create templates that the AI will adapt for each prospect.",
  },
  {
    question: "Is this spam? Will it hurt my reputation?",
    answer:
      "No. LeadPipe generates targeted, one-to-one business outreach \u2014 not bulk spam. Each email is personalized with specific observations about the recipient\u2019s business. We enforce sending limits, include proper unsubscribe options, and follow CAN-SPAM guidelines.",
  },
  {
    question: "How quickly will I see ROI?",
    answer:
      "Most users see their first replies within the first week. On average, Pro users close 3-5 new clients in their first month, which more than covers the $39 subscription cost. The Free plan lets you test with 25 leads before committing.",
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
      <header className="border-b border-slate-200/60 dark:border-slate-700/40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LeadPipe
            </span>
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
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20">
                  Get Started
                </Button>
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
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center overflow-hidden">
        <Badge variant="outline" className="mb-6 relative z-10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/50">
          Built for local trade businesses
        </Badge>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] relative z-10">
          Find and close local leads{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            on autopilot
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl relative z-10 leading-relaxed">
          AI-powered lead generation for HVAC, plumbing, electrical, roofing, and landscaping.
          Discover businesses with weak online presence, score them, and send personalized outreach.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 relative z-10">
          <Link href="/login">
            <Button size="lg" className="text-base px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 h-12">
              Start Finding Leads &rarr;
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="text-base px-8 h-12 border-slate-300 dark:border-slate-600">
              See How It Works
            </Button>
          </a>
        </div>
        {/* Trade icons */}
        <div className="mt-14 flex flex-wrap justify-center gap-3 relative z-10 max-w-2xl">
          {trades.map((trade) => (
            <div
              key={trade.name}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-slate-200/60 dark:border-slate-700/40 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm"
            >
              <span>{trade.icon}</span>
              {trade.name}
            </div>
          ))}
        </div>
      </section>

      {/* ROI Stats */}
      <section className="py-16 border-b border-slate-200/60 dark:border-slate-700/40 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {roiStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust logos */}
      <section className="py-12 border-b border-slate-200/60 dark:border-slate-700/40">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by <span className="font-semibold">500+</span> trade
            businesses across the country
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {trustLogos.map((name) => (
              <div
                key={name}
                className="text-muted-foreground/50 font-semibold text-sm tracking-wide whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800">
              <span>🔒</span> SOC 2 Compliant
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-800">
              <span>✅</span> CAN-SPAM Compliant
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-800">
              <span>⭐</span> 4.8/5 Rating
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs font-medium border border-orange-200 dark:border-orange-800">
              <span>🏆</span> #1 Trade Lead Gen
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to fill your pipeline
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              From finding the right prospects to closing deals — LeadPipe
              handles the heavy lifting.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-slate-200/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50 backdrop-blur shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
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
          <Badge variant="outline" className="mb-4 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
            How it works
          </Badge>
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
              <div key={item.step} className="flex flex-col items-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Case Study */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/20 hover:bg-white/30">
              ROI Calculator
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The math is simple
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-sm text-blue-200 mb-2">Average deal value</div>
                <div className="text-3xl font-bold">$2,500</div>
                <div className="text-xs text-blue-200 mt-1">for local trade services</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-sm text-blue-200 mb-2">Leads that convert</div>
                <div className="text-3xl font-bold">3-5/mo</div>
                <div className="text-xs text-blue-200 mt-1">average for Pro users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-sm text-blue-200 mb-2">Monthly revenue added</div>
                <div className="text-3xl font-bold">$7,500+</div>
                <div className="text-xs text-blue-200 mt-1">for just $39/month</div>
              </div>
            </div>
            <p className="mt-8 text-blue-100 text-lg">
              That&apos;s a <span className="font-bold text-white">192x return</span> on your Pro subscription.
            </p>
            <Link href="/login" className="inline-block mt-8">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-base px-8 h-12 shadow-lg">
                Start Your Free Trial &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Testimonials
            </Badge>
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
              <Card key={t.name} className="border-slate-200/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50 backdrop-blur shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <span key={i} className="text-amber-400">
                          ★
                        </span>
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {t.trade}
                    </Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-md">
                      {t.metric}
                    </div>
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
            <Badge variant="outline" className="mb-4 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/10 scale-105 relative bg-white dark:bg-slate-800"
                    : "border-slate-200/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50"
                }
              >
                <CardHeader>
                  {plan.highlighted && (
                    <Badge className="w-fit mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                      Most Popular
                    </Badge>
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
                        <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className="block">
                    <Button
                      className={`w-full ${plan.highlighted ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20" : ""}`}
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
      <section id="faq" className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Everything you need to know about LeadPipe.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200/60 dark:border-slate-700/40 rounded-xl bg-white/70 dark:bg-slate-800/50 backdrop-blur overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-medium hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition rounded-xl"
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
              <Button size="lg" className="text-base px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                Get Started Free &rarr;
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                Compare Plans
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LeadPipe
                </span>
                <Badge variant="secondary" className="text-xs">
                  AI
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered lead generation for local trade businesses.
              </p>
              {/* Trust badges in footer */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">🔒 SOC 2</span>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">✅ CAN-SPAM</span>
              </div>
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

          <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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

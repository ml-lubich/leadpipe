import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://leadpipe.ai";
const SITE_NAME = "LeadPipe AI";
const SITE_DESCRIPTION =
  "AI-powered lead generation for HVAC, plumbers, electricians, roofers, and landscapers. Find leads, score them with AI, and send personalized outreach — all on autopilot.";

export const metadata: Metadata = {
  title: "LeadPipe AI — Lead Generation for Local Trades",
  description: SITE_DESCRIPTION,
  keywords: [
    "lead generation",
    "local trades",
    "HVAC leads",
    "plumber leads",
    "electrician leads",
    "roofer leads",
    "landscaper leads",
    "AI lead scoring",
    "cold email outreach",
    "trade business marketing",
    "local business leads",
    "contractor lead generation",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "LeadPipe AI — AI-Powered Lead Generation for Local Trades",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeadPipe AI — Find leads that actually need your services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadPipe AI — Lead Generation for Local Trades",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  other: {
    "theme-color": "#4f46e5",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "25 leads/month, basic lead scoring, 1 campaign",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "49",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description:
        "500 leads/month, AI outreach emails, unlimited campaigns, advanced scoring",
    },
    {
      "@type": "Offer",
      name: "Agency",
      price: "149",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description:
        "Unlimited leads, white-label reports, team members, API access",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

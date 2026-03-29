import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// Price IDs — set these in your Stripe dashboard and update here
export const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
  agency: process.env.STRIPE_AGENCY_PRICE_ID || "price_agency_monthly",
};

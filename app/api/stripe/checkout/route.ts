import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST /api/stripe/checkout
// body: { plan: "plus" | "cohort", userId: string, email: string }
//
// Creates a Stripe Checkout session and returns the URL to redirect the user to.
// The actual card entry happens on Stripe's hosted page — this app never touches card numbers.
export async function POST(req: NextRequest) {
  const { plan, userId, email } = await req.json();

  const priceId =
    plan === "plus"
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS
      : plan === "cohort"
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_COHORT
      : null;

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Reuse an existing Stripe customer if we already have one for this user
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: existing?.stripe_customer_id || undefined,
    customer_email: existing?.stripe_customer_id ? undefined : email,
    client_reference_id: userId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    metadata: { user_id: userId, plan },
  });

  return NextResponse.json({ url: session.url });
}

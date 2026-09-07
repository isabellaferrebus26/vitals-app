"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Subscription } from "@/lib/types";

function AccountContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  const [user, setUser] = useState<User | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: subRow } = await supabase
          .from("subscriptions")
          .select("plan, status, current_period_end")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setSub(subRow);
      }
      setLoaded(true);
    }
    load();
  }, []);

  if (!loaded) return null;

  if (!user) {
    return (
      <main className="app-shell">
        <p>
          You need to <a href="/">sign in</a> to view your account.
        </p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="brand" style={{ marginBottom: 20 }}>
        <span className="pulse-dot" />
        Vitals
      </div>

      {checkout === "success" && (
        <div className="banner">
          <span>
            Payment received — it can take a few seconds for your plan to update below while Stripe's webhook syncs.
          </span>
        </div>
      )}
      {checkout === "canceled" && (
        <div className="banner banner-urgent">
          <span>Checkout was canceled — no charge was made.</span>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Your account</h2>
        <p className="text-muted">{user.email}</p>
        <div style={{ marginTop: 16 }}>
          <span className="badge badge-success" style={{ textTransform: "capitalize" }}>
            {sub?.plan ?? "free"} plan
          </span>{" "}
          <span className="text-sm text-muted" style={{ textTransform: "capitalize" }}>
            {sub?.status ?? "inactive"}
          </span>
        </div>
        {sub?.current_period_end && (
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            Renews {new Date(sub.current_period_end).toLocaleDateString()}
          </p>
        )}
        {(!sub || sub.plan === "free") && (
          <a href="/pricing" className="btn btn-primary" style={{ marginTop: 16, textDecoration: "none" }}>
            Upgrade
          </a>
        )}
      </div>

      <a href="/" className="btn btn-ghost" style={{ marginTop: 16 }}>
        ← Back to practice
      </a>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountContent />
    </Suspense>
  );
}

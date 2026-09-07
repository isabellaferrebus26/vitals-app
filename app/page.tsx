"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import StudyDashboard from "@/components/StudyDashboard";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/` },
    });
    setSent(true);
  }

  if (checking) return null;

  if (!user) {
    return (
      <div className="app-shell" style={{ maxWidth: 400 }}>
        <div className="card" style={{ textAlign: "center", marginTop: 80 }}>
          <div className="brand" style={{ justifyContent: "center" }}>
            <span className="pulse-dot" />
            Vitals
          </div>
          <p className="text-muted">Check your vitals. Own your exam.</p>
          {sent ? (
            <p>Check your email for a sign-in link.</p>
          ) : (
            <form onSubmit={sendMagicLink} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <input
                className="input"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-block">
                Send magic link
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <div className="brand" style={{ marginBottom: 20 }}>
        <span className="pulse-dot" />
        Vitals
      </div>
      <StudyDashboard userId={user.id} />
    </main>
  );
}

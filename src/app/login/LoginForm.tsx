"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0F1E37] via-[#15243d] to-[#1A3A5C] text-white">
      <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-2xl mb-6 animate-pulse">
        <img src="/logo.jpg" alt="FA Petroli" className="w-full h-full object-contain rounded-xl" />
      </div>
      <div className="font-display text-2xl font-bold tracking-wide mb-4">
        Accesso in corso…
      </div>
      <div className="w-48 h-1 rounded-full bg-white/15 overflow-hidden">
        <div className="h-full w-1/3 bg-brand-orange rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]" />
      </div>
      <div className="mt-6 text-xs uppercase tracking-[3px] text-white/40">
        FA Petroli — Portale Clienti B2B
      </div>
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? "Email o password non corrette."
          : res.error
      );
      return;
    }
    setShowLoader(true);
    router.push("/");
    router.refresh();
  }

  if (showLoader) return <LoadingScreen />;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email aziendale *</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="mario.rossi@azienda.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-brand-orange transition-colors"
            tabIndex={-1}
            aria-label={showPw ? "Nascondi password" : "Mostra password"}
          >
            {showPw ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={loading} className="w-full">
        {loading ? "Verifica credenziali…" : "Accedi al portale"}
        {!loading && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </Button>
    </form>
  );
}

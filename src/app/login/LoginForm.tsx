"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function LoadingScreen() {
  const text = "Accesso in corso...";
  return (
    <div className="loading-screen">
      <div className="loading-screen-logo">FA</div>
      <div className="loading-screen-text">
        {text.split("").map((ch, i) => (
          <span key={i} className="loading-screen-letter">
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>
      <div className="loading-screen-bar-wrap">
        <div className="loading-screen-bar" />
      </div>
      <div className="loading-screen-sub">FA Petroli — Portale Clienti B2B</div>
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
    // Login ok, show loading screen then redirect
    setShowLoader(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 600);
  }

  if (showLoader) {
    return <LoadingScreen />;
  }

  return (
    <form onSubmit={onSubmit} className="login-v2-form">
      {error && (
        <div className="login-v2-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="login-v2-field">
        <label htmlFor="email">
          Email aziendale <span className="login-v2-required">*</span>
        </label>
        <div className="login-v2-input-wrap">
          <svg className="login-v2-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mario.rossi@azienda.it"
          />
        </div>
      </div>

      <div className="login-v2-field">
        <label htmlFor="password">
          Password <span className="login-v2-required">*</span>
        </label>
        <div className="login-v2-input-wrap">
          <svg className="login-v2-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            id="password"
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="login-v2-eye-btn"
            onClick={() => setShowPw(!showPw)}
            tabIndex={-1}
          >
            {showPw ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 11-8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="login-v2-submit"
        disabled={loading}
      >
        <span>{loading ? "Verifica credenzibali..." : "Accedi al portale"}</span>
        {!loading && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
        <span className="login-v2-submit-shine" />
      </button>
    </form>
  );
}

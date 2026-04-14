"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      <div className="form-group">
        <label>Email aziendale</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mario.rossi@azienda.it"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        className="btn-primary"
        style={{ marginTop: 8 }}
        disabled={loading}
      >
        {loading ? "Accesso in corso..." : "Accedi al portale →"}
      </button>
    </form>
  );
}

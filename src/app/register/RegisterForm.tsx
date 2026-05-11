"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    ragioneSociale: "",
    partitaIva: "",
    pec: "",
    indirizzo: "",
    citta: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Errore durante la registrazione.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="alert alert-success" style={{ flexDirection: "column" }}>
        <strong>✅ Richiesta inviata!</strong>
        <p style={{ marginTop: 8, fontSize: 13 }}>
          La tua richiesta è stata ricevuta. FA Petroli verificherà i dati e
          attiverà il tuo account entro 24 ore lavorative. Riceverai una email
          di conferma all'indirizzo {form.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Nome</label>
          <input
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Cognome</label>
          <input
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Telefono</label>
          <input
            type="tel"
            required
            placeholder="es. 333 1234567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email aziendale</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Password (min 8 caratteri)</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ragione sociale</label>
          <input
            required
            value={form.ragioneSociale}
            onChange={(e) => update("ragioneSociale", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Partita IVA</label>
          <input
            required
            value={form.partitaIva}
            onChange={(e) => update("partitaIva", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>PEC</label>
        <input
          type="email"
          value={form.pec}
          onChange={(e) => update("pec", e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Indirizzo</label>
          <input
            value={form.indirizzo}
            onChange={(e) => update("indirizzo", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Città</label>
          <input
            value={form.citta}
            onChange={(e) => update("citta", e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        style={{ marginTop: 8 }}
        disabled={loading}
      >
        {loading ? "Invio in corso..." : "Richiedi attivazione →"}
      </button>
    </form>
  );
}

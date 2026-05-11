"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
}
interface CompanyData {
  id: string;
  ragioneSociale: string;
  partitaIva: string;
  pec: string | null;
  indirizzo: string | null;
  citta: string | null;
}

// Splitta il vecchio campo "name" se firstName/lastName sono ancora null
function splitFallback(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function ProfileForm({
  user,
  company,
}: {
  user: UserData;
  company: CompanyData;
}) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);

  const fallback = splitFallback(user.name);
  const [form, setForm] = useState({
    firstName: user.firstName ?? fallback.firstName,
    lastName: user.lastName ?? fallback.lastName,
    phone: user.phone ?? "",
    pec: company.pec ?? "",
    indirizzo: company.indirizzo ?? "",
    citta: company.citta ?? "",
  });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  async function save() {
    setMsg(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMsg({ type: "error", text: "Nome e cognome sono obbligatori." });
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 6) {
      setMsg({ type: "error", text: "Inserisci un numero di telefono valido." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "profile", ...form }),
    });
    setLoading(false);
    if (res.ok) {
      setEditMode(false);
      setMsg({ type: "success", text: "Profilo aggiornato con successo." });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "error", text: data.error ?? "Errore nel salvataggio." });
    }
  }

  async function changePassword() {
    setMsg(null);
    if (pw.next.length < 8) {
      setMsg({ type: "error", text: "La nuova password deve avere almeno 8 caratteri." });
      return;
    }
    if (pw.next !== pw.confirm) {
      setMsg({ type: "error", text: "Le password non coincidono." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "password",
        currentPassword: pw.current,
        newPassword: pw.next,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setPw({ current: "", next: "", confirm: "" });
      setMsg({ type: "success", text: "Password aggiornata." });
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "error", text: data.error ?? "Errore aggiornamento password." });
    }
  }

  return (
    <>
      {msg && (
        <div
          className={"alert alert-" + msg.type}
          style={{ gridColumn: "1 / -1" }}
        >
          {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
        </div>
      )}

      <div className="profile-card">
        <div className="card-header">
          <span className="card-title">🏢 Dati aziendali</span>
          <button
            className={editMode ? "btn-success" : "btn-orange"}
            style={{ padding: "7px 14px", fontSize: 13 }}
            onClick={() => (editMode ? save() : setEditMode(true))}
            disabled={loading}
          >
            {editMode ? "💾 Salva" : "✏️ Modifica"}
          </button>
        </div>
        <div className="profile-card-body">
          <div className="form-group">
            <label>Ragione sociale</label>
            <input type="text" value={company.ragioneSociale} disabled />
          </div>
          <div className="form-group">
            <label>Partita IVA</label>
            <input type="text" value={company.partitaIva} disabled />
          </div>
          <div className="form-group">
            <label>PEC</label>
            <input
              type="email"
              value={form.pec}
              disabled={!editMode}
              onChange={(e) => setForm({ ...form, pec: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Indirizzo</label>
            <input
              type="text"
              value={form.indirizzo}
              disabled={!editMode}
              onChange={(e) => setForm({ ...form, indirizzo: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Città</label>
            <input
              type="text"
              value={form.citta}
              disabled={!editMode}
              onChange={(e) => setForm({ ...form, citta: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="card-header">
          <span className="card-title">👤 Referente principale</span>
        </div>
        <div className="profile-card-body">
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={form.firstName}
                disabled={!editMode}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Cognome *</label>
              <input
                type="text"
                value={form.lastName}
                disabled={!editMode}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Telefono *</label>
            <input
              type="tel"
              value={form.phone}
              disabled={!editMode}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="card-header">
          <span className="card-title">🔐 Sicurezza & password</span>
        </div>
        <div className="profile-card-body">
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>
            Cambia la tua password regolarmente per mantenere l'account
            sicuro.
          </p>
          <div className="form-group">
            <label>Password attuale</label>
            <input
              type="password"
              value={pw.current}
              autoComplete="current-password"
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Nuova password (min 8 caratteri)</label>
            <input
              type="password"
              value={pw.next}
              autoComplete="new-password"
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Conferma nuova password</label>
            <input
              type="password"
              value={pw.confirm}
              autoComplete="new-password"
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            />
          </div>
          <button
            className="btn-secondary"
            style={{ width: "100%" }}
            onClick={changePassword}
            disabled={loading || !pw.current || !pw.next || !pw.confirm}
          >
            🔒 Aggiorna password
          </button>
        </div>
      </div>
    </>
  );
}

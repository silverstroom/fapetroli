"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
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

export default function ProfileForm({
  user,
  company,
}: {
  user: UserData;
  company: CompanyData;
}) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    pec: company.pec ?? "",
    indirizzo: company.indirizzo ?? "",
    citta: company.citta ?? "",
  });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // password change
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  async function save() {
    setMsg(null);
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
          <div className="form-group">
            <label>Nome e cognome</label>
            <input
              type="text"
              value={form.name}
              disabled={!editMode}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Telefono</label>
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
          <span className="card-title">🔐 Sicurezza account</span>
        </div>
        <div className="profile-card-body">
          <div className="form-group">
            <label>Password attuale</label>
            <input
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Nuova password</label>
            <input
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Conferma nuova password</label>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            />
          </div>
          <button
            className="btn-secondary"
            style={{ width: "100%" }}
            onClick={changePassword}
            disabled={loading}
          >
            Aggiorna password
          </button>
        </div>
      </div>
    </>
  );
}

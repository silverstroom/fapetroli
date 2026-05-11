"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserStatus } from "@prisma/client";
import {
  Check,
  Pause,
  Play,
  Trash2,
  Pencil,
  KeyRound,
  X,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface CompanyData {
  id: string;
  ragioneSociale: string;
  partitaIva: string;
  pec: string | null;
  indirizzo: string | null;
  citta: string | null;
  ordersCount: number;
}

interface ClientRow {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  status: UserStatus;
  createdAt: string;
  company: CompanyData | null;
}

function statusBadge(s: UserStatus) {
  if (s === "PENDING")
    return <span className="badge badge-pending">In attesa</span>;
  if (s === "ACTIVE") return <span className="badge badge-active">Attivo</span>;
  return <span className="badge badge-suspended">Sospeso</span>;
}

function splitName(c: ClientRow): { first: string; last: string } {
  if (c.firstName || c.lastName)
    return { first: c.firstName ?? "", last: c.lastName ?? "" };
  const parts = (c.name ?? "").trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [resetResult, setResetResult] = useState<{
    clientName: string;
    email: string;
    password: string;
  } | null>(null);

  const filtered = clients.filter((c) => {
    if (filter && c.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(s) &&
        !c.email.toLowerCase().includes(s) &&
        !c.company?.ragioneSociale.toLowerCase().includes(s) &&
        !c.company?.partitaIva.includes(s)
      )
        return false;
    }
    return true;
  });

  async function changeStatus(id: string, status: UserStatus) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status }),
    });
    setLoadingId(null);
    if (res.ok) router.refresh();
  }

  async function deleteClient(id: string) {
    if (
      !confirm(
        "Sicuro di voler eliminare questo cliente? L'operazione è irreversibile."
      )
    )
      return;
    setLoadingId(id);
    const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) router.refresh();
  }

  async function resetPassword(c: ClientRow) {
    if (
      !confirm(
        `Resettare la password di ${c.name}?\nVerrà generata una password temporanea che dovrai comunicare al cliente.`
      )
    )
      return;
    setLoadingId(c.id);
    const res = await fetch(`/api/admin/clients/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_password" }),
    });
    setLoadingId(null);
    if (res.ok) {
      const data = await res.json();
      setResetResult({
        clientName: c.name,
        email: c.email,
        password: data.tempPassword,
      });
    } else {
      alert("Errore durante il reset password.");
    }
  }

  return (
    <>
      <div className="filter-bar">
        <span className="filter-label">Filtra:</span>
        <input
          placeholder="🔍 Nome, email, ragione sociale, P.IVA…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="PENDING">In attesa</option>
          <option value="ACTIVE">Attivi</option>
          <option value="SUSPENDED">Sospesi</option>
        </select>
        <span style={{ marginLeft: "auto", color: "var(--gray-500)", fontSize: 13 }}>
          {filtered.length} clienti
        </span>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Azienda</th>
                <th>Referente</th>
                <th>Email</th>
                <th>P.IVA</th>
                <th>Ordini</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      Nessun cliente trovato.
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="td-bold">
                    {c.company?.ragioneSociale ?? "—"}
                    {c.company?.citta && (
                      <div style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 400 }}>
                        {c.company.citta}
                      </div>
                    )}
                  </td>
                  <td>
                    {c.name}
                    {c.phone && (
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                        {c.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>{c.email}</td>
                  <td>{c.company?.partitaIva ?? "—"}</td>
                  <td>{c.company?.ordersCount ?? 0}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {c.status === "PENDING" && (
                        <button
                          className="btn-success"
                          style={{ padding: "6px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                          disabled={loadingId === c.id}
                          onClick={() => changeStatus(c.id, "ACTIVE")}
                          title="Approva attivazione"
                        >
                          <Check size={14} /> Approva
                        </button>
                      )}
                      {c.status === "ACTIVE" && (
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                          disabled={loadingId === c.id}
                          onClick={() => changeStatus(c.id, "SUSPENDED")}
                          title="Sospendi account"
                        >
                          <Pause size={14} /> Sospendi
                        </button>
                      )}
                      {c.status === "SUSPENDED" && (
                        <button
                          className="btn-success"
                          style={{ padding: "6px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                          disabled={loadingId === c.id}
                          onClick={() => changeStatus(c.id, "ACTIVE")}
                          title="Riattiva account"
                        >
                          <Play size={14} /> Riattiva
                        </button>
                      )}
                      <button
                        style={{
                          padding: "6px 10px",
                          fontSize: 12,
                          background: "#fff",
                          color: "var(--blue, #1A3A5C)",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        disabled={loadingId === c.id}
                        onClick={() => setEditing(c)}
                        title="Modifica dati cliente"
                      >
                        <Pencil size={14} /> Modifica
                      </button>
                      <button
                        style={{
                          padding: "6px 10px",
                          fontSize: 12,
                          background: "#fff",
                          color: "#7c3aed",
                          border: "1.5px solid #d8b4fe",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        disabled={loadingId === c.id}
                        onClick={() => resetPassword(c)}
                        title="Reset password cliente"
                      >
                        <KeyRound size={14} /> Reset PW
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: "6px 10px", fontSize: 12, display: "inline-flex", alignItems: "center" }}
                        disabled={loadingId === c.id}
                        onClick={() => deleteClient(c.id)}
                        title="Elimina cliente"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditModal
          client={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {resetResult && (
        <ResetPasswordModal
          result={resetResult}
          onClose={() => setResetResult(null)}
        />
      )}
    </>
  );
}

// ════════════════════════════════════════════════
// Modale modifica dati cliente
// ════════════════════════════════════════════════
function EditModal({
  client,
  onClose,
  onSaved,
}: {
  client: ClientRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const sp = splitName(client);
  const [form, setForm] = useState({
    firstName: sp.first,
    lastName: sp.last,
    email: client.email,
    phone: client.phone ?? "",
    ragioneSociale: client.company?.ragioneSociale ?? "",
    partitaIva: client.company?.partitaIva ?? "",
    pec: client.company?.pec ?? "",
    indirizzo: client.company?.indirizzo ?? "",
    citta: client.company?.citta ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    setError(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Nome e cognome obbligatori.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email obbligatoria.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", ...form }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Errore salvataggio.");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,30,55,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, color: "#0F1E37" }}>
              Modifica cliente
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              {client.company?.ragioneSociale ?? client.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <SectionLabel>Referente</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <FormField label="Nome">
            <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Cognome">
            <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} style={inputStyle} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <FormField label="Email *">
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Telefono">
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
          </FormField>
        </div>

        <SectionLabel>Dati aziendali</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <FormField label="Ragione sociale">
            <input value={form.ragioneSociale} onChange={(e) => update("ragioneSociale", e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Partita IVA">
            <input value={form.partitaIva} onChange={(e) => update("partitaIva", e.target.value)} style={inputStyle} />
          </FormField>
        </div>
        <div style={{ marginBottom: 16 }}>
          <FormField label="PEC">
            <input type="email" value={form.pec} onChange={(e) => update("pec", e.target.value)} style={inputStyle} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 24 }}>
          <FormField label="Indirizzo">
            <input value={form.indirizzo} onChange={(e) => update("indirizzo", e.target.value)} style={inputStyle} />
          </FormField>
          <FormField label="Città">
            <input value={form.citta} onChange={(e) => update("citta", e.target.value)} style={inputStyle} />
          </FormField>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: "#fff",
              color: "#475569",
              border: "1.5px solid #cbd5e1",
              borderRadius: 8,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            Annulla
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              background: "#F07E10",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: saving ? "wait" : "pointer",
              boxShadow: "0 4px 12px rgba(240,126,16,0.35)",
            }}
          >
            {saving ? "Salvataggio…" : "Salva modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// Modale risultato reset password
// ════════════════════════════════════════════════
function ResetPasswordModal({
  result,
  onClose,
}: {
  result: { clientName: string; email: string; password: string };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,30,55,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <KeyRound size={28} />
        </div>
        <h3 style={{ margin: "0 0 6px", fontSize: 22, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, color: "#0F1E37" }}>
          Password resettata
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b", lineHeight: 1.55 }}>
          Comunica al cliente <b>{result.clientName}</b> la password temporanea
          qui sotto. Suggerisci di cambiarla al primo accesso dal proprio
          profilo.
        </p>

        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Email
          </div>
          <div style={{ fontSize: 14, marginBottom: 12, color: "#0F1E37" }}>{result.email}</div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Password temporanea
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <code
              style={{
                flex: 1,
                fontSize: 18,
                fontFamily: "SF Mono, Menlo, monospace",
                fontWeight: 700,
                color: "#7c3aed",
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                padding: "10px 12px",
                letterSpacing: 1,
                userSelect: "all",
              }}
            >
              {result.password}
            </code>
            <button
              onClick={copy}
              style={{
                padding: "10px 14px",
                background: copied ? "#10b981" : "#0F1E37",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copiata" : "Copia"}
            </button>
          </div>
        </div>

        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", padding: "10px 12px", borderRadius: 8, fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
          ⚠️ Questa password è visibile solo ora. Copiala prima di chiudere
          la finestra.
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "11px",
            background: "#0F1E37",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// Utility components
// ════════════════════════════════════════════════
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        color: "#64748b",
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: "#64748b",
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 14,
  border: "1.5px solid #cbd5e1",
  borderRadius: 8,
  outline: "none",
  fontFamily: "inherit",
};

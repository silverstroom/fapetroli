"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";

interface Row {
  id: string;
  code: string;
  date: string;
  product: string;
  quantity: number;
  unitPrice: number | null;
  totalAmount: number | null;
  dpName: string;
  company: string;
  user: string;
  userPhone: string | null;
  userEmail: string;
  status: OrderStatus;
  notes: string | null;
}

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "WAITING", label: "In attesa" },
  { value: "PROCESSING", label: "In lavorazione" },
  { value: "DELIVERED", label: "Evaso" },
  { value: "CANCELLED", label: "Annullato" },
];

function badgeClass(s: OrderStatus) {
  return s === "WAITING"
    ? "badge-waiting"
    : s === "PROCESSING"
    ? "badge-processing"
    : s === "DELIVERED"
    ? "badge-done"
    : "badge-cancelled";
}

// Normalizza numero telefono per wa.me / tel:
function normalizePhone(phone: string | null) {
  if (!phone) return null;
  let p = phone.replace(/[\s\-().]/g, "");
  if (!p.startsWith("+")) {
    if (p.startsWith("00")) p = "+" + p.slice(2);
    else if (p.startsWith("3") && p.length >= 9) p = "+39" + p;
  }
  return p;
}

const TEMPLATES = [
  {
    id: "in_lavorazione",
    label: "Richiesta in lavorazione",
    text: (o: Row) =>
      `Salve ${o.user}, le confermiamo che la sua richiesta #${o.code} (${o.quantity.toLocaleString("it-IT")} L di ${o.product}) è ora in lavorazione. La contatteremo a breve per i dettagli della consegna. — FA Petroli`,
  },
  {
    id: "consegna_oggi",
    label: "Consegna prevista oggi",
    text: (o: Row) =>
      `Salve ${o.user}, la sua richiesta #${o.code} sarà consegnata oggi presso ${o.dpName}. Le chiediamo gentilmente la disponibilità di un referente in loco. — FA Petroli`,
  },
  {
    id: "richiesta_info",
    label: "Richiesta informazioni",
    text: (o: Row) =>
      `Salve ${o.user}, in merito alla sua richiesta #${o.code} avremmo bisogno di alcune informazioni aggiuntive per procedere. Potrebbe richiamarci? — FA Petroli`,
  },
];

export default function AdminOrdersTable({ orders }: { orders: Row[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [contactOrder, setContactOrder] = useState<Row | null>(null);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState("");

  const filtered = orders.filter((o) => {
    if (status && o.status !== status) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !o.code.toLowerCase().includes(s) &&
        !o.product.toLowerCase().includes(s) &&
        !o.company.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  async function changeStatus(id: string, newStatus: OrderStatus) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoadingId(null);
    if (res.ok) router.refresh();
  }

  function openContact(o: Row) {
    const tpl = TEMPLATES[0];
    setTemplateId(tpl.id);
    setCustomMessage(tpl.text(o));
    setContactOrder(o);
  }

  function selectTemplate(id: string) {
    if (!contactOrder) return;
    setTemplateId(id);
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (tpl) setCustomMessage(tpl.text(contactOrder));
  }

  function sendVia(channel: "whatsapp" | "email" | "call") {
    if (!contactOrder) return;
    const phone = normalizePhone(contactOrder.userPhone);
    if (channel === "whatsapp") {
      if (!phone) {
        alert("Cliente senza numero di telefono.");
        return;
      }
      const url = `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(customMessage)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (channel === "email") {
      const subject = `FA Petroli — Richiesta #${contactOrder.code}`;
      const url = `mailto:${contactOrder.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMessage)}`;
      window.location.href = url;
    } else if (channel === "call") {
      if (!phone) {
        alert("Cliente senza numero di telefono.");
        return;
      }
      window.location.href = `tel:${phone}`;
    }
  }

  return (
    <>
      <div className="filter-bar">
        <span className="filter-label">Filtra:</span>
        <input
          placeholder="🔍 N° richiesta, prodotto, cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tutti gli stati</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: "auto", color: "var(--gray-500)", fontSize: 13 }}>
          {filtered.length} richieste
        </span>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Prodotto</th>
                <th>Quantità</th>
                <th>Totale stim.</th>
                <th>Punto consegna</th>
                <th>Stato</th>
                <th>Cambia stato</th>
                <th>Contatta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      Nessuna richiesta trovata.
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="td-bold">#{o.code}</td>
                  <td>{new Date(o.date).toLocaleDateString("it-IT")}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.company}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      {o.user}
                    </div>
                  </td>
                  <td>{o.product}</td>
                  <td>{o.quantity.toLocaleString("it-IT")} L</td>
                  <td style={{ fontWeight: 700, color: "var(--orange)" }}>
                    {o.totalAmount != null
                      ? "€ " + o.totalAmount.toFixed(2)
                      : "—"}
                  </td>
                  <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    {o.dpName}
                  </td>
                  <td>
                    <span className={"badge " + badgeClass(o.status)}>
                      {STATUSES.find((s) => s.value === o.status)?.label}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      disabled={loadingId === o.id}
                      onChange={(e) =>
                        changeStatus(o.id, e.target.value as OrderStatus)
                      }
                      style={{
                        padding: "6px 10px",
                        fontSize: 13,
                        border: "1.5px solid var(--gray-200)",
                        borderRadius: 8,
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {o.status === "PROCESSING" ||
                    o.status === "WAITING" ? (
                      <button
                        onClick={() => openContact(o)}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          background: "var(--blue)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        💬 Contatta
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {contactOrder && (
        <div
          onClick={() => setContactOrder(null)}
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
              maxWidth: 560,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontFamily: "Barlow Condensed, sans-serif",
                  }}
                >
                  💬 Aggiorna il cliente
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "var(--gray-500)",
                  }}
                >
                  {contactOrder.company} · Richiesta #{contactOrder.code}
                </p>
              </div>
              <button
                onClick={() => setContactOrder(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--gray-500)",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--gray-500)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Modello messaggio
              </label>
              <select
                value={templateId}
                onChange={(e) => selectTemplate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--gray-500)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Testo del messaggio (modificabile)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div
              style={{
                background: "#f5f7fa",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                <strong>📧 Email:</strong> {contactOrder.userEmail}
              </div>
              <div>
                <strong>📞 Telefono:</strong>{" "}
                {contactOrder.userPhone ?? (
                  <em style={{ color: "var(--gray-500)" }}>non disponibile</em>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => sendVia("whatsapp")}
                disabled={!contactOrder.userPhone}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: "12px 16px",
                  background: contactOrder.userPhone ? "#25D366" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: contactOrder.userPhone ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => sendVia("email")}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: "12px 16px",
                  background: "var(--blue)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                📧 Email
              </button>
              <button
                onClick={() => sendVia("call")}
                disabled={!contactOrder.userPhone}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: "12px 16px",
                  background: contactOrder.userPhone ? "var(--orange)" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: contactOrder.userPhone ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                📞 Chiama
              </button>
            </div>

            <p
              style={{
                fontSize: 11,
                color: "var(--gray-500)",
                textAlign: "center",
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              Cliccando su un canale si aprirà l'app corrispondente.
              <br />
              Puoi rivedere il messaggio prima di inviarlo.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

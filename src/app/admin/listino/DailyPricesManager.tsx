"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  icon: string | null;
  currentPrice: number | null;
  currentNotes: string | null;
}
interface HistoryRow {
  productId: string;
  productName: string;
  price: number;
  notes: string | null;
}

export default function DailyPricesManager({
  products,
  today,
  history,
}: {
  products: Product[];
  today: string;
  history: Record<string, HistoryRow[]>;
}) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState(
    products.map((p) => ({
      productId: p.id,
      name: p.name,
      icon: p.icon,
      price: p.currentPrice != null ? String(p.currentPrice) : "",
      notes: p.currentNotes ?? "",
    }))
  );
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDate, setLoadingDate] = useState(false);

  // Quando cambia la data, ricarico i prezzi per quella data
  useEffect(() => {
    if (date === today) return;
    let cancelled = false;
    (async () => {
      setLoadingDate(true);
      const res = await fetch(`/api/admin/daily-prices?date=${date}`);
      const data = await res.json();
      if (cancelled) return;
      const byId = new Map<string, { price: number; notes: string | null }>(
        (data.prices ?? []).map((p: { productId: string; price: number; notes: string | null }) => [
          p.productId,
          { price: p.price, notes: p.notes },
        ])
      );
      setRows((prev) =>
        prev.map((r) => {
          const found = byId.get(r.productId);
          return {
            ...r,
            price: found ? String(found.price) : "",
            notes: found?.notes ?? "",
          };
        })
      );
      setLoadingDate(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [date, today]);

  function update(productId: string, field: "price" | "notes", value: string) {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, [field]: value } : r))
    );
  }

  async function save() {
    setMsg(null);
    const payload = {
      date,
      prices: rows
        .filter((r) => r.price !== "" && !Number.isNaN(Number(r.price)))
        .map((r) => ({
          productId: r.productId,
          price: Number(r.price),
          notes: r.notes || null,
        })),
    };
    if (payload.prices.length === 0) {
      setMsg({ type: "error", text: "Inserisci almeno un prezzo." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/daily-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({
        type: "success",
        text: `Listino del ${formatDate(date)} salvato (${payload.prices.length} prodotti).`,
      });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "error", text: data.error ?? "Errore salvataggio." });
    }
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const historyDates = Object.keys(history).sort().reverse();

  return (
    <>
      {msg && (
        <div className={"alert alert-" + msg.type} style={{ marginBottom: 20 }}>
          {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">📅 Imposta prezzi del giorno</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 13, color: "var(--gray-500)" }}>
              Data:
            </label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "7px 10px",
                border: "1.5px solid var(--gray-200)",
                borderRadius: 8,
                fontSize: 13,
              }}
              disabled={loadingDate}
            />
          </div>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--gray-500)",
              margin: "16px 0 12px",
            }}
          >
            {loadingDate ? "Caricamento…" : `Listino di ${formatDate(date)}`}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Prodotto</th>
                  <th style={{ width: 180 }}>Prezzo (€/L)</th>
                  <th>Note (opzionale)</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state">
                        <div className="empty-state-icon">⛽</div>
                        Nessun prodotto attivo. Aggiungilo dal catalogo prodotti.
                      </div>
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.productId}>
                    <td className="td-bold">
                      {r.icon ?? "⛽"} {r.name}
                    </td>
                    <td>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="0.000"
                          value={r.price}
                          onChange={(e) =>
                            update(r.productId, "price", e.target.value)
                          }
                          style={{
                            paddingRight: 28,
                            width: "100%",
                            border: "1.5px solid var(--gray-200)",
                            borderRadius: 8,
                            padding: "8px 28px 8px 10px",
                            fontSize: 14,
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--gray-500)",
                            fontSize: 13,
                            pointerEvents: "none",
                          }}
                        >
                          €
                        </span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="es. promo flotte, prezzo bloccato…"
                        value={r.notes}
                        onChange={(e) =>
                          update(r.productId, "notes", e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          fontSize: 13,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 16,
            }}
          >
            <button
              className="btn-orange"
              onClick={save}
              disabled={loading || rows.length === 0}
            >
              {loading ? "Salvataggio…" : "💾 Salva listino"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📜 Ultimi 14 giorni</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Prodotti</th>
                <th>Prezzi</th>
              </tr>
            </thead>
            <tbody>
              {historyDates.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      Nessuno storico ancora.
                    </div>
                  </td>
                </tr>
              )}
              {historyDates.map((d) => (
                <tr key={d}>
                  <td className="td-bold">{formatDate(d)}</td>
                  <td>{history[d].length}</td>
                  <td style={{ fontSize: 13 }}>
                    {history[d].map((p, i) => (
                      <span key={p.productId}>
                        {i > 0 && " · "}
                        {p.productName}{" "}
                        <strong style={{ color: "var(--orange)" }}>
                          € {p.price.toFixed(3)}
                        </strong>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

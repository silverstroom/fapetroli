"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";

interface OrderRow {
  id: string;
  code: string;
  date: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number | null;
  totalAmount: number | null;
  dpName: string;
  status: OrderStatus;
  notes: string | null;
}
interface Product {
  id: string;
  name: string;
}

function badgeClass(s: OrderStatus) {
  return s === "WAITING"
    ? "badge-waiting"
    : s === "PROCESSING"
    ? "badge-processing"
    : s === "DELIVERED"
    ? "badge-done"
    : "badge-cancelled";
}
function statusLabel(s: OrderStatus) {
  return s === "WAITING"
    ? "In attesa"
    : s === "PROCESSING"
    ? "In lavorazione"
    : s === "DELIVERED"
    ? "Evasa"
    : "Annullata";
}

export default function StoricoTable({
  orders,
  products,
}: {
  orders: OrderRow[];
  products: Product[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (
        search &&
        !o.code.toLowerCase().includes(search.toLowerCase()) &&
        !o.productName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (status && o.status !== status) return false;
      if (productId && o.productId !== productId) return false;
      return true;
    });
  }, [orders, search, status, productId]);

  async function cancelOrder(o: OrderRow) {
    const ok = window.confirm(
      `Annullare la richiesta #${o.code}?\nQuesta azione non è reversibile.`
    );
    if (!ok) return;
    setMsg(null);
    setCancellingId(o.id);
    const res = await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setCancellingId(null);
    if (res.ok) {
      setMsg({ type: "success", text: `Richiesta #${o.code} annullata.` });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "error", text: data.error ?? "Errore annullamento." });
    }
  }

  return (
    <>
      {msg && (
        <div className={"alert alert-" + msg.type} style={{ marginBottom: 16 }}>
          {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
        </div>
      )}

      <div className="filter-bar">
        <span className="filter-label">Filtra:</span>
        <input
          type="text"
          placeholder="🔍 N° richiesta o prodotto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 220 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="WAITING">In attesa</option>
          <option value="PROCESSING">In lavorazione</option>
          <option value="DELIVERED">Evasa</option>
          <option value="CANCELLED">Annullata</option>
        </select>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Tutti i prodotti</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Richiesta</th>
                <th>Data</th>
                <th>Prodotto</th>
                <th>Quantità</th>
                <th>Totale stim.</th>
                <th>Punto consegna</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      Nessuna richiesta trovata con questi filtri.
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((o) => {
                const canCancel =
                  o.status === "WAITING" || o.status === "PROCESSING";
                return (
                  <tr key={o.id}>
                    <td className="td-bold">#{o.code}</td>
                    <td>{new Date(o.date).toLocaleDateString("it-IT")}</td>
                    <td>{o.productName}</td>
                    <td>{o.quantity.toLocaleString("it-IT")} L</td>
                    <td style={{ fontWeight: 700, color: "var(--orange)" }}>
                      {o.totalAmount != null
                        ? "€ " + o.totalAmount.toFixed(2)
                        : "—"}
                      {o.unitPrice != null && (
                        <div style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 400 }}>
                          € {o.unitPrice.toFixed(3)}/L
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                      {o.dpName}
                    </td>
                    <td>
                      <span className={"badge " + badgeClass(o.status)}>
                        {statusLabel(o.status)}
                      </span>
                      {o.notes && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--gray-500)",
                            marginTop: 4,
                          }}
                        >
                          📝 {o.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      {canCancel ? (
                        <button
                          onClick={() => cancelOrder(o)}
                          disabled={cancellingId === o.id}
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            background: "transparent",
                            color: "#b32e2e",
                            border: "1.5px solid #f0c4c4",
                            borderRadius: 8,
                            cursor: cancellingId === o.id ? "wait" : "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {cancellingId === o.id ? "..." : "❌ Annulla"}
                        </button>
                      ) : (
                        <span
                          style={{ fontSize: 12, color: "var(--gray-500)" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

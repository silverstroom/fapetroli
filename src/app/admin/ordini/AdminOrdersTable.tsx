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
  dpName: string;
  company: string;
  user: string;
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

export default function AdminOrdersTable({ orders }: { orders: Row[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  return (
    <>
      <div className="filter-bar">
        <span className="filter-label">Filtra:</span>
        <input
          placeholder="🔍 N° ordine, prodotto, cliente…"
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
          {filtered.length} ordini
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
                <th>Punto consegna</th>
                <th>Stato</th>
                <th>Cambia stato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      Nessun ordine trovato.
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

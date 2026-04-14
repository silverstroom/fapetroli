"use client";

import { useMemo, useState } from "react";
import { OrderStatus } from "@prisma/client";

interface OrderRow {
  id: string;
  code: string;
  date: string;
  productName: string;
  productId: string;
  quantity: number;
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
    ? "Evaso"
    : "Annullato";
}

export default function StoricoTable({
  orders,
  products,
}: {
  orders: OrderRow[];
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [productId, setProductId] = useState<string>("");

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

  return (
    <>
      <div className="filter-bar">
        <span className="filter-label">Filtra:</span>
        <input
          type="text"
          placeholder="🔍 N° ordine o prodotto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 220 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="WAITING">In attesa</option>
          <option value="PROCESSING">In lavorazione</option>
          <option value="DELIVERED">Evaso</option>
          <option value="CANCELLED">Annullato</option>
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
                <th>N° Ordine</th>
                <th>Data</th>
                <th>Prodotto</th>
                <th>Quantità</th>
                <th>Punto consegna</th>
                <th>Stato</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      Nessun ordine trovato con questi filtri.
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="td-bold">#{o.code}</td>
                  <td>{new Date(o.date).toLocaleDateString("it-IT")}</td>
                  <td>{o.productName}</td>
                  <td>{o.quantity.toLocaleString("it-IT")} L</td>
                  <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    {o.dpName}
                  </td>
                  <td>
                    <span className={"badge " + badgeClass(o.status)}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    {o.notes ?? "—"}
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

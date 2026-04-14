"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  icon: string | null;
  active: boolean;
  ordersCount: number;
}

export default function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Errore");
      return;
    }
    setName("");
    setIcon("");
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questo prodotto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Errore");
      return;
    }
    router.refresh();
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 20,
      }}
    >
      <div className="card">
        <div className="card-header">
          <span className="card-title">Prodotti in catalogo</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Ordini totali</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="td-bold">
                    <span style={{ marginRight: 8, fontSize: 18 }}>
                      {p.icon ?? "⛽"}
                    </span>
                    {p.name}
                  </td>
                  <td>{p.ordersCount}</td>
                  <td>
                    <span
                      className={
                        "badge " +
                        (p.active ? "badge-active" : "badge-suspended")
                      }
                    >
                      {p.active ? "Attivo" : "Disattivo"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: 12, marginRight: 6 }}
                      onClick={() => toggleActive(p.id, p.active)}
                    >
                      {p.active ? "Disattiva" : "Attiva"}
                    </button>
                    <button
                      className="btn-danger"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => remove(p.id)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">+ Nuovo prodotto</span>
        </div>
        <form onSubmit={addProduct} style={{ padding: 22 }}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <div className="form-group">
            <label>Nome prodotto</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Gasolio Marino"
            />
          </div>
          <div className="form-group">
            <label>Icona (emoji)</label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="es. 🚢"
              maxLength={4}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Aggiunta..." : "Aggiungi prodotto"}
          </button>
        </form>
      </div>
    </div>
  );
}

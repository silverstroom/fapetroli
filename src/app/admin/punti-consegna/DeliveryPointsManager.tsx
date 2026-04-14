"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
}
interface DeliveryPoint {
  id: string;
  name: string;
  address: string;
  icon: string | null;
  isPrimary: boolean;
  companyId: string;
  companyName: string;
}

export default function DeliveryPointsManager({
  companies,
  deliveryPoints,
}: {
  companies: Company[];
  deliveryPoints: DeliveryPoint[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    companyId: "",
    name: "",
    address: "",
    icon: "",
    isPrimary: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = filter
    ? deliveryPoints.filter((d) => d.companyId === filter)
    : deliveryPoints;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/delivery-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Errore");
      return;
    }
    setForm({
      companyId: "",
      name: "",
      address: "",
      icon: "",
      isPrimary: false,
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questo punto di consegna?")) return;
    const res = await fetch(`/api/admin/delivery-points/${id}`, {
      method: "DELETE",
    });
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
        gridTemplateColumns: "1fr 360px",
        gap: 20,
      }}
    >
      <div className="card">
        <div className="card-header">
          <span className="card-title">Tutti i punti di consegna</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: 13,
              border: "1.5px solid var(--gray-200)",
              borderRadius: 8,
            }}
          >
            <option value="">Tutte le aziende</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Punto</th>
                <th>Indirizzo</th>
                <th>Azienda</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📍</div>
                      Nessun punto di consegna.
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((dp) => (
                <tr key={dp.id}>
                  <td className="td-bold">
                    {dp.icon ?? "📍"} {dp.name}
                    {dp.isPrimary && (
                      <span
                        className="badge badge-processing"
                        style={{ marginLeft: 8 }}
                      >
                        Principale
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    {dp.address}
                  </td>
                  <td>{dp.companyName}</td>
                  <td>
                    <button
                      className="btn-danger"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => remove(dp.id)}
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
          <span className="card-title">+ Nuovo punto</span>
        </div>
        <form onSubmit={add} style={{ padding: 22 }}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <div className="form-group">
            <label>Azienda</label>
            <select
              required
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            >
              <option value="">Seleziona azienda…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nome punto</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="es. Deposito Principale"
            />
          </div>
          <div className="form-group">
            <label>Indirizzo</label>
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="es. Via Roma 1, Lamezia Terme"
            />
          </div>
          <div className="form-group">
            <label>Icona (emoji)</label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="es. 🏭"
              maxLength={4}
            />
          </div>
          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) =>
                  setForm({ ...form, isPrimary: e.target.checked })
                }
                style={{ width: "auto" }}
              />
              Imposta come punto principale
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Aggiunta..." : "Aggiungi punto"}
          </button>
        </form>
      </div>
    </div>
  );
}

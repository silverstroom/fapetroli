"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserStatus } from "@prisma/client";

interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  createdAt: string;
  company: {
    id: string;
    ragioneSociale: string;
    partitaIva: string;
    citta: string | null;
    ordersCount: number;
  } | null;
}

function statusBadge(s: UserStatus) {
  if (s === "PENDING")
    return <span className="badge badge-pending">In attesa</span>;
  if (s === "ACTIVE") return <span className="badge badge-active">Attivo</span>;
  return <span className="badge badge-suspended">Sospeso</span>;
}

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
      body: JSON.stringify({ status }),
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
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--gray-500)",
                          fontWeight: 400,
                        }}
                      >
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
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          disabled={loadingId === c.id}
                          onClick={() => changeStatus(c.id, "ACTIVE")}
                        >
                          ✓ Approva
                        </button>
                      )}
                      {c.status === "ACTIVE" && (
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          disabled={loadingId === c.id}
                          onClick={() => changeStatus(c.id, "SUSPENDED")}
                        >
                          ⏸ Sospendi
                        </button>
                      )}
                      {c.status === "SUSPENDED" && (
                        <button
                          className="btn-success"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          disabled={loadingId === c.id}
                          onClick={() => changeStatus(c.id, "ACTIVE")}
                        >
                          ▶ Riattiva
                        </button>
                      )}
                      <button
                        className="btn-danger"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        disabled={loadingId === c.id}
                        onClick={() => deleteClient(c.id)}
                      >
                        🗑
                      </button>
                    </div>
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

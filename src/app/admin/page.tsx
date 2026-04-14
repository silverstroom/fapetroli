import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import { formatLitres, statusBadgeClass, statusLabel } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalClients,
    pendingClients,
    ordersThisMonth,
    waitingOrders,
    litresThisMonth,
    recentOrders,
    pendingClientsList,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CLIENT", status: "PENDING" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "WAITING" } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { quantity: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: true, company: true, deliveryPoint: true },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT", status: "PENDING" },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <>
      <Topbar
        title="Dashboard Admin"
        userName={session!.user.name ?? "Admin"}
      />
      <div className="content">
        <div className="dashboard-greeting">
          <h2>Pannello di controllo 🎛️</h2>
          <p>Gestisci clienti, ordini e configurazione del portale</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-icon">👥</div>
            <div className="kpi-label">Clienti attivi</div>
            <div className="kpi-value">{totalClients}</div>
            <div className="kpi-sub">Account approvati</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-icon">⏳</div>
            <div className="kpi-label">In attesa di approvazione</div>
            <div className="kpi-value">{pendingClients}</div>
            <div className="kpi-sub">
              {pendingClients > 0 ? "Richiede azione" : "Nessuna richiesta"}
            </div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-icon">📦</div>
            <div className="kpi-label">Ordini questo mese</div>
            <div className="kpi-value">{ordersThisMonth}</div>
            <div className="kpi-sub">{waitingOrders} in attesa</div>
          </div>
          <div className="kpi-card blue">
            <div className="kpi-icon">🛢️</div>
            <div className="kpi-label">Litri ordinati (mese)</div>
            <div className="kpi-value">
              {formatLitres(litresThisMonth._sum.quantity ?? 0)}
            </div>
            <div className="kpi-sub">Tutti i clienti</div>
          </div>
        </div>

        {pendingClients > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">
                ⚠️ Clienti in attesa di approvazione
              </span>
              <Link href="/admin/clienti" className="card-link">
                Gestisci tutti →
              </Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Azienda</th>
                    <th>Referente</th>
                    <th>Email</th>
                    <th>P.IVA</th>
                    <th>Data richiesta</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClientsList.map((u) => (
                    <tr key={u.id}>
                      <td className="td-bold">
                        {u.company?.ragioneSociale ?? "—"}
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.company?.partitaIva ?? "—"}</td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString("it-IT")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title">Ordini recenti</span>
            <Link href="/admin/ordini" className="card-link">
              Vedi tutti →
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N° Ordine</th>
                  <th>Cliente</th>
                  <th>Prodotto</th>
                  <th>Quantità</th>
                  <th>Punto consegna</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        Nessun ordine ancora.
                      </div>
                    </td>
                  </tr>
                )}
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="td-bold">#{o.code}</td>
                    <td>{o.company.ragioneSociale}</td>
                    <td>{o.product.name}</td>
                    <td>{formatLitres(o.quantity)}</td>
                    <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                      {o.deliveryPoint.name}
                    </td>
                    <td>
                      <span className={"badge " + statusBadgeClass(o.status)}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

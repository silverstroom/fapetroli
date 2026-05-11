import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import { formatLitres, statusBadgeClass, statusLabel } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session!.user.name ?? "Cliente";
  const companyId = session!.user.companyId!;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [ordersThisMonth, lastOrders, yearOrders, deliveredCount, totalCount] =
    await Promise.all([
      prisma.order.count({
        where: { companyId, createdAt: { gte: startOfMonth } },
      }),
      prisma.order.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: true, deliveryPoint: true },
      }),
      prisma.order.aggregate({
        where: { companyId, createdAt: { gte: startOfYear } },
        _sum: { quantity: true },
      }),
      prisma.order.count({
        where: {
          companyId,
          status: "DELIVERED",
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.order.count({
        where: { companyId, createdAt: { gte: startOfMonth } },
      }),
    ]);

  const litresYear = yearOrders._sum.quantity ?? 0;

  return (
    <>
      <Topbar title="Dashboard" userName={userName} />
      <div className="content">
        <div className="dashboard-greeting">
          <h2>Buongiorno, {userName.split(" ")[0]} 👋</h2>
          <p>Ecco il riepilogo della tua attività con FA Petroli</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-icon">📦</div>
            <div className="kpi-label">Richieste questo mese</div>
            <div className="kpi-value">{ordersThisMonth}</div>
            <div className="kpi-sub">Aggiornato in tempo reale</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-icon">🛢️</div>
            <div className="kpi-label">Litri richiesti (anno in corso)</div>
            <div className="kpi-value">{formatLitres(litresYear)}</div>
            <div className="kpi-sub">Dal 1° gennaio</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-icon">✅</div>
            <div className="kpi-label">Richieste evase (mese)</div>
            <div className="kpi-value">
              {deliveredCount} / {totalCount}
            </div>
            <div className="kpi-sub">
              {totalCount - deliveredCount} in lavorazione
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #1a3a5c 0%, #15243d 100%)", color: "#fff", border: "none" }}>
          <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ fontSize: 40 }}>💶</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Listino prezzi del giorno
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                Controlla i prezzi aggiornati e fai una stima
              </div>
            </div>
            <Link href="/client/listino" className="btn-orange">
              Vedi listino →
            </Link>
            <Link href="/client/nuovo-ordine" className="btn-ghost" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
              Invia richiesta
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Ultime richieste</span>
            <Link className="card-link" href="/client/storico">
              Vedi tutti →
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N° Richiesta</th>
                  <th>Prodotto</th>
                  <th>Quantità</th>
                  <th>Punto consegna</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {lastOrders.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        Nessuna richiesta ancora. <br />
                        <Link
                          href="/client/nuovo-ordine"
                          style={{ color: "var(--blue)", fontWeight: 600 }}
                        >
                          Invia la tua prima richiesta →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
                {lastOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="td-bold">#{o.code}</td>
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

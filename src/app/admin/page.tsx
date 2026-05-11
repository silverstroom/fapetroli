import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import { formatLitres, statusBadgeClass, statusLabel } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    waitingOrdersList,
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
    prisma.order.findMany({
      where: { status: "WAITING" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: true, company: true, user: true },
    }),
  ]);

  const kpis = [
    { icon: "👥", label: "Clienti attivi", value: totalClients, sub: "Account approvati", tone: "blue" },
    { icon: "⏳", label: "In attesa approvazione", value: pendingClients, sub: pendingClients > 0 ? "Richiede azione" : "Nessuna richiesta", tone: pendingClients > 0 ? "orange" : "blue" },
    { icon: "📤", label: "Nuove richieste", value: waitingOrders, sub: waitingOrders > 0 ? "Da gestire subito" : "Tutto evaso", tone: waitingOrders > 0 ? "orange" : "green" },
    { icon: "📦", label: "Richieste questo mese", value: ordersThisMonth, sub: "Totale ricevute", tone: "blue" },
    { icon: "🛢️", label: "Litri (mese)", value: formatLitres(litresThisMonth._sum.quantity ?? 0), sub: "Tutti i clienti", tone: "blue" },
  ];

  return (
    <>
      <Topbar title="Dashboard Admin" userName={session!.user.name ?? "Admin"} />
      <div className="content font-sans">
        <div className="mb-6">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-blue mb-1">
            Pannello di controllo 🎛️
          </h2>
          <p className="text-muted-foreground">
            Gestisci clienti, ordini e configurazione del portale
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          {kpis.map((k) => (
            <Card
              key={k.label}
              className={
                k.tone === "orange"
                  ? "border-brand-orange/30 bg-gradient-to-br from-brand-orange/5 to-transparent"
                  : k.tone === "green"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : ""
              }
            >
              <CardContent className="p-5">
                <div className="text-2xl mb-2">{k.icon}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1 leading-tight">
                  {k.label}
                </div>
                <div className={
                  "font-display text-3xl font-extrabold " +
                  (k.tone === "orange" ? "text-brand-orange-dark" : k.tone === "green" ? "text-emerald-700" : "text-brand-blue")
                }>
                  {k.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5">{k.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {waitingOrders > 0 && (
          <Card className="mb-6 border-l-4 border-l-brand-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                📤 Nuove richieste da gestire
                <Badge variant="accent">{waitingOrders}</Badge>
              </CardTitle>
              <Button asChild variant="accent" size="sm">
                <Link href="/admin/ordini">Gestisci tutte →</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-semibold text-muted-foreground p-3">N°</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Cliente</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Prodotto</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Quantità</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Totale stim.</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Inviata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingOrdersList.map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-bold text-brand-blue">#{o.code}</td>
                        <td className="p-3">
                          <div className="font-semibold">{o.company.ragioneSociale}</div>
                          <div className="text-xs text-muted-foreground">{o.user.name}</div>
                        </td>
                        <td className="p-3">{o.product.name}</td>
                        <td className="p-3">{formatLitres(o.quantity)}</td>
                        <td className="p-3 font-bold text-brand-orange-dark">
                          {o.totalAmount != null ? "€ " + o.totalAmount.toFixed(2) : "—"}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleString("it-IT", {
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {pendingClients > 0 && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                ⚠️ Clienti in attesa di approvazione
                <Badge variant="warning">{pendingClients}</Badge>
              </CardTitle>
              <Link href="/admin/clienti" className="text-sm font-semibold text-brand-orange hover:underline">
                Gestisci tutti →
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-semibold text-muted-foreground p-3">Azienda</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Referente</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Email</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">P.IVA</th>
                      <th className="text-left font-semibold text-muted-foreground p-3">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingClientsList.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-bold text-brand-blue">{u.company?.ragioneSociale ?? "—"}</td>
                        <td className="p-3">{u.name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">{u.company?.partitaIva ?? "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("it-IT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Richieste recenti</CardTitle>
            <Link href="/admin/ordini" className="text-sm font-semibold text-brand-orange hover:underline">
              Vedi tutte →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left font-semibold text-muted-foreground p-3">N°</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Cliente</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Prodotto</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Quantità</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Consegna</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground">
                        <div className="text-4xl mb-2">📭</div>
                        Nessuna richiesta ancora.
                      </td>
                    </tr>
                  )}
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-bold text-brand-blue">#{o.code}</td>
                      <td className="p-3">{o.company.ragioneSociale}</td>
                      <td className="p-3">{o.product.name}</td>
                      <td className="p-3">{formatLitres(o.quantity)}</td>
                      <td className="p-3 text-xs text-muted-foreground">{o.deliveryPoint.name}</td>
                      <td className="p-3">
                        <span className={"badge " + statusBadgeClass(o.status)}>
                          {statusLabel(o.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

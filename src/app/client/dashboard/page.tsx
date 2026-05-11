import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import { formatLitres, statusBadgeClass, statusLabel } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Droplets,
  CheckCircle2,
  Wallet,
  Inbox,
  ArrowRight,
  Send,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session!.user.name ?? "Cliente";
  const companyId = session!.user.companyId!;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [ordersThisMonth, lastOrders, yearOrders, deliveredCount, totalCount, todayPrices] =
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
        where: { companyId, status: "DELIVERED", createdAt: { gte: startOfMonth } },
      }),
      prisma.order.count({ where: { companyId, createdAt: { gte: startOfMonth } } }),
      prisma.dailyPrice.findMany({
        where: { date: today },
        include: { product: true },
        orderBy: { product: { name: "asc" } },
      }),
    ]);

  const litresYear = yearOrders._sum.quantity ?? 0;

  return (
    <>
      <Topbar title="Dashboard" userName={userName} />
      <div className="content font-sans">
        <div className="mb-6">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-blue mb-1">
            Buongiorno, {userName.split(" ")[0]}
          </h2>
          <p className="text-muted-foreground">
            Ecco il riepilogo della tua attività con FA Petroli
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <Package className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <Badge variant="outline" className="text-[10px]">Mese</Badge>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Richieste questo mese
              </div>
              <div className="font-display text-4xl font-extrabold text-brand-blue">
                {ordersThisMonth}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Aggiornato in tempo reale
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-brand-orange/30 bg-gradient-to-br from-brand-orange/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-brand-orange/10 text-brand-orange-dark flex items-center justify-center">
                  <Droplets className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <Badge variant="accent" className="text-[10px]">Anno</Badge>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Litri richiesti
              </div>
              <div className="font-display text-4xl font-extrabold text-brand-orange-dark">
                {formatLitres(litresYear)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Dal 1° gennaio
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <Badge variant="success" className="text-[10px]">Mese</Badge>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Richieste evase
              </div>
              <div className="font-display text-4xl font-extrabold text-emerald-700">
                {deliveredCount}<span className="text-2xl text-muted-foreground">/{totalCount}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {totalCount - deliveredCount} in lavorazione
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Listino */}
        <Card className="mb-6 overflow-hidden border-none bg-gradient-to-br from-[#0F1E37] via-[#15243d] to-[#1A3A5C] text-white relative">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-brand-orange/20 blur-3xl" />
          <CardContent className="relative p-6 flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-brand-orange shrink-0">
              <Wallet className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs uppercase tracking-[2px] opacity-60 mb-1">
                Listino del giorno
              </div>
              <div className="font-display text-2xl font-bold mb-1">
                {todayPrices.length > 0
                  ? `${todayPrices.length} prodotti disponibili oggi`
                  : "Listino in arrivo"}
              </div>
              <div className="text-sm text-white/70">
                {todayPrices.length > 0
                  ? "Consulta i prezzi €/L e stima il totale della tua richiesta"
                  : "FA Petroli pubblicherà a breve i prezzi aggiornati"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="accent" size="lg">
                <Link href="/client/listino">
                  Vedi listino
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <Link href="/client/nuovo-ordine">
                  <Send className="h-4 w-4" />
                  Invia richiesta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ultime richieste */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Ultime richieste</CardTitle>
            <Link href="/client/storico" className="text-sm font-semibold text-brand-orange hover:underline inline-flex items-center gap-1">
              Vedi tutte <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left font-semibold text-muted-foreground p-3">N° Richiesta</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Prodotto</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Quantità</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Consegna</th>
                    <th className="text-left font-semibold text-muted-foreground p-3">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {lastOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground">
                        <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" strokeWidth={1.5} />
                        <div className="mb-2">Nessuna richiesta ancora.</div>
                        <Link href="/client/nuovo-ordine" className="text-brand-orange font-semibold hover:underline inline-flex items-center gap-1">
                          Invia la tua prima richiesta <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )}
                  {lastOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-brand-blue">#{o.code}</td>
                      <td className="p-3">{o.product.name}</td>
                      <td className="p-3">{formatLitres(o.quantity)}</td>
                      <td className="p-3 text-muted-foreground text-xs">{o.deliveryPoint.name}</td>
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

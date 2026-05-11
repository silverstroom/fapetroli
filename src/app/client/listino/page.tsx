import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Send,
  FileText,
  CheckCircle2,
  Info,
  Fuel,
  ClipboardList,
} from "lucide-react";

function todayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function ListinoClientPage() {
  const session = await auth();
  const today = todayUTC();

  let prices = await prisma.dailyPrice.findMany({
    where: { date: today },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });

  let effectiveDate = today;
  if (prices.length === 0) {
    const latest = await prisma.dailyPrice.findFirst({
      where: { date: { lte: today } },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    if (latest) {
      effectiveDate = latest.date;
      prices = await prisma.dailyPrice.findMany({
        where: { date: latest.date },
        include: { product: true },
        orderBy: { product: { name: "asc" } },
      });
    }
  }

  const isToday =
    effectiveDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);

  return (
    <>
      <Topbar title="Listino prezzi" userName={session!.user.name ?? "Cliente"} />
      <div className="content font-sans">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-orange/10 text-brand-orange-dark flex items-center justify-center">
              <Wallet className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-blue mb-1">
                Listino prezzi del giorno
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Prezzi €/litro aggiornati da FA Petroli. Il totale della tua
                richiesta verrà calcolato sulla quantità che indicherai.
              </p>
            </div>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link href="/client/nuovo-ordine">
              <Send className="h-4 w-4" />
              Invia una richiesta
            </Link>
          </Button>
        </div>

        {prices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" strokeWidth={1.5} />
              <p className="font-display text-xl font-bold text-brand-blue mb-1">
                Nessun listino disponibile
              </p>
              <p className="text-sm text-muted-foreground">
                FA Petroli pubblicherà a breve i prezzi aggiornati.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={
              "mb-6 flex items-center gap-3 rounded-xl border p-4 " +
              (isToday ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50")
            }>
              {isToday ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" strokeWidth={2} />
              ) : (
                <Info className="h-5 w-5 shrink-0 text-blue-600" strokeWidth={2} />
              )}
              <div className="flex-1 text-sm">
                <span className={isToday ? "text-emerald-900" : "text-blue-900"}>
                  {isToday ? "Listino aggiornato a oggi: " : "Ultimo listino disponibile: "}
                </span>
                <strong className="font-bold">
                  {effectiveDate.toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {prices.map((p) => (
                <Card
                  key={p.id}
                  className="group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-orange/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
                  <CardContent className="relative p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange-dark flex items-center justify-center">
                        <Fuel className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                      {p.notes && (
                        <Badge variant="accent" className="text-[10px]">
                          {p.notes}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {p.product.name}
                    </div>
                    <div className="font-display text-4xl font-extrabold text-brand-orange-dark">
                      € {p.price.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">al litro</div>
                    <div className="mt-4 pt-4 border-t border-border text-xs space-y-1.5">
                      <div className="flex justify-between text-muted-foreground">
                        <span>1.000 L</span>
                        <span className="font-semibold text-brand-blue">€ {(p.price * 1000).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>5.000 L</span>
                        <span className="font-semibold text-brand-blue">€ {(p.price * 5000).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Riepilogo prezzi (€/L)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-semibold text-muted-foreground p-3">Prodotto</th>
                        <th className="text-left font-semibold text-muted-foreground p-3">Prezzo unitario</th>
                        <th className="text-left font-semibold text-muted-foreground p-3">Esempio 1.000 L</th>
                        <th className="text-left font-semibold text-muted-foreground p-3">Esempio 5.000 L</th>
                        <th className="text-left font-semibold text-muted-foreground p-3">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-bold text-brand-blue">
                            <span className="inline-flex items-center gap-2">
                              <Fuel className="h-4 w-4 text-brand-orange-dark" strokeWidth={1.75} />
                              {p.product.name}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-brand-orange-dark">€ {p.price.toFixed(3)}</td>
                          <td className="p-3">€ {(p.price * 1000).toFixed(2)}</td>
                          <td className="p-3">€ {(p.price * 5000).toFixed(2)}</td>
                          <td className="p-3 text-xs text-muted-foreground">{p.notes ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

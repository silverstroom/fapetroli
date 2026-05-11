import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import DailyPricesManager from "./DailyPricesManager";

function todayLocalISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default async function ListinoAdminPage() {
  const session = await auth();
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const today = todayLocalISO();
  const todayDate = new Date(today + "T00:00:00.000Z");

  const todayPrices = await prisma.dailyPrice.findMany({
    where: { date: todayDate },
  });
  const todayMap = new Map(todayPrices.map((p) => [p.productId, p]));

  // Storico ultimi 14 giorni raggruppato per data
  const since = new Date(todayDate);
  since.setUTCDate(since.getUTCDate() - 14);
  const recent = await prisma.dailyPrice.findMany({
    where: { date: { gte: since } },
    include: { product: true },
    orderBy: [{ date: "desc" }, { product: { name: "asc" } }],
  });

  const recentByDate: Record<
    string,
    { productId: string; productName: string; price: number; notes: string | null }[]
  > = {};
  for (const p of recent) {
    const k = p.date.toISOString().slice(0, 10);
    if (!recentByDate[k]) recentByDate[k] = [];
    recentByDate[k].push({
      productId: p.productId,
      productName: p.product.name,
      price: p.price,
      notes: p.notes,
    });
  }

  return (
    <>
      <Topbar title="Listino prezzi" userName={session!.user.name ?? "Admin"} />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Listino prezzi giornaliero 💶</h2>
            <p>Aggiorna ogni giorno i prezzi €/litro dei prodotti</p>
          </div>
        </div>
        <DailyPricesManager
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            icon: p.icon,
            currentPrice: todayMap.get(p.id)?.price ?? null,
            currentNotes: todayMap.get(p.id)?.notes ?? null,
          }))}
          today={today}
          history={recentByDate}
        />
      </div>
    </>
  );
}

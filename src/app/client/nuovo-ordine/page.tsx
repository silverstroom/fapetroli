import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import NewOrderForm from "./NewOrderForm";

function todayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function NuovoOrdinePage() {
  const session = await auth();
  const companyId = session!.user.companyId!;
  const today = todayUTC();

  const [products, deliveryPoints, prices] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.deliveryPoint.findMany({
      where: { companyId },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    }),
    prisma.dailyPrice.findMany({
      where: { date: today },
      select: { productId: true, price: true },
    }),
  ]);

  let priceList = prices;
  let priceDate = today;
  if (priceList.length === 0) {
    const latest = await prisma.dailyPrice.findFirst({
      where: { date: { lte: today } },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    if (latest) {
      priceDate = latest.date;
      priceList = await prisma.dailyPrice.findMany({
        where: { date: latest.date },
        select: { productId: true, price: true },
      });
    }
  }

  const priceMap: Record<string, number> = {};
  for (const p of priceList) priceMap[p.productId] = p.price;

  return (
    <>
      <Topbar title="Invia richiesta" userName={session!.user.name ?? "Cliente"} />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Invia una richiesta 📤</h2>
            <p>
              Compila il modulo per inviare la tua richiesta a FA Petroli. Il
              totale stimato viene calcolato sul listino del giorno.
            </p>
          </div>
        </div>
        <NewOrderForm
          products={products}
          deliveryPoints={deliveryPoints}
          priceMap={priceMap}
          priceDate={priceDate.toISOString().slice(0, 10)}
          hasPriceList={priceList.length > 0}
        />
      </div>
    </>
  );
}

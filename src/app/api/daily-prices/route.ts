import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  let date: Date;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    date = new Date(dateParam + "T00:00:00.000Z");
  } else {
    date = todayUTC();
  }

  // Trova il listino della data richiesta, o l'ultimo disponibile precedente
  let prices = await prisma.dailyPrice.findMany({
    where: { date },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });

  let effectiveDate = date;
  if (prices.length === 0) {
    const latest = await prisma.dailyPrice.findFirst({
      where: { date: { lte: date } },
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

  return NextResponse.json({
    date: effectiveDate.toISOString().slice(0, 10),
    requestedDate: date.toISOString().slice(0, 10),
    prices: prices.map((p) => ({
      id: p.id,
      productId: p.productId,
      productName: p.product.name,
      productIcon: p.product.icon,
      price: p.price,
      notes: p.notes,
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}

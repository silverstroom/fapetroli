import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const upsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida (YYYY-MM-DD)"),
  prices: z.array(
    z.object({
      productId: z.string().min(1),
      price: z.number().nonnegative(),
      notes: z.string().max(200).optional().nullable(),
    })
  ),
});

function parseDate(d: string) {
  // YYYY-MM-DD -> Date in UTC alle 00:00 (campo @db.Date)
  return new Date(d + "T00:00:00.000Z");
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const days = Number(searchParams.get("days") ?? "14");

  if (date) {
    const prices = await prisma.dailyPrice.findMany({
      where: { date: parseDate(date) },
      include: { product: true },
      orderBy: { product: { name: "asc" } },
    });
    return NextResponse.json({ prices });
  }

  // Ultimi N giorni
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - days);

  const prices = await prisma.dailyPrice.findMany({
    where: { date: { gte: since } },
    include: { product: true },
    orderBy: [{ date: "desc" }, { product: { name: "asc" } }],
  });
  return NextResponse.json({ prices });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Dati non validi: " + parsed.error.issues[0].message },
      { status: 400 }
    );

  const date = parseDate(parsed.data.date);

  await prisma.$transaction(
    parsed.data.prices.map((p) =>
      prisma.dailyPrice.upsert({
        where: { productId_date: { productId: p.productId, date } },
        create: {
          productId: p.productId,
          date,
          price: p.price,
          notes: p.notes || null,
        },
        update: { price: p.price, notes: p.notes || null },
      })
    )
  );

  return NextResponse.json({ ok: true, count: parsed.data.prices.length });
}

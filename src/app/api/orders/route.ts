import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().min(100),
  deliveryPointId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "Azienda non trovata" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati ordine non validi" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Verifica che il delivery point appartenga all'azienda
  const dp = await prisma.deliveryPoint.findFirst({
    where: { id: data.deliveryPointId, companyId },
  });
  if (!dp) {
    return NextResponse.json(
      { error: "Punto di consegna non valido" },
      { status: 400 }
    );
  }

  // Verifica che il prodotto esista e sia attivo
  const product = await prisma.product.findFirst({
    where: { id: data.productId, active: true },
  });
  if (!product) {
    return NextResponse.json(
      { error: "Prodotto non disponibile" },
      { status: 400 }
    );
  }

  // Snapshot del prezzo dal listino del giorno (o ultimo disponibile)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let dailyPrice = await prisma.dailyPrice.findUnique({
    where: { productId_date: { productId: data.productId, date: today } },
  });
  if (!dailyPrice) {
    dailyPrice = await prisma.dailyPrice.findFirst({
      where: { productId: data.productId, date: { lte: today } },
      orderBy: { date: "desc" },
    });
  }
  const unitPrice = dailyPrice?.price ?? null;
  const totalAmount = unitPrice != null ? unitPrice * data.quantity : null;

  // Genera codice ordine progressivo
  const count = await prisma.order.count();
  const code = "ORD-" + String(count + 1).padStart(4, "0");

  const order = await prisma.order.create({
    data: {
      code,
      quantity: data.quantity,
      unitPrice,
      totalAmount,
      notes: data.notes || null,
      userId: session.user.id,
      companyId,
      productId: data.productId,
      deliveryPointId: data.deliveryPointId,
    },
  });

  return NextResponse.json({ ok: true, id: order.id, code: order.code });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { companyId: session.user.companyId! },
    orderBy: { createdAt: "desc" },
    include: { product: true, deliveryPoint: true },
  });
  return NextResponse.json({ orders });
}

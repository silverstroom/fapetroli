import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const schema = z.object({ status: z.nativeEnum(OrderStatus) });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Stato non valido" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order)
    return NextResponse.json(
      { error: "Ordine non trovato" },
      { status: 404 }
    );

  await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}

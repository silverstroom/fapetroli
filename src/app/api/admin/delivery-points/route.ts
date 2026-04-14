import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(2),
  address: z.string().min(3),
  icon: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
  });
  if (!company)
    return NextResponse.json(
      { error: "Azienda non trovata" },
      { status: 404 }
    );

  // Se isPrimary, smarca eventuali altri primary della stessa azienda
  if (parsed.data.isPrimary) {
    await prisma.deliveryPoint.updateMany({
      where: { companyId: parsed.data.companyId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const dp = await prisma.deliveryPoint.create({
    data: {
      companyId: parsed.data.companyId,
      name: parsed.data.name,
      address: parsed.data.address,
      icon: parsed.data.icon || null,
      isPrimary: parsed.data.isPrimary ?? false,
    },
  });

  return NextResponse.json({ ok: true, deliveryPoint: dp });
}

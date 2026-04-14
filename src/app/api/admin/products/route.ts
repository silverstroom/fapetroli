import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const exists = await prisma.product.findUnique({
    where: { name: parsed.data.name },
  });
  if (exists)
    return NextResponse.json(
      { error: "Esiste già un prodotto con questo nome" },
      { status: 409 }
    );

  const product = await prisma.product.create({
    data: { name: parsed.data.name, icon: parsed.data.icon || null },
  });
  return NextResponse.json({ ok: true, product });
}

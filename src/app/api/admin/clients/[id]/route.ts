import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@prisma/client";

const patchSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Stato non valido" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "CLIENT") {
    return NextResponse.json(
      { error: "Cliente non trovato" },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    include: { company: true },
  });
  if (!target || target.role !== "CLIENT") {
    return NextResponse.json(
      { error: "Cliente non trovato" },
      { status: 404 }
    );
  }

  // Elimina utente; se la company non ha altri utenti, eliminala con cascade
  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({ where: { userId: target.id } });
    await tx.user.delete({ where: { id: target.id } });
    if (target.companyId) {
      const others = await tx.user.count({
        where: { companyId: target.companyId },
      });
      if (others === 0) {
        await tx.order.deleteMany({ where: { companyId: target.companyId } });
        await tx.deliveryPoint.deleteMany({
          where: { companyId: target.companyId },
        });
        await tx.company.delete({ where: { id: target.companyId } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Annullamento richiesta da parte del cliente proprietario
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.action !== "cancel") {
    return NextResponse.json(
      { error: "Azione non supportata" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json(
      { error: "Richiesta non trovata" },
      { status: 404 }
    );
  }
  if (order.companyId !== session.user.companyId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }
  if (order.status === "DELIVERED") {
    return NextResponse.json(
      { error: "Impossibile annullare una richiesta già evasa" },
      { status: 400 }
    );
  }
  if (order.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Richiesta già annullata" },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}

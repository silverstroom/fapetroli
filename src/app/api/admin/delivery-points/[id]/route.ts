import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const ordersCount = await prisma.order.count({
    where: { deliveryPointId: params.id },
  });
  if (ordersCount > 0) {
    return NextResponse.json(
      {
        error: `Impossibile eliminare: ${ordersCount} ordini sono collegati a questo punto di consegna.`,
      },
      { status: 400 }
    );
  }

  await prisma.deliveryPoint.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

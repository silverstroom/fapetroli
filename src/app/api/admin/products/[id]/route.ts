import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await auth();
  return s?.user?.role === "ADMIN" ? s : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  if (typeof body.active !== "boolean")
    return NextResponse.json({ error: "Dato non valido" }, { status: 400 });

  await prisma.product.update({
    where: { id: params.id },
    data: { active: body.active },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const ordersCount = await prisma.order.count({
    where: { productId: params.id },
  });
  if (ordersCount > 0) {
    return NextResponse.json(
      {
        error: `Impossibile eliminare: il prodotto è collegato a ${ordersCount} ordini. Disattivalo invece.`,
      },
      { status: 400 }
    );
  }
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

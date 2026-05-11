import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import StoricoTable from "./StoricoTable";

export default async function StoricoPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { product: true, deliveryPoint: true },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  const plain = orders.map((o) => ({
    id: o.id,
    code: o.code,
    date: o.createdAt.toISOString(),
    productName: o.product.name,
    productId: o.product.id,
    quantity: o.quantity,
    unitPrice: o.unitPrice,
    totalAmount: o.totalAmount,
    dpName: o.deliveryPoint.name,
    status: o.status,
    notes: o.notes,
  }));

  return (
    <>
      <Topbar title="Le mie richieste" userName={session!.user.name ?? "Cliente"} />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Le mie richieste 📋</h2>
            <p>Visualizza, monitora e gestisci tutte le tue richieste</p>
          </div>
          <Link href="/client/nuovo-ordine" className="btn-orange">
            ➕ Invia richiesta
          </Link>
        </div>
        <StoricoTable orders={plain} products={products} />
      </div>
    </>
  );
}

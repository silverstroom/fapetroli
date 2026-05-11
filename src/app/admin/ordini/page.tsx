import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import AdminOrdersTable from "./AdminOrdersTable";

export default async function AdminOrdiniPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, deliveryPoint: true, company: true, user: true },
  });

  const plain = orders.map((o) => ({
    id: o.id,
    code: o.code,
    date: o.createdAt.toISOString(),
    product: o.product.name,
    quantity: o.quantity,
    unitPrice: o.unitPrice,
    totalAmount: o.totalAmount,
    dpName: o.deliveryPoint.name,
    company: o.company.ragioneSociale,
    user: o.user.name,
    userPhone: o.user.phone,
    userEmail: o.user.email,
    status: o.status,
    notes: o.notes,
  }));

  return (
    <>
      <Topbar
        title="Richieste / Ordini"
        userName={session!.user.name ?? "Admin"}
      />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Richieste & Ordini 📦</h2>
            <p>
              Visualizza, gestisci e aggiorna lo stato di tutte le richieste
              ricevute dai clienti
            </p>
          </div>
        </div>
        <AdminOrdersTable orders={plain} />
      </div>
    </>
  );
}

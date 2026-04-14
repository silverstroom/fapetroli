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
    dpName: o.deliveryPoint.name,
    company: o.company.ragioneSociale,
    user: o.user.name,
    status: o.status,
    notes: o.notes,
  }));

  return (
    <>
      <Topbar
        title="Tutti gli Ordini"
        userName={session!.user.name ?? "Admin"}
      />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Tutti gli Ordini</h2>
            <p>
              Visualizza, gestisci e aggiorna lo stato di tutti gli ordini
              ricevuti
            </p>
          </div>
        </div>
        <AdminOrdersTable orders={plain} />
      </div>
    </>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import ClientsTable from "./ClientsTable";

export default async function ClientiPage() {
  const session = await auth();
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { company: { include: { _count: { select: { orders: true } } } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const plain = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    company: c.company
      ? {
          id: c.company.id,
          ragioneSociale: c.company.ragioneSociale,
          partitaIva: c.company.partitaIva,
          citta: c.company.citta,
          ordersCount: c.company._count.orders,
        }
      : null,
  }));

  return (
    <>
      <Topbar
        title="Gestione Clienti"
        userName={session!.user.name ?? "Admin"}
      />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Gestione Clienti</h2>
            <p>
              Approva nuove registrazioni, sospendi o riattiva account esistenti
            </p>
          </div>
        </div>
        <ClientsTable clients={plain} />
      </div>
    </>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import DeliveryPointsManager from "./DeliveryPointsManager";

export default async function PuntiConsegnaPage() {
  const session = await auth();

  const [companies, deliveryPoints] = await Promise.all([
    prisma.company.findMany({ orderBy: { ragioneSociale: "asc" } }),
    prisma.deliveryPoint.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: true },
    }),
  ]);

  const plainCompanies = companies.map((c) => ({
    id: c.id,
    name: c.ragioneSociale,
  }));
  const plainDps = deliveryPoints.map((dp) => ({
    id: dp.id,
    name: dp.name,
    address: dp.address,
    icon: dp.icon,
    isPrimary: dp.isPrimary,
    companyId: dp.companyId,
    companyName: dp.company.ragioneSociale,
  }));

  return (
    <>
      <Topbar
        title="Punti di Consegna"
        userName={session!.user.name ?? "Admin"}
      />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Punti di Consegna</h2>
            <p>Aggiungi e gestisci i punti di consegna dei tuoi clienti</p>
          </div>
        </div>
        <DeliveryPointsManager
          companies={plainCompanies}
          deliveryPoints={plainDps}
        />
      </div>
    </>
  );
}

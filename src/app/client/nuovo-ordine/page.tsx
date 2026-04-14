import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import NewOrderForm from "./NewOrderForm";

export default async function NuovoOrdinePage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const [products, deliveryPoints] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.deliveryPoint.findMany({
      where: { companyId },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <Topbar title="Nuovo Ordine" userName={session!.user.name ?? "Cliente"} />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Nuovo Ordine</h2>
            <p>Compila il modulo per inviare la tua richiesta a FA Petroli</p>
          </div>
        </div>
        <NewOrderForm products={products} deliveryPoints={deliveryPoints} />
      </div>
    </>
  );
}

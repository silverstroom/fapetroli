import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import ProductsManager from "./ProductsManager";

export default async function ProdottiPage() {
  const session = await auth();
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  });
  const plain = products.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    active: p.active,
    ordersCount: p._count.orders,
  }));

  return (
    <>
      <Topbar
        title="Catalogo Prodotti"
        userName={session!.user.name ?? "Admin"}
      />
      <div className="content">
        <div className="page-header">
          <div>
            <h2>Catalogo Prodotti</h2>
            <p>Gestisci i prodotti disponibili nel portale clienti</p>
          </div>
        </div>
        <ProductsManager products={plain} />
      </div>
    </>
  );
}

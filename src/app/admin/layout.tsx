import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import {
  LayoutDashboard,
  Users,
  Package,
  Wallet,
  Fuel,
  MapPin,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/client/dashboard");

  const waitingOrders = await prisma.order.count({ where: { status: "WAITING" } });

  const ico = "h-[18px] w-[18px]";
  const links = [
    { href: "/admin", icon: <LayoutDashboard className={ico} />, label: "Dashboard", exact: true },
    { href: "/admin/clienti", icon: <Users className={ico} />, label: "Clienti" },
    {
      href: "/admin/ordini",
      icon: <Package className={ico} />,
      label: "Richieste / Ordini",
      badge: waitingOrders > 0 ? String(waitingOrders) : undefined,
    },
    { href: "/admin/listino", icon: <Wallet className={ico} />, label: "Listino prezzi" },
    { href: "/admin/prodotti", icon: <Fuel className={ico} />, label: "Prodotti" },
    { href: "/admin/punti-consegna", icon: <MapPin className={ico} />, label: "Punti Consegna" },
  ];

  return (
    <div className="app-shell">
      <Sidebar
        brandSubtitle="Area Admin"
        clientLabel="Loggato come"
        clientName={session.user.name ?? "Admin"}
        clientSub="Amministratore"
        sectionLabel="Gestione"
        links={links}
      />
      <div className="main-area">{children}</div>
    </div>
  );
}

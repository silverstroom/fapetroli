import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/client/dashboard");

  const links = [
    { href: "/admin", icon: "📊", label: "Dashboard" },
    { href: "/admin/clienti", icon: "👥", label: "Clienti" },
    { href: "/admin/ordini", icon: "📦", label: "Tutti gli Ordini" },
    { href: "/admin/prodotti", icon: "⛽", label: "Prodotti" },
    { href: "/admin/punti-consegna", icon: "📍", label: "Punti Consegna" },
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

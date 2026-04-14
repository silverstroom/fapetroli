import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/admin");

  const company = session.user.companyId
    ? await prisma.company.findUnique({
        where: { id: session.user.companyId },
      })
    : null;

  const links = [
    { href: "/client/dashboard", icon: "🏠", label: "Dashboard" },
    { href: "/client/nuovo-ordine", icon: "📦", label: "Nuovo Ordine", badge: "+" },
    { href: "/client/storico", icon: "📋", label: "Storico Ordini" },
    { href: "/client/profilo", icon: "🏢", label: "Profilo Cliente" },
  ];

  return (
    <div className="app-shell">
      <Sidebar
        brandSubtitle="Area Clienti"
        clientLabel="Account attivo"
        clientName={company?.ragioneSociale ?? session.user.name ?? "Cliente"}
        clientSub={company ? `P.IVA ${company.partitaIva}` : ""}
        sectionLabel="Menu principale"
        links={links}
      />
      <div className="main-area">{children}</div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import {
  LayoutDashboard,
  Wallet,
  Send,
  FileText,
  Settings,
} from "lucide-react";

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

  const ico = "h-[18px] w-[18px]";
  const links = [
    { href: "/client/dashboard", icon: <LayoutDashboard className={ico} />, label: "Dashboard" },
    { href: "/client/listino", icon: <Wallet className={ico} />, label: "Listino prezzi" },
    { href: "/client/nuovo-ordine", icon: <Send className={ico} />, label: "Invia richiesta" },
    { href: "/client/storico", icon: <FileText className={ico} />, label: "Le mie richieste" },
    { href: "/client/profilo", icon: <Settings className={ico} />, label: "Profilo & impostazioni" },
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export interface NavLink {
  href: string;
  icon: string;
  label: string;
  badge?: string;
}

interface Props {
  brandSubtitle: string;
  clientLabel: string;
  clientName: string;
  clientSub: string;
  sectionLabel: string;
  links: NavLink[];
}

export default function Sidebar({
  brandSubtitle,
  clientLabel,
  clientName,
  clientSub,
  sectionLabel,
  links,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">FA</div>
        <div className="sidebar-brand-text">
          FA Petroli <small>{brandSubtitle}</small>
        </div>
      </div>
      <div className="sidebar-client">
        <div className="sidebar-client-label">{clientLabel}</div>
        <div className="sidebar-client-name">{clientName}</div>
        <div className="sidebar-client-sub">{clientSub}</div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{sectionLabel}</div>
        {links.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={"nav-item" + (active ? " active" : "")}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
              {l.badge && <span className="nav-badge">{l.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <span style={{ fontSize: 18 }}>🚪</span>Esci dall'area riservata
        </button>
      </div>
    </aside>
  );
}

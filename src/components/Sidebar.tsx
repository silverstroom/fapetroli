"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, X, Menu } from "lucide-react";

export interface NavLink {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  exact?: boolean;
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
      >
        <Menu size={22} />
      </button>
      <div
        className={"sidebar-overlay" + (open ? " open" : "")}
        onClick={() => setOpen(false)}
      />
      <aside className={"sidebar" + (open ? " open" : "")}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon has-logo">
            <img src="/logo.jpg" alt="FA Petroli" />
          </div>
          <div className="sidebar-brand-text">
            FA Petroli <small>{brandSubtitle}</small>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-client">
          <div className="sidebar-client-label">{clientLabel}</div>
          <div className="sidebar-client-name">{clientName}</div>
          <div className="sidebar-client-sub">{clientSub}</div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{sectionLabel}</div>
          {links.map((l) => {
            const active = l.exact
              ? pathname === l.href
              : pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={"nav-item" + (active ? " active" : "")}
                onClick={() => setOpen(false)}
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
            <LogOut size={18} />
            Esci dall&apos;area riservata
          </button>
        </div>
      </aside>
    </>
  );
}

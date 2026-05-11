"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export interface NavLink {
  href: string;
  icon: string;
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
        <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
          <rect width="22" height="2.5" rx="1.25" fill="currentColor" />
          <rect y="7.5" width="22" height="2.5" rx="1.25" fill="currentColor" />
          <rect y="15" width="16" height="2.5" rx="1.25" fill="currentColor" />
        </svg>
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
            ✕
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
            <span style={{ fontSize: 18 }}>🚪</span>Esci dall&apos;area riservata
          </button>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  UserCheck,
  Shield,
  Briefcase,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/components/session-provider";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { currentUser, allUsers, switchUser } = useSession();

  const currentRole = currentUser?.role || "customer";

  return (
    <header className="site-header">
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link className="wordmark" href="/" onClick={() => setOpen(false)}>
          M<span>O</span>BILITY<span className="wordmark-dot">.</span>
        </Link>
        <span
          className="hidden md:inline-block"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "1.2px",
            color: "#7e8374",
            borderLeft: "1px solid var(--line)",
            paddingLeft: 14,
            textTransform: "uppercase",
          }}
        >
          Campus In Motion
        </span>
      </div>

      <nav className={open ? "nav-links nav-open" : "nav-links"}>
        <Link href="/rent" onClick={() => setOpen(false)}>
          Browse Vehicles
        </Link>
        <Link href="/guidelines" onClick={() => setOpen(false)}>
          Guidelines &amp; Safety
        </Link>
        <Link href="/rent/bookings" onClick={() => setOpen(false)}>
          My Trips
        </Link>
        <Link href="/host/dashboard" onClick={() => setOpen(false)}>
          Host Studio
        </Link>
        <Link href="/admin" onClick={() => setOpen(false)}>
          Admin Desk
        </Link>

        {/* ROLE SELECTOR DROPDOWN */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#e8ebe0",
              border: "1px solid #d3d8c8",
              padding: "7px 12px",
              borderRadius: 3,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--mono)",
              color: "#2e3523",
              cursor: "pointer",
            }}
          >
            {currentRole === "customer" && <UserCheck size={13} className="text-[#5b7a1e]" />}
            {currentRole === "owner" && <Briefcase size={13} className="text-[#3b6099]" />}
            {currentRole === "admin" && <Shield size={13} className="text-[#b91c1c]" />}
            <span>
              {currentUser?.name
                ? currentUser.name.split(" ")[0] + ` (${currentRole.toUpperCase()})`
                : "SWITCH ROLE"}
            </span>
            <ChevronDown size={12} />
          </button>

          {roleMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 8,
                background: "#ffffff",
                border: "1px solid var(--line)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                borderRadius: 4,
                padding: "8px 0",
                minWidth: 260,
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: "8px 14px",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                  color: "#83887c",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Switch Marketplace Persona
              </div>

              {allUsers.map((u) => {
                const isSelected = u.id === currentUser?.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUser(u.id);
                      setRoleMenuOpen(false);
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "#f3f5eb" : "transparent",
                      border: 0,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? "#2e3b1c" : "#44463d",
                    }}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div style={{ fontSize: 10, color: "#8a8f82", marginTop: 2 }}>
                        {u.role === "customer"
                          ? "Student / Customer"
                          : u.role === "owner"
                          ? `Host (${u.businessName || "Partner"})`
                          : "Campus Operations Admin"}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: "var(--mono)",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 2,
                        background:
                          u.role === "customer"
                            ? "#e7f0d0"
                            : u.role === "owner"
                            ? "#dbe7f7"
                            : "#fee2e2",
                        color:
                          u.role === "customer"
                            ? "#3f5911"
                            : u.role === "owner"
                            ? "#1e3a8a"
                            : "#991b1b",
                      }}
                    >
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Link
          className="nav-cta"
          href={
            currentRole === "owner"
              ? "/host/dashboard"
              : currentRole === "admin"
              ? "/admin"
              : "/list-your-vehicle"
          }
          onClick={() => setOpen(false)}
        >
          {currentRole === "owner" ? (
            <>
              Host Studio <ArrowUpRight size={15} />
            </>
          ) : currentRole === "admin" ? (
            <>
              Admin Portal <Shield size={15} />
            </>
          ) : (
            <>
              List a Vehicle <ArrowUpRight size={15} />
            </>
          )}
        </Link>
      </nav>

      <button
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

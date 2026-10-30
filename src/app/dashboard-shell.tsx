"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import SignOutButton from "./sign-out-button";

const navigation = [
  { label: "Overview", icon: "◉", href: "/" },
  { label: "Bookings", icon: "▦", href: "/bookings" },
  { label: "Clients", icon: "♡", href: "/clients" },
  { label: "Services", icon: "✳", href: "/services" },
  { label: "Analytics", icon: "⌁", href: "/analytics" },
];

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const showLabels = !collapsed || mobileOpen;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#272321]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#272321]/40 md:hidden"
        />
      )}

      <aside
        id="workspace-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(88vw,18rem)] flex-col overflow-y-auto border-r border-[#eae4df] bg-white p-4 shadow-xl transition-[width,transform] duration-200 sm:p-5 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-0 md:-translate-x-full md:overflow-hidden md:border-0 md:p-0" : "md:w-64 md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            aria-label="AdornedByElla overview"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#a65d69] text-xl font-semibold text-white">
              A
            </span>
            {showLabels && (
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold tracking-tight">
                  AdornedByElla
                </span>
                <span className="block text-xs text-[#827873]">
                  Beauty business manager
                </span>
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-lg text-[#716964] hover:bg-[#faf8f5] md:hidden"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label="Close sidebar"
            aria-expanded={!collapsed}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#eae4df] bg-white text-[#716964] transition hover:bg-[#faf8f5] hover:text-[#914b57] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#914b57] md:inline-flex"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M4 3.5v13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="m12.5 5-5 5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <p
          className={`mb-3 mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a39a94] ${
            showLabels ? "" : "md:sr-only"
          }`}
        >
          Workspace
        </p>

        <nav aria-label="Workspace" className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={item.href === "/" ? "page" : undefined}
              aria-label={!showLabels ? item.label : undefined}
              title={!showLabels ? item.label : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                item.href === "/"
                  ? "bg-[#f5e8e9] font-medium text-[#914b57]"
                  : "text-[#716964] hover:bg-[#faf8f5]"
              } ${!showLabels ? "md:justify-center md:px-2" : ""}`}
            >
              <span aria-hidden="true" className="w-5 shrink-0 text-center text-base">
                {item.icon}
              </span>
              {showLabels && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {showLabels && (
          <div className="mt-8 rounded-2xl bg-[#faf5f1] p-4">
            <p className="text-sm font-medium">Your business, organized.</p>
            <p className="mt-2 text-xs leading-5 text-[#827873]">
              Keep appointments, client details, and services in one place.
            </p>
          </div>
        )}

        <div className="mt-auto border-t border-[#eae4df] pt-4">
          <SignOutButton compact={!showLabels} />
          {showLabels && (
            <p className="mt-4 text-xs text-[#a39a94]">AdornedByElla</p>
          )}
        </div>
      </aside>

      <div
        className={`min-w-0 flex-1 transition-[margin] duration-200 ${
          collapsed ? "md:ml-0" : "md:ml-64"
        }`}
      >
        <div className={`flex items-center gap-3 px-4 pt-4 sm:px-6 md:px-10 ${collapsed ? "" : "md:hidden"}`}>
          <button
            type="button"
            aria-controls="workspace-sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#eae4df] bg-white px-4 py-2.5 text-sm font-medium text-[#514a46] shadow-sm md:hidden"
          >
            <span aria-hidden="true">☰</span>
            Menu
          </button>
          {collapsed && (
            <button
              type="button"
              aria-controls="workspace-sidebar"
              aria-label="Open sidebar"
              onClick={() => setCollapsed(false)}
              className="hidden min-h-11 items-center gap-2 rounded-xl border border-[#eae4df] bg-white px-4 py-2.5 text-sm font-medium text-[#514a46] shadow-sm md:inline-flex"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M4 3.5v13m3.5 1.5 5-5-5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Open sidebar
            </button>
          )}
          <span className="truncate text-sm font-semibold text-[#272321] md:hidden">
            AdornedByElla
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { BarChart2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Calling Report",
    href: "/manager/reports/calling-report",
    icon: BarChart2,
  },
  { label: "Attendance", href: "/manager/reports/attendance", icon: Clock },
];

export default function ManagerReports() {
  const { pathname } = useLocation();
  const isRoot =
    pathname === "/manager/reports" || pathname === "/manager/reports/";

  if (isRoot) return <Navigate to="/manager/reports/calling-report" replace />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f5f5]">
      {/* ── Tab bar ── */}
      <div className="flex-shrink-0 bg-white border-b px-8">
        <div className="flex items-center gap-1 h-12">
          {TABS.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 h-full text-sm font-semibold border-b-2 transition-colors",
                  isActive
                    ? "border-[#b98b08] text-[#b98b08]"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── Routed content fills remaining space ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

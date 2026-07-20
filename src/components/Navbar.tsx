import React, { useState } from "react";
import {
  Bell,
  Search,
  User,
  Shield,
  HelpCircle,
  Menu,
  ChevronDown,
  Info,
  Layers,
} from "lucide-react";
import { SchoolConfig } from "../types";

interface NavbarProps {
  activeRole: "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent";
  setActiveRole: (role: "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent") => void;
  schoolConfig: SchoolConfig;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Navbar({
  activeRole,
  setActiveRole,
  schoolConfig,
  collapsed,
  setCollapsed,
}: NavbarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const rolesList: ("Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent")[] = [
    "Super Admin",
    "Principal",
    "Teacher",
    "Accountant",
    "Student",
    "Parent",
  ];

  const notifications = [
    { id: 1, text: "Aisha Rehman submitted Physics Assignment", time: "10 mins ago" },
    { id: 2, text: "New Admission ADM2025005 registered", time: "1 hour ago" },
    { id: 3, text: "Sarah Jenkins submitted a Casual Leave Request", time: "4 hours ago" },
  ];

  return (
    <header className="bg-brand-card border-b border-brand-accent h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
      {/* Left section: Breadcrumb/Logo */}
      <div className="flex items-center gap-4">
        <button
          id="toggle-sidebar-mobile"
          onClick={() => setCollapsed(!collapsed)}
          className="text-brand-text-light hover:text-brand-sidebar p-1 rounded-md hover:bg-brand-bg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <h2 className="font-serif font-medium text-brand-sidebar text-base md:text-lg leading-tight truncate">
            {schoolConfig.schoolName}
          </h2>
        </div>
      </div>

      {/* Right section: System Utilities */}
      <div className="flex items-center gap-4">
        {/* Role Quick Switcher (In-UI control) */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-bg hover:bg-brand-accent/20 border border-brand-accent rounded-lg text-brand-sidebar text-xs font-semibold transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal:</span> {activeRole}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showRoleMenu && (
            <div
              id="role-switcher-dropdown"
              className="absolute right-0 mt-2 w-48 bg-brand-card border border-brand-accent rounded-xl shadow-lg py-1.5 z-50 text-brand-text-main text-xs"
            >
              <div className="px-3 py-1.5 border-b border-brand-accent/30 font-bold text-brand-text-light text-[10px] uppercase tracking-wider">
                Switch Portal Role
              </div>
              {rolesList.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-brand-bg flex items-center justify-between ${
                    activeRole === role ? "text-brand-sidebar bg-brand-accent/20 font-bold" : ""
                  }`}
                >
                  {role}
                  {activeRole === role && <span className="w-1.5 h-1.5 rounded-full bg-brand-sidebar"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Everywhere (Visual Only) */}
        <div className="hidden lg:flex items-center gap-2 bg-brand-bg border border-brand-accent px-3 py-1.5 rounded-lg w-64 text-brand-text-light focus-within:border-brand-sidebar transition">
          <Search className="w-4 h-4 text-brand-text-light" />
          <input
            id="navbar-search-input"
            type="text"
            placeholder="Search student, invoice, book..."
            className="bg-transparent border-none text-xs text-brand-text-main focus:outline-hidden w-full placeholder-brand-text-light/70"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="navbar-notification-btn"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 text-brand-text-light hover:bg-brand-bg hover:text-brand-sidebar rounded-lg relative transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-warning rounded-full border border-white"></span>
          </button>

          {showNotificationMenu && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-brand-card border border-brand-accent rounded-xl shadow-lg py-2 z-50 text-brand-text-main text-xs"
            >
              <div className="px-4 py-2 border-b border-brand-accent/30 flex items-center justify-between font-bold text-brand-sidebar">
                <span>Recent Alerts</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 transition cursor-pointer">
                    <p className="text-slate-700 leading-normal">{notif.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50 rounded-b-xl">
                <button className="text-[11px] text-blue-600 font-semibold hover:underline">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick User Badge */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase shadow-inner">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-800">Admin Staff</span>
            <span className="block text-[10px] text-slate-400 font-semibold">Active Session</span>
          </div>
        </div>
      </div>
    </header>
  );
}

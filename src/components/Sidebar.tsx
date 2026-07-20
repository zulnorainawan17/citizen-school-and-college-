import React from "react";
import {
  GraduationCap,
  Users,
  UserCheck,
  CreditCard,
  BookOpen,
  Calendar,
  Compass,
  Home,
  FileText,
  MessageSquare,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  ShieldAlert,
  ClipboardList,
  Library,
  MapPin,
  Hotel,
  Package,
  LogOut,
  X,
} from "lucide-react";
import { SchoolConfig } from "../types";

interface SidebarProps {
  activeRole: "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent";
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  handleLogout: () => void;
  schoolConfig?: SchoolConfig;
}

export function Sidebar({
  activeRole,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  handleLogout,
  schoolConfig,
}: SidebarProps) {
  // Define available tabs and modules based on the selected user role
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
    ];

    const adminItems = [
      { id: "students", label: "Students", icon: GraduationCap },
      { id: "teachers", label: "Teachers", icon: Users },
      { id: "attendance", label: "Attendance", icon: UserCheck },
      { id: "fees", label: "Fees & Invoices", icon: CreditCard },
      { id: "exams", label: "Exams & Marks", icon: ClipboardList },
      { id: "homework", label: "Homework", icon: BookOpen },
      { id: "timetable", label: "Timetable", icon: Calendar },
      { id: "generators", label: "ID & Certificates", icon: FileText },
      { id: "library", label: "Library", icon: Library },
      { id: "inventory", label: "Inventory", icon: Package },
      { id: "payroll", label: "Payroll", icon: CreditCard },
      { id: "leaves", label: "Leave Requests", icon: BookMarked },
      { id: "ai-tools", label: "AI Tools", icon: Sparkles },
      { id: "settings", label: "Settings", icon: Settings },
    ];

    const principalItems = [
      { id: "students", label: "Students", icon: GraduationCap },
      { id: "teachers", label: "Teachers", icon: Users },
      { id: "attendance", label: "Attendance Report", icon: UserCheck },
      { id: "fees", label: "Fee Reports", icon: CreditCard },
      { id: "exams", label: "Exams & Results", icon: ClipboardList },
      { id: "ai-tools", label: "AI Assistant", icon: Sparkles },
      { id: "settings", label: "Settings", icon: Settings },
    ];

    const teacherItems = [
      { id: "attendance", label: "Record Attendance", icon: UserCheck },
      { id: "exams", label: "Marks Entry", icon: ClipboardList },
      { id: "homework", label: "Homework", icon: BookOpen },
      { id: "timetable", label: "My Routine", icon: Calendar },
      { id: "leaves", label: "My Leaves", icon: BookMarked },
      { id: "ai-tools", label: "AI Tools", icon: Sparkles },
    ];

    const accountantItems = [
      { id: "fees", label: "Fee Collection", icon: CreditCard },
      { id: "payroll", label: "Payroll Manager", icon: FileText },
      { id: "inventory", label: "Assets & Stocks", icon: Package },
    ];

    const studentItems = [
      { id: "profile", label: "My Profile", icon: Users },
      { id: "attendance", label: "My Attendance", icon: UserCheck },
      { id: "exams", label: "My Results", icon: ClipboardList },
      { id: "homework", label: "My Homework", icon: BookOpen },
      { id: "timetable", label: "My Timetable", icon: Calendar },
      { id: "library", label: "Library Books", icon: Library },
      { id: "ai-tools", label: "AI Tutor Chat", icon: Sparkles },
    ];

    const parentItems = [
      { id: "child-profile", label: "Child Profile", icon: GraduationCap },
      { id: "attendance", label: "Child Attendance", icon: UserCheck },
      { id: "exams", label: "Child Results", icon: ClipboardList },
      { id: "fees", label: "Outstanding Fees", icon: CreditCard },
      { id: "homework", label: "Child Homework", icon: BookOpen },
    ];

    switch (activeRole) {
      case "Super Admin":
        return [...baseItems, ...adminItems];
      case "Principal":
        return [...baseItems, ...principalItems];
      case "Teacher":
        return [...baseItems, ...teacherItems];
      case "Accountant":
        return [...baseItems, ...accountantItems];
      case "Student":
        return [...baseItems, ...studentItems];
      case "Parent":
        return [...baseItems, ...parentItems];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Backdrop for mobile view */}
      {!collapsed && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black/50 z-45 md:hidden transition-opacity duration-300"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        id="sidebar-container"
        className={`bg-brand-sidebar text-white/90 flex flex-col transition-all duration-300 border-r border-brand-accent/20 fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 ${
          collapsed ? "-translate-x-full md:w-20 md:translate-x-0" : "translate-x-0 md:w-64"
        } w-64`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-brand-accent/20 h-16 bg-brand-sidebar/95">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-brand-accent text-brand-sidebar p-1.5 rounded-lg">
                <Compass className="w-5 h-5" id="brand-icon" />
              </div>
              <div>
                <span className="font-serif italic font-medium text-white tracking-wide text-lg block truncate max-w-[150px]" title={schoolConfig?.schoolName || "Citizen School"}>
                  {schoolConfig?.schoolName || "Citizen School"}
                </span>
                <span className="block text-[10px] text-brand-accent font-semibold tracking-wider">
                  ADMIN ERP
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto bg-brand-accent text-brand-sidebar p-1.5 rounded-lg">
              <Compass className="w-5 h-5" id="brand-icon-collapsed" />
            </div>
          )}
          
          {/* Close button for Mobile */}
          {!collapsed && (
            <button
              id="close-sidebar-mobile-btn"
              onClick={() => setCollapsed(true)}
              className="text-brand-accent hover:text-white p-1 rounded hover:bg-white/10 md:hidden"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Toggle button for Desktop */}
          <button
            id="collapse-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="text-brand-accent hover:text-white p-1 rounded hover:bg-white/10 hidden md:block"
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Indicator Card */}
        {!collapsed ? (
          <div className="p-4 mx-3 my-4 bg-white/5 rounded-xl border border-brand-accent/15">
            <span className="text-[10px] text-brand-accent/80 uppercase font-semibold tracking-wider">
              Current Portal
            </span>
            <h4 className="font-medium text-white text-sm mt-0.5">{activeRole}</h4>
            <span className="text-xs text-brand-accent flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3 h-3" /> Standard Access
            </span>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="w-2 h-2 rounded-full bg-brand-accent mx-auto" title={activeRole}></div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  // Auto-close on mobile when a tab is selected
                  if (window.innerWidth < 768) {
                    setCollapsed(true);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? "bg-white/10 text-white border-l-4 border-brand-accent pl-2.5 font-semibold"
                    : "hover:bg-white/5 hover:text-white text-white/70"
                }`}
              >
                <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-accent" : "text-white/70"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-brand-accent/20 bg-brand-sidebar/95">
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-accent/90 hover:bg-white/5 hover:text-white font-medium transition-all text-left`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

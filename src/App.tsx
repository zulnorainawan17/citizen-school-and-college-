import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginView } from "./components/LoginView";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { StudentModule } from "./components/StudentModule";
import { TeacherModule } from "./components/TeacherModule";
import { AttendanceModule } from "./components/AttendanceModule";
import { FeeModule } from "./components/FeeModule";
import { ExamModule } from "./components/ExamModule";
import { LogisticsModule } from "./components/LogisticsModule";
import { HrAndCertificatesModule } from "./components/HrAndCertificatesModule";
import { AiToolsModule } from "./components/AiToolsModule";

import {
  initialSchoolConfig,
  initialStudents,
  initialTeachers,
  initialStaff,
  initialFeeStructures,
  initialFeeInvoices,
  initialAttendance,
  initialExamSchedules,
  initialGrades,
  initialHomeworks,
  initialClassRoutines,
  initialBooks,
  initialTransportRoutes,
  initialHostelRooms,
  initialInventory,
  initialPayroll,
  initialLeaveRequests,
  initialHolidays,
} from "./data/mockData";

import {
  Student,
  Teacher,
  Staff,
  FeeInvoice,
  FeeStructure,
  AttendanceRecord,
  ExamSchedule,
  GradeRecord,
  Homework,
  TimetableItem,
  LibraryBook,
  TransportRoute,
  HostelRoom,
  InventoryItem,
  Payslip,
  LeaveRequest,
  Holiday,
  SchoolConfig,
} from "./types";
import { Palette, Check } from "lucide-react";

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  sidebar: string;
  bg: string;
  accent: string;
  textMain: string;
  textLight: string;
  success: string;
  warning: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "olive",
    name: "Olive Academic (Sage)",
    description: "Sage, Warm Sand, and soft cream tones for a prestigious, organic atmosphere.",
    sidebar: "#5A5A40",
    bg: "#F9F8F3",
    accent: "#D4C9B0",
    textMain: "#2D2D2A",
    textLight: "#6B6B63",
    success: "#7A8450",
    warning: "#C4A46F"
  },
  {
    id: "navy",
    name: "Modern Slate (Navy)",
    description: "Deep Navy, Slate Gray, and sharp cool background for a high-tech corporate appearance.",
    sidebar: "#1E293B",
    bg: "#F4F6F9",
    accent: "#94A3B8",
    textMain: "#0F172A",
    textLight: "#475569",
    success: "#10B981",
    warning: "#F59E0B"
  },
  {
    id: "burgundy",
    name: "Royal Heritage (Wine)",
    description: "Deep Burgundy, Warm Cream, and luxurious bronze details for a majestic look.",
    sidebar: "#581C1C",
    bg: "#FAF6F0",
    accent: "#D9C3B0",
    textMain: "#2D1A1A",
    textLight: "#6E5555",
    success: "#3F6212",
    warning: "#B45309"
  },
  {
    id: "teal",
    name: "Ocean Breeze (Teal)",
    description: "Deep Sea Teal, Fresh Seafoam, and bright aquatic highlights for a modern look.",
    sidebar: "#134E5E",
    bg: "#F0F7F7",
    accent: "#A9D1C8",
    textMain: "#0F2E35",
    textLight: "#4A6D73",
    success: "#0F766E",
    warning: "#D97706"
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("erp_authenticated") === "true";
  });

  const [activeRole, setActiveRole] = useState<
    "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent"
  >(() => {
    return (localStorage.getItem("erp_role") as any) || "Super Admin";
  });

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Core App states
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem("erp_school_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialSchoolConfig;
      }
    }
    return initialSchoolConfig;
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [invoices, setInvoices] = useState<FeeInvoice[]>(initialFeeInvoices);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(initialFeeStructures);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(initialExamSchedules);
  const [grades, setGrades] = useState<GradeRecord[]>(initialGrades);
  const [homework, setHomework] = useState<Homework[]>(initialHomeworks);
  const [timetable, setTimetable] = useState<TimetableItem[]>(initialClassRoutines);
  const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
  const [routes, setRoutes] = useState<TransportRoute[]>(initialTransportRoutes);
  const [rooms, setRooms] = useState<HostelRoom[]>(initialHostelRooms);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [payroll, setPayroll] = useState<Payslip[]>(initialPayroll);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [holidays] = useState<Holiday[]>(initialHolidays);

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem("erp_active_theme") || "olive";
  });

  // Apply active theme CSS custom properties
  useEffect(() => {
    const selectedTheme = THEME_PRESETS.find(t => t.id === activeThemeId) || THEME_PRESETS[0];
    const root = document.documentElement;
    root.style.setProperty('--color-brand-bg', selectedTheme.bg);
    root.style.setProperty('--color-brand-sidebar', selectedTheme.sidebar);
    root.style.setProperty('--color-brand-accent', selectedTheme.accent);
    root.style.setProperty('--color-brand-text-main', selectedTheme.textMain);
    root.style.setProperty('--color-brand-text-light', selectedTheme.textLight);
    root.style.setProperty('--color-brand-success', selectedTheme.success);
    root.style.setProperty('--color-brand-warning', selectedTheme.warning);
    localStorage.setItem("erp_active_theme", selectedTheme.id);
  }, [activeThemeId]);

  // Ensure active tab is allowed for the active role when role changes
  useEffect(() => {
    const allowedTabs = getAllowedTabsForRole(activeRole);
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [activeRole]);

  const handleSaveSettings = () => {
    setSaveStatus("saving");
    localStorage.setItem("erp_school_config", JSON.stringify(schoolConfig));
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }, 800);
  };

  const getAllowedTabsForRole = (role: string): string[] => {
    const base = ["dashboard"];
    switch (role) {
      case "Super Admin":
        return [
          "dashboard",
          "students",
          "teachers",
          "attendance",
          "fees",
          "exams",
          "homework",
          "timetable",
          "generators",
          "library",
          "inventory",
          "payroll",
          "leaves",
          "ai-tools",
          "settings",
        ];
      case "Principal":
        return ["dashboard", "students", "teachers", "attendance", "fees", "exams", "ai-tools", "settings"];
      case "Teacher":
        return ["attendance", "exams", "homework", "timetable", "leaves", "ai-tools"];
      case "Accountant":
        return ["fees", "payroll", "inventory"];
      case "Student":
        return ["profile", "attendance", "exams", "homework", "timetable", "library", "ai-tools"];
      case "Parent":
        return ["child-profile", "attendance", "exams", "fees", "homework"];
      default:
        return base;
    }
  };

  const handleLoginSuccess = (
    role: "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent"
  ) => {
    setIsAuthenticated(true);
    setActiveRole(role);
    localStorage.setItem("erp_authenticated", "true");
    localStorage.setItem("erp_role", role);

    const allowed = getAllowedTabsForRole(role);
    setActiveTab(allowed[0] || "dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("erp_authenticated");
    localStorage.removeItem("erp_role");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            students={students}
            teachers={teachers}
            staff={staff}
            invoices={invoices}
            holidays={holidays}
            activeRole={activeRole}
          />
        );
      case "students":
      case "profile":
      case "child-profile":
        return (
          <StudentModule
            students={students}
            setStudents={setStudents}
            invoices={invoices}
            setInvoices={setInvoices}
            feeStructures={feeStructures}
          />
        );
      case "teachers":
        return <TeacherModule teachers={teachers} setTeachers={setTeachers} />;
      case "attendance":
        return (
          <AttendanceModule
            students={students}
            teachers={teachers}
            staff={staff}
            attendance={attendance}
            setAttendance={setAttendance}
          />
        );
      case "fees":
        return (
          <FeeModule
            students={students}
            invoices={invoices}
            setInvoices={setInvoices}
            feeStructures={feeStructures}
            setFeeStructures={setFeeStructures}
          />
        );
      case "exams":
        return (
          <ExamModule
            students={students}
            examSchedules={examSchedules}
            setExamSchedules={setExamSchedules}
            grades={grades}
            setGrades={setGrades}
          />
        );
      case "homework":
        return (
          <LogisticsModule
            homework={homework}
            setHomework={setHomework}
            timetable={timetable}
            setTimetable={setTimetable}
            books={books}
            setBooks={setBooks}
            routes={routes}
            setRoutes={setRoutes}
            rooms={rooms}
            setRooms={setRooms}
            inventory={inventory}
            setInventory={setInventory}
            initialSubTab="homework"
          />
        );
      case "timetable":
        return (
          <LogisticsModule
            homework={homework}
            setHomework={setHomework}
            timetable={timetable}
            setTimetable={setTimetable}
            books={books}
            setBooks={setBooks}
            routes={routes}
            setRoutes={setRoutes}
            rooms={rooms}
            setRooms={setRooms}
            inventory={inventory}
            setInventory={setInventory}
            initialSubTab="timetable"
          />
        );
      case "library":
        return (
          <LogisticsModule
            homework={homework}
            setHomework={setHomework}
            timetable={timetable}
            setTimetable={setTimetable}
            books={books}
            setBooks={setBooks}
            routes={routes}
            setRoutes={setRoutes}
            rooms={rooms}
            setRooms={setRooms}
            inventory={inventory}
            setInventory={setInventory}
            initialSubTab="library"
          />
        );
      case "inventory":
        return (
          <LogisticsModule
            homework={homework}
            setHomework={setHomework}
            timetable={timetable}
            setTimetable={setTimetable}
            books={books}
            setBooks={setBooks}
            routes={routes}
            setRoutes={setRoutes}
            rooms={rooms}
            setRooms={setRooms}
            inventory={inventory}
            setInventory={setInventory}
            initialSubTab="inventory"
          />
        );
      case "payroll":
        return (
          <HrAndCertificatesModule
            teachers={teachers}
            staff={staff}
            leaveRequests={leaveRequests}
            setLeaveRequests={setLeaveRequests}
            payroll={payroll}
            setPayroll={setPayroll}
            initialSubTab="payroll"
          />
        );
      case "leaves":
        return (
          <HrAndCertificatesModule
            teachers={teachers}
            staff={staff}
            leaveRequests={leaveRequests}
            setLeaveRequests={setLeaveRequests}
            payroll={payroll}
            setPayroll={setPayroll}
            initialSubTab="leaves"
          />
        );
      case "generators":
        return (
          <HrAndCertificatesModule
            teachers={teachers}
            staff={staff}
            leaveRequests={leaveRequests}
            setLeaveRequests={setLeaveRequests}
            payroll={payroll}
            setPayroll={setPayroll}
            initialSubTab="certificates"
          />
        );
      case "ai-tools":
        return <AiToolsModule />;
      case "settings":
        return (
          <div id="settings-panel" className="bg-brand-card rounded-2xl border border-brand-accent p-6 shadow-sm">
            <div className="border-b border-brand-accent pb-4 mb-6">
              <h2 className="font-serif text-2xl text-brand-sidebar font-medium">Institution Configuration</h2>
              <p className="text-sm text-brand-text-light mt-1">Configure global details and identity branding for Academix</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-light mb-2">School Name</label>
                <input
                  type="text"
                  className="w-full bg-brand-bg rounded-xl border border-brand-accent p-3 text-brand-text-main font-medium"
                  value={schoolConfig.schoolName}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, schoolName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-light mb-2">Motto / Tagline</label>
                <input
                  type="text"
                  className="w-full bg-brand-bg rounded-xl border border-brand-accent p-3 text-brand-text-main"
                  value={schoolConfig.tagline}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, tagline: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-light mb-2">Primary Email</label>
                <input
                  type="email"
                  className="w-full bg-brand-bg rounded-xl border border-brand-accent p-3 text-brand-text-main"
                  value={schoolConfig.email}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-light mb-2">Phone Contact</label>
                <input
                  type="text"
                  className="w-full bg-brand-bg rounded-xl border border-brand-accent p-3 text-brand-text-main"
                  value={schoolConfig.phone || ""}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-light mb-2">Physical Address</label>
                <textarea
                  className="w-full bg-brand-bg rounded-xl border border-brand-accent p-3 text-brand-text-main min-h-[80px]"
                  value={schoolConfig.address}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 mt-8 pt-6 border-t border-brand-accent/50">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-brand-sidebar" />
                  <h3 className="font-serif text-lg font-semibold text-brand-sidebar">System Color Palette & Branding</h3>
                </div>
                <p className="text-xs text-brand-text-light mb-6">
                  Select a coordinated brand theme. Clicking any theme will instantly apply the color scheme across the entire administrator interface in real-time so you can preview the appearance immediately.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEME_PRESETS.map((theme) => {
                    const isSelected = activeThemeId === theme.id;
                    return (
                      <motion.button
                        key={theme.id}
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={() => setActiveThemeId(theme.id)}
                        className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full relative group ${
                          isSelected
                            ? "border-brand-sidebar bg-brand-bg/60 shadow-md ring-2 ring-brand-sidebar/20"
                            : "border-brand-accent hover:border-brand-sidebar/50 bg-white hover:shadow-sm"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="absolute top-3 right-3 bg-brand-sidebar text-white p-1 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-sm text-brand-text-main group-hover:text-brand-sidebar transition-colors">
                              {theme.name}
                            </span>
                          </div>
                          <p className="text-xs text-brand-text-light mt-1.5 leading-relaxed pr-6">
                            {theme.description}
                          </p>
                        </div>
                        
                        {/* Palette Previews */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-brand-accent/30 w-full">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-text-light mr-auto">Colors:</span>
                          {/* Sidebar Preview */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-brand-text-light font-medium">Sidebar</span>
                            <span
                              className="w-4 h-4 rounded-full border border-brand-text-main/10 shadow-inner transition-transform duration-300 group-hover:scale-110"
                              style={{ backgroundColor: theme.sidebar }}
                              title={`Sidebar: ${theme.sidebar}`}
                            />
                          </div>
                          {/* Background Preview */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-brand-text-light font-medium">BG</span>
                            <span
                              className="w-4 h-4 rounded-full border border-brand-text-main/10 shadow-inner transition-transform duration-300 group-hover:scale-110"
                              style={{ backgroundColor: theme.bg }}
                              title={`Background: ${theme.bg}`}
                            />
                          </div>
                          {/* Accent Preview */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-brand-text-light font-medium">Accent</span>
                            <span
                              className="w-4 h-4 rounded-full border border-brand-text-main/10 shadow-inner transition-transform duration-300 group-hover:scale-110"
                              style={{ backgroundColor: theme.accent }}
                              title={`Accent: ${theme.accent}`}
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-brand-accent flex justify-end">
              <button
                id="save-settings-btn"
                onClick={handleSaveSettings}
                disabled={saveStatus === "saving"}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  saveStatus === "saving"
                    ? "bg-brand-accent/50 text-brand-text-light cursor-not-allowed"
                    : saveStatus === "saved"
                    ? "bg-brand-success text-white"
                    : "bg-brand-sidebar hover:bg-brand-sidebar/90 text-white active:scale-95"
                }`}
              >
                {saveStatus === "saving" ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : saveStatus === "saved" ? (
                  "Configuration Saved Successfully! ✓"
                ) : (
                  "Save Institution Configuration"
                )}
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-brand-text-light font-medium">
            Select a valid module from the menu.
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg font-sans text-brand-text-main">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeThemeId}
          initial={{ opacity: 0.94, scale: 0.998 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.94, scale: 0.998 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="flex h-full w-full overflow-hidden"
        >
          <Sidebar
            activeRole={activeRole}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            handleLogout={handleLogout}
            schoolConfig={schoolConfig}
          />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navbar
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              schoolConfig={schoolConfig}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-brand-bg relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

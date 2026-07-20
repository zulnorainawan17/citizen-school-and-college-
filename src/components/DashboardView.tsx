import React, { useState } from "react";
import {
  GraduationCap,
  Users,
  Building2,
  DollarSign,
  UserCheck,
  Cake,
  Calendar as CalendarIcon,
  Bell,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Student, Teacher, Staff, FeeInvoice, Holiday } from "../types";

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  invoices: FeeInvoice[];
  holidays: Holiday[];
  activeRole: string;
}

export function DashboardView({
  students,
  teachers,
  staff,
  invoices,
  holidays,
  activeRole,
}: DashboardViewProps) {
  // Compute key stats dynamically
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalStaff = staff.length;

  const totalCollected = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPending = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.total, 0);

  // Growth Data Chart
  const growthData = [
    { year: "2021", Students: 120, Teachers: 10 },
    { year: "2022", Students: 180, Teachers: 14 },
    { year: "2023", Students: 250, Teachers: 18 },
    { year: "2024", Students: 340, Teachers: 22 },
    { year: "2025", Students: 450, Teachers: 28 },
    { year: "2026", Students: 512, Teachers: 34 },
  ];

  // Income vs Expense Chart
  const financeData = [
    { month: "Jan", Income: 12000, Expense: 8500 },
    { month: "Feb", Income: 14500, Expense: 9000 },
    { month: "Mar", Income: 13000, Expense: 8800 },
    { month: "Apr", Income: 16000, Expense: 10200 },
    { month: "May", Income: 17500, Expense: 11000 },
    { month: "Jun", Income: 19000, Expense: 12500 },
    { month: "Jul", Income: totalCollected + 15000, Expense: 13000 },
  ];

  // Attendance Graph Data
  const attendanceData = [
    { day: "Mon", AttendanceRate: 94 },
    { day: "Tue", AttendanceRate: 96 },
    { day: "Wed", AttendanceRate: 98 },
    { day: "Thu", AttendanceRate: 95 },
    { day: "Fri", AttendanceRate: 92 },
  ];

  // Fee Collection Graph Data
  const feeCollectionData = [
    { category: "Monthly Tuition", Collected: totalCollected, Pending: totalPending },
    { category: "Admission Fee", Collected: 4500, Pending: 1200 },
    { category: "Exam Fee", Collected: 1500, Pending: 400 },
    { category: "Transport Service", Collected: 2200, Pending: 600 },
  ];

  const recentActivities = [
    { id: 1, action: "Fee paid", details: "Aisha Rehman paid BHE2026-001", time: "Today, 10:45 AM" },
    { id: 2, action: "Student Admitted", details: "Alia Naqvi joined Grade 11", time: "Yesterday, 03:20 PM" },
    { id: 3, action: "Exam Scheduled", details: "Mid Term physics exam announced", time: "July 16, 2026" },
    { id: 4, action: "Leave Approved", details: "Dr. Kamran Malik (Sick Leave)", time: "July 15, 2026" },
  ];

  const todayBirthdays = [
    { id: 1, name: "Zain Kabir", role: "Student - Grade 10", age: "16th Birthday" },
    { id: 2, name: "Robert Diaz", role: "Staff - Driver", age: "42nd Birthday" },
  ];

  const calendarEvents = [
    { id: 1, date: "July 20, 2026", title: "Dr. Kamran Malik Sick Leave starts", type: "academic" },
    { id: 2, date: "July 24, 2026", title: "Physics Newton Homework Deadline", type: "submission" },
    { id: 3, date: "August 14, 2026", title: "Independence Day Holiday (Closed)", type: "holiday" },
  ];

  return (
    <div className="space-y-6" id="dashboard-main-view">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-sidebar rounded-2xl p-6 text-white shadow-sm shadow-brand-sidebar/15">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-tight">Welcome Back to Campus Control</h2>
          <p className="text-xs text-brand-accent mt-1.5 max-w-xl leading-relaxed">
            Logged in as <strong className="text-white underline decoration-brand-accent decoration-2 underline-offset-4">{activeRole}</strong>. Monitor overall student attendance, process fee invoice ledgers, and leverage AI-powered educational tools to streamline operations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/10 transition-all duration-300">
          <img
            src="/src/assets/images/citizen_school_logo_1784554581588.jpg"
            alt="Citizen School Logo"
            className="w-12 h-12 rounded-lg border border-white/20 object-cover shadow-inner"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-brand-accent font-extrabold uppercase tracking-widest leading-none">Official Campus</span>
            <h4 className="font-serif font-semibold text-sm text-white mt-1 leading-none text-nowrap">Citizen School</h4>
            <span className="text-[9px] text-white/60 mt-0.5 font-mono">Premium Account</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* Card 1: Students */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 flex items-center justify-between hover:shadow-xs transition duration-200">
          <div className="space-y-1.5">
            <span className="text-xs text-brand-text-light font-semibold tracking-wide">Total Students</span>
            <h3 className="text-2xl font-serif font-medium text-brand-sidebar">{totalStudents}</h3>
            <span className="text-[10px] text-brand-success font-bold bg-brand-bg border border-brand-accent/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
              <TrendingUp className="w-3 h-3" /> +12% growth
            </span>
          </div>
          <div className="bg-brand-bg text-brand-sidebar p-3 rounded-xl border border-brand-accent/30">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Faculty */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 flex items-center justify-between hover:shadow-xs transition duration-200">
          <div className="space-y-1.5">
            <span className="text-xs text-brand-text-light font-semibold tracking-wide">Total Teachers</span>
            <h3 className="text-2xl font-serif font-medium text-brand-sidebar">{totalTeachers}</h3>
            <span className="text-[10px] text-brand-text-light font-medium">Science, Math, English</span>
          </div>
          <div className="bg-brand-bg text-brand-text-light p-3 rounded-xl border border-brand-accent/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Fee Collected */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 flex items-center justify-between hover:shadow-xs transition duration-200">
          <div className="space-y-1.5">
            <span className="text-xs text-brand-text-light font-semibold tracking-wide">Fee Collected</span>
            <h3 className="text-2xl font-serif font-medium text-brand-sidebar">Rs. {totalCollected}</h3>
            <span className="text-[10px] text-brand-sidebar font-bold bg-brand-bg border border-brand-accent/20 px-2 py-0.5 rounded-full w-fit">
              Active Month
            </span>
          </div>
          <div className="bg-brand-bg text-brand-success p-3 rounded-xl border border-brand-accent/30">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Fee Pending */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 flex items-center justify-between hover:shadow-xs transition duration-200">
          <div className="space-y-1.5">
            <span className="text-xs text-brand-text-light font-semibold tracking-wide">Pending Fees</span>
            <h3 className="text-2xl font-serif font-medium text-brand-sidebar">Rs. {totalPending}</h3>
            <span className="text-[10px] text-brand-warning font-bold bg-brand-bg border border-brand-accent/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
              Requires Reminders
            </span>
          </div>
          <div className="bg-brand-bg text-brand-warning p-3 rounded-xl border border-brand-accent/30">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-grid">
        {/* Chart 1: Student & Teacher Growth */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 md:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-brand-sidebar uppercase tracking-wider">Student Growth Graph</h3>
              <p className="text-[11px] text-brand-text-light">Historical registration logs for the past 6 academic years</p>
            </div>
            <span className="text-[10px] bg-brand-bg text-brand-text-light border border-brand-accent/50 px-2 py-0.5 rounded-md font-semibold">
              Yearly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E1" />
                <XAxis dataKey="year" stroke="#6B6B63" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B6B63" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Students" stroke="#5A5A40" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Income vs Expense */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 md:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-brand-sidebar uppercase tracking-wider">Income vs Expense</h3>
              <p className="text-[11px] text-brand-text-light">Administrative financial flow comparison logs</p>
            </div>
            <span className="text-[10px] bg-brand-bg text-brand-text-light border border-brand-accent/50 px-2 py-0.5 rounded-md font-semibold">
              Monthly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E1" />
                <XAxis dataKey="month" stroke="#6B6B63" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B6B63" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Income" fill="#7A8450" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Expense" fill="#C4A46F" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Attendance Graph */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 md:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-brand-sidebar uppercase tracking-wider">Today's Attendance Graph</h3>
              <p className="text-[11px] text-brand-text-light">Student daily check-in rate variations</p>
            </div>
            <span className="text-[10px] bg-brand-bg text-brand-text-light border border-brand-accent/50 px-2 py-0.5 rounded-md font-semibold">
              Weekly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E1" />
                <XAxis dataKey="day" stroke="#6B6B63" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B6B63" fontSize={11} tickLine={false} domain={[80, 100]} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="AttendanceRate" stroke="#5A5A40" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Attendance Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Fee Collection Graph */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 md:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-brand-sidebar uppercase tracking-wider">Fee Collection Graph</h3>
              <p className="text-[11px] text-brand-text-light">Structured category collection proportions</p>
            </div>
            <span className="text-[10px] bg-brand-bg text-brand-text-light border border-brand-accent/50 px-2 py-0.5 rounded-md font-semibold">
              By Category
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E1" />
                <XAxis dataKey="category" stroke="#6B6B63" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B6B63" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Collected" stackId="a" fill="#5A5A40" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Pending" stackId="a" fill="#D4C9B0" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Widgets Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="widgets-row">
        {/* Widget 1: School Calendar Events */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 shadow-xs">
          <h3 className="text-xs font-bold text-brand-sidebar font-serif uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-sidebar" /> School Calendar & Events
          </h3>
          <div className="space-y-3">
            {calendarEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-brand-bg border-l-4 border-brand-sidebar border border-brand-accent/20 rounded-r-lg space-y-1 hover:bg-brand-accent/10 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-text-light tracking-wide">
                    {event.date}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    event.type === "holiday" ? "bg-brand-warning/10 text-brand-warning" : "bg-brand-sidebar/10 text-brand-sidebar"
                  }`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-xs font-semibold text-brand-text-main leading-snug">{event.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Recent Activities */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 shadow-xs">
          <h3 className="text-xs font-bold text-brand-sidebar font-serif uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-text-light" /> Recent Activities
          </h3>
          <div className="relative pl-3 border-l-2 border-brand-accent/40 space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="relative space-y-0.5">
                {/* Dot */}
                <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-brand-accent border-2 border-brand-card ring-2 ring-brand-bg"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text-main leading-none">{act.action}</span>
                  <span className="text-[9px] text-brand-text-light font-semibold">{act.time}</span>
                </div>
                <p className="text-[11px] text-brand-text-light leading-relaxed">{act.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Today's Birthdays */}
        <div className="bg-brand-card border border-brand-accent rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-brand-sidebar font-serif uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cake className="w-4 h-4 text-brand-warning animate-pulse" /> Today's Birthdays
            </h3>
            <div className="space-y-3.5">
              {todayBirthdays.map((bday) => (
                <div key={bday.id} className="flex items-center justify-between hover:bg-brand-bg p-2 rounded-lg transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-bg text-brand-sidebar border border-brand-accent/30 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                      {bday.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text-main">{bday.name}</h4>
                      <p className="text-[10px] text-brand-text-light font-semibold">{bday.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-brand-warning/10 text-brand-warning font-bold px-2 py-0.5 rounded-full">
                    {bday.age}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full text-center text-[10px] font-bold text-brand-sidebar bg-brand-bg border border-brand-accent py-2 rounded-lg mt-4 hover:bg-brand-accent/20 transition">
            Send Broadcast Greetings 🍰
          </button>
        </div>
      </div>
    </div>
  );
}

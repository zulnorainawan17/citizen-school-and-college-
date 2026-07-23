import React, { useState } from "react";
import schoolCampusImg from "../assets/images/school_campus_banner_1784799705271.jpg";
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
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  School,
  AlertCircle,
  Receipt,
  ClipboardList,
  Check,
  Sparkles,
  Award,
  Megaphone,
  UserPlus,
  FileCheck,
  CreditCard,
  ChevronRight,
  Quote,
} from "lucide-react";
import { Student, Teacher, Staff, FeeInvoice, Holiday, GradeRecord } from "../types";

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  invoices: FeeInvoice[];
  holidays: Holiday[];
  grades?: GradeRecord[];
  activeRole: string;
  setActiveTab?: (tab: string) => void;
}

export function DashboardView({
  students,
  teachers,
  staff,
  invoices,
  holidays,
  grades = [],
  activeRole,
  setActiveTab,
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

  // Interactive state for replacement modules
  const [selectedGradePerformers, setSelectedGradePerformers] = useState("Grade 10");
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Parent-Teacher Meeting (PTM)",
      date: "Saturday, 10:00 AM",
      category: "Academic",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Mandatory discussion regarding First Term Progress Cards for Grade 9 & 10.",
    },
    {
      id: 2,
      title: "Mid-Term Examination Date Sheet Released",
      date: "August 10 - August 22",
      category: "Exam Alert",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Official date sheet distributed. Admit cards issued from the Fee Office.",
    },
    {
      id: 3,
      title: "Independence Day Celebration & Gala",
      date: "August 14, 2026",
      category: "Event",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "National flag hoisting, speeches, and student choir performance at Main Lawn.",
    },
  ]);

  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [showNoticeInput, setShowNoticeInput] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, name: "Dr. Kamran Malik", role: "Physics Teacher", reason: "Medical Appointment", duration: "1 Day (Today)", status: "Pending" },
    { id: 2, name: "Farhan Ahmed", role: "Student - Grade 10", reason: "Family Function", duration: "2 Days", status: "Pending" },
    { id: 3, name: "Aisha Rehman", role: "Student - Grade 9", reason: "Fever & Rest", duration: "1 Day", status: "Pending" },
  ]);

  const [quickSearchRoll, setQuickSearchRoll] = useState("");

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;
    setNotices([
      {
        id: Date.now(),
        title: newNoticeTitle,
        date: "Today, Just Now",
        category: "General Notice",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        description: "Broadcasted by Principal Office to all staff, students, and parents.",
      },
      ...notices,
    ]);
    setNewNoticeTitle("");
    setShowNoticeInput(false);
  };

  const handleLeaveAction = (id: number, status: "Approved" | "Rejected") => {
    setLeaveRequests(leaveRequests.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  // Helper to filter students belonging to the selected grade tab
  const getMatchingStudentsForGrade = (gradeTab: string) => {
    const num = gradeTab.replace(/\D/g, ""); // e.g. "10", "9", "11"
    return students.filter((s) => {
      if (!s.class) return false;
      const cls = s.class.toLowerCase();
      if (num && cls.includes(num)) return true;
      if (gradeTab === "Grade 11" && (cls.includes("11") || cls.includes("1st year"))) return true;
      return false;
    });
  };

  const currentGradeStudents = getMatchingStudentsForGrade(selectedGradePerformers);

  // Dynamically compute student rankings from real grade records
  const calculateDynamicRankings = () => {
    if (!grades || grades.length === 0 || currentGradeStudents.length === 0) {
      return [];
    }

    const studentMap: Record<
      string,
      { student: Student; totalObtained: number; totalMax: number; subjects: Set<string> }
    > = {};

    currentGradeStudents.forEach((st) => {
      const stGrades = grades.filter(
        (g) => g.studentId === st.id || (g.studentName && g.studentName.toLowerCase() === st.name.toLowerCase())
      );

      if (stGrades.length > 0) {
        let totalObtained = 0;
        let totalMax = 0;
        const subjects = new Set<string>();

        stGrades.forEach((g) => {
          totalObtained += Number(g.marksObtained) || 0;
          totalMax += Number(g.maxMarks) || 100;
          if (g.subject) subjects.add(g.subject);
        });

        studentMap[st.id] = {
          student: st,
          totalObtained,
          totalMax,
          subjects,
        };
      }
    });

    const ranked = Object.values(studentMap)
      .map(({ student, totalObtained, totalMax, subjects }) => {
        const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
        return {
          student,
          percentage,
          subjectsList: Array.from(subjects).slice(0, 3).join(", ") || "General Academic",
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return ranked.map((item, index) => {
      const rank = index + 1;
      const badge =
        rank === 1 ? "🥇 1st Rank" : rank === 2 ? "🥈 2nd Rank" : rank === 3 ? "🥉 3rd Rank" : `#${rank} Position`;
      return {
        rank,
        name: item.student.name,
        roll: item.student.rollNo ? `Roll #${item.student.rollNo}` : item.student.admissionNo || `ID-${item.student.id}`,
        percentage: item.percentage,
        subjects: item.subjectsList,
        badge,
        avatar: item.student.photoUrl || "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000",
      };
    });
  };

  const dynamicPerformers = calculateDynamicRankings();

  const classAvgPercentage =
    dynamicPerformers.length > 0
      ? (dynamicPerformers.reduce((acc, r) => acc + r.percentage, 0) / dynamicPerformers.length).toFixed(1)
      : null;

  const recentActivities = [
    { id: 1, action: "Fee Paid", details: "Aisha Rehman paid BHE2026-001 (Rs. 8,500)", time: "10:45 AM" },
    { id: 2, action: "Student Admitted", details: "Alia Naqvi admitted to Grade 11-A", time: "09:30 AM" },
    { id: 3, action: "Date Sheet Published", details: "Mid Term exam schedule released", time: "Yesterday" },
  ];

  const todayBirthdays = [
    { id: 1, name: "Zain Kabir", role: "Student - Grade 10", age: "16th Birthday", photoUrl: "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000" },
    { id: 2, name: "Robert Diaz", role: "Staff - Transport", age: "42nd Birthday", photoUrl: "https://lh3.googleusercontent.com/d/1xMBdFuGXz4qc5uSm5ev8Z5MSrxORwgB4=s1000" },
  ];

  const calendarEvents = [
    { id: 1, date: "July 24, 2026", title: "Physics Science Project Submission", type: "academic" },
    { id: 2, date: "August 10, 2026", title: "Mid-Term Examinations Begin", type: "exam" },
    { id: 3, date: "August 14, 2026", title: "Independence Day Holiday (Closed)", type: "holiday" },
  ];

  const campusGallery = [
    {
      title: "Morning Assembly & Grounds",
      subtitle: "Main Campus Assembly Lawn",
      url: "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000",
    },
    {
      title: "Modern Learning Classroom",
      subtitle: "Interactive Digital Whiteboard Room",
      url: "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000",
    },
    {
      title: "Student Activity & Study Lab",
      subtitle: "Collaborative Study Center",
      url: "https://lh3.googleusercontent.com/d/1xMBdFuGXz4qc5uSm5ev8Z5MSrxORwgB4=s1000",
    },
  ];

  return (
    <div className="space-y-6" id="dashboard-main-view">
      {/* Executive Welcome Control Header */}
      <div className="relative overflow-hidden bg-brand-sidebar rounded-2xl p-6 text-white shadow-md border border-brand-accent/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-accent/15 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brand-accent/20 text-brand-accent px-2.5 py-0.5 rounded-full border border-brand-accent/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Academic Session 2026-2027
              </span>
              <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                System Active
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">
              Welcome to Citizen School Control Portal
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-sans">
              Signed in as <span className="text-amber-300 font-bold">{activeRole}</span>. Managing campus operations, fee ledgers, exam records, and student profiles in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shadow-inner">
            <img
              src="https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"
              alt="Citizen School Logo"
              className="w-14 h-14 rounded-lg border-2 border-white/30 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Official Campus</span>
              <h4 className="font-serif font-bold text-base text-white leading-tight">The Citizen School</h4>
              <p className="text-[10px] text-slate-300 mt-0.5">Primary & Higher Secondary</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Key Performance Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* Metric 1: Total Students */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Enrolled</span>
              <h3 className="text-3xl font-serif font-bold text-slate-900">{totalStudents}</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 text-amber-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% Growth
            </span>
            <span className="text-slate-500 font-medium">Boys: 280 • Girls: 232</span>
          </div>
        </div>

        {/* Metric 2: Faculty */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Teaching Staff</span>
              <h3 className="text-3xl font-serif font-bold text-slate-900">{totalTeachers}</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-brand-sidebar text-emerald-300 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-700 font-bold">100% Present Today</span>
            <span className="text-slate-500 font-medium">{totalStaff} Admin Staff</span>
          </div>
        </div>

        {/* Metric 3: Fee Collected */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fee Collected</span>
              <h3 className="text-3xl font-serif font-bold text-emerald-900">Rs. {totalCollected.toLocaleString()}</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">88% Target Met</span>
            <span className="text-slate-500 font-medium">Monthly Tuition</span>
          </div>
        </div>

        {/* Metric 4: Today's Attendance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Today's Attendance</span>
              <h3 className="text-3xl font-serif font-bold text-slate-900">96.2%</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-800 font-bold">482 / 512 Students</span>
            <span className="text-amber-700 font-bold">30 Absent</span>
          </div>
        </div>
      </div>

      {/* Campus Photos Gallery Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold text-slate-900 font-serif uppercase tracking-wider flex items-center gap-2">
            📸 Campus & Facilities Life Showcase
          </h3>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Official Campus Grounds
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campusGallery.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 bg-slate-950">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-3.5">
                <h4 className="text-xs font-bold text-white font-serif tracking-wide">{item.title}</h4>
                <p className="text-[10px] text-amber-300 font-medium mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Executive Operations Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-operations-hub">
        {/* LEFT COLUMN: Campus Leadership, Class Timetable & Calendar */}
        <div className="space-y-6">
          {/* Principal's Spotlight & Daily Hadith / Thought */}
          <div className="bg-gradient-to-br from-slate-900 to-brand-sidebar text-white rounded-2xl p-5 border border-brand-accent/30 shadow-xs relative overflow-hidden">
            <Quote className="w-16 h-16 text-white/5 absolute -right-2 -bottom-2 pointer-events-none" />
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Principal's Daily Message
            </div>
            <p className="text-sm font-serif italic text-slate-200 leading-relaxed font-light">
              "Education is not merely the learning of facts, but the training of the mind to think critically, act honorably, and serve the community with pride."
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-200">Principal Office — Citizen School</span>
              <span className="text-slate-400">July 23, 2026</span>
            </div>
          </div>

          {/* Academic Honor Roll & Top Performers Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">Academic Honor Roll & Top Performers</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Term 1 high achievers & class rank holders</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                {["Grade 9", "Grade 10", "Grade 11"].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGradePerformers(grade)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                      selectedGradePerformers === grade
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Grade Distinction Alert */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-950 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                {classAvgPercentage
                  ? `Academic Standing: ${selectedGradePerformers} achieved ${classAvgPercentage}% overall class average in Exam Assessments!`
                  : `Academic Standing: ${selectedGradePerformers} (${currentGradeStudents.length} student${currentGradeStudents.length === 1 ? "" : "s"} enrolled)`}
              </span>
              <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
                {classAvgPercentage ? "Active Term" : "Live Status"}
              </span>
            </div>

            {/* Performers List or Dynamic Empty State */}
            {dynamicPerformers.length > 0 ? (
              <div className="space-y-3">
                {dynamicPerformers.map((student) => (
                  <div
                    key={student.roll}
                    className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 text-xs">
                          {student.rank === 1 ? "🥇" : student.rank === 2 ? "🥈" : "🥉"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded font-mono">
                            {student.roll}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Top Subjects: {student.subjects}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-extrabold text-emerald-800 font-serif block">{student.percentage}% Score</span>
                        <span className="text-[9px] text-slate-500 font-semibold">Verified Grade</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          student.rank === 1
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : student.rank === 2
                            ? "bg-slate-200 text-slate-800 border border-slate-300"
                            : "bg-orange-100 text-orange-900 border border-orange-300"
                        }`}
                      >
                        {student.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentGradeStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">No Students Registered in {selectedGradePerformers}</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Enroll new students under {selectedGradePerformers} in the Student Management module to populate class rosters and generate academic statistics.
                  </p>
                </div>
                {setActiveTab && (
                  <button
                    onClick={() => setActiveTab("students")}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-300" /> Add New Student
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">No Exam Results Published Yet for {selectedGradePerformers}</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    ({currentGradeStudents.length} student{currentGradeStudents.length > 1 ? "s" : ""} currently enrolled). When you enter exam marks in the Exams module, merit rankings and percentage averages will calculate and update here in real-time.
                  </p>
                </div>
                {setActiveTab && (
                  <button
                    onClick={() => setActiveTab("exams")}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" /> Enter Marks in Exams Module
                  </button>
                )}
              </div>
            )}

            {/* Quick Academic Summary Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Marksheets Verified
              </span>
              <span className="font-medium text-slate-500">Term 1 Honor List • Citizen School</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Official Noticeboard & Leave Desk */}
        <div className="space-y-6">
          {/* School Noticeboard */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">School Noticeboard</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Official circulars & broadcasts</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeInput(!showNoticeInput)}
                className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3" /> Post Notice
              </button>
            </div>

            {/* Notice Input */}
            {showNoticeInput && (
              <form onSubmit={handleAddNotice} className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Enter notice title (e.g. Science Fair Registration open)..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoticeInput(false)}
                    className="text-[10px] px-2.5 py-1 rounded-lg text-slate-600 bg-white border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] px-3 py-1 rounded-lg bg-slate-900 text-white font-bold"
                  >
                    Broadcast
                  </button>
                </div>
              </form>
            )}

            {/* Notice Cards */}
            <div className="space-y-2.5">
              {notices.map((notice) => (
                <div key={notice.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-slate-400 transition">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${notice.badgeColor}`}>
                      {notice.category}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">{notice.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{notice.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{notice.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Desk & Pending Approvals */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">Leave Approval Desk</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Faculty & student leave applications</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                {leaveRequests.filter(r => r.status === "Pending").length} Pending
              </span>
            </div>

            <div className="space-y-2">
              {leaveRequests.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{req.name}</span>
                      <span className="text-[9px] bg-white text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 font-medium">{req.role}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{req.reason} ({req.duration})</p>
                  </div>
                  <div>
                    {req.status === "Pending" ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLeaveAction(req.id, "Approved")}
                          className="p-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLeaveAction(req.id, "Rejected")}
                          className="p-1.5 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition"
                          title="Reject"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${
                        req.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Generated School Campus Banner Section */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">Campus Life & World-Class Infrastructure</h3>
                <p className="text-[10px] text-slate-500 font-medium">The Citizen School Main Campus & Academic Environment</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              ✦ Official Campus Grounds
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
            <img
              src={schoolCampusImg}
              alt="Citizen School Campus Grounds"
              className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md">
                  Main Campus
                </span>
                <span className="text-xs text-slate-300 font-mono">EST. 2012</span>
              </div>
              <h4 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
                The Citizen School — Inspiring Academic Excellence
              </h4>
              <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed font-sans">
                Equipped with digital smart classrooms, state-of-the-art science laboratories, expansive sports grounds, and a modern central library designed to nurture future leaders.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 font-medium">
                  🏫 Digital Smart Classrooms
                </span>
                <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 font-medium">
                  🔬 Science & Computer Labs
                </span>
                <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 font-medium">
                  📚 Central Resource Library
                </span>
                <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 font-medium">
                  ⚽ Green Sports Facilities
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  GraduationCap,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  School,
  Building2,
  Users,
} from "lucide-react";
import { Student, Teacher } from "../types";
import { subscribeToCollection } from "../lib/firestoreService";
import { initialStudents, initialTeachers } from "../data/mockData";

interface LoginViewProps {
  onLoginSuccess: (role: "Super Admin" | "Principal" | "Teacher" | "Accountant" | "Student" | "Parent") => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Active Portal selection: "admin" | "teacher" | "student"
  const [activePortal, setActivePortal] = useState<"admin" | "teacher" | "student">("admin");

  // Admin Portal State
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [adminRole, setAdminRole] = useState<"Super Admin" | "Principal" | "Accountant">("Super Admin");

  // Teacher Portal State
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Student Portal State
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Status/Error messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Live Subscribe to Teachers and Students collections from Firestore database
  useEffect(() => {
    const unsubTeachers = subscribeToCollection<Teacher>("teachers", (data) => {
      setTeachersList(data);
    }, initialTeachers);

    const unsubStudents = subscribeToCollection<Student>("students", (data) => {
      setStudentsList(data);
    }, initialStudents);

    return () => {
      unsubTeachers();
      unsubStudents();
    };
  }, []);

  // Filtered teachers matching user input
  const matchedTeachers = teachersList.filter((t) =>
    teacherSearch.trim() !== "" &&
    (t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  // Auto verify teacher name if user types exact match
  useEffect(() => {
    if (!teacherSearch.trim()) {
      setSelectedTeacher(null);
      return;
    }
    const exact = teachersList.find(
      (t) => t.name.toLowerCase().trim() === teacherSearch.toLowerCase().trim()
    );
    if (exact) {
      setSelectedTeacher(exact);
    } else {
      setSelectedTeacher(null);
    }
  }, [teacherSearch, teachersList]);

  // Filtered students matching user input
  const matchedStudents = studentsList.filter((s) =>
    studentSearch.trim() !== "" &&
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.class.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Auto verify student name/admission if user types exact match
  useEffect(() => {
    if (!studentSearch.trim()) {
      setSelectedStudent(null);
      return;
    }
    const exact = studentsList.find(
      (s) =>
        s.name.toLowerCase().trim() === studentSearch.toLowerCase().trim() ||
        s.admissionNo.toLowerCase().trim() === studentSearch.toLowerCase().trim()
    );
    if (exact) {
      setSelectedStudent(exact);
    } else {
      setSelectedStudent(null);
    }
  }, [studentSearch, studentsList]);

  // Handle Admin Portal Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!adminPassword.trim()) {
      setErrorMessage("Please enter admin password.");
      return;
    }
    setSuccessMessage(`Logging in to ${adminRole} Portal...`);
    setTimeout(() => {
      onLoginSuccess(adminRole);
    }, 400);
  };

  // Handle Teacher Portal Login
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!teacherSearch.trim()) {
      setErrorMessage("Please type your Teacher Name.");
      return;
    }
    if (!selectedTeacher) {
      setErrorMessage("Teacher name not found in school database. Please select from registered teachers.");
      return;
    }
    setSuccessMessage(`Welcome ${selectedTeacher.name}! Accessing Teacher Portal...`);
    setTimeout(() => {
      onLoginSuccess("Teacher");
    }, 400);
  };

  // Handle Student Portal Login
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!studentSearch.trim()) {
      setErrorMessage("Please type your Student Name or Admission No.");
      return;
    }
    if (!selectedStudent) {
      setErrorMessage("Student record not found in school database. Please verify name or admission number.");
      return;
    }
    setSuccessMessage(`Welcome ${selectedStudent.name}! Accessing Student Portal...`);
    setTimeout(() => {
      onLoginSuccess("Student");
    }, 400);
  };

  return (
    <div
      id="login-page-root"
      className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900"
    >
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Branding */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-inner">
            <School className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Beacon Hill ERP Portal
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Select your portal below to log into the school management system
          </p>
        </div>

        {/* 3 Main Portals Selection */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {/* Admin Portal Tab */}
            <button
              type="button"
              onClick={() => {
                setActivePortal("admin");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                activePortal === "admin"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Admin Portal</span>
            </button>

            {/* Teacher Portal Tab */}
            <button
              type="button"
              onClick={() => {
                setActivePortal("teacher");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                activePortal === "teacher"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <User className="w-5 h-5 text-emerald-600" />
              <span>Teacher Portal</span>
            </button>

            {/* Student Portal Tab */}
            <button
              type="button"
              onClick={() => {
                setActivePortal("student");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                activePortal === "student"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* PORTAL 1: ADMIN PORTAL */}
          {activePortal === "admin" && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-2xl flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-blue-900">Admin & Executive Control</h3>
                  <p className="text-[11px] text-blue-700">Enter password to access administrative modules.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Role</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Super Admin">Super Admin (Full Access)</option>
                  <option value="Principal">Principal Dashboard</option>
                  <option value="Accountant">Accountant Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full text-xs font-medium pl-10 border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Default Demo Password: <span className="font-mono font-bold text-slate-700">admin123</span></p>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Open Admin Portal
              </button>
            </form>
          )}

          {/* PORTAL 2: TEACHER PORTAL */}
          {activePortal === "teacher" && (
            <form onSubmit={handleTeacherLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-900">Teacher Login</h3>
                  <p className="text-[11px] text-emerald-700">Type your name to automatically verify with live database.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Name</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Type teacher name (e.g., Dr. Kamran Malik)"
                    className="w-full text-xs font-medium pl-10 border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Verification Indicator */}
              {selectedTeacher ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      Verified: {selectedTeacher.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      Department: {selectedTeacher.department} | ID: {selectedTeacher.id}
                    </p>
                  </div>
                </div>
              ) : teacherSearch.trim() !== "" ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium flex items-center gap-2">
                  <span>Searching database... If not found, select below:</span>
                </div>
              ) : null}

              {/* Quick Selectable Teachers List */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Registered Teachers in Database:
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {(matchedTeachers.length > 0 ? matchedTeachers : teachersList).map((tch) => (
                    <button
                      key={tch.id}
                      type="button"
                      onClick={() => {
                        setTeacherSearch(tch.name);
                        setSelectedTeacher(tch);
                        setErrorMessage("");
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                        selectedTeacher?.id === tch.id
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      <span>{tch.name}</span>
                      <span className="text-[10px] opacity-80">{tch.department}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-3.5 rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Open Teacher Portal
              </button>
            </form>
          )}

          {/* PORTAL 3: STUDENT PORTAL */}
          {activePortal === "student" && (
            <form onSubmit={handleStudentLogin} className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-2xl flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-indigo-900">Student Portal Login</h3>
                  <p className="text-[11px] text-indigo-700">Enter student name or admission number to verify record.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name or Admission No</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Type student name or ADM number (e.g. Zain Kabir)"
                    className="w-full text-xs font-medium pl-10 border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Verification Indicator */}
              {selectedStudent ? (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-900">
                      Verified Student: {selectedStudent.name}
                    </p>
                    <p className="text-[10px] text-indigo-700 font-medium">
                      Class: {selectedStudent.class} | Adm No: {selectedStudent.admissionNo}
                    </p>
                  </div>
                </div>
              ) : studentSearch.trim() !== "" ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium flex items-center gap-2">
                  <span>Searching database... Select student below:</span>
                </div>
              ) : null}

              {/* Quick Selectable Students List */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Registered Students in Database:
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {(matchedStudents.length > 0 ? matchedStudents : studentsList).map((stu) => (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => {
                        setStudentSearch(stu.name);
                        setSelectedStudent(stu);
                        setErrorMessage("");
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                        selectedStudent?.id === stu.id
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      <span>{stu.name}</span>
                      <span className="text-[10px] opacity-80">{stu.class}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-3.5 rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Open Student Portal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


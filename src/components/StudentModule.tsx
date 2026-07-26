import React, { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CreditCard,
  QrCode,
  ShieldAlert,
  ArrowRightLeft,
  ChevronsUp,
  UserX,
  FileCheck,
  Phone,
  MapPin,
  RotateCw,
  Printer,
} from "lucide-react";
import { Student, Teacher, GRADE_LEVELS, FeeInvoice, FeeStructure } from "../types";
import { saveStudent, deleteStudent, saveFeeInvoice } from "../lib/firestoreService";

interface StudentModuleProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  invoices?: FeeInvoice[];
  setInvoices?: React.Dispatch<React.SetStateAction<FeeInvoice[]>>;
  feeStructures?: FeeStructure[];
  activeRole?: string;
  loggedInUser?: Student | Teacher | null;
}

export function StudentModule({
  students,
  setStudents,
  invoices = [],
  setInvoices,
  feeStructures = [],
  activeRole,
  loggedInUser,
}: StudentModuleProps) {
  const isReadOnly = activeRole === "Student" || activeRole === "Parent";
  // Navigation states: 'list', 'create', 'edit', 'profile', 'id-card'
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "profile" | "id-card">("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [idCardLayout, setIdCardLayout] = useState<"interactive" | "side-by-side">("interactive");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states for Create/Edit
  const [formData, setFormData] = useState<Partial<Student>>({
    name: "",
    class: "Class 10",
    section: "A",
    dob: "",
    gender: "Male",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    emergencyContact: "",
    address: "",
    medicalRecord: "",
    photoUrl: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = useState<string>("");

  const getClassDefaultFees = (className: string) => {
    const structure = feeStructures.find((f) => f.className === className);
    return {
      monthlyFee: structure ? structure.monthlyFee : 0,
      admissionFee: structure ? structure.admissionFee : 0,
      examFee: structure ? structure.examFee : 0,
    };
  };

  const handleCreateNewClick = () => {
    const defaultAdmissionNo = `ADM2026${String(students.length + 1).padStart(3, "0")}`;
    const defaultRollNo = String(students.filter((s) => s.class === "Class 10").length + 1).padStart(2, "0");
    const defaultFees = getClassDefaultFees("Class 10");

    setFormData({
      name: "",
      class: "Class 10",
      section: "A",
      dob: "2010-01-01",
      gender: "Male",
      admissionNo: defaultAdmissionNo,
      rollNo: defaultRollNo,
      guardianName: "",
      guardianPhone: "",
      guardianEmail: "",
      emergencyContact: "",
      address: "",
      medicalRecord: "None",
      photoUrl: "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000",
      status: "Active",
      monthlyFee: defaultFees.monthlyFee,
      admissionFee: defaultFees.admissionFee,
      examFee: defaultFees.examFee,
    });
    setFormErrors("");
    setViewMode("create");
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    const defaultFees = getClassDefaultFees(student.class);
    setFormData({
      ...student,
      monthlyFee: student.monthlyFee !== undefined ? student.monthlyFee : defaultFees.monthlyFee,
      admissionFee: student.admissionFee !== undefined ? student.admissionFee : defaultFees.admissionFee,
      examFee: student.examFee !== undefined ? student.examFee : defaultFees.examFee,
    });
    setFormErrors("");
    setViewMode("edit");
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setViewMode("profile");
  };

  const handleViewIdCard = (student: Student) => {
    setSelectedStudent(student);
    setViewMode("id-card");
  };

  const handlePrintStudentIdCard = () => {
    if (idCardLayout !== "side-by-side") {
      setIdCardLayout("side-by-side");
    }
    setTimeout(() => {
      const cardArea = document.getElementById("student-id-card-print-area");
      const schoolName = "CITIZEN SCHOOL & COLLEGE";
      const studentName = selectedStudent?.name || "Student";

      const printWin = window.open("", "_blank", "width=920,height=850");
      if (printWin && cardArea) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${schoolName} - Student ID Card - ${studentName}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @page { size: A4 portrait; margin: 10mm; }
                body {
                  font-family: 'Plus Jakarta Sans', sans-serif;
                  background-color: #ffffff;
                  color: #000000;
                  padding: 20px;
                  margin: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #student-id-card-print-area {
                  display: flex !important;
                  flex-wrap: wrap !important;
                  gap: 2rem !important;
                  justify-content: center !important;
                  align-items: center !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  padding: 10px !important;
                }
                @media print {
                  body { padding: 0 !important; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div style="text-align: center; margin-bottom: 20px;" class="no-print">
                <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${schoolName}</h2>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Official Student Identity Card (Front & Back Layout)</p>
              </div>
              ${cardArea.outerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 400);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      } else {
        window.print();
      }
    }, idCardLayout !== "side-by-side" ? 250 : 50);
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
  };

  const handleConfirmDeleteStudent = () => {
    if (deletingStudent) {
      deleteStudent(deletingStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
      if (selectedStudent?.id === deletingStudent.id) {
        setSelectedStudent(null);
        setViewMode("list");
      }
      setDeletingStudent(null);
    }
  };

  // Student Actions
  const handlePromoteStudent = (student: Student) => {
    const currentIndex = GRADE_LEVELS.indexOf(student.class);
    let nextGrade = "Alumni";
    if (currentIndex !== -1 && currentIndex < GRADE_LEVELS.length - 1) {
      nextGrade = GRADE_LEVELS[currentIndex + 1];
    }

    const updatedStudent = { ...student, class: nextGrade };
    saveStudent(updatedStudent);
    const updated = students.map((s) => (s.id === student.id ? updatedStudent : s));
    setStudents(updated);
    alert(`Student ${student.name} was successfully promoted to ${nextGrade}!`);
  };

  const handleWithdrawStudent = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (st) {
      saveStudent({ ...st, status: "Withdrawn" as const });
    }
    const updated = students.map((s) => (s.id === studentId ? { ...s, status: "Withdrawn" as const } : s));
    setStudents(updated);
    alert("Student status marked as Withdrawn.");
    setViewMode("list");
  };

  const handleTransferStudent = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (st) {
      saveStudent({ ...st, status: "Transferred" as const });
    }
    const updated = students.map((s) => (s.id === studentId ? { ...s, status: "Transferred" as const } : s));
    setStudents(updated);
    alert("Student status marked as Transferred.");
    setViewMode("list");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.guardianName || !formData.guardianPhone) {
      setFormErrors("Please fulfill all essential fields.");
      return;
    }

    const mFee = formData.monthlyFee !== undefined ? Number(formData.monthlyFee) : 250;
    const aFee = formData.admissionFee !== undefined ? Number(formData.admissionFee) : 500;
    const eFee = formData.examFee !== undefined ? Number(formData.examFee) : 50;

    if (viewMode === "create") {
      const newId = `STU${String(Date.now()).slice(-4)}`;
      const admissionNo = formData.admissionNo || `ADM2026${String(students.length + 1).padStart(3, "0")}`;
      const rollNo = formData.rollNo || String(students.filter((s) => s.class === formData.class).length + 1).padStart(2, "0");

      const newStudent: Student = {
        id: newId,
        admissionNo,
        rollNo,
        name: formData.name || "",
        class: formData.class || "Class 10",
        section: formData.section || "A",
        dob: formData.dob || "2010-01-01",
        gender: formData.gender || "Male",
        guardianName: formData.guardianName || "",
        guardianPhone: formData.guardianPhone || "",
        guardianEmail: formData.guardianEmail || "",
        emergencyContact: formData.emergencyContact || `${formData.guardianPhone} (Father)`,
        address: formData.address || "",
        admissionDate: new Date().toISOString().split("T")[0],
        medicalRecord: formData.medicalRecord || "None",
        photoUrl: formData.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000",
        status: "Active",
        monthlyFee: mFee,
        admissionFee: aFee,
        examFee: eFee,
      };

      saveStudent(newStudent);
      setStudents([...students, newStudent]);

      // Automatically issue pending invoice for August 2026 using customized fee
      if (setInvoices) {
        const invoiceNo = `BHE2026-${String(invoices.length + 1).padStart(3, "0")}`;
        const newInvoice: FeeInvoice = {
          id: `INV_${Date.now()}`,
          invoiceNo,
          studentId: newId,
          studentName: formData.name || "",
          className: formData.class || "Class 10",
          month: "August 2026",
          amount: mFee,
          discount: 0,
          fine: 0,
          total: mFee,
          status: "Pending",
        };
        saveFeeInvoice(newInvoice);
        setInvoices((prev) => [newInvoice, ...prev]);
      }
    } else {
      // Edit mode
      if (!selectedStudent) return;
      const updatedStudent: Student = {
        ...selectedStudent,
        ...formData,
        monthlyFee: mFee,
        admissionFee: aFee,
        examFee: eFee,
      } as Student;

      saveStudent(updatedStudent);
      const updated = students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s));
      setStudents(updated);

      // Automatically update any "Pending" invoices for this student to match the updated customized fee
      if (setInvoices) {
        setInvoices((prev) =>
          prev.map((inv) => {
            if (inv.studentId === selectedStudent.id && inv.status === "Pending") {
              const updatedInv = {
                ...inv,
                studentName: formData.name || inv.studentName,
                className: formData.class || inv.className,
                amount: mFee,
                total: mFee + Number(inv.fine) - Number(inv.discount),
              };
              saveFeeInvoice(updatedInv);
              return updatedInv;
            }
            return inv;
          })
        );
      }
    }

    setViewMode("list");
  };

  // Filter students based on state
  const filteredStudents = students.filter((s) => {
    if (activeRole === "Student") {
      if (loggedInUser && "admissionNo" in loggedInUser) {
        const isSelf =
          s.id === loggedInUser.id ||
          s.admissionNo === loggedInUser.admissionNo ||
          s.name.toLowerCase().trim() === loggedInUser.name.toLowerCase().trim();
        if (!isSelf) return false;
      } else if (students.length > 0) {
        if (s.id !== students[0].id) return false;
      }
    }

    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = classFilter === "All" || s.class === classFilter;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6" id="student-module-root">
      {/* Header and Quick Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" /> Student Enrollment Hub
          </h3>
          <p className="text-xs text-slate-500">Manage admissions, promote grades, generate ID cards, and profiles.</p>
        </div>
        {viewMode === "list" ? (
          !isReadOnly && (
            <button
              id="admit-student-btn"
              onClick={handleCreateNewClick}
              className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-3.5 rounded-lg text-xs transition"
            >
              <Plus className="w-4 h-4" /> New Student Admission
            </button>
          )
        ) : (
          <button
            id="back-to-list-btn"
            onClick={() => setViewMode("list")}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3.5 py-2 rounded-lg"
          >
            ← Back to Student List
          </button>
        )}
      </div>

      {/* VIEW: Student Listing */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
            {/* Search Input */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="student-search-input"
                type="text"
                placeholder="Search by name, ID, admission code, guardian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Class Filter */}
            <select
              id="student-class-filter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Grades</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
              <option value="Alumni">Alumni</option>
            </select>
            {/* Status Filter */}
            <select
              id="student-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Transferred">Transferred</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Student Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Admission & Roll</th>
                    <th className="p-3.5">Grade Level</th>
                    <th className="p-3.5">Guardian Contact</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition">
                        {/* Student Details */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"}
                              alt={s.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <h4 className="font-bold text-slate-800">{s.name}</h4>
                              <span className="text-[10px] text-slate-400 font-semibold">{s.id}</span>
                            </div>
                          </div>
                        </td>
                        {/* Admission & Roll */}
                        <td className="p-3.5">
                          <span className="block font-semibold text-slate-800">{s.admissionNo}</span>
                          <span className="text-[10px] text-slate-400">Roll No: {s.rollNo}</span>
                        </td>
                        {/* Grade Level */}
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            {s.class} - {s.section}
                          </span>
                        </td>
                        {/* Guardian Contact */}
                        <td className="p-3.5">
                          <span className="block font-semibold text-slate-800">{s.guardianName}</span>
                          <span className="text-[10px] text-slate-400">{s.guardianPhone}</span>
                        </td>
                        {/* Status */}
                        <td className="p-3.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              s.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : s.status === "Withdrawn"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-slate-50 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleViewProfile(s)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                            title="Student Profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewIdCard(s)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                            title="Generate ID Card"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => handleEditClick(s)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(s)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400 font-semibold">
                        No active student records correspond with your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Create Admission or Edit Student */}
      {(viewMode === "create" || viewMode === "edit") && (
        <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
            {viewMode === "create" ? "Student New Admission Form" : `Modify Profile details: ${selectedStudent?.id}`}
          </h4>

          {formErrors && (
            <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs font-semibold">
              {formErrors}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Aisha Rehman"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Dob */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob || ""}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
              <select
                value={formData.gender || "Male"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Class Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Grade Level *</label>
              <select
                value={formData.class || "Class 10"}
                onChange={(e) => {
                  const selectedClass = e.target.value;
                  const defaultFees = getClassDefaultFees(selectedClass);
                  setFormData({
                    ...formData,
                    class: selectedClass,
                    monthlyFee: defaultFees.monthlyFee,
                    admissionFee: defaultFees.admissionFee,
                    examFee: defaultFees.examFee,
                  });
                }}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Section *</label>
              <input
                type="text"
                required
                value={formData.section || ""}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Admission No */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Admission No *</label>
              <input
                type="text"
                required
                value={formData.admissionNo || ""}
                onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                placeholder="ADM2026001"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Roll No */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Roll No *</label>
              <input
                type="text"
                required
                value={formData.rollNo || ""}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="01"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Student Photo Upload (File or URL) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Student Photo (Upload PNG / JPEG or Paste URL)
              </label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Student Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 border border-slate-300">
                    No Pic
                  </div>
                )}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, photoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: "" })}
                        className="text-[10px] font-bold text-red-600 hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.photoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="Or paste image URL link (e.g. https://...)"
                    className="w-full text-[11px] border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Guardian & Emergency Contacts
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Guardian Name *</label>
              <input
                type="text"
                required
                value={formData.guardianName || ""}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Muhammad Rehman"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian Phone No *</label>
              <input
                type="text"
                required
                value={formData.guardianPhone || ""}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+1 (555) 011-3421"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Guardian Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian Email</label>
              <input
                type="email"
                value={formData.guardianEmail || ""}
                onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                placeholder="m.rehman@email.com"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Emergency Contact */}
            <div className="col-span-1 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact Info (Name / Relation / Phone) *</label>
              <input
                type="text"
                required
                value={formData.emergencyContact || ""}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+1 (555) 011-3421 (Father)"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Address & Medical Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
              <textarea
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Residential physical address lines..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Medical Info */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Medical Records & Allergies</label>
              <textarea
                value={formData.medicalRecord || ""}
                onChange={(e) => setFormData({ ...formData, medicalRecord: e.target.value })}
                placeholder="Specific medical history details, peanut allergies, asthma, etc."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Custom Fee Setup
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100">
            {/* Monthly Tuition Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Monthly Tuition Fee (Rs.) *
              </label>
              <input
                type="number"
                required
                value={formData.monthlyFee || 0}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                className="w-full text-xs border border-emerald-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Class-wise default fees populate automatically on grade selection.</p>
            </div>

            {/* Admission Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Admission Fee (Rs.)
              </label>
              <input
                type="number"
                value={formData.admissionFee || 0}
                onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                className="w-full text-xs border border-emerald-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* Exam Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Exam Fee (Rs.)
              </label>
              <input
                type="number"
                value={formData.examFee || 0}
                onChange={(e) => setFormData({ ...formData, examFee: Number(e.target.value) })}
                className="w-full text-xs border border-emerald-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg"
            >
              Save Student Record
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Student Detailed Profile */}
      {viewMode === "profile" && selectedStudent && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
            <img
              src={selectedStudent.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"}
              alt={selectedStudent.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 shadow-sm"
            />
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full uppercase">
                {selectedStudent.status} Student
              </span>
              <h4 className="text-lg font-extrabold text-slate-800">{selectedStudent.name}</h4>
              <p className="text-xs text-slate-500 font-semibold">
                ID: {selectedStudent.id} | Admission Code: {selectedStudent.admissionNo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Block: Academic Details */}
            <div className="space-y-4">
              <h5 className="font-bold text-slate-800 uppercase tracking-wide border-l-2 border-blue-600 pl-2">
                Academic Ledger
              </h5>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500">Current Grade Level:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.class}</span>

                <span className="text-slate-500">Assigned Section:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.section}</span>

                <span className="text-slate-500">Class Roll Number:</span>
                <span className="font-bold text-slate-800 text-right">#{selectedStudent.rollNo}</span>

                <span className="text-slate-500">Date of Admission:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.admissionDate}</span>

                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.dob}</span>

                <span className="text-slate-500">Gender:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.gender}</span>
              </div>
            </div>

            {/* Right Block: Guardian Details */}
            <div className="space-y-4">
              <h5 className="font-bold text-slate-800 uppercase tracking-wide border-l-2 border-blue-600 pl-2">
                Guardian Information
              </h5>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500">Guardian Name:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.guardianName}</span>

                <span className="text-slate-500">Primary Contact No:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.guardianPhone}</span>

                <span className="text-slate-500">Email Address:</span>
                <span className="font-bold text-slate-800 text-right break-all">{selectedStudent.guardianEmail || "N/A"}</span>

                <span className="text-slate-500">Emergency Number:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.emergencyContact}</span>

                <span className="text-slate-500">Residential Address:</span>
                <span className="font-bold text-slate-800 text-right">{selectedStudent.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Custom Fee Rates Block */}
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 text-xs space-y-2">
            <h5 className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Student Fee Rates & Billing Setup
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Tuition Fee</span>
                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">Rs. {selectedStudent.monthlyFee !== undefined ? selectedStudent.monthlyFee : getClassDefaultFees(selectedStudent.class).monthlyFee}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Admission Fee</span>
                <p className="text-sm font-extrabold text-slate-700 mt-0.5">Rs. {selectedStudent.admissionFee !== undefined ? selectedStudent.admissionFee : getClassDefaultFees(selectedStudent.class).admissionFee}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Exam Fee</span>
                <p className="text-sm font-extrabold text-slate-700 mt-0.5">Rs. {selectedStudent.examFee !== undefined ? selectedStudent.examFee : getClassDefaultFees(selectedStudent.class).examFee}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-xs space-y-1">
            <h5 className="font-bold text-amber-800 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Active Medical & Health Records
            </h5>
            <p className="text-amber-700 leading-relaxed font-semibold">{selectedStudent.medicalRecord || "No record registered."}</p>
          </div>

          {/* Actions for active student */}
          {!isReadOnly && (
            <div className="flex flex-wrap gap-2.5 justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => handlePromoteStudent(selectedStudent)}
                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg flex items-center gap-1"
              >
                <ChevronsUp className="w-4 h-4" /> Promote Grade
              </button>
              <button
                onClick={() => handleTransferStudent(selectedStudent.id)}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg flex items-center gap-1"
              >
                <ArrowRightLeft className="w-4 h-4" /> Record Transfer
              </button>
              <button
                onClick={() => handleWithdrawStudent(selectedStudent.id)}
                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-lg flex items-center gap-1"
              >
                <UserX className="w-4 h-4" /> Withdraw Admission
              </button>
              <button
                onClick={() => handleDeleteStudent(selectedStudent)}
                className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-lg flex items-center gap-1 transition"
                title="Delete Student Record"
              >
                <Trash2 className="w-4 h-4" /> Delete Student
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Printable Student ID Card */}
      {viewMode === "id-card" && selectedStudent && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          {/* Embedded Print CSS to print ONLY the ID card and hide all other app elements */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body > * {
                visibility: hidden !important;
              }
              #student-id-card-print-area, #student-id-card-print-area * {
                visibility: visible !important;
              }
              #student-id-card-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 2rem !important;
                justify-content: center !important;
                align-items: center !important;
                background: white !important;
                padding: 20px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}} />

          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Student Identity Card</h3>
              <p className="text-xs text-slate-500">Pakistani Institutional Standard Smart ID Card Layout</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Layout Switcher */}
              <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIdCardLayout("interactive")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    idCardLayout === "interactive"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  3D Flip Card
                </button>
                <button
                  type="button"
                  onClick={() => setIdCardLayout("side-by-side")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    idCardLayout === "side-by-side"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Print Both Sides
                </button>
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrintStudentIdCard}
                className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 py-1.5 px-4 rounded-lg border border-emerald-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print Card
              </button>
            </div>
          </div>

          {idCardLayout === "interactive" ? (
            /* INTERACTIVE 3D FLIP CARD */
            <div className="py-8 flex flex-col items-center justify-center space-y-6">
              {/* Instruction Hint */}
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <RotateCw className="w-3.5 h-3.5 text-slate-400 animate-spin" style={{ animationDuration: '4s' }} />
                Click Card to flip front/back
              </p>

              {/* Card Container with Perspective */}
              <div 
                className="w-80 h-[480px] perspective-1000 cursor-pointer"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
              >
                <div 
                  className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
                    isCardFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 border-4 border-emerald-950 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between font-sans">
                    {/* Top Ribbon & Pakistan flag accent */}
                    <div className="relative bg-emerald-900 text-white pt-4 px-4 pb-3 text-center border-b border-emerald-950">
                      {/* Logo & School Name Row */}
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <img 
                          src="/src/assets/images/citizen_school_logo_1784554581588.jpg" 
                          alt="Citizen School" 
                          className="w-7 h-7 rounded-md border border-amber-400/30 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <h4 className="font-serif font-bold text-sm tracking-wide text-amber-400">
                          CITIZEN SCHOOL
                        </h4>
                      </div>
                      <div className="text-[7px] text-white/75 uppercase tracking-widest font-bold">
                        Govt. Registered
                      </div>
                      <div className="mt-1.5 bg-amber-400/90 text-slate-950 font-sans font-black text-[9px] py-0.5 px-3 rounded-full inline-block uppercase tracking-wider">
                        STUDENT IDENTITY CARD
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col items-center justify-between">
                      {/* Photo Container */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full blur-xs opacity-75"></div>
                        <img
                          src={selectedStudent.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"}
                          alt={selectedStudent.name}
                          className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <span className="absolute bottom-0 right-1 bg-emerald-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                          Verified
                        </span>
                      </div>

                      {/* Student Name */}
                      <div className="text-center w-full mt-2">
                        <h3 className="font-extrabold text-base text-white tracking-tight uppercase">
                          {selectedStudent.name}
                        </h3>
                        <p className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase mt-0.5">
                          {selectedStudent.class} • Section {selectedStudent.section}
                        </p>
                      </div>

                      {/* Details Grid (Pakistani Format) */}
                      <div className="w-full space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/10 text-left text-[10px]">
                        <div className="flex justify-between py-0.5 border-b border-white/5">
                          <span className="text-slate-400 font-medium">Father's Name:</span>
                          <span className="font-bold text-white text-right truncate max-w-[130px]">{selectedStudent.guardianName}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-white/5">
                          <span className="text-slate-400 font-medium">Roll Number:</span>
                          <span className="font-extrabold text-amber-300">#{selectedStudent.rollNo}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-white/5">
                          <span className="text-slate-400 font-medium">Admission No:</span>
                          <span className="font-mono font-semibold text-slate-100">{selectedStudent.admissionNo}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400 font-medium">Emergency Cell:</span>
                          <span className="font-mono font-bold text-slate-100">{selectedStudent.guardianPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="bg-slate-950 p-3.5 border-t border-emerald-950 flex items-center justify-between">
                      <div className="bg-white p-1 rounded-sm shadow-inner">
                        <QrCode className="w-7 h-7 text-slate-900" />
                      </div>

                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-[1px]">
                          {[2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 4, 2, 1].map((width, idx) => (
                            <div key={idx} className="bg-slate-300 h-5" style={{ width: `${width}px` }}></div>
                          ))}
                        </div>
                        <span className="text-[7px] font-mono text-slate-400 tracking-wider">*{selectedStudent.id}*</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 border-4 border-emerald-950 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between font-sans">
                    {/* Top Ribbon back */}
                    <div className="bg-emerald-950 text-white p-3.5 text-center border-b border-slate-800 flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-serif font-black text-xs tracking-wide text-amber-400">
                          CITIZEN SCHOOL
                        </h4>
                        <p className="text-[7px] text-white/60 leading-none">Established Campus Network</p>
                      </div>
                      <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-md font-mono text-slate-300">
                        Back View
                      </span>
                    </div>

                    {/* Back Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3 relative">
                      {/* Security Watermark Ghost Image */}
                      <div className="absolute right-3 top-3 opacity-15 grayscale pointer-events-none">
                        <img
                          src={selectedStudent.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"}
                          alt="watermark"
                          className="w-16 h-16 rounded-lg object-cover filter contrast-125"
                        />
                        <div className="text-[5px] text-center font-mono mt-0.5">SECURITY WATERMARK</div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1">
                        <span className="block text-[8px] uppercase tracking-wider text-amber-400 font-extrabold">
                          Rules & Instructions
                        </span>
                        <ul className="text-[8px] text-slate-300 list-disc list-inside space-y-0.5 leading-relaxed">
                          <li>This card must be worn and displayed inside the school premises.</li>
                          <li>In case of loss, notify immediately to get a replacement card.</li>
                          <li>This card is non-transferable and remains school property.</li>
                          <li>If found, please return to the school administration office.</li>
                        </ul>
                      </div>

                      {/* Address detail */}
                      <div className="space-y-1 bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[8px] text-amber-400 font-bold uppercase block">
                          Residential Address
                        </span>
                        <p className="text-[9px] text-slate-100 font-semibold leading-relaxed">
                          {selectedStudent.address || "N/A"}
                        </p>
                      </div>

                      {/* School Address & Contact */}
                      <div className="text-[8px] text-slate-400 space-y-0.5">
                        <p className="font-semibold text-slate-300">Citizen School Regional Office:</p>
                        <p className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          Main Boulevard, Gulberg III, Lahore, Pakistan
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          Helpline: +92 (42) 111-248-493
                        </p>
                      </div>
                    </div>

                    {/* Bottom footer back: Seal & Signature */}
                    <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
                      {/* Official Seal Mock */}
                      <div className="flex items-center gap-1 bg-emerald-950/40 py-1 px-2 rounded-md border border-emerald-900/40">
                        <div className="w-5 h-5 rounded-full border border-dashed border-emerald-500 flex items-center justify-center">
                          <span className="text-[5px] text-emerald-500 font-bold">SEAL</span>
                        </div>
                        <div className="text-[6px] text-slate-400">
                          <span className="block font-bold">APPROVED</span>
                          <span className="leading-none">Admin Registry</span>
                        </div>
                      </div>

                      {/* Principal Signature */}
                      <div className="text-right flex flex-col items-end">
                        <span className="font-serif italic text-amber-400 text-xs font-semibold select-none leading-none mb-1">
                          A. H. Hashmi
                        </span>
                        <div className="w-20 border-t border-slate-600 my-0.5"></div>
                        <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wider block">
                          Principal Signature
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PRINT FRIENDLY SIDE-BY-SIDE LAYOUT */
            <div id="student-id-card-print-area" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center max-w-4xl mx-auto py-4">
              {/* CARD FRONT */}
              <div className="w-80 h-[480px] bg-slate-900 border-4 border-emerald-950 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between font-sans mx-auto">
                {/* Top Ribbon & Pakistan flag accent */}
                <div className="relative bg-emerald-900 text-white pt-4 px-4 pb-3 text-center border-b border-emerald-950">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img 
                      src="/src/assets/images/citizen_school_logo_1784554581588.jpg" 
                      alt="Citizen School" 
                      className="w-7 h-7 rounded-md border border-amber-400/30 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="font-serif font-bold text-sm tracking-wide text-amber-400">
                      CITIZEN SCHOOL
                    </h4>
                  </div>
                  <div className="text-[7px] text-white/75 uppercase tracking-widest font-bold">
                    Govt. Registered
                  </div>
                  <div className="mt-1.5 bg-amber-400/90 text-slate-950 font-sans font-black text-[9px] py-0.5 px-3 rounded-full inline-block uppercase tracking-wider">
                    STUDENT IDENTITY CARD
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col items-center justify-between">
                  {/* Photo Container */}
                  <div className="relative">
                    <img
                      src={selectedStudent.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"}
                      alt={selectedStudent.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  </div>

                  {/* Student Name */}
                  <div className="text-center w-full mt-2">
                    <h3 className="font-extrabold text-base text-white tracking-tight uppercase">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase mt-0.5">
                      {selectedStudent.class} • Section {selectedStudent.section}
                    </p>
                  </div>

                  {/* Details Grid (Pakistani Format) */}
                  <div className="w-full space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/10 text-left text-[10px]">
                    <div className="flex justify-between py-0.5 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Father's Name:</span>
                      <span className="font-bold text-white text-right truncate max-w-[130px]">{selectedStudent.guardianName}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Roll Number:</span>
                      <span className="font-extrabold text-amber-300">#{selectedStudent.rollNo}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Admission No:</span>
                      <span className="font-mono font-semibold text-slate-100">{selectedStudent.admissionNo}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400 font-medium">Emergency Cell:</span>
                      <span className="font-mono font-bold text-slate-100">{selectedStudent.guardianPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="bg-slate-950 p-3.5 border-t border-emerald-950 flex items-center justify-between">
                  <div className="bg-white p-1 rounded-sm shadow-inner">
                    <QrCode className="w-7 h-7 text-slate-900" />
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-[1px]">
                      {[2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 4, 2, 1].map((width, idx) => (
                        <div key={idx} className="bg-slate-300 h-5" style={{ width: `${width}px` }}></div>
                      ))}
                    </div>
                    <span className="text-[7px] font-mono text-slate-400 tracking-wider">*{selectedStudent.id}*</span>
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="w-80 h-[480px] bg-slate-900 border-4 border-emerald-950 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between font-sans mx-auto">
                <div className="bg-emerald-950 text-white p-3.5 text-center border-b border-slate-800 flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="font-serif font-black text-xs tracking-wide text-amber-400">
                      CITIZEN SCHOOL
                    </h4>
                    <p className="text-[7px] text-white/60 leading-none">Established Campus Network</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3 relative">
                  <div className="absolute right-3 top-3 opacity-15 grayscale pointer-events-none">
                    <img
                      src={selectedStudent.photoUrl || "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000"}
                      alt="watermark"
                      className="w-16 h-16 rounded-lg object-cover filter contrast-125"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1">
                    <span className="block text-[8px] uppercase tracking-wider text-amber-400 font-extrabold">
                      Rules & Instructions
                    </span>
                    <ul className="text-[8px] text-slate-300 list-disc list-inside space-y-0.5 leading-relaxed">
                      <li>This card must be worn and displayed inside the school premises.</li>
                      <li>In case of loss, notify immediately to get a replacement card.</li>
                      <li>This card is non-transferable and remains school property.</li>
                      <li>If found, please return to the school administration office.</li>
                    </ul>
                  </div>

                  {/* Address detail */}
                  <div className="space-y-1 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[8px] text-amber-400 font-bold uppercase block">
                      Residential Address
                    </span>
                    <p className="text-[9px] text-slate-100 font-semibold leading-relaxed">
                      {selectedStudent.address || "N/A"}
                    </p>
                  </div>

                  {/* School Address & Contact */}
                  <div className="text-[8px] text-slate-400 space-y-0.5">
                    <p className="font-semibold text-slate-300">Citizen School Regional Office:</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      Main Boulevard, Gulberg III, Lahore, Pakistan
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      Helpline: +92 (42) 111-248-493
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-emerald-950/40 py-1 px-2 rounded-md border border-emerald-900/40">
                    <div className="w-5 h-5 rounded-full border border-dashed border-emerald-500 flex items-center justify-center">
                      <span className="text-[5px] text-emerald-500 font-bold">SEAL</span>
                    </div>
                    <div className="text-[6px] text-slate-400">
                      <span className="block font-bold">APPROVED</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="font-serif italic text-amber-400 text-xs font-semibold select-none leading-none mb-1">
                      A. H. Hashmi
                    </span>
                    <div className="w-20 border-t border-slate-600 my-0.5"></div>
                    <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wider block">
                      Principal Signature
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Back to list */}
          <div className="flex justify-center border-t border-slate-100 pt-4">
            <button
              onClick={() => setViewMode("list")}
              className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-6 py-2.5 rounded-lg transition"
            >
              Back to Students List
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Student Record</h3>
                <p className="text-xs text-slate-500">This action will remove the student permanently</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete <strong>{deletingStudent.name}</strong> (ID: {deletingStudent.id}, {deletingStudent.class}-{deletingStudent.section})?
            </p>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

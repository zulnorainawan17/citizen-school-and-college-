import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CreditCard,
  QrCode,
  Briefcase,
  FileText,
  Bookmark,
} from "lucide-react";
import { Teacher, TEACHER_DEPARTMENTS } from "../types";
import { saveTeacher, deleteTeacher } from "../lib/firestoreService";

interface TeacherModuleProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

export function TeacherModule({ teachers, setTeachers }: TeacherModuleProps) {
  // Navigation states: 'list', 'register', 'edit', 'profile', 'id-card'
  const [viewMode, setViewMode] = useState<"list" | "register" | "edit" | "profile" | "id-card">("list");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  // Form states
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: "",
    email: "",
    phone: "",
    department: TEACHER_DEPARTMENTS[0] || "Early Years (Playgroup/Nursery)",
    qualification: "",
    experience: "",
    salary: 3000,
    dob: "",
    joiningDate: "",
    status: "Active",
    photoUrl: "",
  });

  const [formErrors, setFormErrors] = useState("");

  const handleRegisterClick = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: TEACHER_DEPARTMENTS[0] || "Early Years (Playgroup/Nursery)",
      qualification: "M.A. in Early Childhood Education",
      experience: "5 Years",
      salary: 3500,
      dob: "1990-01-01",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
      photoUrl: "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000",
    });
    setFormErrors("");
    setViewMode("register");
  };

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData(teacher);
    setFormErrors("");
    setViewMode("edit");
  };

  const handleViewProfile = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode("profile");
  };

  const handleViewIdCard = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode("id-card");
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setDeletingTeacher(teacher);
  };

  const handleConfirmDeleteTeacher = () => {
    if (deletingTeacher) {
      deleteTeacher(deletingTeacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== deletingTeacher.id));
      if (selectedTeacher?.id === deletingTeacher.id) {
        setSelectedTeacher(null);
        setViewMode("list");
      }
      setDeletingTeacher(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.qualification) {
      setFormErrors("Please complete all essential fields.");
      return;
    }

    if (viewMode === "register") {
      const newId = `TCH${String(Date.now()).slice(-4)}`;
      const newTeacher: Teacher = {
        id: newId,
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        department: formData.department || TEACHER_DEPARTMENTS[0] || "Early Years (Playgroup/Nursery)",
        qualification: formData.qualification || "",
        experience: formData.experience || "1 Year",
        salary: Number(formData.salary) || 3000,
        dob: formData.dob || "1990-01-01",
        joiningDate: formData.joiningDate || new Date().toISOString().split("T")[0],
        status: "Active",
        photoUrl: formData.photoUrl || "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000",
      };
      saveTeacher(newTeacher);
      setTeachers([...teachers, newTeacher]);
    } else {
      if (!selectedTeacher) return;
      const updatedTeacher: Teacher = { ...selectedTeacher, ...formData } as Teacher;
      saveTeacher(updatedTeacher);
      const updated = teachers.map((t) => (t.id === selectedTeacher.id ? updatedTeacher : t));
      setTeachers(updated);
    }

    setViewMode("list");
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === "All" || t.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6" id="teacher-module-root">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Faculty Directory & Roster
          </h3>
          <p className="text-xs text-slate-500">Manage academic staff registration, salaries, credentials, and ID cards.</p>
        </div>
        {viewMode === "list" ? (
          <button
            id="register-teacher-btn"
            onClick={handleRegisterClick}
            className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-3.5 rounded-lg text-xs transition"
          >
            <Plus className="w-4 h-4" /> Register New Teacher
          </button>
        ) : (
          <button
            onClick={() => setViewMode("list")}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3.5 py-2 rounded-lg"
          >
            ← Back to Faculty List
          </button>
        )}
      </div>

      {/* VIEW: Teachers Listing */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
            {/* Search Input */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="teacher-search-input"
                type="text"
                placeholder="Search faculty by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Department Filter */}
            <select
              id="teacher-dept-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {TEACHER_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="teacher-grid">
            {filteredTeachers.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition">
                <div className="space-y-3">
                  {/* Photo & Role */}
                  <div className="flex items-center gap-3">
                    <img
                      src={t.photoUrl || "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000"}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{t.name}</h4>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full uppercase mt-0.5 inline-block">
                        {t.department} Dept
                      </span>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="text-[11px] space-y-1.5 pt-2 border-t border-slate-100">
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.qualification}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Experience: {t.experience}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      <span>ID: {t.id}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                  <span className="text-xs font-bold text-slate-800">${t.salary} / mo</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewProfile(t)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                      title="Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleViewIdCard(t)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                      title="ID Card"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(t)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Register or Edit Teacher Form */}
      {(viewMode === "register" || viewMode === "edit") && (
        <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
            {viewMode === "register" ? "New Faculty Registration Form" : `Modify Profile details: ${selectedTeacher?.id}`}
          </h4>

          {formErrors && (
            <p className="bg-red-50 text-red-700 rounded-lg p-2 text-xs font-semibold">{formErrors}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Teacher Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Teacher Name *</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Kamran Malik"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Email Address *</label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="kamran.malik@citizenschool.edu.pk"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 021-3311"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Department Assigned *</label>
              <select
                value={formData.department || TEACHER_DEPARTMENTS[0]}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                {TEACHER_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Qualifications *</label>
              <input
                type="text"
                required
                value={formData.qualification || ""}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="Ph.D. in Physics (Stanford)"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teaching Experience *</label>
              <input
                type="text"
                required
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="10 Years"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Basic Monthly Salary ($) *</label>
              <input
                type="number"
                required
                value={formData.salary || 3000}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Photo Upload (File or URL) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Teacher Photo (Upload PNG / JPEG or Paste URL)
              </label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Teacher Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0 shadow-xs"
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
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
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
              Register Faculty Record
            </button>
          </div>
        </form>
      )}

      {/* VIEW: Teacher Detailed Profile */}
      {viewMode === "profile" && selectedTeacher && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
            <img
              src={selectedTeacher.photoUrl || "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000"}
              alt={selectedTeacher.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 shadow-sm"
            />
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full uppercase">
                {selectedTeacher.status} Faculty
              </span>
              <h4 className="text-lg font-extrabold text-slate-800">{selectedTeacher.name}</h4>
              <p className="text-xs text-slate-500 font-semibold">
                ID: {selectedTeacher.id} | Email: {selectedTeacher.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Block: Academic Profile */}
            <div className="space-y-4">
              <h5 className="font-bold text-slate-800 uppercase tracking-wide border-l-2 border-blue-600 pl-2">
                Faculty Profile Ledgers
              </h5>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500">Department Assignment:</span>
                <span className="font-bold text-slate-800 text-right">{selectedTeacher.department}</span>

                <span className="text-slate-500">Academic Qualifications:</span>
                <span className="font-bold text-slate-800 text-right">{selectedTeacher.qualification}</span>

                <span className="text-slate-500">Total Professional Experience:</span>
                <span className="font-bold text-slate-800 text-right">{selectedTeacher.experience}</span>

                <span className="text-slate-500">Joining Date:</span>
                <span className="font-bold text-slate-800 text-right">{selectedTeacher.joiningDate}</span>
              </div>
            </div>

            {/* Right Block: Financial Details */}
            <div className="space-y-4">
              <h5 className="font-bold text-slate-800 uppercase tracking-wide border-l-2 border-blue-600 pl-2">
                Financial Details
              </h5>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500">Basic Monthly Salary:</span>
                <span className="font-bold text-slate-800 text-right">${selectedTeacher.salary} USD</span>

                <span className="text-slate-500">Payroll Status:</span>
                <span className="font-bold text-emerald-600 text-right">Active (Direct Deposit)</span>

                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-bold text-slate-800 text-right">{selectedTeacher.dob}</span>

                <span className="text-slate-500">Contact Number:</span>
                <span className="font-bold text-slate-800 text-right">{selectedTeacher.phone}</span>
              </div>
            </div>
          </div>

          {/* Actions for faculty */}
          <div className="flex flex-wrap gap-2.5 justify-end border-t border-slate-100 pt-4">
            <button
              onClick={() => handleEditClick(selectedTeacher)}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg flex items-center gap-1 transition"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={() => handleViewIdCard(selectedTeacher)}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg flex items-center gap-1 transition"
            >
              <CreditCard className="w-4 h-4" /> Generate ID Card
            </button>
            <button
              onClick={() => handleDeleteTeacher(selectedTeacher)}
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-lg flex items-center gap-1 transition"
              title="Delete Faculty Record"
            >
              <Trash2 className="w-4 h-4" /> Delete Faculty Record
            </button>
          </div>
        </div>
      )}

      {/* VIEW: Printable Teacher ID Card */}
      {viewMode === "id-card" && selectedTeacher && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">Printable Teacher Identity Card Preview</p>
          </div>

          <div
            id="teacher-id-card-element"
            className="w-80 h-[480px] bg-slate-900 text-white rounded-2xl mx-auto border-4 border-slate-800 overflow-hidden shadow-lg relative flex flex-col justify-between font-sans text-center"
          >
            {/* Header */}
            <div className="bg-emerald-700 p-5 space-y-1 border-b-2 border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-100">
                Citizen School and College
              </h4>
              <span className="block text-[8px] text-emerald-200 font-bold uppercase tracking-widest">
                Faculty Identity Card
              </span>
            </div>

            {/* Middle body */}
            <div className="p-5 flex-1 flex flex-col items-center justify-center space-y-4">
              <img
                src={selectedTeacher.photoUrl || "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000"}
                alt={selectedTeacher.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-sm"
              />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-100 tracking-tight">{selectedTeacher.name}</h3>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">{selectedTeacher.department} Department</p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-left w-full text-[9px] bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Faculty ID:</span>
                <span className="font-bold text-slate-100 text-right">{selectedTeacher.id}</span>

                <span className="text-slate-400">Quals:</span>
                <span className="font-bold text-slate-100 text-right truncate">{selectedTeacher.qualification}</span>

                <span className="text-slate-400">Contact Number:</span>
                <span className="font-bold text-slate-100 text-right">{selectedTeacher.phone}</span>

                <span className="text-slate-400">Registered Email:</span>
                <span className="font-bold text-slate-100 text-right truncate">{selectedTeacher.email}</span>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="bg-white p-1 rounded-sm">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-[1px]">
                  {[3, 2, 1, 4, 1, 3, 1, 2, 4, 3, 1, 2].map((width, idx) => (
                    <div key={idx} className="bg-slate-300 h-6" style={{ width: `${width}px` }}></div>
                  ))}
                </div>
                <span className="text-[8px] font-mono text-slate-400 leading-none">*{selectedTeacher.id}*</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2 px-5 rounded-lg border border-slate-900 transition"
            >
              Print ID Card Layout
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Faculty Member</h3>
                <p className="text-xs text-slate-500">This record will be permanently deleted</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete <strong>{deletingTeacher.name}</strong> (ID: {deletingTeacher.id}, {deletingTeacher.department} Dept)?
            </p>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTeacher}
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

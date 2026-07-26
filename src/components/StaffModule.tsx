import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  X,
  CreditCard,
  Briefcase,
  QrCode,
  Building,
} from "lucide-react";
import { Staff, SchoolConfig } from "../types";
import { saveStaff, deleteStaff } from "../lib/firestoreService";

interface StaffModuleProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  schoolConfig?: SchoolConfig;
}

export const STAFF_ROLES = [
  "Clerk / Office Staff",
  "Security Guard",
  "Peon / Office Attendant",
  "Driver",
  "Cleaner / Janitor",
  "Librarian",
  "Receptionist",
  "Lab Attendant",
  "Hostel Warden",
  "Other Support Staff",
] as const;

export function StaffModule({ staff, setStaff, schoolConfig }: StaffModuleProps) {
  // Navigation states: 'list', 'register', 'edit', 'id-card'
  const [viewMode, setViewMode] = useState<"list" | "register" | "edit" | "id-card">("list");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states (Salary defaults to 0 as requested)
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: "",
    role: "Clerk / Office Staff" as any,
    email: "",
    phone: "",
    salary: 0,
    status: "Active",
  });

  const [formErrors, setFormErrors] = useState("");

  const handleRegisterClick = () => {
    setFormData({
      name: "",
      role: "Clerk / Office Staff" as any,
      email: "",
      phone: "",
      salary: 0,
      status: "Active",
    });
    setFormErrors("");
    setViewMode("register");
  };

  const handleEditClick = (member: Staff) => {
    setSelectedStaff(member);
    setFormData(member);
    setFormErrors("");
    setViewMode("edit");
  };

  const handleViewIdCard = (member: Staff) => {
    setSelectedStaff(member);
    setViewMode("id-card");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormErrors("Staff member name is required.");
      return;
    }

    const newStaffMember: Staff = {
      id: selectedStaff?.id || `STF_${Date.now()}`,
      name: formData.name.trim(),
      role: (formData.role as any) || "Office Staff",
      email: formData.email?.trim() || "",
      phone: formData.phone?.trim() || "",
      salary: Number(formData.salary) || 0,
      status: (formData.status as any) || "Active",
    };

    await saveStaff(newStaffMember);

    if (viewMode === "edit" && selectedStaff) {
      setStaff((prev) => prev.map((s) => (s.id === selectedStaff.id ? newStaffMember : s)));
      alert(`Staff details updated successfully for ${newStaffMember.name}!`);
    } else {
      setStaff((prev) => [newStaffMember, ...prev]);
      alert(`New staff member ${newStaffMember.name} registered successfully!`);
    }

    setViewMode("list");
    setSelectedStaff(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingStaff) {
      await deleteStaff(deletingStaff.id);
      setStaff((prev) => prev.filter((s) => s.id !== deletingStaff.id));
      setDeletingStaff(null);
    }
  };

  const handlePrintStaffIdCard = () => {
    const cardElement = document.getElementById("staff-id-card-element");
    const schoolName = schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE";
    const staffName = selectedStaff?.name || "Support Staff Member";

    const printWin = window.open("", "_blank", "width=850,height=800");
    if (printWin && cardElement) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${schoolName} - Staff Identity Card - ${staffName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
              @page { size: A4 portrait; margin: 10mm; }
              body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                background-color: #ffffff;
                color: #000000;
                padding: 30px;
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 90vh;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #staff-id-card-element {
                margin: 0 auto !important;
                box-shadow: none !important;
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
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Official Support Staff & Operations Card</p>
            </div>
            ${cardElement.outerHTML}
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
  };

  // Filtered staff members
  const filteredStaff = staff.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || s.role === roleFilter;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;

    return matchesQuery && matchesRole && matchesStatus;
  });

  const activeCount = staff.filter((s) => s.status === "Active").length;
  const clerkCount = staff.filter((s) => s.role.toLowerCase().includes("clerk") || s.role.toLowerCase().includes("office")).length;
  const guardCount = staff.filter((s) => s.role.toLowerCase().includes("guard") || s.role.toLowerCase().includes("security")).length;
  const peonCount = staff.filter((s) => s.role.toLowerCase().includes("peon") || s.role.toLowerCase().includes("cleaner")).length;

  return (
    <div className="space-y-6" id="staff-module-root">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">Support Staff Register</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register and manage non-teaching staff details including Clerks, Peons, Guards, Drivers, Janitors & Receptionists
          </p>
        </div>

        {viewMode === "list" && (
          <button
            onClick={handleRegisterClick}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register Staff Member
          </button>
        )}

        {viewMode !== "list" && (
          <button
            onClick={() => {
              setViewMode("list");
              setSelectedStaff(null);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            ← Back to Staff Directory
          </button>
        )}
      </div>

      {/* VIEW 1: Staff Directory List */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Staff</span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{staff.length}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{activeCount} Active Status</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clerks & Office</span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{clerkCount}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Administration & Accounts</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Guards</span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{guardCount}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Campus Security</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peons & Cleaners</span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{peonCount}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Support & Maintenance</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, role, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Staff Roles</option>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff ID & Name</th>
                    <th className="py-3 px-4">Designation / Role</th>
                    <th className="py-3 px-4">Phone & Email</th>
                    <th className="py-3 px-4">Monthly Salary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No support staff records found. Click "Register Staff Member" to add details for Clerks, Guards, or Peons.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                              {member.name.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">{member.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400">{member.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-800 border border-slate-200">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{member.phone || "N/A"}</span>
                            </div>
                            {member.email && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{member.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          Rs. {member.salary.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.status === "Active"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewIdCard(member)}
                              title="Print Staff ID Card"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditClick(member)}
                              title="Edit Details"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingStaff(member)}
                              title="Delete Member"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Register / Edit Staff Form */}
      {(viewMode === "register" || viewMode === "edit") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {viewMode === "register" ? "Register New Support Staff Member" : "Update Staff Member Details"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter details for Clerk, Security Guard, Peon, Driver, or Janitor</p>
            </div>
            <button
              onClick={() => setViewMode("list")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formErrors && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-200">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riaz Ahmad"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Designation / Role *
                </label>
                <select
                  value={formData.role || "Clerk / Office Staff"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-slate-400"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +92 300 1234567"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. staff@school.edu.pk"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Monthly Salary (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.salary ?? 0}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Leave at 0 or input custom salary amount.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Employment Status
                </label>
                <select
                  value={formData.status || "Active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-slate-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {viewMode === "register" ? "Save Staff Registration" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: Staff Identity Card Preview & Print */}
      {viewMode === "id-card" && selectedStaff && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body > * {
                visibility: hidden !important;
              }
              #staff-id-card-element, #staff-id-card-element * {
                visibility: visible !important;
              }
              #staff-id-card-element {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                background: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}} />

          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Official Support Staff Identity Card</p>
            <h3 className="text-lg font-bold text-slate-800">{selectedStaff.name}</h3>
          </div>

          <div
            id="staff-id-card-element"
            className="w-80 h-[460px] bg-slate-900 text-white rounded-2xl p-5 mx-auto flex flex-col justify-between relative shadow-xl border border-slate-800 overflow-hidden"
          >
            {/* Header branding */}
            <div className="text-center border-b border-slate-800 pb-3">
              <span className="text-[10px] tracking-widest text-emerald-400 font-extrabold uppercase block">
                {schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE"}
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5">Support Staff & Administrative Pass</p>
            </div>

            {/* Photo Avatar Placeholder */}
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/50 mx-auto flex items-center justify-center font-extrabold text-xl text-emerald-400 shadow-inner">
                {selectedStaff.name.substring(0, 2)}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">{selectedStaff.name}</h4>
                <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {selectedStaff.role}
                </span>
              </div>
            </div>

            {/* Staff Details */}
            <div className="bg-slate-800/80 rounded-xl p-3 space-y-2 text-[11px] border border-slate-700/50">
              <div className="flex justify-between">
                <span className="text-slate-400">Staff ID:</span>
                <span className="font-mono font-bold text-slate-200">{selectedStaff.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-bold text-slate-200">{selectedStaff.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">{selectedStaff.status}</span>
              </div>
            </div>

            {/* Footer QR & Authority */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[9px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-6 h-6 text-slate-500" />
                <span>Verified Personnel</span>
              </div>
              <div className="text-right">
                <p className="font-serif italic font-medium text-slate-300">Principal Signature</p>
                <p className="text-[8px] text-slate-500">Issued by Campus HR</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handlePrintStaffIdCard}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2.5 px-6 rounded-lg border border-slate-900 transition flex items-center gap-2 mx-auto shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Staff Identity Card
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStaff && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Staff Member Record?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <span className="font-bold">{deletingStaff.name}</span> ({deletingStaff.role})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingStaff(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

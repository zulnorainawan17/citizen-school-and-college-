import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Bell,
  Check,
  Send,
  FileSpreadsheet,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { Student, FeeInvoice, FeeStructure } from "../types";

interface FeeModuleProps {
  students: Student[];
  invoices: FeeInvoice[];
  setInvoices: React.Dispatch<React.SetStateAction<FeeInvoice[]>>;
  feeStructures: FeeStructure[];
  setFeeStructures?: React.Dispatch<React.SetStateAction<FeeStructure[]>>;
}

export function FeeModule({
  students,
  invoices,
  setInvoices,
  feeStructures,
  setFeeStructures,
}: FeeModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "structures" | "reminders">("invoices");
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);

  // Class Fee Structure States
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [isCreatingStructure, setIsCreatingStructure] = useState(false);
  const [structureFormData, setStructureFormData] = useState({
    className: "",
    monthlyFee: 0,
    admissionFee: 0,
    examFee: 0,
    transportFee: 0,
    hostelFee: 0,
  });

  const handleEditStructure = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setStructureFormData({
      className: structure.className,
      monthlyFee: structure.monthlyFee,
      admissionFee: structure.admissionFee,
      examFee: structure.examFee,
      transportFee: structure.transportFee || 0,
      hostelFee: structure.hostelFee || 0,
    });
    setIsCreatingStructure(false);
  };

  const handleCreateStructureClick = () => {
    setEditingStructure(null);
    setStructureFormData({
      className: "",
      monthlyFee: 250,
      admissionFee: 500,
      examFee: 50,
      transportFee: 0,
      hostelFee: 0,
    });
    setIsCreatingStructure(true);
  };

  const handleSaveStructureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setFeeStructures) return;

    if (editingStructure) {
      // update
      setFeeStructures((prev) =>
        prev.map((f) =>
          f.id === editingStructure.id
            ? {
                ...f,
                className: structureFormData.className,
                monthlyFee: Number(structureFormData.monthlyFee),
                admissionFee: Number(structureFormData.admissionFee),
                examFee: Number(structureFormData.examFee),
                transportFee: Number(structureFormData.transportFee),
                hostelFee: Number(structureFormData.hostelFee),
              }
            : f
        )
      );
      setEditingStructure(null);
    } else {
      // create
      const newStructure: FeeStructure = {
        id: `STR_${Date.now()}`,
        className: structureFormData.className,
        monthlyFee: Number(structureFormData.monthlyFee),
        admissionFee: Number(structureFormData.admissionFee),
        examFee: Number(structureFormData.examFee),
        transportFee: Number(structureFormData.transportFee),
        hostelFee: Number(structureFormData.hostelFee),
      };
      setFeeStructures((prev) => [...prev, newStructure]);
      setIsCreatingStructure(false);
    }
  };

  const handleDeleteStructure = (id: string) => {
    if (!setFeeStructures) return;
    if (confirm("Are you sure you want to delete this fee structure?")) {
      setFeeStructures((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const getStudentDefaultFee = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return 280;

    // 1. If student has customized monthlyFee stored on them, use it!
    if (student.monthlyFee !== undefined && student.monthlyFee !== null) {
      return student.monthlyFee;
    }

    // 2. Otherwise, look up the class fee structure
    const structure = feeStructures.find((f) => f.className === student.class);
    if (structure) {
      return structure.monthlyFee;
    }

    return 280; // overall fallback
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Record payment state
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

  // New Invoice Form
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    studentId: "STU001",
    month: "August 2026",
    amount: 280,
    discount: 0,
    fine: 0,
  });

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    const receiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = invoices.map((inv) => {
      if (inv.id === payingInvoice.id) {
        return {
          ...inv,
          status: "Paid" as const,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod,
          receiptNo,
        };
      }
      return inv;
    });

    setInvoices(updated);
    alert(`Payment recorded successfully! Receipt generated: ${receiptNo}`);
    setPayingInvoice(null);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === newInvoiceData.studentId);
    if (!student) return;

    const total = Number(newInvoiceData.amount) + Number(newInvoiceData.fine) - Number(newInvoiceData.discount);
    const invoiceNo = `BHE2026-${String(invoices.length + 1).padStart(3, "0")}`;

    const newInvoice: FeeInvoice = {
      id: `INV_${Date.now()}`,
      invoiceNo,
      studentId: student.id,
      studentName: student.name,
      className: student.class,
      month: newInvoiceData.month,
      amount: Number(newInvoiceData.amount),
      discount: Number(newInvoiceData.discount),
      fine: Number(newInvoiceData.fine),
      total,
      status: "Pending",
    };

    setInvoices([newInvoice, ...invoices]);
    alert(`Invoice issued successfully! Invoice No: ${invoiceNo}`);
    setIsCreatingInvoice(false);
  };

  const handleBroadcastReminders = () => {
    const pendingCount = invoices.filter((inv) => inv.status === "Pending").length;
    alert(`Broadcast dispatched! Automated notifications sent to ${pendingCount} outstanding student accounts.`);
  };

  const handleViewReceipt = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setIsViewingReceipt(true);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="fee-module-root">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab("invoices");
            setIsViewingReceipt(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "invoices" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Invoice & Collections Ledgers
        </button>
        <button
          onClick={() => {
            setActiveSubTab("structures");
            setIsViewingReceipt(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "structures" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Class Fee Structures
        </button>
        <button
          onClick={() => {
            setActiveSubTab("reminders");
            setIsViewingReceipt(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "reminders" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Overdue Fee Reminders
        </button>
      </div>

      {/* VIEW: Receipts Detail Mode */}
      {isViewingReceipt && selectedInvoice && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 max-w-2xl mx-auto" id="printable-receipt-view">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Official Invoice / Fee Receipt
            </h4>
            <button
              onClick={() => setIsViewingReceipt(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              Back to Ledgers
            </button>
          </div>

          {/* Printable visual frame */}
          <div className="border border-slate-300 rounded-xl p-5 space-y-6 text-xs bg-slate-50/50" id="receipt-frame">
            {/* Header school banner */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase">Citizen School and College</h3>
                <p className="text-[10px] text-slate-400">Accredited ERP Registry Invoice Sheet</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700">Receipt No:</span>
                <span className="block text-[11px] font-semibold text-slate-800">{selectedInvoice.receiptNo || "PENDING"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 border-y border-slate-200 py-3.5">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <h5 className="font-bold text-slate-800">{selectedInvoice.studentName}</h5>
              </div>
              <div>
                <span className="text-slate-500">Student ID Code:</span>
                <h5 className="font-bold text-slate-800">{selectedInvoice.studentId}</h5>
              </div>
              <div>
                <span className="text-slate-500">Grade Level:</span>
                <h5 className="font-bold text-slate-800">{selectedInvoice.className}</h5>
              </div>
              <div>
                <span className="text-slate-500">Academic Month:</span>
                <h5 className="font-bold text-slate-800">{selectedInvoice.month}</h5>
              </div>
            </div>

            {/* Financial ledger details */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Breakdown
              </span>
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Monthly Tuition:</span>
                  <span className="font-semibold text-slate-800">Rs. {selectedInvoice.amount}</span>
                </div>
                {selectedInvoice.fine > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>Overdue Late Fee Fine (+):</span>
                    <span className="font-semibold">Rs. {selectedInvoice.fine}</span>
                  </div>
                )}
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discounts / Scholarships (-):</span>
                    <span className="font-semibold">-Rs. {selectedInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900 text-sm">
                  <span>Total Due:</span>
                  <span>Rs. {selectedInvoice.total}</span>
                </div>
              </div>
            </div>

            {/* Payment Audit Info */}
            <div className="grid grid-cols-2 gap-x-4 bg-slate-100 p-3 rounded-lg text-[10px] text-slate-500 font-semibold">
              <div>
                <span>Payment Method:</span>
                <span className="block font-bold text-slate-700 mt-0.5">{selectedInvoice.paymentMethod || "UNPAID"}</span>
              </div>
              <div>
                <span>Settlement Date:</span>
                <span className="block font-bold text-slate-700 mt-0.5">{selectedInvoice.paymentDate || "UNPAID"}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2.5 px-6 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Receipt Layout
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Invoice Ledger */}
      {activeSubTab === "invoices" && !isViewingReceipt && (
        <div className="space-y-4">
          {/* Controls Panel */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice by student name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="All">All Invoices</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <button
              id="create-invoice-btn"
              onClick={() => {
                const firstStudent = students[0];
                const initialStudentId = firstStudent ? firstStudent.id : "STU001";
                const initialFee = getStudentDefaultFee(initialStudentId);
                setNewInvoiceData({
                  studentId: initialStudentId,
                  month: "August 2026",
                  amount: initialFee,
                  discount: 0,
                  fine: 0,
                });
                setIsCreatingInvoice(true);
              }}
              className="w-full md:w-auto text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Issue New Invoice
            </button>
          </div>

          {/* New Invoice issuing Form Modal */}
          {isCreatingInvoice && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <form
                onSubmit={handleCreateInvoiceSubmit}
                className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Issue New Invoice Ledger</h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingInvoice(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Student choice */}
                  <div>
                    <label className="block text-slate-500 mb-1">Select Enrolled Student</label>
                    <select
                      value={newInvoiceData.studentId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const defaultFee = getStudentDefaultFee(selectedId);
                        setNewInvoiceData({
                          ...newInvoiceData,
                          studentId: selectedId,
                          amount: defaultFee,
                        });
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id}) - {s.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-slate-500 mb-1">Academic Month</label>
                    <input
                      type="text"
                      required
                      value={newInvoiceData.month}
                      onChange={(e) => setNewInvoiceData({ ...newInvoiceData, month: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  {/* Amount, Fine, Discount */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">Fee Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        value={newInvoiceData.amount}
                        onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Overdue Fine (Rs.)</label>
                      <input
                        type="number"
                        value={newInvoiceData.fine}
                        onChange={(e) => setNewInvoiceData({ ...newInvoiceData, fine: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Discount (Rs.)</label>
                      <input
                        type="number"
                        value={newInvoiceData.discount}
                        onChange={(e) => setNewInvoiceData({ ...newInvoiceData, discount: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreatingInvoice(false)}
                    className="bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
                  >
                    Issue Invoice Ledger
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table list */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3.5">Invoice Code</th>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Academic Month</th>
                    <th className="p-3.5 text-right">Total Fee Due</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-semibold text-slate-800">{inv.invoiceNo}</td>
                      <td className="p-3.5">
                        <span className="block font-bold text-slate-800">{inv.studentName}</span>
                        <span className="text-[10px] text-slate-400">ID: {inv.studentId} | {inv.className}</span>
                      </td>
                      <td className="p-3.5 text-right font-semibold text-slate-600">{inv.month}</td>
                      <td className="p-3.5 text-right font-bold text-slate-800">Rs. {inv.total}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                            inv.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {inv.status === "Paid" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        {inv.status === "Pending" ? (
                          <button
                            onClick={() => setPayingInvoice(inv)}
                            className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-1 px-2.5 rounded-md"
                          >
                            Collect Fee
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewReceipt(inv)}
                            className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1 px-2.5 rounded-md flex items-center gap-1 inline-flex"
                          >
                            <Printer className="w-3 h-3" /> View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Record payment modal */}
          {payingInvoice && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <form
                onSubmit={handleRecordPaymentSubmit}
                className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4"
              >
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Record Fee Collection
                </h3>
                <div className="text-xs space-y-2.5">
                  <p className="text-slate-500">
                    Recording collection payment for invoice: <strong>{payingInvoice.invoiceNo}</strong> ({payingInvoice.studentName}).
                  </p>
                  <p className="font-bold text-slate-800">Total Settlement Due: Rs. {payingInvoice.total}</p>

                  <div>
                    <label className="block text-slate-500 mb-1">Choose Payment Channel</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                    >
                      <option value="Cash">Cash payment</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    className="bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold"
                  >
                    Record Settlement
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Class Fee Structures */}
      {activeSubTab === "structures" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Class-wise Fee Rate Management / فیسوں کے ریٹ
              </h4>
              <p className="text-[10px] text-slate-400">Configure standard fee structures for automatic student bill generation.</p>
            </div>
            <button
              onClick={handleCreateStructureClick}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Class Structure
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="structures-grid">
            {feeStructures.map((f) => (
              <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-800 text-sm">{f.className}</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                      Standard Structure
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs pt-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Monthly Tuition:</span>
                      <span className="font-bold text-slate-800">Rs. {f.monthlyFee} / mo</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Admission Fee:</span>
                      <span className="font-semibold text-slate-800">Rs. {f.admissionFee} (One-time)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Examination Fee:</span>
                      <span className="font-semibold text-slate-800">Rs. {f.examFee} / exam</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleEditStructure(f)}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit / فیس بدلیں
                  </button>
                  <button
                    onClick={() => handleDeleteStructure(f.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Create Fee Structure Modal */}
      {(editingStructure || isCreatingStructure) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveStructureSubmit}
            className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {editingStructure ? `Edit Fee Structure` : "New Class Fee Structure"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingStructure(null);
                  setIsCreatingStructure(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Class Name / کلاس کا نام *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 9, Class 10, 1st Year"
                  value={structureFormData.className}
                  onChange={(e) => setStructureFormData({ ...structureFormData, className: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Monthly Tuition Fee (Rs.) / ماہانہ فیس *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={structureFormData.monthlyFee}
                  onChange={(e) => setStructureFormData({ ...structureFormData, monthlyFee: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Admission Fee (Rs.) / داخلہ فیس</label>
                <input
                  type="number"
                  min="0"
                  value={structureFormData.admissionFee}
                  onChange={(e) => setStructureFormData({ ...structureFormData, admissionFee: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Examination Fee (Rs.) / امتحانی فیس</label>
                <input
                  type="number"
                  min="0"
                  value={structureFormData.examFee}
                  onChange={(e) => setStructureFormData({ ...structureFormData, examFee: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEditingStructure(null);
                  setIsCreatingStructure(false);
                }}
                className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
              >
                Save / محفوظ کریں
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: Overdue Fee Reminders */}
      {activeSubTab === "reminders" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Overdue Outstanding Fee Reminder Center</h4>
              <p className="text-xs text-slate-500">Dispatch SMS notifications and alerts instantly to parents with pending dues.</p>
            </div>
            <button
              onClick={handleBroadcastReminders}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg flex items-center gap-1.5 shrink-0"
            >
              <Bell className="w-4 h-4 animate-bounce" /> Broadcast Overdue Reminders
            </button>
          </div>

          <div className="space-y-2.5">
            {invoices.filter((inv) => inv.status === "Pending").map((inv) => (
              <div key={inv.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-800">{inv.studentName}</h5>
                  <p className="text-[10px] text-slate-400">ID: {inv.studentId} | Class: {inv.className} | Dues: Rs. {inv.total}</p>
                </div>
                <button
                  onClick={() => {
                    alert(`Direct cellular alert dispatched successfully to ${inv.studentName}'s parent!`);
                  }}
                  className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 py-1 px-2.5 rounded-lg hover:bg-blue-100 transition"
                >
                  Dispatch Alert 📱
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

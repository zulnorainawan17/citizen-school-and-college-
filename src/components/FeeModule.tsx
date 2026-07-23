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
  Calendar,
  FileText,
} from "lucide-react";
import { Student, FeeInvoice, FeeStructure, GRADE_LEVELS, SchoolConfig } from "../types";

interface FeeModuleProps {
  students: Student[];
  invoices: FeeInvoice[];
  setInvoices: React.Dispatch<React.SetStateAction<FeeInvoice[]>>;
  feeStructures: FeeStructure[];
  setFeeStructures?: React.Dispatch<React.SetStateAction<FeeStructure[]>>;
  schoolConfig?: SchoolConfig;
}

export function FeeModule({
  students,
  invoices,
  setInvoices,
  feeStructures,
  setFeeStructures,
  schoolConfig,
}: FeeModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "structures" | "reminders" | "admission_voucher" | "class_ledger">("invoices");
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<FeeInvoice | null>(null);
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);

  // Class Fee Ledger States
  const [ledgerClass, setLedgerClass] = useState<string>("Class 10");
  const [ledgerMonthName, setLedgerMonthName] = useState<string>("August");
  const [ledgerYear, setLedgerYear] = useState<string>("2026");

  // Admission Voucher States
  const [admissionVouchers, setAdmissionVouchers] = useState<Array<{
    id: string;
    voucherNo: string;
    studentName: string;
    fatherName: string;
    className: string;
    admissionFee: number;
    tuitionFee: number;
    securityDeposit: number;
    prospectusFee: number;
    total: number;
    dueDate: string;
    status: "Pending" | "Paid";
    issueDate: string;
  }>>([
    {
      id: "AV_1",
      voucherNo: "ADV-2026-0001",
      studentName: "Muhammad Ali Awan",
      fatherName: "Zulqarnain Awan",
      className: "Class 10",
      admissionFee: 1500,
      tuitionFee: 800,
      securityDeposit: 1000,
      prospectusFee: 500,
      total: 3800,
      dueDate: "2026-08-10",
      status: "Pending",
      issueDate: "2026-07-21"
    },
    {
      id: "AV_2",
      voucherNo: "ADV-2026-0002",
      studentName: "Amna Imran",
      fatherName: "Imran Khan",
      className: "Class 9",
      admissionFee: 1500,
      tuitionFee: 750,
      securityDeposit: 1000,
      prospectusFee: 500,
      total: 3750,
      dueDate: "2026-08-10",
      status: "Paid",
      issueDate: "2026-07-20"
    }
  ]);

  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [isViewingVoucherDetail, setIsViewingVoucherDetail] = useState(false);
  const [isCreatingVoucher, setIsCreatingVoucher] = useState(false);
  const [customVoucherSchoolName, setCustomVoucherSchoolName] = useState<string>("");
  const [voucherFormData, setVoucherFormData] = useState({
    studentName: "",
    fatherName: "",
    className: "Class 10",
    admissionFee: 1500,
    tuitionFee: 800,
    securityDeposit: 1000,
    prospectusFee: 500,
    dueDate: "2026-08-10",
  });

  // Admission Voucher Event Handlers
  const handleClassChangeInVoucherForm = (selectedClass: string) => {
    const structure = feeStructures.find((f) => f.className === selectedClass);
    setVoucherFormData((prev) => ({
      ...prev,
      className: selectedClass,
      admissionFee: structure ? structure.admissionFee : 1500,
      tuitionFee: structure ? structure.monthlyFee : 800,
    }));
  };

  const handleCreateVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(voucherFormData.admissionFee) +
                  Number(voucherFormData.tuitionFee) +
                  Number(voucherFormData.securityDeposit) +
                  Number(voucherFormData.prospectusFee);

    const voucherNo = `ADV-2026-${String(admissionVouchers.length + 1001).padStart(4, "0")}`;

    const newVoucher = {
      id: `AV_${Date.now()}`,
      voucherNo,
      studentName: voucherFormData.studentName,
      fatherName: voucherFormData.fatherName,
      className: voucherFormData.className,
      admissionFee: Number(voucherFormData.admissionFee),
      tuitionFee: Number(voucherFormData.tuitionFee),
      securityDeposit: Number(voucherFormData.securityDeposit),
      prospectusFee: Number(voucherFormData.prospectusFee),
      total,
      dueDate: voucherFormData.dueDate,
      status: "Pending" as const,
      issueDate: new Date().toISOString().split("T")[0]
    };

    setAdmissionVouchers([newVoucher, ...admissionVouchers]);
    alert(`Admission fee voucher generated successfully! Voucher No: ${voucherNo}`);
    setIsCreatingVoucher(false);
  };

  const handleCollectVoucherPayment = (id: string) => {
    if (confirm("Are you sure you want to mark this admission voucher as PAID?")) {
      setAdmissionVouchers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: "Paid" as const } : v))
      );
    }
  };

  const handleDeleteVoucher = (id: string) => {
    if (confirm("Are you sure you want to delete this admission voucher?")) {
      setAdmissionVouchers((prev) => prev.filter((v) => v.id !== id));
    }
  };

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

  const handleDeleteInvoice = (invoice: FeeInvoice) => {
    setDeletingInvoice(invoice);
  };

  const handleConfirmDeleteInvoice = () => {
    if (deletingInvoice) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== deletingInvoice.id));
      if (selectedInvoice?.id === deletingInvoice.id) {
        setSelectedInvoice(null);
        setIsViewingReceipt(false);
      }
      setDeletingInvoice(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Class-wise Fee Ledger Logic
  const MONTHS_LIST = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const YEARS_LIST = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  const ledgerMonth = `${ledgerMonthName} ${ledgerYear}`;
  const availableClasses = GRADE_LEVELS;

  // 1. Filter students of selected ledgerClass
  const classStudents = students.filter((s) => s.class === ledgerClass && s.status === "Active");

  // 2. Map classStudents to match status for selected ledgerMonth
  const ledgerReportData = classStudents.map((stu) => {
    // Find if there is an invoice for this student and this month
    const matchingInvoice = invoices.find(
      (inv) => inv.studentId === stu.id && inv.month === ledgerMonth
    );

    const defaultFee = getStudentDefaultFee(stu.id);

    return {
      studentId: stu.id,
      rollNo: stu.rollNo || stu.admissionNo || "N/A",
      name: stu.name,
      guardianName: stu.guardianName,
      monthlyFee: defaultFee,
      invoice: matchingInvoice,
      isPaid: matchingInvoice ? matchingInvoice.status === "Paid" : false,
      amount: matchingInvoice ? matchingInvoice.total : defaultFee,
      invoiceNo: matchingInvoice ? matchingInvoice.invoiceNo : "N/A",
      paymentDate: matchingInvoice?.paymentDate || "",
      paymentMethod: matchingInvoice?.paymentMethod || "",
      receiptNo: matchingInvoice?.receiptNo || "",
    };
  });

  // Calculate stats for the class ledger
  const totalStudentsInLedger = ledgerReportData.length;
  const paidStudentsInLedger = ledgerReportData.filter((item) => item.isPaid).length;
  const unpaidStudentsInLedger = totalStudentsInLedger - paidStudentsInLedger;

  const totalFeeCollected = ledgerReportData
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalOutstandingDues = ledgerReportData
    .filter((item) => !item.isPaid)
    .reduce((sum, item) => sum + item.monthlyFee, 0);

  // Function to print Date Sheet beautifully and save as PDF
  const printLedgerReport = () => {
    const area = document.getElementById("printable-class-ledger-area");
    if (!area) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const areaClone = area.cloneNode(true) as HTMLElement;

    // Remove no-print elements
    const noPrintElements = areaClone.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => el.remove());

    const contentHtml = areaClone.innerHTML;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Class Fee Ledger Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 1.2cm 1.4cm;
          }
          
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          #printable-class-ledger-area {
            width: 100% !important;
          }

          .text-center { text-align: center !important; }
          .uppercase { text-transform: uppercase !important; }
          .font-bold { font-weight: 700 !important; }
          
          h1 {
            font-size: 22px !important;
            font-weight: 800 !important;
            margin: 0 0 4px 0 !important;
            color: #0f172a !important;
          }
          
          p {
            margin: 2px 0 !important;
            font-size: 11px !important;
            color: #475569 !important;
          }

          .bg-slate-900 {
            background-color: #0f172a !important;
            color: #ffffff !important;
            padding: 4px 14px !important;
            border-radius: 9999px !important;
            font-weight: 700 !important;
            font-size: 9px !important;
            text-transform: uppercase !important;
            display: inline-block !important;
            margin-top: 5px !important;
          }

          /* Summary Box Container */
          .stats-grid {
            display: table !important;
            width: 100% !important;
            margin-top: 15px !important;
            margin-bottom: 15px !important;
          }

          .stats-row {
            display: table-row !important;
          }

          .stats-cell {
            display: table-cell !important;
            width: 20% !important;
            padding: 8px !important;
            border: 1px solid #e2e8f0 !important;
            background-color: #f8fafc !important;
            text-align: center !important;
          }

          .stats-label {
            font-size: 8px !important;
            color: #64748b !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
          }

          .stats-val {
            font-size: 13px !important;
            color: #0f172a !important;
            font-weight: 800 !important;
            margin-top: 2px !important;
          }

          /* Table Styles */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-top: 15px !important;
            border: 1px solid #94a3b8 !important;
          }

          th {
            background-color: #f1f5f9 !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            border: 1px solid #94a3b8 !important;
            padding: 8px 10px !important;
          }

          td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px 10px !important;
            font-size: 11px !important;
            vertical-align: middle !important;
          }

          .status-paid {
            color: #166534 !important;
            background-color: #f0fdf4 !important;
            font-weight: 700 !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            display: inline-block !important;
            border: 1px solid #bbf7d0 !important;
          }

          .status-unpaid {
            color: #991b1b !important;
            background-color: #fef2f2 !important;
            font-weight: 700 !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            display: inline-block !important;
            border: 1px solid #fecaca !important;
          }

          /* Signatures */
          .signature-section {
            display: table !important;
            width: 100% !important;
            margin-top: 35px !important;
          }

          .signature-box {
            display: table-cell !important;
            width: 33.3% !important;
            text-align: center !important;
            vertical-align: bottom !important;
          }

          .signature-line {
            border-bottom: 1px solid #475569 !important;
            margin: 30px auto 4px auto !important;
            width: 120px !important;
          }

          .signature-text {
            font-size: 10px !important;
            color: #475569 !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }

          tr, p, h1, div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div id="printable-class-ledger-area">
          ${contentHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Function to export Date Sheet to Microsoft Word (.doc) format
  const exportLedgerToWord = () => {
    const area = document.getElementById("printable-class-ledger-area");
    if (!area) return;

    // Clone the node to avoid modifying the real DOM
    const areaClone = area.cloneNode(true) as HTMLElement;
    
    // Remove any elements marked with 'no-print'
    const noPrintElements = areaClone.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => el.remove());

    const contentHtml = areaClone.innerHTML;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Class Fee Ledger Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px; }
          .text-center { text-align: center; }
          .uppercase { text-transform: uppercase; }
          h1 { font-size: 24px; font-weight: bold; margin-bottom: 2px; color: #0f172a; text-align: center; }
          p { margin: 4px 0; font-size: 13px; color: #475569; text-align: center; }
          .bg-slate-900 { background-color: #0f172a; color: #ffffff; padding: 4px 16px; border-radius: 9999px; font-weight: bold; font-size: 11px; display: inline-block; }
          
          /* Stats Grid */
          .stats-grid { display: table; width: 100%; margin-top: 15px; margin-bottom: 15px; border-collapse: collapse; }
          .stats-cell { display: table-cell; width: 20%; padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; text-align: center; }
          .stats-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .stats-val { font-size: 14px; color: #0f172a; font-weight: 800; margin-top: 2px; }

          /* Table Styles */
          table { border-collapse: collapse; width: 100%; margin-top: 20px; border: 2px solid #94a3b8; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; text-transform: uppercase; }
          .status-paid { color: #15803d; font-weight: bold; background-color: #f0fdf4; padding: 2px 6px; border-radius: 4px; display: inline-block; }
          .status-unpaid { color: #b91c1c; font-weight: bold; background-color: #fef2f2; padding: 2px 6px; border-radius: 4px; display: inline-block; }
          
          /* Signatures */
          .signature-section { display: table; width: 100%; margin-top: 40px; }
          .signature-box { display: table-cell; width: 33%; text-align: center; padding-top: 40px; }
          .signature-line { width: 120px; border-bottom: 1px solid #475569; margin: 0 auto 5px auto; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Fee_Ledger_${ledgerClass.replace(/\s+/g, "_")}_${ledgerMonth.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="fee-module-root">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
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
            setActiveSubTab("admission_voucher");
            setIsViewingReceipt(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "admission_voucher" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          New Admission Vouchers
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
        <button
          onClick={() => {
            setActiveSubTab("class_ledger");
            setIsViewingReceipt(false);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "class_ledger" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Class-wise Fee Ledger Report
        </button>
      </div>

      {/* VIEW: Receipts Detail Mode */}
      {isViewingReceipt && selectedInvoice && (
        <div className="space-y-6">
          {/* Print Styles for Monthly Fee Invoice */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-voucher-zone, #printable-voucher-zone * {
                visibility: visible !important;
              }
              #printable-voucher-zone {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 15px !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Monthly Fee Voucher Print Preview
              </h4>
              <p className="text-[10px] text-slate-400">
                Verify the 3-part bank deposit voucher below. Customize school name if needed and print.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={customVoucherSchoolName || schoolConfig?.schoolName || "Citizen School and College"}
                onChange={(e) => setCustomVoucherSchoolName(e.target.value)}
                placeholder="School Name"
                className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
              />
              <button
                onClick={() => window.print()}
                className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
              >
                <Printer className="w-4 h-4" /> Print 3-Part Voucher
              </button>
              <button
                onClick={() => handleDeleteInvoice(selectedInvoice)}
                className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                title="Delete Fee Challan"
              >
                <Trash2 className="w-4 h-4" /> Delete Challan
              </button>
              <button
                onClick={() => {
                  setIsViewingReceipt(false);
                  setSelectedInvoice(null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 py-2 px-4 rounded-lg transition"
              >
                Back to Ledgers
              </button>
            </div>
          </div>

          {/* 3-Part Voucher Container */}
          <div
            id="printable-voucher-zone"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-2xl p-6 relative"
          >
            {/* Visual perforated dividers on screen preview */}
            <div className="hidden md:block absolute left-1/3 top-6 bottom-6 border-l-2 border-dashed border-slate-300 no-print pointer-events-none" />
            <div className="hidden md:block absolute left-2/3 top-6 bottom-6 border-l-2 border-dashed border-slate-300 no-print pointer-events-none" />

            {/* Copies generation loop */}
            {["BANK COPY", "SCHOOL COPY", "STUDENT COPY"].map((copyType, idx) => {
              return (
                <div key={idx} className="space-y-4 text-slate-800 text-[11px] p-2 flex flex-col justify-between">
                  {/* Top Copy Label */}
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-blue-700 tracking-wider uppercase text-[10px]">
                      {copyType}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 no-print">
                      Part {idx + 1}
                    </span>
                  </div>

                  {/* Header School Section */}
                  <div className="text-center space-y-1">
                    <h2 className="font-extrabold text-slate-900 uppercase text-xs">
                      {customVoucherSchoolName || schoolConfig?.schoolName || "Citizen School and College"}
                    </h2>
                    <p className="text-[8px] text-slate-500 tracking-wide font-medium">
                      MONTHLY TUITION FEE DEPOSIT SLIP
                    </p>
                    <div className="bg-slate-100 inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold text-slate-700 mt-1 uppercase">
                      ALLIED BANK LTD / NBP
                    </div>
                  </div>

                  {/* Voucher Metadata */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase">Voucher No</span>
                      <strong className="text-slate-800 font-bold text-[10px]">{selectedInvoice.receiptNo || `INV-${selectedInvoice.id}`}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase">Due Date</span>
                      <strong className="text-red-700 font-bold text-[10px]">{selectedInvoice.dueDate || "2026-08-10"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase">Month</span>
                      <strong className="text-slate-700 font-bold text-[10px]">{selectedInvoice.month}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase">Class</span>
                      <strong className="text-blue-700 font-bold">{selectedInvoice.className}</strong>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-1.5 border-y border-slate-200 py-2.5 font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student:</span>
                      <span className="text-slate-900 font-bold">{selectedInvoice.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student ID:</span>
                      <span className="text-slate-900 font-mono font-bold">{selectedInvoice.studentId}</span>
                    </div>
                  </div>

                  {/* Financial Particulars Breakdown */}
                  <div className="space-y-1.5">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      Fee Particulars
                    </span>
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <th className="p-1">Description</th>
                          <th className="p-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="p-1 text-slate-500">Monthly Tuition Fee</td>
                          <td className="p-1 text-right font-bold">Rs. {selectedInvoice.amount}</td>
                        </tr>
                        {selectedInvoice.fine > 0 && (
                          <tr>
                            <td className="p-1 text-red-600">Overdue Late Fine (+)</td>
                            <td className="p-1 text-right font-bold text-red-600">Rs. {selectedInvoice.fine}</td>
                          </tr>
                        )}
                        {selectedInvoice.discount > 0 && (
                          <tr>
                            <td className="p-1 text-emerald-600">Scholarship Discount (-)</td>
                            <td className="p-1 text-right font-bold text-emerald-600">-Rs. {selectedInvoice.discount}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-50 font-bold text-slate-900">
                          <td className="p-1.5 border-t border-slate-200 font-bold">Total Payable</td>
                          <td className="p-1.5 border-t border-slate-200 text-right text-xs font-extrabold text-blue-900">
                            Rs. {selectedInvoice.total}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stamp area / Watermark */}
                  {selectedInvoice.status === "Paid" ? (
                    <div className="border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-3 py-1.5 rounded-lg text-center uppercase tracking-widest my-2">
                      PAID
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 text-slate-400 font-bold text-[9px] p-2 rounded-lg text-center uppercase my-2">
                      BANK STAMP & SIGN
                    </div>
                  )}

                  {/* Bottom Copy Signatures */}
                  <div className="pt-6 grid grid-cols-2 gap-4 text-[9px] text-center text-slate-500">
                    <div className="space-y-8">
                      <div className="border-b border-slate-300" />
                      <span>Depositor</span>
                    </div>
                    <div className="space-y-8">
                      <div className="border-b border-slate-300" />
                      <span>Cashier / Manager</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                          <>
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-1 px-2.5 rounded-md"
                            >
                              Collect Fee
                            </button>
                            <button
                              onClick={() => handleViewReceipt(inv)}
                              className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1 px-2.5 rounded-md flex items-center gap-1 inline-flex"
                              title="View & Print Voucher"
                            >
                              <Printer className="w-3 h-3" /> View Voucher
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleViewReceipt(inv)}
                            className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1 px-2.5 rounded-md flex items-center gap-1 inline-flex"
                          >
                            <Printer className="w-3 h-3" /> View Receipt
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(inv)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md inline-flex items-center transition"
                          title="Delete Fee Challan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                Class-wise Fee Rate Management
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
                    <Edit className="w-3.5 h-3.5" /> Edit
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
                <label className="block text-slate-600 font-semibold mb-1">Class Name *</label>
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
                <label className="block text-slate-600 font-semibold mb-1">Monthly Tuition Fee (Rs.) *</label>
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
                <label className="block text-slate-600 font-semibold mb-1">Admission Fee (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={structureFormData.admissionFee}
                  onChange={(e) => setStructureFormData({ ...structureFormData, admissionFee: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Examination Fee (Rs.)</label>
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
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: New Admission Vouchers */}
      {activeSubTab === "admission_voucher" && (
        <div className="space-y-6">
          {/* Print Styles for Admission Voucher */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-voucher-zone, #printable-voucher-zone * {
                visibility: visible !important;
              }
              #printable-voucher-zone {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 15px !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          {/* If viewing a voucher detail in print-ready mode */}
          {isViewingVoucherDetail && selectedVoucher ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Admission Fee Voucher Print Preview
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Verify the 3-part bank deposit voucher below. Customize school name if needed and print.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={customVoucherSchoolName}
                    onChange={(e) => setCustomVoucherSchoolName(e.target.value)}
                    placeholder="School Name"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
                  />
                  <button
                    onClick={() => window.print()}
                    className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Printer className="w-4 h-4" /> Print 3-Part Voucher
                  </button>
                  <button
                    onClick={() => {
                      setIsViewingVoucherDetail(false);
                      setSelectedVoucher(null);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 py-2 px-4 rounded-lg transition"
                  >
                    Back to List
                  </button>
                </div>
              </div>

              {/* 3-Part Voucher Container */}
              <div
                id="printable-voucher-zone"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-2xl p-6 relative"
              >
                {/* Visual perforated dividers on screen preview */}
                <div className="hidden md:block absolute left-1/3 top-6 bottom-6 border-l-2 border-dashed border-slate-300 no-print pointer-events-none" />
                <div className="hidden md:block absolute left-2/3 top-6 bottom-6 border-l-2 border-dashed border-slate-300 no-print pointer-events-none" />

                {/* Copies generation loop */}
                {["BANK COPY", "SCHOOL COPY", "STUDENT COPY"].map((copyType, idx) => {
                  return (
                    <div key={idx} className="space-y-4 text-slate-800 text-[11px] p-2 flex flex-col justify-between">
                      {/* Top Copy Label */}
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-extrabold text-blue-700 tracking-wider uppercase text-[10px]">
                          {copyType}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 no-print">
                          Part {idx + 1}
                        </span>
                      </div>

                      {/* Header School Section */}
                      <div className="text-center space-y-1">
                        <h2 className="font-extrabold text-slate-900 uppercase text-xs">
                          {customVoucherSchoolName || schoolConfig?.schoolName || "Citizen School and College"}
                        </h2>
                        <p className="text-[8px] text-slate-500 tracking-wide font-medium">
                          NEW ADMISSION FEE DEPOSIT SLIP
                        </p>
                        <div className="bg-slate-100 inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold text-slate-700 mt-1 uppercase">
                          ALLIED BANK LTD / NBP
                        </div>
                      </div>

                      {/* Voucher Metadata */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                        <div>
                          <span className="text-slate-400 text-[8px] block uppercase">Voucher No</span>
                          <strong className="text-slate-800 font-bold text-[10px]">{selectedVoucher.voucherNo}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[8px] block uppercase">Due Date</span>
                          <strong className="text-red-700 font-bold text-[10px]">{selectedVoucher.dueDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[8px] block uppercase">Issue Date</span>
                          <span className="text-slate-700">{selectedVoucher.issueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[8px] block uppercase">Class</span>
                          <strong className="text-blue-700 font-bold">{selectedVoucher.className}</strong>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-1.5 border-y border-slate-200 py-2.5 font-semibold text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Student:</span>
                          <span className="text-slate-900 font-bold">{selectedVoucher.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Father:</span>
                          <span className="text-slate-900">{selectedVoucher.fatherName}</span>
                        </div>
                      </div>

                      {/* Financial Particulars Breakdown */}
                      <div className="space-y-1.5">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                          Fee Particulars
                        </span>
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                              <th className="p-1">Description</th>
                              <th className="p-1 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr>
                              <td className="p-1 text-slate-500">Admission Fee</td>
                              <td className="p-1 text-right font-bold">Rs. {selectedVoucher.admissionFee}</td>
                            </tr>
                            <tr>
                              <td className="p-1 text-slate-500">Monthly Tuition Fee</td>
                              <td className="p-1 text-right font-bold">Rs. {selectedVoucher.tuitionFee}</td>
                            </tr>
                            <tr>
                              <td className="p-1 text-slate-500">Security Fee (Refundable)</td>
                              <td className="p-1 text-right font-bold">Rs. {selectedVoucher.securityDeposit}</td>
                            </tr>
                            <tr>
                              <td className="p-1 text-slate-500">Prospectus & Registration</td>
                              <td className="p-1 text-right font-bold">Rs. {selectedVoucher.prospectusFee}</td>
                            </tr>
                            <tr className="bg-slate-50 font-bold text-slate-900">
                              <td className="p-1.5 border-t border-slate-200">Total Payable</td>
                              <td className="p-1.5 border-t border-slate-200 text-right text-xs font-extrabold text-blue-900">
                                Rs. {selectedVoucher.total}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Stamp area / Watermark */}
                      {selectedVoucher.status === "Paid" ? (
                        <div className="border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-3 py-1.5 rounded-lg text-center uppercase tracking-widest my-2">
                          PAID
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-300 text-slate-400 font-bold text-[9px] p-2 rounded-lg text-center uppercase my-2">
                          BANK STAMP & SIGN
                        </div>
                      )}

                      {/* Bottom Copy Signatures */}
                      <div className="pt-6 grid grid-cols-2 gap-4 text-[9px] text-center text-slate-500">
                        <div className="space-y-8">
                          <div className="border-b border-slate-300" />
                          <span>Depositor</span>
                        </div>
                        <div className="space-y-8">
                          <div className="border-b border-slate-300" />
                          <span>Cashier / Manager</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header section with Create button */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    New Admission Fee Vouchers
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Generate, track, and print multi-part professional bank deposit vouchers for newly admitted students.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCreatingVoucher(true);
                    setVoucherFormData({
                      studentName: "",
                      fatherName: "",
                      className: "Class 10",
                      admissionFee: 1500,
                      tuitionFee: 800,
                      securityDeposit: 1000,
                      prospectusFee: 500,
                      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    });
                  }}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Issue New Admission Voucher
                </button>
              </div>

              {/* Master Ledger List of Admission Vouchers */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="p-3.5">Voucher Code</th>
                        <th className="p-3.5">Student & Father Details</th>
                        <th className="p-3.5">Class</th>
                        <th className="p-3.5 text-right">Admission Fee</th>
                        <th className="p-3.5 text-right">Total Payable</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {admissionVouchers.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3.5 font-bold text-slate-800">{v.voucherNo}</td>
                          <td className="p-3.5">
                            <span className="block font-bold text-slate-800">{v.studentName}</span>
                            <span className="text-[10px] text-slate-400">Father: {v.fatherName}</span>
                          </td>
                          <td className="p-3.5 font-bold">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px]">
                              {v.className}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-semibold text-slate-600">Rs. {v.admissionFee}</td>
                          <td className="p-3.5 text-right font-extrabold text-blue-900">Rs. {v.total}</td>
                          <td className="p-3.5 font-medium text-slate-600">{v.dueDate}</td>
                          <td className="p-3.5">
                            <span
                              className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                                v.status === "Paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {v.status === "Paid" ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {v.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedVoucher(v);
                                  setIsViewingVoucherDetail(true);
                                }}
                                className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1"
                                title="Print 3-Part Voucher"
                              >
                                <Printer className="w-3.5 h-3.5" /> View & Print
                              </button>
                              {v.status === "Pending" && (
                                <button
                                  onClick={() => handleCollectVoucherPayment(v.id)}
                                  className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3 rounded-lg"
                                >
                                  Collect Payment
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteVoucher(v.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {admissionVouchers.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center p-8 text-slate-400 italic">
                            No admission vouchers generated. Click "Issue New Admission Voucher" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Admission Voucher Creation Modal Form */}
      {isCreatingVoucher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateVoucherSubmit}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Generate Admission Fee Voucher
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingVoucher(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick pre-fill template selector from enrolled students */}
            <div className="text-xs bg-blue-50 border border-blue-100 p-2.5 rounded-lg space-y-1">
              <label className="block text-blue-700 font-bold">Optional: Auto-fill from Enrolled Students</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const s = students.find((item) => item.id === val);
                  if (s) {
                    const structure = feeStructures.find((f) => f.className === s.class);
                    setVoucherFormData({
                      studentName: s.name,
                      fatherName: s.guardianName || "",
                      className: s.class,
                      admissionFee: structure ? structure.admissionFee : 1500,
                      tuitionFee: structure ? structure.monthlyFee : 800,
                      securityDeposit: 1000,
                      prospectusFee: 500,
                      dueDate: voucherFormData.dueDate
                    });
                  }
                }}
                className="w-full border border-blue-200 rounded-md p-1.5 bg-white text-[10px] text-slate-800 focus:outline-hidden"
              >
                <option value="">-- Choose student to auto-fill --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Ahmed"
                    value={voucherFormData.studentName}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, studentName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Raza"
                    value={voucherFormData.fatherName}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, fatherName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Class *</label>
                  <select
                    value={voucherFormData.className}
                    onChange={(e) => handleClassChangeInVoucherForm(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden font-semibold"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={voucherFormData.dueDate}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, dueDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Fee Breakdown Config */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Customize Voucher Pricing Components (Rs.)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Admission Fee</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={voucherFormData.admissionFee}
                      onChange={(e) => setVoucherFormData({ ...voucherFormData, admissionFee: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg p-1.5 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Monthly Tuition Fee</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={voucherFormData.tuitionFee}
                      onChange={(e) => setVoucherFormData({ ...voucherFormData, tuitionFee: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg p-1.5 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Security Fee (Refundable)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={voucherFormData.securityDeposit}
                      onChange={(e) => setVoucherFormData({ ...voucherFormData, securityDeposit: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Prospectus & Reg Fee</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={voucherFormData.prospectusFee}
                      onChange={(e) => setVoucherFormData({ ...voucherFormData, prospectusFee: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg p-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => setIsCreatingVoucher(false)}
                className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
              >
                Generate Voucher
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

      {/* VIEW: Class-wise Fee Ledger */}
      {activeSubTab === "class_ledger" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Class
                </label>
                <select
                  value={ledgerClass}
                  onChange={(e) => setLedgerClass(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-32"
                >
                  {availableClasses.map((cl) => (
                    <option key={cl} value={cl}>
                      {cl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Month
                </label>
                <select
                  value={ledgerMonthName}
                  onChange={(e) => setLedgerMonthName(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-32"
                >
                  {MONTHS_LIST.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Year
                </label>
                <select
                  value={ledgerYear}
                  onChange={(e) => setLedgerYear(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-24"
                >
                  {YEARS_LIST.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={printLedgerReport}
                className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                title="Print the Class Fee Ledger or Save as PDF"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={exportLedgerToWord}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                title="Download the Class Fee Ledger as MS Word File (.doc)"
              >
                <FileText className="w-4 h-4" /> Download Word File (.doc)
              </button>
            </div>
          </div>

          {/* Printable Report Card Area */}
          <div
            id="printable-class-ledger-area"
            className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-4xl mx-auto"
          >
            {/* School Logo & Title Block */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800 relative">
              <h1 className="text-xl md:text-2xl font-black tracking-wide text-slate-900 uppercase">
                {schoolConfig?.schoolName || "Citizen School"}
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {schoolConfig?.address || "Main Campus, Govt. Registered"}
              </p>
              <p className="text-[10px] text-slate-400">
                Email: {schoolConfig?.email || "admin@school.edu"} | Phone: {schoolConfig?.phone || "0300-1234567"}
              </p>
              <div className="inline-block mt-2 bg-slate-900 text-white font-sans font-extrabold text-[10px] py-0.5 px-4 rounded-full uppercase tracking-widest">
                Class Fee Ledger Report
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Class</span>
                <strong className="text-xs text-slate-800 font-bold">{ledgerClass}</strong>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Fee Month</span>
                <strong className="text-xs text-slate-800 font-bold">{ledgerMonth}</strong>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Report Date</span>
                <strong className="text-xs text-slate-800 font-bold">{new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Status</span>
                <strong className="text-xs text-slate-800 font-bold uppercase text-emerald-700">Official Report</strong>
              </div>
            </div>

            {/* Summary Statistics row */}
            <div className="stats-grid grid grid-cols-5 gap-2 text-center">
              <div className="stats-cell bg-slate-50/50 p-2 border border-slate-200 rounded-lg">
                <div className="stats-label text-[8px] text-slate-500 uppercase tracking-wider font-bold">Students</div>
                <div className="stats-val text-sm font-black text-slate-900">{totalStudentsInLedger}</div>
              </div>
              <div className="stats-cell bg-emerald-50/50 p-2 border border-emerald-100 rounded-lg">
                <div className="stats-label text-[8px] text-emerald-600 uppercase tracking-wider font-bold">Paid</div>
                <div className="stats-val text-sm font-black text-emerald-700">{paidStudentsInLedger}</div>
              </div>
              <div className="stats-cell bg-rose-50/50 p-2 border border-rose-100 rounded-lg">
                <div className="stats-label text-[8px] text-rose-600 uppercase tracking-wider font-bold">Unpaid</div>
                <div className="stats-val text-sm font-black text-rose-700">{unpaidStudentsInLedger}</div>
              </div>
              <div className="stats-cell bg-blue-50/50 p-2 border border-blue-100 rounded-lg">
                <div className="stats-label text-[8px] text-blue-600 uppercase tracking-wider font-bold">Collected</div>
                <div className="stats-val text-sm font-black text-blue-800 font-mono">Rs. {totalFeeCollected}</div>
              </div>
              <div className="stats-cell bg-amber-50/50 p-2 border border-amber-100 rounded-lg">
                <div className="stats-label text-[8px] text-amber-600 uppercase tracking-wider font-bold">Outstanding</div>
                <div className="stats-val text-sm font-black text-amber-800 font-mono">Rs. {totalOutstandingDues}</div>
              </div>
            </div>

            {/* Students Table */}
            {ledgerReportData.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">No active students found in {ledgerClass}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300 min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 text-center w-12 font-extrabold">Sr.</th>
                      <th className="p-2 border-r border-slate-300 w-24 font-extrabold">Roll No.</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Student Name</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold">Father Name</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24 font-extrabold">Monthly Fee</th>
                      <th className="p-2 border-r border-slate-300 text-center w-28 font-extrabold">Status</th>
                      <th className="p-2 border-r border-slate-300 font-extrabold no-print">Receipt / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerReportData.map((item, index) => (
                      <tr key={item.studentId} className="hover:bg-slate-50/50 border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-semibold text-slate-600">
                          {item.rollNo}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                          {item.name}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-700">
                          {item.guardianName}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right font-bold text-slate-850 font-mono">
                          Rs. {item.monthlyFee}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          {item.isPaid ? (
                            <span className="status-paid bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-block">
                              ✓ PAID
                            </span>
                          ) : (
                            <span className="status-unpaid bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-block">
                              ✗ UNPAID
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-500 font-medium no-print">
                          {item.isPaid ? (
                            <div className="text-[10px]">
                              <div className="text-slate-800 font-bold">{item.receiptNo}</div>
                              <div>{item.paymentDate} via {item.paymentMethod}</div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-rose-500 font-bold">Unpaid</span>
                              <button
                                onClick={() => {
                                  if (item.invoice) {
                                    setPayingInvoice(item.invoice);
                                  } else {
                                    const tempInvoice: FeeInvoice = {
                                      id: `INV_${Date.now()}`,
                                      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                                      studentId: item.studentId,
                                      studentName: item.name,
                                      className: ledgerClass,
                                      month: ledgerMonth,
                                      amount: item.monthlyFee,
                                      discount: 0,
                                      fine: 0,
                                      total: item.monthlyFee,
                                      status: "Pending"
                                    };
                                    setInvoices((prev) => [tempInvoice, ...prev]);
                                    setPayingInvoice(tempInvoice);
                                  }
                                }}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 text-[9px] font-extrabold uppercase transition shrink-0"
                              >
                                Collect Fee
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Official Signature Lines */}
            <div className="signature-section pt-8 flex justify-between items-center text-center mt-12">
              <div className="signature-box w-1/3">
                <div className="signature-line border-b border-slate-400 w-32 mx-auto mb-1"></div>
                <span className="signature-text text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Class Teacher</span>
              </div>
              <div className="signature-box w-1/3">
                <div className="signature-line border-b border-slate-400 w-32 mx-auto mb-1"></div>
                <span className="signature-text text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Accounts Officer</span>
              </div>
              <div className="signature-box w-1/3">
                <div className="signature-line border-b border-slate-400 w-32 mx-auto mb-1"></div>
                <span className="signature-text text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Principal</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Fee Challan Confirmation Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Fee Challan</h3>
                <p className="text-xs text-slate-500">This fee invoice record will be permanently deleted</p>
              </div>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <p><strong>Invoice Code:</strong> {deletingInvoice.invoiceNo}</p>
              <p><strong>Student:</strong> {deletingInvoice.studentName} ({deletingInvoice.studentId})</p>
              <p><strong>Academic Month:</strong> {deletingInvoice.month}</p>
              <p><strong>Total Amount:</strong> Rs. {deletingInvoice.total} ({deletingInvoice.status})</p>
            </div>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteInvoice}
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

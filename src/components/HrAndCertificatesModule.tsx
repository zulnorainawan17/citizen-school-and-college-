import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Printer,
  FileCheck,
  UserCheck,
  Award,
  BookOpen,
} from "lucide-react";
import { Teacher, Staff, LeaveRequest, Payslip } from "../types";

interface HrAndCertificatesModuleProps {
  teachers: Teacher[];
  staff: Staff[];
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  payroll: Payslip[];
  setPayroll: React.Dispatch<React.SetStateAction<Payslip[]>>;
  initialSubTab?: "payroll" | "leaves" | "certificates";
}

export function HrAndCertificatesModule({
  teachers,
  staff,
  leaveRequests,
  setLeaveRequests,
  payroll,
  setPayroll,
  initialSubTab,
}: HrAndCertificatesModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"payroll" | "leaves" | "certificates">("payroll");

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Certificate generator states
  const [certType, setCertType] = useState<"Character" | "Leaving" | "Admission">("Character");
  const [certStudentName, setCertStudentName] = useState("");
  const [certFatherName, setCertFatherName] = useState("");
  const [certClass, setCertClass] = useState("Grade 10");
  const [certRollNo, setCertRollNo] = useState("");
  const [isViewingCertificate, setIsViewingCertificate] = useState(false);

  // Payslip states
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Handle leave approval
  const handleLeaveStatusChange = (requestId: string, status: "Approved" | "Rejected") => {
    const updated = leaveRequests.map((req) => (req.id === requestId ? { ...req, status } : req));
    setLeaveRequests(updated);
    alert(`Leave request status marked as ${status}.`);
  };

  // Issue monthly payroll payout
  const handleProcessPayroll = () => {
    alert("Executing direct deposits... Bank transmission verified! Salary paychecks dispatched successfully.");
  };

  return (
    <div className="space-y-6" id="hr-certificates-root">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab("payroll");
            setIsViewingCertificate(false);
            setSelectedPayslip(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "payroll" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Staff Payroll & PaySlips
        </button>
        <button
          onClick={() => {
            setActiveSubTab("leaves");
            setIsViewingCertificate(false);
            setSelectedPayslip(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "leaves" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Leave Management
        </button>
        <button
          onClick={() => {
            setActiveSubTab("certificates");
            setIsViewingCertificate(false);
            setSelectedPayslip(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "certificates" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Institutional Certificates
        </button>
      </div>

      {/* VIEW: Payslip Detailed Modal */}
      {selectedPayslip && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 max-w-xl mx-auto" id="printable-payslip-view">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Official Staff Paycheck Slip
            </h4>
            <button
              onClick={() => setSelectedPayslip(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              Back to Payroll
            </button>
          </div>

          {/* Payslip sheet */}
          <div className="border border-slate-300 rounded-xl p-5 space-y-4 text-xs bg-slate-50/50" id="payslip-frame">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase">Citizen School and College</h3>
                <p className="text-[9px] text-slate-400">Institutional Treasury Department</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700">Slip ID:</span>
                <span className="block text-[10px] font-mono text-slate-800">{selectedPayslip.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-[11px]">
              <div>
                <span className="text-slate-500">Employee Name:</span>
                <h5 className="font-bold text-slate-800">{selectedPayslip.employeeName}</h5>
              </div>
              <div>
                <span className="text-slate-500">Academic Month:</span>
                <h5 className="font-bold text-slate-800">{selectedPayslip.month}</h5>
              </div>
              <div>
                <span className="text-slate-500">Designation / Role:</span>
                <h5 className="font-bold text-slate-800 uppercase text-[9px] bg-slate-200/60 px-2 py-0.5 rounded-md w-fit">
                  {selectedPayslip.role}
                </h5>
              </div>
              <div>
                <span className="text-slate-500">Salary Status:</span>
                <span className="font-bold text-emerald-600">Disbursed ✔</span>
              </div>
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-2 bg-white p-3 border border-slate-200 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Monthly Payout:</span>
                <span className="font-semibold">Rs. {selectedPayslip.basicSalary}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Bonuses / Incentives (+):</span>
                <span>+Rs. {selectedPayslip.allowances}</span>
              </div>
              <div className="flex justify-between text-red-700 font-medium">
                <span>Tax Deductions / Leaves (-):</span>
                <span>-Rs. {selectedPayslip.deductions}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-slate-900 text-sm">
                <span>Net Deposited Salary:</span>
                <span>Rs. {selectedPayslip.netSalary}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2.5 px-6 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Pay Slip
            </button>
          </div>
        </div>
      )}

      {/* VIEW: Certificate Display Mode */}
      {isViewingCertificate && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 max-w-2xl mx-auto" id="printable-certificate-view">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Official Printable Certificate Preview
            </h4>
            <button
              onClick={() => setIsViewingCertificate(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-lg"
            >
              Back to Design Panel
            </button>
          </div>

          {/* Certificate Frame with elegant double border */}
          <div
            id="certificate-frame"
            className="border-[12px] border-double border-slate-800 p-8 space-y-6 text-center relative bg-amber-50/10 min-h-[460px] flex flex-col justify-between font-serif"
          >
            {/* Top insignia */}
            <div className="space-y-1">
              <Award className="w-10 h-10 text-amber-600 mx-auto animate-pulse" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800">
                Citizen School and College
              </h2>
              <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-sans">
                Consolidated Academic Registrars Office
              </span>
            </div>

            {/* Core message */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-700 italic font-serif">
                {certType === "Character" && "Certificate of Character"}
                {certType === "Leaving" && "School Leaving Transfer Certificate"}
                {certType === "Admission" && "Official Letter of Admission"}
              </h3>

              <div className="text-xs text-slate-600 leading-relaxed font-sans max-w-md mx-auto space-y-3">
                <p>
                  This is officially to verify and declare that <strong>{certStudentName || "AISHA REHMAN"}</strong>,{" "}
                  child of <strong>{certFatherName || "MUHAMMAD REHMAN"}</strong>, was a bona fide student of this institution,
                  studying in <strong>{certClass}</strong> {certRollNo && `under Roll Number #${certRollNo}`}.
                </p>

                {certType === "Character" && (
                  <p>
                    During her tenure at this school, she displayed exemplary discipline, moral character, and dedication to
                    extracurricular academics. We wish her every success in her upcoming professional life.
                  </p>
                )}

                {certType === "Leaving" && (
                  <p>
                    All outstanding dues, fees, and institution levies have been successfully settled. Her enrollment is officially
                    withdrawn, and her records are transferred to facilitate further admissions.
                  </p>
                )}

                {certType === "Admission" && (
                  <p>
                    Having cleared all entry examinations and requirements, the student is officially admitted with all standard academic
                    privileges and roles.
                  </p>
                )}
              </div>
            </div>

            {/* Verification Signatures footer */}
            <div className="flex justify-between items-end border-t border-slate-200 pt-6 font-sans text-[10px]">
              <div className="text-left">
                <p className="font-bold text-slate-700">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-slate-400">Registry Office</p>
              </div>
              <div className="text-right space-y-1">
                <div className="w-24 border-b border-slate-400 mx-auto"></div>
                <p className="font-bold text-slate-700">Principal Supervisor</p>
                <p className="text-[8px] text-slate-400">Authorized Seal</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2.5 px-6 rounded-lg flex items-center gap-1.5 mx-auto"
            >
              <Printer className="w-4 h-4" /> Print Certificate Layout
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Payroll Ledgers */}
      {activeSubTab === "payroll" && !selectedPayslip && !isViewingCertificate && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
            <div className="text-xs">
              <h4 className="font-bold text-slate-800">Faculty & Staff Salaries Treasury</h4>
              <p className="text-slate-500">Review monthly payroll structures, allowances, and tax withholding sheets.</p>
            </div>
            <button
              onClick={handleProcessPayroll}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
            >
              Process Monthly Salaries payout
            </button>
          </div>

          {/* Payroll List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3.5">Employee Name</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5 text-right">Basic Salary</th>
                  <th className="p-3.5 text-right">Allowance</th>
                  <th className="p-3.5 text-right">Deductions</th>
                  <th className="p-3.5 text-right">Net Salary</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payroll.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5 font-bold text-slate-800">{pay.employeeName}</td>
                    <td className="p-3.5 text-[10px] uppercase font-bold text-slate-500">{pay.role}</td>
                    <td className="p-3.5 text-right font-semibold text-slate-600">Rs. {pay.basicSalary}</td>
                    <td className="p-3.5 text-right font-semibold text-emerald-600">+Rs. {pay.allowances}</td>
                    <td className="p-3.5 text-right font-semibold text-red-600">-Rs. {pay.deductions}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-800">Rs. {pay.netSalary}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedPayslip(pay)}
                        className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-1 px-2.5 rounded-lg transition"
                      >
                        Generate PaySlip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Leave Requests */}
      {activeSubTab === "leaves" && !selectedPayslip && !isViewingCertificate && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Scheduled Duration</th>
                <th className="p-3.5">Reason for Absence</th>
                <th className="p-3.5">Approval Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5">
                    <span className="block font-bold text-slate-800">{req.applicantName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{req.role}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-600">{req.leaveType}</td>
                  <td className="p-3.5 font-semibold text-slate-500">{req.startDate} to {req.endDate}</td>
                  <td className="p-3.5 text-slate-600 italic">"{req.reason}"</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : req.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                    {req.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => handleLeaveStatusChange(req.id, "Approved")}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLeaveStatusChange(req.id, "Rejected")}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-VIEW: Institutional Certificates generator panel */}
      {activeSubTab === "certificates" && !selectedPayslip && !isViewingCertificate && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Certificate Drafting Panel
            </h4>
            <p className="text-xs text-slate-500">Draft character certs, study/admission verifications, and school leaving notices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Form */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-slate-600 mb-1">Select Certificate Category</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                >
                  <option value="Character">Character Certificate</option>
                  <option value="Leaving">School Leaving Certificate</option>
                  <option value="Admission">Admission Verification Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Aisha Rehman"
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Father / Guardian Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Muhammad Rehman"
                  value={certFatherName}
                  onChange={(e) => setCertFatherName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Grade Level</label>
                  <input
                    type="text"
                    value={certClass}
                    onChange={(e) => setCertClass(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 15"
                    value={certRollNo}
                    onChange={(e) => setCertRollNo(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!certStudentName || !certFatherName) {
                    alert("Please fill student name and guardian name to generate certificate.");
                    return;
                  }
                  setIsViewingCertificate(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs"
              >
                Generate & Draft Certificate
              </button>
            </div>

            {/* Quick prefill helpers */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Quick Prefill Templates
              </span>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Click on any verified active student to populate draft inputs instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCertStudentName("Aisha Rehman");
                    setCertFatherName("Muhammad Rehman");
                    setCertClass("Grade 10");
                    setCertRollNo("01");
                  }}
                  className="bg-white border border-slate-200 p-2 text-[10px] font-semibold rounded-lg text-slate-700 hover:bg-blue-50/50"
                >
                  📝 Aisha Rehman
                </button>
                <button
                  onClick={() => {
                    setCertStudentName("Zain Malik");
                    setCertFatherName("Yasir Malik");
                    setCertClass("Grade 11");
                    setCertRollNo("04");
                  }}
                  className="bg-white border border-slate-200 p-2 text-[10px] font-semibold rounded-lg text-slate-700 hover:bg-blue-50/50"
                >
                  📝 Zain Malik
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Printer,
  Award,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";
import { Teacher, Staff, LeaveRequest, Payslip, SchoolConfig } from "../types";

interface PrefillTemplate {
  id: string;
  name: string;
  fatherName: string;
  grade: string;
  rollNo: string;
}

const DEFAULT_PREFILLS: PrefillTemplate[] = [
  { id: "1", name: "Aisha Rehman", fatherName: "Muhammad Rehman", grade: "Grade 10", rollNo: "01" },
  { id: "2", name: "Zain Malik", fatherName: "Yasir Malik", grade: "Grade 11", rollNo: "04" },
];

interface HrAndCertificatesModuleProps {
  teachers: Teacher[];
  staff: Staff[];
  leaveRequests?: LeaveRequest[];
  setLeaveRequests?: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  payroll?: Payslip[];
  setPayroll?: React.Dispatch<React.SetStateAction<Payslip[]>>;
  initialSubTab?: string;
  schoolConfig?: SchoolConfig;
}

export function HrAndCertificatesModule({
  teachers,
  staff,
  schoolConfig,
}: HrAndCertificatesModuleProps) {
  // Certificate generator states
  const [certType, setCertType] = useState<"Character" | "Leaving" | "Admission">("Character");
  const [certStudentName, setCertStudentName] = useState("");
  const [certFatherName, setCertFatherName] = useState("");
  const [certClass, setCertClass] = useState("Grade 10");
  const [certRollNo, setCertRollNo] = useState("");
  const [isViewingCertificate, setIsViewingCertificate] = useState(false);

  // Quick prefill templates state
  const [prefillTemplates, setPrefillTemplates] = useState<PrefillTemplate[]>(DEFAULT_PREFILLS);

  const [deletingPrefill, setDeletingPrefill] = useState<PrefillTemplate | null>(null);

  const handleDeletePrefill = (template: PrefillTemplate) => {
    setDeletingPrefill(template);
  };

  const handleConfirmDeletePrefill = () => {
    if (deletingPrefill) {
      setPrefillTemplates((prev) => prev.filter((item) => item.id !== deletingPrefill.id));
      setDeletingPrefill(null);
    }
  };

  const handleResetPrefills = () => {
    setPrefillTemplates(DEFAULT_PREFILLS);
  };

  // Payslip states
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  return (
    <div className="space-y-6" id="hr-certificates-root">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Institutional Certificates Generator</h3>
          <p className="text-xs text-slate-500">Generate, draft, and print official student character and transfer certificates</p>
        </div>
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
                <h3 className="font-extrabold text-sm text-slate-800 uppercase">
                  {schoolConfig?.schoolName || "Citizen School and College"}
                </h3>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 max-w-3xl mx-auto shadow-lg" id="printable-certificate-view">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Official Institutional Certificate Preview
                </h4>
                <p className="text-[11px] text-slate-500">Ref No: CSC/CERT/2026/{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
            </div>
            <button
              onClick={() => setIsViewingCertificate(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
            >
              ← Back to Editor
            </button>
          </div>

          {/* Certificate Frame with elegant gold/navy double border & watermark */}
          <div
            id="certificate-frame"
            className="border-[10px] border-double border-slate-900 p-8 md:p-10 text-center relative bg-gradient-to-b from-amber-50/20 via-white to-amber-50/20 min-h-[500px] flex flex-col justify-between font-serif rounded-xl shadow-xs overflow-hidden"
          >
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 text-amber-600 font-bold text-xs select-none">❖</div>
            <div className="absolute top-2 right-2 text-amber-600 font-bold text-xs select-none">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-600 font-bold text-xs select-none">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-600 font-bold text-xs select-none">❖</div>

            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Award className="w-96 h-96 text-slate-900" />
            </div>

            {/* Top insignia & School Header */}
            <div className="space-y-2 relative z-10">
              <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-600 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900">
                {schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE LAHORE"}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-sans font-bold">
                Government Registered & Board Affiliated Institution | Reg # PK-9042-CSC
              </p>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-1"></div>
            </div>

            {/* Core Certificate Title & Body text */}
            <div className="space-y-5 relative z-10 my-4">
              <h3 className="text-2xl md:text-3xl font-black text-amber-800 italic font-serif tracking-wide border-b border-amber-200/60 pb-2 inline-block px-6">
                {certType === "Character" && "Certificate of Character"}
                {certType === "Leaving" && "School Leaving Transfer Certificate"}
                {certType === "Admission" && "Official Letter of Admission"}
              </h3>

              <div className="text-xs md:text-sm text-slate-800 leading-relaxed font-sans max-w-xl mx-auto space-y-4 pt-2">
                <p>
                  This is officially to verify and declare that <strong className="text-slate-950 font-black border-b border-slate-400 pb-0.5 px-1">{certStudentName || "AISHA REHMAN"}</strong>,{" "}
                  child of <strong className="text-slate-950 font-black border-b border-slate-400 pb-0.5 px-1">{certFatherName || "MUHAMMAD REHMAN"}</strong>, was a bona fide student of this institution,
                  studying in <strong className="text-amber-900 font-black">{certClass}</strong> {certRollNo && <span>under Roll Number <strong className="text-slate-900">#{certRollNo}</strong></span>}.
                </p>

                {certType === "Character" && (
                  <p className="text-slate-700 italic">
                    During her tenure at this school, she displayed exemplary discipline, high moral character, and dedicated performance in
                    both curricular and co-curricular activities. We wish her every success in all future academic endeavors.
                  </p>
                )}

                {certType === "Leaving" && (
                  <p className="text-slate-700 italic">
                    All outstanding dues, library books, fees, and institution levies have been successfully settled in full. Her enrollment is officially
                    withdrawn, and her school leaving transfer certificate is issued to facilitate further higher education.
                  </p>
                )}

                {certType === "Admission" && (
                  <p className="text-slate-700 italic">
                    Having cleared all competitive entry assessments and admission criteria, the candidate is granted official enrollment with full academic rights, student ID credentials, and privileges.
                  </p>
                )}
              </div>
            </div>

            {/* Verification Signatures & Stamp footer */}
            <div className="flex justify-between items-end border-t-2 border-dashed border-slate-300 pt-6 font-sans text-xs relative z-10">
              <div className="text-left space-y-1">
                <p className="font-extrabold text-slate-800">Issue Date: <span className="font-mono text-slate-600">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                <p className="text-[10px] text-slate-500 font-semibold">Verification Code: <span className="font-mono text-emerald-800">VER-2026-OK</span></p>
                <p className="text-[9px] text-slate-400">Consolidated Registrars Office</p>
              </div>

              {/* Official Seal Badge graphic */}
              <div className="w-16 h-16 border-2 border-dashed border-amber-600/60 rounded-full flex flex-col items-center justify-center text-[8px] font-black text-amber-800 uppercase p-1 text-center bg-amber-50/50 shadow-2xs">
                <span>OFFICIAL</span>
                <span className="text-[10px]">★</span>
                <span>SEAL</span>
              </div>

              <div className="text-right space-y-1">
                <div className="w-28 border-b-2 border-slate-700 mx-auto"></div>
                <p className="font-black text-slate-900">Principal Supervisor</p>
                <p className="text-[9px] text-slate-500 font-semibold">Citizen School & College</p>
              </div>
            </div>
          </div>

          {/* Print Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const printWin = window.open("", "_blank");
                if (!printWin) return;

                const certTitle = certType === "Character" 
                  ? "Certificate of Character" 
                  : certType === "Leaving" 
                  ? "School Leaving Transfer Certificate" 
                  : "Official Letter of Admission";

                const printHtml = `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>${certTitle} - ${certStudentName || "Student"}</title>
                      <style>
                        @page { size: A4 landscape; margin: 12mm; }
                        body { font-family: 'Times New Roman', Times, serif; margin: 0; padding: 0; background: #fff; color: #0f172a; }
                        .cert-border {
                          border: 12px double #0f172a;
                          padding: 40px;
                          min-height: 520px;
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                          text-align: center;
                          box-sizing: border-box;
                          position: relative;
                        }
                        .corner { position: absolute; font-size: 14px; color: #b45309; }
                        .top-l { top: 8px; left: 8px; }
                        .top-r { top: 8px; right: 8px; }
                        .bot-l { bottom: 8px; left: 8px; }
                        .bot-r { bottom: 8px; right: 8px; }
                        .school-title { font-size: 26px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 1px; font-family: 'Segoe UI', sans-serif; }
                        .school-sub { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px; margin-top: 3px; font-family: sans-serif; }
                        .cert-type { font-size: 28px; font-weight: 900; font-style: italic; color: #92400e; margin: 20px 0 15px 0; border-bottom: 2px solid #fde68a; display: inline-block; padding: 0 25px 5px 25px; }
                        .body-text { font-size: 16px; line-height: 1.8; color: #1e293b; max-width: 750px; margin: 0 auto; font-family: 'Georgia', serif; }
                        .highlight { font-weight: bold; color: #0f172a; border-bottom: 1px solid #475569; padding: 0 4px; }
                        .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px dashed #cbd5e1; padding-top: 25px; margin-top: 20px; font-family: sans-serif; font-size: 12px; }
                        .sig-line { width: 140px; border-bottom: 2px solid #0f172a; margin-bottom: 4px; }
                        .seal-badge { width: 70px; h: 70px; border: 2px dashed #b45309; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: #92400e; text-align: center; }
                      </style>
                    </head>
                    <body>
                      <div class="cert-border">
                        <div class="corner top-l">❖</div>
                        <div class="corner top-r">❖</div>
                        <div class="corner bot-l">❖</div>
                        <div class="corner bot-r">❖</div>

                        <div>
                          <div class="school-title">${schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE LAHORE"}</div>
                          <div class="school-sub">Government Registered & Board Affiliated Institution | Reg # PK-9042-CSC</div>
                        </div>

                        <div>
                          <div class="cert-type">${certTitle}</div>
                          <div class="body-text">
                            This is officially to verify and declare that <span class="highlight">${certStudentName || "AISHA REHMAN"}</span>,
                            child of <span class="highlight">${certFatherName || "MUHAMMAD REHMAN"}</span>, was a bona fide student of this institution,
                            studying in <strong>${certClass}</strong> ${certRollNo ? `under Roll Number <strong>#${certRollNo}</strong>` : ''}.
                            <br/><br/>
                            ${certType === "Character" ? "During her tenure at this school, she displayed exemplary discipline, moral character, and dedication to academics. We wish her every success in her future endeavors." : ""}
                            ${certType === "Leaving" ? "All outstanding dues, fees, and institution levies have been successfully settled. Her enrollment is officially withdrawn, and her records are transferred to facilitate further admissions." : ""}
                            ${certType === "Admission" ? "Having cleared all entry examinations and requirements, the student is officially admitted with all standard academic privileges and roles." : ""}
                          </div>
                        </div>

                        <div class="footer">
                          <div style="text-align: left;">
                            <strong>Issue Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                            <span style="font-size: 10px; color: #64748b;">Ref No: CSC/CERT/2026/${Math.floor(1000 + Math.random() * 9000)}</span>
                          </div>

                          <div class="seal-badge">OFFICIAL<br/>SEAL</div>

                          <div style="text-align: right;">
                            <div class="sig-line" style="margin-left: auto;"></div>
                            <strong>Principal Supervisor</strong><br/>
                            <span style="font-size: 10px; color: #64748b;">Authorized Signature</span>
                          </div>
                        </div>
                      </div>

                      <script>
                        window.onload = function() {
                          window.print();
                        }
                      </script>
                    </body>
                  </html>
                `;

                printWin.document.write(printHtml);
                printWin.document.close();
              }}
              className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 py-3 px-8 rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" /> Print Certificate Layout (A4 Landscape)
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Institutional Certificates generator panel */}
      {!selectedPayslip && !isViewingCertificate && (
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
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Quick Prefill Templates
                </span>
                {prefillTemplates.length < DEFAULT_PREFILLS.length && (
                  <button
                    type="button"
                    onClick={handleResetPrefills}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Reset default templates"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Defaults
                  </button>
                )}
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Click on any template name to populate inputs, or use the delete icon to remove a template.
              </p>

              {prefillTemplates.length === 0 ? (
                <div className="p-3 bg-white border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No quick prefill templates remaining.
                  <button
                    type="button"
                    onClick={handleResetPrefills}
                    className="block mx-auto mt-1.5 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Restore Default Templates
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {prefillTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white border border-slate-200 rounded-lg flex items-center shadow-2xs hover:border-blue-200 transition group overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCertStudentName(template.name);
                          setCertFatherName(template.fatherName);
                          setCertClass(template.grade);
                          setCertRollNo(template.rollNo);
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50/60 flex items-center gap-1 transition cursor-pointer"
                        title={`Prefill for ${template.name}`}
                      >
                        <span>📝</span>
                        <span>{template.name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrefill(template);
                        }}
                        className="px-2 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border-l border-slate-100 transition cursor-pointer"
                        title={`Delete ${template.name} template`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Quick Prefills */}
      {deletingPrefill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Quick Prefill Template</h3>
                <p className="text-xs text-slate-500">Remove from quick templates list</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete <strong>{deletingPrefill.name}</strong> ({deletingPrefill.grade}) from quick prefill templates?
            </p>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeletingPrefill(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePrefill}
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

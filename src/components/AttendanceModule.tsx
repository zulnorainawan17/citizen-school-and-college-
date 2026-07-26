import React, { useState } from "react";
import {
  UserCheck,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode,
  Smartphone,
  BarChart,
  ClipboardList,
} from "lucide-react";
import { Student, Teacher, Staff, AttendanceRecord, GRADE_LEVELS } from "../types";
import { saveAttendanceBatch } from "../lib/firestoreService";

interface AttendanceModuleProps {
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

export function AttendanceModule({
  students,
  teachers,
  staff,
  attendance,
  setAttendance,
}: AttendanceModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"record" | "reports" | "qr-scan">("record");
  const [entityType, setEntityType] = useState<"student" | "teacher" | "staff">("student");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // QR Scanning emulator states
  const [qrEntityId, setQrEntityId] = useState("");
  const [qrLog, setQrLog] = useState<string[]>([]);

  // SMS dispatch logs
  const [smsAlerts, setSmsAlerts] = useState<{ id: string; phone: string; message: string; status: string }[]>([]);

  // Handle single attendance check
  const handleMarkAttendance = (entityId: string, status: "Present" | "Absent" | "Late") => {
    // Check if record exists for this date and entityId
    const existingIdx = attendance.findIndex(
      (a) => a.date === selectedDate && a.entityId === entityId && a.entityType === entityType
    );

    let recToSave: AttendanceRecord;
    if (existingIdx > -1) {
      const updated = [...attendance];
      updated[existingIdx].status = status;
      recToSave = updated[existingIdx];
      setAttendance(updated);
    } else {
      const newRecord: AttendanceRecord = {
        id: `ATT_${Date.now()}_${entityId}`,
        date: selectedDate,
        entityId,
        entityType,
        status,
      };
      recToSave = newRecord;
      setAttendance([...attendance, newRecord]);
    }

    saveAttendanceBatch([recToSave]);

    // Trigger Mock SMS Alert if marked Absent for a student
    if (entityType === "student" && status === "Absent") {
      const student = students.find((s) => s.id === entityId);
      if (student) {
        const smsId = `SMS_${Date.now()}`;
        const newSms = {
          id: smsId,
          phone: student.guardianPhone,
          message: `Attendance Alert: Dear Guardian, your child ${student.name} (Roll No: ${student.rollNo}) is ABSENT today ${selectedDate} from Citizen School. Please contact the administration.`,
          status: "Sent & Delivered ✔",
        };
        setSmsAlerts((prev) => [newSms, ...prev]);
      }
    }
  };

  // Mark all listed as Present helper
  const handleMarkAllPresent = (entitiesList: any[]) => {
    const newRecords: AttendanceRecord[] = [];
    const allModified: AttendanceRecord[] = [];

    entitiesList.forEach((ent) => {
      const existingIdx = attendance.findIndex(
        (a) => a.date === selectedDate && a.entityId === ent.id && a.entityType === entityType
      );

      if (existingIdx > -1) {
        attendance[existingIdx].status = "Present";
        allModified.push(attendance[existingIdx]);
      } else {
        const rec: AttendanceRecord = {
          id: `ATT_${Date.now()}_${ent.id}`,
          date: selectedDate,
          entityId: ent.id,
          entityType,
          status: "Present",
        };
        newRecords.push(rec);
        allModified.push(rec);
      }
    });

    if (newRecords.length > 0) {
      setAttendance([...attendance, ...newRecords]);
    } else {
      setAttendance([...attendance]);
    }

    saveAttendanceBatch(allModified);
    alert("All listed individuals marked as Present.");
  };

  // QR Checkin Emulator
  const handleQrCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrEntityId) return;

    // Search for ID across students, teachers, staff
    let name = "";
    let type: "student" | "teacher" | "staff" = "student";

    const matchedStu = students.find((s) => s.id === qrEntityId);
    const matchedTch = teachers.find((t) => t.id === qrEntityId);
    const matchedStf = staff.find((s) => s.id === qrEntityId);

    if (matchedStu) {
      name = matchedStu.name;
      type = "student";
    } else if (matchedTch) {
      name = matchedTch.name;
      type = "teacher";
    } else if (matchedStf) {
      name = matchedStf.name;
      type = "staff";
    } else {
      alert("Invalid QR Code ID. Please specify STU001, TCH001, or STF001 as test inputs.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Mark as present
    const existingIdx = attendance.findIndex(
      (a) => a.date === todayStr && a.entityId === qrEntityId && a.entityType === type
    );

    if (existingIdx > -1) {
      const updated = [...attendance];
      updated[existingIdx].status = "Present";
      setAttendance(updated);
      saveAttendanceBatch([updated[existingIdx]]);
    } else {
      const rec: AttendanceRecord = {
        id: `ATT_${Date.now()}_${qrEntityId}`,
        date: todayStr,
        entityId: qrEntityId,
        entityType: type,
        status: "Present",
        remarks: "Registered via Smart QR Terminal",
      };
      setAttendance((prev) => [...prev, rec]);
      saveAttendanceBatch([rec]);
    }

    setQrLog((prev) => [
      `[${new Date().toLocaleTimeString()}] QR Scanner verified ${name} (${qrEntityId}) - marked Present.`,
      ...prev,
    ]);
    setQrEntityId("");
  };

  // Compute stats for active date
  const getRosterStats = (entitiesList: any[]) => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let unrecordedCount = 0;

    entitiesList.forEach((ent) => {
      const record = attendance.find(
        (a) => a.date === selectedDate && a.entityId === ent.id && a.entityType === entityType
      );
      if (record) {
        if (record.status === "Present") presentCount++;
        else if (record.status === "Absent") absentCount++;
        else if (record.status === "Late") lateCount++;
      } else {
        unrecordedCount++;
      }
    });

    return { presentCount, absentCount, lateCount, unrecordedCount };
  };

  // Get active roster list
  const getActiveRoster = () => {
    if (entityType === "student") {
      return students.filter((s) => s.class === selectedClass && s.section === selectedSection && s.status === "Active");
    } else if (entityType === "teacher") {
      return teachers.filter((t) => t.status === "Active");
    } else {
      return staff.filter((s) => s.status === "Active");
    }
  };

  const activeRoster = getActiveRoster();
  const stats = getRosterStats(activeRoster);

  return (
    <div className="space-y-6" id="attendance-module-root">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("record")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "record" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Daily Attendance Register
        </button>
        <button
          onClick={() => setActiveSubTab("qr-scan")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "qr-scan" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Smart QR Scanner Terminal
        </button>
        <button
          onClick={() => setActiveSubTab("reports")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "reports" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Attendance Analysis Reports
        </button>
      </div>

      {/* SUB-VIEW: Record Attendance */}
      {activeSubTab === "record" && (
        <div className="space-y-4">
          {/* Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Entity Type</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as any)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="student">Student Body</option>
                <option value="teacher">Faculty Members</option>
                <option value="staff">Office Staff</option>
              </select>
            </div>

            {entityType === "student" && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Attendance Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quick summary and bulk action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700">Attendance Summary:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {stats.presentCount} Present
              </span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {stats.absentCount} Absent
              </span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {stats.lateCount} Late
              </span>
              {stats.unrecordedCount > 0 && (
                <span className="text-slate-500 font-semibold">{stats.unrecordedCount} Unrecorded</span>
              )}
            </div>
            <button
              onClick={() => handleMarkAllPresent(activeRoster)}
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 py-2 px-4 rounded-lg shadow-xs transition"
            >
              Mark All Present
            </button>
          </div>

          {/* Attendance Checkbox List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5">Details (Name, Father's Name, Roll No)</th>
                  <th className="p-3.5">Admission No.</th>
                  <th className="p-3.5">Attendance Date</th>
                  <th className="p-3.5 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeRoster.map((ent) => {
                  const record = attendance.find(
                    (a) => a.date === selectedDate && a.entityId === ent.id && a.entityType === entityType
                  );
                  const currentStatus = record?.status;

                  return (
                    <tr key={ent.id} className="hover:bg-slate-50/40 transition">
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-800 block">{ent.name}</span>
                        {entityType === "student" ? (
                          <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>Roll No: <strong className="text-slate-700">#{ent.rollNo}</strong></span>
                            <span>•</span>
                            <span>Father Name: <strong className="text-slate-700">{ent.guardianName}</strong></span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 block mt-0.5">{ent.department || ent.role}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 font-bold">{ent.id}</td>
                      <td className="p-3.5 font-semibold text-slate-600">{selectedDate}</td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleMarkAttendance(ent.id, "Present")}
                            className={`px-3 py-1.5 rounded-lg font-bold border text-[11px] transition shadow-2xs ${
                              currentStatus === "Present"
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(ent.id, "Absent")}
                            className={`px-3 py-1.5 rounded-lg font-bold border text-[11px] transition shadow-2xs ${
                              currentStatus === "Absent"
                                ? "bg-red-600 text-white border-red-700"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(ent.id, "Late")}
                            className={`px-3 py-1.5 rounded-lg font-bold border text-[11px] transition shadow-2xs ${
                              currentStatus === "Late"
                                ? "bg-amber-500 text-white border-amber-600"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: QR Attendance Scan Emulator */}
      {activeSubTab === "qr-scan" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emulator panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <QrCode className="w-5 h-5 text-blue-600 animate-pulse" /> Terminal Scanner Emulator
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Place the student/teacher identity card in front of the terminal camera to record instant check-ins.
              For testing, type any valid registration code (e.g. <strong>STU001</strong>, <strong>STU002</strong>,{" "}
              <strong>TCH001</strong>) below and submit.
            </p>

            <form onSubmit={handleQrCheckinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Scan Input (ID Reference)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU001"
                    value={qrEntityId}
                    onChange={(e) => setQrEntityId(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-4 rounded-lg"
                  >
                    Simulate Scan
                  </button>
                </div>
              </div>
            </form>

            {/* Quick click triggers for testing */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                Click Card to Quick Scan
              </span>
              <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setQrEntityId(s.id);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 font-semibold p-2 rounded-lg text-slate-700"
                  >
                    💳 Scan {s.name} ({s.id})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time scan logs log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ClipboardList className="w-5 h-5 text-slate-500" /> Terminal Live Activity Logs
            </h4>
            <div className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl h-60 overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
              {qrLog.length > 0 ? (
                qrLog.map((log, idx) => <p key={idx}>{log}</p>)
              ) : (
                <p className="text-slate-500 italic">Scanner is active. Awaiting check-in transmissions...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Reports & Statistics */}
      {activeSubTab === "reports" && (
        <div className="space-y-6">
          {/* Absent Reports & SMS logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <BarChart className="w-5 h-5 text-blue-600" /> Absentee & Late Statistics
              </h4>
              <p className="text-xs text-slate-500">
                View analytical list of absentees and tardy logs recorded on {selectedDate}.
              </p>

              <div className="space-y-3">
                {attendance.filter((a) => a.date === selectedDate && a.status !== "Present").length > 0 ? (
                  attendance
                    .filter((a) => a.date === selectedDate && a.status !== "Present")
                    .map((record) => {
                      // Match names
                      const stu = students.find((s) => s.id === record.entityId);
                      const tch = teachers.find((t) => t.id === record.entityId);
                      const stf = staff.find((s) => s.id === record.entityId);
                      const name = stu?.name || tch?.name || stf?.name || record.entityId;

                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">{name}</h5>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                              ID: {record.entityId} | {record.entityType}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              record.status === "Absent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Perfect score! No absentees recorded on this date.
                  </p>
                )}
              </div>
            </div>

            {/* Smart automated SMS Log Tracker */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-emerald-600" /> Guardian SMS Alerts Dispatcher
              </h4>
              <p className="text-xs text-slate-500">
                Real-time tracking of cellular logs transmitted automatically to parents when absentees are verified.
              </p>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {smsAlerts.length > 0 ? (
                  smsAlerts.map((alertItem) => (
                    <div key={alertItem.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-500">Phone: {alertItem.phone}</span>
                        <span className="font-bold text-emerald-600">{alertItem.status}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{alertItem.message}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-8">
                    All class registers are fully populated. Toggle any student to "Absent" to trigger localized cell-broadcast SMS simulation.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

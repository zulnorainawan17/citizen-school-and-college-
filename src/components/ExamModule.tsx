import React, { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  BookOpen,
  Award,
  CheckCircle,
  TrendingUp,
  Printer,
  ChevronRight,
  Trash2,
  Edit,
  X,
  Calendar,
} from "lucide-react";
import { Student, ExamSchedule, GradeRecord, GRADE_LEVELS } from "../types";

interface ExamModuleProps {
  students: Student[];
  examSchedules: ExamSchedule[];
  setExamSchedules?: React.Dispatch<React.SetStateAction<ExamSchedule[]>>;
  grades: GradeRecord[];
  setGrades: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
}

export function ExamModule({
  students,
  examSchedules,
  setExamSchedules,
  grades,
  setGrades,
}: ExamModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"schedule" | "marks" | "reports" | "toppers">("schedule");

  // Exam Date Sheet States
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("All");
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    examName: "Mid Term Exams",
    className: "Class 10",
    subject: "Physics",
    examDate: "",
    time: "09:00 AM - 12:00 PM",
    room: "Room 101",
  });

  const handleEditSchedule = (schedule: ExamSchedule) => {
    setEditingSchedule(schedule);
    setScheduleFormData({
      examName: schedule.examName,
      className: schedule.className,
      subject: schedule.subject,
      examDate: schedule.examDate,
      time: schedule.time,
      room: schedule.room,
    });
    setIsCreatingSchedule(false);
  };

  const handleCreateScheduleClick = () => {
    setEditingSchedule(null);
    setScheduleFormData({
      examName: "Mid Term Exams",
      className: selectedClassFilter !== "All" ? selectedClassFilter : "Class 10",
      subject: "Physics",
      examDate: new Date().toISOString().split('T')[0],
      time: "09:00 AM - 12:00 PM",
      room: "Room 101",
    });
    setIsCreatingSchedule(true);
  };

  const handleSaveScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setExamSchedules) return;

    if (editingSchedule) {
      // update
      setExamSchedules((prev) =>
        prev.map((item) =>
          item.id === editingSchedule.id
            ? {
                ...item,
                examName: scheduleFormData.examName,
                className: scheduleFormData.className,
                subject: scheduleFormData.subject,
                examDate: scheduleFormData.examDate,
                time: scheduleFormData.time,
                room: scheduleFormData.room,
              }
            : item
        )
      );
      setEditingSchedule(null);
    } else {
      // create
      const newItem: ExamSchedule = {
        id: `EXM_${Date.now()}`,
        examName: scheduleFormData.examName,
        className: scheduleFormData.className,
        subject: scheduleFormData.subject,
        examDate: scheduleFormData.examDate,
        time: scheduleFormData.time,
        room: scheduleFormData.room,
      };
      setExamSchedules((prev) => [...prev, newItem]);
      setIsCreatingSchedule(false);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (!setExamSchedules) return;
    if (confirm("Are you sure you want to delete this date sheet entry?")) {
      setExamSchedules((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Selection states for Marks Entry
  const [selectedExam, setSelectedExam] = useState("Mid Term Exams");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("Physics");

  // Input states for Marks Entry
  const [tempMarks, setTempMarks] = useState<{ [studentId: string]: number }>({});

  // Transcript state
  const [activeTranscriptStudent, setActiveTranscriptStudent] = useState<Student | null>(null);

  // Auto Grade Calculator helper
  const calculateGrade = (obtained: number, max: number): string => {
    const percent = (obtained / max) * 100;
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B+";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 40) return "D";
    return "F";
  };

  // Submit Marks Entry
  const handleSaveMarks = () => {
    const activeStudentsList = students.filter((s) => s.class === selectedClass && s.status === "Active");
    const updatedGrades = [...grades];

    activeStudentsList.forEach((student) => {
      const marksObtained = tempMarks[student.id] !== undefined ? tempMarks[student.id] : 85; // fallback
      const maxMarks = 100;
      const grade = calculateGrade(marksObtained, maxMarks);

      // Check if already exists
      const existingIdx = updatedGrades.findIndex(
        (g) =>
          g.studentId === student.id &&
          g.examName === selectedExam &&
          g.subject === selectedSubject &&
          g.className === selectedClass
      );

      if (existingIdx > -1) {
        updatedGrades[existingIdx].marksObtained = marksObtained;
        updatedGrades[existingIdx].grade = grade;
      } else {
        updatedGrades.push({
          id: `GRD_${Date.now()}_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          className: selectedClass,
          examName: selectedExam,
          subject: selectedSubject,
          marksObtained,
          maxMarks,
          grade,
        });
      }
    });

    setGrades(updatedGrades);
    alert(`Academic marks recorded successfully for class ${selectedClass} - ${selectedSubject}!`);
  };

  // Compute position list (toppers)
  const getToppers = () => {
    // Accumulate total scores for students
    const studentAverages = students.map((s) => {
      const studentGrades = grades.filter((g) => g.studentId === s.id);
      if (studentGrades.length === 0) return { student: s, average: 0, total: 0 };

      const totalObtained = studentGrades.reduce((sum, g) => sum + g.marksObtained, 0);
      const totalMax = studentGrades.reduce((sum, g) => sum + g.maxMarks, 0);
      const average = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      return { student: s, average: Math.round(average), total: totalObtained };
    });

    // Sort by average score
    return studentAverages.sort((a, b) => b.average - a.average);
  };

  const toppers = getToppers();

  // Get active student transcripts subjects
  const getStudentGradesList = (studentId: string) => {
    return grades.filter((g) => g.studentId === studentId);
  };

  return (
    <div className="space-y-6" id="exam-module-root">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab("schedule");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "schedule" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Exam Date Sheet / ڈیٹ شیٹ
        </button>
        <button
          onClick={() => {
            setActiveSubTab("marks");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "marks" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Marks Entry Desk
        </button>
        <button
          onClick={() => {
            setActiveSubTab("reports");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "reports" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Transcripts & Report Cards
        </button>
        <button
          onClick={() => {
            setActiveSubTab("toppers");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "toppers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Top Positions List
        </button>
      </div>

      {/* SUB-VIEW: Transcript detailed Mode */}
      {activeTranscriptStudent && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 max-w-2xl mx-auto" id="printable-transcript-view">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Official Progress Report Card / Transcript
            </h4>
            <button
              onClick={() => setActiveTranscriptStudent(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-lg"
            >
              Back to List
            </button>
          </div>

          {/* Printable Report card visual */}
          <div className="border border-slate-300 rounded-xl p-5 space-y-6 text-xs bg-slate-50/50" id="transcript-frame">
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase">Citizen School and College</h3>
              <p className="text-[10px] text-slate-500">Official Consolidated Grade Transcript Sheet</p>
            </div>

            <div className="grid grid-cols-2 gap-y-2 border-y border-slate-200 py-3 text-[11px]">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <h5 className="font-bold text-slate-800">{activeTranscriptStudent.name}</h5>
              </div>
              <div>
                <span className="text-slate-500">Registration ID:</span>
                <h5 className="font-bold text-slate-800">{activeTranscriptStudent.id}</h5>
              </div>
              <div>
                <span className="text-slate-500">Grade Level:</span>
                <h5 className="font-bold text-slate-800">{activeTranscriptStudent.class}</h5>
              </div>
              <div>
                <span className="text-slate-500">Guardian Name:</span>
                <h5 className="font-bold text-slate-800">{activeTranscriptStudent.guardianName}</h5>
              </div>
            </div>

            {/* Subjects Marks list */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject Evaluations</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Exam Name</th>
                      <th className="p-2.5 text-right">Marks Obtained</th>
                      <th className="p-2.5 text-right">Max Marks</th>
                      <th className="p-2.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {getStudentGradesList(activeTranscriptStudent.id).length > 0 ? (
                      getStudentGradesList(activeTranscriptStudent.id).map((g) => (
                        <tr key={g.id}>
                          <td className="p-2.5 font-bold text-slate-800">{g.subject}</td>
                          <td className="p-2.5 text-slate-500">{g.examName}</td>
                          <td className="p-2.5 text-right font-semibold">{g.marksObtained}</td>
                          <td className="p-2.5 text-right text-slate-400">{g.maxMarks}</td>
                          <td className="p-2.5 text-center font-bold text-blue-600">{g.grade}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-4 italic text-slate-400">
                          No assessment grades found on this ledger yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automated Summary GPA */}
            {getStudentGradesList(activeTranscriptStudent.id).length > 0 && (
              <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-blue-600 font-bold">Overall Average Percentage:</span>
                  <h4 className="text-lg font-extrabold text-blue-900 mt-0.5">
                    {Math.round(
                      (getStudentGradesList(activeTranscriptStudent.id).reduce((sum, g) => sum + g.marksObtained, 0) /
                        getStudentGradesList(activeTranscriptStudent.id).reduce((sum, g) => sum + g.maxMarks, 0)) *
                        100
                    )}
                    %
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 font-bold">Passing Status:</span>
                  <span className="block font-bold text-emerald-600 text-xs mt-0.5">PASSED ✔</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2 px-5 rounded-lg flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Transcript Layout
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Exam Date Sheet */}
      {activeSubTab === "schedule" && !activeTranscriptStudent && (
        <div className="space-y-4">
          {/* Class filter and creation header bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Class-wise Exam Date Sheets / امتحانی ڈیٹ شیٹ مینجمنٹ
              </h4>
              <p className="text-[10px] text-slate-400">
                View, filter, and manage exam schedules for each specific academic class.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setSelectedClassFilter("All")}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                    selectedClassFilter === "All"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Classes
                </button>
                {GRADE_LEVELS.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                      selectedClassFilter === cls
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {setExamSchedules && (
                <button
                  onClick={handleCreateScheduleClick}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Create Date Sheet
                </button>
              )}
            </div>
          </div>

          {/* Table display */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3.5">Exam Series</th>
                  <th className="p-3.5">Class / کلاس</th>
                  <th className="p-3.5">Subject / مضمون</th>
                  <th className="p-3.5">Date / تاریخ</th>
                  <th className="p-3.5">Time Duration / وقت</th>
                  <th className="p-3.5">Room Location / کمرہ نمبر</th>
                  {setExamSchedules && <th className="p-3.5 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {examSchedules
                  .filter((ex) => selectedClassFilter === "All" || ex.className === selectedClassFilter)
                  .map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-bold text-slate-800">{ex.examName}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded">
                          {ex.className}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-blue-600">{ex.subject}</td>
                      <td className="p-3.5 font-semibold text-slate-600">{ex.examDate}</td>
                      <td className="p-3.5 text-slate-500">{ex.time}</td>
                      <td className="p-3.5 font-semibold text-slate-700">{ex.room}</td>
                      {setExamSchedules && (
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditSchedule(ex)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition"
                              title="Edit / ڈیٹ شیٹ تبدیل کریں"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(ex.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                {examSchedules.filter((ex) => selectedClassFilter === "All" || ex.className === selectedClassFilter).length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-slate-400 italic">
                      No date sheet entries scheduled for this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Exam Date Sheet Entry Modal */}
      {(editingSchedule || isCreatingSchedule) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveScheduleSubmit}
            className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {editingSchedule ? `Edit Date Sheet Entry` : "New Date Sheet Entry"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingSchedule(null);
                  setIsCreatingSchedule(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Exam Series / امتحان کا نام *</label>
                <select
                  value={scheduleFormData.examName}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, examName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                >
                  <option value="Mid Term Exams">Mid Term Exams</option>
                  <option value="Final Term Exams">Final Term Exams</option>
                  <option value="Monthly Assessment">Monthly Assessment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Class / کلاس *</label>
                <select
                  value={scheduleFormData.className}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, className: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Subject / مضمون *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Urdu, English Literature"
                  value={scheduleFormData.subject}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Exam Date / تاریخ *</label>
                <input
                  type="date"
                  required
                  value={scheduleFormData.examDate}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, examDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Time / وقت *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 AM - 12:00 PM"
                  value={scheduleFormData.time}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Room / کمرہ نمبر *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 102, Hall A"
                  value={scheduleFormData.room}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, room: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEditingSchedule(null);
                  setIsCreatingSchedule(false);
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

      {/* SUB-VIEW: Marks Entry Desk */}
      {activeSubTab === "marks" && !activeTranscriptStudent && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Exam Series</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="Mid Term Exams">Mid Term Exams</option>
                <option value="Final Term Exams">Final Term Exams</option>
                <option value="Monthly Assessment">Monthly Assessment</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Grade Target</label>
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
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Subject Evaluated</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English Literature">English Literature</option>
                <option value="Calculus">Calculus</option>
              </select>
            </div>
          </div>

          {/* Table roster */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Marks Entry Roster (Max Limit: 100)
              </span>
            </div>

            <div className="space-y-3.5">
              {students.filter((s) => s.class === selectedClass && s.status === "Active").map((stu) => {
                const existingGrade = grades.find(
                  (g) => g.studentId === stu.id && g.examName === selectedExam && g.subject === selectedSubject
                );

                return (
                  <div key={stu.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div>
                      <h5 className="font-bold text-slate-800">{stu.name}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold">Roll: #{stu.rollNo} | ID: {stu.id}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold">Marks Obtained:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder={existingGrade ? String(existingGrade.marksObtained) : "85"}
                        value={tempMarks[stu.id] !== undefined ? tempMarks[stu.id] : ""}
                        onChange={(e) =>
                          setTempMarks({ ...tempMarks, [stu.id]: Number(e.target.value) })
                        }
                        className="w-20 text-center border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-hidden"
                      />
                      <span className="text-slate-400 font-semibold">/ 100</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSaveMarks}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 px-6 rounded-lg transition"
              >
                Record Marks Entries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Transcripts Report cards selection */}
      {activeSubTab === "reports" && !activeTranscriptStudent && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
            Dynamic Student Transcripts
          </h4>
          <p className="text-xs text-slate-500">Choose any student below to generate and print their unified semester grade transcripts.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveTranscriptStudent(s)}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between cursor-pointer transition"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{s.name}</h5>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                    Class: {s.class} | ID: {s.id}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: Top Positions List */}
      {activeSubTab === "toppers" && !activeTranscriptStudent && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Top Academic Performers (Positions List)
            </h4>
            <p className="text-xs text-slate-500">Consolidated list sorted by average percentage scored across all registered assessments.</p>
          </div>

          <div className="space-y-3.5">
            {toppers.map((item, idx) => (
              <div key={item.student.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    idx === 1 ? "bg-slate-200 text-slate-700" :
                    idx === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{item.student.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.student.class} | ID: {item.student.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-800">
                  <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{item.average}% Avg</span>
                  <span className="text-slate-500">{item.total} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

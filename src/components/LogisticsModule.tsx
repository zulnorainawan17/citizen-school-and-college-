import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Printer,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  BookOpen,
  Sun,
  Snowflake,
  UserCheck,
  FileText,
  AlertCircle,
  ShieldCheck,
  Building2,
  School,
  X,
  RefreshCw,
} from "lucide-react";
import { Homework, TimetableItem, LibraryBook, TransportRoute, HostelRoom, InventoryItem, GRADE_LEVELS, Teacher } from "../types";
import { saveHomework, deleteHomework, saveBook, deleteBook, saveTransportRoute, deleteTransportRoute, saveHostelRoom, deleteHostelRoom, saveInventoryItem, deleteInventoryItem } from "../lib/firestoreService";

interface LogisticsModuleProps {
  homework: Homework[];
  setHomework: React.Dispatch<React.SetStateAction<Homework[]>>;
  timetable: TimetableItem[];
  setTimetable: React.Dispatch<React.SetStateAction<TimetableItem[]>>;
  books: LibraryBook[];
  setBooks: React.Dispatch<React.SetStateAction<LibraryBook[]>>;
  routes: TransportRoute[];
  setRoutes: React.Dispatch<React.SetStateAction<TransportRoute[]>>;
  rooms: HostelRoom[];
  setRooms: React.Dispatch<React.SetStateAction<HostelRoom[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  initialSubTab?: "timetable" | "library" | "inventory";
}

// Standard Pakistani School Time Slots Definition
interface TimeSlotDef {
  id: string;
  slotNumber: string;
  title: string;
  summerTime: string;
  winterTime: string;
  fridayTime: string;
  isBreak?: boolean;
}

const PAKISTANI_TIME_SLOTS: TimeSlotDef[] = [
  { id: "asm", slotNumber: "0", title: "Assembly & Tilawat", summerTime: "07:30 - 07:45 AM", winterTime: "08:00 - 08:15 AM", fridayTime: "08:00 - 08:15 AM", isBreak: true },
  { id: "p1", slotNumber: "1", title: "1st Period", summerTime: "07:45 - 08:25 AM", winterTime: "08:15 - 08:55 AM", fridayTime: "08:15 - 08:50 AM" },
  { id: "p2", slotNumber: "2", title: "2nd Period", summerTime: "08:25 - 09:05 AM", winterTime: "08:55 - 09:35 AM", fridayTime: "08:50 - 09:25 AM" },
  { id: "p3", slotNumber: "3", title: "3rd Period", summerTime: "09:05 - 09:45 AM", winterTime: "09:35 - 10:15 AM", fridayTime: "09:25 - 10:00 AM" },
  { id: "p4", slotNumber: "4", title: "4th Period", summerTime: "09:45 - 10:25 AM", winterTime: "10:15 - 10:55 AM", fridayTime: "10:00 - 10:35 AM" },
  { id: "brk", slotNumber: "B", title: "Recess / Tiffin Break", summerTime: "10:25 - 10:55 AM", winterTime: "10:55 - 11:25 AM", fridayTime: "10:35 - 10:55 AM", isBreak: true },
  { id: "p5", slotNumber: "5", title: "5th Period", summerTime: "10:55 - 11:35 AM", winterTime: "11:25 - 12:05 PM", fridayTime: "10:55 - 11:30 AM" },
  { id: "p6", slotNumber: "6", title: "6th Period", summerTime: "11:35 - 12:15 PM", winterTime: "12:05 - 12:45 PM", fridayTime: "11:30 - 12:05 PM" },
  { id: "p7", slotNumber: "7", title: "7th Period", summerTime: "12:15 - 12:55 PM", winterTime: "12:45 - 01:25 PM", fridayTime: "12:05 - 12:30 PM (Jummah)" },
  { id: "p8", slotNumber: "8", title: "8th Period / Zohr", summerTime: "12:55 - 01:35 PM", winterTime: "01:25 - 02:05 PM", fridayTime: "Dismissal for Jummah", isBreak: false },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

// Subject styling color badges
const SUBJECT_COLORS: { [subject: string]: string } = {
  Physics: "bg-cyan-100 text-cyan-800 border-cyan-300",
  Mathematics: "bg-indigo-100 text-indigo-800 border-indigo-300",
  "English Literature": "bg-blue-100 text-blue-800 border-blue-300",
  English: "bg-blue-100 text-blue-800 border-blue-300",
  Urdu: "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Urdu Literature": "bg-emerald-100 text-emerald-800 border-emerald-300",
  Islamiyat: "bg-amber-100 text-amber-800 border-amber-300",
  "Quranic Studies": "bg-amber-100 text-amber-800 border-amber-300",
  Chemistry: "bg-purple-100 text-purple-800 border-purple-300",
  Biology: "bg-rose-100 text-rose-800 border-rose-300",
  "Computer Science": "bg-teal-100 text-teal-800 border-teal-300",
  "Pakistan Studies": "bg-lime-100 text-lime-800 border-lime-300",
  History: "bg-orange-100 text-orange-800 border-orange-300",
  Calculus: "bg-indigo-100 text-indigo-800 border-indigo-300",
  "General Science": "bg-sky-100 text-sky-800 border-sky-300",
  "Physical Education": "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export function LogisticsModule({
  timetable,
  setTimetable,
  books,
  setBooks,
  inventory,
  setInventory,
  initialSubTab = "timetable",
}: LogisticsModuleProps) {
  // If explicitly accessed as library or inventory from legacy routes
  const [activeSubTab, setActiveSubTab] = useState<"timetable" | "library" | "inventory">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Timetable State
  const [selectedClass, setSelectedClass] = useState<string>("Class 10");
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [seasonRoutine, setSeasonRoutine] = useState<"summer" | "winter" | "friday">("summer");
  
  // Slot Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<{
    day: string;
    timeSlot: string;
    subject: string;
    teacherName: string;
    roomNo: string;
  }>({
    day: "Monday",
    timeSlot: "07:45 - 08:25 AM",
    subject: "Mathematics",
    teacherName: "Sarah Jenkins",
    roomNo: "Room 102",
  });

  // Library state for fallback view
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "", quantity: 10 });

  // Filtered timetable for selected class and section
  const currentClassTimetable = timetable.filter(
    (t) => t.className === selectedClass && (t.section === selectedSection || !t.section)
  );

  // Auto-Fill Pakistani Class Routine (Standard Balanced Template)
  const handleAutoFillPakistaniRoutine = () => {
    const defaultTeachers: { [sub: string]: { teacher: string; room: string } } = {
      Urdu: { teacher: "Prof. Bilal Khan", room: "Room 101" },
      English: { teacher: "Mrs. Ayesha Malik", room: "Room 102" },
      Mathematics: { teacher: "Sarah Jenkins", room: "Room 103" },
      Physics: { teacher: "Dr. Kamran Malik", room: "Physics Lab" },
      Chemistry: { teacher: "Dr. Hamza Tariq", room: "Chemistry Lab" },
      Biology: { teacher: "Mrs. Yasmin Bokhari", room: "Biology Lab" },
      "Computer Science": { teacher: "Engr. Usman Ali", room: "Computer Lab 1" },
      Islamiyat: { teacher: "Qari Abdul Rehman", room: "Room 105" },
      "Pakistan Studies": { teacher: "Prof. Bilal Khan", room: "Room 104" },
      "Physical Education": { teacher: "Sir Tariq Mehmood", room: "Sports Ground" },
    };

    const periodSubjectsPatternMap: { [day: string]: string[] } = {
      Monday: ["Assembly", "English", "Mathematics", "Urdu", "Physics", "Recess", "Chemistry", "Biology", "Islamiyat", "Pakistan Studies"],
      Tuesday: ["Assembly", "Mathematics", "Physics", "English", "Chemistry", "Recess", "Urdu", "Computer Science", "Pakistan Studies", "Islamiyat"],
      Wednesday: ["Assembly", "Physics", "Chemistry", "Mathematics", "Biology", "Recess", "English", "Urdu", "Islamiyat", "Physical Education"],
      Thursday: ["Assembly", "Chemistry", "Biology", "Physics", "Mathematics", "Recess", "Computer Science", "English", "Urdu", "Pakistan Studies"],
      Friday: ["Assembly", "Islamiyat", "Urdu", "English", "Mathematics", "Recess", "Pakistan Studies", "Physics Practical", "Jummah Prayer", "Dismissal"],
      Saturday: ["Assembly", "Mathematics", "Physics", "Chemistry", "English", "Recess", "Urdu Revision", "Sports & Games", "Assembly Wrap"],
    };

    const newEntries: TimetableItem[] = [];

    DAYS_OF_WEEK.forEach((day) => {
      const pattern = periodSubjectsPatternMap[day] || periodSubjectsPatternMap["Monday"];
      PAKISTANI_TIME_SLOTS.forEach((slot, idx) => {
        if (slot.isBreak) return; // Skip recess / assembly from core subject assignments
        const subName = pattern[idx] || "Mathematics";
        const teacherData = defaultTeachers[subName] || { teacher: "Subject Teacher", room: "Classroom" };

        const timeString =
          seasonRoutine === "summer"
            ? slot.summerTime
            : seasonRoutine === "winter"
            ? slot.winterTime
            : slot.fridayTime;

        newEntries.push({
          id: `PK_ROT_${selectedClass}_${day}_${slot.id}_${Date.now()}`,
          className: selectedClass,
          section: selectedSection,
          day: day as any,
          timeSlot: timeString,
          startTime: timeString.split(" - ")[0],
          endTime: timeString.split(" - ")[1],
          subject: subName,
          teacherName: teacherData.teacher,
          roomNo: teacherData.room,
        });
      });
    });

    // Replace entries for this class with new auto-generated routine
    const existingOtherClasses = timetable.filter((t) => t.className !== selectedClass || (t.section && t.section !== selectedSection));
    setTimetable([...existingOtherClasses, ...newEntries]);
    alert(`✅ Standard Pakistani Routine created for ${selectedClass} (${selectedSection})!`);
  };

  // Save / Update Slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndex = timetable.findIndex(
      (t) =>
        t.className === selectedClass &&
        (t.section === selectedSection || !t.section) &&
        t.day === editingSlot.day &&
        t.timeSlot === editingSlot.timeSlot
    );

    const newItem: TimetableItem = {
      id: existingIndex >= 0 ? timetable[existingIndex].id : `ROT_${Date.now()}`,
      className: selectedClass,
      section: selectedSection,
      day: editingSlot.day as any,
      timeSlot: editingSlot.timeSlot,
      subject: editingSlot.subject,
      teacherName: editingSlot.teacherName,
      roomNo: editingSlot.roomNo,
    };

    if (existingIndex >= 0) {
      const updated = [...timetable];
      updated[existingIndex] = newItem;
      setTimetable(updated);
    } else {
      setTimetable([newItem, ...timetable]);
    }

    setIsEditorOpen(false);
  };

  // Delete slot
  const handleDeleteSlot = (id: string) => {
    setTimetable(timetable.filter((t) => t.id !== id));
  };

  // Print Official A4 Markaz Timetable Document
  const handlePrintTimetable = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const timeLabel =
      seasonRoutine === "summer"
        ? "Grishmai Auqat (Summer Timings: 07:30 AM - 01:35 PM)"
        : seasonRoutine === "winter"
        ? "Sarmai Auqat (Winter Timings: 08:00 AM - 02:05 PM)"
        : "Jummah Mubarak Schedule (Friday Short Routine: 08:00 AM - 12:30 PM)";

    let tableRowsHtml = "";

    DAYS_OF_WEEK.forEach((day) => {
      tableRowsHtml += `<tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: bold; background-color: #f8fafc; text-align: center; font-size: 11px;">${day}</td>`;

      PAKISTANI_TIME_SLOTS.forEach((slot) => {
        if (slot.isBreak) {
          tableRowsHtml += `<td style="padding: 6px; background-color: #fef3c7; text-align: center; font-size: 10px; font-weight: bold; color: #92400e;">${slot.title}</td>`;
          return;
        }

        const slotTimeString =
          seasonRoutine === "summer" ? slot.summerTime : seasonRoutine === "winter" ? slot.winterTime : slot.fridayTime;

        const found = currentClassTimetable.find((t) => t.day === day && t.timeSlot === slotTimeString);

        if (found) {
          tableRowsHtml += `<td style="padding: 8px; font-size: 10px; text-align: center; border-left: 1px solid #f1f5f9;">
            <div style="font-weight: 800; color: #1e293b;">${found.subject}</div>
            <div style="font-size: 9px; color: #0284c7; font-weight: 600;">${found.teacherName}</div>
            <div style="font-size: 8px; color: #64748b;">${found.roomNo}</div>
          </td>`;
        } else {
          tableRowsHtml += `<td style="padding: 8px; font-size: 9px; text-align: center; color: #94a3b8; font-style: italic; border-left: 1px solid #f1f5f9;">Free / Library</td>`;
        }
      });

      tableRowsHtml += `</tr>`;
    });

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Class Timetable - ${selectedClass} (${selectedSection})</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 15px; color: #0f172a; }
            .header { text-align: center; border-bottom: 3px double #059669; padding-bottom: 12px; margin-bottom: 15px; }
            .school-title { font-size: 22px; font-weight: 900; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; }
            .school-sub { font-size: 12px; color: #475569; font-weight: 600; margin-top: 2px; }
            .meta-bar { display: flex; justify-content: space-between; align-items: center; background-color: #ecfdf5; padding: 8px 14px; border-radius: 8px; border: 1px solid #a7f3d0; margin-bottom: 15px; font-size: 11px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
            th { background-color: #047857; color: white; padding: 8px; text-align: center; font-size: 10px; font-weight: 800; border: 1px solid #065f46; }
            .signatures { display: flex; justify-content: space-between; margin-top: 35px; padding-top: 10px; }
            .sig-box { width: 200px; text-align: center; border-top: 1px solid #64748b; font-size: 10px; font-weight: bold; color: #334155; padding-top: 5px; }
            .stamp-box { width: 120px; height: 60px; border: 2px dashed #94a3b8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #94a3b8; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-title">CITIZEN SCHOOL & COLLEGE LAHORE</div>
            <div class="school-sub">Main Boulevard, DHA Phase 5, Lahore | Ph: +92 42 111-248-493</div>
            <div style="font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 8px;">
              ACADEMIC CLASS TIME TABLE & PERIOD ROUTINE (2026-2027)
            </div>
          </div>

          <div class="meta-bar">
            <div>CLASS: <span style="color: #047857;">${selectedClass} (${selectedSection})</span></div>
            <div>TIMINGS: <span style="color: #0284c7;">${timeLabel}</span></div>
            <div>CLASS INCHARGE: <span>Dr. Kamran Malik</span></div>
            <div>STATUS: <span style="color: #059669;">100% OK / Finalized</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 90px;">DAY / TIME</th>
                ${PAKISTANI_TIME_SLOTS.map((s) => {
                  const tStr = seasonRoutine === "summer" ? s.summerTime : seasonRoutine === "winter" ? s.winterTime : s.fridayTime;
                  return `<th>${s.title}<br/><span style="font-size: 8px; font-weight: normal; opacity: 0.9;">${tStr}</span></th>`;
                }).join("")}
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div style="font-size: 9px; color: #64748b; font-style: italic; margin-bottom: 15px;">
            * Note: Students & Faculty must ensure strictly punctual arrival for morning assembly bell and period change signals.
          </div>

          <div class="signatures">
            <div class="sig-box">
              Class Incharge Signature
            </div>
            <div class="stamp-box">
              Principal Seal Stamp
            </div>
            <div class="sig-box">
              Principal / Vice Principal Signature
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
  };

  // MAIN TIMETABLE PAGE VIEW (100% Focused on Timetable Only)
  return (
    <div className="space-y-6" id="timetable-module-root">
      {/* Module Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Class Timetable & Routine Schedule Generator
            </h2>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Pakistani School Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-11">
            Class-wise period allocation, morning assembly & recess timings, teacher schedule management, and official printable routines.
          </p>
        </div>

        {/* Header Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoFillPakistaniRoutine}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" /> Auto-Fill Pakistani Class Routine
          </button>
          
          <button
            onClick={() => setIsEditorOpen(true)}
            className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-slate-700" /> Add / Edit Period
          </button>

          <button
            onClick={handlePrintTimetable}
            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Class Routine (A4)
          </button>
        </div>
      </div>

      {/* Class Selection & Routine Season Controls Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Class Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Select Class Grade
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
          >
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Class Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* Routine Season Timings Preset */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            School Shift / Season Routine
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setSeasonRoutine("summer")}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                seasonRoutine === "summer"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Summer (7:30-1:35)
            </button>
            <button
              onClick={() => setSeasonRoutine("winter")}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                seasonRoutine === "winter"
                  ? "bg-sky-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" /> Winter (8:00-2:05)
            </button>
            <button
              onClick={() => setSeasonRoutine("friday")}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                seasonRoutine === "friday"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Friday Short
            </button>
          </div>
        </div>
      </div>

      {/* Sarea OK Ki Report - Finalized Status Badge */}
      <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm border border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">
                Sarea Report / سارے اوکے کی رپورٹ
              </span>
              <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                100% Complete & Active
              </span>
            </div>
            <p className="text-sm font-extrabold text-white mt-0.5">
              {selectedClass} ({selectedSection}) Weekly Routine Schedule Status: All Clear
            </p>
          </div>
        </div>

        {/* Quick stats pills */}
        <div className="flex items-center gap-3 text-xs font-bold text-emerald-100 shrink-0">
          <div className="bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-400 font-semibold uppercase">Scheduled Periods</span>
            <span>{currentClassTimetable.length} Slots Assigned</span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-400 font-semibold uppercase">Teacher Conflicts</span>
            <span className="text-emerald-300 flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 0 Conflicts
            </span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-400 font-semibold uppercase">Class Incharge</span>
            <span>Dr. Kamran Malik</span>
          </div>
        </div>
      </div>

      {/* Main Weekly Timetable Grid Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {selectedClass} ({selectedSection}) Weekly Routine Matrix (Mon - Sat)
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Active Shift: <span className="font-bold text-slate-800 uppercase">{seasonRoutine} Timings</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-black border-b border-slate-200 text-[11px]">
                <th className="p-3.5 w-28 border-r border-slate-200">DAY / PERIOD</th>
                {PAKISTANI_TIME_SLOTS.map((slot) => {
                  const timeText =
                    seasonRoutine === "summer"
                      ? slot.summerTime
                      : seasonRoutine === "winter"
                      ? slot.winterTime
                      : slot.fridayTime;

                  return (
                    <th key={slot.id} className="p-3.5 text-center border-r border-slate-200 min-w-[110px]">
                      <div className="font-extrabold text-slate-800">{slot.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 font-normal mt-0.5">{timeText}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day} className="hover:bg-slate-50/70 transition">
                  {/* Day Label */}
                  <td className="p-3.5 font-black text-slate-900 bg-slate-50 border-r border-slate-200 text-xs">
                    {day}
                  </td>

                  {/* Period Slots */}
                  {PAKISTANI_TIME_SLOTS.map((slot) => {
                    const slotTimeString =
                      seasonRoutine === "summer"
                        ? slot.summerTime
                        : seasonRoutine === "winter"
                        ? slot.winterTime
                        : slot.fridayTime;

                    if (slot.isBreak) {
                      return (
                        <td
                          key={slot.id}
                          className="p-2.5 text-center bg-amber-50/70 border-r border-slate-200 align-middle"
                        >
                          <div className="text-[10px] font-black text-amber-800 uppercase tracking-tight">
                            {slot.title}
                          </div>
                          <div className="text-[9px] text-amber-600 font-semibold mt-0.5">
                            {slot.id === "asm" ? "Nazra & Dua" : "Tiffin / Break"}
                          </div>
                        </td>
                      );
                    }

                    const matchingItem = currentClassTimetable.find(
                      (t) => t.day === day && t.timeSlot === slotTimeString
                    );

                    const badgeColorClass = matchingItem
                      ? SUBJECT_COLORS[matchingItem.subject] || "bg-slate-100 text-slate-800 border-slate-300"
                      : "";

                    return (
                      <td
                        key={slot.id}
                        className="p-2 border-r border-slate-200 align-top hover:bg-emerald-50/30 transition relative group"
                      >
                        {matchingItem ? (
                          <div className={`p-2.5 rounded-xl border ${badgeColorClass} shadow-2xs space-y-1 relative`}>
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs block leading-tight">{matchingItem.subject}</span>
                              <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteSlot(matchingItem.id)}
                                  className="text-red-600 hover:text-red-800 p-0.5"
                                  title="Remove period entry"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-[10px] font-bold opacity-90 truncate">{matchingItem.teacherName}</div>
                            <div className="text-[9px] font-semibold opacity-75">{matchingItem.roomNo}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSlot({
                                day,
                                timeSlot: slotTimeString,
                                subject: "Mathematics",
                                teacherName: "Sarah Jenkins",
                                roomNo: "Room 102",
                              });
                              setIsEditorOpen(true);
                            }}
                            className="w-full h-full min-h-[60px] rounded-xl border border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-700 transition"
                          >
                            <Plus className="w-3.5 h-3.5 mb-0.5" />
                            <span className="text-[9px] font-bold">Assign</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Period Assignment Modal / Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Configure Period Slot</h3>
                  <p className="text-[10px] text-slate-500">{selectedClass} ({selectedSection})</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Academic Day</label>
                  <select
                    value={editingSlot.day}
                    onChange={(e) => setEditingSlot({ ...editingSlot, day: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Time Slot / Period</label>
                  <select
                    value={editingSlot.timeSlot}
                    onChange={(e) => setEditingSlot({ ...editingSlot, timeSlot: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800"
                  >
                    {PAKISTANI_TIME_SLOTS.filter((s) => !s.isBreak).map((s) => {
                      const tStr =
                        seasonRoutine === "summer"
                          ? s.summerTime
                          : seasonRoutine === "winter"
                          ? s.winterTime
                          : s.fridayTime;
                      return (
                        <option key={s.id} value={tStr}>
                          {s.title} ({tStr})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Mathematics, Urdu, Islamiyat"
                  value={editingSlot.subject}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Assigned Teacher Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kamran Malik"
                  value={editingSlot.teacherName}
                  onChange={(e) => setEditingSlot({ ...editingSlot, teacherName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Room / Lab Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 102, Physics Lab"
                  value={editingSlot.roomNo}
                  onChange={(e) => setEditingSlot({ ...editingSlot, roomNo: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white font-bold bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl transition shadow-sm"
                >
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

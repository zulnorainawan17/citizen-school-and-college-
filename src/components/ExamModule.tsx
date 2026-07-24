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
  FileText,
  Sparkles,
} from "lucide-react";
import { Student, Teacher, ExamSchedule, GradeRecord, GRADE_LEVELS, SchoolConfig } from "../types";
import { saveExamSchedule, deleteExamSchedule, saveGradeRecord } from "../lib/firestoreService";
import { ResultManagementModule } from "./ResultManagementModule";

export const getSubjectsForClass = (className: string): string[] => {
  const cls = className.trim().toLowerCase();
  
  if (cls.includes("play") || cls.includes("nursery") || cls.includes("prep")) {
    return [
      "English Oral",
      "English Written",
      "Urdu Oral",
      "Urdu Written",
      "Mathematics",
      "General Knowledge",
      "Islamic Studies (Nazra)",
      "Drawing & Art"
    ];
  }
  
  if (
    cls.includes("class 1") ||
    cls.includes("class 2") ||
    cls.includes("class 3") ||
    cls.includes("class 4") ||
    cls.includes("class 5")
  ) {
    return [
      "English",
      "Urdu",
      "Mathematics",
      "General Science",
      "Islamiat",
      "Social Studies",
      "Computer Education",
      "Art & Drawing"
    ];
  }
  
  if (cls.includes("class 6") || cls.includes("class 7") || cls.includes("class 8")) {
    return [
      "English",
      "Urdu",
      "Mathematics",
      "General Science",
      "Islamiat",
      "History",
      "Geography",
      "Computer Science",
      "Arabic"
    ];
  }
  
  if (cls.includes("class 9") || cls.includes("class 10")) {
    return [
      "English",
      "Urdu",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Islamiat",
      "Pakistan Studies"
    ];
  }
  
  if (cls.includes("1st year") || cls.includes("2nd year")) {
    const isFirstYear = cls.includes("1st year");
    return [
      "English",
      "Urdu",
      isFirstYear ? "Islamiat" : "Pakistan Studies",
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "Computer Science",
      "Principles of Accounting",
      "Economics",
      "Statistics"
    ];
  }
  
  return [
    "English",
    "Urdu",
    "Mathematics",
    "Science",
    "Islamiat",
    "Computer Science",
    "Pakistan Studies"
  ];
};

interface ExamModuleProps {
  students: Student[];
  examSchedules: ExamSchedule[];
  setExamSchedules?: React.Dispatch<React.SetStateAction<ExamSchedule[]>>;
  grades: GradeRecord[];
  setGrades: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
  schoolConfig?: SchoolConfig;
  activeRole?: string;
  loggedInUser?: Student | Teacher | null;
}

export function ExamModule({
  students,
  examSchedules,
  setExamSchedules,
  grades,
  setGrades,
  schoolConfig,
  activeRole,
  loggedInUser,
}: ExamModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"results" | "schedule" | "marks" | "reports" | "toppers">("results");

  // Exam Date Sheet States
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Class 10");
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>("Mid Term Exams");
  const [customSchoolName, setCustomSchoolName] = useState<string>("");
  const [sheetSize, setSheetSize] = useState<"small" | "medium" | "large">("medium");
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

  // Date Sheet Builder Panel States
  const [isBuildingCompleteSheet, setIsBuildingCompleteSheet] = useState(false);
  const [builderTargetClass, setBuilderTargetClass] = useState("Class 10");
  const [builderExamName, setBuilderExamName] = useState("Mid Term Exams");
  const [builderRows, setBuilderRows] = useState<{
    id: string;
    examDate: string;
    subject: string;
    time: string;
    room: string;
  }[]>([]);

  // Function to export Date Sheet to Microsoft Word (.doc) format
  const exportToWord = () => {
    const area = document.getElementById("printable-date-sheet-area");
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
        <title>Exam Date Sheet</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 20px; }
          .text-center { text-align: center; }
          .uppercase { text-transform: uppercase; }
          .tracking-wide { letter-spacing: 0.05em; }
          h1 { font-size: 24px; font-weight: bold; margin-bottom: 2px; color: #0f172a; text-align: center; }
          p { margin: 4px 0; font-size: 13px; color: #475569; text-align: center; }
          .inline-block { display: inline-block; }
          .bg-slate-900 { background-color: #0f172a; color: #ffffff; padding: 4px 16px; border-radius: 9999px; font-weight: bold; font-size: 11px; }
          .grid { display: table; width: 100%; margin-top: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
          .grid-col { display: table-cell; width: 25%; }
          .block { display: block; }
          .text-slate-400 { color: #94a3b8; }
          .font-bold { font-weight: bold; }
          .text-xs { font-size: 12px; }
          .text-slate-800 { color: #1e293b; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; border: 2px solid #cbd5e1; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9; font-weight: bold; color: #1e293b; }
          .bg-slate-50 { background-color: #f8fafc; }
          .text-slate-500 { color: #64748b; }
          .text-blue-700 { color: #1d4ed8; font-weight: bold; }
          .text-emerald-700 { color: #047857; font-weight: bold; }
          .font-extrabold { font-weight: 800; }
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
    a.download = `Date_Sheet_${selectedClassFilter.replace(/\s+/g, "_")}_${selectedExamFilter.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to print Date Sheet beautifully and save as PDF
  const printDateSheet = () => {
    const area = document.getElementById("printable-date-sheet-area");
    if (!area) return;

    // Create a new empty print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      // Fallback to basic print if pop-ups are blocked
      window.print();
      return;
    }

    // Clone the node to avoid modifying the screen DOM
    const areaClone = area.cloneNode(true) as HTMLElement;

    // 1. Remove all elements marked as 'no-print'
    const noPrintElements = areaClone.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => el.remove());

    // 2. Remove actions column header and action cells inside the table manually
    const headers = areaClone.querySelectorAll("th");
    headers.forEach((th) => {
      if (th.classList.contains("no-print") || th.innerText.toLowerCase().includes("action")) {
        th.remove();
      }
    });

    const rows = areaClone.querySelectorAll("tr");
    rows.forEach((tr) => {
      const cells = tr.querySelectorAll("td");
      cells.forEach((td) => {
        // Look for buttons, trash icons, edit icons, or no-print classes and delete them
        if (
          td.classList.contains("no-print") || 
          td.querySelector("button") || 
          td.querySelector("svg") ||
          td.innerHTML.includes("<button")
        ) {
          td.remove();
        }
      });
    });

    // 3. Extract clean HTML content
    const contentHtml = areaClone.innerHTML;

    // Define dynamic size styles based on selected sheetSize
    const paddingStyle = 
      sheetSize === "small" ? "4px 8px" : 
      sheetSize === "large" ? "12px 14px" : 
      "7px 10px";

    const fontSizeStyle = 
      sheetSize === "small" ? "9.5px" : 
      sheetSize === "large" ? "12.5px" : 
      "11px";

    const gapStyle = 
      sheetSize === "small" ? "10px" : 
      sheetSize === "large" ? "24px" : 
      "16px";

    const schoolTitleSize = 
      sheetSize === "small" ? "18px" : 
      sheetSize === "large" ? "26px" : 
      "22px";

    // Create printable HTML template with a highly polished design
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exam Date Sheet</title>
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

          /* Main Container */
          #printable-date-sheet-area {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          /* Decorative line */
          .absolute.top-0 {
            display: none !important;
          }

          /* Header Styling */
          .text-center { text-align: center !important; }
          .uppercase { text-transform: uppercase !important; }
          .tracking-wide { letter-spacing: 0.05em !important; }
          .tracking-widest { letter-spacing: 0.1em !important; }
          
          h1 {
            font-size: ${schoolTitleSize} !important;
            font-weight: 800 !important;
            margin: 0 0 3px 0 !important;
            color: #0f172a !important;
            text-align: center !important;
          }
          
          p {
            margin: 1px 0 !important;
            font-size: 10px !important;
            color: #475569 !important;
            text-align: center !important;
          }

          .border-b-2 {
            border-bottom: 2px solid #0f172a !important;
          }
          
          .pb-4 {
            padding-bottom: 10px !important;
          }

          .mb-1 {
            margin-bottom: 2px !important;
          }

          .inline-block {
            display: inline-block !important;
          }

          .bg-slate-900 {
            background-color: #0f172a !important;
            color: #ffffff !important;
            padding: 4px 12px !important;
            border-radius: 9999px !important;
            font-weight: 700 !important;
            font-size: 9px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            margin-top: 5px !important;
          }

          /* Info Grid - metadata info */
          .grid {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-top: 10px !important;
            padding-bottom: 10px !important;
            border-bottom: 1px solid #cbd5e1 !important;
          }

          .grid > div {
            flex: 1 !important;
            text-align: left !important;
          }

          .grid > div:last-child {
            text-align: right !important;
          }

          .grid span {
            display: block !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            color: #64748b !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
          }

          .grid strong {
            display: block !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            margin-top: 1px !important;
          }

          /* Table Styling - Elegant & clear, auto-spaced columns */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-top: 16px !important;
            border: 1px solid #94a3b8 !important;
          }

          th {
            background-color: #f1f5f9 !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            font-size: 9.5px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            border: 1px solid #94a3b8 !important;
            padding: ${paddingStyle} !important;
          }

          td {
            border: 1px solid #cbd5e1 !important;
            padding: ${paddingStyle} !important;
            font-size: ${fontSizeStyle} !important;
            vertical-align: middle !important;
          }

          .text-center {
            text-align: center !important;
          }

          .font-bold {
            font-weight: 700 !important;
          }

          .text-blue-900 {
            color: #1e3a8a !important;
            font-size: ${fontSizeStyle} !important;
            font-weight: 700 !important;
          }

          .text-slate-500 {
            color: #64748b !important;
          }

          .text-slate-600 {
            color: #475569 !important;
          }

          .text-slate-700 {
            color: #334155 !important;
          }

          /* Friendly sequential text style */
          .bg-blue-50\/60 {
            background-color: #f0fdf4 !important;
            border: 1px solid #bbf7d0 !important;
            color: #166534 !important;
            border-radius: 4px !important;
            padding: 2px 5px !important;
            margin-top: 2px !important;
            font-size: 8.5px !important;
            display: inline-block !important;
          }

          /* Instructions section */
          .border {
            border: 1px solid #cbd5e1 !important;
          }
          
          .rounded-xl {
            border-radius: 6px !important;
          }
          
          .p-4 {
            padding: 10px !important;
          }
          
          .bg-slate-50\/50 {
            background-color: #f8fafc !important;
            margin-top: 14px !important;
          }

          .space-y-2 > * + * {
            margin-top: 4px !important;
          }

          h5 {
            margin: 0 0 4px 0 !important;
            font-size: 9.5px !important;
            font-weight: 700 !important;
            color: #334155 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
          }

          ul {
            margin: 0 !important;
            padding-left: 14px !important;
          }

          li {
            margin-bottom: 2px !important;
            font-size: 9px !important;
            color: #475569 !important;
          }

          /* Official Signatures */
          .pt-8 {
            padding-top: ${gapStyle} !important;
            margin-top: 10px !important;
          }

          .grid-cols-2 {
            display: flex !important;
            justify-content: space-between !important;
            margin-top: ${sheetSize === "large" ? "40px" : "25px"} !important;
          }

          .grid-cols-2 > div {
            width: 45% !important;
            text-align: center !important;
          }

          .mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }

          .w-32 {
            width: 130px !important;
          }

          .border-b {
            border-bottom: 1px solid #475569 !important;
          }

          /* Avoid page breaks inside table rows */
          tr, p, h1, h2, h3, h5, ul, li, div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div id="printable-date-sheet-area">
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

  // Helper to skip Sundays when auto-incrementing dates
  const getNextWorkingDay = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) { // 0 is Sunday
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().split("T")[0];
  };

  const handleOpenBuilder = () => {
    setIsBuildingCompleteSheet(true);
    const initialClass = selectedClassFilter !== "All" ? selectedClassFilter : "Class 10";
    const initialExam = selectedExamFilter !== "All" ? selectedExamFilter : "Mid Term Exams";
    setBuilderTargetClass(initialClass);
    setBuilderExamName(initialExam);
    
    // Auto-generate template based on the specific subjects of the selected class
    const subjects = getSubjectsForClass(initialClass);
    const today = new Date().toISOString().split("T")[0];
    let currentDate = today;
    
    const initialRows = subjects.map((sub, idx) => {
      const row = {
        id: `BR_${Date.now()}_${idx + 1}`,
        examDate: currentDate,
        subject: sub,
        time: "09:00 AM - 12:00 PM",
        room: "Room 101"
      };
      currentDate = getNextWorkingDay(currentDate);
      return row;
    });
    
    setBuilderRows(initialRows);
  };

  const handleAddBuilderRow = () => {
    const lastRow = builderRows[builderRows.length - 1];
    let nextDate = new Date().toISOString().split("T")[0];
    let nextRoom = "Room 101";
    let nextTime = "09:00 AM - 12:00 PM";
    
    if (lastRow) {
      nextDate = getNextWorkingDay(lastRow.examDate);
      nextRoom = lastRow.room;
      nextTime = lastRow.time;
    }
    
    setBuilderRows([
      ...builderRows,
      {
        id: `BR_${Date.now()}_${builderRows.length + 1}`,
        examDate: nextDate,
        subject: "",
        time: nextTime,
        room: nextRoom,
      }
    ]);
  };

  const handleUpdateBuilderRow = (id: string, field: "examDate" | "subject" | "time" | "room", value: string) => {
    setBuilderRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveBuilderRow = (id: string) => {
    setBuilderRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSaveCompleteSheet = () => {
    if (!setExamSchedules) return;
    
    // Validate rows
    const validRows = builderRows.filter(r => r.subject.trim() !== "" && r.examDate !== "");
    if (validRows.length === 0) {
      alert("Please add at least one paper schedule with a valid subject and date.");
      return;
    }
    
    const newSchedules: ExamSchedule[] = validRows.map((r) => ({
      id: `EXM_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      examName: builderExamName,
      className: builderTargetClass,
      subject: r.subject.trim(),
      examDate: r.examDate,
      time: r.time,
      room: r.room,
    }));
    
    const existingCount = examSchedules.filter(
      (ex) => ex.className === builderTargetClass && ex.examName === builderExamName
    ).length;
    
    let shouldKeepExisting = true;
    if (existingCount > 0) {
      shouldKeepExisting = !confirm(
        `There are already ${existingCount} paper schedules for ${builderTargetClass} - ${builderExamName}.\n\nClick OK to replace existing papers with this new complete date sheet, or Cancel to append these new papers.`
      );
    }
    
    newSchedules.forEach((sch) => saveExamSchedule(sch));
    
    setExamSchedules((prev) => {
      let filtered = prev;
      if (!shouldKeepExisting) {
        filtered = prev.filter((ex) => {
          const isTarget = ex.className === builderTargetClass && ex.examName === builderExamName;
          if (isTarget) {
            deleteExamSchedule(ex.id);
          }
          return !isTarget;
        });
      }
      return [...filtered, ...newSchedules];
    });
    
    setSelectedClassFilter(builderTargetClass);
    setSelectedExamFilter(builderExamName);
    setIsBuildingCompleteSheet(false);
  };

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
      examName: selectedExamFilter !== "All" ? selectedExamFilter : "Mid Term Exams",
      className: selectedClassFilter !== "All" ? selectedClassFilter : "Class 10",
      subject: "",
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
      const updatedSchedule: ExamSchedule = {
        ...editingSchedule,
        examName: scheduleFormData.examName,
        className: scheduleFormData.className,
        subject: scheduleFormData.subject,
        examDate: scheduleFormData.examDate,
        time: scheduleFormData.time,
        room: scheduleFormData.room,
      };
      saveExamSchedule(updatedSchedule);
      setExamSchedules((prev) =>
        prev.map((item) => (item.id === editingSchedule.id ? updatedSchedule : item))
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
      saveExamSchedule(newItem);
      setExamSchedules((prev) => [...prev, newItem]);
      setIsCreatingSchedule(false);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (!setExamSchedules) return;
    if (confirm("Are you sure you want to delete this date sheet entry?")) {
      deleteExamSchedule(id);
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
    if (percent >= 80) return "A+";
    if (percent >= 70) return "A";
    if (percent >= 65) return "B+";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 40) return "D";
    if (percent >= 30) return "E";
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

      let gradeRecToSave: GradeRecord;
      if (existingIdx > -1) {
        updatedGrades[existingIdx].marksObtained = marksObtained;
        updatedGrades[existingIdx].grade = grade;
        gradeRecToSave = updatedGrades[existingIdx];
      } else {
        gradeRecToSave = {
          id: `GRD_${Date.now()}_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          className: selectedClass,
          examName: selectedExam,
          subject: selectedSubject,
          marksObtained,
          maxMarks,
          grade,
        };
        updatedGrades.push(gradeRecToSave);
      }
      saveGradeRecord(gradeRecToSave);
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
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => {
            setActiveSubTab("results");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === "results"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> School ERP Result System
        </button>
        <button
          onClick={() => {
            setActiveSubTab("schedule");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeSubTab === "schedule" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Exam Date Sheet
        </button>
        {activeRole !== "Student" && (
          <button
            onClick={() => {
              setActiveSubTab("marks");
              setActiveTranscriptStudent(null);
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeSubTab === "marks" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Marks Entry Desk
          </button>
        )}
        <button
          onClick={() => {
            setActiveSubTab("reports");
            setActiveTranscriptStudent(null);
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
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
          className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeSubTab === "toppers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Top Positions List
        </button>
      </div>

      {/* SUB-VIEW 0: ERP RESULT SYSTEM */}
      {activeSubTab === "results" && (
        <ResultManagementModule
          students={students}
          grades={grades}
          setGrades={setGrades}
          schoolConfig={schoolConfig}
          activeRole={activeRole}
          loggedInUser={loggedInUser}
        />
      )}

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
              <h3 className="font-extrabold text-sm text-slate-800 uppercase">
                {schoolConfig?.schoolName || "Citizen School and College"}
              </h3>
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
      {activeSubTab === "schedule" && !activeTranscriptStudent && (() => {
        // Helpers for day name and format
        const getDayDetails = (dateStr: string) => {
          if (!dateStr) return { eng: "-" };
          const daysEng = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dateObj = new Date(dateStr);
          if (isNaN(dateObj.getTime())) {
            return { eng: "-" };
          }
          const dayIndex = dateObj.getDay();
          return {
            eng: daysEng[dayIndex]
          };
        };

        const formatExamDate = (dateStr: string) => {
          if (!dateStr) return "-";
          const dateObj = new Date(dateStr);
          if (isNaN(dateObj.getTime())) return dateStr;
          return dateObj.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
        };

        const getEnglishStatement = (dateStr: string, subject: string) => {
          const dayInfo = getDayDetails(dateStr);
          const engDayOnly = dayInfo.eng;
          return `${subject} paper will be held on ${engDayOnly}.`;
        };

        const filteredSchedules = examSchedules
          .filter((ex) => {
            const matchClass = selectedClassFilter === "All" || ex.className === selectedClassFilter;
            const matchExam = selectedExamFilter === "All" || ex.examName === selectedExamFilter;
            return matchClass && matchExam;
          })
          .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

        // Dynamic styling variables depending on chosen sheetSize
        const tablePaddingClass = 
          sheetSize === "small" ? "py-1.5 px-2 text-[10px]" : 
          sheetSize === "large" ? "py-4 px-4 text-sm" : 
          "py-2.5 px-3 text-xs";

        if (isBuildingCompleteSheet) {
          return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs no-print">
              {/* Header with Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Interactive Date Sheet Builder</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Create Complete Exam Date Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add multiple papers sequentially. Select target class, dates, subjects and timings to assemble a complete printable date sheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBuildingCompleteSheet(false)}
                  className="self-start sm:self-center text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 py-2 px-4 rounded-lg flex items-center gap-1 transition"
                >
                  <X className="w-3.5 h-3.5" /> Cancel & Close
                </button>
              </div>

              {/* Step 1: Config Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Target Class *</label>
                  <select
                    value={builderTargetClass}
                    onChange={(e) => setBuilderTargetClass(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const subjects = getSubjectsForClass(builderTargetClass);
                      const baseDate = builderRows[0]?.examDate || new Date().toISOString().split("T")[0];
                      let currentDate = baseDate;
                      const newRows = subjects.map((sub, idx) => {
                        const row = {
                          id: `BR_${Date.now()}_${idx + 1}`,
                          examDate: currentDate,
                          subject: sub,
                          time: "09:00 AM - 12:00 PM",
                          room: "Room 101"
                        };
                        currentDate = getNextWorkingDay(currentDate);
                        return row;
                      });
                      setBuilderRows(newRows);
                    }}
                    className="mt-1.5 w-full inline-flex items-center justify-center gap-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-2 rounded-lg transition border border-indigo-100"
                    title="Load all subjects of the selected class sequentially"
                  >
                    ✨ Auto-Load Class Subjects
                  </button>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Exam Series *</label>
                  <select
                    value={builderExamName}
                    onChange={(e) => setBuilderExamName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Mid Term Exams">Mid Term Exams</option>
                    <option value="Final Term Exams">Final Term Exams</option>
                    <option value="Monthly Assessment">Monthly Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Default Timing (Quick Fill)</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 12:00 PM"
                    defaultValue="09:00 AM - 12:00 PM"
                    id="builder-default-time"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden"
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setBuilderRows(prev => prev.map(r => r.time === "" ? { ...r, time: newVal } : r));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Default Room (Quick Fill)</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    defaultValue="Room 101"
                    id="builder-default-room"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden"
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setBuilderRows(prev => prev.map(r => r.room === "" ? { ...r, room: newVal } : r));
                    }}
                  />
                </div>
              </div>

              {/* Step 2: Interactive Table Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Exam Papers Schedule
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {builderRows.length} Paper(s) added
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3 w-12 text-center">Sr.</th>
                        <th className="p-3 w-52">Date & Day</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3 w-48">Exam Timing</th>
                        <th className="p-3 w-32">Room</th>
                        <th className="p-3 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {builderRows.map((row, index) => {
                        const dayInfo = getDayDetails(row.examDate);
                        const popularSubjects = getSubjectsForClass(builderTargetClass);
                        const timePresets = ["09:00 AM - 12:00 PM", "12:30 PM - 03:30 PM"];
                        
                        return (
                          <tr key={row.id} className="hover:bg-slate-50/50 transition duration-150">
                            {/* Sr */}
                            <td className="p-3 text-center font-bold text-slate-400">
                              {index + 1}
                            </td>

                            {/* Date Picker & Day Name */}
                            <td className="p-3">
                              <input
                                type="date"
                                required
                                value={row.examDate}
                                onChange={(e) => handleUpdateBuilderRow(row.id, "examDate", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              />
                              <span className="block mt-1 text-[10px] text-slate-500 font-semibold italic pl-1">
                                📅 {dayInfo.eng || "Select Date"}
                              </span>
                            </td>

                            {/* Subject input with click-to-fill helper chips */}
                            <td className="p-3">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Physics, Mathematics"
                                value={row.subject}
                                onChange={(e) => handleUpdateBuilderRow(row.id, "subject", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              />
                              {/* Popular Quick-Fill Chips */}
                              <div className="flex flex-wrap gap-1 mt-1.5 max-w-lg">
                                {popularSubjects.map((sub) => (
                                  <button
                                    key={sub}
                                    type="button"
                                    onClick={() => handleUpdateBuilderRow(row.id, "subject", sub)}
                                    className={`text-[9px] px-2 py-0.5 rounded-full border transition font-medium ${
                                      row.subject === sub 
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                                        : "bg-slate-50 border-slate-150 text-slate-600 hover:bg-indigo-50/50"
                                    }`}
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                            </td>

                            {/* Timing input with presets */}
                            <td className="p-3">
                              <input
                                type="text"
                                required
                                placeholder="09:00 AM - 12:00 PM"
                                value={row.time}
                                onChange={(e) => handleUpdateBuilderRow(row.id, "time", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              />
                              {/* Time Preset pills */}
                              <div className="flex gap-1 mt-1.5">
                                {timePresets.map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleUpdateBuilderRow(row.id, "time", t)}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600"
                                  >
                                    {t.split(" - ")[0]}
                                  </button>
                                ))}
                              </div>
                            </td>

                            {/* Room input */}
                            <td className="p-3">
                              <input
                                type="text"
                                required
                                placeholder="Room 101"
                                value={row.room}
                                onChange={(e) => handleUpdateBuilderRow(row.id, "room", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 focus:outline-hidden"
                              />
                            </td>

                            {/* Delete row */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBuilderRow(row.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Delete Row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {builderRows.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 italic text-slate-400">
                            No papers added yet. Click the buttons below to start adding papers to your date sheet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Grid controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddBuilderRow}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Next Paper Row
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (builderRows.length === 0) return;
                        let currentDate = builderRows[0].examDate || new Date().toISOString().split("T")[0];
                        setBuilderRows((prev) =>
                          prev.map((row, idx) => {
                            if (idx === 0) return row;
                            currentDate = getNextWorkingDay(currentDate);
                            return { ...row, examDate: currentDate };
                          })
                        );
                      }}
                      disabled={builderRows.length <= 1}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3.5 rounded-xl transition disabled:opacity-50"
                      title="Automatically sequence dates, skipping Sundays"
                    >
                      🔄 Auto-Sequence Dates
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all paper rows?")) {
                        setBuilderRows([]);
                      }
                    }}
                    className="text-red-600 hover:bg-red-50 font-bold py-2 px-3 rounded-lg transition"
                  >
                    Clear All Rows
                  </button>
                </div>
              </div>

              {/* Footer Save actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 text-xs">
                <button
                  type="button"
                  onClick={() => setIsBuildingCompleteSheet(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompleteSheet}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-8 rounded-xl flex items-center gap-2 transition shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" /> Generate & Save Complete Date Sheet
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {/* Embedded Print CSS to print ONLY the date sheet card and enforce single-page fit */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                /* Hide everything on the page */
                body * {
                  visibility: hidden !important;
                }
                /* Show ONLY our printable-date-sheet-area */
                #printable-date-sheet-area, #printable-date-sheet-area * {
                  visibility: visible !important;
                }
                /* Position the print content at the absolute top-left with full width */
                #printable-date-sheet-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 20px !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
                /* Prevent table rows and headers from splitting */
                tr, p, h1, h2, h3, h5, div {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 1.2cm;
                }
              }
            `}} />

            {/* Customizer controls and Class-wise selectors (Non-Printable) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 no-print">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Class-wise Exam Date Sheets
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Filter by class, select the exam series, customize your school name, adjust row size to fit 1 page, and print.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {setExamSchedules && (
                    <>
                      <button
                        onClick={handleOpenBuilder}
                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                        title="Create a complete sequence of dates and papers in an interactive builder"
                      >
                        <Calendar className="w-4 h-4" /> Date Sheet Builder
                      </button>
                      <button
                        onClick={handleCreateScheduleClick}
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 px-3 rounded-lg flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Single Paper
                      </button>
                    </>
                  )}
                  <button
                    onClick={printDateSheet}
                    className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                    title="Print the date sheet or save as PDF by choosing 'Save as PDF' as the destination"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF
                  </button>
                  <button
                    onClick={exportToWord}
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                    title="Download the date sheet as editable MS Word file (.doc)"
                  >
                    <FileText className="w-4 h-4" /> Download Word File (.doc)
                  </button>
                </div>
              </div>

              {/* Filtering Controls Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Select Class</label>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="All">All Classes</option>
                    {GRADE_LEVELS.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Select Exam Series</label>
                  <select
                    value={selectedExamFilter}
                    onChange={(e) => setSelectedExamFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="All">All Exams</option>
                    <option value="Mid Term Exams">Mid Term Exams</option>
                    <option value="Final Term Exams">Final Term Exams</option>
                    <option value="Monthly Assessment">Monthly Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Row Spacing</label>
                  <select
                    value={sheetSize}
                    onChange={(e) => setSheetSize(e.target.value as "small" | "medium" | "large")}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="small">Compact (For 1-page fit)</option>
                    <option value="medium">Standard</option>
                    <option value="large">Spacious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customize School Name</label>
                  <input
                    type="text"
                    value={customSchoolName}
                    onChange={(e) => setCustomSchoolName(e.target.value)}
                    placeholder="e.g. Lahore Science Academy"
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* High-fidelity, Professional Printable Date Sheet Certificate Layout */}
            <div
              id="printable-date-sheet-area"
              className="bg-white border-2 border-slate-300 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden"
            >
              {/* Decorative Header Border Accent for standard preview */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 no-print" />

              {/* Institution Emblem Header */}
              <div className="text-center space-y-2 border-b-2 border-slate-800 pb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-800 mb-1">
                  <Calendar className="w-5 h-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
                  {customSchoolName || schoolConfig?.schoolName || "Citizen School and College"}
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Official Examination Date Sheet
                </p>
                <div className="inline-block bg-slate-900 text-white font-bold text-[11px] px-4 py-1 rounded-full uppercase tracking-wider mt-1">
                  {selectedExamFilter === "All" ? "All Combined Exams" : selectedExamFilter} - {selectedClassFilter === "All" ? "All Classes" : selectedClassFilter}
                </div>
              </div>

              {/* Quick Info Metadata blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-slate-600 border-b border-slate-100 pb-4">
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Academic Year</span>
                  <strong className="text-slate-800 text-xs">2026 - 2027</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Class Level</span>
                  <strong className="text-slate-800 text-xs">{selectedClassFilter === "All" ? "Combined Classes" : selectedClassFilter}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Exam Category</span>
                  <strong className="text-slate-800 text-xs">{selectedExamFilter === "All" ? "Regular Series" : selectedExamFilter}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Generation Date</span>
                  <strong className="text-slate-800 text-xs">{formatExamDate(new Date().toISOString().split('T')[0])}</strong>
                </div>
              </div>

              {/* Papers Grid Sheet */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className={`border-r border-slate-300 text-center w-12 ${tablePaddingClass}`}>Sr.</th>
                      <th className={`border-r border-slate-300 ${tablePaddingClass}`}>Date & Day</th>
                      {selectedClassFilter === "All" && <th className={`border-r border-slate-300 ${tablePaddingClass}`}>Class</th>}
                      <th className={`border-r border-slate-300 ${tablePaddingClass}`}>Subject & Paper Info</th>
                      <th className={`border-r border-slate-300 ${tablePaddingClass}`}>Exam Timing</th>
                      <th className={`border-r border-slate-300 ${tablePaddingClass}`}>Room</th>
                      <th className="p-2 text-center no-print w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-800">
                    {filteredSchedules.map((ex, index) => {
                      const dayInfo = getDayDetails(ex.examDate);
                      const friendlyStmt = getEnglishStatement(ex.examDate, ex.subject);
                      return (
                        <tr key={ex.id} className="hover:bg-slate-50/50 transition">
                          <td className={`border-r border-slate-300 text-center font-bold text-slate-500 ${tablePaddingClass}`}>
                            {index + 1}
                          </td>
                          <td className={`border-r border-slate-300 ${tablePaddingClass}`}>
                            <div className="font-bold text-slate-900">{formatExamDate(ex.examDate)}</div>
                            <div className="text-[10px] text-slate-600 font-semibold">{dayInfo.eng}</div>
                          </td>
                          {selectedClassFilter === "All" && (
                            <td className={`border-r border-slate-300 font-bold ${tablePaddingClass}`}>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                                {ex.className}
                              </span>
                            </td>
                          )}
                          <td className={`border-r border-slate-300 font-bold ${tablePaddingClass}`}>
                            <div className="text-blue-900 font-extrabold text-xs">{ex.subject}</div>
                            {/* Sequential line statement explaining exactly when the paper will be held */}
                            <div className="mt-1 bg-blue-50/60 border border-blue-100 rounded-lg p-2 text-[10px] text-blue-800 font-medium">
                              📅 {friendlyStmt}
                            </div>
                          </td>
                          <td className={`border-r border-slate-300 font-semibold text-slate-700 ${tablePaddingClass}`}>
                            {ex.time}
                          </td>
                          <td className={`border-r border-slate-300 font-medium text-slate-600 ${tablePaddingClass}`}>
                            {ex.room}
                          </td>
                          <td className="p-2 text-center no-print">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditSchedule(ex)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                                title="Edit Paper"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(ex.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredSchedules.length === 0 && (
                      <tr>
                        <td colSpan={selectedClassFilter === "All" ? 7 : 6} className="text-center p-8 text-slate-400 italic">
                          No papers scheduled for the selected filters. Click "Add Single Paper Schedule" to schedule papers!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Important Student Instructions (English only) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  💡 Important Instructions for Students:
                </h5>
                <ul className="text-[10px] space-y-1.5 list-disc pl-4 text-slate-600">
                  <li className="font-medium">
                    Students must arrive in proper school uniform 15 minutes before the exam starts.
                  </li>
                  <li className="font-medium">
                    Mobile phones, smartwatches, and helper books are strictly prohibited.
                  </li>
                  <li className="font-medium">
                    Bring your own stationary, clipboard, and original roll number slips.
                  </li>
                </ul>
              </div>

              {/* Offical Stamp & Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-12">
                  <div className="mx-auto w-32 border-b border-slate-800" />
                  <p className="font-bold text-slate-800 uppercase tracking-wide">
                    Controller of Examinations
                  </p>
                </div>
                <div className="space-y-12">
                  <div className="mx-auto w-32 border-b border-slate-800" />
                  <p className="font-bold text-slate-800 uppercase tracking-wide">
                    Principal Stamp & Sign
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                <label className="block text-slate-600 font-semibold mb-1">Exam Series *</label>
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
                <label className="block text-slate-600 font-semibold mb-1">Target Class *</label>
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
                <label className="block text-slate-600 font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Urdu, English Literature"
                  value={scheduleFormData.subject}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden font-bold"
                />
                {/* Popular Quick-Fill Chips for selected class */}
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-32 overflow-y-auto">
                  {getSubjectsForClass(scheduleFormData.className).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setScheduleFormData({ ...scheduleFormData, subject: sub })}
                      className={`text-[9px] px-2 py-0.5 rounded-full border transition font-bold ${
                        scheduleFormData.subject === sub 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                          : "bg-slate-50 border-slate-150 text-slate-600 hover:bg-indigo-50/50"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Exam Date *</label>
                <input
                  type="date"
                  required
                  value={scheduleFormData.examDate}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, examDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Time *</label>
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
                <label className="block text-slate-600 font-semibold mb-1">Room *</label>
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
                Save
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

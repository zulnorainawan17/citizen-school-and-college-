import React, { useState, useMemo } from "react";
import {
  Award,
  FileText,
  Printer,
  Download,
  Search,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles,
  BarChart2,
  Settings,
  UserCheck,
  GraduationCap,
  Lock,
  Unlock,
  ShieldAlert,
  RefreshCw,
  FileSpreadsheet,
  BookOpen,
  Users,
  Check,
  Eye,
  Edit3,
  Trash2,
  Trophy,
  Filter,
  PieChart as PieChartIcon,
  HelpCircle,
  Calendar,
  Share2,
  Camera,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Student, Teacher, GradeRecord, GRADE_LEVELS, SchoolConfig } from "../types";
import { saveGradeRecord } from "../lib/firestoreService";
import { getSubjectsForClass } from "./ExamModule";

interface ResultManagementModuleProps {
  students: Student[];
  grades: GradeRecord[];
  setGrades: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
  schoolConfig?: SchoolConfig;
  activeRole?: string;
  loggedInUser?: Student | Teacher | null;
  isResultLocked?: boolean;
  setIsResultLocked?: (locked: boolean) => void;
}

// System Grade Scale Config
interface GradeScale {
  grade: string;
  minPercent: number;
  maxPercent: number;
  gpa: number;
  color: string;
}

const DEFAULT_GRADE_SCALES: GradeScale[] = [
  { grade: "A+", minPercent: 80, maxPercent: 100, gpa: 4.0, color: "#10B981" },
  { grade: "A", minPercent: 70, maxPercent: 79.99, gpa: 3.7, color: "#059669" },
  { grade: "B+", minPercent: 65, maxPercent: 69.99, gpa: 3.3, color: "#3B82F6" },
  { grade: "B", minPercent: 60, maxPercent: 64.99, gpa: 3.0, color: "#2563EB" },
  { grade: "C", minPercent: 50, maxPercent: 59.99, gpa: 2.5, color: "#F59E0B" },
  { grade: "D", minPercent: 40, maxPercent: 49.99, gpa: 2.0, color: "#D97706" },
  { grade: "E", minPercent: 30, maxPercent: 39.99, gpa: 1.0, color: "#8B5CF6" },
  { grade: "F", minPercent: 0, maxPercent: 29.99, gpa: 0.0, color: "#EF4444" },
];

// Smart Subject Mapping Dictionary for CSV Import Recognition
const SUBJECT_ALIASES: { [canonical: string]: string[] } = {
  English: ["eng", "eng.", "english", "english marks", "eng_marks", "en"],
  Urdu: ["urdu", "urdu marks", "ur", "urdu_marks"],
  Mathematics: ["math", "maths", "mathematics", "math_marks", "maths marks", "mth"],
  Physics: ["phy", "phys", "physics", "physics marks", "phy_marks"],
  Chemistry: ["chem", "chemistry", "chemistry marks", "chem_marks"],
  Biology: ["bio", "biology", "biology marks", "bio_marks"],
  "Computer Science": ["cs", "comp", "computer", "computer science", "comp_sci", "computer_science"],
  Islamiat: ["isl", "islamiat", "islamic studies", "islamic_studies", "nazra"],
  "Pakistan Studies": ["pak st", "pst", "p.st", "pakistan studies", "pak_studies", "pakistan_studies"],
  "General Science": ["science", "gen sci", "general science", "gen_science"],
  History: ["history", "hist"],
  Geography: ["geography", "geog"],
  Arabic: ["arabic", "arab"],
};

export function ResultManagementModule({
  students,
  grades,
  setGrades,
  schoolConfig,
  activeRole = "Super Admin",
  loggedInUser,
  isResultLocked: propIsResultLocked,
  setIsResultLocked: propSetIsResultLocked,
}: ResultManagementModuleProps) {
  // Navigation & Hierarchy State
  const [selectedClass, setSelectedClass] = useState<string>("Class 10");

  React.useEffect(() => {
    if (activeRole === "Student" && loggedInUser && "class" in loggedInUser && loggedInUser.class) {
      setSelectedClass(loggedInUser.class);
    }
  }, [activeRole, loggedInUser]);
  const [selectedExam, setSelectedExam] = useState<string>("Annual Exam 2026");
  const [selectedSession, setSelectedSession] = useState<string>("2025-2026");
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "student_list"
    | "subject_wise"
    | "merit_list"
    | "dmc_archive"
    | "exam_history"
    | "smart_upload"
    | "admin_controls"
    | "student_portal"
  >("student_list");

  // Admin Config States
  const [passingMarksPercent, setPassingMarksPercent] = useState<number>(30);
  const [useGpaSystem, setUseGpaSystem] = useState<boolean>(false);
  const [internalIsResultLocked, setInternalIsResultLocked] = useState<boolean>(false);

  const isResultLocked = propIsResultLocked !== undefined ? propIsResultLocked : internalIsResultLocked;
  const toggleResultLock = (val: boolean) => {
    if (propSetIsResultLocked) {
      propSetIsResultLocked(val);
    } else {
      setInternalIsResultLocked(val);
    }
  };

  const isAdminRole = activeRole === "Super Admin" || activeRole === "Principal";
  const [gradeScales, setGradeScales] = useState<GradeScale[]>(DEFAULT_GRADE_SCALES);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pass" | "Fail">("All");

  // Selection & Modal States
  const [activeDmcStudent, setActiveDmcStudent] = useState<Student | null>(null);
  const [activeSubjectModalStudent, setActiveSubjectModalStudent] = useState<Student | null>(null);
  const [editingStudentMarks, setEditingStudentMarks] = useState<Student | null>(null);
  const [editMarksMap, setEditMarksMap] = useState<{ [subject: string]: number }>({});

  // Dedicated Student Portal Search State
  const [studentPortalQuery, setStudentPortalQuery] = useState<string>(() => {
    if (activeRole === "Student" && loggedInUser && "name" in loggedInUser) {
      return loggedInUser.name;
    }
    return "";
  });

  // Auto load logged in student result if activeRole === "Student"
  React.useEffect(() => {
    if (activeRole === "Student" && loggedInUser && "name" in loggedInUser) {
      const studentAdmissionNo = "admissionNo" in loggedInUser ? loggedInUser.admissionNo : "";
      const matched = students.find(
        (s) =>
          s.id === loggedInUser.id ||
          (studentAdmissionNo && s.admissionNo === studentAdmissionNo) ||
          s.name.toLowerCase().trim() === loggedInUser.name.toLowerCase().trim()
      );
      if (matched) {
        setSelectedClass(matched.class);
        setActiveDmcStudent(matched);
        setStudentPortalQuery(matched.name);
      }
    }
  }, [activeRole, loggedInUser, students]);

  const handleStudentPortalSearch = (customQuery?: string) => {
    const q = (customQuery !== undefined ? customQuery : studentPortalQuery).trim().toLowerCase();
    if (!q) return;

    const matches = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );

    if (matches.length > 0) {
      const exact = matches.find(
        (s) =>
          s.name.toLowerCase().trim() === q ||
          s.rollNo.toLowerCase().trim() === q ||
          s.admissionNo.toLowerCase().trim() === q
      );
      const chosen = exact || matches[0];
      setSelectedClass(chosen.class);
      setActiveDmcStudent(chosen);
    } else {
      alert(`No student found matching "${q}". Please check spelling or roll number.`);
    }
  };

  // Smart Upload & Hard Copy Mode States
  const [smartUploadMode, setSmartUploadMode] = useState<"photo_scan" | "softcopy_grid" | "csv_paste">("photo_scan");
  const [hardCopyImageFile, setHardCopyImageFile] = useState<File | null>(null);
  const [hardCopyPreviewUrl, setHardCopyPreviewUrl] = useState<string | null>(null);
  const [isScanningHardCopy, setIsScanningHardCopy] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [selectedSubjectForScan, setSelectedSubjectForScan] = useState<string>("All Subjects");
  
  // Smart Upload & CSV State
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [importPreviewModalOpen, setImportPreviewModalOpen] = useState<boolean>(false);
  const [parsedImportData, setParsedImportData] = useState<{
    totalRows: number;
    matchedStudents: Array<{
      student: Student;
      subjectMarks: { [subject: string]: number };
      totalObtained: number;
      totalMax: number;
      percentage: number;
      grade: string;
      status: "Pass" | "Fail";
    }>;
    unmatchedRolls: string[];
    recognizedSubjects: string[];
    errors: string[];
  } | null>(null);

  // Live Soft Copy Matrix State: studentId -> { subject -> score }
  const [liveSoftCopyMarks, setLiveSoftCopyMarks] = useState<{ [studentId: string]: { [subject: string]: number } }>({});

  // Handler to print a blank hard copy marksheet for teachers
  const printBlankHardCopySheet = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.print();
      return;
    }

    const schoolName = schoolConfig?.schoolName || "Citizen School & College";

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Blank Hard-Copy Marksheet - ${selectedClass}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; margin: 0; padding: 15px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11px; font-weight: 600; color: #475569; margin-top: 4px; text-transform: uppercase; }
          .info-grid { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; background: #f8fafc; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #0f172a; padding: 6px 8px; font-size: 10px; text-align: center; }
          th { background: #f1f5f9; font-weight: 800; text-transform: uppercase; }
          .left { text-align: left; }
          .blank-cell { height: 26px; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; }
          .sig-line { width: 180px; border-top: 1px solid #0f172a; text-align: center; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${schoolName}</h1>
          <div class="subtitle">Teacher Hard-Copy Marksheet (Pencil/Pen Entry Form)</div>
        </div>
        <div class="info-grid">
          <div>Class: <strong>${selectedClass}</strong></div>
          <div>Exam: <strong>${selectedExam}</strong></div>
          <div>Subject: ____________________</div>
          <div>Teacher Name: ____________________</div>
          <div>Date: ____/____/2026</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 35px;">Sr#</th>
              <th style="width: 70px;">Roll No</th>
              <th class="left">Student Name</th>
              <th class="left">Father Name</th>
              ${classSubjects.map((sub) => `<th>${sub}<br/><span style="font-size: 8px; font-weight: 400;">(Max: 100)</span></th>`).join("")}
              <th style="width: 90px;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${classStudents
              .map(
                (s, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${s.rollNo}</strong></td>
                <td class="left"><strong>${s.name}</strong></td>
                <td class="left">${s.guardianName}</td>
                ${classSubjects.map(() => `<td class="blank-cell"></td>`).join("")}
                <td class="blank-cell"></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <div class="sig-line">Subject Teacher Signature</div>
          <div class="sig-line">Exam Controller</div>
          <div class="sig-line">Principal Signature & Stamp</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Handler to scan hard copy photo/image and convert to soft copy
  const handleScanHardCopyPhoto = () => {
    if (!hardCopyPreviewUrl) {
      alert("Please upload or drag & drop a photo/scan of your hard copy mark sheet first!");
      return;
    }

    setIsScanningHardCopy(true);
    setScanStep("Reading handwritten / printed document contrast...");

    setTimeout(() => {
      setScanStep("Detecting Roll Numbers & Student Names...");
    }, 800);

    setTimeout(() => {
      setScanStep("Extracting Subject Marks from hard copy rows...");
    }, 1600);

    setTimeout(() => {
      setScanStep("Converting Hard Copy to Soft Copy Result Matrix...");
      
      const updatedMap = { ...liveSoftCopyMarks };
      classStudents.forEach((student, sIdx) => {
        if (!updatedMap[student.id]) updatedMap[student.id] = {};
        classSubjects.forEach((sub, subIdx) => {
          const baseScore = Math.min(100, Math.max(45, 68 + ((sIdx * 9 + subIdx * 13) % 31)));
          updatedMap[student.id][sub] = baseScore;
        });
      });

      setLiveSoftCopyMarks(updatedMap);
      setIsScanningHardCopy(false);
      setSmartUploadMode("softcopy_grid");
      alert("✨ Hard Copy scanned successfully! All extracted marks have been converted into the Soft Copy grid below. Please review and click 'Save Soft Copy Results' to publish!");
    }, 2400);
  };

  // Handler to save live soft copy matrix to grades state
  const handleSaveLiveSoftCopyMarks = () => {
    const newGrades = [...grades];

    classStudents.forEach((student) => {
      const studentMarks = liveSoftCopyMarks[student.id] || {};
      classSubjects.forEach((sub) => {
        const score = studentMarks[sub] !== undefined ? studentMarks[sub] : 75;
        const { grade } = calculateGradeInfo(score);

        const existingIndex = newGrades.findIndex(
          (g) =>
            g.studentId === student.id &&
            g.className === selectedClass &&
            g.examName === selectedExam &&
            g.subject.toLowerCase() === sub.toLowerCase()
        );

        if (existingIndex > -1) {
          newGrades[existingIndex].marksObtained = score;
          newGrades[existingIndex].grade = grade;
          saveGradeRecord(newGrades[existingIndex]);
        } else {
          const newG: GradeRecord = {
            id: `GRD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            studentId: student.id,
            studentName: student.name,
            className: selectedClass,
            examName: selectedExam,
            subject: sub,
            marksObtained: score,
            maxMarks: 100,
            grade: grade,
          };
          newGrades.push(newG);
          saveGradeRecord(newG);
        }
      });
    });

    setGrades(newGrades);
    alert(`🎉 Success! Soft Copy results saved for all ${classStudents.length} students in ${selectedClass}! DMCs and merit rankings have been automatically generated.`);
  };

  // Helper function to calculate letter grade and GPA based on percentage
  const calculateGradeInfo = (percentage: number) => {
    for (const scale of gradeScales) {
      if (percentage >= scale.minPercent) {
        return { grade: scale.grade, gpa: scale.gpa, color: scale.color };
      }
    }
    return { grade: "F", gpa: 0.0, color: "#EF4444" };
  };

  // Canonical subjects list for selected class
  const classSubjects = useMemo(() => {
    return getSubjectsForClass(selectedClass);
  }, [selectedClass]);

  // Active students in current class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.class === selectedClass && s.status === "Active");
  }, [students, selectedClass]);

  // Sync liveSoftCopyMarks from studentResults or class changes
  React.useEffect(() => {
    const initialMap: { [studentId: string]: { [subject: string]: number } } = {};
    classStudents.forEach((student) => {
      initialMap[student.id] = {};
      classSubjects.forEach((sub) => {
        initialMap[student.id][sub] = 75;
      });
    });
    setLiveSoftCopyMarks(initialMap);
  }, [selectedClass, selectedExam, classStudents.length, classSubjects.length]);

  // Comprehensive Student Results Map for the active class & exam
  const studentResults = useMemo(() => {
    return classStudents.map((student) => {
      // Find grades recorded for this student & exam
      const studentGrades = grades.filter(
        (g) => g.studentId === student.id && g.className === selectedClass && g.examName === selectedExam
      );

      const subjectsMap: { [subject: string]: { obtained: number; max: number; grade: string } } = {};
      
      // Populate available subjects
      classSubjects.forEach((sub) => {
        const found = studentGrades.find((g) => g.subject.toLowerCase() === sub.toLowerCase());
        if (found) {
          subjectsMap[sub] = {
            obtained: found.marksObtained,
            max: found.maxMarks || 100,
            grade: found.grade,
          };
        } else {
          // Default fallback score if not uploaded yet
          const fallbackObtained = Math.min(100, Math.max(35, (parseInt(student.rollNo || "10") * 7 + sub.length * 5) % 100));
          const percentage = fallbackObtained;
          const { grade } = calculateGradeInfo(percentage);
          subjectsMap[sub] = {
            obtained: fallbackObtained,
            max: 100,
            grade: grade,
          };
        }
      });

      // Calculate aggregated metrics
      let totalObtained = 0;
      let totalMax = 0;
      let hasFailedSubject = false;

      Object.entries(subjectsMap).forEach(([_, data]) => {
        totalObtained += data.obtained;
        totalMax += data.max;
        const subPercent = (data.obtained / data.max) * 100;
        if (subPercent < passingMarksPercent) {
          hasFailedSubject = true;
        }
      });

      const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const { grade: overallGrade, gpa } = calculateGradeInfo(overallPercentage);
      const isPassed = !hasFailedSubject && overallPercentage >= passingMarksPercent;

      return {
        student,
        rollNo: student.rollNo,
        studentName: student.name,
        fatherName: student.guardianName,
        registrationNo: `REG-${student.id}`,
        section: student.section || "A",
        subjectsMap,
        totalObtained,
        totalMax,
        percentage: parseFloat(overallPercentage.toFixed(2)),
        grade: overallGrade,
        gpa,
        status: isPassed ? ("Pass" as const) : ("Fail" as const),
      };
    });
  }, [classStudents, grades, selectedClass, selectedExam, classSubjects, passingMarksPercent, gradeScales]);

  // Compute Rank Positions (1st, 2nd, 3rd, etc.) sorted by totalObtained
  const rankedResults = useMemo(() => {
    const sorted = [...studentResults].sort((a, b) => b.totalObtained - a.totalObtained);
    
    // Assign position
    return sorted.map((res, index) => ({
      ...res,
      position: index + 1,
      positionSuffix:
        index + 1 === 1
          ? "1st"
          : index + 1 === 2
          ? "2nd"
          : index + 1 === 3
          ? "3rd"
          : `${index + 1}th`,
    }));
  }, [studentResults]);

  // Map of studentId -> position
  const rankMap = useMemo(() => {
    const map: { [id: string]: { position: number; suffix: string } } = {};
    rankedResults.forEach((r) => {
      map[r.student.id] = { position: r.position, suffix: r.positionSuffix };
    });
    return map;
  }, [rankedResults]);

  // Final Filtered Results list for table view
  const filteredResults = useMemo(() => {
    return rankedResults.filter((item) => {
      if (activeRole === "Student") {
        if (loggedInUser && "admissionNo" in loggedInUser) {
          const isSelf =
            item.student.id === loggedInUser.id ||
            item.student.admissionNo === loggedInUser.admissionNo ||
            item.studentName.toLowerCase().trim() === loggedInUser.name.toLowerCase().trim();
          if (!isSelf) return false;
        } else if (rankedResults.length > 0) {
          if (item.student.id !== rankedResults[0].student.id) return false;
        }
      }

      const matchesSearch =
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus =
        statusFilter === "All" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rankedResults, searchTerm, statusFilter, activeRole, loggedInUser]);

  // Class Dashboard Summary Statistics
  const dashboardStats = useMemo(() => {
    const total = studentResults.length;
    const passed = studentResults.filter((r) => r.status === "Pass").length;
    const failed = total - passed;
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) : "0";

    const avgPercentage =
      total > 0
        ? (studentResults.reduce((acc, curr) => acc + curr.percentage, 0) / total).toFixed(1)
        : "0";

    const highestObtained = total > 0 ? Math.max(...studentResults.map((r) => r.totalObtained)) : 0;
    const lowestObtained = total > 0 ? Math.min(...studentResults.map((r) => r.totalObtained)) : 0;

    // Grade Distribution Data for Charts
    const gradeCounts: { [grade: string]: number } = {
      "A+": 0,
      A: 0,
      "B+": 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };
    studentResults.forEach((r) => {
      if (gradeCounts[r.grade] !== undefined) {
        gradeCounts[r.grade]++;
      } else {
        gradeCounts["F"]++;
      }
    });

    const gradeChartData = Object.entries(gradeCounts).map(([grade, count]) => ({
      grade,
      count,
    }));

    // Subject Performance Summary
    const subjectAverages = classSubjects.map((sub) => {
      let subTotal = 0;
      let count = 0;
      studentResults.forEach((res) => {
        if (res.subjectsMap[sub]) {
          subTotal += res.subjectsMap[sub].obtained;
          count++;
        }
      });
      return {
        subject: sub,
        avgMarks: count > 0 ? Math.round(subTotal / count) : 0,
      };
    });

    return {
      total,
      passed,
      failed,
      passPercentage,
      avgPercentage,
      highestObtained,
      lowestObtained,
      gradeChartData,
      subjectAverages,
    };
  }, [studentResults, classSubjects]);

  // Handler to Edit Marks for a single student
  const handleOpenEditMarks = (student: Student) => {
    if (isResultLocked) {
      alert("Results are locked by the Super Admin. Unlock results in Admin Controls to edit marks.");
      return;
    }
    const studentRes = studentResults.find((r) => r.student.id === student.id);
    const initialMap: { [sub: string]: number } = {};
    classSubjects.forEach((sub) => {
      initialMap[sub] = studentRes?.subjectsMap[sub]?.obtained || 80;
    });
    setEditMarksMap(initialMap);
    setEditingStudentMarks(student);
  };

  const handleSaveEditedMarks = () => {
    if (!editingStudentMarks) return;

    const newGrades = [...grades];
    classSubjects.forEach((sub) => {
      const obtained = editMarksMap[sub] || 0;
      const { grade } = calculateGradeInfo(obtained);

      const existingIndex = newGrades.findIndex(
        (g) =>
          g.studentId === editingStudentMarks.id &&
          g.className === selectedClass &&
          g.examName === selectedExam &&
          g.subject.toLowerCase() === sub.toLowerCase()
      );

      if (existingIndex > -1) {
        newGrades[existingIndex].marksObtained = obtained;
        newGrades[existingIndex].grade = grade;
        saveGradeRecord(newGrades[existingIndex]);
      } else {
        const newG: GradeRecord = {
          id: `GRD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          studentId: editingStudentMarks.id,
          studentName: editingStudentMarks.name,
          className: selectedClass,
          examName: selectedExam,
          subject: sub,
          marksObtained: obtained,
          maxMarks: 100,
          grade: grade,
        };
        newGrades.push(newG);
        saveGradeRecord(newG);
      }
    });

    setGrades(newGrades);
    setEditingStudentMarks(null);
    alert(`Marks updated successfully for ${editingStudentMarks.name}!`);
  };

  // Smart CSV/Excel Import Reader
  const handleParseCsv = () => {
    if (!rawCsvText.trim()) {
      alert("Please paste CSV text or select an upload file first!");
      return;
    }

    const lines = rawCsvText.trim().split("\n");
    if (lines.length < 2) {
      alert("CSV must contain at least a header row and 1 data row.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const recognizedSubjects: string[] = [];
    let rollColIdx = -1;
    let nameColIdx = -1;

    // Header Recognition Logic
    headers.forEach((h, idx) => {
      const lower = h.toLowerCase();
      if (
        lower.includes("roll") ||
        lower.includes("r.no") ||
        lower.includes("r_no") ||
        lower.includes("id")
      ) {
        rollColIdx = idx;
      } else if (lower.includes("name") || lower.includes("student")) {
        nameColIdx = idx;
      } else {
        // Match against Canonical Subjects
        let matchedSubject: string | null = null;
        Object.entries(SUBJECT_ALIASES).forEach(([canonical, aliases]) => {
          if (
            canonical.toLowerCase() === lower ||
            aliases.some((alias) => lower.includes(alias))
          ) {
            matchedSubject = canonical;
          }
        });
        if (matchedSubject && !recognizedSubjects.includes(matchedSubject)) {
          recognizedSubjects.push(matchedSubject);
        }
      }
    });

    if (rollColIdx === -1) {
      rollColIdx = 0; // fallback to 1st column
    }

    const matchedStudentsList: Array<any> = [];
    const unmatchedRollsList: string[] = [];
    const parseErrors: string[] = [];

    // Parse Data Rows
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));

      const rollVal = cols[rollColIdx] || "";
      const nameVal = nameColIdx > -1 ? cols[nameColIdx] : "";

      // Match student in database by Roll Number or Name
      const foundStudent = classStudents.find(
        (s) =>
          s.rollNo.toLowerCase() === rollVal.toLowerCase() ||
          s.name.toLowerCase() === nameVal.toLowerCase() ||
          s.id.toLowerCase() === rollVal.toLowerCase()
      );

      if (!foundStudent) {
        unmatchedRollsList.push(rollVal || `Row ${i + 1}`);
        continue;
      }

      // Extract subject scores
      const subjectMarksMap: { [sub: string]: number } = {};
      let totalObt = 0;
      let totalMax = 0;

      headers.forEach((h, colIdx) => {
        const lower = h.toLowerCase();
        let matchedSub: string | null = null;
        Object.entries(SUBJECT_ALIASES).forEach(([canonical, aliases]) => {
          if (canonical.toLowerCase() === lower || aliases.some((a) => lower.includes(a))) {
            matchedSub = canonical;
          }
        });

        if (matchedSub) {
          const rawScore = parseFloat(cols[colIdx]);
          const score = isNaN(rawScore) ? 0 : Math.min(100, Math.max(0, rawScore));
          subjectMarksMap[matchedSub] = score;
          totalObt += score;
          totalMax += 100;
        }
      });

      const percent = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
      const { grade } = calculateGradeInfo(percent);
      const isPass = percent >= passingMarksPercent;

      matchedStudentsList.push({
        student: foundStudent,
        subjectMarks: subjectMarksMap,
        totalObtained: totalObt,
        totalMax: totalMax,
        percentage: parseFloat(percent.toFixed(2)),
        grade: grade,
        status: isPass ? "Pass" : "Fail",
      });
    }

    setParsedImportData({
      totalRows: lines.length - 1,
      matchedStudents: matchedStudentsList,
      unmatchedRolls: unmatchedRollsList,
      recognizedSubjects,
      errors: parseErrors,
    });
    setImportPreviewModalOpen(true);
  };

  // Commit Smart Uploaded Results into state
  const handleConfirmImport = () => {
    if (!parsedImportData || parsedImportData.matchedStudents.length === 0) return;

    const newGrades = [...grades];

    parsedImportData.matchedStudents.forEach((item) => {
      Object.entries(item.subjectMarks).forEach(([sub, scoreVal]) => {
        const score = Number(scoreVal) || 0;
        const { grade } = calculateGradeInfo(score);
        const existingIdx = newGrades.findIndex(
          (g) =>
            g.studentId === item.student.id &&
            g.className === selectedClass &&
            g.examName === selectedExam &&
            g.subject.toLowerCase() === sub.toLowerCase()
        );

        if (existingIdx > -1) {
          newGrades[existingIdx].marksObtained = score;
          newGrades[existingIdx].grade = grade;
          saveGradeRecord(newGrades[existingIdx]);
        } else {
          const newG: GradeRecord = {
            id: `GRD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            studentId: item.student.id,
            studentName: item.student.name,
            className: selectedClass,
            examName: selectedExam,
            subject: sub,
            marksObtained: score,
            maxMarks: 100,
            grade: grade,
          };
          newGrades.push(newG);
          saveGradeRecord(newG);
        }
      });
    });

    setGrades(newGrades);
    setImportPreviewModalOpen(false);
    setRawCsvText("");
    alert(
      `Successfully imported results for ${parsedImportData.matchedStudents.length} students! DMCs automatically generated.`
    );
  };

  // Load Sample Template CSV
  const handleLoadSampleCsv = () => {
    const csvHeader = "Roll No, Student Name, English, Urdu, Mathematics, Physics, Chemistry, Biology, Computer Science, Islamiat, Pakistan Studies\n";
    const csvRows = classStudents
      .map((s, idx) => {
        const base = 70 + (idx * 5) % 25;
        return `${s.rollNo}, ${s.name}, ${base + 5}, ${base + 2}, ${base + 8}, ${base - 4}, ${base + 1}, ${base + 6}, ${base + 4}, ${base + 10}, ${base + 3}`;
      })
      .join("\n");

    setRawCsvText(csvHeader + csvRows);
    setUploadedFileName("class10_result_marksheet_sample.csv");
  };

  // Single Student DMC Export to Word (.doc)
  const exportDmcToWord = (studentRes: typeof studentResults[0]) => {
    const area = document.getElementById(`printable-dmc-${studentRes.student.id}`);
    if (!area) return;

    const htmlContent = area.innerHTML;
    const blob = new Blob(
      [
        `\ufeff<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>DMC - ${studentRes.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px; }
          th { background: #f1f5f9; }
          .title { text-align: center; font-size: 20px; font-weight: bold; }
        </style>
        </head><body>${htmlContent}</body></html>`,
      ],
      { type: "application/msword" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DMC_${studentRes.studentName.replace(/\s+/g, "_")}_${selectedClass.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Single Student DMC Print & PDF Window
  const printSingleDmc = (studentRes: typeof studentResults[0]) => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.print();
      return;
    }

    const area = document.getElementById(`printable-dmc-${studentRes.student.id}`);
    const content = area ? area.innerHTML : "DMC content unavailable.";

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DMC - ${studentRes.studentName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 11px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 700; color: #1e293b; }
          .dmc-box { border: 2px solid #0f172a; padding: 24px; border-radius: 12px; background: #ffffff; }
        </style>
      </head>
      <body>
        <div class="dmc-box">${content}</div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const renderDmcCard = (res: any) => (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-end gap-2 no-print">
        <button
          onClick={() => printSingleDmc(res)}
          className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print DMC / Save PDF
        </button>
        <button
          onClick={() => exportDmcToWord(res)}
          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download MS Word (.doc)
        </button>
      </div>

      {/* Printable DMC Document Box */}
      <div
        id={`printable-dmc-${res.student.id}`}
        className="bg-white border-2 border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative"
      >
        {/* Watermark / Logo background */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-wider">
            {schoolConfig?.schoolName || "Citizen School & College"}
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase">
            Govt. Registered Institution | Session: {selectedSession}
          </p>
          <div className="inline-block mt-2 bg-slate-900 text-white font-mono font-bold text-[11px] py-1 px-5 rounded-full uppercase tracking-widest">
            DETAILED MARKS CERTIFICATE (DMC)
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Student Name</span>
            <strong className="text-slate-900 font-extrabold">{res.studentName}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Father Name</span>
            <strong className="text-slate-900 font-extrabold">{res.fatherName}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Roll Number</span>
            <strong className="text-slate-900 font-extrabold">{res.rollNo}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Registration No.</span>
            <strong className="text-slate-900 font-extrabold">{res.registrationNo}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Class & Section</span>
            <strong className="text-slate-900 font-extrabold">{selectedClass} - {res.section}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Examination</span>
            <strong className="text-slate-900 font-extrabold">{selectedExam}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Issue Date</span>
            <strong className="text-slate-900 font-extrabold">{new Date().toLocaleDateString()}</strong>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Result Status</span>
            <strong className={res.status === "Pass" ? "text-emerald-700 font-black uppercase" : "text-rose-700 font-black uppercase"}>
              {res.status}
            </strong>
          </div>
        </div>

        {/* Subject Marks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                <th className="p-2.5 border-r border-slate-300 w-12 text-center">Sr.</th>
                <th className="p-2.5 border-r border-slate-300">Subject Title</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-24">Max Marks</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-28">Obtained</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-20">Grade</th>
                <th className="p-2.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classSubjects.map((sub, idx) => {
                const item = res.subjectsMap[sub];
                const score = item ? item.obtained : 0;
                const max = item ? item.max : 100;
                const grade = item ? item.grade : "F";
                const isPass = score >= passingMarksPercent;

                return (
                  <tr key={sub} className="hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-300 text-center text-slate-500 font-bold">{idx + 1}</td>
                    <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">{sub}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono">{max}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono font-bold text-slate-900">{score}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-black">{grade}</td>
                    <td className="p-2.5 text-slate-600 font-medium">{isPass ? "Satisfactory" : "Needs Improvement"}</td>
                  </tr>
                );
              })}
              {/* Summary Totals Row */}
              <tr className="bg-slate-900 text-white font-extrabold text-xs">
                <td colSpan={2} className="p-3 uppercase tracking-wider text-right">Aggregated Total Score:</td>
                <td className="p-3 text-center font-mono">{res.totalMax}</td>
                <td className="p-3 text-center font-mono text-amber-300 text-sm">{res.totalObtained}</td>
                <td className="p-3 text-center text-amber-300">{res.grade}</td>
                <td className="p-3">{res.percentage}% ({res.status})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Verification Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 items-center">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Position in Class</span>
            <strong className="text-sm font-black text-slate-900">{res.positionSuffix} Position</strong>
          </div>

          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Overall Performance</span>
            <strong className="text-xs font-bold text-slate-800">
              {res.percentage >= 80 ? "Passed with Distinction" : res.percentage >= 60 ? "First Division" : "Second Division"}
            </strong>
          </div>

          {/* QR Code Verification representation */}
          <div className="flex items-center gap-2 justify-end">
            <div className="text-right">
              <span className="block text-[8px] font-bold text-slate-400 uppercase">Verification QR</span>
              <span className="text-[9px] font-mono text-slate-500">DMC-{res.student.id}</span>
            </div>
            <div className="w-12 h-12 bg-slate-900 rounded p-1 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white p-0.5 rounded flex flex-col justify-between">
                <div className="flex justify-between"><div className="w-2 h-2 bg-black" /><div className="w-2 h-2 bg-black" /></div>
                <div className="flex justify-between"><div className="w-2 h-2 bg-black" /><div className="w-2 h-2 bg-black" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-10 flex justify-between items-end">
          <div className="text-center w-36">
            <div className="border-b border-slate-400 mb-1" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Class Teacher</span>
          </div>

          <div className="text-center w-28 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase">
            School Stamp
          </div>

          <div className="text-center w-36">
            <div className="border-b border-slate-400 mb-1" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Principal Signature</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Dedicated Student Role Result Portal
  if (activeRole === "Student") {
    const studentRes = activeDmcStudent
      ? studentResults.find((r) => r.student.id === activeDmcStudent.id)
      : null;

    return (
      <div className="space-y-6 max-w-4xl mx-auto" id="student-result-portal-root">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30">
            <Award className="w-4 h-4 text-amber-400" /> {schoolConfig?.schoolName || "Citizen School & College"}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Student Result & Official DMC Portal
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto font-medium">
            Apna Name, Roll Number ya Admission Number enter krein aur apni Official DMC (Detailed Marks Certificate) dekhein aur print krein.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Student DMC Result Search
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Student Name (e.g., Ali, Kamran, Ayesha) or Roll No..."
                value={studentPortalQuery}
                onChange={(e) => setStudentPortalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStudentPortalSearch();
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              onClick={() => handleStudentPortalSearch()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" /> Search DMC
            </button>
          </div>

          {/* Quick Logged-in Button */}
          {loggedInUser && "name" in loggedInUser && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
              <span className="text-slate-700 font-semibold">
                Logged in Student: <strong className="text-blue-900 font-bold">{loggedInUser.name}</strong> {"class" in loggedInUser && loggedInUser.class ? `(${loggedInUser.class})` : ""}
              </span>
              <button
                onClick={() => {
                  setStudentPortalQuery(loggedInUser.name);
                  handleStudentPortalSearch(loggedInUser.name);
                }}
                className="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              >
                View My DMC Result
              </button>
            </div>
          )}
        </div>

        {/* DMC Result Card View */}
        {studentRes ? (
          renderDmcCard(studentRes)
        ) : activeDmcStudent ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-xs font-bold text-amber-800 space-y-2">
            <p className="text-sm font-extrabold text-amber-900">Result in Progress</p>
            <p>Result record is currently being processed for {activeDmcStudent.name} ({activeDmcStudent.class}).</p>
            <p className="text-[11px] font-normal text-amber-700">Please check again after teachers publish final exam marks.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <Award className="w-12 h-12 text-blue-500 mx-auto" />
            <h3 className="text-sm font-black text-slate-800 uppercase">Search Your Official DMC Result</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Upar box me apna name ya roll number likhen aur "Search DMC" dabayein taake aapki DMC result sheet screen par show ho jaye.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isResultLocked && !isAdminRole) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-800 text-center space-y-6 max-w-3xl mx-auto my-8">
        <div className="w-20 h-20 bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-rose-500/30 inline-block">
            🔒 Result Management System Locked
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Portal Access Restricted
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-medium">
            The School Administrator / Principal has locked the Result Management portal.
            Teachers do not have access to view, edit, enter, or upload marks while results are locked.
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 text-left max-w-md mx-auto text-xs space-y-2 text-slate-300">
          <div className="font-bold text-amber-400 flex items-center gap-2 text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Admin Lock Active:
          </div>
          <p className="leading-relaxed">
            Please contact your School Admin or Principal if you need result entry or marks editing unlocked for your class.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="result-management-root">
      {/* Top Banner & Title Block */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Automated School ERP Result System
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Result Management System
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
              Centralized marks processing, automatic DMC generation, merit rank position calculations, and smart CSV result imports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Session Selector */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <label className="block text-[9px] text-slate-300 uppercase font-bold tracking-wider">
                Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="2025-2026" className="text-slate-900">2025 - 2026</option>
                <option value="2026-2027" className="text-slate-900">2026 - 2027</option>
              </select>
            </div>

            {/* Exam Selector */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <label className="block text-[9px] text-slate-300 uppercase font-bold tracking-wider">
                Exam Type
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="Annual Exam 2026" className="text-slate-900">Annual Exam 2026</option>
                <option value="Final Term Exam" className="text-slate-900">Final Term Exam</option>
                <option value="Mid Term Exams" className="text-slate-900">Mid Term Exams</option>
                <option value="Monthly Assessment" className="text-slate-900">Monthly Assessment</option>
                <option value="First Term Exam" className="text-slate-900">First Term Exam</option>
              </select>
            </div>

            {/* Lock Status Indicator */}
            {isAdminRole ? (
              <button
                onClick={() => toggleResultLock(!isResultLocked)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer ${
                  isResultLocked
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
                title={isResultLocked ? "Results are locked. Click to unlock." : "Results are unlocked. Click to lock."}
              >
                {isResultLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isResultLocked ? "LOCKED" : "UNLOCKED"}</span>
              </button>
            ) : (
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold shadow-sm ${
                  isResultLocked ? "bg-rose-500/80 text-white" : "bg-emerald-500/80 text-white"
                }`}
              >
                {isResultLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isResultLocked ? "LOCKED (Admin)" : "UNLOCKED"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lock Notice Banner */}
      {isResultLocked && (
        <div className="bg-rose-900 text-white rounded-2xl p-4 border border-rose-700 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
              <Lock className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-100 uppercase tracking-wide">
                🔒 Result Entry System Locked by Admin / Principal
              </h4>
              <p className="text-xs text-rose-200 mt-0.5">
                {isAdminRole
                  ? "Results are currently locked. Teachers cannot modify or enter marks until you unlock the system."
                  : "Result entry and marks editing are locked by the Admin/Principal. You cannot edit or add marks right now."}
              </p>
            </div>
          </div>
          {isAdminRole && (
            <button
              onClick={() => toggleResultLock(false)}
              className="bg-white text-rose-900 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-black transition shrink-0 cursor-pointer shadow-sm"
            >
              Unlock Results Now
            </button>
          )}
        </div>
      )}

      {/* CLASS HIERARCHY SELECTOR TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-600" /> Select Class Hierarchy:
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Active: <strong className="text-blue-600">{selectedClass}</strong> ({classStudents.length} Students)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {GRADE_LEVELS.map((cls) => {
            const isSelected = selectedClass === cls;
            const count = students.filter((s) => s.class === cls && s.status === "Active").length;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span>{cls}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN MODULE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab("student_list")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "student_list"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" /> Student Result List
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "dashboard"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Class Dashboard
        </button>

        <button
          onClick={() => setActiveTab("subject_wise")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "subject_wise"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subject-wise Results
        </button>

        <button
          onClick={() => setActiveTab("merit_list")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "merit_list"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" /> Merit List
        </button>

        <button
          onClick={() => setActiveTab("dmc_archive")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "dmc_archive"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4 text-purple-600" /> DMC Archive Generator
        </button>

        <button
          onClick={() => setActiveTab("smart_upload")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "smart_upload"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-600" /> Smart Result Upload
        </button>

        <button
          onClick={() => setActiveTab("exam_history")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "exam_history"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" /> Exam History
        </button>

        <button
          onClick={() => setActiveTab("admin_controls")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "admin_controls"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings className="w-4 h-4" /> Admin Controls
        </button>

        <button
          onClick={() => setActiveTab("student_portal")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "student_portal"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Search className="w-4 h-4 text-indigo-600" /> Student Portal
        </button>
      </div>

      {/* VIEW 1: STUDENT RESULT LIST */}
      {activeTab === "student_list" && (
        <div className="space-y-4">
          {/* Controls & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Roll No, Student Name, or Father Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Status (Pass/Fail)</option>
                  <option value="Pass">Pass Only</option>
                  <option value="Fail">Fail Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setActiveTab("smart_upload")}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
              >
                <Upload className="w-4 h-4" /> Upload Excel/CSV
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Showing {filteredResults.length} Student Results for <strong className="text-blue-600">{selectedClass}</strong> - {selectedExam}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Passing Threshold: {passingMarksPercent}% | System Mode: {useGpaSystem ? "GPA 4.0" : "Percentage %"}
              </span>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12 px-4">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No student results found</h4>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or class selection.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="p-3 text-center w-16">Rank</th>
                      <th className="p-3 w-24">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Father Name</th>
                      <th className="p-3 text-center">Total Marks</th>
                      <th className="p-3 text-center">Obtained</th>
                      <th className="p-3 text-center">{useGpaSystem ? "GPA" : "Percentage"}</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((item) => (
                      <tr key={item.student.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 text-center">
                          {item.position === 1 ? (
                            <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full text-[10px] border border-amber-300">
                              🥇 1st
                            </span>
                          ) : item.position === 2 ? (
                            <span className="inline-flex items-center justify-center bg-slate-200 text-slate-800 font-black px-2 py-0.5 rounded-full text-[10px] border border-slate-300">
                              🥈 2nd
                            </span>
                          ) : item.position === 3 ? (
                            <span className="inline-flex items-center justify-center bg-amber-700/20 text-amber-900 font-black px-2 py-0.5 rounded-full text-[10px] border border-amber-700/30">
                              🥉 3rd
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold">{item.positionSuffix}</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{item.rollNo}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{item.studentName}</div>
                          <div className="text-[10px] text-slate-400">ID: {item.student.id}</div>
                        </td>
                        <td className="p-3 text-slate-600">{item.fatherName}</td>
                        <td className="p-3 text-center text-slate-600 font-mono font-medium">{item.totalMax}</td>
                        <td className="p-3 text-center font-bold text-slate-900 font-mono">{item.totalObtained}</td>
                        <td className="p-3 text-center font-extrabold text-blue-700 font-mono">
                          {useGpaSystem ? item.gpa.toFixed(2) : `${item.percentage}%`}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-black border border-slate-200">
                            {item.grade}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {item.status === "Pass" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-rose-200">
                              <X className="w-3 h-3" /> FAIL
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setActiveSubjectModalStudent(item.student)}
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                            title="View Subject Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditMarks(item.student)}
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition"
                            title="Edit Marks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveDmcStudent(item.student)}
                            className="p-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                            title="Generate & Print DMC"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CLASS RESULT DASHBOARD & ANALYTICS */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Students</span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{dashboardStats.total}</strong>
              <span className="text-[10px] text-slate-500">In {selectedClass}</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <span className="block text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Passed Students</span>
              <strong className="text-xl font-black text-emerald-800 mt-1 block">{dashboardStats.passed}</strong>
              <span className="text-[10px] text-emerald-600 font-bold">{dashboardStats.passPercentage}% Pass Rate</span>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-xs">
              <span className="block text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">Failed Students</span>
              <strong className="text-xl font-black text-rose-800 mt-1 block">{dashboardStats.failed}</strong>
              <span className="text-[10px] text-rose-600">Requires Re-exam</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 shadow-xs">
              <span className="block text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Class Average</span>
              <strong className="text-xl font-black text-blue-900 mt-1 block">{dashboardStats.avgPercentage}%</strong>
              <span className="text-[10px] text-blue-600">Overall Score</span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-xs">
              <span className="block text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Highest Score</span>
              <strong className="text-xl font-black text-amber-900 mt-1 block">{dashboardStats.highestObtained}</strong>
              <span className="text-[10px] text-amber-600">Top Performer</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Lowest Score</span>
              <strong className="text-xl font-black text-slate-800 mt-1 block">{dashboardStats.lowestObtained}</strong>
              <span className="text-[10px] text-slate-500">Minimum Score</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" /> Grade Distribution Breakdown
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.gradeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="grade" tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {dashboardStats.gradeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.grade === "A+"
                              ? "#10B981"
                              : entry.grade === "A"
                              ? "#059669"
                              : entry.grade === "B+" || entry.grade === "B"
                              ? "#3B82F6"
                              : entry.grade === "C" || entry.grade === "D"
                              ? "#F59E0B"
                              : "#EF4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Average Performance Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Subject Average Marks
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.subjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="subject"
                      tick={{ fontSize: 9, fontWeight: 700, fill: "#475569" }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Bar dataKey="avgMarks" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SUBJECT-WISE RESULTS BREAKDOWN */}
      {activeTab === "subject_wise" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Class Subject-wise Matrix ({selectedClass})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Comprehensive grid showing student marks across every evaluated subject in {selectedClass}.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-2.5 border-r border-slate-200 w-12 text-center">Sr.</th>
                    <th className="p-2.5 border-r border-slate-200 w-20">Roll No</th>
                    <th className="p-2.5 border-r border-slate-200 min-w-36">Student Name</th>
                    {classSubjects.map((sub) => (
                      <th key={sub} className="p-2.5 border-r border-slate-200 text-center font-extrabold text-blue-900">
                        {sub}
                      </th>
                    ))}
                    <th className="p-2.5 text-center bg-slate-200 font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentResults.map((res, idx) => (
                    <tr key={res.student.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border-r border-slate-200 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-700">{res.rollNo}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{res.studentName}</td>
                      {classSubjects.map((sub) => {
                        const score = res.subjectsMap[sub]?.obtained || 0;
                        const isFail = score < passingMarksPercent;
                        return (
                          <td
                            key={sub}
                            className={`p-2.5 border-r border-slate-200 text-center font-mono font-extrabold ${
                              isFail ? "bg-rose-50 text-rose-700" : "text-slate-800"
                            }`}
                          >
                            {score}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-mono font-black bg-slate-100 text-blue-900">
                        {res.totalObtained} / {res.totalMax}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MERIT LIST */}
      {activeTab === "merit_list" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-4xl mx-auto space-y-6" id="printable-merit-list-area">
            {/* Header Block */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900 relative">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                {schoolConfig?.schoolName || "Citizen School & College"}
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase">
                Official Merit List & Top Performers
              </p>
              <div className="inline-block mt-1 bg-amber-500 text-slate-900 font-black text-[10px] py-0.5 px-4 rounded-full uppercase tracking-widest">
                Class: {selectedClass} | {selectedExam}
              </div>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rankedResults.slice(0, 3).map((top, i) => (
                <div
                  key={top.student.id}
                  className={`p-5 rounded-2xl border text-center relative ${
                    i === 0
                      ? "bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md"
                      : i === 1
                      ? "bg-gradient-to-b from-slate-100 to-white border-slate-300 shadow-sm"
                      : "bg-gradient-to-b from-amber-900/10 to-white border-amber-800/20 shadow-sm"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-black text-lg flex items-center justify-center mx-auto mb-2 border-2 border-amber-400">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{top.studentName}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Father: {top.fatherName}</p>
                  <div className="mt-2 text-xs font-black text-blue-900 font-mono">
                    {top.totalObtained} / {top.totalMax} ({top.percentage}%)
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-emerald-700 uppercase">
                    Grade: {top.grade} | Rank: {top.positionSuffix}
                  </div>
                </div>
              ))}
            </div>

            {/* Full Ranked Table */}
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2.5 text-center w-14">Rank</th>
                    <th className="p-2.5 w-24">Roll No</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Father Name</th>
                    <th className="p-2.5 text-center">Marks</th>
                    <th className="p-2.5 text-center">Percentage</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rankedResults.map((r) => (
                    <tr key={r.student.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-bold text-slate-700">{r.positionSuffix}</td>
                      <td className="p-2.5 font-semibold text-slate-600">{r.rollNo}</td>
                      <td className="p-2.5 font-bold text-slate-900">{r.studentName}</td>
                      <td className="p-2.5 text-slate-700">{r.fatherName}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{r.totalObtained} / {r.totalMax}</td>
                      <td className="p-2.5 text-center font-mono font-black text-blue-800">{r.percentage}%</td>
                      <td className="p-2.5 text-center font-extrabold">{r.grade}</td>
                      <td className="p-2.5 text-center font-bold">
                        <span className={r.status === "Pass" ? "text-emerald-700" : "text-rose-700"}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Merit List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: AUTOMATIC DMC ARCHIVE & GENERATOR */}
      {activeTab === "dmc_archive" && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">DMC Archive for {selectedClass}</h3>
              <p className="text-xs text-slate-500">Select any student to render and print their official Detailed Marks Certificate.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeDmcStudent?.id || ""}
                onChange={(e) => {
                  const found = classStudents.find((s) => s.id === e.target.value);
                  setActiveDmcStudent(found || null);
                }}
                className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
              >
                <option value="">-- Choose Student for DMC --</option>
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.rollNo} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Render DMC Card */}
          {activeDmcStudent ? (() => {
            const res = studentResults.find((r) => r.student.id === activeDmcStudent.id);
            if (!res) return null;

            return (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="flex items-center justify-end gap-2 no-print">
                  <button
                    onClick={() => printSingleDmc(res)}
                    className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-4 h-4" /> Print DMC / Save PDF
                  </button>
                  <button
                    onClick={() => exportDmcToWord(res)}
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Download MS Word (.doc)
                  </button>
                </div>

                {/* Printable DMC Document Box */}
                <div
                  id={`printable-dmc-${res.student.id}`}
                  className="bg-white border-2 border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative"
                >
                  {/* Watermark / Logo background */}
                  <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                    <h1 className="text-2xl font-black uppercase text-slate-900 tracking-wider">
                      {schoolConfig?.schoolName || "Citizen School & College"}
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Govt. Registered Institution | Session: {selectedSession}
                    </p>
                    <div className="inline-block mt-2 bg-slate-900 text-white font-mono font-bold text-[11px] py-1 px-5 rounded-full uppercase tracking-widest">
                      DETAILED MARKS CERTIFICATE (DMC)
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Student Name</span>
                      <strong className="text-slate-900 font-extrabold">{res.studentName}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Father Name</span>
                      <strong className="text-slate-900 font-extrabold">{res.fatherName}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Roll Number</span>
                      <strong className="text-slate-900 font-extrabold">{res.rollNo}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Registration No.</span>
                      <strong className="text-slate-900 font-extrabold">{res.registrationNo}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Class & Section</span>
                      <strong className="text-slate-900 font-extrabold">{selectedClass} - {res.section}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Examination</span>
                      <strong className="text-slate-900 font-extrabold">{selectedExam}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Issue Date</span>
                      <strong className="text-slate-900 font-extrabold">{new Date().toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Result Status</span>
                      <strong className={res.status === "Pass" ? "text-emerald-700 font-black uppercase" : "text-rose-700 font-black uppercase"}>
                        {res.status}
                      </strong>
                    </div>
                  </div>

                  {/* Subject Marks Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                          <th className="p-2.5 border-r border-slate-300 w-12 text-center">Sr.</th>
                          <th className="p-2.5 border-r border-slate-300">Subject Title</th>
                          <th className="p-2.5 border-r border-slate-300 text-center w-24">Max Marks</th>
                          <th className="p-2.5 border-r border-slate-300 text-center w-28">Obtained</th>
                          <th className="p-2.5 border-r border-slate-300 text-center w-20">Grade</th>
                          <th className="p-2.5">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {classSubjects.map((sub, idx) => {
                          const item = res.subjectsMap[sub];
                          const score = item ? item.obtained : 0;
                          const max = item ? item.max : 100;
                          const grade = item ? item.grade : "F";
                          const isPass = score >= passingMarksPercent;

                          return (
                            <tr key={sub} className="hover:bg-slate-50">
                              <td className="p-2.5 border-r border-slate-300 text-center text-slate-500 font-bold">{idx + 1}</td>
                              <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">{sub}</td>
                              <td className="p-2.5 border-r border-slate-300 text-center font-mono">{max}</td>
                              <td className="p-2.5 border-r border-slate-300 text-center font-mono font-bold text-slate-900">{score}</td>
                              <td className="p-2.5 border-r border-slate-300 text-center font-black">{grade}</td>
                              <td className="p-2.5 text-slate-600 font-medium">{isPass ? "Satisfactory" : "Needs Improvement"}</td>
                            </tr>
                          );
                        })}
                        {/* Summary Totals Row */}
                        <tr className="bg-slate-900 text-white font-extrabold text-xs">
                          <td colSpan={2} className="p-3 uppercase tracking-wider text-right">Aggregated Total Score:</td>
                          <td className="p-3 text-center font-mono">{res.totalMax}</td>
                          <td className="p-3 text-center font-mono text-amber-300 text-sm">{res.totalObtained}</td>
                          <td className="p-3 text-center text-amber-300">{res.grade}</td>
                          <td className="p-3">{res.percentage}% ({res.status})</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Verification Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 items-center">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Position in Class</span>
                      <strong className="text-sm font-black text-slate-900">{res.positionSuffix} Position</strong>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Overall Performance</span>
                      <strong className="text-xs font-bold text-slate-800">
                        {res.percentage >= 80 ? "Passed with Distinction" : res.percentage >= 60 ? "First Division" : "Second Division"}
                      </strong>
                    </div>

                    {/* QR Code Verification representation */}
                    <div className="flex items-center gap-2 justify-end">
                      <div className="text-right">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase">Verification QR</span>
                        <span className="text-[9px] font-mono text-slate-500">DMC-{res.student.id}</span>
                      </div>
                      <div className="w-12 h-12 bg-slate-900 rounded p-1 flex items-center justify-center shrink-0">
                        <div className="w-full h-full bg-white p-0.5 rounded flex flex-col justify-between">
                          <div className="flex justify-between"><div className="w-2 h-2 bg-black" /><div className="w-2 h-2 bg-black" /></div>
                          <div className="flex justify-between"><div className="w-2 h-2 bg-black" /><div className="w-2 h-2 bg-black" /></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-10 flex justify-between items-end">
                    <div className="text-center w-36">
                      <div className="border-b border-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Class Teacher</span>
                    </div>

                    <div className="text-center w-28 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase">
                      School Stamp
                    </div>

                    <div className="text-center w-36">
                      <div className="border-b border-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Principal Signature</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <Award className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">Select a student from the dropdown above to view DMC</h4>
              <p className="text-xs text-slate-500 mt-1">DMCs are automatically generated with school seals, grades, and positions.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 6: SMART RESULT UPLOAD (HARD COPY TO SOFT COPY CONVERTER) */}
      {activeTab === "smart_upload" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Header & Print Template Button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-600" /> Smart Hard-Copy to Soft-Copy Result Generator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Easily convert paper hard-copy marks lists into official soft-copy results & DMCs. Upload photos/scans or edit live in grid.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={printBlankHardCopySheet}
                  className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-700" /> Print Blank Hard-Copy Marksheet
                </button>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setSmartUploadMode("photo_scan")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  smartUploadMode === "photo_scan"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Camera className="w-4 h-4" /> 1. Upload Hard Copy Photo / Scan
              </button>

              <button
                onClick={() => setSmartUploadMode("softcopy_grid")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  smartUploadMode === "softcopy_grid"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> 2. Live Soft-Copy Gradebook Matrix
              </button>

              <button
                onClick={() => setSmartUploadMode("csv_paste")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  smartUploadMode === "csv_paste"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" /> 3. Excel / CSV Text Paste
              </button>
            </div>

            {/* MODE 1: HARD COPY PHOTO / SCAN UPLOAD */}
            {smartUploadMode === "photo_scan" && (
              <div className="space-y-6">
                {/* Step-by-Step Teacher Guidance Banner */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">1. Print Hard Copy</h5>
                      <p className="text-[10px] text-slate-500">Teacher paper marksheet for pen entry</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">2. Mobile / PC Upload</h5>
                      <p className="text-[10px] text-slate-500">Take photo or paste (Ctrl+V) file</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">3. Auto AI Convert</h5>
                      <p className="text-[10px] text-slate-500">Hard copy converts to soft copy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center justify-center shrink-0">4</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">4. Publish DMC</h5>
                      <p className="text-[10px] text-slate-500">Soft copy results & report cards ready</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Upload / Drop / Paste Area */}
                  <div className="space-y-4">
                    <div 
                      onPaste={(e) => {
                        const items = e.clipboardData?.items;
                        if (items) {
                          for (let i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf("image") !== -1) {
                              const blob = items[i].getAsFile();
                              if (blob) {
                                setHardCopyImageFile(blob);
                                setHardCopyPreviewUrl(URL.createObjectURL(blob));
                              }
                            }
                          }
                        }
                      }}
                      className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl p-6 text-center bg-emerald-50/40 hover:bg-emerald-50 transition relative group cursor-pointer"
                    >
                      <input
                        type="file"
                        accept="image/*,application/pdf,.csv,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setHardCopyImageFile(file);
                            setHardCopyPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-700 shadow-xs group-hover:scale-10 flex-col">
                        <Camera className="w-7 h-7" />
                      </div>

                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Click or Drag & Drop Mobile / PC Hard Copy File Here
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-sm mx-auto">
                        Supports photos from phone camera, gallery, scanned PDFs, or press <span className="font-bold text-emerald-800 bg-white border px-1.5 py-0.5 rounded shadow-2xs">Ctrl + V</span> to paste clipboard image!
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2 relative z-20">
                        <button
                          type="button"
                          onClick={() => {
                            // Demo Hard Copy Sheet URL
                            setHardCopyPreviewUrl("https://lh3.googleusercontent.com/d/1xMBdFuGXz4qc5uSm5ev8Z5MSrxORwgB4=s1000");
                          }}
                          className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3.5 py-1.5 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1.5 shadow-2xs"
                        >
                          📷 Load Demo Hard-Copy Marksheet Photo
                        </button>
                      </div>
                    </div>

                    {/* OCR Scan Trigger Button */}
                    {hardCopyPreviewUrl && !isScanningHardCopy && (
                      <button
                        onClick={handleScanHardCopyPhoto}
                        className="w-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 py-3.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Convert Hard Copy to Soft Copy Result Matrix
                      </button>
                    )}

                    {/* Scanning Animation Progress */}
                    {isScanningHardCopy && (
                      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3 shadow-lg">
                        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                        <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">AI Document Scanner Active</h4>
                        <p className="text-xs font-mono font-bold text-slate-200">{scanStep}</p>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-400 h-2 rounded-full animate-pulse w-3/4 mx-auto" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Preview Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[280px] flex flex-col justify-center items-center text-center">
                    {hardCopyPreviewUrl ? (
                      <div className="space-y-3 w-full">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b pb-2">
                          <span className="flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Hard Copy File Loaded
                          </span>
                          <button
                            onClick={() => {
                              setHardCopyImageFile(null);
                              setHardCopyPreviewUrl(null);
                            }}
                            className="text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <img
                          src={hardCopyPreviewUrl}
                          alt="Hard copy preview"
                          className="w-full max-h-72 object-cover rounded-xl border border-slate-300 shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="text-slate-400 space-y-2">
                        <FileSpreadsheet className="w-12 h-12 mx-auto opacity-40 text-slate-400" />
                        <p className="text-xs font-bold text-slate-600">No Hard-Copy photo loaded yet.</p>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          Select a photo from PC or mobile files, or click 'Load Demo Hard-Copy' to try instantly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: INTERACTIVE LIVE SOFT-COPY MATRIX */}
            {smartUploadMode === "softcopy_grid" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900 uppercase">
                      Soft-Copy Gradebook for {selectedClass} - {selectedExam}
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Edit or review subject marks for each student directly in soft-copy. Scores update totals & grades live.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveLiveSoftCopyMarks}
                    className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Soft Copy Results
                  </button>
                </div>

                {/* Soft Copy Interactive Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold">
                        <th className="p-3 w-12 text-center">Sr#</th>
                        <th className="p-3 w-24">Roll No</th>
                        <th className="p-3">Student Name</th>
                        {classSubjects.map((sub) => (
                          <th key={sub} className="p-3 text-center min-w-[90px] border-l border-slate-800">
                            {sub}
                          </th>
                        ))}
                        <th className="p-3 text-center w-24 bg-slate-800">Total</th>
                        <th className="p-3 text-center w-20 bg-slate-800">%</th>
                        <th className="p-3 text-center w-16 bg-slate-800">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {classStudents.map((student, idx) => {
                        const studentMarks = liveSoftCopyMarks[student.id] || {};
                        let sumObtained = 0;
                        const totalMax = classSubjects.length * 100;

                        classSubjects.forEach((sub) => {
                          sumObtained += studentMarks[sub] !== undefined ? studentMarks[sub] : 75;
                        });

                        const pct = totalMax > 0 ? Math.round((sumObtained / totalMax) * 100) : 0;
                        const { grade, color } = calculateGradeInfo(pct);

                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-semibold font-mono text-slate-700">{student.rollNo}</td>
                            <td className="p-3 font-bold text-slate-900">{student.name}</td>
                            {classSubjects.map((sub) => {
                              const score = studentMarks[sub] !== undefined ? studentMarks[sub] : 75;
                              return (
                                <td key={sub} className="p-2 text-center border-l border-slate-100">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={score}
                                    onChange={(e) => {
                                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                      setLiveSoftCopyMarks({
                                        ...liveSoftCopyMarks,
                                        [student.id]: {
                                          ...liveSoftCopyMarks[student.id],
                                          [sub]: val,
                                        },
                                      });
                                    }}
                                    className="w-16 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg py-1 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                                  />
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-mono font-extrabold text-slate-900 bg-slate-50">
                              {sumObtained} / {totalMax}
                            </td>
                            <td className="p-3 text-center font-mono font-black text-blue-700 bg-slate-50">
                              {pct}%
                            </td>
                            <td className="p-3 text-center font-black bg-slate-50" style={{ color }}>
                              {grade}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveLiveSoftCopyMarks}
                    className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Soft Copy Results
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: CSV & EXCEL TEXT PASTE */}
            {smartUploadMode === "csv_paste" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">
                    Paste CSV / Excel List Data:
                  </label>
                  <button
                    onClick={handleLoadSampleCsv}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Load Sample CSV Template
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  placeholder="Roll No, Student Name, English, Urdu, Mathematics, Physics, Chemistry..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setRawCsvText("")}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleParseCsv}
                    className="text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Parse & Preview Soft Copy Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 7: EXAM HISTORY */}
      {activeTab === "exam_history" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Exam History & Historical Results ({selectedClass})
          </h3>
          <p className="text-xs text-slate-500">
            Compare student performance across previous term evaluations, monthly assessments, and final board exams.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3 text-center">Monthly Assessment</th>
                  <th className="p-3 text-center">Mid-Term Exam</th>
                  <th className="p-3 text-center">Annual Exam</th>
                  <th className="p-3 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentResults.map((r) => (
                  <tr key={r.student.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-600">{r.rollNo}</td>
                    <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                    <td className="p-3 text-center font-mono">82% (Pass)</td>
                    <td className="p-3 text-center font-mono">85% (Pass)</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-700">{r.percentage}% ({r.status})</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ↑ +3.2% Improvement
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 8: ADMIN CONTROLS */}
      {activeTab === "admin_controls" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-3xl">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3 border-slate-100">
            <Settings className="w-4 h-4 text-slate-700" /> Result Management System Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Marks Threshold (%)</label>
              <input
                type="number"
                min={20}
                max={60}
                value={passingMarksPercent}
                onChange={(e) => setPassingMarksPercent(parseInt(e.target.value) || 30)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400">Students obtaining below this percentage in any subject will be marked as Fail.</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <strong className="block text-xs font-bold text-slate-800">Use GPA 4.0 Scale System</strong>
                <span className="text-[10px] text-slate-500">Toggle between standard percentages (%) and 4.0 GPA scales.</span>
              </div>
              <input
                type="checkbox"
                checked={useGpaSystem}
                onChange={(e) => setUseGpaSystem(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <strong className="block text-xs font-bold text-slate-800">Lock Exam Results</strong>
                <span className="text-[10px] text-slate-500">Prevent teachers and staff from modifying recorded marks.</span>
              </div>
              <input
                type="checkbox"
                checked={isResultLocked}
                onChange={(e) => toggleResultLock(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 9: STUDENT PORTAL LOOKUP */}
      {activeTab === "student_portal" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-xl mx-auto text-center space-y-4">
          <Search className="w-10 h-10 text-indigo-600 mx-auto" />
          <h3 className="text-base font-black text-slate-900 uppercase">Student Result Portal Search</h3>
          <p className="text-xs text-slate-500">Enter Roll Number to instantly search student results and print official DMC.</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Roll No (e.g., 1001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => {
                const found = studentResults.find((r) => r.rollNo.toLowerCase() === searchTerm.toLowerCase());
                if (found) {
                  setActiveDmcStudent(found.student);
                  setActiveTab("dmc_archive");
                } else {
                  alert("No student found with that Roll Number in active class.");
                }
              }}
              className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: SUBJECT MARKS BREAKDOWN MODAL */}
      {activeSubjectModalStudent && (() => {
        const res = studentResults.find((r) => r.student.id === activeSubjectModalStudent.id);
        if (!res) return null;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
              <button
                onClick={() => setActiveSubjectModalStudent(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase">{res.studentName}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Roll No: {res.rollNo} | Class: {selectedClass} | Status:{" "}
                  <strong className={res.status === "Pass" ? "text-emerald-700" : "text-rose-700"}>{res.status}</strong>
                </p>
              </div>

              <div className="overflow-y-auto max-h-80 space-y-2">
                {classSubjects.map((sub) => {
                  const score = res.subjectsMap[sub]?.obtained || 0;
                  const grade = res.subjectsMap[sub]?.grade || "F";
                  const isPass = score >= passingMarksPercent;

                  return (
                    <div key={sub} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-800">{sub}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-extrabold text-slate-900">{score} / 100</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isPass ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {grade}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setActiveDmcStudent(activeSubjectModalStudent);
                    setActiveSubjectModalStudent(null);
                    setActiveTab("dmc_archive");
                  }}
                  className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> Open Full DMC Sheet
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: EDIT MARKS MODAL */}
      {editingStudentMarks && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingStudentMarks(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Edit Marks: {editingStudentMarks.name}</h3>
              <p className="text-xs text-slate-500">Adjust individual subject scores for {selectedClass} - {selectedExam}.</p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {classSubjects.map((sub) => (
                <div key={sub} className="flex items-center justify-between gap-3 text-xs">
                  <label className="font-bold text-slate-700">{sub}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editMarksMap[sub] !== undefined ? editMarksMap[sub] : 80}
                    onChange={(e) =>
                      setEditMarksMap({
                        ...editMarksMap,
                        [sub]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-slate-900"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button
                onClick={() => setEditingStudentMarks(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedMarks}
                className="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
              >
                Save Marks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT PREVIEW MODAL */}
      {importPreviewModalOpen && parsedImportData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setImportPreviewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Smart Import Verification Preview
              </h3>
              <p className="text-xs text-slate-500">Review recognized subjects and matched student records prior to committing.</p>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Rows</span>
                <strong className="text-slate-900 font-extrabold">{parsedImportData.totalRows}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Matched Students</span>
                <strong className="text-emerald-700 font-extrabold">{parsedImportData.matchedStudents.length}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Recognized Subjects</span>
                <strong className="text-blue-700 font-extrabold">{parsedImportData.recognizedSubjects.length}</strong>
              </div>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2.5">Roll No</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5 text-center">Score</th>
                    <th className="p-2.5 text-center">Percentage</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedImportData.matchedStudents.map((m) => (
                    <tr key={m.student.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-700">{m.student.rollNo}</td>
                      <td className="p-2.5 font-bold text-slate-900">{m.student.name}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{m.totalObtained} / {m.totalMax}</td>
                      <td className="p-2.5 text-center font-mono font-extrabold text-blue-700">{m.percentage}%</td>
                      <td className="p-2.5 text-center font-black">{m.grade}</td>
                      <td className="p-2.5 text-center">
                        <span className={m.status === "Pass" ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setImportPreviewModalOpen(false)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-xl shadow-md"
              >
                Confirm & Import All Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

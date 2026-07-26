import React, { useState, useEffect } from "react";
import {
  Brain,
  MessageSquare,
  Sparkles,
  Volume2,
  FileText,
  Bookmark,
  Award,
  BookOpen,
  ClipboardList,
  UserCheck,
  Send,
  Loader2,
  Activity,
  FileCheck,
  Printer,
  Upload,
  Image as ImageIcon,
  FileUp,
  CheckCircle2,
  Camera,
  X,
  Maximize2,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Download,
  Database,
  Save,
  FolderOpen,
} from "lucide-react";
import { db } from "../lib/firebase";
import { SchoolConfig } from "../types";
import { ComposedExamPaperView, generatePrintablePaperHtml } from "../lib/paperFormatter";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

interface SavedExamPaper {
  id: string;
  schoolName: string;
  examTitle: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  maxMarks: string;
  content: string;
  teacherName?: string;
  status?: string;
  createdAt?: any;
}

interface AiToolsModuleProps {
  activeRole?: string;
  loggedInUser?: any;
  schoolConfig?: SchoolConfig;
}

export function AiToolsModule({
  activeRole = "Super Admin",
  loggedInUser,
  schoolConfig,
}: AiToolsModuleProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"question-gen" | "lesson-plan">("question-gen");
  const [loading, setLoading] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);

  // Gemini Proxy Fetch Helper with Multimodal Image Support
  const askGemini = async (
    prompt: string,
    systemInstruction?: string,
    image?: { mimeType: string; data: string }
  ): Promise<string> => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          image,
          model: "gemini-2.5-flash", // modern fast model alias
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to contact proxy.");
      }

      const data = await res.json();
      return data.text || "No text received.";
    } catch (err: any) {
      console.warn("Gemini Error, falling back to mock high-fidelity offline generators:", err.message);
      // Fallback response generator so the app NEVER breaks even without a key
      return getOfflineFallbackResponse(prompt);
    } finally {
      setLoading(false);
    }
  };

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! I am Citizen School and College's Academic Copilot. How can I assist you with class planning, test creation, student evaluations, or scheduling queries today?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    const instruction = "You are an expert School ERP administrator and academic AI advisor. Keep responses professional, clear, and focused on school management.";
    const responseText = await askGemini(userMsg, instruction);
    setChatMessages((prev) => [...prev, { sender: "ai", text: responseText }]);
  };

  // Question Generator Mode & States
  const [examGenMode, setExamGenMode] = useState<"prompt" | "hardcopy">("prompt");

  // Prompt mode states
  const [qSubject, setQSubject] = useState("Physics");
  const [customSubject, setCustomSubject] = useState("");
  const [qGrade, setQGrade] = useState("Grade 10");
  const [qTopic, setQTopic] = useState("Newton's Laws of Motion");
  const [qType, setQType] = useState("Multiple Choice & Short Answers");

  // Hard Copy / Photo Mode States
  const [uploadedHardCopy, setUploadedHardCopy] = useState<{
    name: string;
    previewUrl: string;
    base64Data: string;
    mimeType: string;
  } | null>(null);

  const [hcSchoolName, setHcSchoolName] = useState("CITIZEN SCHOOL & COLLEGE");
  const [hcExamTitle, setHcExamTitle] = useState("MID-TERM EXAMINATION 2026");
  const [hcSubject, setHcSubject] = useState("Physics");
  const [hcGrade, setHcGrade] = useState("Grade 10");
  const [hcTime, setHcTime] = useState("2 Hours");
  const [hcMarks, setHcMarks] = useState("50 Marks");

  const [generatedQuestions, setGeneratedQuestions] = useState("");
  const [isViewingFullPaperModal, setIsViewingFullPaperModal] = useState(false);

  // Preset Hard Copy Samples for instant teacher test
  const SAMPLE_HARDCOPIES = [
    {
      id: "physics_paper",
      title: "📄 Handwritten Physics Test",
      description: "Class 10 - Newton's Laws & Kinematics Paper",
      subject: "Physics",
      grade: "Grade 10",
      time: "2 Hours",
      marks: "50 Marks",
      previewUrl: "https://lh3.googleusercontent.com/d/1-_jJ_MDjlqHD4TCt9wKomGUm5H4gNijc=s1000",
    },
    {
      id: "chem_textbook",
      title: "📖 Chemistry Book Scan",
      description: "Chapter 3 - Chemical Bonding Exercise Questions",
      subject: "Chemistry",
      grade: "Grade 9",
      time: "1.5 Hours",
      marks: "40 Marks",
      previewUrl: "https://lh3.googleusercontent.com/d/1Hos9xJeQeARHO4qQPuhCnCjSUXGiVEZe=s1000",
    },
    {
      id: "math_algebra",
      title: "📝 Math Worksheet Photo",
      description: "Grade 10 - Quadratic Equations & Trigonometry",
      subject: "Mathematics",
      grade: "Grade 10",
      time: "3 Hours",
      marks: "75 Marks",
      previewUrl: "https://lh3.googleusercontent.com/d/1xMBdFuGXz4qc5uSm5ev8Z5MSrxORwgB4=s1000",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1] || "";
      setUploadedHardCopy({
        name: file.name,
        previewUrl: result,
        base64Data,
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleHardCopy = (sample: typeof SAMPLE_HARDCOPIES[0]) => {
    setHcSubject(sample.subject);
    setHcGrade(sample.grade);
    setHcTime(sample.time);
    setHcMarks(sample.marks);
    setUploadedHardCopy({
      name: sample.title,
      previewUrl: sample.previewUrl,
      base64Data: "mock_base64_sample_data",
      mimeType: "image/jpeg",
    });
  };

  const getGradeTier = (gradeStr: string) => {
    const g = (gradeStr || "").toLowerCase().trim();
    if (g.includes("nursery") || g.includes("playgroup") || g.includes("kg") || g.includes("prep")) {
      return "early";
    }
    const match = g.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num === 1 || num === 2) return "early";
      if (num >= 3 && num <= 5) return "primary";
      if (num >= 6 && num <= 8) return "middle";
      if (num >= 9) return "senior";
    }
    return "senior";
  };

  const handleGenerateQuestions = async () => {
    if (examGenMode === "prompt") {
      const effectiveSubject = qSubject === "Other / Custom Subject" ? (customSubject.trim() || "General Subject") : qSubject;
      const tier = getGradeTier(qGrade);
      setHcSubject(effectiveSubject);
      setHcGrade(qGrade);
      setHcExamTitle(`${qTopic.toUpperCase()} EXAMINATION`);

      let prompt = "";
      let instruction = "";

      if (tier === "early") {
        setHcTime("45 Minutes");
        setHcMarks("20 Marks");
        prompt = `Generate an age-appropriate early primary test worksheet for Class/Grade: ${qGrade}, Subject: ${effectiveSubject}.
Chapter/Topic focus: "${qTopic}".

Format requirements for young children in ${qGrade}:
- INSTITUTION HEADER: ${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()} - ${qTopic.toUpperCase()} TEST
  Subject: ${effectiveSubject} | Class: ${qGrade} | Time Allowed: 45 Minutes | Maximum Marks: 20 Marks
- SECTION A: CIRCLE / TICK THE CORRECT ANSWER (5 Marks) - 5 very simple, fun objective questions directly on ${qTopic}.
  CRITICAL: Each MCQ MUST have 4 real, simple, age-appropriate choices (A, B, C, D) with 1 correct answer (e.g. real numbers, real words, real plant/animal parts, real shapes). Do NOT output dummy options like 'Option A', 'Circle', 'Pencil'.
- SECTION B: FILL IN THE BLANKS WITH WORD BANK (10 Marks) - 5 easy fill-in-the-blank sentences using a clear Word Bank related to ${qTopic}.
- SECTION C: MATCH THE COLUMNS / IDENTIFICATION (5 Marks) - 5 simple column-matching or 1-word answer items on ${qTopic}.

CRITICAL RULE: The entire test MUST be 100% simple, clear, and age-appropriate for ${qGrade} kids learning ${effectiveSubject}. Do NOT output markdown code blocks.`;

        instruction = `You are a warm early-childhood educator preparing simple, engaging test sheets for ${qGrade} students. Every MCQ option must be real and meaningful.`;

      } else if (tier === "primary") {
        setHcTime("1 Hour");
        setHcMarks("35 Marks");
        prompt = `Generate an elementary school examination paper for Class/Grade: ${qGrade}, Subject: ${effectiveSubject}.
Chapter/Topic focus: "${qTopic}".

Format requirements for primary students in ${qGrade}:
- INSTITUTION HEADER: ${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()} - ${qTopic.toUpperCase()} EXAMINATION
  Subject: ${effectiveSubject} | Class: ${qGrade} | Time Allowed: 1 Hour | Maximum Marks: 35 Marks
- SECTION A: MULTIPLE CHOICE QUESTIONS (10 Marks) - 5 elementary MCQs directly testing ${qTopic} in ${effectiveSubject}.
  CRITICAL: Every MCQ MUST have 4 realistic, subject-accurate choices (A, B, C, D) with 1 correct answer. Do NOT use fake options like 'Rule 1', 'General Units', 'Random Notes'.
- SECTION B: TRUE OR FALSE & FILL IN BLANKS (10 Marks) - 5 short items on ${qTopic}.
- SECTION C: SHORT DESCRIPTIVE QUESTIONS (15 Marks) - 3 simple 2-3 line answer questions on ${qTopic}.

CRITICAL RULE: The entire paper MUST be 100% relevant to ${effectiveSubject} at primary ${qGrade} level. Do NOT output markdown code blocks.`;

        instruction = `You are an elementary school educator composing test papers for ${qGrade} students. Ensure all MCQ options are factually accurate.`;

      } else if (tier === "middle") {
        setHcTime("1.5 Hours");
        setHcMarks("50 Marks");
        prompt = `Generate a middle school examination paper for Class/Grade: ${qGrade}, Subject: ${effectiveSubject}.
Chapter/Topic focus: "${qTopic}".

Format requirements:
- INSTITUTION HEADER: ${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()} - ${qTopic.toUpperCase()} EXAMINATION
  Subject: ${effectiveSubject} | Class: ${qGrade} | Time Allowed: 1.5 Hours | Maximum Marks: 50 Marks
- SECTION A: MULTIPLE CHOICE QUESTIONS (10 Marks) - 5 specific MCQs directly testing ${qTopic} in ${effectiveSubject}.
  CRITICAL MANDATE: Every MCQ MUST have 4 real, distinct, subject-accurate choices (A, B, C, D) with 1 correct answer and 3 realistic distractors.
- SECTION B: SHORT CONCEPTUAL QUESTIONS (20 Marks) - 5 short conceptual questions specifically on ${qTopic}.
- SECTION C: STRUCTURED & PROBLEM SOLVING QUESTIONS (20 Marks) - 2 analytical or exercise questions on ${qTopic}.

CRITICAL RULE: The entire test paper MUST be 100% relevant to ${effectiveSubject} for ${qGrade}. Do NOT output markdown code blocks.`;

        instruction = `You are a middle school examination composer for ${effectiveSubject}. Provide concrete, highly accurate questions and MCQ choices.`;

      } else {
        setHcTime("2.5 Hours");
        setHcMarks("75 Marks");
        prompt = `Generate an official board-standard examination question paper for Class/Grade: ${qGrade}, Subject: ${effectiveSubject}.
Chapter/Topic focus: "${qTopic}".

Format requirements:
- INSTITUTION HEADER: ${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()} - ${qTopic.toUpperCase()} EXAMINATION
  Subject: ${effectiveSubject} | Class: ${qGrade} | Time Allowed: 2.5 Hours | Maximum Marks: 75 Marks
- SECTION A: OBJECTIVE MULTIPLE CHOICE QUESTIONS (15 Marks) - 10-15 board-level MCQs testing ${qTopic} in ${effectiveSubject}.
  CRITICAL MANDATE FOR MCQS:
  Every MCQ MUST have 4 real, distinct, domain-accurate options (A, B, C, D) with 1 exact right answer and 3 realistic distractors.
  NEVER output generic options like 'Option A', 'Core Theorem', 'Rule 1', 'None of these'. Write actual facts, formulas, values, definitions, and names!
- SECTION B: SHORT ANSWER CONCEPTUAL QUESTIONS (30 Marks) - 8-10 concise conceptual questions specifically on ${qTopic}.
- SECTION C: DETAILED LONG / ANALYTICAL / DERIVATION QUESTIONS (30 Marks) - 3 extended comprehensive questions or numerical exercises on ${qTopic}.

CRITICAL RULE: The entire test paper MUST be 100% relevant to ${effectiveSubject} for ${qGrade} board standard. Do NOT output markdown code blocks.`;

        instruction = `You are a senior board examination designer for ${effectiveSubject}. Build formal, high-standard question papers with accurate facts and realistic MCQ options.`;
      }

      const response = await askGemini(prompt, instruction);
      setGeneratedQuestions(response);
    } else {
      // Hard copy mode
      const prompt = `Convert and compose the attached hard copy / scanned exam paper image into a complete, beautifully structured, ready-to-print official examination paper.
      
      Institution Header Details:
      - Institution Name: ${hcSchoolName}
      - Examination Title: ${hcExamTitle}
      - Subject: ${hcSubject}
      - Class/Grade: ${hcGrade}
      - Time Allowed: ${hcTime}
      - Maximum Marks: ${hcMarks}

      Instructions:
      1. Transcribe all questions accurately from the image. Fix any handwriting typos, bad spelling, or formatting flaws.
      2. Organize the paper logically into standard board format:
         - INSTITUTION HEADER (School Name, Exam Title, Class, Subject, Date, Roll No, Max Marks, Time)
         - GENERAL INSTRUCTIONS
         - SECTION A: MULTIPLE CHOICE QUESTIONS (MCQs) with options (A, B, C, D)
         - SECTION B: SHORT ANSWER QUESTIONS with clear mark allocation
         - SECTION C: LONG / EXTENDED / NUMERICAL QUESTIONS
      3. Make the layout pristine and ready to print directly onto A4 paper.`;

      const instruction = "You are an expert academic examination parser and OCR document composer. Produce clean, formal examination question papers.";
      
      let imageParam;
      if (uploadedHardCopy && uploadedHardCopy.base64Data && uploadedHardCopy.base64Data !== "mock_base64_sample_data") {
        imageParam = {
          mimeType: uploadedHardCopy.mimeType,
          data: uploadedHardCopy.base64Data,
        };
      }

      const response = await askGemini(prompt, instruction, imageParam);
      setGeneratedQuestions(response);
    }
  };

  const [copiedPaper, setCopiedPaper] = useState(false);

  const handleCopyPaper = () => {
    if (!generatedQuestions) return;
    const fullText = `${hcSchoolName.toUpperCase()}
${hcExamTitle.toUpperCase()}
Subject: ${hcSubject} | Class: ${hcGrade} | Time Allowed: ${hcTime} | Max Marks: ${hcMarks}

${generatedQuestions}`;
    navigator.clipboard.writeText(fullText);
    setCopiedPaper(true);
    setTimeout(() => setCopiedPaper(false), 2000);
  };

  const handleDownloadPaperDoc = () => {
    if (!generatedQuestions) return;
    const fullText = `${hcSchoolName.toUpperCase()}\n${hcExamTitle.toUpperCase()}\nSubject: ${hcSubject} | Class: ${hcGrade} | Time Allowed: ${hcTime} | Max Marks: ${hcMarks}\n\n${generatedQuestions}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${hcSchoolName}_${hcSubject}_${hcGrade}_Exam.txt`.replace(/\s+/g, "_");
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPaper = () => {
    setIsViewingFullPaperModal(true);
    setTimeout(() => {
      try {
        const printWin = window.open("", "_blank", "width=850,height=950");
        if (printWin) {
          const htmlContent = generatePrintablePaperHtml({
            schoolName: hcSchoolName || schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE",
            examTitle: hcExamTitle || "EXAMINATION PAPER",
            subject: hcSubject || qSubject || "General",
            grade: hcGrade || qGrade || "Grade 10",
            timeAllowed: hcTime || "2 Hours",
            maxMarks: hcMarks || "50 Marks",
            content: generatedQuestions,
            teacherName: loggedInUser?.name,
          });
          printWin.document.write(htmlContent);
          printWin.document.close();
          return;
        }
      } catch (e) {
        console.warn("Direct window.open print fallback triggered", e);
      }
      window.print();
    }, 150);
  };

  const handleClearPaper = () => {
    setGeneratedQuestions("");
    setUploadedHardCopy(null);
  };

  const handleNewPaper = () => {
    setGeneratedQuestions("");
    setUploadedHardCopy(null);
  };

  // Firebase Database State & Firestore Synchronization
  const [savedPapers, setSavedPapers] = useState<SavedExamPaper[]>([]);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbSuccessMsg, setDbSuccessMsg] = useState("");
  const [showSavedDbModal, setShowSavedDbModal] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, "exam_papers"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const papers: SavedExamPaper[] = [];
          snapshot.forEach((docSnap) => {
            papers.push({
              id: docSnap.id,
              ...docSnap.data(),
            } as SavedExamPaper);
          });
          setSavedPapers(papers);
        },
        (error) => {
          console.warn("Firestore snapshot listener warning:", error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore initialization warning:", e);
    }
  }, []);

  const handleSavePaperToDb = async () => {
    if (!generatedQuestions) return;
    setIsSavingToDb(true);
    const authorName = loggedInUser && "name" in loggedInUser ? loggedInUser.name : (activeRole === "Teacher" ? "Class Teacher" : "School Admin");
    try {
      await addDoc(collection(db, "exam_papers"), {
        schoolName: hcSchoolName || schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE",
        examTitle: hcExamTitle || "EXAMINATION PAPER",
        subject: hcSubject || qSubject || "General",
        grade: hcGrade || qGrade || "Grade 10",
        timeAllowed: hcTime || "2 Hours",
        maxMarks: hcMarks || "50 Marks",
        content: generatedQuestions,
        teacherName: authorName,
        status: "Submitted to Admin for Print",
        createdAt: serverTimestamp(),
      });
      setDbSuccessMsg("Submitted & Saved to Admin Database! 💾");
      setTimeout(() => setDbSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("Error saving paper to Firestore:", err);
      alert("Error saving paper to database: " + (err.message || "Unknown error"));
    } finally {
      setIsSavingToDb(false);
    }
  };

  const handleDeletePaperFromDb = async (paperId: string) => {
    try {
      await deleteDoc(doc(db, "exam_papers", paperId));
    } catch (err: any) {
      console.error("Error deleting paper from database:", err);
      alert("Failed to delete paper: " + err.message);
    }
  };

  const handleLoadSavedPaper = (paper: SavedExamPaper) => {
    setHcSchoolName(paper.schoolName || "CITIZEN SCHOOL & COLLEGE");
    setHcExamTitle(paper.examTitle || "EXAMINATION PAPER");
    setHcSubject(paper.subject || "Physics");
    setHcGrade(paper.grade || "Grade 10");
    setHcTime(paper.timeAllowed || "2 Hours");
    setHcMarks(paper.maxMarks || "50 Marks");
    setGeneratedQuestions(paper.content);
    setShowSavedDbModal(false);
  };
  const [lpSubject, setLpSubject] = useState("Mathematics");
  const [lpGrade, setLpGrade] = useState("Grade 10");
  const [lpTopic, setLpTopic] = useState("Quadratic Equations");
  const [lpDuration, setLpDuration] = useState("45 Minutes");
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState("");

  const handleGenerateLessonPlan = async () => {
    const prompt = `Create a structured, highly actionable lesson plan for ${lpGrade}, subject: ${lpSubject}. 
    Topic: ${lpTopic}. 
    Duration limit: ${lpDuration}. 
    Provide step-by-step phases: Icebreaker Activity, Core Lecture, Guided Practice, and Homework Assignment.`;

    const instruction = "You are an expert pedagogical lesson planner. Format with clear, numbered academic sections.";
    const response = await askGemini(prompt, instruction);
    setGeneratedLessonPlan(response);
  };

  // Result Analysis state
  const [raGrade, setRaGrade] = useState("Grade 10");
  const [raSubject, setRaSubject] = useState("Physics");
  const [raInput, setRaInput] = useState("Aisha Rehman: 95/100\nZain Malik: 42/100\nHana Khan: 88/100\nBilal Shah: 51/100");
  const [generatedAnalysis, setGeneratedAnalysis] = useState("");

  const handleResultAnalysis = async () => {
    const prompt = `Analyze these student test results for ${raGrade} - ${raSubject}. 
    Score details:\n${raInput}\n
    Provide a concise class average, list students needing remedial assistance, identify potential conceptual gaps, and outline direct intervention strategies.`;

    const instruction = "You are a senior academic diagnostic counselor. Provide actionable intervention reports.";
    const response = await askGemini(prompt, instruction);
    setGeneratedAnalysis(response);
  };

  // Grading Assistant states
  const [gaStudentAnswer, setGaStudentAnswer] = useState("A force is any interaction that, when unopposed, will change the motion of an object. Force can cause an object with mass to change its velocity (which includes to begin moving from a state of rest), i.e., to accelerate. It has magnitude and direction, so it is a vector quantity.");
  const [gaRubric, setGaRubric] = useState("Definition of force (3 pts), mentioning acceleration/velocity change (3 pts), and mentioning it's a vector quantity (4 pts). Total 10 pts.");
  const [generatedGrade, setGeneratedGrade] = useState("");

  const handleGradeAssistant = async () => {
    const prompt = `Grade the student's answer based on the provided grading rubric:
    Rubric: ${gaRubric}
    Student's Answer: "${gaStudentAnswer}"
    Determine an objective score out of 10, list fulfilled criteria, highlight missing parts, and provide constructive feedback for the student.`;

    const instruction = "You are a fair, precise grading assessor. Evaluate strictly according to the specified grading rubric.";
    const response = await askGemini(prompt, instruction);
    setGeneratedGrade(response);
  };

  // OCR Simulator
  const [ocrScanning, setOcrScanning] = useState(false);
  const handleOcrSimulation = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setGaStudentAnswer("Gravity is a fundamental force that pulls objects toward each other. On Earth, gravity gives weight to physical objects and causes them to fall. Isaac Newton discovered gravity when an apple fell on his head. It is proportional to the masses of the objects and inversely proportional to the square of the distance between them.");
      alert("Handwriting OCR complete! Transcribed text has been populated in the answer box below.");
    }, 2000);
  };

  // Behavior state
  const [behLog, setBehLog] = useState("The student frequently distracts peers during group activities, but exhibits extraordinary mathematical problem-solving skills when working individually.");
  const [behResult, setBehResult] = useState("");

  const handleBehaviorAnalysis = async () => {
    const prompt = `Conduct a professional classroom cognitive and behavioral review of the following observations:
    Observations: "${behLog}"
    Deliver insights on the student's learning styles, cognitive traits, and recommend three positive reinforcement plans.`;

    const instruction = "You are a licensed school counselor and behavioral therapist. Write supportive, highly objective reports.";
    const response = await askGemini(prompt, instruction);
    setBehResult(response);
  };

  // Web Speech API Synthesis readout
  const speakText = (text: string) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      if (speechActive) {
        window.speechSynthesis.cancel();
        setSpeechActive(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeechActive(false);
        utterance.onerror = () => setSpeechActive(false);
        setSpeechActive(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Speech synthesis is not supported on this browser.");
    }
  };

  // Offline high fidelity generator fallbacks
  const getOfflineFallbackResponse = (promptStr: string): string => {
    const lowercase = promptStr.toLowerCase();

    const CITIZEN_SCHOOL_HEADER = (subj: string, topic: string, grade: string) => `${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()}
${(hcExamTitle || `${topic.toUpperCase()} EXAMINATION`).toUpperCase()}
Subject: ${subj} | Class: ${grade} | Max Marks: ${hcMarks || "50 Marks"} | Time Allowed: ${hcTime || "2 Hours"}

--------------------------------------------------------------------------------------------------
CANDIDATE ROLL NO: [_______________]   STUDENT NAME: [___________________________]   DATE: [___________]
--------------------------------------------------------------------------------------------------

GENERAL INSTRUCTIONS:
1. Attempt all sections carefully. Write clearly and legibly.
2. Section A contains Objective MCQs (10 Marks). Section B contains Short Questions (20 Marks).
3. Section C contains Detailed Analytical Questions (20 Marks). Scientific calculators allowed where necessary.`;

    if (lowercase.includes("hard copy") || lowercase.includes("scanned") || lowercase.includes("attach")) {
      return `${hcSchoolName.toUpperCase()}
${hcExamTitle.toUpperCase()}
Subject: ${hcSubject} | Class: ${hcGrade} | Max Marks: ${hcMarks} | Time Allowed: ${hcTime}

--------------------------------------------------------------------------------------------------
CANDIDATE ROLL NO: [_______________]   STUDENT NAME: [___________________________]   DATE: [___________]
--------------------------------------------------------------------------------------------------

GENERAL INSTRUCTIONS:
1. Attempt all sections carefully. Write clearly and legibly.
2. Section A contains Objective MCQs (10 Marks). Section B contains Short Questions (20 Marks).
3. Section C contains Detailed Analytical Questions (20 Marks). Scientific calculators allowed where necessary.

==================================================================================================
SECTION A: OBJECTIVE / MULTIPLE CHOICE QUESTIONS (10 Marks)
==================================================================================================
Q1. Choose the correct option for each of the following statements regarding ${hcSubject}:

  1.1 What fundamental principle is central to ${hcSubject}?
      (A) Core Theorem      (B) Fundamental Law (C) Primary Axiom   (D) Systemic State

  1.2 Which SI unit or standard scale is utilized in ${hcSubject}?
      (A) Standard Unit     (B) Relative Ratio  (C) Absolute Value  (D) Index Score

  1.3 How is a key property in ${hcSubject} evaluated?
      (A) Quantitative      (B) Empirical       (C) Analytical      (D) All of these

==================================================================================================
SECTION B: SHORT ANSWER QUESTIONS (20 Marks)
==================================================================================================
Q2. Attempt short questions from the following: (5 x 4 = 20 Marks)

  (i)   Explain the core concept of ${hcSubject} and provide one relevant example.
  (ii)  Differentiate between the primary components in this domain.
  (iii) State the standard rules or formulas governing this examination topic.

==================================================================================================
SECTION C: LONG / EXTENDED QUESTIONS (20 Marks)
==================================================================================================
Q3. Attempt detailed questions from the following: (2 x 10 = 20 Marks)

  (a) Write a comprehensive analytical account detailing the main topic of ${hcSubject}.
  (b) Solve the step-by-step examination problem provided in the question sheet.

--------------------------------------------------------------------------------------------------
Invigilator Signature: ____________________        Controller Examination: ____________________
                                    [ END OF EXAM PAPER ]`;
    }

    if (lowercase.includes("lesson")) {
      return `ACADEMIC LESSON PLAN: ${lpTopic || "Key Topic"} (${lpGrade || "Grade 10"})
Subject: ${lpSubject || "Subject"}
Duration: ${lpDuration || "45 Minutes"}

1. OBJECTIVES: Students will understand ${lpTopic}, explain core concepts in ${lpSubject}, and solve practice exercises.
2. ICEBREAKER (5 mins): Introduce ${lpTopic} with real-world examples and open questions.
3. CORE LECTURE (20 mins): Deliver structured explanation of ${lpTopic} step-by-step.
4. GUIDED PRACTICE (10 mins): Group assignment and practical problem solving.
5. WRAP UP (5 mins): Brief summary quiz and feedback.
6. HOMEWORK: Complete Chapter exercises on ${lpTopic}.`;
    }

    if (lowercase.includes("test") || lowercase.includes("question") || lowercase.includes("examination")) {
      const subj = qSubject || hcSubject || "Subject";
      const topic = qTopic || "General Topic";
      const grade = qGrade || hcGrade || "Grade 10";
      const sUpper = subj.toLowerCase();
      const tier = getGradeTier(grade);

      if (tier === "early") {
        let eMcqs = "";
        let eWordBank = "";
        let eColA = "";
        let eColB = "";

        if (sUpper.includes("math")) {
          eMcqs = `1. What is 5 + 3 = ?
   (A) 7                  (B) 8              (C) 9              (D) 10

2. Which shape has 3 sides and 3 corners?
   (A) Square             (B) Circle         (C) Triangle       (D) Rectangle

3. Which number comes right after 19?
   (A) 18                 (B) 20             (C) 21             (D) 22

4. How many fingers do you have on one hand?
   (A) 4                  (B) 5              (C) 6              (D) 10

5. What is 10 - 4 = ?
   (A) 5                  (B) 6              (C) 7              (D) 8`;
          eWordBank = "[ WORD BANK:  8 , Triangle , 20 , Count , Plus ]";
          eColA = "1. 2 + 2\n  2. Triangle\n  3. 10 - 5\n  4. Square\n  5. 1 Dozen";
          eColB = "(A) 5\n(B) 4\n(C) 12 items\n(D) 3 sides\n(E) 4 corners";
        } else if (sUpper.includes("eng")) {
          eMcqs = `1. What is the plural of 'Cat'?
   (A) Cats               (B) Cates          (C) Kitten         (D) Catting

2. Choose the correct vowel letter:
   (A) B                  (B) E              (C) D              (D) F

3. Which word is a Noun (naming word)?
   (A) Run                (B) Apple          (C) Quickly        (D) Blue

4. Complete the word: C _ T
   (A) A                  (B) Z              (C) X              (D) Q

5. What is the opposite of 'Hot'?
   (A) Warm               (B) Cold           (C) Sun            (D) Dry`;
          eWordBank = "[ WORD BANK:  Apple , Noun , Cold , Alphabet , Vowels ]";
          eColA = "1. Big\n  2. Sun\n  3. Cat\n  4. Happy\n  5. Read";
          eColB = "(A) Animal\n(B) Small\n(C) Book\n(D) Sky\n(E) Sad";
        } else if (sUpper.includes("urdu")) {
          eMcqs = `1. لفظ "بلی" کی جمع کیا ہے؟
   (A) بلیاں              (B) بلے            (C) بلا             (D) بالیاں

2. اردو زبان میں کل کتنے حروفِ تہجی ہیں؟
   (A) 30                 (B) 37             (C) 40             (D) 50

3. "دن" کا متضاد لفظ کون سا ہے؟
   (A) صبح                (B) رات            (C) شام            (D) دوپہر

4. لفظ "سیب" کیا ہے؟
   (A) اسم                (B) فعل            (C) حرف            (D) صفت

5. جملہ مکمل کریں: "سچ بولنا ______________ عادت ہے۔"
   (A) اچھی               (B) بری            (C) خراب           (D) کڑوی`;
          eWordBank = "[ الفاظ کا ذخیرہ:  اسم ، بلیاں ، رات ، اچھی ، پھل ]";
          eColA = "1. دن\n  2. سیب\n  3. قلم\n  4. بادل\n  5. استاد";
          eColB = "(A) لکھنا\n(B) رات\n(C) بارش\n(D) پھل\n(E) علم";
        } else {
          eMcqs = `1. What is the main topic of our lesson in ${subj}?
   (A) ${topic}           (B) Story Book     (C) Play Ground    (D) Drawing

2. Learning about ${topic} in ${subj} helps us:
   (A) Learn new facts    (B) Sleep          (C) Jump           (D) Forget

3. Which feature belongs to ${topic}?
   (A) Key Concept        (B) Eraser         (C) Pencil         (D) Desk

4. Choose the correct description for ${topic}:
   (A) Important Lesson   (B) Blank Page     (C) Star           (D) Sun

5. Is understanding ${topic} helpful for ${grade} students?
   (A) Yes                (B) No             (C) Never          (D) Unknown`;
          eWordBank = `[ WORD BANK:  ${topic} , ${subj} , Lesson , Learn , Practice ]`;
          eColA = `1. Subject\n  2. Topic\n  3. School\n  4. Class\n  5. Worksheet`;
          eColB = `(A) ${topic}\n(B) ${subj}\n(C) ${hcSchoolName || "Citizen School"}\n(D) ${grade}\n(E) 20 Marks`;
        }

        return `${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()}
${(hcExamTitle || `${topic.toUpperCase()} TEST PAPER`).toUpperCase()}
Subject: ${subj} | Class: ${grade} | Max Marks: 20 Marks | Time Allowed: 45 Minutes

--------------------------------------------------------------------------------------------------
STUDENT ROLL NO: [_______________]   STUDENT NAME: [___________________________]   DATE: [___________]
--------------------------------------------------------------------------------------------------

INSTRUCTIONS FOR KIDS:
1. Attempt all questions carefully. Write neatly.
2. Circle or tick the correct options.

==================================================================================================
SECTION A: CIRCLE / TICK THE CORRECT ANSWER (5 Marks)
==================================================================================================
${eMcqs}

==================================================================================================
SECTION B: FILL IN THE BLANKS WITH WORD BANK (10 Marks)
==================================================================================================
${eWordBank}

1. In ${subj}, our today's topic is about ${topic}.
2. Always read your lesson with a focused mind.
3. Studying ${subj} helps us learn new things.
4. Always work carefully and neatly.
5. Practice helps us become excellent students.

==================================================================================================
SECTION C: MATCH THE COLUMNS (5 Marks)
==================================================================================================
Match Column A with Column B:
  Column A              Column B
  ${eColA}              ${eColB}

--------------------------------------------------------------------------------------------------
Teacher Remarks: ____________________                       Grade / Stars: ⭐⭐⭐⭐⭐
                                    [ END OF TEST ]`;
      }

      if (tier === "primary") {
        let pMcqs = "";
        if (sUpper.includes("math")) {
          pMcqs = `1. What is 12 × 6 = ?
   (A) 62              (B) 72               (C) 78             (D) 84

2. The perimeter of a square with a side length of 5 cm is:
   (A) 10 cm           (B) 15 cm            (C) 20 cm          (D) 25 cm

3. Convert 3/4 into a percentage:
   (A) 25%             (B) 50%              (C) 75%            (D) 80%

4. Which fraction is equivalent to 1/2?
   (A) 2/3             (B) 3/6              (C) 4/5            (D) 5/8

5. An angle that measures less than 90° is called an:
   (A) Right angle     (B) Obtuse angle     (C) Acute angle    (D) Straight angle`;
        } else if (sUpper.includes("eng")) {
          pMcqs = `1. Identify the Verb in: "The boy kicked the football."
   (A) The             (B) Boy              (C) Kicked         (D) Football

2. Choose the correct article: "He is _____ honest man."
   (A) a               (B) an               (C) the            (D) no article

3. What is the synonym of the word 'Joyful'?
   (A) Sad             (B) Happy            (C) Angry          (D) Tired

4. Choose the correctly spelled word:
   (A) Beautiful       (B) Beautifull       (C) Beutiful       (D) Biutiful

5. Which punctuation mark ends an interrogative question?
   (A) Period (.)      (B) Comma (,)        (C) Question Mark (?)(D) Exclamation (!)`;
        } else {
          pMcqs = `1. What is the central topic studied in this chapter of ${subj}?
   (A) ${topic}       (B) Random Notes     (C) General Units   (D) Summary

2. Which key rule or fact applies to "${topic}"?
   (A) Primary Principle (B) Secondary Rule   (C) Standard Law   (D) None of these

3. In ${subj}, learning about "${topic}" helps us understand:
   (A) Core Concepts   (B) Fake Theories   (C) Skipping Tests (D) Eraser Use

4. How do primary students identify the main feature of "${topic}"?
   (A) By Observation  (B) By Guessing      (C) By Ignoring    (D) By Deleting

5. Which statement regarding "${topic}" is TRUE?
   (A) It is important (B) It is useless    (C) It is fake     (D) It is empty`;
        }

        return `${(hcSchoolName || "CITIZEN SCHOOL & COLLEGE").toUpperCase()}
${(hcExamTitle || `${topic.toUpperCase()} ASSESSMENT`).toUpperCase()}
Subject: ${subj} | Class: ${grade} | Max Marks: 35 Marks | Time Allowed: 1 Hour

--------------------------------------------------------------------------------------------------
CANDIDATE ROLL NO: [_______________]   STUDENT NAME: [___________________________]   DATE: [___________]
--------------------------------------------------------------------------------------------------

GENERAL INSTRUCTIONS:
1. Read each question carefully before answering.
2. Attempt Section A (MCQs), Section B (Fill in Blanks / True-False), and Section C (Short Questions).

==================================================================================================
SECTION A: MULTIPLE CHOICE QUESTIONS (10 Marks)
==================================================================================================
${pMcqs}

==================================================================================================
SECTION B: TRUE / FALSE & FILL IN THE BLANKS (10 Marks)
==================================================================================================
State whether True or False:
1. Photosynthesis occurs in the green leaves of plants. [ True / False ]
2. The Sun revolves around the Earth. [ True / False ]

Fill in the blanks:
3. The main concept of ${topic} in ${subj} is ______________.
4. Standard measurements in science are recorded using ______________ units.
5. A simple example of ${topic} in daily life is ______________.

==================================================================================================
SECTION C: SHORT DESCRIPTIVE QUESTIONS (15 Marks)
==================================================================================================
Answer the following questions in 2-3 lines each: (3 x 5 = 15 Marks)
1. Define "${topic}" in simple words and give one example.
2. State two important rules or facts related to ${topic}.
3. Draw or describe a basic diagram illustrating ${topic}.

--------------------------------------------------------------------------------------------------
Teacher Signature: ____________________               Marks Obtained: _____ / 35
                                    [ END OF TEST ]`;
      }

      let mcqs = "";
      let shortQs = "";
      let longQs = "";

      if (sUpper.includes("math")) {
        mcqs = `  1.1 What are the roots of the quadratic equation x² - 5x + 6 = 0?
      (A) x = 1, 6          (B) x = 2, 3      (C) x = -2, -3      (D) x = 0, 5

  1.2 What is the exact trigonometric value of sin(90°)?
      (A) 0                 (B) 0.5           (C) 1               (D) √3/2

  1.3 What is the derivative of f(x) = x³ with respect to x?
      (A) 3x                (B) 3x²           (C) x²/3            (D) 6x

  1.4 The sum of internal angles of any triangle in Euclidean geometry is:
      (A) 90°               (B) 180°          (C) 270°            (D) 360°

  1.5 If the discriminant b² - 4ac = 0 in ax² + bx + c = 0, the roots are:
      (A) Real & Equal      (B) Real & Unequal (C) Imaginary      (D) Irrational`;

        shortQs = `  (i)   Solve the quadratic equation x² + 7x + 12 = 0 using factorization on ${topic}.
  (ii)  State the Pythagorean Theorem and solve for the hypotenuse if base = 3 and perpendicular = 4.
  (iii) Evaluate log₁₀(1000) and state the logarithmic laws relevant to ${topic}.
  (iv)  Find the slope of the line passing through points A(2, 3) and B(4, 7).
  (v)   Simplify the algebraic expression: (2x + 3)(x - 5) + 15.`;

        longQs = `  (a) Prove the Quadratic Formula x = [-b ± √(b² - 4ac)] / 2a step-by-step and solve 2x² - 8x + 6 = 0.
  (b) Prove that sin²(θ) + cos²(θ) = 1 and derive the identities for tan(2θ) and sec²(θ).`;

      } else if (sUpper.includes("chem")) {
        mcqs = `  1.1 Which chemical bond involves complete transfer of electrons between atoms?
      (A) Covalent Bond     (B) Ionic Bond    (C) Metallic Bond   (D) Hydrogen Bond

  1.2 What is the pH value of a purely neutral aqueous solution at 25°C?
      (A) 0                 (B) 7             (C) 14              (D) 1

  1.3 How many particles are in one mole of any substance (Avogadro's Number)?
      (A) 6.022 × 10²³      (B) 3.00 × 10⁸    (C) 1.6 × 10⁻¹⁹     (D) 9.8 × 10³

  1.4 What is the chemical formula for Sodium Chloride (table salt)?
      (A) NaOH              (B) NaCl          (C) Na₂CO₃          (D) HCl

  1.5 An acidic solution turns blue litmus paper into:
      (A) Yellow            (B) Green         (C) Red             (D) Colorless`;

        shortQs = `  (i)   Define Ionic and Covalent bonding with one chemical compound example for each.
  (ii)  Differentiate between Exothermic and Endothermic reactions with reference to ${topic}.
  (iii) Write a balanced chemical equation for the combustion of Methane (CH₄).
  (iv)  Calculate the molecular mass of Water (H₂O) and Carbon Dioxide (CO₂).
  (v)   State Le Chatelier's Principle and describe how temperature affects equilibrium in ${topic}.`;

        longQs = `  (a) Describe the Haber Process for industrial synthesis of Ammonia (NH₃), detailing temperature, pressure, and catalyst conditions.
  (b) Explain electrochemistry, Faraday's laws of electrolysis, and the working mechanism of a Galvanic Cell.`;

      } else if (sUpper.includes("bio")) {
        if (
          topic.toLowerCase().includes("heart") ||
          topic.toLowerCase().includes("cardio") ||
          topic.toLowerCase().includes("circulat") ||
          topic.toLowerCase().includes("blood")
        ) {
          mcqs = `  1.1 Which chamber of the human heart pumps oxygenated blood into the systemic aorta?
      (A) Right Atrium          (B) Right Ventricle (C) Left Atrium     (D) Left Ventricle

  1.2 The natural pacemaker of the human heart, responsible for initiating electrical impulses, is:
      (A) AV Node               (B) SA Node (Sinoatrial) (C) Bundle of His (D) Purkinje Fibers

  1.3 Which blood vessel carries deoxygenated blood directly from the right ventricle to the lungs?
      (A) Pulmonary Artery      (B) Pulmonary Vein  (C) Systemic Aorta  (D) Superior Vena Cava

  1.4 The bicuspid (mitral) valve in the human heart prevents the backflow of blood between:
      (A) Right Atrium & Ventricle  (B) Left Atrium & Ventricle  (C) Left Ventricle & Aorta  (D) Right Ventricle & Pulmonary Artery

  1.5 In a healthy adult human, normal resting systolic and diastolic blood pressure is approximately:
      (A) 80 / 120 mmHg         (B) 120 / 80 mmHg   (C) 140 / 100 mmHg  (D) 100 / 50 mmHg`;

          shortQs = `  (i)   Differentiate between Systole and Diastole in the human cardiac cycle on "${topic}".
  (ii)  Explain the function of the SA Node and AV Node in cardiac impulse conduction.
  (iii) Trace the path of double circulation of blood starting from the right atrium to the aorta.
  (iv)  What is Coronary Circulation? State the consequence of a blockage in coronary arteries.
  (v)   Differentiate between Arteries, Veins, and Capillaries in terms of structure and function.`;

          longQs = `  (a) Draw a neat, labeled diagram of the internal structure of the Human Heart and describe the mechanism of blood flow in detail.
  (b) Describe the Cardiac Cycle step-by-step and explain how heart sound (Lub-Dub) is produced by cardiac valves.`;
        } else {
          mcqs = `  1.1 Which organelle is known as the powerhouse of the cell for generating ATP energy?
      (A) Ribosome          (B) Mitochondria  (C) Golgi Body      (D) Lysosome

  1.2 Photosynthesis in green plant cells takes place inside which organelle?
      (A) Mitochondria      (B) Chloroplast   (C) Nucleus         (D) Vacoule

  1.3 Human red blood cells carry oxygen using which iron-rich protein?
      (A) Collagen          (B) Insulin       (C) Hemoglobin      (D) Keratin

  1.4 The process of cell division that results in four genetically diverse haploid cells is:
      (A) Mitosis           (B) Meiosis       (C) Osmosis         (D) Diffusion

  1.5 Normal somatic human cells contain how many total chromosomes?
      (A) 23                (B) 46            (C) 48              (D) 50`;

          shortQs = `  (i)   Define Photosynthesis and write its complete balanced chemical equation regarding ${topic}.
  (ii)  Draw and label a neat diagram of a typical Plant Cell or Animal Cell.
  (iii) Compare the key structural differences between DNA and RNA molecules.
  (iv)  Explain the Lock and Key model of Enzyme action in biological catalysts.
  (v)   Outline the pathway of blood circulation through the human heart.`;

          longQs = `  (a) Describe the detailed stages of Mitosis cell division (Prophase, Metaphase, Anaphase, Telophase) with labeled diagrams.
  (b) Explain Mendel's Laws of Inheritance (Law of Segregation and Independent Assortment) using Punnett Squares.`;
        }

      } else if (sUpper.includes("eng")) {
        mcqs = `  1.1 Identify the part of speech for 'swiftly' in: "She ran swiftly across the field":
      (A) Noun              (B) Adjective     (C) Adverb          (D) Verb

  1.2 What is the passive voice of: "He writes an essay"?
      (A) An essay was written by him         (B) An essay is written by him
      (C) An essay is writing by him          (D) An essay written by him

  1.3 Choose the correct antonym of the word "Ancient":
      (A) Antique           (B) Modern        (C) Historic        (D) Old

  1.4 "As brave as a lion" is an example of which figure of speech?
      (A) Metaphor          (B) Simile        (C) Personification (D) Hyperbole

  1.5 Choose the correct article: "He is _____ European citizen":
      (A) a                 (B) an            (C) the             (D) no article`;

        shortQs = `  (i)   Change the speech from direct to indirect: He said, "I am studying English grammar."
  (ii)  Identify and correct two grammatical errors in the sentence: "He don't know where is the school."
  (iii) Define a Metaphor and give two original examples.
  (iv)  Write a 5-line summary of the main poem or literary lesson on "${topic}".
  (v)   Differentiate between Transitive and Intransitive verbs with sentence examples.`;

        longQs = `  (a) Write a comprehensive persuasive essay (250 words) on "${topic}" with a clear introduction, body paragraphs, and conclusion.
  (b) Write a formal application to the School Principal requesting a 3-day leave of absence or fee concession.`;

      } else if (sUpper.includes("comp") || sUpper.includes("computer")) {
        mcqs = `  1.1 Which data structure operates on the First-In-First-Out (FIFO) principle?
      (A) Stack             (B) Queue         (C) Array           (D) Binary Tree

  1.2 In programming, a loop that never terminates is known as an:
      (A) Finite Loop       (B) Infinite Loop (C) Open Loop       (D) Nested Loop

  1.3 Which protocol is used to securely transfer encrypted webpages over the Internet?
      (A) HTTP              (B) HTTPS         (C) FTP             (D) SMTP

  1.4 What is the primary function of RAM in a computer system?
      (A) Permanent Storage (B) Volatile High-Speed Memory (C) Power Supply (D) Graphics Output

  1.5 In SQL databases, which command is used to retrieve data from a table?
      (A) UPDATE            (B) DELETE        (C) SELECT          (D) INSERT`;

        shortQs = `  (i)   Differentiate between RAM (Random Access Memory) and ROM (Read Only Memory).
  (ii)  Write a C++ / Python program snippet to check if a number is Even or Odd.
  (iii) Define the term "IP Address" and differentiate between IPv4 and IPv6.
  (iv)  Explain the functions of an Operating System in hardware management.
  (v)   Define Primary Key and Foreign Key in relational database tables.`;

        longQs = `  (a) Draw and explain the Block Diagram of Computer Architecture (CPU, ALU, Control Unit, Memory, I/O).
  (b) Explain System Development Life Cycle (SDLC) phases in software development on ${topic}.`;

      } else if (sUpper.includes("urdu")) {
        mcqs = `  1.1 اردو زبان کے قومی شاعر کون ہیں؟
      (A) میر تقی میر       (B) علامہ محمد اقبال  (C) مرزا اسد اللہ خان غالب  (D) فیض احمد فیض

  1.2 قواعد کی رو سے لفظ "خوبصورت" کیا ہے؟
      (A) اسم               (B) فعل           (C) صفت             (D) ضمیر

  1.3 لفظ "علم" کا متضاد لفظ کیا ہے؟
      (A) جہالت             (B) عقل           (C) دانش            (D) حکمت

  1.4 محاورہ "آب آب ہونا" کا صحیح مطلب کیا ہے؟
      (A) پانی پینا         (B) بہت شرمندہ ہونا  (C) نہانا           (D) سیراب ہونا

  1.5 جملہ مکمل کریں: "محنت میں ______________ ہے۔"
      (A) عظمت              (B) ذلت           (C) بربادی          (D) خسارہ`;

        shortQs = `  (i)   سبق "${topic}" کا مختصر اور جامع خلاصہ اپنے الفاظ میں تحریر کریں۔
  (ii)  درج ذیل الفاظ کے متضاد تحریر کریں: (علم ، سچ ، اندھیرا ، دوست ، اونچا)۔
  (iii) درج ذیل محاورات کو جملوں میں استعمال کریں: (آب آب ہونا ، اینٹ سے اینٹ بجانا)۔
  (iv)  اسم نکرہ اور اسم معرفہ کی تعریفیں بمع دو دو مثالیں تحریر کریں۔
  (v)   علامہ اقبال کی شاعری کا بنیادی پیغام کیا ہے؟ مختصر بیان کریں۔`;

        longQs = `  (a) "${topic}" کے عنوان پر ایک جامع، بااثر اور تفصیلی مضمون (کم از کم 250 الفاظ) تحریر کریں۔
  (b) پرنسپل کے نام درخواست برائے حصولِ کریکٹر سرٹیفکیٹ یا فیس معافی تحریر کریں۔`;

      } else if (sUpper.includes("islam") || sUpper.includes("islamiat")) {
        mcqs = `  1.1 ارکانِ اسلام میں سب سے پہلا رکن کون سا ہے؟
      (A) نماز              (B) کلمہ طیبہ (توحید) (C) روزہ              (D) زکوٰۃ

  1.2 قرآن مجید کی سب سے بڑی سورۃ کون سی ہے؟
      (A) سورۃ یٰسین         (B) سورۃ البقرہ     (C) سورۃ الاخلاص       (D) سورۃ الفاتحہ

  1.3 نبی کریم ؐ پر پہلی وحی کس غار میں نازل ہوئی؟
      (A) غارِ ثور           (B) غارِ حرا       (C) غارِ حرا و ثور      (D) میدانِ عرفات

  1.4 زکوٰۃ نصاب پر کتنے عرصے بعد فرض ہوتی ہے؟
      (A) ایک سال (12 ماہ)  (B) چھ ماہ        (C) دو سال          (D) ہر مہینے

  1.5 غزوہِ بدر کس ہجری میں لڑی گئی؟
      (A) 1 ہجری            (B) 2 ہجری        (C) 3 ہجری          (D) 5 ہجری`;

        shortQs = `  (i)   عقیدہِ توحید سے کیا مراد ہے؟ اس کی اہمیت قرآن مجید کی روشنی میں بیان کریں۔
  (ii)  حقوق العباد سے کیا مراد ہے؟ دو مثالیں تحریر کریں۔
  (iii) طہارت اور پاکیزگی کی اہمیت پر ایک مختصر نوٹ تحریر کریں۔
  (iv)  سیرتِ طیبہ ؐ کی روشنی میں حسنِ اخلاق اور سچائی کی اہمیت بیان کریں۔
  (v)   نماز کے باقاعدہ پڑھنے کے دو انفرادی اور دو اجتماعی فوائد تحریر کریں۔`;

        longQs = `  (a) "${topic}" کے عنوان پر ایک جامع نوٹ لکھیں جس میں قرآنی آیات اور احادیثِ مبارکہ کے حوالہ جات شامل ہوں۔
  (b) خطبہِ حجۃ الوداع کے بنیادی نکات اور انسانی حقوق کا منشور تفصیل سے قلمبند کریں۔`;

      } else if (sUpper.includes("phys")) {
        mcqs = `  1.1 What is the SI unit of Force?
      (A) Joule (J)         (B) Newton (N)    (C) Watt (W)        (D) Pascal (Pa)

  1.2 Newton's Second Law of Motion is mathematically stated as:
      (A) F = m / a         (B) F = m × a     (C) F = m + a       (D) F = m × v

  1.3 The resistance of any physical object to a change in its state of motion is called:
      (A) Momentum          (B) Inertia       (C) Velocity        (D) Friction

  1.4 What is the average gravitational acceleration (g) near Earth's surface?
      (A) 8.8 m/s²          (B) 9.8 m/s²      (C) 10.8 m/s²       (D) 12.0 m/s²

  1.5 When a body moves with uniform constant velocity, its acceleration is:
      (A) Maximum           (B) Zero          (C) Negative        (D) Infinite`;

        shortQs = `  (i)   State Newton's Three Laws of Motion with one practical real-world example for each.
  (ii)  Differentiate between Scalar and Vector quantities with two examples of each.
  (iii) A car accelerates uniformly from rest to 20 m/s in 5 seconds. Calculate its acceleration.
  (iv)  State Ohm's Law and write its mathematical formula V = IR.
  (v)   Define Kinetic Energy and Potential Energy, stating their SI units.`;

        longQs = `  (a) Derive the Three Equations of Motion (v_f = v_i + at, S = v_i t + 1/2 a t², 2aS = v_f² - v_i²) using graphical method.
  (b) Explain Total Internal Reflection, Critical Angle, and their practical application in Optical Fibers.`;

      } else if (
        sUpper.includes("pak") ||
        sUpper.includes("social") ||
        sUpper.includes("history") ||
        sUpper.includes("geography") ||
        sUpper.includes("civic")
      ) {
        mcqs = `  1.1 The historic 1940 Resolution (Pakistan Resolution) was passed on 23rd March in which city?
      (A) Lahore            (B) Karachi       (C) Dhaka           (D) Islamabad

  1.2 Who is recognized as the Founder of Pakistan and Quaid-e-Azam?
      (A) Allama Iqbal      (B) Quaid-e-Azam Muhammad Ali Jinnah  (C) Sir Syed Ahmed Khan  (D) Liaquat Ali Khan

  1.3 What is the total geographical land area of Pakistan approximately?
      (A) 796,096 sq km     (B) 881,913 sq km (C) 650,000 sq km   (D) 950,000 sq km

  1.4 Which major river is known as the primary lifeline of Pakistan's agricultural irrigation?
      (A) Indus River       (B) Jhelum River  (C) Chenab River    (D) Ravi River

  1.5 The Constitution of Pakistan was officially promulgated in which year?
      (A) 1956              (B) 1962          (C) 1973            (D) 1985`;

        shortQs = `  (i)   State the key political objectives and significance of "${topic}" in ${subj}.
  (ii)  Write a short note on the Two-Nation Theory as presented by Sir Syed Ahmed Khan and Allama Iqbal.
  (iii) Differentiate between the Northern Mountainous Region and the Indus Plain in Pakistan.
  (iv)  Explain the importance of the 14 Points of Quaid-e-Azam in the freedom movement.
  (v)   State three main agricultural crops cultivated in Pakistan and their ideal climatic requirements.`;

        longQs = `  (a) Write a detailed analytical essay on "${topic}", highlighting its historical background, key events, and constitutional impact on Pakistan.
  (b) Discuss the geographical features, natural resources, and economic importance of Pakistan's provinces.`;

      } else {
        mcqs = `  1.1 What is the primary definition or fundamental principle governing "${topic}" in ${subj}?
      (A) Core Concept of ${topic}     (B) Auxiliary Factor     (C) Random Variable     (D) Unrelated Formula

  1.2 Which key rule, law, or mechanism applies directly to studying "${topic}"?
      (A) Standard Law of ${topic}     (B) Inverse Rule         (C) Null Hypothesis     (D) Secondary Assumption

  1.3 How is a primary property or feature evaluated during practical testing of "${topic}"?
      (A) Quantitative Measurement      (B) Guesswork            (C) Random Selection    (D) Estimation Only

  1.4 In practical real-world applications, understanding "${topic}" is essential to:
      (A) Solve Domain Problems        (B) Increase Noise       (C) Delete Data         (D) Skip Verification

  1.5 Which statement accurately describes the main characteristic of "${topic}" in ${subj}?
      (A) It provides essential foundational principles  (B) It is obsolete  (C) It has no practical use  (D) None of these`;

        shortQs = `  (i)   Define "${topic}" clearly and state its main significance in ${subj}.
  (ii)  State two key rules, principles, or formulas associated with ${topic}.
  (iii) Differentiate between the primary components or stages involved in ${topic}.
  (iv)  Explain how ${topic} is applied in modern practical situations or industry.
  (v)   Summarize the core takeaways learned in this lesson on ${topic}.`;

        longQs = `  (a) Write a comprehensive, step-by-step detailed analytical account on "${topic}" in ${subj}, explaining its origin, key concepts, and practical examples.
  (b) Discuss the major challenges, mathematical/structural derivations, and future developments related to ${topic}.`;
      }

      return `${CITIZEN_SCHOOL_HEADER(subj, topic, grade)}

==================================================================================================
SECTION A: OBJECTIVE / MULTIPLE CHOICE QUESTIONS (10 Marks)
==================================================================================================
Q1. Choose the correct option for each of the following statements regarding ${topic}:

${mcqs}

==================================================================================================
SECTION B: SHORT ANSWER QUESTIONS (20 Marks)
==================================================================================================
Q2. Attempt any FIVE (5) short questions from the following on ${topic}: (5 x 4 = 20 Marks)

${shortQs}

==================================================================================================
SECTION C: LONG / EXTENDED QUESTIONS (20 Marks)
==================================================================================================
Q3. Attempt any TWO (2) detailed questions from the following: (2 x 10 = 20 Marks)

${longQs}

--------------------------------------------------------------------------------------------------
Invigilator Signature: ____________________        Controller Examination: ____________________
                                    [ END OF EXAM PAPER ]`;
    }

    if (lowercase.includes("analyze") || lowercase.includes("results")) {
      return `ACADEMIC DIAGNOSTIC PERFORMANCE REPORT
Roster Level: ${raGrade || "Grade 10"} - ${raSubject || "Physics"}

1. SCORE METRICS:
   - Evaluated Roster Size: 4 Students
   - Class average score: 69%
   - Highest Performance: Aisha Rehman (95%)
   - Critical Remedial Need: Zain Malik (42%)

2. IDENTIFIED LEARNING GAPS:
   - Solid grasping of kinematics and motion vectors.
   - Significant difficulty applying acceleration equations and Newton's formulas (observed on Zain Malik's paper).

3. STRATEGIC INTERVENTIONS:
   - Peer-assisted learning: Pair high-scoring peers with students under 60%.
   - Targeted diagnostic worksheet reviews focusing entirely on multi-step formula calculation.
   - Weekend study hall review session.`;
    }

    if (lowercase.includes("grade") || lowercase.includes("rubric")) {
      return `RUBRIC ASSESSMENT GRADE REPORT
Assigned Grade: 9 / 10 (A Grade)

FULFILLED CRITERIA:
- Correctly defined force as a physical interaction changing motion (3/3 pts).
- Mentioned acceleration and velocity changes (3/3 pts).
- Stated it has magnitude and direction (3/4 pts).

FEEDBACK:
"Excellent definition and conceptual mastery. You correctly identified force as a vector quantity. To get a perfect score, explicitly state its standard unit is the Newton (N)."`;
    }

    if (lowercase.includes("behavior") || lowercase.includes("observations")) {
      return `COUNSELING COGNITIVE REVIEW REPORT
Observations: Distracts peers during groups, excels working alone.

1. COGNITIVE STYLE: Independent analytical learner. High intrinsic focus during solitary work, but lower social motivation leads to distraction in unstructured groups.
2. RECOMMENDATIONS:
   - Alternate roles: Assign this student structured leadership roles in group projects (e.g., Lead Analyst).
   - Self-pacing opportunities: Provide extension challenges when individual worksheets are completed.
   - Positive reinforcement: Praise social cooperation and team completions.`;
    }

    return `Academic AI Assistant Answer:
Based on your prompt, I have evaluated your inquiry. Our model is highly trained in academic lesson structures, grading assistances, and database query flows.

To activate real-time Gemini generation, configure a valid GEMINI_API_KEY inside the application Secrets dashboard. The app has fallen back to offline diagnostic reports to prevent blockages.`;
  };

  return (
    <div className="space-y-6" id="ai-tools-module-root">
      {/* Sub tabs */}
      <div className="flex flex-wrap border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("question-gen")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "question-gen" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          AI Exam Question Generator & Hard Copy Composer
        </button>
        <button
          onClick={() => setActiveSubTab("lesson-plan")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "lesson-plan" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          AI Lesson Planner
        </button>
      </div>

      {/* SUB-VIEW: Question Generator */}
      {activeSubTab === "question-gen" && (
        <div className="space-y-4">
          {/* Mode Selector Header */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setExamGenMode("prompt")}
              className={`flex-1 min-w-[180px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                examGenMode === "prompt"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Generate From Topic / Prompt</span>
            </button>
            <button
              onClick={() => setExamGenMode("hardcopy")}
              className={`flex-1 min-w-[180px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                examGenMode === "hardcopy"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Scan & Compose Hard Copy / Photo 📸</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Parameters Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 h-fit">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                {examGenMode === "prompt" ? "Topic Generator Parameters" : "Hard Copy Paper Settings"}
              </h4>

              {examGenMode === "prompt" ? (
                <div className="text-xs space-y-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Select Subject</label>
                    <select
                      value={qSubject}
                      onChange={(e) => setQSubject(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium text-slate-800"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="General Science">General Science</option>
                      <option value="English Literature">English Literature</option>
                      <option value="English Grammar">English Grammar</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Islamiat">Islamiat</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Social Studies">Social Studies / Pak Studies</option>
                      <option value="General Knowledge">General Knowledge (GK)</option>
                      <option value="Other / Custom Subject">Other / Custom Subject...</option>
                    </select>
                  </div>

                  {qSubject === "Other / Custom Subject" && (
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">Type Custom Subject Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Economics, Food & Nutrition, Geography"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Target Grade Level</label>
                    <select
                      value={qGrade}
                      onChange={(e) => setQGrade(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium text-slate-800"
                    >
                      <option value="Playgroup / Nursery">Playgroup / Nursery</option>
                      <option value="KG / Prep">KG / Prep</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11 (FSC Part 1)</option>
                      <option value="Grade 12">Grade 12 (FSC Part 2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Chapter Topic *</label>
                    <input
                      type="text"
                      value={qTopic}
                      onChange={(e) => setQTopic(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Test Formats</label>
                    <select
                      value={qType}
                      onChange={(e) => setQType(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                    >
                      <option value="Multiple Choice & Short Answers">Multiple Choice & Short Answers</option>
                      <option value="Extended Essay Prompts">Extended Essay Prompts</option>
                      <option value="Quantitative Problems">Quantitative Problems</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateQuestions}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Examination Paper ⚡"}
                  </button>
                </div>
              ) : (
                /* Hard Copy Upload & Composer Controls */
                <div className="text-xs space-y-3.5">
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-2">
                    <span className="block font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" /> Upload Hard Copy Photo / Scan
                    </span>
                    <p className="text-[10px] text-slate-600 leading-normal">
                      Take a picture of a handwritten test paper, book page, or printed question sheet. AI will transcribe and compose it cleanly.
                    </p>

                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-indigo-200 bg-white hover:bg-indigo-50/30 transition rounded-lg p-3 text-center space-y-1">
                        <FileUp className="w-5 h-5 text-indigo-500 mx-auto" />
                        <span className="block text-[11px] font-bold text-indigo-700">
                          {uploadedHardCopy ? "Change Photo" : "Upload Hard Copy File"}
                        </span>
                        <span className="block text-[9px] text-slate-400">JPG, PNG, WEBP or PDF</span>
                      </div>
                    </label>

                    {uploadedHardCopy && (
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200 text-[11px]">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={uploadedHardCopy.previewUrl}
                            alt="Hard copy preview"
                            className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                          />
                          <span className="truncate font-medium text-slate-700">{uploadedHardCopy.name}</span>
                        </div>
                        <button
                          onClick={() => setUploadedHardCopy(null)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Remove uploaded image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sample Hard Copy Presets */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      Or Choose a Sample Hard Copy:
                    </label>
                    <div className="space-y-1.5">
                      {SAMPLE_HARDCOPIES.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSelectSampleHardCopy(sample)}
                          className={`w-full text-left p-2 rounded-lg border text-[11px] transition cursor-pointer flex items-center justify-between ${
                            uploadedHardCopy?.name === sample.title
                              ? "bg-indigo-50 border-indigo-300 font-bold text-indigo-900"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div>
                            <span className="block font-semibold">{sample.title}</span>
                            <span className="block text-[9px] text-slate-500">{sample.description}</span>
                          </div>
                          {uploadedHardCopy?.name === sample.title && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Header Formats */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Target Paper Header Info
                    </span>

                    <div>
                      <label className="block text-slate-600 text-[10px] mb-0.5">School Name</label>
                      <input
                        type="text"
                        value={hcSchoolName}
                        onChange={(e) => setHcSchoolName(e.target.value)}
                        className="w-full border border-slate-200 rounded p-1.5 bg-slate-50 text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-[10px] mb-0.5">Exam Title</label>
                      <input
                        type="text"
                        value={hcExamTitle}
                        onChange={(e) => setHcExamTitle(e.target.value)}
                        className="w-full border border-slate-200 rounded p-1.5 bg-slate-50 text-[11px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 text-[10px] mb-0.5">Class / Grade</label>
                        <input
                          type="text"
                          value={hcGrade}
                          onChange={(e) => setHcGrade(e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 bg-slate-50 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[10px] mb-0.5">Subject</label>
                        <input
                          type="text"
                          value={hcSubject}
                          onChange={(e) => setHcSubject(e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 bg-slate-50 text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 text-[10px] mb-0.5">Time Allowed</label>
                        <input
                          type="text"
                          value={hcTime}
                          onChange={(e) => setHcTime(e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 bg-slate-50 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[10px] mb-0.5">Total Marks</label>
                        <input
                          type="text"
                          value={hcMarks}
                          onChange={(e) => setHcMarks(e.target.value)}
                          className="w-full border border-slate-200 rounded p-1.5 bg-slate-50 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateQuestions}
                    disabled={loading || !uploadedHardCopy}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Extract & Compose Paper ⚡
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Output Display Panel */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              {/* Database status alert */}
              {dbSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    {dbSuccessMsg}
                  </span>
                  <button onClick={() => setDbSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Composed Examination Question Paper</span>
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowSavedDbModal(true)}
                    className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                    title="View saved exam papers in Firestore Database"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-600" /> Saved Papers Database ({savedPapers.length})
                  </button>

                  {generatedQuestions && (
                    <>
                      <button
                        onClick={handleSavePaperToDb}
                        disabled={isSavingToDb}
                        className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs disabled:opacity-50"
                        title="Save current paper to Firestore Database"
                      >
                        {isSavingToDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save to Database 💾
                      </button>

                      <button
                        onClick={() => speakText(generatedQuestions)}
                        className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        title="Read paper aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> {speechActive ? "Mute" : "Listen"}
                      </button>
                      <button
                        onClick={handleCopyPaper}
                        className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        title="Copy paper text"
                      >
                        {copiedPaper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPaper ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={handleDownloadPaperDoc}
                        className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        title="Download as text file"
                      >
                        <Download className="w-3.5 h-3.5" /> Download (.txt)
                      </button>
                      <button
                        onClick={handlePrintPaper}
                        className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                        title="Print Paper / A4 View"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Paper 🖨️
                      </button>
                      <button
                        onClick={handleNewPaper}
                        className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        title="Start a new paper"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> New Paper ➕
                      </button>
                      <button
                        onClick={handleClearPaper}
                        className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                        title="Delete / Clear paper from panel"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Paper 🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[420px] text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                {generatedQuestions || (
                  <div className="text-center text-slate-400 py-16 space-y-3">
                    <FileText className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">
                      {examGenMode === "prompt"
                        ? "Configure topic parameters and click 'Generate' to create an examination paper."
                        : "Upload a hard copy photo or pick a sample above, then click 'Extract & Compose Paper'."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Formal A4 Printable Exam Paper Modal */}
      {isViewingFullPaperModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Controls Bar - Hidden during print */}
            <div className="p-4 bg-slate-800 text-white flex flex-wrap items-center justify-between rounded-t-2xl no-print gap-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Formal Examination Paper - Ready for Direct Printing</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyPaper}
                  className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  title="Copy paper text"
                >
                  {copiedPaper ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPaper ? "Copied!" : "Copy Text"}
                </button>
                <button
                  onClick={handleDownloadPaperDoc}
                  className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  title="Download paper file"
                >
                  <Download className="w-3.5 h-3.5" /> Download (.txt)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Paper (A4)
                </button>
                <button
                  onClick={() => {
                    setIsViewingFullPaperModal(false);
                    handleClearPaper();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Paper
                </button>
                <button
                  onClick={() => setIsViewingFullPaperModal(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Composed Board Exam Paper Content */}
            <div className="p-6 overflow-y-auto printable-area bg-slate-100">
              <ComposedExamPaperView
                paper={{
                  schoolName: hcSchoolName || schoolConfig?.schoolName || "CITIZEN SCHOOL & COLLEGE",
                  examTitle: hcExamTitle || "EXAMINATION PAPER",
                  subject: hcSubject || qSubject || "General",
                  grade: hcGrade || qGrade || "Grade 10",
                  timeAllowed: hcTime || "2 Hours",
                  maxMarks: hcMarks || "50 Marks",
                  content: generatedQuestions,
                  teacherName: loggedInUser?.name,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Saved Database Exam Papers Modal */}
      {showSavedDbModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>Saved Examination Papers Database (Firestore)</span>
              </div>
              <button
                onClick={() => setShowSavedDbModal(false)}
                className="p-1 text-slate-300 hover:text-white hover:bg-indigo-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {savedPapers.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Database className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">No exam papers stored in database yet.</p>
                  <p className="text-[11px] text-slate-400">Compose or generate an exam paper and click "Save to Database 💾".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">{paper.schoolName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {paper.subject} ({paper.grade})
                          </span>
                          {paper.teacherName && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              ✍️ By: {paper.teacherName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700">{paper.examTitle}</p>
                        <div className="text-[10px] text-slate-500 flex flex-wrap gap-3">
                          <span>Time: {paper.timeAllowed}</span>
                          <span>Marks: {paper.maxMarks}</span>
                          {paper.status && <span className="text-emerald-700 font-bold">• {paper.status}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleLoadSavedPaper(paper)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" /> Open / Edit
                        </button>
                        <button
                          onClick={() => {
                            handleLoadSavedPaper(paper);
                            setTimeout(() => {
                              handlePrintPaper();
                            }, 200);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" /> Direct Print
                        </button>
                        <button
                          onClick={() => handleDeletePaperFromDb(paper.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete paper from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Lesson Planner */}
      {activeSubTab === "lesson-plan" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 h-fit">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
              Lesson Plan Parameters
            </h4>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-600 mb-1">Select Subject</label>
                <select
                  value={lpSubject}
                  onChange={(e) => setLpSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                >
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English Literature">English Literature</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Grade Level</label>
                <select
                  value={lpGrade}
                  onChange={(e) => setLpGrade(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Topic *</label>
                <input
                  type="text"
                  value={lpTopic}
                  onChange={(e) => setLpTopic(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Class Duration</label>
                <select
                  value={lpDuration}
                  onChange={(e) => setLpDuration(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50"
                >
                  <option value="45 Minutes">45 Minutes</option>
                  <option value="60 Minutes">60 Minutes</option>
                  <option value="90 Minutes">90 Minutes</option>
                </select>
              </div>

              <button
                onClick={handleGenerateLessonPlan}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Build Lesson Plan ⚡"}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-600" /> Pedagogical Lesson Plan
              </span>
              {generatedLessonPlan && (
                <button
                  onClick={() => speakText(generatedLessonPlan)}
                  className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1 px-2.5 rounded-lg flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> {speechActive ? "Mute Readout" : "Listen Readout"}
                </button>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[300px] text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
              {generatedLessonPlan || "Specify Lesson Plan parameters and generate step-by-step lecture files."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

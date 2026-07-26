import React from "react";

export interface PaperDetails {
  schoolName: string;
  examTitle: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  maxMarks: string;
  content: string;
  teacherName?: string;
  date?: string;
  paperCode?: string;
}

export interface ParsedMcqOption {
  label: string;
  text: string;
}

export interface ParsedQuestion {
  numStr: string;
  text: string;
  marksStr?: string;
  options?: ParsedMcqOption[];
}

export interface ParsedSection {
  title: string;
  instructions?: string;
  questions: ParsedQuestion[];
  rawLines: string[];
}

/**
 * Intelligent parser for examination paper text string
 */
export function parsePaperContent(content: string): ParsedSection[] {
  if (!content) return [];

  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: ParsedSection[] = [];

  let currentSection: ParsedSection = {
    title: "GENERAL QUESTIONS",
    questions: [],
    rawLines: [],
  };

  let currentQuestion: ParsedQuestion | null = null;

  const sectionRegex = /^(SECTION\s+[A-Z0-9]|PART\s+[I|V|X|0-9]+|OBJECTIVE\s+TYPE|SUBJECTIVE\s+TYPE|SECTION\s*-\s*[A-Z0-9])/i;
  const questionRegex = /^(\d+|[Qq]\.?\d+|[Qq]uestion\s*\d+|\([i|v|x|0-9]+\))\s*[\.\:\-\)]\s*(.*)/;
  const optionRegex = /^[\(\[]?([A-Da-d])[\)\.\:]\s*(.*)/;

  lines.forEach((line) => {
    // Check if line is a Section Header
    if (sectionRegex.test(line) || line.toUpperCase().includes("SECTION A:") || line.toUpperCase().includes("SECTION B:") || line.toUpperCase().includes("SECTION C:")) {
      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      if (currentSection.questions.length > 0 || currentSection.rawLines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/^[#\*\-\s]+/, "").trim(),
        questions: [],
        rawLines: [],
      };
      return;
    }

    // Check if line is Note / Section Instructions
    if (line.toLowerCase().startsWith("note:") || line.toLowerCase().startsWith("instructions:")) {
      currentSection.instructions = line;
      return;
    }

    // Check if line is a new Question
    const qMatch = line.match(questionRegex);
    if (qMatch) {
      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
      }
      // Extract mark if present like [5 Marks] or (4)
      const marksMatch = line.match(/[\(\[](\d+\s*Marks?|\d+)\s*[\)\]]/i);
      currentQuestion = {
        numStr: qMatch[1],
        text: qMatch[2],
        marksStr: marksMatch ? marksMatch[1] : undefined,
        options: [],
      };
      return;
    }

    // Check if line contains inline options like (A) option1 (B) option2 (C) option3 (D) option4
    if (currentQuestion && (line.includes("(A)") || line.includes("(a)") || line.includes("A)") || line.includes("a)"))) {
      const parts = line.split(/(?=[\(\[]?[A-Da-d][\)\.\:\s])/);
      const parsedOptions: ParsedMcqOption[] = [];
      parts.forEach((part) => {
        const trimmed = part.trim();
        const optMatch = trimmed.match(/^[\(\[]?([A-Da-d])[\)\.\:]\s*(.*)/);
        if (optMatch) {
          parsedOptions.push({
            label: optMatch[1].toUpperCase(),
            text: optMatch[2].trim(),
          });
        }
      });

      if (parsedOptions.length > 0) {
        currentQuestion.options = [...(currentQuestion.options || []), ...parsedOptions];
        return;
      }
    }

    // Single option per line
    if (currentQuestion) {
      const optMatch = line.match(optionRegex);
      if (optMatch) {
        if (!currentQuestion.options) currentQuestion.options = [];
        currentQuestion.options.push({
          label: optMatch[1].toUpperCase(),
          text: optMatch[2].trim(),
        });
        return;
      }
    }

    // If part of existing question
    if (currentQuestion) {
      currentQuestion.text += " " + line;
    } else {
      currentSection.rawLines.push(line);
    }
  });

  if (currentQuestion) {
    currentSection.questions.push(currentQuestion);
  }
  if (currentSection.questions.length > 0 || currentSection.rawLines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Beautifully composed Pakistani BISE / Board standard paper view component
 */
export const ComposedExamPaperView: React.FC<{ paper: PaperDetails }> = ({ paper }) => {
  const sections = parsePaperContent(paper.content);

  return (
    <div className="bg-white text-slate-900 max-w-4xl mx-auto p-6 md:p-10 border-2 border-slate-900 shadow-xl font-serif text-xs space-y-5 leading-relaxed selection:bg-amber-100">
      {/* Arabic Bismillah Header */}
      <div className="text-center font-serif text-sm font-bold text-slate-800 tracking-wider">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      {/* Main Institution Header Banner */}
      <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-slate-950">
          {paper.schoolName || "CITIZEN SCHOOL & COLLEGE"}
        </h1>
        <h2 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wide">
          {paper.examTitle || "ANNUAL EXAMINATION 2025-2026"}
        </h2>
        <div className="text-[10px] font-sans font-semibold text-slate-600 uppercase tracking-widest pt-0.5">
          Board Standard Paper Composing Format
        </div>
      </div>

      {/* Candidate Detail Bar */}
      <div className="border border-slate-900 p-2.5 grid grid-cols-1 md:grid-cols-3 gap-2 font-sans text-[11px] font-bold bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <span>ROLL NO:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-5 h-6 border border-slate-900 bg-white flex items-center justify-center text-xs font-mono"></div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span>CANDIDATE NAME:</span>
          <div className="border-b border-slate-900 grow min-h-[18px]"></div>
        </div>
        <div className="flex items-center gap-1">
          <span>DATE:</span>
          <div className="border-b border-slate-900 grow min-h-[18px]">{paper.date || ""}</div>
        </div>
      </div>

      {/* Paper Specification Box */}
      <div className="border border-slate-900 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-900 text-center font-sans font-bold text-[11px] bg-slate-100/70">
        <div className="p-2">
          <span className="text-[9px] text-slate-500 block uppercase">SUBJECT</span>
          <span className="text-slate-900 font-extrabold">{paper.subject || "General"}</span>
        </div>
        <div className="p-2">
          <span className="text-[9px] text-slate-500 block uppercase">CLASS / GRADE</span>
          <span className="text-slate-900 font-extrabold">{paper.grade || "Grade 10"}</span>
        </div>
        <div className="p-2">
          <span className="text-[9px] text-slate-500 block uppercase">TIME ALLOWED</span>
          <span className="text-slate-900 font-extrabold">{paper.timeAllowed || "2 Hours"}</span>
        </div>
        <div className="p-2">
          <span className="text-[9px] text-slate-500 block uppercase">MAX MARKS</span>
          <span className="text-slate-900 font-extrabold">{paper.maxMarks || "50 Marks"}</span>
        </div>
      </div>

      {/* General Instructions Box */}
      <div className="border border-slate-800 p-3 rounded-xs bg-slate-50/50 text-[10.5px] font-sans space-y-1">
        <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">
          GENERAL INSTRUCTIONS FOR CANDIDATES:
        </div>
        <ol className="list-decimal list-inside text-slate-700 space-y-0.5 leading-tight font-medium">
          <li>Write your Roll Number in the specified boxes at the top right before starting the exam.</li>
          <li>Section-A contains Objective MCQs. Choose the single best answer for each question.</li>
          <li>Cutting, overwriting, using lead pencil or fluid in Objective questions is strictly prohibited.</li>
          <li>All answers for Section-B and Section-C must be written clearly in proper sequence.</li>
        </ol>
      </div>

      {/* Parsed Sections or Fallback Raw Render */}
      {sections.length > 0 ? (
        <div className="space-y-6 pt-2">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-3">
              {/* Section Header Banner */}
              <div className="border-y-2 border-slate-900 bg-slate-100 py-1.5 px-3 text-center">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-950 font-sans">
                  {sec.title}
                </h3>
                {sec.instructions && (
                  <p className="text-[10.5px] font-bold text-slate-800 font-sans mt-0.5">
                    {sec.instructions}
                  </p>
                )}
              </div>

              {/* Raw lines if present */}
              {sec.rawLines.length > 0 && (
                <div className="font-sans text-[11px] text-slate-800 space-y-1">
                  {sec.rawLines.map((rl, rIdx) => (
                    <p key={rIdx}>{rl}</p>
                  ))}
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3.5 pl-1">
                {sec.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-1.5">
                    <div className="flex items-start gap-2 font-serif text-[11.5px] font-semibold text-slate-900 leading-normal">
                      <span className="font-sans font-black text-slate-950 shrink-0">
                        {q.numStr.endsWith(".") ? q.numStr : `${q.numStr}.`}
                      </span>
                      <div className="grow">
                        <span>{q.text}</span>
                        {q.marksStr && (
                          <span className="ml-2 font-sans text-[10px] font-bold text-slate-600">
                            [{q.marksStr}]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MCQ Options Grid */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pl-6 pt-1 font-sans text-[11px]">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <span className="w-4 h-4 rounded-full border border-slate-800 flex items-center justify-center text-[9px] font-black shrink-0">
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback formatted plain body */
        <div className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-900 border border-slate-300 p-4 bg-white">
          {paper.content}
        </div>
      )}

      {/* Signature Footer */}
      <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 md:grid-cols-3 gap-4 text-center font-sans text-[10.5px] font-bold text-slate-900">
        <div>
          <div className="border-b border-slate-900 w-32 mx-auto mb-1"></div>
          <span>Subject Teacher</span>
        </div>
        <div>
          <div className="border-b border-slate-900 w-36 mx-auto mb-1"></div>
          <span>Head Examiner / Moderator</span>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="border-b border-slate-900 w-40 mx-auto mb-1"></div>
          <span>Controller of Examinations</span>
        </div>
      </div>

      <div className="text-center font-sans text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2">
        *** END OF EXAMINATION PAPER ***
      </div>
    </div>
  );
};

/**
 * Generate complete standalone HTML document string for popup printing window
 */
export function generatePrintablePaperHtml(paper: PaperDetails): string {
  const sections = parsePaperContent(paper.content);

  const sectionsHtml = sections.length > 0 ? sections.map((sec) => `
    <div style="margin-top: 18px;">
      <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; background: #f1f5f9; padding: 5px 10px; text-align: center;">
        <h3 style="margin:0; font-size: 13px; font-weight: 900; text-transform: uppercase; font-family: sans-serif;">${sec.title}</h3>
        ${sec.instructions ? `<p style="margin:3px 0 0 0; font-size: 10px; font-weight: bold; font-family: sans-serif;">${sec.instructions}</p>` : ""}
      </div>
      ${sec.rawLines.map((rl) => `<p style="font-family: sans-serif; font-size: 11px; margin: 4px 0;">${rl}</p>`).join("")}
      <div style="margin-top: 10px;">
        ${sec.questions.map((q) => `
          <div style="margin-bottom: 12px; page-break-inside: avoid;">
            <div style="font-family: Georgia, serif; font-size: 12px; font-weight: 600; line-height: 1.5; color: #000;">
              <strong>${q.numStr.endsWith(".") ? q.numStr : q.numStr + "."}</strong> ${q.text}
              ${q.marksStr ? `<span style="font-family: sans-serif; font-size: 10px; font-weight: bold; margin-left: 6px;">[${q.marksStr}]</span>` : ""}
            </div>
            ${q.options && q.options.length > 0 ? `
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 6px; padding-left: 20px; font-family: sans-serif; font-size: 11px;">
                ${q.options.map((opt) => `
                  <div style="display: flex; items-center: center;">
                    <span style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; border: 1px solid #000; text-align: center; line-height: 15px; font-size: 9px; font-weight: bold; margin-right: 5px;">${opt.label}</span>
                    <span>${opt.text}</span>
                  </div>
                `).join("")}
              </div>
            ` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `).join("") : `<div style="font-family: monospace; font-size: 11px; white-space: pre-wrap; padding: 15px; border: 1px solid #ccc;">${paper.content}</div>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${paper.schoolName} - ${paper.examTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { font-family: Georgia, serif; padding: 20px; color: #000; background: #fff; line-height: 1.5; }
          .bismillah { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 8px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; }
          .header h1 { font-size: 20px; margin: 0; font-family: Georgia, serif; text-transform: uppercase; font-weight: 900; }
          .header h2 { font-size: 12px; margin: 3px 0 0 0; text-transform: uppercase; font-family: sans-serif; font-weight: bold; }
          .roll-box { border: 1px solid #000; padding: 8px 12px; font-size: 11px; font-family: sans-serif; font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 10px; background: #fafafa; }
          .info-table { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #000; text-align: center; font-family: sans-serif; font-size: 11px; font-weight: bold; margin-bottom: 12px; background: #f8f8f8; }
          .info-table div { padding: 6px; border-right: 1px solid #000; }
          .info-table div:last-child { border-right: none; }
          .info-table span { display: block; font-size: 8px; color: #555; text-transform: uppercase; }
          .instructions { border: 1px solid #000; padding: 8px 12px; font-size: 10px; font-family: sans-serif; margin-bottom: 15px; background: #fff; }
          .instructions ol { margin: 4px 0 0 15px; padding: 0; }
          .footer { display: flex; justify-content: space-between; font-size: 10px; font-family: sans-serif; font-weight: bold; margin-top: 40px; border-top: 2px solid #000; padding-top: 15px; }
          @media print {
            body { padding: 0; }
            button, .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div class="header">
          <h1>${paper.schoolName}</h1>
          <h2>${paper.examTitle} - ACADEMIC SESSION 2025-2026</h2>
        </div>
        <div class="roll-box">
          <div>ROLL NO: [ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ]</div>
          <div>CANDIDATE NAME: ____________________</div>
          <div>DATE: ${paper.date || "________"}</div>
        </div>
        <div class="info-table">
          <div><span>SUBJECT</span>${paper.subject}</div>
          <div><span>CLASS</span>${paper.grade}</div>
          <div><span>TIME ALLOWED</span>${paper.timeAllowed}</div>
          <div><span>MAX MARKS</span>${paper.maxMarks}</div>
        </div>
        <div class="instructions">
          <strong>GENERAL INSTRUCTIONS FOR CANDIDATES:</strong>
          <ol>
            <li>Write your Roll Number in the specified boxes before starting.</li>
            <li>Section-A contains Objective MCQs. Select one correct option per question.</li>
            <li>No overwriting or fluid is allowed in Objective MCQs.</li>
            <li>Attempt Section-B and Section-C on answer sheet in proper sequence.</li>
          </ol>
        </div>

        ${sectionsHtml}

        <div class="footer">
          <div>Subject Teacher Signature: __________________</div>
          <div>Moderator / Head Signature: __________________</div>
          <div>Controller of Examinations: __________________</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}

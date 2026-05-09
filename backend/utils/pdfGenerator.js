// ==========================================
// PDF Generator using PDFKit
// Generates NEET MCQ Practice Paper PDFs
// ==========================================
const PDFDocument = require("pdfkit");

/**
 * Parse MCQ text from AI response into structured format
 */
function parseMCQContent(content) {
  const questions = [];
  
  // Split by question numbers (Q1, Q.1, 1., Question 1:, etc.)
  const questionBlocks = content.split(/(?=(?:Q\.?\s*\d+|Question\s*\d+|\d+\.)\s)/i);

  for (const block of questionBlocks) {
    if (!block.trim()) continue;

    const q = {
      number: "",
      question: "",
      options: { A: "", B: "", C: "", D: "" },
      answer: "",
      explanation: "",
    };

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let section = "question";
    let questionLines = [];

    for (const line of lines) {
      // Detect question number and text
      if (/^(?:Q\.?\s*\d+|Question\s*\d+|\d+\.)/i.test(line)) {
        q.number = line.match(/\d+/)[0];
        q.question = line.replace(/^(?:Q\.?\s*\d+:?|Question\s*\d+:?|\d+\.)\s*/i, "").trim();
        section = "question";
      }
      // Option lines: A. / A) / (A)
      else if (/^(?:\(?[A-D]\)?[.):]?\s)/i.test(line)) {
        const letter = line.match(/[A-D]/i)[0].toUpperCase();
        q.options[letter] = line.replace(/^(?:\(?[A-D]\)?[.):]?\s)/i, "").trim();
        section = "options";
      }
      // Answer line
      else if (/^(?:answer|correct\s*answer|ans)[:\s]/i.test(line)) {
        q.answer = line.replace(/^(?:answer|correct\s*answer|ans)[:\s]*/i, "").trim();
        section = "answer";
      }
      // Explanation line
      else if (/^(?:explanation|reason|rationale)[:\s]/i.test(line)) {
        q.explanation = line.replace(/^(?:explanation|reason|rationale)[:\s]*/i, "").trim();
        section = "explanation";
      }
      // Continuation of current section
      else {
        if (section === "question" && q.question) {
          q.question += " " + line;
        } else if (section === "answer") {
          q.answer += " " + line;
        } else if (section === "explanation") {
          q.explanation += " " + line;
        }
      }
    }

    if (q.question) {
      questions.push(q);
    }
  }

  return questions;
}

/**
 * Generate NEET MCQ PDF
 * @param {Object} options - PDF options
 * @param {string} options.content - Raw MCQ content from AI
 * @param {string} options.title - Topic/title for the PDF
 * @param {string} options.sessionId - Session ID for reference
 * @returns {Buffer} PDF buffer
 */
async function generateMCQPDF({ content, title, sessionId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Soul of Médico - ${title}`,
        Author: "Soul of Médico AI",
        Subject: "NEET Practice Questions",
        Creator: "Soul of Médico AI Platform",
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Color Palette ──
    const colors = {
      primary: "#1a56db",     // Deep blue
      accent: "#7e3af2",      // Purple
      dark: "#111928",        // Near black
      gray: "#6b7280",        // Medium gray
      lightGray: "#f3f4f6",   // Light background
      green: "#057a55",       // Correct answer
      white: "#ffffff",
      watermark: "#e5e7eb",   // Very light gray watermark
    };

    // ── Page dimensions ──
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // ── Watermark function ──
    const addWatermark = () => {
      doc.save();
      doc.fontSize(55)
        .fillColor(colors.watermark)
        .opacity(0.25)
        .rotate(-45, { origin: [pageWidth / 2, pageHeight / 2] })
        .text("Soul of Médico", 0, pageHeight / 2 - 40, {
          align: "center",
          width: pageWidth,
        });
      doc.restore();
      doc.opacity(1);
    };

    // ── Header function ──
    const addHeader = (isFirst = false) => {
      addWatermark();

      if (isFirst) {
        // Banner background
        doc.rect(0, 0, pageWidth, 120).fill(colors.primary);

        // Logo / Title text
        doc.fillColor(colors.white)
          .fontSize(26)
          .font("Helvetica-Bold")
          .text("Soul of Médico AI", margin, 22, { align: "center", width: contentWidth });

        doc.fontSize(13)
          .font("Helvetica")
          .fillColor("#bfdbfe")
          .text("NEET Practice Question Paper", margin, 56, { align: "center", width: contentWidth });

        // Topic banner
        doc.rect(0, 100, pageWidth, 36).fill(colors.accent);
        doc.fillColor(colors.white)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(title.toUpperCase(), margin, 111, { align: "center", width: contentWidth });

        // Meta info bar
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-IN", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });

        doc.rect(margin, 148, contentWidth, 28).fill(colors.lightGray).stroke();
        doc.fillColor(colors.gray)
          .fontSize(8.5)
          .font("Helvetica")
          .text(`Generated: ${dateStr}`, margin + 10, 157)
          .text(`Session: ${sessionId.substring(0, 8).toUpperCase()}`, margin + contentWidth / 2, 157);

        doc.moveDown(0.5);
        doc.y = 190;
      } else {
        // Subsequent page header - compact
        doc.rect(0, 0, pageWidth, 40).fill(colors.primary);
        doc.fillColor(colors.white)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("Soul of Médico AI  ·  NEET Practice", margin, 13, {
            align: "center",
            width: contentWidth,
          });
        doc.y = 55;
      }
    };

    // ── Footer function ──
    const addFooter = (pageNum) => {
      const footerY = pageHeight - 35;
      doc.rect(0, footerY - 5, pageWidth, 40).fill(colors.lightGray);
      doc.fillColor(colors.gray)
        .fontSize(8)
        .font("Helvetica")
        .text(
          "Soul of Médico AI  ·  Powered by AI  ·  For NEET Preparation Only",
          margin, footerY + 2,
          { align: "center", width: contentWidth }
        );
      doc.fillColor(colors.primary)
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .text(`Page ${pageNum}`, pageWidth - margin - 30, footerY + 2);
    };

    // ── Parse MCQ content ──
    const questions = parseMCQContent(content);
    let pageNum = 1;

    // ── First Page ──
    addHeader(true);

    // Instructions box
    doc.rect(margin, doc.y, contentWidth, 52)
      .fill("#eff6ff")
      .stroke(colors.primary);
    doc.fillColor(colors.dark)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("INSTRUCTIONS", margin + 10, doc.y + 8);
    doc.font("Helvetica")
      .fontSize(8.5)
      .fillColor(colors.gray)
      .text(
        "• Each question carries 4 marks. Wrong answer: -1 mark.  • Time: 60 minutes\n" +
        "• All questions are based on NEET exam pattern.  • Answers and explanations provided at end of each question.",
        margin + 10, doc.y + 4, { width: contentWidth - 20 }
      );
    doc.y += 62;
    doc.moveDown(0.5);

    // ── Render Questions ──
    if (questions.length === 0) {
      // Fallback: render raw content if parsing fails
      doc.fillColor(colors.dark).fontSize(10).font("Helvetica").text(content, { width: contentWidth });
    } else {
      questions.forEach((q, idx) => {
        const qNum = q.number || idx + 1;

        // Check if we need a new page (leave room for footer)
        if (doc.y > pageHeight - 180) {
          addFooter(pageNum);
          doc.addPage();
          pageNum++;
          addHeader(false);
        }

        const startY = doc.y;

        // Question number badge
        doc.rect(margin, startY, 24, 18).fill(colors.primary);
        doc.fillColor(colors.white)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(`Q${qNum}`, margin + 2, startY + 4, { width: 20, align: "center" });

        // Question text
        doc.fillColor(colors.dark)
          .fontSize(10.5)
          .font("Helvetica-Bold")
          .text(q.question || "Question text", margin + 30, startY + 2, {
            width: contentWidth - 30,
          });

        doc.moveDown(0.4);

        // Options
        const optionColors = {
          A: "#fef9c3", B: "#f0fdf4", C: "#eff6ff", D: "#fdf4ff",
        };
        const optionBorderColors = {
          A: "#fde68a", B: "#bbf7d0", C: "#bfdbfe", D: "#e9d5ff",
        };

        Object.entries(q.options).forEach(([letter, text]) => {
          if (!text) return;

          const optY = doc.y;
          // Check page break for options
          if (optY > pageHeight - 140) {
            addFooter(pageNum);
            doc.addPage();
            pageNum++;
            addHeader(false);
          }

          doc.rect(margin + 30, doc.y, contentWidth - 30, 18)
            .fill(optionColors[letter])
            .stroke(optionBorderColors[letter]);

          doc.fillColor(colors.dark)
            .fontSize(9.5)
            .font("Helvetica-Bold")
            .text(`${letter}.`, margin + 35, doc.y + 4, { continued: true })
            .font("Helvetica")
            .text(` ${text}`, { width: contentWidth - 60 });

          doc.moveDown(0.15);
        });

        doc.moveDown(0.3);

        // Answer & Explanation box
        if (q.answer || q.explanation) {
          if (doc.y > pageHeight - 100) {
            addFooter(pageNum);
            doc.addPage();
            pageNum++;
            addHeader(false);
          }

          const ansY = doc.y;
          doc.rect(margin + 30, ansY, contentWidth - 30, q.explanation ? 44 : 22)
            .fill("#ecfdf5")
            .stroke("#34d399");

          if (q.answer) {
            doc.fillColor(colors.green)
              .fontSize(9)
              .font("Helvetica-Bold")
              .text(`✅ Answer: ${q.answer}`, margin + 36, ansY + 5, {
                width: contentWidth - 50,
              });
          }

          if (q.explanation) {
            doc.fillColor(colors.gray)
              .fontSize(8.5)
              .font("Helvetica")
              .text(`💡 ${q.explanation}`, margin + 36, ansY + (q.answer ? 18 : 5), {
                width: contentWidth - 50,
              });
          }

          doc.y = ansY + (q.explanation ? 50 : 28);
        }

        // Divider between questions
        doc.moveDown(0.6);
        if (idx < questions.length - 1) {
          doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y)
            .lineWidth(0.5)
            .strokeColor("#e5e7eb")
            .stroke();
          doc.moveDown(0.5);
        }
      });
    }

    // ── Final Page Footer ──
    addFooter(pageNum);

    // ── Last Page - Summary ──
    doc.addPage();
    pageNum++;
    addWatermark();

    doc.rect(0, 0, pageWidth, 80).fill(colors.accent);
    doc.fillColor(colors.white)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("📊 Quiz Summary", margin, 25, { align: "center", width: contentWidth });
    doc.fontSize(11)
      .font("Helvetica")
      .fillColor("#e9d5ff")
      .text("Soul of Médico AI — NEET Practice", margin, 52, { align: "center", width: contentWidth });

    doc.y = 100;

    const summaryItems = [
      ["📚 Topic", title],
      ["❓ Total Questions", `${questions.length}`],
      ["⚡ Difficulty", "Medium to High (NEET Level)"],
      ["🏆 Total Marks", `${questions.length * 4}`],
      ["⏱️  Recommended Time", `${questions.length * 2} minutes`],
      ["📅 Date", new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })],
    ];

    summaryItems.forEach(([label, value], i) => {
      const rowY = doc.y;
      doc.rect(margin, rowY, contentWidth, 28).fill(i % 2 === 0 ? colors.lightGray : colors.white).stroke("#e5e7eb");
      doc.fillColor(colors.gray).fontSize(10).font("Helvetica-Bold").text(label, margin + 12, rowY + 8);
      doc.fillColor(colors.dark).fontSize(10).font("Helvetica").text(value, margin + 200, rowY + 8);
      doc.y = rowY + 28;
    });

    doc.moveDown(1.5);
    doc.rect(margin, doc.y, contentWidth, 50).fill("#eff6ff").stroke(colors.primary);
    doc.fillColor(colors.primary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("🌟 Best of luck for your NEET preparation!", margin, doc.y + 10, {
        align: "center", width: contentWidth,
      });
    doc.fillColor(colors.gray)
      .fontSize(9)
      .font("Helvetica")
      .text("Soul of Médico AI — Your AI-powered NEET Mentor", margin, doc.y + 24, {
        align: "center", width: contentWidth,
      });

    addFooter(pageNum);
    doc.end();
  });
}

module.exports = { generateMCQPDF, parseMCQContent };

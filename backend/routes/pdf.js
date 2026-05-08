// ==========================================
// PDF Generation API Route
// Generates downloadable NEET MCQ PDFs
// ==========================================
const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const { generateMCQPDF } = require("../utils/pdfGenerator");
const { pdfLimiter } = require("../middleware/rateLimiter");

// ==========================================
// POST /api/pdf/generate
// Generate PDF from session's MCQ content
// ==========================================
router.post("/generate", pdfLimiter, async (req, res) => {
  try {
    const { sessionId, content, title } = req.body;

    // Validate inputs
    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return res.status(400).json({
        error: "Valid MCQ content is required to generate PDF.",
      });
    }

    const pdfTitle = title || "NEET Practice Questions";
    const pdfSessionId = sessionId || "GUEST";

    console.log(`📄 Generating PDF for session ${pdfSessionId.substring(0, 8)} | Topic: ${pdfTitle}`);

    // Generate the PDF buffer
    const pdfBuffer = await generateMCQPDF({
      content: content.trim(),
      title: pdfTitle,
      sessionId: pdfSessionId,
    });

    // Create a safe filename
    const safeTitle = pdfTitle
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 40);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `SoulOfMedico_${safeTitle}_${timestamp}.pdf`;

    // Send PDF as download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
      "Cache-Control": "no-cache",
    });

    console.log(`✅ PDF generated: ${filename} (${pdfBuffer.length} bytes)`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF generation error:", error);
    res.status(500).json({
      error: "Failed to generate PDF. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;

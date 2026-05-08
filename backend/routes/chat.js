// ==========================================
// Chat API Routes
// Handles session management and AI responses
// Using: Groq (llama-3.1-8b-instant) — FREE & FAST
// ==========================================
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Groq = require("groq-sdk");
const Session = require("../models/Session");
const { chatLimiter } = require("../middleware/rateLimiter");

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Soul of Médico AI System Prompt ──
const SYSTEM_PROMPT = `You are Soul of Médico AI, a strict but supportive NEET mentor and academic expert.

Your expertise covers:
- Biology (Botany & Zoology) — NCERT-based, NEET standard
- Chemistry (Physical, Organic, Inorganic)
- Physics (Mechanics, Electromagnetism, Optics, Modern Physics)

Core behavior rules:
1. Always explain concepts clearly, step-by-step using simple language suitable for Class 11/12 NEET students.
2. When explaining, break down complex topics into digestible parts with numbered steps.
3. Use examples from real life or NCERT textbooks whenever possible.
4. For diagrams, describe them in clear ASCII/text format.
5. Never provide incorrect medical or scientific information.
6. Always cite relevant NCERT chapters when appropriate.
7. Be encouraging but honest about difficulty levels.

MCQ Generation Rules (when asked to generate MCQs):
- Follow the EXACT official NEET exam pattern.
- Each question must have exactly 4 options labeled A, B, C, D.
- Provide the correct answer clearly after each question.
- Include a brief but informative explanation.
- Mix: 40% conceptual, 40% application-based, 20% NCERT-direct questions.
- Difficulty: Medium to Hard (NEET level).
- Never repeat questions within the same set.
- Format EXACTLY as:

Q1. [Question text]
A. [Option]
B. [Option]
C. [Option]
D. [Option]
Answer: [Letter]. [Correct option text]
Explanation: [2-3 sentence explanation with reasoning]

Q2. [Continue...]

Doubt Solving Rules:
- Start with a brief overview (1-2 sentences).
- Break into numbered steps.
- Add relevant formulas or mnemonics if applicable.
- End with a quick summary or "Key Point to Remember".
- Keep answers focused — no unnecessary padding.`;

// ── Input validation helper ──
function validateInput(message, sessionId) {
  if (!message || typeof message !== "string") {
    return "Message is required and must be a string.";
  }
  if (message.trim().length === 0) {
    return "Message cannot be empty.";
  }
  if (message.length > 3000) {
    return "Message is too long. Please keep it under 3000 characters.";
  }
  if (sessionId && typeof sessionId !== "string") {
    return "Invalid session ID format.";
  }
  return null;
}

// ==========================================
// POST /api/chat
// Main chat endpoint — send message, get AI response
// ==========================================
router.post("/", chatLimiter, async (req, res) => {
  try {
    const { message, sessionId: providedSessionId, mode = "chat" } = req.body;

    // Validate input
    const validationError = validateInput(message, providedSessionId);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Get or create session ID
    const sessionId = providedSessionId || uuidv4();

    // Find or create session in MongoDB
    let session = await Session.findOne({ sessionId });

    if (!session) {
      session = new Session({
        sessionId,
        messages: [],
        mode,
        metadata: {
          userAgent: req.headers["user-agent"],
          ip: req.ip,
        },
      });
      console.log(`📝 New session created: ${sessionId}`);
    }

    // Check message limit (50 messages per session)
    const maxMessages = parseInt(process.env.MAX_MESSAGES_PER_SESSION) || 50;
    const userMessageCount = session.messages.filter(m => m.role === "user").length;

    if (userMessageCount >= maxMessages) {
      return res.status(429).json({
        error: `Session message limit reached (${maxMessages} messages). Please start a new session.`,
        limitReached: true,
        sessionId,
      });
    }

    // Update mode if changed
    session.mode = mode;

    // Add user message to history
    session.messages.push({
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
      isMCQ: mode === "mcq" || /generate.*mcq|mcq.*generate/i.test(message),
    });

    // Build messages array for Groq (system + last 20 history messages)
    const historyMessages = session.messages
      .filter(m => m.role !== "system")
      .slice(-20)
      .map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...historyMessages,
    ];

    console.log(`🤖 Calling Groq for session ${sessionId.substring(0, 8)}... (${historyMessages.length} msgs)`);

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      max_tokens: 3000,
      temperature: 0.7,
      top_p: 1,
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    const usage = completion.usage || {};

    // Add AI response to session history
    session.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
      isMCQ: mode === "mcq",
      tokenUsage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
    });

    session.totalTokensUsed += usage.total_tokens || 0;
    await session.save();

    console.log(`✅ Response generated for ${sessionId.substring(0, 8)} | Tokens: ${usage.total_tokens}`);

    res.json({
      sessionId,
      message: aiResponse,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        sessionTotalTokens: session.totalTokensUsed,
      },
      messageCount: session.messageCount,
      remainingMessages: maxMessages - (userMessageCount + 1),
    });
  } catch (error) {
    console.error("❌ Chat error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit reached. Please wait a moment and try again.",
      });
    }
    if (error.status === 401) {
      return res.status(500).json({
        error: "AI service authentication error. Please check your GROQ_API_KEY.",
      });
    }

    res.status(500).json({
      error: "An error occurred while processing your request. Please try again.",
    });
  }
});

// ==========================================
// GET /api/chat/history/:sessionId
// ==========================================
router.get("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.length < 8) {
      return res.status(400).json({ error: "Invalid session ID." });
    }

    const session = await Session.findOne({ sessionId }).select(
      "sessionId messages mode totalTokensUsed messageCount lastActivity createdAt"
    );

    if (!session) {
      return res.json({
        sessionId,
        messages: [],
        mode: "chat",
        totalTokensUsed: 0,
        messageCount: 0,
        isNew: true,
      });
    }

    const messages = session.messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        isMCQ: m.isMCQ,
      }));

    res.json({
      sessionId,
      messages,
      mode: session.mode,
      totalTokensUsed: session.totalTokensUsed,
      messageCount: session.messageCount,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error("❌ History error:", error);
    res.status(500).json({ error: "Failed to load chat history." });
  }
});

// ==========================================
// DELETE /api/chat/clear/:sessionId
// ==========================================
router.delete("/clear/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    await Session.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          messages: [],
          totalTokensUsed: 0,
          messageCount: 0,
          lastActivity: new Date(),
        },
      }
    );

    res.json({ success: true, message: "Chat history cleared." });
  } catch (error) {
    console.error("❌ Clear error:", error);
    res.status(500).json({ error: "Failed to clear chat history." });
  }
});

// ==========================================
// GET /api/chat/session/new
// ==========================================
router.get("/session/new", (req, res) => {
  res.json({ sessionId: uuidv4() });
});

module.exports = router;

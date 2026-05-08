// ==========================================
// Soul of Médico AI — Express Server
// ==========================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const chatRoutes = require("./routes/chat");
const pdfRoutes = require("./routes/pdf");
const Session = require("./models/Session");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ──
connectDB();

// ==========================================
// Middleware
// ==========================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy (for rate limiting behind nginx/cloudflare)
app.set("trust proxy", 1);

// Apply general rate limiter to all routes
app.use("/api", apiLimiter);

// Request logger (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// Routes
// ==========================================
app.use("/api/chat", chatRoutes);
app.use("/api/pdf", pdfRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Soul of Médico AI Backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error. Please try again.",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// ==========================================
// Auto-Cleanup Job — runs every hour
// Deletes sessions inactive for 24+ hours
// ==========================================
cron.schedule("0 * * * *", async () => {
  try {
    const cutoffHours = parseInt(process.env.SESSION_CLEANUP_HOURS) || 24;
    const cutoffDate = new Date(Date.now() - cutoffHours * 60 * 60 * 1000);

    const result = await Session.deleteMany({
      lastActivity: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} inactive sessions (older than ${cutoffHours}h)`);
    }
  } catch (error) {
    console.error("❌ Session cleanup error:", error);
  }
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║    🧬 Soul of Médico AI - Backend         ║
║    Running on http://localhost:${PORT}       ║
║    Environment: ${process.env.NODE_ENV || "development"}              ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;

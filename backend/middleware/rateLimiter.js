// ==========================================
// Rate Limiting Middleware
// ==========================================
const rateLimit = require("express-rate-limit");

// General API rate limiter - 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Stricter limiter for chat endpoint - 30 requests per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many chat requests. Please slow down and try again in a minute.",
  },
  handler: (req, res, next, options) => {
    console.warn(`⚠️  Chat rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// PDF generation limiter - 10 per hour (heavy operation)
const pdfLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: "PDF generation limit reached. You can generate up to 10 PDFs per hour.",
  },
});

module.exports = { apiLimiter, chatLimiter, pdfLimiter };

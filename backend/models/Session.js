// ==========================================
// Session & Chat History MongoDB Schema
// ==========================================
const mongoose = require("mongoose");

// Individual message schema
const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Track if this message was an MCQ generation request
  isMCQ: {
    type: Boolean,
    default: false,
  },
  // Store token usage per message
  tokenUsage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
});

// Main session schema
const SessionSchema = new mongoose.Schema(
  {
    // Unique session identifier (UUID)
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Chat message history
    messages: [MessageSchema],

    // Current mode: 'chat' or 'mcq'
    mode: {
      type: String,
      enum: ["chat", "mcq"],
      default: "chat",
    },

    // Total token usage for this session
    totalTokensUsed: {
      type: Number,
      default: 0,
    },

    // Message count (for limiting to 50)
    messageCount: {
      type: Number,
      default: 0,
    },

    // Track last activity for auto-cleanup
    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // Session metadata
    metadata: {
      userAgent: String,
      ip: String,
      createdAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Update lastActivity before saving
SessionSchema.pre("save", function (next) {
  this.lastActivity = new Date();
  this.messageCount = this.messages.filter(
    (m) => m.role !== "system"
  ).length;
  next();
});

// Index for cleanup job - find sessions inactive for 24h
SessionSchema.index({ lastActivity: 1 });

module.exports = mongoose.model("Session", SessionSchema);

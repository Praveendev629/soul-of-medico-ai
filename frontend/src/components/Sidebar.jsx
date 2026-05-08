// ==========================================
// Sidebar Component
// Shows session info, quick prompts, token usage
// ==========================================
import React, { useState } from "react";
import { formatDate } from "../utils/storage";

// Quick prompt suggestions by mode
const QUICK_PROMPTS = {
  chat: [
    "Explain the mechanism of action potential in neurons",
    "What is the difference between mitosis and meiosis?",
    "Explain Gibbs free energy in simple terms",
    "How does the electron transport chain work?",
    "Explain Le Chatelier's principle with examples",
    "What are the key differences between DNA and RNA?",
  ],
  mcq: [
    "Generate 10 MCQs from Human Physiology - Digestion",
    "Generate 15 MCQs from Cell Biology - Cell Division",
    "Generate 20 MCQs from Genetics - Mendelian Inheritance",
    "Generate 10 MCQs from Chemistry - Organic Reactions",
    "Generate 15 MCQs from Physics - Ray Optics",
    "Generate 10 MCQs from Plant Physiology - Photosynthesis",
  ],
};

const Sidebar = ({
  mode,
  messageCount,
  totalTokens,
  onClearChat,
  onNewSession,
  onQuickPrompt,
  sessionId,
  createdAt,
  isMobile,
  onClose,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const maxMessages = 50;
  const usagePercent = Math.min((messageCount / maxMessages) * 100, 100);

  const handleClear = () => {
    if (showConfirmClear) {
      onClearChat();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  };

  return (
    <aside className={`
      flex flex-col h-full bg-gray-900 dark:bg-gray-950 border-r border-gray-800
      ${isMobile ? "w-full" : "w-72"}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg">
            🧬
          </div>
          <div>
            <div className="font-bold text-white text-sm">Soul of Médico</div>
            <div className="text-[10px] text-blue-400 font-medium">AI NEET Mentor</div>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          New Chat Session
        </button>
      </div>

      {/* Session Info */}
      <div className="px-4 mb-4">
        <div className="bg-gray-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Session ID</span>
            <span className="text-xs font-mono text-gray-300 bg-gray-700 px-2 py-0.5 rounded">
              {sessionId ? sessionId.substring(0, 8).toUpperCase() : "—"}
            </span>
          </div>
          {createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Started</span>
              <span className="text-xs text-gray-300">{formatDate(createdAt)}</span>
            </div>
          )}
          {/* Message usage bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Messages</span>
              <span className="text-xs text-gray-300">{messageCount} / {maxMessages}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  usagePercent > 80 ? "bg-red-500" : usagePercent > 60 ? "bg-amber-500" : "bg-blue-500"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usagePercent > 80 && (
              <p className="text-[10px] text-red-400 mt-1">⚠️ Approaching session limit</p>
            )}
          </div>

          {/* Token usage */}
          {totalTokens > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-700">
              <span className="text-xs text-gray-400">Tokens used</span>
              <span className="text-xs text-purple-400 font-mono">{totalTokens.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {mode === "mcq" ? "📝 MCQ Templates" : "💡 Quick Doubts"}
          </span>
        </div>
        <div className="space-y-1.5">
          {QUICK_PROMPTS[mode]?.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onQuickPrompt(prompt);
                if (isMobile) onClose();
              }}
              className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-lg transition-colors leading-snug"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button
          onClick={handleClear}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
            showConfirmClear
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
          }`}
        >
          {showConfirmClear ? (
            <>🗑️ Confirm Clear Chat?</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Clear Chat History
            </>
          )}
        </button>

        {/* Footer info */}
        <p className="text-center text-[10px] text-gray-600">
          Sessions auto-delete after 24h of inactivity
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

// ==========================================
// ChatWindow Component
// Main chat interface with all controls
// ==========================================
import React, { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble, { TypingIndicator } from "./MessageBubble";
import { sendMessage, downloadPDF } from "../utils/api";
import { formatDate } from "../utils/storage";

// ── Empty state / welcome screen ──
const WelcomeScreen = ({ mode, onQuickStart }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-4xl mb-5">
      🤖
    </div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {mode === "mcq" ? "NEET MCQ Generator" : "Soul of Médico AI"}
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">
      {mode === "mcq"
        ? "Generate NEET-pattern MCQs from any topic. Type a prompt like: \"Generate 20 MCQs from Human Physiology - Digestion\""
        : "Ask any Biology, Chemistry or Physics doubt and get a clear, step-by-step explanation tailored for NEET preparation."}
    </p>

    {/* Quick start chips */}
    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
      {(mode === "mcq" ? [
        "Generate 10 MCQs from Cell Biology",
        "Generate 15 MCQs from Human Physiology",
        "Generate 10 MCQs from Organic Chemistry",
      ] : [
        "Explain action potential in neurons",
        "What is the difference between DNA and RNA?",
        "Explain Le Chatelier's principle",
        "How does photosynthesis work?",
      ]).map((prompt) => (
        <button
          key={prompt}
          onClick={() => onQuickStart(prompt)}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium transition-colors border border-gray-200 dark:border-gray-700"
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
);

// ── Date separator ──
const DateSeparator = ({ date }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
      {date}
    </span>
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
  </div>
);

const ChatWindow = ({
  messages,
  setMessages,
  sessionId,
  mode,
  onModeChange,
  darkMode,
  onToggleDarkMode,
  onToggleSidebar,
  tokenInfo,
  setTokenInfo,
  quickPromptText,
  onQuickPromptConsumed,
}) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Handle quick prompt from sidebar
  useEffect(() => {
    if (quickPromptText) {
      handleSend(quickPromptText);
      onQuickPromptConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickPromptText]);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  // Handle sending a message
  const handleSend = useCallback(async (overrideText) => {
    const messageText = (overrideText || input).trim();
    if (!messageText || isLoading) return;

    setInput("");
    setError(null);

    // Add user message to UI immediately (optimistic)
    const userMsg = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: messageText,
        sessionId,
        mode,
      });

      const aiMsg = {
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString(),
        isMCQ: mode === "mcq" || /Q\d+\.|Question \d+/i.test(response.message),
      };

      setMessages(prev => [...prev, aiMsg]);

      // Update token info
      if (response.usage) {
        setTokenInfo({
          sessionTokens: response.usage.sessionTotalTokens || 0,
          messageCount: response.messageCount || 0,
          remaining: response.remainingMessages || 0,
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to get response. Please check your connection and try again.";
      setError(errMsg);

      if (err.response?.data?.limitReached) {
        setError(`${errMsg} Session limit reached.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, mode, setMessages, setTokenInfo]);

  // Handle PDF download
  const handleDownloadPDF = async (content) => {
    setPdfLoading(true);
    try {
      // Try to extract topic from the MCQ content for the PDF title
      const topicMatch = content.match(/(?:from|on|about)\s+([A-Za-z\s-]+?)(?:\n|$)/i);
      const title = topicMatch ? topicMatch[1].trim() : "NEET Practice Questions";

      await downloadPDF({ sessionId, content, title });
    } catch {
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle keyboard shortcut (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date for separators
  const renderMessages = () => {
    const rendered = [];
    let lastDate = null;

    messages.forEach((msg, idx) => {
      const msgDate = msg.timestamp ? formatDate(msg.timestamp) : null;
      if (msgDate && msgDate !== lastDate) {
        rendered.push(<DateSeparator key={`date-${idx}`} date={msgDate} />);
        lastDate = msgDate;
      }
      rendered.push(
        <MessageBubble
          key={idx}
          message={msg}
          onDownloadPDF={handleDownloadPDF}
        />
      );
    });

    return rendered;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* ── Top Navigation Bar ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm hidden sm:block">Soul of Médico AI</span>
          </div>
        </div>

        {/* Center: Mode Switch */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => onModeChange("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "chat"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => onModeChange("mcq")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "mcq"
                ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            📝 MCQ
          </button>
        </div>

        {/* Right: Dark mode toggle */}
        <div className="flex items-center gap-2">
          {/* Token usage badge */}
          {tokenInfo.sessionTokens > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full">
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                {tokenInfo.sessionTokens.toLocaleString()} tokens
              </span>
            </div>
          )}

          {/* Messages remaining */}
          {tokenInfo.remaining !== undefined && tokenInfo.remaining <= 15 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full">
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                {tokenInfo.remaining} msgs left
              </span>
            </div>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Chat Messages Area ── */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <WelcomeScreen mode={mode} onQuickStart={handleSend} />
        ) : (
          <>
            {renderMessages()}
            {isLoading && <TypingIndicator />}
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 animate-message-in">
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        {/* Mode hint */}
        {mode === "mcq" && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl">
            <span className="text-xs">📝</span>
            <span className="text-xs text-purple-700 dark:text-purple-300">
              MCQ Mode: Try "Generate 20 MCQs from [Topic Name]"
            </span>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "mcq"
                  ? "Generate 20 MCQs from Human Physiology - Breathing..."
                  : "Ask any NEET doubt — Biology, Chemistry, Physics..."
              }
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 transition-all max-h-40 leading-relaxed"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/30 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            )}
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-2">
          Press Enter to send · Shift+Enter for new line · Powered by GPT-4o
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;

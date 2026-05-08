// ==========================================
// Message Bubble Component
// Renders individual chat messages
// ==========================================
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTime } from "../utils/storage";

// ── Copy to clipboard button ──
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
      title="Copy message"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
      )}
    </button>
  );
};

// ── Download PDF button for MCQ messages ──
const DownloadPDFButton = ({ content, isMCQ, onDownloadPDF }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isMCQ) return null;

  const handleDownload = async () => {
    setDownloading(true);
    await onDownloadPDF(content);
    setDownloading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium"
      title="Download as PDF"
    >
      {downloading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Generating PDF...
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
};

// ── Typing indicator ──
export const TypingIndicator = () => (
  <div className="flex items-start gap-3 animate-message-in">
    {/* AI Avatar */}
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
      🧬
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5 py-1">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">Soul of Médico AI is thinking...</span>
      </div>
    </div>
  </div>
);

// ── Main MessageBubble ──
const MessageBubble = ({ message, onDownloadPDF }) => {
  const { role, content, timestamp, isMCQ } = message;
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div className={`flex items-start gap-3 animate-message-in group ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md mt-0.5">
          🧬
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md mt-0.5">
          👤
        </div>
      )}

      {/* Bubble */}
      <div className={`relative max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`
            relative rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed
            ${isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm"
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message footer with timestamp and actions */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatTime(timestamp)}
          </span>

          {/* Actions (visible on hover) */}
          {isAssistant && (
            <div className="flex items-center gap-1">
              <CopyButton text={content} />
              {isMCQ && (
                <DownloadPDFButton
                  content={content}
                  isMCQ={isMCQ}
                  onDownloadPDF={onDownloadPDF}
                />
              )}
            </div>
          )}
        </div>

        {/* MCQ Badge */}
        {isMCQ && isAssistant && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-semibold self-start">
            <span>📝</span> MCQ Set · Click PDF button to download
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

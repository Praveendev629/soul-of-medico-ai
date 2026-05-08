// ==========================================
// Soul of Médico AI — Main App Component
// Orchestrates routing, session, dark mode
// ==========================================
import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import LandingPage from "./components/LandingPage";
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import { loadHistory, clearHistory } from "./utils/api";
import {
  getStoredSessionId,
  storeSessionId,
  getDarkMode,
  setDarkMode,
  getStoredMode,
  storeMode,
} from "./utils/storage";

const App = () => {
  // ── App State ──
  const [view, setView] = useState("landing"); // "landing" | "chat"
  const [darkMode, setDarkModeState] = useState(() => getDarkMode());
  const [mode, setMode] = useState(() => getStoredMode()); // "chat" | "mcq"
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // false on mobile by default
  const [isMobile, setIsMobile] = useState(false);
  const [sessionMeta, setSessionMeta] = useState({});
  const [tokenInfo, setTokenInfo] = useState({
    sessionTokens: 0,
    messageCount: 0,
    remaining: 50,
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // ── Detect mobile ──
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Apply dark mode to <html> ──
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setDarkMode(darkMode);
  }, [darkMode]);

  // ── Toggle dark mode ──
  const handleToggleDarkMode = useCallback(() => {
    setDarkModeState(prev => !prev);
  }, []);

  // ── Initialize or restore session ──
  const initSession = useCallback(async (existingSessionId) => {
    const id = existingSessionId || getStoredSessionId() || uuidv4();
    setSessionId(id);
    storeSessionId(id);
    setIsLoadingHistory(true);

    try {
      const history = await loadHistory(id);

      if (!history.isNew && history.messages?.length > 0) {
        setMessages(history.messages);
        setSessionMeta({
          createdAt: history.createdAt,
          lastActivity: history.lastActivity,
        });
        setTokenInfo({
          sessionTokens: history.totalTokensUsed || 0,
          messageCount: history.messageCount || 0,
          remaining: 50 - Math.floor((history.messageCount || 0) / 2),
        });
        if (history.mode) {
          setMode(history.mode);
          storeMode(history.mode);
        }
      }
    } catch (err) {
      console.warn("Could not load history:", err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // ── Enter chat from landing page ──
  const handleEnterChat = useCallback((initialMode) => {
    if (initialMode === "mcq") {
      setMode("mcq");
      storeMode("mcq");
    }
    setView("chat");
    if (!sessionId) {
      initSession();
    }
  }, [sessionId, initSession]);

  // Auto-init session in background for fast chat entry
  useEffect(() => {
    const existingId = getStoredSessionId();
    if (existingId) {
      setSessionId(existingId);
    }
  }, []);

  // ── Start new session ──
  const handleNewSession = useCallback(() => {
    const newId = uuidv4();
    setSessionId(newId);
    storeSessionId(newId);
    setMessages([]);
    setSessionMeta({});
    setTokenInfo({ sessionTokens: 0, messageCount: 0, remaining: 50 });
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // ── Clear chat history ──
  const handleClearChat = useCallback(async () => {
    if (!sessionId) return;
    await clearHistory(sessionId);
    setMessages([]);
    setTokenInfo({ sessionTokens: 0, messageCount: 0, remaining: 50 });
  }, [sessionId]);

  // ── Switch mode (chat/mcq) ──
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    storeMode(newMode);
  }, []);

  // ── Quick prompt from sidebar ──
  const handleQuickPrompt = useCallback((prompt) => {
    // This will be intercepted by ChatWindow via a ref or state lift
    // We use a dedicated state to pass prompts down
    setQuickPromptText(prompt);
  }, []);

  const [quickPromptText, setQuickPromptText] = useState("");

  // When entering chat, initialize session
  const handleEnterChatWithSession = useCallback((initialMode) => {
    handleEnterChat(initialMode);
    const existingId = getStoredSessionId();
    if (existingId) {
      initSession(existingId);
    } else {
      initSession();
    }
  }, [handleEnterChat, initSession]);

  // ── Render Landing Page ──
  if (view === "landing") {
    return (
      <LandingPage
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onEnterChat={handleEnterChatWithSession}
      />
    );
  }

  // ── Render Chat App ──
  return (
    <div className={`${darkMode ? "dark" : ""} flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950`}>
      {/* ── Sidebar Overlay (mobile) ── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-30" : "relative"}
          ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}
          transition-all duration-300 flex-shrink-0
        `}
      >
        {sidebarOpen && (
          <Sidebar
            mode={mode}
            messageCount={tokenInfo.messageCount}
            totalTokens={tokenInfo.sessionTokens}
            onClearChat={handleClearChat}
            onNewSession={handleNewSession}
            onQuickPrompt={handleQuickPrompt}
            sessionId={sessionId}
            createdAt={sessionMeta.createdAt}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Loading overlay for history */}
        {isLoadingHistory && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin border-[3px]"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading your chat history...</p>
            </div>
          </div>
        )}

        <ChatWindow
          messages={messages}
          setMessages={(updater) => {
            setMessages(updater);
            // Update message count
            const newMsgs = typeof updater === "function" ? updater(messages) : updater;
            const userCount = newMsgs.filter(m => m.role === "user").length;
            setTokenInfo(prev => ({
              ...prev,
              messageCount: newMsgs.length,
              remaining: 50 - userCount,
            }));
          }}
          sessionId={sessionId}
          mode={mode}
          onModeChange={handleModeChange}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          tokenInfo={tokenInfo}
          setTokenInfo={setTokenInfo}
          quickPromptText={quickPromptText}
          onQuickPromptConsumed={() => setQuickPromptText("")}
        />
      </main>
    </div>
  );
};

export default App;

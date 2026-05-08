// ==========================================
// Local Storage utilities for session & preferences
// ==========================================

const SESSION_KEY = "som_session_id";
const DARK_MODE_KEY = "som_dark_mode";
const MODE_KEY = "som_chat_mode";

// Session ID management
export const getStoredSessionId = () => localStorage.getItem(SESSION_KEY);
export const storeSessionId = (id) => localStorage.setItem(SESSION_KEY, id);
export const clearStoredSessionId = () => localStorage.removeItem(SESSION_KEY);

// Dark mode preference
export const getDarkMode = () => {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) return stored === "true";
  // Check system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
export const setDarkMode = (value) => localStorage.setItem(DARK_MODE_KEY, String(value));

// Chat mode preference
export const getStoredMode = () => localStorage.getItem(MODE_KEY) || "chat";
export const storeMode = (mode) => localStorage.setItem(MODE_KEY, mode);

// Format timestamp
export const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

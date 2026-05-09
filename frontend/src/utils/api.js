// ==========================================
// API utility — all backend calls go here
// ==========================================
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://soul-of-medico-ai.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI responses
  headers: { "Content-Type": "application/json" },
});

// ── Send a chat message ──
export const sendMessage = async ({ message, sessionId, mode }) => {
  const { data } = await api.post("/chat", { message, sessionId, mode });
  return data;
};

// ── Load chat history ──
export const loadHistory = async (sessionId) => {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
};

// ── Clear chat history ──
export const clearHistory = async (sessionId) => {
  const { data } = await api.delete(`/chat/clear/${sessionId}`);
  return data;
};

// ── Get new session ID ──
export const getNewSessionId = async () => {
  const { data } = await api.get("/chat/session/new");
  return data.sessionId;
};

// ── Generate and download PDF ──
export const downloadPDF = async ({ sessionId, content, title }) => {
  const response = await api.post(
    "/pdf/generate",
    { sessionId, content, title },
    { responseType: "blob" }
  );

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

  // Extract filename from header or use default
  const contentDisposition = response.headers["content-disposition"];
  const filename = contentDisposition
    ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
    : `SoulOfMedico_${title?.replace(/\s+/g, "_") || "MCQs"}.pdf`;

  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ── Health check ──
export const healthCheck = async () => {
  const { data } = await api.get("/health");
  return data;
};

export default api;

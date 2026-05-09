// ==========================================
// Landing Page Component
// Beautiful intro page before entering chat
// ==========================================
import React from "react";

const features = [
  {
    icon: "🤖",
    title: "Deep Concept Explanation",
    description: "Step-by-step breakdowns of Biology, Chemistry & Physics topics from NCERT syllabus.",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
  },
  {
    icon: "📝",
    title: "NEET MCQ Generator",
    description: "Generate unlimited practice questions following the exact NEET exam pattern.",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
  },
  {
    icon: "📄",
    title: "Download as PDF",
    description: "Export your MCQ sets as beautifully formatted PDFs with watermarks and answer keys.",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
  },
  {
    icon: "💬",
    title: "Chat History",
    description: "Your conversations are saved and persist across sessions — just like OpenAI.",
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30",
  },
];

const subjects = [
  { label: "Biology", emoji: "🔬", topics: ["Cell Biology", "Genetics", "Human Physiology", "Ecology", "Plant Biology"] },
  { label: "Chemistry", emoji: "⚗️", topics: ["Organic Reactions", "Equilibrium", "Electrochemistry", "Coordination", "Biomolecules"] },
  { label: "Physics", emoji: "⚡", topics: ["Mechanics", "Optics", "Thermodynamics", "Modern Physics", "Electromagnetism"] },
];

const LandingPage = ({ onEnterChat, darkMode, onToggleDarkMode }) => {
  return (
    <div className={`min-h-screen landing-bg ${darkMode ? "dark bg-gray-950" : "bg-gray-50"}`}>
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            🤖
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Soul of Médico</span>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">AI</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>

          <button
            onClick={onEnterChat}
            className="btn-glow px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/25"
          >
            Start Learning →
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          AI-Powered NEET Preparation Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
          Your Personal{" "}
          <span className="gradient-text">NEET Mentor</span>
          <br />Powered by AI
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Soul of Médico AI explains Biology, Chemistry & Physics deeply, generates
          NEET-pattern MCQs, and helps you master every concept — exactly when you need it.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onEnterChat}
            className="btn-glow w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            <span>🚀</span> Start Chatting — It's Free
          </button>
          <button
            onClick={() => onEnterChat("mcq")}
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>📝</span> Generate MCQs Now
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: "GPT-4o", label: "AI Model" },
            { value: "3 Subjects", label: "NEET Coverage" },
            { value: "∞", label: "Questions" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Everything You Need to Crack NEET
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-sm">
          One AI platform. All your preparation needs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat) => (
            <div
              key={feat.title}
              className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${feat.color} ${feat.border} hover:scale-[1.02] transition-transform cursor-default`}
            >
              <div className="text-3xl mb-3">{feat.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">{feat.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subjects Section ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Covers All NEET Subjects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.label} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{subject.emoji}</span>
                <span className="font-bold text-gray-900 dark:text-white">{subject.label}</span>
              </div>
              <ul className="space-y-2">
                {subject.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Open & Start", desc: "No login needed. Just open and start chatting with your AI mentor.", icon: "⚡" },
            { step: "02", title: "Ask or Generate", desc: "Solve doubts or generate NEET MCQs from any topic instantly.", icon: "🤖" },
            { step: "03", title: "Download & Practice", desc: "Export MCQs as PDF and practice offline anytime, anywhere.", icon: "📥" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-blue-500 mb-1">STEP {item.step}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-10 text-center shadow-2xl shadow-blue-500/20">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to Ace NEET? 🎯</h2>
          <p className="text-blue-100 mb-8 text-sm">
            Join thousands of NEET aspirants using Soul of Médico AI to prepare smarter.
          </p>
          <button
            onClick={onEnterChat}
            className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Your AI Session Now →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2024 Soul of Médico AI · Powered by OpenAI GPT-4o · Built for NEET Aspirants 🇮🇳
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

# 🩺 Soul of Médico AI

> **Your free, intelligent NEET mentor** — powered by **Groq + Llama 3.1** (100% free, works in India & all regions).

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Your Free Groq API Key](#getting-your-free-groq-api-key)
- [Local Setup (Manual)](#local-setup-manual)
- [Docker Setup (Recommended)](#docker-setup-recommended)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- 🤖 **AI Chat** powered by Groq + Llama 3.1 (**free, works in India**)
- 📚 NEET-focused: Biology, Chemistry, Physics (NCERT standard)
- 🧠 MCQ generation in official NEET pattern
- 💬 Persistent chat sessions (MongoDB)
- 📄 PDF export of chat sessions
- 🚦 Rate limiting & session management
- 🐳 Docker + Docker Compose ready

---

## 🛠 Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React + Vite + Tailwind CSS                 |
| Backend   | Node.js + Express                           |
| AI Model  | Groq — Llama 3.1 8B Instant (**FREE**)      |
| Database  | MongoDB                                     |
| Container | Docker + Docker Compose                     |

---

## ✅ Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Docker](https://www.docker.com/) (optional, for Docker setup)
- A **free** Groq API key (see below)

---

## 🔑 Getting Your Free Groq API Key

> ✅ Groq works in **India and all countries** — no regional restrictions!

### Step-by-step:

1. Go to **[https://console.groq.com](https://console.groq.com)**
2. Click **"Sign Up"** — you can sign up with your **Google account** or email
3. After logging in, go to **API Keys** in the left sidebar (or visit [https://console.groq.com/keys](https://console.groq.com/keys))
4. Click **"Create API Key"**
5. Give it a name like `soul-of-medico`
6. Copy the key — it starts with `gsk_...`

> 💡 **Groq Free Tier Limits:**
> - 30 requests/minute
> - 14,400 requests/day
> - 500,000 tokens/day
> 
> This is **more than enough** for a NEET study app!

---

## 💻 Local Setup (Manual)

### 1. Extract the project

```bash
unzip soul-of-medico.zip
cd soul-of-medico
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (this will install groq-sdk)
npm install

# Copy environment file
cp .env.example .env
```

Open `.env` in any text editor (Notepad, VS Code) and fill in:

```env
GROQ_API_KEY=gsk_your_key_here
MONGODB_URI=mongodb://localhost:27017/soul_of_medico
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
# ✅ Backend runs on http://localhost:5000
```

### 3. Frontend Setup

Open a **new terminal/command prompt**:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
# ✅ Frontend runs on http://localhost:5173
```

### 4. Open in Browser

Visit **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 🐳 Docker Setup (Recommended)

The easiest way — runs everything with **one command**.

### 1. Set up environment

```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Run with Docker Compose

```bash
# From the root soul-of-medico/ folder
docker-compose up --build
```

This starts:
- **Frontend** → [http://localhost:5173](http://localhost:5173)
- **Backend API** → [http://localhost:5000](http://localhost:5000)
- **MongoDB** → localhost:27017

To stop:

```bash
docker-compose down
```

---

## 🔧 Environment Variables

| Variable                   | Description                               | Default                                    |
|----------------------------|-------------------------------------------|--------------------------------------------|
| `GROQ_API_KEY`             | 🔑 Your free Groq API key (`gsk_...`)    | *(required)*                               |
| `MONGODB_URI`              | MongoDB connection string                 | `mongodb://localhost:27017/soul_of_medico` |
| `PORT`                     | Backend server port                       | `5000`                                     |
| `NODE_ENV`                 | Environment (`development`/`production`)  | `development`                              |
| `FRONTEND_URL`             | Frontend URL for CORS                     | `http://localhost:5173`                    |
| `SESSION_CLEANUP_HOURS`    | Auto-delete inactive sessions (hours)     | `24`                                       |
| `MAX_MESSAGES_PER_SESSION` | Max messages allowed per session          | `50`                                       |

---

## 📁 Project Structure

```
soul-of-medico/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── rateLimiter.js     # API rate limiting
│   ├── models/
│   │   └── Session.js         # MongoDB session schema
│   ├── routes/
│   │   ├── chat.js            # 💬 Chat API (Groq AI)
│   │   └── pdf.js             # 📄 PDF export
│   ├── utils/
│   │   └── pdfGenerator.js    # PDF generation utility
│   ├── .env.example           # Environment template
│   ├── Dockerfile
│   ├── package.json
│   └── server.js              # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── storage.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 📡 API Reference

### `POST /api/chat`
Send a message and get an AI response.

**Request body:**
```json
{
  "message": "Explain mitosis step by step",
  "sessionId": "optional-existing-session-id",
  "mode": "chat"
}
```

**Response:**
```json
{
  "sessionId": "uuid-here",
  "message": "AI response text...",
  "remainingMessages": 49
}
```

### `GET /api/chat/history/:sessionId`
Get full chat history for a session.

### `DELETE /api/chat/clear/:sessionId`
Clear all messages in a session.

### `GET /api/chat/session/new`
Generate a fresh session ID.

---

## 🆚 Why Groq?

| | Groq (Llama 3.1) | Google Gemini | OpenAI GPT-4o-mini |
|---|---|---|---|
| **Cost** | ✅ FREE | ✅ Free (region issues) | 💲 Paid |
| **Works in India** | ✅ YES | ⚠️ Regional issues | ✅ Yes (paid) |
| **Speed** | ⚡⚡ Extremely Fast | ⚡ Fast | ⚡ Fast |
| **Daily Limit** | 14,400 req/day | 1,500 req/day | Pay per use |
| **Signup** | Google/Email | Google (age verify) | Card required |

---

## 🐛 Troubleshooting

**Can't get Groq API key?**
→ Visit [https://console.groq.com](https://console.groq.com) and sign up with Google. It works in India.

**`GROQ_API_KEY` not set / 401 error**
→ Make sure `.env` file exists in `backend/` folder and has `GROQ_API_KEY=gsk_...`

**MongoDB connection failed**
→ Make sure MongoDB is running: open a terminal and run `mongod`
→ Or use free cloud MongoDB: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)

**Port already in use**
→ Change `PORT=5001` in `.env` and restart.

**npm install fails**
→ Make sure Node.js v18+ is installed: `node --version`

---

*Built with ❤️ for NEET aspirants across India.*

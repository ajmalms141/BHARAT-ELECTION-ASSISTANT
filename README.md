# 🗳️ Bharat Election Assistant — Matdata Mitra

> **An AI-powered civic assistant for every Indian voter.**
> Built with Google Gemini AI for the Hack2Skill Challenge.

[![Node.js](https://img.shields.io/badge/Node.js-≥18.0-green?logo=node.js)](https://nodejs.org)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-blue?logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](Dockerfile)

---

## 📌 Challenge Vertical

**Civic Technology & Democratic Participation**

This project addresses the challenge of making India's complex electoral process accessible to every citizen through an intelligent, conversational AI assistant available in English and Hindi.

---

## 🎯 What It Does

**Matdata Mitra** (मतदाता मित्र) is a smart, multi-turn AI chatbot that helps Indian voters:

- ✅ **Register to vote** — Step-by-step guidance on Form 6, NVSP portal
- ✅ **Find their polling booth** — Instructions to locate the nearest booth
- ✅ **Understand elections** — Lok Sabha, Rajya Sabha, State Assemblies explained
- ✅ **Learn about EVMs** — How Electronic Voting Machines and VVPATs work
- ✅ **Know their rights** — NOTA, Model Code of Conduct, voter helpline (1950)
- ✅ **Get civic guidance** — In English or Hindi, neutrally and accurately

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  HTML (Accessible) + CSS + JavaScript            │   │
│  │  - Multi-turn conversation history               │   │
│  │  - Voice input (Web Speech API)                  │   │
│  │  - Language toggle (EN / Hindi)                  │   │
│  │  - Suggested follow-up questions                 │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS POST /api/chat
                         ▼
┌─────────────────────────────────────────────────────────┐
│               Express.js Server (Node.js)                │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │  Helmet  │  │Rate Limit │  │  Input Validator      │  │
│  │ (CSP,    │  │(100/15min │  │  (express-validator)  │  │
│  │  HSTS)   │  │ 20/1min)  │  │                       │  │
│  └──────────┘  └───────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Chat Controller                                 │   │
│  │  - Multi-turn: Gemini startChat() with history   │   │
│  │  - Suggests follow-up questions via Gemini       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   Google Gemini AI     │
            │  gemini-2.0-flash      │
            │  (Multi-turn Chat API) │
            └────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Multi-turn AI Chat** | Maintains conversation context across messages using Gemini's chat history |
| 🗣️ **Voice Input** | Web Speech API allows hands-free voice queries in Indian English |
| 🇮🇳 **Hindi Support** | Language toggle — bot auto-detects and responds in Hindi or English |
| 💡 **Smart Suggestions** | AI generates 3 contextual follow-up questions after each answer |
| 🔒 **Security Hardened** | Helmet CSP, HSTS, rate limiting (100/15min, 20/1min), input validation |
| ♿ **WCAG Accessible** | ARIA roles, live regions, skip-nav, high contrast, reduced motion support |
| 🚀 **Efficient** | Gzip compression, static asset caching, request size limits |
| 🧪 **Fully Tested** | Jest + Supertest integration and unit tests |
| 🐳 **Docker Ready** | Containerized for cloud deployment |

---

## 🔧 Google Services Used

| Service | How It's Used |
|---|---|
| **Google Gemini AI** (`gemini-2.0-flash`) | Multi-turn conversational AI, election Q&A, follow-up suggestion generation |
| **Google Fonts** | Playfair Display + Poppins for premium typography |

---

## 🔐 Security Features

- **`helmet`** — Sets 15+ security headers including CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **`express-rate-limit`** — Tiered rate limiting: 100 req/15min (global), 20 req/min (chat API)
- **`express-validator`** — Input sanitization, HTML escaping, type and length validation
- **Request Size Limit** — JSON body capped at 10KB
- **Startup Validation** — App exits immediately if API key is not configured
- **No Stack Trace Leaks** — Production error handler never exposes internals
- **Graceful Shutdown** — SIGTERM handled cleanly

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18.0
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ajmalms141/BHARAT-ELECTION-ASSISTANT.git
cd BHARAT-ELECTION-ASSISTANT

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Start the server
npm start
# Open http://localhost:8080
```

### Running Tests

```bash
npm test
# Runs Jest with coverage report
```

---

## 🐳 Docker Deployment

```bash
# Build the image
docker build -t bharat-election-assistant .

# Run the container
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key_here \
  bharat-election-assistant
```

---

## 📡 API Reference

### `GET /api/health`
Returns service health status.

**Response:**
```json
{
  "status": "ok",
  "service": "Bharat Election Assistant",
  "version": "2.0.0",
  "geminiConfigured": true,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### `POST /api/chat`
Sends a message and receives an AI-generated reply.

**Request Body:**
```json
{
  "message": "How do I register to vote in India?",
  "history": [],
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "To register as a voter in India...",
  "suggestedQuestions": [
    "What documents are needed for voter registration?",
    "How long does voter registration take?",
    "Can I register online?"
  ]
}
```

**Error Codes:**
| Code | Reason |
|---|---|
| 400 | Invalid input (missing message, too long, wrong type) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 📁 Project Structure

```
BHARAT-ELECTION-ASSISTANT/
├── src/
│   ├── config/
│   │   └── gemini.js          # Gemini AI client + system prompt
│   ├── controllers/
│   │   └── chatController.js  # Multi-turn chat logic
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── validator.js       # Input validation
│   ├── routes/
│   │   └── chat.js            # API routes
│   └── utils/
│       └── logger.js          # Winston logger
├── public/
│   ├── index.html             # Accessible frontend UI
│   ├── script.js              # Client-side logic
│   └── style.css              # Patriotic themed styles
├── tests/
│   ├── chat.test.js           # Integration tests
│   └── server.test.js         # Unit tests
├── server.js                  # App entry point
├── Dockerfile
├── .env.example
└── package.json
```

---

## 💡 Approach & Logic

1. **User sends a question** about Indian elections via chat or voice
2. **Server validates** the input (length, type, sanitization)
3. **Rate limiter** protects against abuse
4. **Chat Controller** passes the message + full conversation history to Gemini's `startChat()` API, enabling true multi-turn context
5. **Gemini responds** as "Matdata Mitra" — a neutral, knowledgeable election expert
6. **A second Gemini call** generates 3 contextual follow-up suggestions
7. The reply and suggestions are returned to the client and displayed

---

## ⚠️ Assumptions

- The assistant focuses exclusively on Indian national and state elections
- No user data is stored; all conversation history is maintained client-side only
- The Gemini API key must be provided as an environment variable
- The app is designed for modern browsers with JavaScript enabled

---

## 📄 License

MIT © 2025 Ajmal MS

---

*Jai Hind 🇮🇳 — Built for every Indian voter*

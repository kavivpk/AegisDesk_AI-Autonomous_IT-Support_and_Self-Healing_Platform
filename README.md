# 🛡️ AegisDesk AI

### Autonomous IT Support & Self-Healing Platform

> Enterprise-grade AI platform powered by RAG, Multi-Agent AI, and Self-Corrective Workflows.  
> Built with React, Node.js, MongoDB, Python FastAPI, ChromaDB — **100% Free & Open Source**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [User Roles & Access](#user-roles--access)
- [API Reference](#api-reference)
- [AI Agents](#ai-agents)
- [Pages & Features](#pages--features)
- [Common Issues & Fixes](#common-issues--fixes)

---

## Project Overview

AegisDesk AI is a fully autonomous IT support platform that:

- Accepts and categorizes IT support tickets automatically
- Uses Hybrid RAG (vector + keyword search) to find relevant solutions
- Runs AI agents for triage, solution generation, and self-correction
- Escalates unresolved issues with full diagnostic summaries
- Provides real-time analytics and admin management

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| React Router DOM | Navigation |
| Axios | HTTP requests |
| Recharts | Charts & analytics |
| Firebase Auth | Authentication |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Token authentication |
| bcryptjs | Password hashing |
| Nodemon | Auto-restart dev server |

### AI / RAG Service
| Technology | Purpose |
|---|---|
| Python 3.11 + FastAPI | AI microservice |
| ChromaDB | Vector database |
| Sentence Transformers | Text embeddings |
| all-MiniLM-L6-v2 | Embedding model (~90MB) |
| BM25 (rank-bm25) | Keyword search |
| PyMuPDF | PDF parsing |
| python-docx | Word document parsing |

---

## Project Structure

```
AegisDesk_AI-Autonomous_IT-Support_and_Self-Healing_Platform/
│
├── frontend/                     → React + Vite app (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx        → Sidebar + topbar layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   → Authentication state
│   │   │   └── ThemeContext.jsx  → Dark/Light theme
│   │   ├── pages/
│   │   │   ├── Login.jsx         → Login page (2-column)
│   │   │   ├── Register.jsx      → Registration page
│   │   │   ├── Dashboard.jsx     → Main dashboard
│   │   │   ├── Tickets.jsx       → Ticket list with filters
│   │   │   ├── TicketDetail.jsx  → Single ticket + AI triage
│   │   │   ├── CreateTicket.jsx  → Create new ticket
│   │   │   ├── Analytics.jsx     → Charts & metrics
│   │   │   ├── KnowledgeBase.jsx → Upload & search docs
│   │   │   └── AdminPanel.jsx    → Admin management
│   │   ├── config/
│   │   │   └── firebase.js       → Firebase config
│   │   └── App.jsx               → Routes
│   ├── .env
│   └── package.json
│
├── backend/                      → Node.js API (Port 5000)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── KnowledgeBase.js
│   │   ├── TicketHistory.js
│   │   ├── AIResponse.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
│
├── rag-service/                  → Python AI service (Port 8001)
│   ├── main.py                   → FastAPI routes
│   ├── rag_engine.py             → AI agents + RAG engine
│   ├── chroma_db/                → Vector DB (auto-created)
│   ├── venv/                     → Python virtual env
│   └── .env
│
└── README.md
```

---

## Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| Python | **3.11.x** | https://python.org/downloads/release/python-3119 |
| MongoDB | Community | https://mongodb.com/try/download/community |
| Git | Latest | https://git-scm.com |

> ⚠️ Use Python 3.11 specifically. Python 3.12+ has compatibility issues with AI packages.

---

## Installation & Setup

### Step 1 — Backend

```powershell
cd backend
npm install
```

### Step 2 — Frontend

```powershell
cd frontend
npm install
```

### Step 3 — RAG Service (First time only)

```powershell
cd rag-service
py -3.11 -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn chromadb sentence-transformers langchain langchain-community pymupdf python-docx python-dotenv requests rank-bm25 python-multipart
```

### Step 4 — Firebase Setup

1. Go to https://console.firebase.google.com
2. Create project: `aegisdesk-ai`
3. Enable Authentication → Email/Password + Google
4. Register Web App → copy config to `frontend/.env`

---

## Running the Project

Open **3 terminals** simultaneously:

### Terminal 1 — MongoDB + Backend

```powershell
# Run as Administrator
net start MongoDB

cd backend
npm run dev
```

✅ Expected:
```
🚀 Server running on port 5000
✅ MongoDB connected
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm run dev
```

✅ Expected:
```
➜  Local: http://localhost:5173/
```

### Terminal 3 — RAG AI Service

```powershell
cd rag-service
venv\Scripts\activate
python main.py
```

✅ Expected:
```
📦 Loading embedding model...
✅ RAG Engine ready!
INFO: Uvicorn running on http://0.0.0.0:8001
```

### Open Browser

```
http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aegisdesk
JWT_SECRET=aegisdesk_super_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### `rag-service/.env`

```env
PORT=8001
CHROMA_DB_PATH=./chroma_db
```

---

## User Roles & Access

| Role | Tickets | Analytics | Knowledge Base | Admin Panel |
|---|---|---|---|---|
| Employee | Own tickets only | ❌ | ❌ | ❌ |
| IT Engineer | All tickets | ✅ | ✅ | ❌ |
| Admin | All tickets | ✅ | ✅ | ✅ |

### Default Admin Account

```
Email:    admin@aegisdesk.com
Password: admin123
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/firebase` | Firebase social login | No |

### Tickets — `/api/tickets`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/tickets` | Get all tickets | Yes |
| POST | `/api/tickets` | Create ticket | Yes |
| GET | `/api/tickets/:id` | Get ticket + history | Yes |
| PUT | `/api/tickets/:id` | Update ticket | Yes |
| DELETE | `/api/tickets/:id` | Delete ticket | Admin/Engineer |

### Analytics — `/api/analytics`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/analytics/stats` | Dashboard statistics | Admin/Engineer |

### RAG Service — `http://localhost:8001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/upload` | Upload & index document |
| POST | `/search` | Search knowledge base |
| POST | `/triage` | AI triage a ticket |
| POST | `/solve` | Generate solution |
| GET | `/stats` | RAG engine statistics |

---

## AI Agents

### Triage Agent
**File:** `rag-service/rag_engine.py` → `triage_ticket()`

Detects category, priority, and confidence score automatically from ticket text.

### Solution Generator Agent
**File:** `rag-service/rag_engine.py` → `generate_solution()`

Searches knowledge base and generates step-by-step troubleshooting steps.

### Hybrid RAG Engine
**File:** `rag-service/rag_engine.py` → `hybrid_search()`

Combines vector search (60%) + BM25 keyword search (40%) for best results.

### Self-Correction Loop
Detects low-confidence responses, rephrases the query, and retries up to 3 times before escalating.

---

## Pages & Features

| Page | URL | Access |
|---|---|---|
| Login | `/login` | Public |
| Register | `/register` | Public |
| Dashboard | `/dashboard` | All roles |
| Tickets | `/tickets` | All roles |
| Create Ticket | `/create-ticket` | All roles |
| Ticket Detail | `/tickets/:id` | All roles |
| Analytics | `/analytics` | Admin, IT Engineer |
| Knowledge Base | `/knowledge` | Admin, IT Engineer |
| Admin Panel | `/admin` | Admin only |

**UI Features:**
- 🌙 Dark / ☀️ Light theme toggle
- Collapsible sidebar
- Role-based navigation
- Responsive design

---

## Common Issues & Fixes

### MongoDB not starting

```powershell
# Run PowerShell as Administrator
net start MongoDB
```

### Port already in use

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Python venv activation error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\activate
```

### RAG service slow on first start

First run downloads the embedding model (~90MB). One-time only — subsequent starts are instant.

### Frontend not connecting to backend

1. Confirm backend runs on port 5000
2. Check `VITE_API_URL=http://localhost:5000/api` in `frontend/.env`
3. Restart: `Ctrl+C` → `npm run dev`

---

## Quick Start Checklist

```
□ Open PowerShell as Admin → net start MongoDB
□ Terminal 1: cd backend → npm run dev
□ Terminal 2: cd frontend → npm run dev
□ Terminal 3: cd rag-service → venv\Scripts\activate → python main.py
□ Browser: http://localhost:5173
□ Login: admin@aegisdesk.com / admin123
```

---

*AegisDesk AI — Powered by Open Source Technologies*
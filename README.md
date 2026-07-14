# 🎯 Interview AI Project

An AI-powered interview preparation platform. Upload your resume, describe yourself, and paste a job description — the AI analyzes the match, generates likely technical and behavioral interview questions (with model answers), identifies skill gaps, builds a day-by-day preparation plan, and can even generate a tailored, ATS-friendly resume as a downloadable PDF.

## ✨ Features

- **User Authentication** — Register/login with JWT stored in secure HTTP-only cookies, plus token blacklisting on logout
- **Resume Upload** — Upload a resume as a PDF (up to 3MB), text is extracted automatically
- **AI Interview Report Generation** — Given your resume, self-description, and a job description, the AI produces:
  - A **match score** (0–100) against the job
  - Likely **technical questions** with the interviewer's intention and a model answer
  - Likely **behavioral questions** with intention and model answer
  - A list of **skill gaps** with severity ratings
  - A **day-by-day preparation plan** with focus areas and tasks
- **Report History** — View all past interview reports for the logged-in user
- **AI-Tailored Resume PDF** — Generate a job-tailored, ATS-friendly resume as a downloadable PDF (rendered from AI-generated HTML via Puppeteer)

## 🏗️ Tech Stack

**Frontend (`/Frontend`)**
- React 19 + Vite
- React Router v7
- Axios (with `withCredentials` for cookie-based auth)
- Sass/SCSS for styling
- Feature-based folder structure (`features/auth`, `features/interview`)

**Backend (`/Backend`)**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication via HTTP-only cookies (`jsonwebtoken`, `cookie-parser`)
- Password hashing (`bcryptjs`)
- Token blacklist collection for logout invalidation
- PDF text extraction (`pdf-parse`)
- PDF generation from HTML (`puppeteer`)
- File uploads (`multer`)
- AI generation via **Google Gemini** (`@google/genai`, model `gemini-2.0-flash-lite`)
- Structured AI output validated with `zod` + `zod-to-json-schema`

## 📁 Project Structure

```
Interview-AI-Project/
├── Backend/
│   ├── server.js                     # Entry point, DB connect, listen
│   └── src/
│       ├── app.js                    # Express app, middleware, route mounting
│       ├── config/
│       │   └── database.js           # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js    # Register / login / logout / get-me
│       │   └── interview.controller.js  # Report generation & retrieval, resume PDF
│       ├── middlewares/
│       │   ├── auth.middleware.js    # Cookie-based JWT auth + blacklist check
│       │   └── file.middleware.js    # Multer config (3MB limit, memory storage)
│       ├── models/
│       │   ├── user.model.js
│       │   ├── interviewReport.model.js
│       │   └── blacklist.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.routes.js
│       └── services/
│           └── ai.service.js         # Gemini prompts, schemas, PDF generation
│
└── Frontend/
    ├── src/
    │   ├── app.routes.jsx             # Route definitions
    │   ├── App.jsx
    │   └── features/
    │       ├── auth/
    │       │   ├── auth.context.jsx
    │       │   ├── hooks/useAuth.js
    │       │   ├── components/Protected.jsx   # Route guard
    │       │   ├── pages/Login.jsx, Register.jsx
    │       │   └── services/auth.api.js
    │       └── interview/
    │           ├── interview.context.jsx
    │           ├── hooks/useInterview.js
    │           ├── pages/Home.jsx, Interview.jsx
    │           └── services/interview.api.js
    └── vercel.json                    # SPA rewrite config for Vercel
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas connection string)
- A [Google AI Studio / Gemini API key](https://ai.google.dev/) (`GOOGLE_GENAI_API_KEY`)
- Puppeteer will download a bundled Chromium on install (needs sufficient disk space; may require extra system dependencies on Linux for headless Chrome)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Interview-AI-Project.git
cd Interview-AI-Project
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

Start the backend (with auto-reload):

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### 3. Frontend setup

```bash
cd ../Frontend
npm install
```

> **Note:** Both `auth.api.js` and `interview.api.js` currently point to a hardcoded production API URL (`baseURL`). For local development, change this to `http://localhost:3000` in both files, and keep `withCredentials: true` so auth cookies are sent.

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (sets auth cookie) |
| POST | `/api/auth/login` | Log in (sets auth cookie) |
| GET | `/api/auth/logout` | Log out and blacklist current token |
| GET | `/api/auth/get-me` | Get current logged-in user (auth required) |
| POST | `/api/interview/` | Upload resume + descriptions, generate an interview report (auth required, `multipart/form-data`, field `resume`) |
| GET | `/api/interview/` | Get all interview reports for the logged-in user (auth required) |
| GET | `/api/interview/report/:interviewId` | Get a specific interview report (auth required) |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Generate and download a tailored resume PDF (auth required) |

All `/api/interview/*` routes and `/api/auth/get-me` require a valid `token` HTTP-only cookie set at login/register.

## 🐳 Notes on Deployment

- **Frontend**: Configured for [Vercel](https://vercel.com) (`vercel.json` includes SPA rewrite rules).
- **Backend**: Plain Node/Express app (no Dockerfile included). CORS is currently restricted to a specific Vercel domain and `*.vercel.app` subdomains in `src/app.js` — update this for other deployment targets.
- Since auth uses cookies with `sameSite: "none"` and `secure: true`, the backend must be served over **HTTPS** in production for cookies to be set correctly, and the frontend origin must be included in the CORS allowlist.
- Running Puppeteer in containerized/serverless environments (e.g. Render, Railway) may require extra configuration (e.g. `--no-sandbox` flag, which is already set) and sufficient memory.

## 📄 License

This project does not currently specify a license. Add one (e.g. MIT) if you plan to distribute or open-source it.

# Trao – AI Travel Planner

A full-stack, multi-user AI travel planner that generates day-by-day itineraries, budget estimates, hotel suggestions, and smart packing lists using Google Gemini AI.

## 🚀 Live Demo
- **Frontend**: https://ai-travel-planner-three-eosin.vercel.app
- **Backend**: https://ai-travel-planner-d3vf.onrender.com

---

## 🛠️ Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, excellent DX |
| Styling | Tailwind CSS | Utility-first, rapid prototyping |
| Backend | Node.js + Express | Lightweight, fast REST APIs |
| Database | MongoDB + Mongoose | Flexible schema for itinerary data |
| AI | Google Gemini 2.0 Flash | Fast, accurate, free tie available |
| Auth | JWT + bcryptjs | Stateless, secure, industry standard |

---

## 📁 Project Structure

```
ai-travel-planner/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/{User,Trip}.js
│   ├── controllers/{auth,trip}Controller.js
│   ├── routes/{auth,trip}Routes.js
│   └── server.js
└── frontend/
    └── src/
        ├── app/{page,login,register,dashboard}/
        ├── components/{CreateTripForm,ItineraryCard,PackingList,HotelCard,BudgetCard}.tsx
        ├── context/AuthContext.tsx
        ├── utils/api.ts
        └── types/index.ts
```

---

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/ai-travel-planner.git
cd ai-travel-planner
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values:
# MONGO_URI, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
# Runs on http://localhost:3000
```

---

## 🔐 Authentication & Authorization

- **Registration**: Password hashed with bcryptjs (12 salt rounds) before storage
- **Login**: Credentials compared with `bcrypt.compare()`, JWT signed with 7-day expiry
- **Protected Routes**: Every trip endpoint requires `Authorization: Bearer <token>` header
- **Data Isolation**: All trip queries include `{ userId: req.user.id }` filter — users can never access other users' data
- **Frontend**: JWT stored in localStorage, auto-attached to every request via Axios interceptor. 401 responses auto-redirect to login

---

## 🤖 AI Agent Design

The AI agent uses **Google Gemini 2.0 Flash** via direct REST API calls.

**Prompt Engineering:**
- Forces structured JSON output using `responseMimeType: "application/json"`
- Includes destination, duration, budget tier, and interests in prompt context
- Budget tier maps to realistic cost guidance (e.g., Low = hostels/street food)
- Generates: itinerary, hotels (Budget/Mid-Range/Luxury), budget breakdown, packing list, travel tips, weather summary

**Resilience:**
- Exponential backoff retry (5 attempts: 1s → 2s → 4s → 8s → 16s) for rate limit errors
- Response parsing strips markdown code fences before JSON.parse()
- Global error handler returns user-friendly messages

**Day Regeneration:**
- Targeted prompt sends existing trip context + user's natural language request
- Only replaces the specific day in MongoDB, preserving the rest of the itinerary

---

## ✨ Creative Custom Feature: AI Packing Assistant

**Problem it solves:** Travelers forget essential items or pack inappropriately for their destination's climate and planned activities.

**How it works:**
- The same AI call that generates the itinerary also produces a categorized packing list
- Categories: Documents, Clothing, Gear, Toiletries, Other
- Items are flagged as `essential: true/false`
- A weather summary is generated to explain climate conditions
- Users can check/uncheck items; state persists to MongoDB in real-time
- Progress bar shows packing completion percentage

This feature is integrated into the core AI call (zero extra API calls) making it efficient and contextually aware of the specific trip activities.

---

## 🏗️ Key Design Decisions & Trade-offs

| Decision | Reasoning |
|---|---|
| Gemini over OpenAI | Free tier generous enough for assessment; `responseMimeType: application/json` enforces clean output |
| MongoDB over SQL | Trip itinerary is a nested document — fits document model naturally |
| JWT over sessions | Stateless, works well across Vercel + Render deployment |
| Single AI call per trip | Reduces latency and API costs; everything generated in one structured prompt |
| Exponential backoff | Gemini free tier has rate limits; backoff prevents cascading failures |

---

## ⚠️ Known Limitations

- Gemini free tier has RPM limits; heavy concurrent use may hit rate limits
- Budget estimates are AI-approximated, not real-time pricing data
- No email verification on registration
- No password reset flow

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/trips | Yes | Generate new trip |
| GET | /api/trips | Yes | Get user's trips |
| GET | /api/trips/:id | Yes | Get trip details |
| PUT | /api/trips/:id | Yes | Update trip |
| DELETE | /api/trips/:id | Yes | Delete trip |
| POST | /api/trips/:id/regenerate-day | Yes | Regenerate a day |
| POST | /api/trips/:id/add-activity | Yes | Add activity |
| DELETE | /api/trips/:id/remove-activity | Yes | Remove activity |

---

## 🚀 Deployment

### Backend (Render)
1. Push to GitHub
2. Create Web Service on Render, connect repo, set root to `backend/`
3. Build command: `npm install` | Start command: `npm start`
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`

### Frontend (Vercel)
1. Import GitHub repo on Vercel, set root to `frontend/`
2. Add env variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. Deploy

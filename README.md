# SmallBets.live

Real-time micro-betting platform for friends watching live events together.

## Project Structure

```
smallbets.live/
├── frontend/          # React + TypeScript + Vite
├── backend/           # FastAPI + Python
├── templates/         # Event templates (JSON)
├── SPEC.md           # Product specification
├── CLAUDE.md         # Project context
└── ARCHITECTURE.md   # Architecture documentation
```

## Implementation Status

### Phase 1: Core Infrastructure ✅ COMPLETED
- [x] Project structure (frontend + backend)
- [x] Pydantic data models with FCIS compliance (7 models, 100% pure)
- [x] Firebase configuration and initialization
- [x] FastAPI application (17 endpoints)
- [x] Game logic (pure functions for scoring and validation)
- [x] Firestore services (room, user, bet operations)

### Phase 2: Player Experience ✅ COMPLETED
- [x] React application with routing
- [x] Firebase hooks for real-time sync
- [x] Session management (sessionStorage)
- [x] Home page (room code entry)
- [x] Create room page
- [x] Join room page
- [x] Room page (basic UI with participants)
- [x] Mobile-first CSS (dark theme, touch-friendly)

### Phase 3: Automation Engine ✅ COMPLETED
- [x] Transcript ingestion webhook API (POST /api/rooms/{code}/transcript)
- [x] Bet trigger engine (keyword matching with regex + fuzzy fallback)
- [x] Winner extraction engine (fuzzy matching with confidence scoring)
- [x] Manual live feed UI (LiveFeedPanel + AdminPanel)
- [ ] YouTube Live captions integration (optional - not MVP)

### Phase 4: Admin Controls ✅ COMPLETED
- [x] Admin control panel (AdminPanel component)
- [x] Automation monitoring (live feed with result feedback)
- [x] Manual override controls (toggle automation, manual bet controls)
- [x] Event template management (templates created, integration pending)

### Phase 5: Templates & Testing 📋 TODO
- [x] Grammy Awards 2026 template (with trigger config)
- [x] Oscars 2026 + Super Bowl LIX templates
- [ ] Scoring logic integration
- [ ] End-to-end testing
- [ ] Load testing (20+ concurrent users)
- [ ] Firebase Hosting deployment

See [CLAUDE.md](./CLAUDE.md) for architectural context and [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ with `uv` installed
- Firebase project (for production)

### Backend
```bash
cd backend

# Setup
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your Firebase project ID

# Run
uv run uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend

# Setup
npm install
cp .env.example .env
# Edit .env with your Firebase config

# Run
npm run dev
# App: http://localhost:5173
```

### Test Flow
1. Open http://localhost:5173
2. Click "Create New Room"
3. Enter nickname, select event template
4. Share room code with friends
5. Join from another browser/device
6. See real-time participant updates

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Firebase SDK
- **Backend**: FastAPI, Python 3.11+, Firebase Admin SDK
- **Database**: Google Cloud Firestore
- **Hosting**: Firebase Hosting
- **Deployment**: Google Cloud Run (backend), Firebase Hosting (frontend)

## Development

See [SPEC.md](./SPEC.md) for implementation plan and [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture patterns and review workflow.

## Target MVP

- Grammy Awards 2026 (Feb 2, 2026)
- Basic automation with manual fallback
- 2-week development timeline

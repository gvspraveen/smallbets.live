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

**Phase 1-2 Complete** ✅ Core infrastructure and player experience implemented

- Backend: FastAPI with 17 endpoints, FCIS-compliant architecture
- Frontend: React + TypeScript with real-time Firestore sync
- Models: 7 Pydantic models with pure serialization
- Pages: Home, CreateRoom, JoinRoom, RoomPage
- Real-time: Live participants, room status, bet updates

**Next**: Phase 3 (Automation Engine), Phase 4 (Admin Controls)

See [CLAUDE.md](./CLAUDE.md) for detailed status and [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide.

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

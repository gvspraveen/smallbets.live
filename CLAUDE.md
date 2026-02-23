# SmallBets.live - Project Context

## Project Overview
Real-time micro-betting platform for friends watching live events (Oscars, Super Bowl) together. Virtual points only, mobile-first, no accounts needed.

## Key Architectural Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for comprehensive architecture documentation, review workflow, and the 9 red flags to avoid.

### Tech Stack
- **Frontend**: React + TypeScript, mobile-first design
- **Backend**: Firebase (Firestore + Cloud Functions + Hosting)
- **Real-time**: Firebase Realtime Database for live sync
- **Deployment**: Firebase Hosting

### Design Principles
- **Simplicity over features**: No accounts, no app install, minimal UI
- **Mobile-first**: Optimized for one-handed phone use while watching TV
- **Real-time sync**: All users see identical state instantly
- **Automated event flow**: Bets open/close automatically via transcript ingestion
- **Pluggable architecture**: Generic webhook for any transcript source (YouTube, manual feed, scrapers)

### Project Constraints
- **Virtual points only**: No real money, no payment processing
- **MVP timeline**: 1-2 weeks to working prototype
- **Room-based**: No user accounts, session-based with room codes
- **Single active bet**: Users only see current bet, not full list

## Automation Architecture

### Transcript Ingestion Flow
1. **Transcript Source** (YouTube API, manual feed, webhook) → sends text updates
2. **Ingestion API** (Cloud Function) → stores in `/transcripts/{roomCode}`
3. **Trigger Engine** (Firestore trigger) → matches keywords, opens bets
4. **Winner Extraction** (Firestore trigger) → parses outcome, resolves bets
5. **Firestore updates** → all clients update in real-time

### Key Components
- **Generic Webhook API**: `POST /api/transcript { roomCode, text, source }`
- **Bet Trigger Engine**: Keyword/regex matching with fuzzy logic
- **Winner Extraction**: NLP parsing with confidence scoring
- **Admin Override UI**: Manual controls when automation fails

### Transcript Sources (Pluggable)
- **Manual Live Feed**: Admin types key moments in real-time (most reliable for MVP)
- **YouTube Live Captions**: Poll YouTube Data API for auto-captions (if stream available)
- **Generic Webhook**: Any third party can POST transcript updates

## File Structure
```
smallbets.live/
├── SPEC.md                      # Full product specification
├── CLAUDE.md                    # This file
├── ARCHITECTURE.md              # Architecture patterns, review workflow, constraints
├── README.md                    # Project overview and setup
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/pages/    # Page components (Home, CreateRoom, JoinRoom, Room)
│   │   ├── hooks/               # React hooks (useRoom, useUser, useBet, useSession)
│   │   ├── services/            # API client and Firestore listeners
│   │   ├── types/               # TypeScript type definitions
│   │   ├── config/              # Firebase configuration
│   │   ├── App.tsx              # Main router
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles (mobile-first, dark theme)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                     # FastAPI + Python
│   ├── models/                  # Pydantic models (Room, User, Bet, UserBet, etc.)
│   ├── services/                # Firestore services (room_service, user_service, bet_service)
│   ├── api/                     # API endpoints (planned)
│   ├── main.py                  # FastAPI application (17 endpoints)
│   ├── game_logic.py            # Pure functions (scoring, validation)
│   ├── firebase_config.py       # Firebase Admin SDK initialization
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile               # Container image for Cloud Run
├── templates/                   # Event templates (JSON)
│   ├── grammys-2026.json        # Grammy Awards 2026 (5 bets)
│   ├── oscars-2026.json         # Oscars 2026 (4 bets, nominees TBD)
│   └── superbowl-lix.json       # Super Bowl LIX (6 bets)
├── firebase.json                # Firebase hosting config
├── firestore.rules              # Firestore security rules
└── firestore.indexes.json       # Firestore composite indexes
```

## Event Templates
- **Oscars 2026**: Major categories (Picture, Director, Actor, Actress, etc.)
- **Super Bowl LIX**: Pre-game, in-game, fun bets (Gatorade color, anthem length, etc.)
- **Custom**: Blank template for any event

## Scoring Rules (MVP)
- Start with 1000 points
- Each bet costs 100 points (fixed)
- Winners split pot evenly
- Leaderboard by total points

## Future Enhancements (Not MVP)
- Automated transcript monitoring
- User accounts
- Variable bet amounts
- Chat functionality
- Push notifications
- Real money (requires major compliance work)

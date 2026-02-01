# Deployment Guide - SmallBets.live

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- `uv` (Python package manager)
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud CLI: `gcloud` (for Cloud Run deployment)
- Firebase project created at https://console.firebase.google.com

## Initial Setup

### 1. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Hosting (for frontend)
# - Firestore (for database)

# Use existing project or create new one
```

### 2. Enable Firebase Services

In Firebase Console (https://console.firebase.google.com):
1. Navigate to your project
2. Enable **Firestore Database**
3. Enable **Firebase Hosting**
4. Go to Project Settings → Service Accounts
5. Generate new private key → Save as `backend/service-account-key.json`

**IMPORTANT**: Add `service-account-key.json` to `.gitignore` (already done)

### 3. Google Cloud Project Setup

```bash
# Set project ID
export PROJECT_ID="your-firebase-project-id"

# Set gcloud project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Environment Configuration

### Backend (.env)

Create `backend/.env`:
```bash
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env)

Create `frontend/.env`:
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://your-backend-url.run.app
```

Get Firebase config from: Project Settings → General → Your apps → Web app

## Local Development

### Run Backend

```bash
cd backend

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# Run FastAPI server
uv run uvicorn main:app --reload --port 8000

# API will be available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Frontend will be available at http://localhost:5173
```

### Run Firebase Emulators (Optional)

```bash
# Start Firestore emulator
firebase emulators:start

# Emulator UI at http://localhost:4000
# Firestore at http://localhost:8080
```

## Production Deployment

### 1. Deploy Backend to Cloud Run

```bash
cd backend

# Build and deploy
gcloud run deploy smallbets-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=$PROJECT_ID

# Note the service URL (e.g., https://smallbets-api-xxx.run.app)
# Update frontend/.env with VITE_API_URL
```

### 2. Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 3. Deploy Frontend to Firebase Hosting

```bash
cd frontend

# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Site will be live at https://your-project-id.web.app
```

### 4. Verify Deployment

1. Visit `https://your-project-id.web.app`
2. Create a test room
3. Join from another browser/device
4. Verify real-time sync works

## Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy smallbets-api \
            --source ./backend \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build and Deploy
        run: |
          cd frontend
          npm ci
          npm run build
          npm install -g firebase-tools
          firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
```

## Monitoring and Logs

### Backend Logs (Cloud Run)

```bash
# View logs
gcloud run logs read smallbets-api --region us-central1 --limit 100

# Stream logs
gcloud run logs tail smallbets-api --region us-central1
```

### Frontend Logs (Browser Console)

- Check browser console for errors
- Firebase Hosting logs in Firebase Console

### Firestore Monitoring

Firebase Console → Firestore Database → Usage tab

## Cost Optimization

### Firebase Spark Plan (Free Tier)
- 1 GB Firestore storage
- 50K reads, 20K writes, 20K deletes per day
- 10 GB hosting per month

**Estimated Costs for MVP** (within free tier):
- Firestore: ~1000 reads/writes per active room/day
- Hosting: < 1 GB for static assets
- Cloud Run: ~$0.10/day for 100 requests/day (first 2M requests free)

### Upgrade Triggers
- > 50 concurrent users → Consider Blaze plan
- > 1M requests/month → Monitor Cloud Run costs

## Troubleshooting

### Backend won't start
- Check `service-account-key.json` exists
- Verify Firebase project ID in `.env`
- Check port 8000 is not in use

### Frontend can't connect to backend
- Verify `VITE_API_URL` in `frontend/.env`
- Check CORS settings in `backend/main.py`
- Ensure backend is deployed and accessible

### Firestore permission denied
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check rules allow reads (writes are backend-only)

### Real-time sync not working
- Check Firebase config in `frontend/src/config/firebase.ts`
- Verify Firestore listeners are set up correctly
- Check browser console for errors

## Security Checklist

Before going live:
- [ ] Change CORS `allow_origins` from `*` to specific domains
- [ ] Review Firestore security rules
- [ ] Rotate service account keys regularly
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable Cloud Run authentication for sensitive endpoints
- [ ] Add rate limiting to API endpoints
- [ ] Review and test all error paths

## Performance Optimization

- [ ] Enable Firebase Hosting CDN (automatic)
- [ ] Compress images and assets
- [ ] Lazy load React components
- [ ] Add Firestore indexes for all queries
- [ ] Monitor Cloud Run cold starts
- [ ] Consider Cloud Run min instances for production

## Rollback Procedure

### Hosting Rollback
```bash
# List releases
firebase hosting:channel:list

# Rollback to previous
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID DEST_SITE_ID:live
```

### Backend Rollback
```bash
# List revisions
gcloud run revisions list --service smallbets-api --region us-central1

# Route traffic to previous revision
gcloud run services update-traffic smallbets-api \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## Next Steps

1. Complete automation engine (transcript ingestion)
2. Add admin control panel
3. Load test with simulated users
4. Set up monitoring and alerting
5. Create backup strategy for Firestore
6. Document runbook for Grammy Awards 2026 (Feb 2)

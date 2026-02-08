# BAZI AI Product

# Local test run

## Backend (FastAPI)
From the repo root:

### Windows (PowerShell)
1. Create and activate venv:
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

2. Install dependencies:
   pip install -r requirements.txt

3. Configure env (backend/.env):
   - Set AI provider (deepseek or azure)
   - Fill API keys

4. Start server:
   python .\main.py

### macOS/Linux
1. Create and activate venv:
   cd backend
   python -m venv .venv
   source .venv/bin/activate

2. Install dependencies:
   pip install -r requirements.txt

3. Configure env (backend/.env), then start:
   python main.py

Backend runs at http://localhost:8000

## Frontend (Vite + React)
From the repo root:

1. Install dependencies:
   npm install

2. Check frontend env (.env.local in repo root):
   VITE_API_URL=http://localhost:8000

3. Start dev server:
   npm run dev

Frontend runs at http://localhost:5173

## Admin / Premium Test Account

A premium admin account is automatically seeded on backend startup:

- **Email:** `admin@bazi.ai`
- **Password:** `admin123`

Sign in with these credentials to access all premium features (unlimited analyses, full forecast details, daily wisdom, etc.).
# BAZI AI Product

# Run the backend (FastAPI)
From the repo root:
1. Create/verify virtual environment (recommended):
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate  # on macOS/Linux

2. Install backend dependencies:
   pip install -r requirements.txt

3. Set backend environment variables (in backend/.env):
    Make sure this file exists and has at least:
    DEEPSEEK_API_KEY: your real key
    FRONTEND_URL: http://localhost:5173
    BACKEND_URL: http://localhost:8000
    Optional: APP_NAME, VERSION, DEBUG, MAX_TOKENS, etc.

4. Start the FastAPI server (pick one of these):
Using the built-in main script (simplest):
     cd backend
     python3 main.py



# Run the frontend (Vite + React)

1. Install Node dependencies (once):
From the repo root:
    cd "/Users/apple/Downloads/AI Development/bazi-ai-product"
    npm install

2. Check frontend env (.env.local in the repo root) - You already have:
   VITE_API_URL=http://localhost:8000
    That’s correct for talking to your local FastAPI backend on port 8000.

3. Start the Vite dev server:
   npm run dev
By default Vite will start on http://localhost:5173.

4. Open the app:
Go to http://localhost:5173 in your browser.
With the backend running on port 8000, the frontend should call the API using VITE_API_URL.
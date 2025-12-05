# BAZI AI Deployment: Complete Retrospective

## Executive Summary

We successfully deployed a **full-stack BAZI AI application** on Azure with:
- **Frontend**: React app on Azure Static Web Apps (HTTPS)
- **Backend**: FastAPI on Azure Container Apps (HTTPS)
- **Cost**: $0/month (free tier)
- **Architecture**: Serverless, auto-scaling

This document explains the entire journey, challenges, and solutions.

---

## 1. The Big Picture: What We Built

### Architecture Overview

```
User Browser (HTTPS)
    ↓
    ├─→ Azure Static Web Apps (Frontend: React)
    │       ├─→ Vite build tool
    │       ├─→ TailwindCSS styling
    │       └─→ Axios HTTP client
    │
    └─→ Azure Container Apps (Backend: FastAPI)
            ├─→ BAZI calculation engine
            ├─→ DeepSeek AI integration
            └─→ Streaming responses
```

### What Each Component Does

**Frontend (React)**
- User enters birth date, hour, gender
- Sends HTTP POST request to backend
- Displays BAZI chart (four pillars, elements)
- Shows AI-generated insights

**Backend (FastAPI)**
- Calculates BAZI chart (Chinese metaphysics algorithm)
- Calls DeepSeek AI API for insights
- Returns data as JSON or streaming responses
- Handles all business logic

---

## 2. The Process: Step-by-Step Deployment

### Phase 1: Local Development Setup

**What we did:**
```
1. Created backend folder with FastAPI code
2. Created frontend folder with React code
3. Both folders had their own dependencies (requirements.txt, package.json)
```

**Why this matters:**
- Separation of concerns: backend and frontend are independent
- Different languages: Python backend, JavaScript frontend
- Different deployment targets: one needs Docker, one needs npm build

### Phase 2: GitHub Repository Organization

**What we did:**
```
1. Pushed both backend/ and frontend/ to GitHub
2. Made sure .gitignore was correct
3. Added GitHub Actions workflow files
```

**Issue #1: Submodule Problem**
```
Error: "frontend" is registered as a git submodule but has no URL
Cause: frontend/ had its own .git folder
Solution: Removed frontend/.git and re-added as regular folder
```

**Why this happened:**
- When you clone a repo that has a subfolder with its own `.git`, Git treats it as a submodule
- Submodules need explicit URLs and special handling
- We wanted a simple, flat structure

### Phase 3: Frontend Deployment (Azure Static Web Apps)

**What we did:**
```
1. Created Azure Static Web App resource
2. Connected GitHub repo
3. Azure automatically runs:
   - npm install
   - npm run build (creates dist/ folder)
   - Deploys dist/ as static website
```

**Issue #2: Terser Missing**
```
Error: "terser not found. Since Vite v3, terser has become an optional dependency"
Cause: terser (code minifier) wasn't in package.json
Solution: npm install --save-dev terser
```

**Why this happened:**
- Vite v5 made terser optional to reduce dependencies
- Production builds need minification for smaller file size
- GitHub Actions runs in a clean environment, doesn't have dev tools

### Phase 4: Backend Deployment (Azure Container Instances → Container Apps)

**What we did:**
```
1. First tried: Azure Container Instances
   - Simple container hosting
   - Got IP address: 172.185.91.236:8000
   
2. Later migrated to: Azure Container Apps
   - Automatic HTTPS certificate
   - Better scalability
   - Final URL: bazi-api.whitemeadow-8d432442.westus.azurecontainerapps.io
```

**Why we migrated:**
- Container Instances = HTTP only (not HTTPS)
- Browser security blocks HTTP calls from HTTPS pages (Mixed Content)
- Container Apps = HTTPS built-in

---

## 3. Major Issues & Solutions

### Issue #3: Mixed Content Error
```
Error: "Mixed Content: The page at 'https://frontend' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://backend:8000'"

Why it happened:
- Frontend deployed on HTTPS (Azure Static Web Apps)
- Backend on HTTP (Container Instances)
- Modern browsers block this for security reasons
- Like visiting a bank website (HTTPS) that loads content from an unsecured server

Solutions attempted:
1. ❌ Try CORS proxy (cors-anywhere.herokuapp.com) - failed
2. ❌ Use Azure Static Web Apps routing - didn't work for external HTTP
3. ✅ Migrate backend to HTTPS (Azure Container Apps) - worked!
```

### Issue #4: 405 Method Not Allowed
```
Error: POST /api/bazi-chart returned 405

Why it happened:
- Frontend calling: /api/bazi-chart
- Backend defined: /api/bazi-chart
- But the path was wrong!

Root cause analysis:
- Frontend: apiClient.post('/bazi-chart', ...)
- Environment: VITE_API_URL = https://backend (WITHOUT /api)
- Result: /bazi-chart (frontend) + no base path = wrong endpoint
- Expected: /api/bazi-chart (with /api prefix)

Solution:
- Set VITE_API_URL = https://backend/api
- Now frontend + base = /bazi-chart + /api = /api/bazi-chart ✓
```

### Issue #5: CORS (Cross-Origin Resource Sharing)
```
Problem: Frontend domain ≠ Backend domain
- Frontend: salmon-flower-078964e1e.3.azurestaticapps.net
- Backend: bazi-api.whitemeadow-8d432442.westus.azurecontainerapps.io

Solution in backend/main.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Why needed:
- Browsers prevent cross-domain requests by default
- CORS headers tell browser "this backend accepts requests from any frontend"
- Without this, frontend gets 403 Forbidden
```

### Issue #6: Repository Structure Problems
```
Initial state:
- GitHub repo had frontend/ as a submodule
- Backend code wasn't in GitHub
- GitHub Actions workflows failed

Solution:
1. Removed .github/workflows/ old files
2. Let Azure regenerate workflow files
3. Made sure both backend/ and frontend/ were normal folders
4. Committed everything to main branch

Why this matters:
- GitHub Actions workflow files are auto-generated by Azure
- Old workflows had expired API tokens
- New workflows came with fresh credentials
```

---

## 4. Architecture Decisions & Why

### Why Azure?
```
✅ Free tier covers everything:
   - Static Web Apps: Free tier
   - Container Apps: Consumption-based (pay per request)
   - Total monthly cost: ~$0 (unless huge traffic)

✅ HTTPS out of the box
   - Both Static Web Apps and Container Apps get SSL certificates
   - No manual certificate management

✅ Integrated CI/CD
   - GitHub integration automatic
   - Rebuilds on every push
```

### Why These Services?

**Azure Static Web Apps (Frontend)**
- Purpose: Host static files (React built as index.html + JavaScript bundles)
- Why not App Service? Overkill for static files
- Why not Docker? Static Web Apps is simpler and cheaper
- Auto-rebuilds from GitHub automatically

**Azure Container Apps (Backend)**
- Purpose: Run Python FastAPI server with HTTPS
- Why not Container Instances? No native HTTPS support
- Why not App Service? Free tier no longer available; Container Apps cheaper
- Why Container Apps? Built-in HTTPS, auto-scaling, consumption-based pricing

**GitHub Actions (CI/CD)**
- Purpose: Automatically rebuild and deploy on every git push
- Trigger: Any commit to main branch
- Steps: 
  1. Checkout code
  2. Build (npm install + vite build for frontend; docker build for backend)
  3. Deploy to Azure

---

## 5. Key Technical Concepts

### What is CORS?
```
Scenario: Frontend at domain A wants to call API at domain B

Default behavior (browser security):
✗ Blocked - different origins

With CORS headers from domain B:
✓ Allowed - explicit permission granted

In our case:
- Frontend domain: salmon-flower-078964e1e.3.azurestaticapps.net
- Backend domain: bazi-api.whitemeadow-8d432442.westus.azurecontainerapps.io
- Backend sends: "Access-Control-Allow-Origin: *"
- Browser allows the request
```

### What is Mixed Content?
```
Scenario: User visits HTTPS website, but it loads HTTP content

Example:
- Website: https://bank.com (secure)
- Image: http://images.cdn.com/logo.png (not secure)

Browser blocks this because:
- HTTPS = encrypted, trusted connection
- HTTP = unencrypted, untrusted
- Mixing them = security hole

In our case:
- Frontend: https://frontend.azurestaticapps.net (HTTPS)
- Backend call: http://backend:8000 (HTTP)
- Browser: Blocked!

Solution: Make backend HTTPS too
- Backend: https://backend.azurecontainerapps.io (HTTPS)
- Browser: Allowed!
```

### What is Submodule?
```
Git submodule = Repository inside repository

How it works:
1. Main repo points to submodule repo at specific commit
2. When you clone main repo, submodule is not included
3. Must run: git submodule update --init

In our case:
- frontend/ had its own .git folder
- Git treated it as submodule
- GitHub Actions couldn't find the files
- Solution: Remove .git from frontend/, treat as normal folder
```

### What is Environment Variable?
```
Purpose: Store configuration without hardcoding it

Examples:
- DEEPSEEK_API_KEY: Sensitive key (shouldn't be in code)
- DEBUG: true for development, false for production
- VITE_API_URL: Points to different backend (local vs. production)

In our case:
VITE_API_URL = https://backend.azurecontainerapps.io/api

Why not hardcode it?
- Local development uses http://localhost:8000
- Production uses https://backend.azurecontainerapps.io
- Need same code to work in both environments
```

---

## 6. Deployment Pipeline: How It Works

### Every Time You Push to GitHub

```
1. You: git push origin main
   ↓
2. GitHub: Detects push to main branch
   ↓
3. GitHub Actions Workflow Triggers:
   
   For Frontend:
   a. Checkout code from GitHub
   b. Run: npm install (install dependencies)
   c. Run: npm run build (create dist/ folder)
   d. Deploy: Upload dist/ to Azure Static Web Apps
   e. Result: New version live at https://frontend.azurestaticapps.net
   
   For Backend:
   a. Checkout code from GitHub
   b. Build Docker image: docker build -t studylifelong/bazi-api:latest .
   c. Push to Docker Hub: docker push studylifelong/bazi-api:latest
   d. Azure Container Apps pulls new image
   e. Result: New version live at https://backend.azurecontainerapps.io

4. Total time: ~3-5 minutes
5. Zero downtime: Old containers keep running until new ones ready
```

---

## 7. What Each File Does

### Frontend Key Files

**`.env.production`**
```
VITE_API_URL=https://bazi-api.whitemeadow-8d432442.westus.azurecontainerapps.io/api

Purpose: Tells frontend where backend is located
Why separate from code: Can change endpoint without rebuilding
```

**`vite.config.js`**
```javascript
export default {
  build: {
    outDir: 'dist',           // Output folder for npm run build
    minify: 'terser'          // Minify JavaScript code
  }
}
```

**`src/api/client.js`**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
})

Purpose: Creates HTTP client that all requests use
Why centralized: Consistent headers, timeout, error handling
```

### Backend Key Files

**`backend/main.py`**
```python
@app.post("/api/bazi-chart")
async def get_bazi_chart(request: BaziAnalysisRequest):
    # Calculate BAZI chart
    # Return JSON response

Purpose: API endpoint that frontend calls
Path: /api/bazi-chart (must match frontend's expectation)
```

**`backend/Dockerfile`**
```
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

Purpose: Instructions to build Docker image
Why Docker: Can run anywhere (local, Azure, AWS, etc.)
```

### GitHub Actions Files

**`.github/workflows/azure-static-web-apps-*.yml`**
```yaml
- name: Build And Deploy
  uses: Azure/static-web-apps-deploy@v1
  
Purpose: Automatically deploy frontend on every push
Triggered by: Push to main branch
Time: ~2 minutes
```

---

## 8. Lessons Learned

### What Went Well ✅
1. **Infrastructure as Code**: Using Azure CLI meant we could recreate everything
2. **Free Tier Strategy**: Static Web Apps + Container Apps = $0
3. **GitHub Integration**: Automatic CI/CD without complex setup
4. **HTTPS by Default**: Modern security built-in

### What Was Challenging ❌
1. **HTTP vs HTTPS Mismatch**: Took long time to diagnose mixed content
2. **API Path Confusion**: Frontend + base URL + endpoint path alignment
3. **Submodule Problem**: Git submodules are finicky in CI/CD
4. **Environment Variables**: Different values for local vs production

### What to Do Differently Next Time
1. **From the start**: Plan HTTP vs HTTPS (use HTTPS from day 1)
2. **Path consistency**: Document API paths clearly
3. **Infrastructure docs**: Write down IP addresses, URLs, credentials
4. **Local testing**: Test with real URLs before deploying
5. **CORS early**: Enable CORS from the beginning if cross-origin

---

## 9. Current Production Setup

### Live URLs
```
Frontend: https://salmon-flower-078964e1e.3.azurestaticapps.net
Backend API: https://bazi-api.whitemeadow-8d432442.westus.azurecontainerapps.io/api

Examples:
- Health check: https://bazi-api.../api/health
- BAZI chart: POST to https://bazi-api.../api/bazi-chart
- Insights: POST to https://bazi-api.../api/analyze
```

### Configuration Summary
```
Frontend:
- VITE_API_URL = https://bazi-api.whitemeadow-8d432442.westus.azurecontainerapps.io/api
- CORS: All domains allowed (frontend calls from any domain)

Backend:
- allow_origins = ["*"] (accepts requests from any domain)
- DEEPSEEK_API_KEY = sk-9d8438b8ee52482da881fa9c1973f245
- DEEPSEEK_MODEL = deepseek-chat

CI/CD:
- Trigger: Push to main branch
- Frontend rebuild: ~2 minutes
- Backend rebuild: ~3 minutes
- Deployment: ~1 minute
- Total: ~3-5 minutes until live
```

---

## 10. Troubleshooting Guide for Future Issues

### Issue: Frontend shows blank page
```
Causes:
1. npm build failed (check GitHub Actions)
2. index.html not in dist/
3. Vite config wrong

Check:
- GitHub Actions > latest run > logs
- Look for "Build failed"
```

### Issue: Backend not responding
```
Causes:
1. Container crashed (check Azure portal)
2. API key invalid (DeepSeek)
3. Port not exposed

Check:
- az containerapp logs -n bazi-api --follow
- curl https://backend.../api/health
```

### Issue: Frontend can't reach backend
```
Causes:
1. Mixed content (HTTP vs HTTPS)
2. CORS not enabled
3. Wrong API URL in .env.production
4. Network firewall

Check:
- Browser console: F12 > Console
- Look for CORS error or network error
- Check .env.production URL
```

### Issue: 405 Method Not Allowed
```
Causes:
1. Wrong HTTP method (GET instead of POST)
2. Wrong endpoint path
3. Backend route not defined

Check:
- Frontend code: apiClient.post() or .get()?
- Backend: @app.post("/api/bazi-chart") correct?
- Full path: baseURL + endpoint should equal backend path
```

---

## 11. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
│              (Anywhere in the world)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS (encrypted)
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────┐          ┌──────────────────────┐
│  Frontend        │          │  Backend API         │
│ (React + Vite)   │          │  (FastAPI)           │
│                  │          │                      │
│ - Static files   │◄────────►│ - BAZI Calculator    │
│ - index.html     │   HTTP   │ - DeepSeek AI        │
│ - JavaScript     │  (JSON)  │ - Database logic     │
│ - CSS            │          │                      │
│                  │          │                      │
│ 370 KB total     │          │ Serverless (auto-    │
│ (minified)       │          │ scales)              │
└───────────────────┘          └──────────────────────┘
    │                                   │
    │ Deployment                        │ Deployment
    │ (GitHub + CLI)                    │ (Docker)
    │                                   │
    ▼                                   ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Azure Static         │      │ Azure Container      │
│ Web Apps             │      │ Apps (HTTPS)         │
│ (FREE tier)          │      │ (Consumption tier)   │
│ URL: *.azurestaticapps.net  │ URL: *.azurecontainerapps.io
└──────────────────────┘      └──────────────────────┘

        GitHub Repository (main branch)
        ↓
        ├─ frontend/ (React)
        ├─ backend/ (FastAPI)
        ├─ .github/workflows/ (CI/CD)
        └─ .env.production (config)
```

---

## 12. Total Cost Analysis

```
Monthly Costs:
- Azure Static Web Apps (FREE tier): $0
- Azure Container Apps (consumption): ~$0-5 (unless high traffic)
- GitHub Actions: Free for public repos
- Docker Hub: Free for public images
- DeepSeek API: Pay as you go (~$0.14 per 1M tokens)

Example monthly spend (100 users, 10 requests each):
- 1000 API calls × $0.001 per call ≈ $1
- Total: ~$1/month

This scales well:
- 10,000 calls: ~$10
- 100,000 calls: ~$100
- But auto-scales down when idle
```

---

## Summary: The Journey

**Dec 1 (Yesterday)**
- Started with broken GitHub repo structure
- GitHub Actions all failing
- Backend and frontend not communicating

**Dec 2 (Today)**
- Fixed GitHub repo structure (removed submodules)
- Deployed frontend to Azure Static Web Apps ✅
- Deployed backend to Container Instances (HTTP problem) ❌
- Diagnosed mixed content error (HTTPS + HTTP conflict) 🔍
- Migrated backend to Container Apps (HTTPS) ✅
- Fixed CORS configuration ✅
- Fixed API path configuration ✅
- **Result: Full end-to-end working deployment** 🎉

**Total time: ~6 hours**
**Cost: $0**
**Result: Production-ready BAZI AI application**

---

## What's Next?

To maintain and improve the deployment:

1. **Monitor**
   ```bash
   az containerapp logs -n bazi-api --follow
   az container logs -n bazi-api-container
   ```

2. **Update code**
   ```bash
   git commit -am "Your changes"
   git push origin main
   # Wait 3-5 minutes, site auto-updates
   ```

3. **Scale if needed**
   ```bash
   az containerapp update -n bazi-api --min-replicas 2 --max-replicas 10
   ```

4. **Add custom domain**
   ```bash
   # Point domain DNS to Azure
   # Configure SSL certificate
   ```

5. **Add monitoring/alerts**
   ```bash
   # Use Azure Monitor
   # Set up alerts for errors
   ```

This is a solid foundation for production! 🚀

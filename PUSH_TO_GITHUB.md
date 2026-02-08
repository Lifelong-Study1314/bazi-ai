# How to push your code to GitHub (bazi-ai)

Your repo: **https://github.com/Lifelong-Study1314/bazi-ai**

---

## Option A: Already staged (recommended)

The right files are already staged (source code + docs; no `.env`, no `node_modules`). Just run:

### 1. Open Terminal

- Mac: `Cmd + Space` → type **Terminal** → Enter.

### 2. Go to your project

```bash
cd "/Users/apple/Downloads/AI Development/bazi-ai-product-v2"
```

### 3. Commit

```bash
git commit -m "Security updates: CORS, JWT check, admin seed only for mock; Phase 4 guide; AI generator fix"
```

### 4. Push to GitHub

```bash
git push origin main
```

- **Login:** GitHub no longer accepts account password. Use your **GitHub username** and a **Personal Access Token**.  
  Create one: [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) → **Generate new token (classic)** → tick **repo** → Generate. Copy the token and paste it when Terminal asks for password.
- If it says branch doesn't exist: try `git push -u origin main`.

---

## Option B: Start from scratch (stage + commit + push)

If you haven’t staged yet or want to re-stage:

```bash
cd "/Users/apple/Downloads/AI Development/bazi-ai-product-v2"

git add .gitignore README.md DEPLOYMENT_GUIDE.md index.html package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js src backend/auth backend/ai_insights backend/bazi_engine backend/subscriptions backend/config.py backend/main.py backend/models.py backend/requirements.txt backend/.env.example

git commit -m "Security updates: CORS, JWT check, admin seed only for mock; Phase 4 guide; AI generator fix"

git push origin main
```

Do **not** add `backend/.env`, `.env.local`, or `frontend/node_modules` — they contain secrets or are huge.

---

## After the push

- **Render:** If auto-deploy is on, [Render](https://dashboard.render.com) will deploy. Otherwise open **bazi-ai-backend** and **bazi-ai-frontend** → **Manual Deploy**.
- **Secrets:** Never commit `backend/.env`. Use Render’s **Environment** tab for production.

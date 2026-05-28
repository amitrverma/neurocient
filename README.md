# Neurocient

This repository contains both deployable applications for Neurocient.

## Structure

- `frontend/` - Next.js frontend
- `backend/` - FastAPI backend

## Local Development

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The previous frontend README is now at `frontend/README.md`.

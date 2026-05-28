# Neurocient

This repository contains both deployable applications for Neurocient.

## Structure

- `frontend/` - Next.js frontend
- `backend/` - FastAPI backend

## Local Development

From the repo root, install dependencies:

```powershell
npm.cmd run install:frontend
npm.cmd run install:backend
```

Frontend:

```powershell
npm.cmd run dev:frontend
```

Backend:

```powershell
npm.cmd run dev:backend
```

To run both apps together:

```powershell
npm.cmd run dev
```

The frontend runs on `http://localhost:3000`.
The backend runs on `http://127.0.0.1:8000`.

The previous frontend README is now at `frontend/README.md`.

# Neurocient

This repository contains both deployable applications for Neurocient.

## Branch workflow

- `dev` is the integration branch for ongoing development.
- `main` is the release branch and should receive changes through a reviewed
  merge from `dev` when the release candidate is ready.
- Production deployments must use `main`, not a developer working tree or an
  unmerged `dev` revision.

## Structure

- `frontend/` - Next.js frontend
- `backend/` - FastAPI backend

## Local Development

Start the local PostgreSQL 17.4 database from the repository root:

```powershell
docker compose up -d postgres
docker compose ps
```

The development database is available at `127.0.0.1:5432`, with database and
user both named `neurocient`. Copy `backend/.env.example` to `backend/.env` for
the local connection settings, then add any optional integration credentials
needed for the feature you are developing. The Docker volume preserves local
data across container restarts.

Copy `frontend/.env.example` to `frontend/.env.local` so server-side Next.js
routes use the local backend at `http://127.0.0.1:8000`. Restart the frontend
development server after changing environment variables.

Apply schema migrations before starting the backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Application startup does not create or alter tables. Schema changes must be
captured in an Alembic revision and applied explicitly.

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

Deployment architecture, configuration, rollout, and rollback are documented in
`docs/deployment/README.md`.

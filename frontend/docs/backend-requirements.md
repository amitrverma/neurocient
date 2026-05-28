# Backend Requirements

This frontend expects the `caveman_backend` project to provide:

- **Authentication**
  - JWT-based auth endpoints (`/auth/register`, `/auth/login`, `/auth/me`).
  - Protect API routes and verify tokens.
- **Spots API**
  - `POST /spots` to save a spot for the authenticated user.
  - `GET /spots` to retrieve spots for the authenticated user.
- **Microchallenges API**
  - Endpoints to fetch available microchallenges.
  - Record per-user progress, e.g., `POST /microchallenges/:id/log`.
- **Reading Materials Repository**
  - Store books, articles and research papers with metadata linking them to relevant topics.
  - Expose endpoints to query these resources.
- **Admin Features**
  - Upload and manage articles, books and papers.
  - Create and manage microchallenges.
  - View user data without direct database access.

These services will support the frontend features added in this change.

# Neurocient deployment runbook

Status: the first monorepo backend image was deployed manually on 2026-09-20. The existing Vercel project still needs its Root Directory changed to `frontend` before the merged monorepo `main` is pushed.

## Deployment contract

- The Next.js app in `frontend/` is deployed to Vercel.
- The FastAPI app in `backend/` is built as a container and deployed to Azure Container Apps.
- A commit must pass frontend build/tests, backend tests, and the backend image build before it is a release candidate.
- Production secrets live in Vercel or Azure, never in Git or image layers.
- Backend production deployment is performed manually with authenticated Azure CLI and Docker commands.
- The operator must deploy from `main` with a clean, committed working tree.
- Backend images use the Git commit SHA, so an Azure revision can be identified and rolled back.
- The frontend reaches Azure only from server-side Next.js route handlers through `API_BASE_URL`.

## Branch and promotion model

- `dev` is the integration and development branch. Feature work is merged into `dev` and validated there.
- `main` is the production branch for both applications. Vercel deploys the frontend from `main`; Azure backend images are built manually from `main`.
- Promote a release by passing CI and preview checks on `dev`, then merging `dev` into `main`.
- Protect `main` from direct feature commits and require the `Monorepo CI` checks before promotion.
- The first monorepo backend image was built immediately before this branch policy was adopted. Its source commit is an ancestor of the promoted `main` history.

## What the legacy repositories actually did

- The currently public frontend is served by Vercel. The old frontend repository also contains an unrelated Azure Static Web Apps workflow from its earlier Create React App era; it is not applicable to the current Next.js app.
- The checked-in old backend workflow deployed a ZIP of Python source to an Azure Web App named `neurocientWA`. It did not build or deploy the Dockerfile, so it was not the production path used most recently.
- The actual manual backend release path built `Dockerfile`, pushed versioned images to `neurocient.azurecr.io/neurocient`, and updated the `neurocient` Azure Container App in the `Neurocient` resource group.
- The backend URL recorded in the legacy production frontend configuration no longer resolves. Do not copy it into Vercel.
- GitHub Actions secrets and environment approvals are repository-scoped. The credentials in `caveman-backend` do not automatically exist in this repository.

## Existing Azure production topology

Read-only inspection on 2026-09-20 confirmed:

- Subscription: `Azure subscription 1` (`8adbd7cc-2e93-4d83-b145-b9fe18c16138`)
- Resource group: `Neurocient`
- Registry: `neurocient.azurecr.io` (Basic ACR, Central India)
- Image repository: `neurocient`
- Container App: `neurocient`, in `managedEnvironment-Neurocient-a1ea`
- Public origin: `https://neurocient.whitehill-8e8f7233.centralindia.azurecontainerapps.io`
- Ingress: external HTTPS, target port `8000`, insecure HTTP disabled
- Scale: exactly one replica (`minReplicas=1`, `maxReplicas=1`)
- Previous healthy revision: `neurocient--0000010`, image tag `1.5`
- Current healthy revision: `neurocient--0000011`, image tag `ea2369bc41ea7fc11d258f081665bee19d5b8eff`
- Registry pulls: the Container Apps environment's system-assigned identity has `AcrPull`

The previous `1.5` image predates `/healthz`. The current monorepo image exposes that endpoint and it is part of the release smoke check.

## Deployment history

### 2026-09-20 — first monorepo backend deployment

- Source commit: `ea2369bc41ea7fc11d258f081665bee19d5b8eff`
- ACR digest: `sha256:4502e04ee7bcf719f5b09adfac728870cb82f7cf496ee9483fe76d68bec07249`
- Azure revision: `neurocient--0000011`
- Scheduler: explicitly enabled; scale retained at one replica
- Evidence: revision healthy with 100% traffic, `/healthz` returned `200`, and the database-backed `/challenges/all` route returned `200`

## Release order

1. In the existing Vercel project, change Root Directory to `frontend`, keep Production Branch as `main`, and configure the variables from `frontend/.env.example`. Set `API_BASE_URL` to the Azure Container App HTTPS origin.
2. Push `dev`. Confirm `Monorepo CI` passes and use its Vercel preview deployment for smoke testing.
3. Test sign-in, session refresh, a database-backed read, and one reversible write with synthetic data on the preview URL.
4. Merge `dev` into `main` and push `main`. Vercel will deploy the production frontend from that push.
5. For subsequent backend releases, build and deploy only a clean, verified commit reachable from `main` using the manual procedure below.
6. Verify the production frontend, backend `/healthz`, startup logs, database connectivity, and a read-only API path after each promotion.

## Vercel project settings

- Repository: `amitrverma/neurocient`
- Root Directory: `frontend`
- Framework Preset: Next.js
- Install Command: default (`npm install`/`npm ci` as selected by Vercel)
- Build Command: `npm run build`
- Output Directory: Next.js default
- Production Branch: `main`

Set the variables in `frontend/.env.example` for Production and Preview as appropriate. `API_BASE_URL` is server-only and must be the Azure backend origin without a trailing slash. Values prefixed with `NEXT_PUBLIC_` are embedded into browser assets and must not contain secrets.

Vercel's current monorepo guidance requires selecting the application directory as the project Root Directory: https://vercel.com/docs/monorepos

## Manual Azure Container Apps deployment

Run these commands from the repository root in PowerShell. The clean-tree check ensures the image tag identifies its exact source.

```powershell
git switch main
git diff --quiet
git diff --cached --quiet

$imageTag = git rev-parse HEAD
$image = "neurocient.azurecr.io/neurocient:$imageTag"

az login --use-device-code
az account set --subscription 8adbd7cc-2e93-4d83-b145-b9fe18c16138
az acr login --name neurocient

docker build --file backend/Dockerfile --tag $image backend
docker push $image

az containerapp update `
  --name neurocient `
  --resource-group Neurocient `
  --image $image `
  --set-env-vars ENABLE_SCHEDULER=true
```

This update changes only the image and the explicit scheduler setting. It preserves ingress, scale, registry identity, and all other environment values. Do not reuse mutable version tags such as `1.6`; the commit SHA is the release identity.

After the update, verify the deployed revision and health endpoint:

```powershell
az containerapp revision list `
  --name neurocient `
  --resource-group Neurocient `
  --query "[?properties.active].{name:name,image:properties.template.containers[0].image,health:properties.healthState,traffic:properties.trafficWeight}" `
  --output table

$fqdn = az containerapp show `
  --name neurocient `
  --resource-group Neurocient `
  --query properties.configuration.ingress.fqdn `
  --output tsv

Invoke-RestMethod "https://$fqdn/healthz"
```

Configure the application values from `backend/.env.example` as Container App secrets/environment variables. At minimum, production startup requires `ENV=prod`, `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, and valid Firebase credentials. Provider features additionally require their corresponding VAPID, PostHog, Resend, Azure Storage, or Twilio settings.

The live app currently has twelve settings stored as literal environment values, including database, JWT, OpenAI, Firebase, and Twilio credentials. Before broadening deployment access, move every sensitive value to an Azure Container App secret and make the corresponding environment entry a `secretref:`. Do not copy the values into GitHub variables or workflow YAML. Image-only manual deployments preserve those references after the migration.

## Scheduler constraint

The API currently embeds APScheduler. `ENABLE_SCHEDULER` therefore defaults to `false`.

The legacy production image always started this scheduler, and the existing Container App is constrained to exactly one replica. To preserve scheduled reminder behavior during the migration, explicitly add `ENABLE_SCHEDULER=true` to the Container App before deploying the monorepo image. Leaving it absent or setting it to `false` is a conscious decision to pause those reminders.

For the first release, either:

- set it to `true` and retain the current always-running single replica (`minReplicas=1`, `maxReplicas=1`); or
- keep it `false` and accept that scheduled reminders are paused.

Do not enable it on a scaling web tier: each replica would run the same schedules and could duplicate external messages. The durable target is a separate scheduled worker or Azure Container Apps Job.

## Verification

Local release checks:

```powershell
npm.cmd run test:frontend
npm.cmd run build:frontend
npm.cmd run test:backend
docker build -f backend/Dockerfile -t neurocient-backend:local backend
```

Production-shaped smoke checks must not send real notifications:

- `GET /healthz` returns `200 {"status":"ok"}`.
- Container startup logs show successful database initialization and no missing configuration.
- The Vercel deployment can reach the backend through `API_BASE_URL`.
- Login creates cookies on the Vercel hostname and `/api/auth/me` recognizes them.
- A synthetic account can complete one representative database-backed journey.

## Rollback

- Azure: direct traffic back to the previous healthy Container App revision. Because images are tagged by commit SHA, confirm the image before changing traffic.
- Vercel: promote the previously verified deployment or move the domain back to the prior project.
- Database: the application still uses SQLAlchemy `create_all()` and has no migration/rollback system. Do not ship destructive schema changes in this release path.

## Known residual risks before broad production traffic

- Database schema evolution is not managed by Alembic; `create_all()` only creates missing tables and cannot safely evolve existing columns or constraints.
- The Twilio webhook does not yet verify Twilio request signatures.
- Direct Python dependencies are pinned, but transitive dependencies do not yet have a hash-locked requirements file.
- The backend has no production-shaped integration suite using a real PostgreSQL database or provider sandboxes.
- Health proves process availability, not database or provider readiness.

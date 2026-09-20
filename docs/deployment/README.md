# Neurocient deployment runbook

Status: deployment-ready repository work in progress. No deployment has been triggered from the monorepo yet.

## Deployment contract

- The Next.js app in `frontend/` is deployed to Vercel.
- The FastAPI app in `backend/` is built as a container and deployed to Azure Container Apps.
- A commit must pass frontend build/tests, backend tests, and the backend image build before it is a release candidate.
- Production secrets live in Vercel or Azure, never in Git or image layers.
- Backend production deployment is performed manually with authenticated Azure CLI and Docker commands.
- The operator must deploy from `monorepo-clean` with a clean, committed working tree.
- Backend images use the Git commit SHA, so an Azure revision can be identified and rolled back.
- The frontend reaches Azure only from server-side Next.js route handlers through `API_BASE_URL`.

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
- Current healthy revision: `neurocient--0000010`, image tag `1.5`
- Registry pulls: the Container Apps environment's system-assigned identity has `AcrPull`

The current `1.5` image predates `/healthz`, so that path returns `404` until the first monorepo image is deployed. Before migration, use Azure's healthy-revision status and a known read-only API route rather than `/healthz` as the smoke signal.

## Release order

1. Push `monorepo-clean` so GitHub and Vercel can see the current commits. Do not trigger production yet.
2. Use the existing `neurocient` Azure Container App and `neurocient` registry described above. Do not create replacement Azure resources for this migration.
3. Migrate sensitive runtime values to Container App secrets as described below. Preserve ingress on target port `8000`; add an HTTP health probe for `/healthz` with the first monorepo image or immediately afterward.
4. Run `Monorepo CI` on `monorepo-clean`, or run all local release checks below before a manual release.
5. Follow the manual Azure CLI procedure below. Verify `/healthz`, startup logs, database connectivity, and a read-only API path.
6. Create a separate Vercel project for the monorepo migration, with Root Directory set to `frontend` and Production Branch set to `monorepo-clean`. Copy the environment variables from the current project, changing `API_BASE_URL` to the new Azure HTTPS origin.
7. Deploy and smoke-test the Vercel project using a preview/test domain. Test sign-in, session refresh, a database-backed read, and one reversible write with synthetic data.
8. Move the Neurocient domains to the new Vercel project only after the smoke checks pass. Keep the old Vercel deployment available for rollback.

Using a separate Vercel project avoids changing the current project's root directory while its production branch still expects the Next.js application at the repository root.

## Vercel project settings

- Repository: `amitrverma/neurocient`
- Root Directory: `frontend`
- Framework Preset: Next.js
- Install Command: default (`npm install`/`npm ci` as selected by Vercel)
- Build Command: `npm run build`
- Output Directory: Next.js default
- Production Branch for the migration: `monorepo-clean`

Set the variables in `frontend/.env.example` for Production and Preview as appropriate. `API_BASE_URL` is server-only and must be the Azure backend origin without a trailing slash. Values prefixed with `NEXT_PUBLIC_` are embedded into browser assets and must not contain secrets.

Vercel's current monorepo guidance requires selecting the application directory as the project Root Directory: https://vercel.com/docs/monorepos

## Manual Azure Container Apps deployment

Run these commands from the repository root in PowerShell. The clean-tree check ensures the image tag identifies its exact source.

```powershell
git switch monorepo-clean
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

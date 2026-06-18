# TB81TUBE Render Deployment Guide

Use this guide to deploy the TB81TUBE backend to Render with a hosted PostgreSQL database.

## A) Push Project To GitHub

Render deploys from a Git repository.

1. Push the TB81TUBE project to GitHub.
2. Confirm `apps/backend/.env` is not committed.
3. Confirm production secrets are not committed anywhere.

## B) Create PostgreSQL Database

Create a PostgreSQL database with one of these providers:

- Render PostgreSQL
- Neon
- Supabase
- Railway PostgreSQL

Copy the PostgreSQL connection string. This becomes `DATABASE_URL` in Render.

## Required: DATABASE_URL On Render

`DATABASE_URL` is required on Render. The backend cannot start without a hosted PostgreSQL connection string.

Do not use the local Docker database URL on Render:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public
```

On Render, `localhost` means the Render container itself. It does not point to your computer, and it does not point to your local Docker PostgreSQL.

Use hosted PostgreSQL from one of these providers:

- Render PostgreSQL
- Neon
- Supabase
- Railway

Hosted PostgreSQL URL example:

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

Add this value in Render:

```text
Service -> Environment -> Add Environment Variable -> DATABASE_URL
```

## C) Create Render Web Service

1. Open Render Dashboard.
2. Create a new Web Service.
3. Connect your GitHub repository.
4. Select the branch that contains the full TB81TUBE project:
   ```text
   TB81TUBE
   ```
5. Leave Root Directory empty. Do not set it to `src` or `apps/backend`.
6. Use runtime:
   ```text
   Node
   ```

## D) Commands

Required Render settings:

```text
Branch: TB81TUBE
Root Directory: leave empty
```

Build command:

```bash
npm install && npm run db:generate -w @tb81tube/backend && npm run build -w @tb81tube/backend
```

Start command:

```bash
npm run db:migrate:deploy -w @tb81tube/backend && npm run start -w @tb81tube/backend
```

Health check path:

```text
/health
```

The root `render.yaml` contains the same backend service configuration. It does not set `rootDir`, so Render should use the repository root where `package.json` exists.

Prisma Client must be generated before TypeScript builds. Otherwise `@prisma/client` enum/type exports such as `Platform`, `ContentType`, `PlaybackType`, and `ConnectedAccount` may be missing during `tsc`.

## E) Environment Variables

Add these in Render environment settings. Do not put production secrets in `apps/backend/.env` or commit them to Git.

```env
NODE_ENV=production
NODE_VERSION=20.11.1
PORT=4000
DATABASE_URL=hosted_postgres_url
JWT_SECRET=strong_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
DEV_MOCK_YOUTUBE_AUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-render-backend-url.onrender.com/api/v1/connections/youtube/callback
FRONTEND_URL=https://your-render-backend-url.onrender.com
```

Security reminders:

- Use Node LTS 20 on Render. Node 24 can cause dependency/tooling compatibility issues.
- Use a strong random `JWT_SECRET`.
- `DEV_MOCK_YOUTUBE_AUTH=false` in production.
- Never expose `GOOGLE_CLIENT_SECRET` to mobile or frontend code.
- Set `CORS_ORIGIN` carefully to only trusted origins before public launch. `*` is acceptable only for short internal deployment testing.
- Use official platform APIs only.

## F) Deploy

1. Click Deploy in Render.
2. Wait for dependencies to install.
3. Confirm backend build completes.
4. Confirm Prisma Client generation runs before TypeScript build.
5. Confirm Prisma migration deploy runs during start.
6. Confirm the web service becomes healthy.

## G) Test Render Deployment

Replace the URL with your Render backend URL.

```text
https://your-backend-url.onrender.com/health
```

Expected result:

```json
{
  "success": true,
  "message": "TB81TUBE backend is running"
}
```

## Troubleshooting

### Render Cannot Read package.json

If Render shows:

```text
npm error enoent Could not read package.json
path /opt/render/project/src/package.json
```

Check:

- Render selected branch must be `TB81TUBE`.
- Root Directory must be empty.
- `package.json` must exist at the repository root.
- Do not set Root Directory to `src`.
- Do not set Root Directory to `apps/backend` when using workspace commands.
- Build command must run from the repository root:
  ```bash
  npm install && npm run db:generate -w @tb81tube/backend && npm run build -w @tb81tube/backend
  ```
- Start command must run from the repository root:
  ```bash
  npm run db:migrate:deploy -w @tb81tube/backend && npm run start -w @tb81tube/backend
  ```

### Prisma Client Types Missing During Build

If Render shows:

```text
@prisma/client has no exported member 'Platform'
@prisma/client has no exported member 'ContentType'
@prisma/client has no exported member 'PlaybackType'
@prisma/client has no exported member 'ConnectedAccount'
Property 'PrismaClientKnownRequestError' does not exist on type 'typeof Prisma'
```

It means Prisma Client was not generated before TypeScript build.

Fix the Render build command by adding Prisma generate before build:

```bash
npm install && npm run db:generate -w @tb81tube/backend && npm run build -w @tb81tube/backend
```

Also keep this Render environment variable:

```env
NODE_VERSION=20.11.1
```

### DATABASE_URL Empty On Render

If Render startup shows:

```text
Prisma P1012
The environment variable DATABASE_URL resolved to an empty string.
```

Fix:

1. Open the Render Web Service.
2. Go to the Environment tab.
3. Add `DATABASE_URL`.
4. Paste a hosted PostgreSQL URL, for example:
   ```env
   postgresql://username:password@host/database?sslmode=require
   ```
5. Save changes.
6. Redeploy the service.

Do not use your local Docker PostgreSQL URL on Render.

### Local Windows Prisma Generate EPERM

If local `npm.cmd run db:generate -w @tb81tube/backend` shows:

```text
EPERM: operation not permitted, rename ... query_engine-windows.dll.node
```

Stop any running backend dev server, close terminals using the app, then run Prisma generate again. On Windows, the Prisma query engine DLL can be locked by a running Node process or antivirus while Prisma tries to replace it.

Test API status:

```text
https://your-backend-url.onrender.com/api/v1/status
```

Expected result:

```json
{
  "success": true,
  "message": "API v1 is active"
}
```

## H) Mobile App API URL

For APK or external testing, point the mobile app to Render:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com/api/v1
```

Rebuild or restart the mobile app after changing the API URL.

## I) Google OAuth Callback

When using real YouTube OAuth, the Google Cloud authorized redirect URI must exactly match:

```text
https://your-backend-domain.com/api/v1/connections/youtube/callback
```

Set the same value in Render:

```env
GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/v1/connections/youtube/callback
```

## J) What Not To Do

- Do not commit `apps/backend/.env`.
- Do not enable mock YouTube mode in production.
- Do not expose `GOOGLE_CLIENT_SECRET` in the mobile app.
- Do not scrape platforms.
- Do not download, extract, proxy, or rehost YouTube video/audio.

# TB81TUBE Backend Deployment Guide

This guide prepares the TB81TUBE backend for deployment on Render, Railway, Fly.io, a VPS, or similar Node.js hosting.

The backend must be deployed with a reachable PostgreSQL database and production environment variables. The mobile app should call this hosted backend for authentication, connected account APIs, search, playlists, favorites, history, and playback info.

## Production Requirements

- Node.js runtime, preferably Node LTS 20 or 22.
- PostgreSQL database.
- Environment variables configured on the hosting platform.
- Prisma migrations applied before the server starts.
- Production start command.
- Health check URL: `GET /health`.

## Production Environment Checklist

Set these variables in the hosting platform:

```env
PORT=4000
NODE_ENV=production
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="use_a_long_random_secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://your-mobile-web-or-admin-origin.com"
GOOGLE_CLIENT_ID="your_web_oauth_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
GOOGLE_REDIRECT_URI="https://your-api-domain.com/api/v1/connections/youtube/callback"
FRONTEND_URL="https://your-frontend-or-deep-link-target.com"
DEV_MOCK_YOUTUBE_AUTH=false
```

Important:

- `DEV_MOCK_YOUTUBE_AUTH` must be `false` in production.
- If `NODE_ENV=production` and `DEV_MOCK_YOUTUBE_AUTH=true`, the backend refuses to start.
- Keep Google client secret only on the backend.
- Never commit real `.env` files.

## Build And Start Commands

Install dependencies:

```powershell
npm install
```

Apply production migrations:

```powershell
npm run db:migrate:deploy -w @tb81tube/backend
```

Build backend:

```powershell
npm run build -w @tb81tube/backend
```

Start backend:

```powershell
npm run start -w @tb81tube/backend
```

Hosting platforms usually separate these into build and start commands:

- Build command: `npm install && npm run db:migrate:deploy -w @tb81tube/backend && npm run build -w @tb81tube/backend`
- Start command: `npm run start -w @tb81tube/backend`

## Render

Recommended Render setup:

1. Create a PostgreSQL database on Render.
2. Create a Web Service connected to the TB81TUBE repository.
3. Set root directory to the repository root.
4. Add all production environment variables.
5. Use build command:
   ```bash
   npm install && npm run db:migrate:deploy -w @tb81tube/backend && npm run build -w @tb81tube/backend
   ```
6. Use start command:
   ```bash
   npm run start -w @tb81tube/backend
   ```
7. Set health check path:
   ```text
   /health
   ```

After deployment, test:

```text
https://your-render-service.onrender.com/health
```

## Railway

Recommended Railway setup:

1. Create a Railway project.
2. Add a PostgreSQL service.
3. Add the backend service from the repository.
4. Set production environment variables, including Railway's PostgreSQL `DATABASE_URL`.
5. Use build command:
   ```bash
   npm install && npm run db:migrate:deploy -w @tb81tube/backend && npm run build -w @tb81tube/backend
   ```
6. Use start command:
   ```bash
   npm run start -w @tb81tube/backend
   ```
7. Test:
   ```text
   https://your-railway-domain/health
   ```

## Fly.io

Fly.io can run the backend as a Node service. A Dockerfile or Fly launch configuration can be added later when Fly deployment is chosen.

Minimum requirements:

- PostgreSQL connection string in `DATABASE_URL`.
- Production environment variables set with Fly secrets.
- Build step runs Prisma deploy migrations and TypeScript build.
- Start step runs `npm run start -w @tb81tube/backend`.

## VPS / Manual Node Hosting

On a VPS:

1. Install Node.js LTS 20 or 22.
2. Install PostgreSQL or use managed PostgreSQL.
3. Clone the repository.
4. Create `apps/backend/.env` with production values.
5. Install dependencies:
   ```bash
   npm install
   ```
6. Apply migrations:
   ```bash
   npm run db:migrate:deploy -w @tb81tube/backend
   ```
7. Build:
   ```bash
   npm run build -w @tb81tube/backend
   ```
8. Start:
   ```bash
   npm run start -w @tb81tube/backend
   ```

For a long-running process, use a process manager such as `pm2` or a systemd service.

Example PM2 command:

```bash
pm2 start "npm run start -w @tb81tube/backend" --name tb81tube-backend
```

## Mobile App Production API URL

For APK or external testing, set the mobile app API URL to the hosted backend:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
```

An installed APK on a phone cannot use `localhost` unless the backend is running on that same phone, which it is not.

## Google OAuth Production Notes

For real YouTube login:

- Create a Web Application OAuth Client ID.
- Add the hosted callback URL:
  ```text
  https://your-api-domain.com/api/v1/connections/youtube/callback
  ```
- Set `GOOGLE_REDIRECT_URI` to that exact URL.
- Restart/redeploy the backend after changing env variables.

## Deployment Smoke Test

After deployment:

1. Open `/health`.
2. Open `/api/v1/status`.
3. Register a test user.
4. Login.
5. Confirm protected `/api/v1/auth/me` works.
6. Confirm `DEV_MOCK_YOUTUBE_AUTH=false` in production.
7. Test real YouTube OAuth only after Google credentials are configured.

## Local Development Remains The Same

Local commands still work:

```powershell
npm.cmd run dev:backend
npm.cmd run dev:mobile
npm.cmd run typecheck
npm.cmd run db:check
```

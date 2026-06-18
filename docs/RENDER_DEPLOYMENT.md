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

## C) Create Render Web Service

1. Open Render Dashboard.
2. Create a new Web Service.
3. Connect your GitHub repository.
4. Set the root directory to:
   ```text
   .
   ```
5. Use runtime:
   ```text
   Node
   ```

## D) Commands

Build command:

```bash
npm install && npm run build -w @tb81tube/backend
```

Start command:

```bash
npm run db:migrate:deploy -w @tb81tube/backend && npm run start -w @tb81tube/backend
```

Health check path:

```text
/health
```

The root `render.yaml` contains the same backend service configuration.

## E) Environment Variables

Add these in Render environment settings. Do not put production secrets in `apps/backend/.env` or commit them to Git.

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=your_render_or_neon_postgres_url
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-mobile-or-web-origin.com
DEV_MOCK_YOUTUBE_AUTH=false
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/v1/connections/youtube/callback
FRONTEND_URL=https://your-frontend-or-app-redirect-url.com
```

Security reminders:

- Use a strong random `JWT_SECRET`.
- `DEV_MOCK_YOUTUBE_AUTH=false` in production.
- Never expose `GOOGLE_CLIENT_SECRET` to mobile or frontend code.
- Set `CORS_ORIGIN` carefully to only trusted origins.
- Use official platform APIs only.

## F) Deploy

1. Click Deploy in Render.
2. Wait for dependencies to install.
3. Confirm backend build completes.
4. Confirm Prisma migration deploy runs during start.
5. Confirm the web service becomes healthy.

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

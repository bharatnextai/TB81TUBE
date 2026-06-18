# TB81TUBE Backend

Node.js Express TypeScript backend for TB81TUBE.

This stage includes the full Prisma database schema, backend authentication routes, and YouTube account connection using official Google OAuth.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- dotenv
- cors
- helmet
- morgan
- zod
- jsonwebtoken
- bcrypt

## Environment Setup

Copy the example env file:

```powershell
copy apps\backend\.env.example apps\backend\.env
```

Set `DATABASE_URL` in `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public"
```

For local development, the full `apps/backend/.env` can look like this:

```env
PORT=4000
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public"
JWT_SECRET="tb81tube_super_secret_development_key_change_later"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:8081,http://localhost:19006,http://localhost:4000"
GOOGLE_CLIENT_ID="your_web_oauth_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/v1/connections/youtube/callback"
FRONTEND_URL="http://localhost:8081"
DEV_MOCK_YOUTUBE_AUTH=false
```

Make sure PostgreSQL is running and the database exists before running migrations.

## Database Setup Options

TB81TUBE uses PostgreSQL for development and production. Choose one of these options, then run Prisma migration.

## Quick MVP Local Run

For local MVP testing with mock YouTube enabled:

1. Start PostgreSQL:
   ```powershell
   docker compose up -d postgres
   ```
2. Generate Prisma Client:
   ```powershell
   npm.cmd run db:generate -w @tb81tube/backend
   ```
3. Apply migrations:
   ```powershell
   npm.cmd run db:migrate -w @tb81tube/backend
   ```
4. Check database:
   ```powershell
   npm.cmd run db:check -w @tb81tube/backend
   ```
5. Set mock YouTube mode in `apps/backend/.env`:
   ```env
   DEV_MOCK_YOUTUBE_AUTH=true
   ```
6. Start backend:
   ```powershell
   npm.cmd run dev:backend
   ```

Real Google OAuth setup is documented in `docs/GOOGLE_OAUTH_SETUP.md`.

### Option A: Docker PostgreSQL

Use this if Docker Desktop can access Docker Hub. The root `docker-compose.yml` starts a local database matching the default `DATABASE_URL`.

```powershell
docker compose up -d postgres
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
```

Useful Docker database commands from the project root:

```powershell
npm.cmd run db:up
npm.cmd run db:logs
npm.cmd run db:down
```

### Option B: Local PostgreSQL Installed on Windows

Use this if Docker cannot pull images or you prefer a normal Windows PostgreSQL install.

1. Install PostgreSQL locally from the official PostgreSQL installer.
2. Use username `postgres`.
3. Use password `postgres`.
4. Create a database named `tb81tube`.
5. Set this in `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public"
```

6. Run Prisma:

```powershell
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
```

### Option C: Cloud PostgreSQL

Use this if local Docker or local PostgreSQL is blocked. Good development options include:

- Supabase
- Neon
- Railway
- Render PostgreSQL

Create a PostgreSQL database with one of those providers, copy its PostgreSQL connection string, and set it in `apps/backend/.env`:

```env
DATABASE_URL="your_cloud_postgresql_connection_string"
```

Then run Prisma:

```powershell
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
```

### Check Database Connection

After choosing any option, verify the backend can reach PostgreSQL:

```powershell
npm.cmd run db:check -w @tb81tube/backend
```

## Database Troubleshooting

If registration or login fails with this Prisma error:

```text
Can't reach database server at `localhost:5432`
```

Start PostgreSQL and apply migrations:

```powershell
docker compose up -d postgres
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run db:check -w @tb81tube/backend
```

Then restart the backend dev server.

### Docker Cannot Pull PostgreSQL

If Docker fails with this error:

```text
lookup registry-1.docker.io: no such host
```

Docker cannot resolve or reach Docker Hub. Common causes:

- Internet or DNS issue.
- Docker Desktop cannot access Docker Hub.
- Proxy, VPN, or firewall issue.
- Docker Desktop proxy is not configured.
- DNS is blocked by the current network.

Suggested checks:

```powershell
nslookup registry-1.docker.io
docker pull hello-world
docker pull postgres:16
```

Suggested fixes:

- Restart Docker Desktop.
- Restart your internet connection or router.
- Try a different network or mobile hotspot.
- Disable the VPN, or configure Docker Desktop to use the VPN/proxy correctly.
- Configure Docker Desktop proxy settings if you are on an office or college proxy.
- Try Docker again later if Docker Hub or DNS is temporarily unavailable.
- Use local PostgreSQL or cloud PostgreSQL if Docker Hub is blocked on your network.

## Google OAuth Setup

To connect YouTube accounts, create OAuth credentials in Google Cloud:

Full step-by-step setup guide:

```text
docs/GOOGLE_OAUTH_SETUP.md
```

1. Open Google Cloud Console.
2. Create or select a project.
3. Enable the YouTube Data API v3.
4. Configure the OAuth consent screen.
5. Create OAuth Client ID credentials for a web application.
6. Add this authorized redirect URI:

```text
http://localhost:4000/api/v1/connections/youtube/callback
```

7. Copy the client id and client secret into the real backend environment file:

```text
apps/backend/.env
```

Do not put credentials only in `.env.example`.

```env
GOOGLE_CLIENT_ID="your_real_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_real_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/v1/connections/youtube/callback"
FRONTEND_URL="http://localhost:8081"
```

`GOOGLE_CLIENT_ID` is not the same as `GOOGLE_CLIENT_SECRET`. The Client ID usually ends with `.apps.googleusercontent.com`. Never paste the Client Secret into `GOOGLE_CLIENT_ID`.

After saving `.env`, stop and restart the backend:

```text
Ctrl+C
```

```powershell
npm.cmd run dev -w @tb81tube/backend
```

The OAuth flow uses these official Google scopes:

- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

If YouTube OAuth fails:

- Confirm `apps/backend/.env` exists.
- Confirm `GOOGLE_CLIENT_ID` is not empty.
- Confirm `GOOGLE_CLIENT_ID` ends with `.apps.googleusercontent.com`.
- Confirm `GOOGLE_CLIENT_SECRET` is not empty.
- Confirm `GOOGLE_CLIENT_SECRET` is in the correct field.
- Confirm the Google credential type is **Web application**.
- Confirm there are no extra spaces before variable names.
- Confirm values are wrapped in quotes.
- Check the redirect URI in Google Cloud Console.
- Required redirect URI: `http://localhost:4000/api/v1/connections/youtube/callback`.
- Restart the backend after changing `.env`.
- Make sure the user is logged in before connecting YouTube.
- Run `GET http://localhost:4000/api/v1/status/config` and check the Google OAuth booleans.

If Google shows `Client missing a project id` or `Error 401: invalid_client`, the Client ID is usually incomplete, pasted into the wrong field, or not a Web Application OAuth Client ID.

### Development Mock YouTube Connection

To continue app development without Google OAuth credentials, set this in `apps/backend/.env`:

```env
DEV_MOCK_YOUTUBE_AUTH=true
```

Then restart the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

This lets the mobile `Continue with Google` button mark YouTube as connected for development only. In development, YouTube search/channel/playlist routes can return mock data so mobile flows can be tested.

Warning: mock mode does not fetch real YouTube account data. Real YouTube features require Google OAuth credentials.

## Prisma Commands

Generate Prisma Client:

```bash
npm run db:generate -w @tb81tube/backend
```

Create and run a migration:

```bash
npm run db:migrate -w @tb81tube/backend -- --name init_mvp_schema
```

Push schema directly without creating a migration, useful for quick local prototyping:

```bash
npm run db:push -w @tb81tube/backend
```

Open Prisma Studio:

```bash
npm run db:studio -w @tb81tube/backend
```

## Backend Commands

Before testing mobile register/login, make sure PostgreSQL is running and reachable:

```powershell
docker compose up -d postgres
npm.cmd run db:check -w @tb81tube/backend
```

Then start the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

Typecheck:

```bash
npm run typecheck -w @tb81tube/backend
```

Start development server:

```bash
npm run dev -w @tb81tube/backend
```

## Mobile Connection Troubleshooting

If the mobile web app shows `Network Error` during register or login:

1. Open this URL in your browser:

```text
http://localhost:4000/api/v1/status
```

2. Check that the backend terminal is still running.
3. Check PostgreSQL is running:

```powershell
docker compose up -d postgres
npm.cmd run db:check -w @tb81tube/backend
```

4. Check `apps/mobile/.env` contains:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

5. Restart Expo after changing `.env`.
6. For Expo Go on a physical phone, use your computer LAN IP instead of `localhost`.

Build:

```bash
npm run build -w @tb81tube/backend
```

## Auth Testing

Before testing authentication, make sure PostgreSQL is running, `DATABASE_URL` is set in `apps/backend/.env`, and Prisma migrations have been applied.

Run the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

Manual API testing steps are documented in:

```text
docs/API_TESTING.md
```

Run the auth smoke test:

```powershell
npm.cmd run test:auth -w @tb81tube/backend
```

The smoke test registers a unique test user, logs in, calls `/api/v1/auth/me`, and prints a clear pass or failure message.

## Active Routes

Root route:

```text
GET /
```

Response:

```json
{
  "success": true,
  "message": "Welcome to TB81TUBE API"
}
```

Health route:

```text
GET /health
```

Response:

```json
{
  "success": true,
  "message": "TB81TUBE backend is running"
}
```

API status route:

```text
GET /api/v1/status
```

Response:

```json
{
  "success": true,
  "message": "API v1 is active"
}
```

## Auth API

Register a user:

```text
POST /api/v1/auth/register
```

Request body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Login:

```text
POST /api/v1/auth/login
```

Request body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Get current logged-in user:

```text
GET /api/v1/auth/me
```

Header:

```text
Authorization: Bearer your_jwt_token
```

## Connected Accounts API

List connected accounts:

```text
GET /api/v1/connections
```

Header:

```text
Authorization: Bearer your_jwt_token
```

Start YouTube OAuth:

```text
GET /api/v1/connections/youtube/start
```

Header:

```text
Authorization: Bearer your_jwt_token
```

The response contains a Google OAuth URL. Open it in a browser, complete Google login, and Google will redirect to:

```text
GET /api/v1/connections/youtube/callback
```

Disconnect a connected account:

```text
DELETE /api/v1/connections/:id
```

Header:

```text
Authorization: Bearer your_jwt_token
```

OAuth tokens are stored for development only. Tokens are never returned in API responses, and they should be encrypted before production release.

## YouTube Data API

These routes use the logged-in user's connected YouTube account and official YouTube Data API. They do not download, extract, scrape, or rehost YouTube media.

Get the connected YouTube channel:

```text
GET /api/v1/youtube/channel
```

List the user's YouTube playlists:

```text
GET /api/v1/youtube/playlists
```

List videos in a YouTube playlist:

```text
GET /api/v1/youtube/playlists/:playlistId/videos
```

Search YouTube videos:

```text
GET /api/v1/youtube/search?q=music&maxResults=10
```

All YouTube Data API routes require:

```text
Authorization: Bearer your_jwt_token
```

If the saved access token expires, the backend refreshes it with the saved refresh token. If no refresh token is available, reconnect the YouTube account.

## Unified Search API

The unified search endpoint is designed for multiple official platform integrations later. In the MVP, only YouTube video search is supported.

Search:

```text
GET /api/v1/search?q=music&platform=YOUTUBE&contentType=VIDEO&maxResults=10
```

Optional query parameters:

- `platform`
- `contentType`
- `duration`
- `sort`
- `language`
- `category`
- `maxResults`
- `pageToken`

If `platform` is missing, the backend defaults to YouTube. Unsupported platforms return:

```text
This platform is not supported in MVP yet.
```

Get search history:

```text
GET /api/v1/search/history
```

Clear search history:

```text
DELETE /api/v1/search/history
```

All unified search routes require:

```text
Authorization: Bearer your_jwt_token
```

## Library API

Library routes require a logged-in user and this header:

```text
Authorization: Bearer your_jwt_token
```

TB81TUBE stores content metadata only. Videos are not downloaded, extracted, or hosted by the backend. Local playlists are TB81TUBE app playlists and do not modify YouTube playlists.

Favorites:

```text
POST /api/v1/favorites
GET /api/v1/favorites
DELETE /api/v1/favorites/:contentItemId
```

Watch history:

```text
POST /api/v1/history
GET /api/v1/history
DELETE /api/v1/history
```

Local playlists:

```text
POST /api/v1/playlists
GET /api/v1/playlists
GET /api/v1/playlists/:id
PATCH /api/v1/playlists/:id
DELETE /api/v1/playlists/:id
POST /api/v1/playlists/:id/items
DELETE /api/v1/playlists/:id/items/:contentItemId
```

Detailed curl and PowerShell examples are in:

```text
docs/API_TESTING.md
```

## Curl Testing Examples

Register:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Login:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Get current user:

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer your_jwt_token"
```

## Database Models

The MVP schema includes:

- `User`
- `ConnectedAccount`
- `ContentItem`
- `Playlist`
- `PlaylistItem`
- `Favorite`
- `WatchHistory`
- `SearchHistory`

Enums:

- `Platform`
- `ContentType`
- `PlaybackType`

The schema is designed for YouTube first and future official platform integrations later.

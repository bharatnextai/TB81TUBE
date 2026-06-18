# TB81TUBE API Testing Guide

Use this guide to test the TB81TUBE backend authentication flow and YouTube account connection.

## Prerequisites

Make sure these are ready first:

- PostgreSQL is running.
- `apps/backend/.env` has a valid `DATABASE_URL` and `JWT_SECRET`.
- Prisma migrations have been applied.
- Backend server is running at `http://localhost:4000`.

From the project root:

```powershell
docker compose up -d postgres
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run dev -w @tb81tube/backend
```

Before testing register/login, PostgreSQL must be running and the Prisma migration must be applied. If you see this error:

```text
Can't reach database server at `localhost:5432`
```

Run:

```powershell
docker compose up -d postgres
npm.cmd run db:migrate -w @tb81tube/backend
```

For YouTube account connection, also configure Google OAuth in `apps/backend/.env`:

```env
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/v1/connections/youtube/callback"
FRONTEND_URL="http://localhost:8081"
```

YouTube OAuth cannot work until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are added to `apps/backend/.env` and the backend is restarted.

Do not put credentials only in `.env.example`. Create or update the real file:

```text
apps/backend/.env
```

After saving `.env`, stop and restart the backend:

```text
Ctrl+C
```

```powershell
npm.cmd run dev -w @tb81tube/backend
```

For older Expo web setups, `FRONTEND_URL` may also be:

```env
FRONTEND_URL="http://localhost:19006"
```

## Google OAuth Credential Setup

Create official Google OAuth credentials before testing YouTube connection:

1. Open Google Cloud Console.
2. Create or select a project.
3. Enable YouTube Data API v3.
4. Configure the OAuth consent screen.
5. Create an OAuth Client ID for a web application.
6. Add this authorized redirect URI:

```text
http://localhost:4000/api/v1/connections/youtube/callback
```

The required redirect URI must exactly match `http://localhost:4000/api/v1/connections/youtube/callback`.

You can check whether the running backend loaded Google OAuth configuration with:

```http
GET http://localhost:4000/api/v1/status/config
```

Expected OAuth booleans after setup:

```json
{
  "success": true,
  "data": {
    "devMockYouTubeAuthEnabled": false,
    "googleClientIdConfigured": true,
    "googleClientIdLooksValid": true,
    "googleClientSecretConfigured": true,
    "googleRedirectUriConfigured": true
  }
}
```

## Development Mock YouTube Connection

To continue app development without Google OAuth credentials, set this in `apps/backend/.env`:

```env
DEV_MOCK_YOUTUBE_AUTH=true
```

Then restart the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

This lets the mobile `Continue with Google` button mark YouTube as connected for development only.

Warning: mock mode does not fetch real YouTube videos, playlists, or account data. Real YouTube features require Google OAuth credentials.

With mock mode enabled, `GET /api/v1/status/config` should include:

```json
{
  "devMockYouTubeAuthEnabled": true,
  "googleClientIdConfigured": false,
  "googleClientIdLooksValid": false,
  "googleClientSecretConfigured": false,
  "googleRedirectUriConfigured": true
}
```

## Mock YouTube API Testing

When `DEV_MOCK_YOUTUBE_AUTH=true`, YouTube API routes return development mock data instead of calling Google APIs.

Login first and use your JWT token. Then test:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/channel" `
  -Headers @{ Authorization = "Bearer $token" }
```

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/playlists" `
  -Headers @{ Authorization = "Bearer $token" }
```

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/search?q=music" `
  -Headers @{ Authorization = "Bearer $token" }
```

Expected result: mock channel, playlist, and video data should return while mock mode is enabled. Mock mode does not fetch real YouTube videos, playlists, or account data.

Required scopes:

- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

## A. Health Check

Endpoint:

```http
GET http://localhost:4000/health
```

Expected response:

```json
{
  "success": true,
  "message": "TB81TUBE backend is running"
}
```

curl:

```bash
curl http://localhost:4000/health
```

PowerShell:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/health"
```

## B. API Status

Endpoint:

```http
GET http://localhost:4000/api/v1/status
```

Expected response:

```json
{
  "success": true,
  "message": "API v1 is active"
}
```

curl:

```bash
curl http://localhost:4000/api/v1/status
```

PowerShell:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/v1/status"
```

## C. Register

Endpoint:

```http
POST http://localhost:4000/api/v1/auth/register
```

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

curl:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

PowerShell:

```powershell
$registerBody = @{
  name = "Test User"
  email = "test@example.com"
  password = "password123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/auth/register" `
  -ContentType "application/json" `
  -Body $registerBody
```

Note: If `test@example.com` already exists, use a different email address.

## D. Login

Endpoint:

```http
POST http://localhost:4000/api/v1/auth/login
```

Body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

curl:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

PowerShell:

```powershell
$loginBody = @{
  email = "test@example.com"
  password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody

$token = $login.data.token
$token
```

Copy the token value for the next request.

## E. Get Current User

Endpoint:

```http
GET http://localhost:4000/api/v1/auth/me
```

Header:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

curl:

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer $token" }
```

## Full PowerShell Auth Flow

This registers a user, logs in, saves the JWT, and calls `/auth/me`.

```powershell
$email = "test_$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@example.com"

$registerBody = @{
  name = "Test User"
  email = $email
  password = "password123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/auth/register" `
  -ContentType "application/json" `
  -Body $registerBody

$loginBody = @{
  email = $email
  password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody

$token = $login.data.token

Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer $token" }
```

## Automated Auth Smoke Test

The backend also includes a small smoke test script.

From the project root:

```powershell
npm.cmd run test:auth -w @tb81tube/backend
```

The script will:

- Register a test user with a unique email.
- Login as that user.
- Call `/api/v1/auth/me` using the returned JWT.
- Print a clear success or failure message.

## YouTube Connection Test

First login and save your JWT token:

```powershell
$loginBody = @{
  email = "test@example.com"
  password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody

$token = $login.data.token
```

Start the YouTube OAuth flow:

curl:

```bash
curl http://localhost:4000/api/v1/connections/youtube/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
$start = Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/connections/youtube/start" `
  -Headers @{ Authorization = "Bearer $token" }

$start.data.url
```

Open the returned URL in your browser, complete Google login, and approve the requested scopes. Google should redirect back to:

```text
http://localhost:19006/connected-accounts?youtube=connected
```

If you are testing the mobile app with Expo web, set `FRONTEND_URL` to `http://localhost:8081`. If you are testing with Expo Go on a physical phone, OAuth may finish on a browser page. Return to the app and tap **Refresh** on the Connected Accounts screen.

Check connected accounts:

curl:

```bash
curl http://localhost:4000/api/v1/connections \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/connections" `
  -Headers @{ Authorization = "Bearer $token" }
```

Disconnect a connected account:

curl:

```bash
curl -X DELETE http://localhost:4000/api/v1/connections/CONNECTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "http://localhost:4000/api/v1/connections/CONNECTION_ID" `
  -Headers @{ Authorization = "Bearer $token" }
```

The connected accounts response does not return Google access tokens or refresh tokens.

## YouTube OAuth Mobile Manual Test

Use this flow to test the mobile Connected Accounts screen:

1. Login to TB81TUBE.
2. Open `Connected Accounts`.
3. Click `Connect YouTube`.
4. Google login page opens.
5. Login with a Google/YouTube account.
6. Approve the requested permissions.
7. Return to TB81TUBE.
8. Tap `Refresh`.
9. YouTube should show connected.

TB81TUBE does not collect or store Google passwords. Users enter credentials only on Google's official OAuth page. The frontend must not expose access tokens or refresh tokens.

To test disconnect:

1. Tap `Disconnect`.
2. Tap `Refresh`.
3. Confirm YouTube shows `Not connected`.

If Google OAuth fails:

- Check `GOOGLE_CLIENT_ID` in `apps/backend/.env`.
- Check that `GOOGLE_CLIENT_ID` is real, complete, and ends with `.apps.googleusercontent.com`.
- Check `GOOGLE_CLIENT_SECRET` in `apps/backend/.env`.
- Check that `GOOGLE_CLIENT_SECRET` is in the correct field.
- Check that the credential type is **Web application**.
- Check the redirect URI in Google Cloud Console.
- Required redirect URI: `http://localhost:4000/api/v1/connections/youtube/callback`.
- Restart the backend after changing `.env`.
- Make sure the user is logged in before connecting YouTube.
- Make sure `FRONTEND_URL` is set for your Expo web URL, usually `http://localhost:8081`.

If Google shows `Client missing a project id` or `Error 401: invalid_client`, the most common cause is that the Client Secret was pasted into `GOOGLE_CLIENT_ID`, the Client ID is incomplete, or the OAuth credential was not created as a Web Application.

## YouTube Data API Tests

These tests require a logged-in TB81TUBE user with a connected YouTube account.

Recommended order:

1. Login to TB81TUBE and get a JWT.
2. Connect YouTube using `GET /api/v1/connections/youtube/start`.
3. Open the returned OAuth URL and complete Google login.
4. Check connected accounts using `GET /api/v1/connections`.
5. Test the YouTube Data API routes below.

### Get YouTube Channel

curl:

```bash
curl http://localhost:4000/api/v1/youtube/channel \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/channel" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Get YouTube Playlists

curl:

```bash
curl http://localhost:4000/api/v1/youtube/playlists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
$playlists = Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/playlists" `
  -Headers @{ Authorization = "Bearer $token" }

$playlists.data
```

### Get Videos From a Playlist

Replace `PLAYLIST_ID` with a playlist id returned from `/api/v1/youtube/playlists`.

curl:

```bash
curl http://localhost:4000/api/v1/youtube/playlists/PLAYLIST_ID/videos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/playlists/PLAYLIST_ID/videos" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Search YouTube Videos

curl:

```bash
curl "http://localhost:4000/api/v1/youtube/search?q=music&maxResults=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/search?q=music&maxResults=10" `
  -Headers @{ Authorization = "Bearer $token" }
```

Optional pagination:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/youtube/search?q=music&maxResults=10&pageToken=NEXT_PAGE_TOKEN" `
  -Headers @{ Authorization = "Bearer $token" }
```

The YouTube Data API responses never include saved OAuth access tokens or refresh tokens.

## Unified Search API Tests

The unified search endpoint is the main app search API. For the MVP, it searches YouTube only.

Before testing:

1. Login to TB81TUBE and get a JWT.
2. Make sure the YouTube account is connected.
3. Make sure YouTube Data API calls work.

### Search With Default Platform

If `platform` is missing, the backend defaults to YouTube.

curl:

```bash
curl "http://localhost:4000/api/v1/search?q=music" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/search?q=music" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Search YouTube Explicitly

curl:

```bash
curl "http://localhost:4000/api/v1/search?q=music&platform=YOUTUBE&contentType=VIDEO&maxResults=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
$search = Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/search?q=music&platform=YOUTUBE&contentType=VIDEO&maxResults=10" `
  -Headers @{ Authorization = "Bearer $token" }

$search.data.items
$search.data.nextPageToken
```

### Get Search History

curl:

```bash
curl http://localhost:4000/api/v1/search/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/search/history" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Clear Search History

curl:

```bash
curl -X DELETE http://localhost:4000/api/v1/search/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "http://localhost:4000/api/v1/search/history" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Unsupported Platform Example

For now, platforms other than YouTube are not enabled.

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/search?q=music&platform=SPOTIFY" `
  -Headers @{ Authorization = "Bearer $token" }
```

Expected message:

```text
This platform is not supported in MVP yet.
```

## Library Feature Tests

Library routes require a registered and logged-in user.

Required header for every library route:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

TB81TUBE stores metadata only. Content items are not downloaded, extracted, or hosted by TB81TUBE. Local playlists are app playlists only and do not modify YouTube playlists.

Use this sample content item for the examples below:

```json
{
  "contentItem": {
    "platform": "YOUTUBE",
    "contentType": "VIDEO",
    "externalContentId": "youtube_video_id",
    "title": "Video title",
    "description": "Video description",
    "thumbnailUrl": "https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg",
    "creatorName": "Channel name",
    "duration": null,
    "sourceUrl": "https://www.youtube.com/watch?v=youtube_video_id",
    "playbackType": "EMBEDDED_PLAYER"
  }
}
```

PowerShell setup:

```powershell
$contentBody = @{
  contentItem = @{
    platform = "YOUTUBE"
    contentType = "VIDEO"
    externalContentId = "youtube_video_id"
    title = "Video title"
    description = "Video description"
    thumbnailUrl = "https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg"
    creatorName = "Channel name"
    duration = $null
    sourceUrl = "https://www.youtube.com/watch?v=youtube_video_id"
    playbackType = "EMBEDDED_PLAYER"
  }
} | ConvertTo-Json -Depth 5
```

### Favorites

#### Add Favorite

Purpose: Save a content item as a favorite for the logged-in user.

Method and URL:

```http
POST http://localhost:4000/api/v1/favorites
```

Expected response:

```json
{
  "success": true,
  "message": "Favorite saved successfully",
  "data": {
    "id": "...",
    "contentItem": {}
  }
}
```

curl:

```bash
curl -X POST http://localhost:4000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"contentItem\":{\"platform\":\"YOUTUBE\",\"contentType\":\"VIDEO\",\"externalContentId\":\"youtube_video_id\",\"title\":\"Video title\",\"description\":\"Video description\",\"thumbnailUrl\":\"https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg\",\"creatorName\":\"Channel name\",\"duration\":null,\"sourceUrl\":\"https://www.youtube.com/watch?v=youtube_video_id\",\"playbackType\":\"EMBEDDED_PLAYER\"}}"
```

PowerShell:

```powershell
$favorite = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/favorites" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $contentBody

$contentItemId = $favorite.data.contentItem.id
```

#### Get Favorites

Purpose: Return the logged-in user's favorites with content item details.

Method and URL:

```http
GET http://localhost:4000/api/v1/favorites
```

Expected response:

```json
{
  "success": true,
  "message": "Favorites fetched successfully",
  "data": []
}
```

curl:

```bash
curl http://localhost:4000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/favorites" `
  -Headers @{ Authorization = "Bearer $token" }
```

#### Delete Favorite

Purpose: Remove one favorite by ContentItem database id.

Method and URL:

```http
DELETE http://localhost:4000/api/v1/favorites/:contentItemId
```

Expected response:

```json
{
  "success": true,
  "message": "Favorite removed successfully"
}
```

curl:

```bash
curl -X DELETE http://localhost:4000/api/v1/favorites/CONTENT_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "http://localhost:4000/api/v1/favorites/$contentItemId" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Watch History

#### Save Watch History

Purpose: Save or update watch progress for a content item.

Method and URL:

```http
POST http://localhost:4000/api/v1/history
```

Example JSON body:

```json
{
  "contentItem": {
    "platform": "YOUTUBE",
    "contentType": "VIDEO",
    "externalContentId": "youtube_video_id",
    "title": "Video title",
    "description": "Video description",
    "thumbnailUrl": "https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg",
    "creatorName": "Channel name",
    "duration": null,
    "sourceUrl": "https://www.youtube.com/watch?v=youtube_video_id",
    "playbackType": "EMBEDDED_PLAYER"
  },
  "progressSeconds": 0
}
```

Expected response:

```json
{
  "success": true,
  "message": "Watch history saved successfully",
  "data": {
    "id": "...",
    "progressSeconds": 0,
    "contentItem": {}
  }
}
```

curl:

```bash
curl -X POST http://localhost:4000/api/v1/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"contentItem\":{\"platform\":\"YOUTUBE\",\"contentType\":\"VIDEO\",\"externalContentId\":\"youtube_video_id\",\"title\":\"Video title\",\"description\":\"Video description\",\"thumbnailUrl\":\"https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg\",\"creatorName\":\"Channel name\",\"duration\":null,\"sourceUrl\":\"https://www.youtube.com/watch?v=youtube_video_id\",\"playbackType\":\"EMBEDDED_PLAYER\"},\"progressSeconds\":0}"
```

PowerShell:

```powershell
$historyBody = @{
  contentItem = @{
    platform = "YOUTUBE"
    contentType = "VIDEO"
    externalContentId = "youtube_video_id"
    title = "Video title"
    description = "Video description"
    thumbnailUrl = "https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg"
    creatorName = "Channel name"
    duration = $null
    sourceUrl = "https://www.youtube.com/watch?v=youtube_video_id"
    playbackType = "EMBEDDED_PLAYER"
  }
  progressSeconds = 0
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/history" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $historyBody
```

#### Get Watch History

Purpose: Return latest watch history first.

Method and URL:

```http
GET http://localhost:4000/api/v1/history
```

Expected response:

```json
{
  "success": true,
  "message": "Watch history fetched successfully",
  "data": []
}
```

curl:

```bash
curl http://localhost:4000/api/v1/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/history" `
  -Headers @{ Authorization = "Bearer $token" }
```

#### Clear Watch History

Purpose: Delete all watch history for the logged-in user.

Method and URL:

```http
DELETE http://localhost:4000/api/v1/history
```

Expected response:

```json
{
  "success": true,
  "message": "Watch history cleared successfully"
}
```

curl:

```bash
curl -X DELETE http://localhost:4000/api/v1/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "http://localhost:4000/api/v1/history" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Local Playlists

Local playlists belong to TB81TUBE only. These routes do not create, update, or delete YouTube playlists.

#### Create Playlist

Purpose: Create a local playlist for the logged-in user.

Method and URL:

```http
POST http://localhost:4000/api/v1/playlists
```

Example JSON body:

```json
{
  "name": "My Playlist",
  "description": "My saved videos"
}
```

Expected response:

```json
{
  "success": true,
  "message": "Playlist created successfully",
  "data": {
    "id": "...",
    "name": "My Playlist"
  }
}
```

curl:

```bash
curl -X POST http://localhost:4000/api/v1/playlists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"My Playlist\",\"description\":\"My saved videos\"}"
```

PowerShell:

```powershell
$playlistBody = @{
  name = "My Playlist"
  description = "My saved videos"
} | ConvertTo-Json

$playlist = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/playlists" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $playlistBody

$playlistId = $playlist.data.id
```

#### Get Playlists

Purpose: Return all local playlists for the logged-in user.

Method and URL:

```http
GET http://localhost:4000/api/v1/playlists
```

Expected response:

```json
{
  "success": true,
  "message": "Playlists fetched successfully",
  "data": []
}
```

curl:

```bash
curl http://localhost:4000/api/v1/playlists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/playlists" `
  -Headers @{ Authorization = "Bearer $token" }
```

#### Get One Playlist

Purpose: Return one local playlist with playlist items and content item details.

Method and URL:

```http
GET http://localhost:4000/api/v1/playlists/:id
```

Expected response:

```json
{
  "success": true,
  "message": "Playlist fetched successfully",
  "data": {
    "id": "...",
    "items": []
  }
}
```

curl:

```bash
curl http://localhost:4000/api/v1/playlists/PLAYLIST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/api/v1/playlists/$playlistId" `
  -Headers @{ Authorization = "Bearer $token" }
```

#### Update Playlist

Purpose: Update the playlist name or description.

Method and URL:

```http
PATCH http://localhost:4000/api/v1/playlists/:id
```

Example JSON body:

```json
{
  "name": "Updated Playlist Name",
  "description": "Updated description"
}
```

Expected response:

```json
{
  "success": true,
  "message": "Playlist updated successfully",
  "data": {
    "id": "...",
    "name": "Updated Playlist Name"
  }
}
```

curl:

```bash
curl -X PATCH http://localhost:4000/api/v1/playlists/PLAYLIST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Updated Playlist Name\",\"description\":\"Updated description\"}"
```

PowerShell:

```powershell
$updatePlaylistBody = @{
  name = "Updated Playlist Name"
  description = "Updated description"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Patch `
  -Uri "http://localhost:4000/api/v1/playlists/$playlistId" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $updatePlaylistBody
```

#### Add Playlist Item

Purpose: Add a content item to a local playlist. Duplicate playlist items are prevented.

Method and URL:

```http
POST http://localhost:4000/api/v1/playlists/:id/items
```

Example JSON body: use the sample `contentItem` body shown above.

Expected response:

```json
{
  "success": true,
  "message": "Playlist item added successfully",
  "data": {
    "id": "...",
    "contentItem": {}
  }
}
```

curl:

```bash
curl -X POST http://localhost:4000/api/v1/playlists/PLAYLIST_ID/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"contentItem\":{\"platform\":\"YOUTUBE\",\"contentType\":\"VIDEO\",\"externalContentId\":\"youtube_video_id\",\"title\":\"Video title\",\"description\":\"Video description\",\"thumbnailUrl\":\"https://img.youtube.com/vi/youtube_video_id/hqdefault.jpg\",\"creatorName\":\"Channel name\",\"duration\":null,\"sourceUrl\":\"https://www.youtube.com/watch?v=youtube_video_id\",\"playbackType\":\"EMBEDDED_PLAYER\"}}"
```

PowerShell:

```powershell
$playlistItem = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/v1/playlists/$playlistId/items" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $contentBody

$playlistContentItemId = $playlistItem.data.contentItem.id
```

#### Remove Playlist Item

Purpose: Remove one item from a local playlist by ContentItem database id.

Method and URL:

```http
DELETE http://localhost:4000/api/v1/playlists/:id/items/:contentItemId
```

Expected response:

```json
{
  "success": true,
  "message": "Playlist item removed successfully"
}
```

curl:

```bash
curl -X DELETE http://localhost:4000/api/v1/playlists/PLAYLIST_ID/items/CONTENT_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "http://localhost:4000/api/v1/playlists/$playlistId/items/$playlistContentItemId" `
  -Headers @{ Authorization = "Bearer $token" }
```

#### Delete Playlist

Purpose: Delete a local playlist that belongs to the logged-in user.

Method and URL:

```http
DELETE http://localhost:4000/api/v1/playlists/:id
```

Expected response:

```json
{
  "success": true,
  "message": "Playlist deleted successfully"
}
```

curl:

```bash
curl -X DELETE http://localhost:4000/api/v1/playlists/PLAYLIST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "http://localhost:4000/api/v1/playlists/$playlistId" `
  -Headers @{ Authorization = "Bearer $token" }
```

# TB81TUBE Platform Connector Architecture

TB81TUBE uses a backend connector architecture so every media platform can be integrated through official APIs and returned to the mobile app in a unified format.

## Core Rule

The backend handles platform connections. The mobile app calls the TB81TUBE backend only.

The mobile app must not:

- Scrape platforms.
- Store provider access tokens.
- Call private platform APIs directly.
- Download, proxy, extract, or rehost third-party media.

## Flow

1. User logs in to TB81TUBE.
2. User connects a platform from Connected Accounts.
3. Backend completes the official OAuth/login flow.
4. Backend stores encrypted platform tokens.
5. Backend refreshes tokens when required.
6. Backend calls official platform APIs.
7. Backend returns unified content items to mobile.
8. Mobile renders content and uses the official allowed playback method.

## Unified Content Format

Every connector should return content items shaped like:

```json
{
  "platform": "YOUTUBE",
  "contentType": "VIDEO",
  "externalContentId": "video_id",
  "title": "Video title",
  "description": "Description",
  "thumbnailUrl": "thumbnail_url",
  "creatorName": "Creator",
  "duration": "PT5M20S",
  "sourceUrl": "https://...",
  "playbackType": "EMBEDDED_PLAYER"
}
```

Playback types:

- `EMBEDDED_PLAYER`: official embed/player inside TB81TUBE.
- `SDK_PLAYER`: official platform SDK playback.
- `EXTERNAL_LINK`: open source platform/app when internal playback is not allowed.

## Connector Interface

The backend connector contract lives in:

```text
apps/backend/src/modules/platforms/connectors/platformConnector.ts
```

Every platform connector must implement:

- `connect`
- `refreshToken`
- `getProfile`
- `getPlaylists`
- `getPlaylistItems`
- `search`
- `getPlaybackInfo`

## Current Connectors

Working connector:

- `YouTubeConnector`
  - File: `apps/backend/src/modules/platforms/connectors/youtube.connector.ts`
  - Uses official Google OAuth and YouTube Data API.
  - Returns `EMBEDDED_PLAYER` playback info for YouTube videos.

Placeholder connectors:

- `JioSaavnConnector`
- `AmazonMusicConnector`
- `AirtelWynkConnector`
- `SpotifyConnector`

Placeholder connectors return:

```text
Official API access or playback SDK is required before enabling this platform.
```

## Platform Rules

### YouTube

- Fetch channel, playlists, playlist videos, and search results through YouTube Data API.
- Play video using the official YouTube embed/player approach.
- Do not download or extract YouTube media.

### Music Platforms

- Connect only if official login/API/SDK access is available.
- If full playback is not allowed, return metadata and `EXTERNAL_LINK`.
- If an official playback SDK is allowed, return `SDK_PLAYER`.
- Do not scrape or bypass platform restrictions.

## Adding A Future Connector

1. Confirm official API or SDK access exists.
2. Confirm provider terms allow the intended metadata and playback use.
3. Create a connector implementing `PlatformConnector`.
4. Register it in `connectorRegistry.ts`.
5. Normalize content into the unified content format.
6. Return correct `playbackType`.
7. Keep tokens encrypted and backend-only.
8. Add tests and manual QA notes.

Do not enable a connector until the official integration path is clear.

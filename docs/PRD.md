# Product Requirement Document

# TB81TUBE

## 1. Project Overview

TB81TUBE is a unified audio/video media app. Users create a TB81TUBE account, connect permitted media accounts, browse videos/audio/playlists returned by the backend, and play supported content through each platform's official allowed playback method.

The product is backend-led by design. The mobile app must not scrape platforms or directly fetch private platform data. The backend owns connected account APIs, token storage, token refresh, platform-specific API calls, and response normalization. The mobile app calls TB81TUBE backend APIs and receives a unified content format.

The long-term product vision is a unified entertainment hub for multiple platforms:

- YouTube
- JioSaavn
- Amazon Music
- Airtel/Wynk Music
- Spotify or other officially supported platforms

The MVP version focuses only on YouTube. YouTube metadata must come from the official YouTube Data API, and YouTube playback must use the official YouTube player/embed approach.

TB81TUBE must not download, extract, scrape, proxy, cache, or rehost third-party media.

### Product Purpose

The purpose of TB81TUBE is to give users one compliant app for discovering, playing, saving, and organizing permitted media from connected accounts.

Main user flow:

1. User registers or logs in to TB81TUBE.
2. User connects media accounts from Connected Accounts.
3. Backend stores connected account tokens securely.
4. Backend fetches permitted data from connected platforms through official APIs.
5. Mobile app displays fetched videos, audio, playlists, favorites, and history.
6. User plays video/audio using the official allowed playback method for that platform.

Playback types:

- `EMBEDDED_PLAYER`: play inside TB81TUBE using an official embed/player.
- `SDK_PLAYER`: play inside TB81TUBE using an official platform SDK.
- `EXTERNAL_LINK`: open the source platform/app when internal playback is not allowed.

Unified content response shape:

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

## 2. Problem Statement

Users often watch videos, listen to music, and save entertainment content across multiple services. Their saved content, playlists, watch history, and discovery workflows are split between apps.

TB81TUBE aims to solve this by giving users one app where they can:

- Connect official entertainment accounts.
- Search supported content.
- Play media through official provider playback.
- Save favorites.
- Create local playlists inside TB81TUBE.
- View watch history.

The main challenge is building this experience while respecting each provider's API rules, copyright policies, playback restrictions, and user data policies.

## 3. Target Users

### Guest User

A user who opens the app but has not signed up or logged in.

Needs:

- Understand the app purpose.
- Create an account.
- Log in.

Limitations:

- Cannot save favorites.
- Cannot create playlists.
- Cannot view watch history.
- Cannot connect YouTube.

### Registered User

A user who has signed up and logged in but has not connected YouTube.

Needs:

- Manage profile and session.
- Connect YouTube through Google OAuth.
- See connected accounts status.

Limitations:

- Cannot access account-specific YouTube data until YouTube is connected.

### YouTube-Connected User

A logged-in user who has connected YouTube through Google OAuth.

Needs:

- Fetch YouTube channel data.
- Search YouTube videos.
- View YouTube playlists.
- Play YouTube videos with the official player.
- Save favorite videos.
- Create local TB81TUBE playlists.
- View watch history.
- Disconnect YouTube.

### Future Multi-Platform User

A user who connects multiple official entertainment accounts.

Future needs:

- Search across supported platforms.
- See all connected providers.
- Save content from supported platforms.
- Play each item using official provider playback.

This user type is not part of the MVP implementation.

## 4. Main Goal

The main goal of the MVP is to validate the core product loop using YouTube only:

1. User signs up or logs in.
2. User connects YouTube with Google OAuth.
3. User searches YouTube videos.
4. User plays a selected video using the official YouTube player/embed.
5. User saves favorites, creates local playlists, and builds watch history.

The MVP should prove that users want a clean, compliant app for discovering, playing, and organizing entertainment content without violating provider rules.

## 5. MVP Scope

The MVP includes:

- User signup and login.
- JWT-based app authentication.
- YouTube account connection using Google OAuth.
- Fetching YouTube channel data.
- YouTube video search.
- YouTube search filters.
- Fetching YouTube playlists.
- Fetching YouTube playlist videos.
- YouTube video playback using official YouTube player/embed.
- Local playlists inside TB81TUBE.
- Favorite videos.
- Watch history.
- Connected accounts page.
- Profile page.
- Modular backend architecture so future official providers can be added later.

## 6. Out-of-Scope for MVP

The MVP must not include:

- JioSaavn integration.
- Amazon Music integration.
- Airtel/Wynk Music integration.
- Spotify integration.
- Cross-platform search.
- Offline playback.
- YouTube video downloads.
- YouTube audio extraction.
- Background YouTube audio playback unless officially supported by the chosen player and terms.
- Media file storage on TB81TUBE servers.
- Media proxying or transcoding.
- Custom or unofficial YouTube player.
- YouTube playlist modification.
- Social features such as comments, following, or direct messages.
- Creator upload tools.
- Paid subscriptions.
- Admin dashboard.
- Advanced recommendation engine.

Unsupported platforms should show a clear message:

```text
Official API access or playback SDK is required before enabling this platform.
```

## 7. Main Screens

### Splash Screen

Purpose:

- Check whether the user has a saved session.
- Route to authentication or the main app.

### Signup Screen

Purpose:

- Allow a new user to create a TB81TUBE account.

Fields:

- Name
- Email
- Password

Requirements:

- Validate inputs.
- Hash password on backend.
- Show clear validation errors.

### Login Screen

Purpose:

- Allow existing users to log in.

Fields:

- Email
- Password

Requirements:

- Show safe error messages for invalid credentials.
- Store JWT securely on the mobile app.

### Home Screen

Purpose:

- Provide a YouTube-style home feed and app entry point.

Sections:

- Search bar.
- Connected platform shortcut row.
- Recently watched.
- Favorites.
- YouTube playlists.
- Recommended placeholder section.

### Search Screen

Purpose:

- Let users search YouTube videos.

Features:

- Search input.
- Filter chips.
- Result list.
- Content cards with thumbnail, title, creator, platform badge, and duration.

### Player Screen

Purpose:

- Play a selected YouTube video using the official YouTube player/embed.

Features:

- Official player.
- Video title.
- Creator name.
- Platform badge.
- Add to favorites.
- Add to local playlist.
- Share.
- Open on YouTube.

### Library Screen

Purpose:

- Show saved and recent user activity.

Sections:

- Watch History.
- Favorites.
- Connected Accounts.
- Local Playlists.

### Playlists Screen

Purpose:

- Manage local TB81TUBE playlists.

Features:

- Show user-created playlists.
- Create playlist.
- Edit playlist name.
- Delete playlist.
- Open playlist details.

### Playlist Details Screen

Purpose:

- Show videos saved inside a local playlist.

Features:

- List playlist items.
- Open video in Player Screen.
- Remove item from playlist.

### Connected Accounts Screen

Purpose:

- Show connected provider accounts.

MVP:

- YouTube connection status.
- Connect YouTube.
- Disconnect YouTube.

Future placeholders:

- JioSaavn.
- Amazon Music.
- Airtel/Wynk Music.
- Spotify.

### Profile Screen

Purpose:

- Show user profile and account actions.

Features:

- User name and email.
- Logout.
- Link to connected accounts.

## 8. User Flow

### New User Flow

1. User opens app.
2. Splash screen checks for token.
3. User lands on signup/login.
4. User creates an account.
5. Backend creates user and returns JWT.
6. App stores JWT securely.
7. User enters main app.

### YouTube Connection Flow

1. User opens Connected Accounts.
2. User taps Connect YouTube.
3. Backend generates Google OAuth URL.
4. User completes Google OAuth through official Google flow.
5. Backend handles callback.
6. Backend stores encrypted OAuth tokens.
7. App shows YouTube as connected.

### Search and Playback Flow

1. User opens Search.
2. User enters a query and optional filters.
3. Mobile app calls backend search API.
4. Backend calls YouTube Data API.
5. Results return in unified content format.
6. User taps a video.
7. Player screen opens.
8. Video plays with official YouTube player/embed.
9. Backend saves watch history.

### Save Content Flow

1. User opens a video.
2. User taps Add to Favorites or Add to Playlist.
3. Backend upserts the content item metadata.
4. Backend saves favorite or playlist item.
5. User can view saved content in Library or Playlists.

### Logout Flow

1. User opens Profile.
2. User taps Logout.
3. App removes stored JWT.
4. User returns to Login screen.

## 9. Feature List

### Authentication

- Register user.
- Login user.
- Persist JWT on mobile.
- Auto-login if token exists.
- Logout.
- Protected backend routes.

### YouTube Connection

- Start Google OAuth.
- Handle OAuth callback.
- Save connected account.
- Encrypt access and refresh tokens.
- Disconnect account and remove stored tokens.

### YouTube Data

- Fetch connected user's channel.
- Fetch connected user's playlists.
- Fetch videos from a playlist.
- Search YouTube videos.
- Apply filters where supported by YouTube Data API.

### Playback

- Play YouTube videos only through official YouTube player/embed.
- Open original YouTube URL.
- Share official source URL.

### Library

- Save favorites.
- View favorites.
- Save watch history.
- View watch history.
- Clear watch history.

### Local Playlists

- Create local playlist.
- View playlists.
- Edit playlist name.
- Delete playlist.
- Add video to playlist.
- Remove video from playlist.

### Connected Accounts

- Show YouTube status.
- Show future provider placeholders.
- Connect/disconnect YouTube.

## 10. Backend Requirements

Backend must provide:

- Node.js and Express API.
- TypeScript.
- PostgreSQL database.
- Prisma ORM.
- JWT authentication.
- Password hashing with bcrypt.
- Google OAuth for YouTube connection.
- YouTube Data API service.
- Modular platform connector architecture.
- Zod input validation.
- Consistent API response format.
- Error handling middleware.
- Rate limiting.
- Helmet security headers.
- Strict CORS configuration.
- Privacy-friendly logging.
- Token encryption at rest.

Required API groups:

- Auth routes.
- Connections routes.
- YouTube routes.
- Unified search route.
- Favorites routes.
- Watch history routes.
- Local playlist routes.

Backend must never expose OAuth access tokens or refresh tokens to the mobile client.

## 11. Frontend Requirements

Frontend must provide:

- React Native Expo mobile app.
- TypeScript.
- Bottom tab navigation.
- Stack navigation for auth, player, connected accounts, and playlist details.
- Secure JWT storage using SecureStore where available.
- Axios API client.
- Clean YouTube-style interface.
- Reusable UI components:
  - ContentCard.
  - SearchBar.
  - FilterChips.
  - PlatformBadge.
  - EmptyState.
  - LoadingState.
- Loading states.
- Error states.
- Validation messages.
- Logout flow.

Frontend must not directly call YouTube APIs with private credentials. All protected YouTube account operations should go through the backend.

## 12. Database Requirements

Database should support these core entities:

### User

- id
- name
- email
- passwordHash
- profileImage
- createdAt
- updatedAt

### ConnectedAccount

- id
- userId
- platform
- platformUserId
- encrypted accessToken
- encrypted refreshToken
- tokenExpiry
- scope
- createdAt
- updatedAt

### ContentItem

- id
- platform
- externalContentId
- title
- description
- thumbnailUrl
- creatorName
- duration
- contentType
- sourceUrl
- playbackType
- createdAt
- updatedAt

### Playlist

- id
- userId
- name
- description
- createdAt
- updatedAt

### PlaylistItem

- id
- playlistId
- contentItemId
- addedAt

### Favorite

- id
- userId
- contentItemId
- createdAt

### WatchHistory

- id
- userId
- contentItemId
- watchedAt
- progressSeconds

### SearchHistory

- id
- userId
- query
- filtersJson
- createdAt

Recommended enums:

- Platform: YOUTUBE, JIOSAAVN, AMAZON_MUSIC, AIRTEL_WYNK, SPOTIFY
- ContentType: VIDEO, AUDIO
- PlaybackType: EMBEDDED_PLAYER, EXTERNAL_LINK, SDK_PLAYER

## 13. API Integration Requirements

### YouTube

Must use:

- Google OAuth 2.0.
- YouTube Data API v3.
- Official YouTube player/embed.

MVP YouTube API use cases:

- Fetch user's channel.
- Fetch user's playlists.
- Fetch playlist items.
- Search videos.
- Fetch video metadata where needed.

Recommended OAuth scope:

```text
https://www.googleapis.com/auth/youtube.readonly
```

Search response should use a unified content format:

- platform.
- contentType.
- externalContentId.
- title.
- thumbnailUrl.
- creatorName.
- duration.
- playbackType.
- sourceUrl.

### Future Platforms

Future integrations must require official support:

- Official login API.
- Official metadata API.
- Official playback SDK/player/API.
- Clear provider terms allowing the intended use.

No unsupported provider should be enabled through scraping or unofficial APIs.

Platform behavior:

- YouTube: fetch channel, videos, playlists, playlist items, and search results through YouTube Data API. Play videos using official YouTube embed/player.
- Music platforms: connect only when official API/SDK access is available. If full playback is not allowed, show permitted metadata and open the official platform/app with `EXTERNAL_LINK`.
- Future platforms: use the same backend connector architecture and return the same unified content format.

Required connector methods:

- `connect`
- `refreshToken`
- `getProfile`
- `getPlaylists`
- `getPlaylistItems`
- `search`
- `getPlaybackInfo`

## 14. Security Requirements

Authentication:

- Passwords must be hashed.
- JWT must be required for protected routes.
- JWT secret must not be committed.

Token security:

- External provider tokens must be encrypted before database storage.
- Refresh tokens must not be sent to the mobile app.
- Access tokens must not be logged.
- Disconnecting an account must delete stored provider tokens.

API security:

- Validate route params, query params, and request bodies.
- Add rate limiting.
- Use Helmet.
- Use strict CORS allowlist.
- Avoid logging sensitive query strings.

User privacy:

- Store only required user data.
- Provide account deletion capability.
- Provide clear privacy policy before launch.
- Use minimal OAuth scopes.

## 15. Legal/Compliance Notes

TB81TUBE must follow these rules:

- Do not download YouTube videos.
- Do not extract YouTube audio.
- Do not scrape YouTube or other provider content.
- Do not rehost third-party media.
- Do not proxy third-party media streams.
- Do not bypass ads, DRM, region restrictions, login restrictions, or subscription restrictions.
- Use only official APIs and official players.
- Respect each platform's terms and copyright policy.
- Keep provider branding and playback behavior intact where required.
- Do not modify YouTube playlists in the MVP.
- Do not claim ownership of third-party content.

Before public launch:

- Publish privacy policy.
- Publish terms and conditions.
- Configure Google OAuth consent screen.
- Review YouTube API Services Terms.
- Review Google API Services User Data Policy.
- Review each future provider's API and SDK terms before integration.

## 16. Future Roadmap

### Provider Expansion

- Add JioSaavn only if official API or SDK access is available.
- Add Amazon Music only if official API or SDK access is available.
- Add Airtel/Wynk Music only if official API or SDK access is available.
- Add Spotify or other supported platforms through official APIs.

### Product Improvements

- Cross-platform search.
- Cross-platform local playlists where permitted.
- Better recommendations based on permitted user data.
- Recently searched section.
- Continue watching section.
- Playlist item ordering.
- Playlist sharing.
- Improved empty states and loading skeletons.

### Account and Privacy

- User data export.
- Better account deletion confirmation.
- OAuth token revocation with providers where supported.
- Clear all search history.
- Clear all favorites.

### Quality and Operations

- End-to-end tests.
- Production monitoring.
- Error reporting.
- Analytics that respect privacy.
- Accessibility improvements.
- Localization.
- App store release preparation.

## 17. Success Criteria

The MVP is successful when:

- Users can sign up and log in.
- Users can connect YouTube through Google OAuth.
- Users can fetch YouTube channel data.
- Users can search YouTube videos.
- Users can apply basic search filters.
- Users can view YouTube playlists.
- Users can play YouTube videos with the official player/embed.
- Users can save favorite videos.
- Users can create and manage local playlists.
- Users can see watch history.
- Users can manage connected accounts.
- Users can view and use the profile page.
- Protected backend routes require authentication.
- OAuth tokens are stored securely.
- No YouTube video or audio is downloaded, extracted, scraped, proxied, cached, or rehosted.
- Manual testing passes on Android.
- Typecheck and backend tests pass.

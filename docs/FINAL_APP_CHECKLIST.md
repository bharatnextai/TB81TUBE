# TB81TUBE Final App Checklist

Use this checklist before considering TB81TUBE ready for a public or production-style build.

## Backend And API

- Backend deployed.
- Backend is hosted and reachable over HTTPS.
- Hosted backend health check works at `/health`.
- Hosted database migration is applied.
- Database hosted.
- Mobile app uses the hosted backend API URL, not `localhost`.
- Mobile `EXPO_PUBLIC_API_BASE_URL` points to the hosted backend.
- PostgreSQL is hosted and backed up.
- CORS allows only approved app/web origins.
- Secrets are stored in environment variables, not committed files.
- Connected platform tokens are encrypted at rest.
- Mobile app calls TB81TUBE backend for connected account data.
- Mobile app does not scrape or directly fetch private platform data.

## Connected Platforms

- Real Google OAuth credentials are configured for YouTube.
- `DEV_MOCK_YOUTUBE_AUTH=false` in release environments.
- YouTube Data API v3 is enabled.
- OAuth consent screen is configured.
- Required test or production users are allowed.
- Future platforms are enabled only with official API/SDK support.
- Unsupported platforms remain disabled or show a clear official-access-required message.

## Playback And Media Policy

- YouTube playback uses official YouTube embed/player.
- SDK playback uses official provider SDKs only.
- External-link playback opens official platform URLs/apps when internal playback is not allowed.
- No YouTube video/audio is downloaded.
- No audio is extracted from YouTube.
- No third-party media is rehosted, proxied, cached, or redistributed.
- No scraping or unofficial platform bypass is used.

## Mobile Build

- Android package is `com.tb81tube.app`.
- App name is `TB81TUBE`.
- Version is correct for the release.
- API URL points to hosted backend for testers outside local Wi-Fi.
- APK tested against hosted backend.
- APK installed on phone.
- Android build tested on a real device.
- 16 KB page-size compatibility checked on final EAS APK/AAB.

## Product QA

- Register/login works.
- Register/login tested from APK.
- Connected Accounts works.
- Search works with connected platform data.
- Player opens with official allowed playback method.
- Favorites work.
- Watch history works.
- Local playlists work.
- Search/player/library/playlists tested from APK.
- Home screen reflects connected accounts and saved activity.
- Friendly error and empty states appear.

## Legal

- Privacy policy is ready.
- Terms and conditions are ready.
- Google API Services User Data Policy reviewed.
- YouTube API Services Terms reviewed.
- Platform-specific terms reviewed before enabling each future connector.

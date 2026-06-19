# TB81TUBE Android Build Guide

This guide prepares TB81TUBE for Android development and preview test builds with Expo EAS. Do not use this as a Play Store release checklist yet.

## A) Requirements

- Expo account.
- EAS CLI.
- Node.js LTS 20 or 22 recommended.
- Project dependencies installed with `npm.cmd install`.
- Backend must be reachable from the Android device for login and app APIs.
- For local MVP testing, PostgreSQL and the backend should be running.

## B) Install EAS CLI

```powershell
npm install -g eas-cli
```

Verify the command is available:

```powershell
eas --version
```

If you do not want to install EAS CLI globally, use the `npx` form:

```powershell
npx eas-cli build --platform android --profile preview
```

### Windows Troubleshooting

If Windows shows this error:

```text
'eas' is not recognized as an internal or external command,
operable program or batch file.
```

Fix:

1. Install EAS CLI globally:
   ```powershell
   npm install -g eas-cli
   ```
2. Close and reopen Command Prompt or PowerShell so PATH refreshes.
3. Verify:
   ```powershell
   eas --version
   ```

## C) Login

```powershell
eas login
```

## D) Configure EAS

From the mobile app folder:

```powershell
cd apps/mobile
eas build:configure
```

The project includes `apps/mobile/eas.json` with these profiles:

- `development`: internal APK-style development build profile.
- `preview`: internal APK build for testers. It builds APK and uses `https://tb81tube.onrender.com/api/v1`.
- `production`: app bundle profile for later release preparation.

## E) Build Preview APK

From `apps/mobile`:

```powershell
eas build --platform android --profile preview
```

The current working APK should be built with the preview profile and a clean EAS cache:

```powershell
cd apps/mobile
eas build --platform android --profile preview --clear-cache
```

This APK uses the hosted Render API:

```env
EXPO_PUBLIC_API_BASE_URL=https://tb81tube.onrender.com/api/v1
```

Alternative without global install:

```powershell
npx eas-cli build --platform android --profile preview
```

Or from the project root:

```powershell
npm.cmd run build:mobile:android:preview
```

## Production-Oriented Preview APK Steps

Use these steps when the APK should talk to a hosted backend instead of local development.

1. Deploy the backend first.
2. Confirm backend health:
   ```text
   https://tb81tube.onrender.com/health
   ```
3. Confirm API status:
   ```text
   https://tb81tube.onrender.com/api/v1/status
   ```
4. Confirm the preview EAS profile uses the hosted backend:
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://tb81tube.onrender.com/api/v1
   ```
5. Run typecheck:
   ```powershell
   npm.cmd run typecheck
   ```
6. Build preview APK:
   ```powershell
   cd apps/mobile
   eas build --platform android --profile preview
   ```

For production users outside your local Wi-Fi, the backend must be hosted online.

## Backend API URL For APK Testing

For APK testing on a physical phone, `localhost` will not work because it points to the phone itself.

For normal users and preview APK testing, use the hosted Render backend:

```env
EXPO_PUBLIC_API_BASE_URL=https://tb81tube.onrender.com/api/v1
```

For local Wi-Fi testing, use your computer LAN IP in `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

For testing outside your local Wi-Fi, the backend must be deployed and reachable over HTTPS:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
```

Restart Expo or rebuild after changing environment variables.

## Mock YouTube Mode

Development mock YouTube is backend-only:

```env
DEV_MOCK_YOUTUBE_AUTH=true
```

Mock mode lets testers exercise connection, search, player, favorites, history, playlists, and Home flows without real Google OAuth credentials.

Warning: do not upload a production APK/AAB using mock YouTube mode. Mock mode is only for development and internal MVP testing.

## Real YouTube Login For Release

Before release or external production testing:

```env
DEV_MOCK_YOUTUBE_AUTH=false
GOOGLE_CLIENT_ID="your_web_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URI="https://your-api-domain.com/api/v1/connections/youtube/callback"
```

Then test real Google OAuth end to end. Keep `GOOGLE_CLIENT_SECRET` only in the backend `.env`.

## YouTube Media Rules

- Do not download YouTube videos.
- Do not extract YouTube audio.
- Do not scrape YouTube pages.
- Do not rehost or proxy third-party media.
- Use YouTube Data API for metadata.
- Use official YouTube embed/player approach for playback.

## Android 16 KB Page-Size Note

If a 16 KB page-size compatibility warning appears in Expo Go, it may come from Expo Go native libraries rather than the TB81TUBE app code.

For production readiness, test the final EAS APK/AAB separately from Expo Go. Before Play Store release, verify Android compatibility on target Android versions and devices.

## Before Building

Run:

```powershell
npm.cmd run typecheck
npm.cmd run db:check -w @tb81tube/backend
```

Then complete the MVP checklist:

```text
docs/MVP_TESTING_CHECKLIST.md
```

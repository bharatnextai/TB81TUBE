# TB81TUBE Mobile

React Native Expo mobile app foundation for TB81TUBE.

This stage includes navigation, theme files, reusable base components, authentication, and connected account foundations.

## Tech Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Native stack navigation
- Bottom tabs navigation
- Axios
- Expo SecureStore
- React Native Safe Area Context
- React Native Screens

## Folder Structure

```text
src/
  components/
  config/
  navigation/
  screens/
    auth/
    main/
  services/
  store/
  theme/
  types/
  utils/
```

## Backend URL

The default backend API URL is:

```text
http://localhost:4000/api/v1
```

It is configured in:

```text
src/config/api.ts
```

Full mobile environment setup guide:

```text
docs/MOBILE_ENV_SETUP.md
```

You can override it with an Expo environment variable:

```powershell
copy apps\mobile\.env.example apps\mobile\.env
```

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

For Expo web, `localhost` works because the app runs in your computer browser. Restart Expo after changing `.env`.

For Android emulator testing, `localhost` points to the emulator itself. Use this value when connecting APIs later:

```text
http://10.0.2.2:4000/api/v1
```

For a physical Android device, use your computer's LAN IP address, for example:

```text
http://192.168.1.10:4000/api/v1
```

For Expo Go on a physical phone, `localhost` will not point to your computer. Use your computer LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

## YouTube OAuth Notes

The mobile Connected Accounts screen uses the backend OAuth starter route and opens the official Google OAuth URL with `expo-web-browser`.

Keep the Google OAuth redirect URI configured as:

```text
http://localhost:4000/api/v1/connections/youtube/callback
```

For local Expo web testing, the backend `FRONTEND_URL` can be:

```env
FRONTEND_URL=http://localhost:8081
```

For Expo Go on a physical phone, OAuth may finish in the browser instead of jumping directly back into the app. Return to TB81TUBE and tap **Refresh** on the Connected Accounts screen.

## Development Mock YouTube Connection

To continue app development without Google OAuth credentials, set this in `apps/backend/.env`:

```env
DEV_MOCK_YOUTUBE_AUTH=true
```

Then restart the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

This lets the `Continue with Google` button mark YouTube as connected for development only.

Warning: mock mode does not fetch real YouTube videos, playlists, or account data. Real YouTube features require Google OAuth credentials.

## Start Expo App

From the project root:

```powershell
npm.cmd run dev:mobile
```

Equivalent workspace command:

```powershell
npm.cmd run dev -w @tb81tube/mobile
```

## Test On Web

1. Start the backend:
   ```powershell
   npm.cmd run dev:backend
   ```
2. Start Expo:
   ```powershell
   npm.cmd run dev:mobile
   ```
3. Press `w` in the Expo terminal, or open the Expo web URL shown in the terminal.
4. For web testing, this API URL works:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
   ```

## Test On Expo Go

1. Make sure your phone and computer are on the same network.
2. Set `apps/mobile/.env` to your computer LAN IP:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
   ```
3. Restart Expo after changing `.env`.
4. Scan the Expo QR code with Expo Go.

`localhost` does not work from a physical phone because it points to the phone itself, not your computer.

Or from `apps/mobile`:

```powershell
npm.cmd run start
```

## Run Backend

Start the backend before testing mobile authentication:

```powershell
docker compose up -d postgres
npm.cmd run db:check -w @tb81tube/backend
npm.cmd run dev -w @tb81tube/backend
```

The mobile app calls:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

## Network Error Troubleshooting

If register or login shows `Network Error`:

1. Open this URL in your browser:

```text
http://localhost:4000/api/v1/status
```

2. Check the backend terminal is running.
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
6. For Expo Go on a physical phone, use your computer LAN IP instead of `localhost`, for example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

## Test Authentication

1. Start the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

2. Start the mobile app:

```powershell
npm.cmd run dev -w @tb81tube/mobile
```

3. Open the app in Expo.
4. Tap `Go to Register`.
5. Enter name, email, and password.
6. Tap `Create account`.

## Test Search With Mock YouTube

1. Login to TB81TUBE.
2. Set `DEV_MOCK_YOUTUBE_AUTH=true` in `apps/backend/.env`.
3. Restart the backend.
4. Open `Profile` -> `Connected Accounts`.
5. Tap `Continue with Google` to connect mock YouTube.
6. Open the `Search` tab.
7. Search for `music`, or tap `Try music`.
8. Confirm result cards appear.

## Test Player From Search

1. Login to TB81TUBE.
2. Connect mock YouTube from `Profile` -> `Connected Accounts`.
3. Open the `Search` tab.
4. Search for `music`.
5. Click a result card.
6. Confirm `PlayerScreen` opens with the selected video details.
7. If the result has a valid YouTube ID, confirm the embedded player appears.
8. If the result has a mock or invalid ID, confirm the placeholder appears.
9. Tap `Open on YouTube` and confirm the browser opens.
10. Tap `Add to Favorites` and confirm `Added to favorites`.
11. Watch history is saved silently when the player screen opens.

The player uses a responsive 16:9 YouTube layout so the embedded player stays correctly sized on Expo web and mobile.

## Test Library

1. Login to TB81TUBE.
2. Connect mock YouTube from `Profile` -> `Connected Accounts`.
3. Search for a video.
4. Open `PlayerScreen`.
5. Tap `Add to Favorites`.
6. Go to `Library`.
7. Confirm the item appears in `Favorites`.
8. Open a video again.
9. Confirm the item appears in `Watch History`.
10. Tap `Clear history` and confirm it disappears.

## Test Local Playlists

1. Login to TB81TUBE.
2. Open the `Playlists` tab.
3. Create a playlist with a name and optional description.
4. Open `Search` and search for a video.
5. Open `PlayerScreen`.
6. Tap `Add to Playlist`.
7. Select the playlist and confirm `Added to playlist`.
8. Open the `Playlists` tab.
9. Open the playlist.
10. Confirm the video appears.
11. Remove the video.
12. Go back and delete the playlist.

## Test Home Screen

1. Login to TB81TUBE.
2. Connect mock YouTube from `Profile` -> `Connected Accounts`.
3. Search for a video.
4. Open `PlayerScreen`.
5. Tap `Add to Favorites`.
6. Add the video to a local playlist.
7. Go to `Home`.
8. Confirm `Continue Watching`, `Favorites`, and `Your Playlists` show data.
9. Go to `Profile`.
10. Confirm your name and email are shown.
11. Tap `Logout`.
12. Confirm the app returns to the login screen.

Login can be tested with the same email and password after logout.

## MVP Feature Checklist

- Authentication: register, login, restore session, and logout.
- Connected Accounts: connect mock YouTube, refresh status, disconnect, and keep developer details hidden by default.
- Search: search `music`, use filter chips, open a result.
- Player: responsive 16:9 YouTube area, watch history save, add to favorites, add to playlist, and open source URL.
- Library: view watch history, favorites, local playlists, refresh, and clear history.
- Playlists: create playlist, open playlist detail, add video from PlayerScreen, remove video, and delete playlist.
- Home: confirm YouTube status, Continue Watching, Favorites, Your Playlists, Quick Search, and Refresh.

Quick MVP test path:

1. Register or login.
2. Connect mock YouTube from `Profile` -> `Connected Accounts`.
3. Search for `music`.
4. Open a result in `PlayerScreen`.
5. Add it to Favorites.
6. Create a playlist and add the video to it.
7. Check `Home`, `Library`, and `Playlists` show the saved activity.

## Node Version

This project is aligned to Expo SDK 52. Use Node.js LTS 20 or 22 for the most reliable Expo/Metro behavior.

Node.js 24 can cause Expo or Metro compatibility issues. If `expo start` fails with Metro package export errors, switch to Node LTS 20 or 22 with nvm-windows, then run:

```powershell
npm.cmd install
```

## Clean Install

Normal install:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run dev -w @tb81tube/mobile
```

## Expo Dependency Safety

TB81TUBE mobile currently uses Expo SDK 52:

```text
expo@52.x
react-native@0.76.9
expo-secure-store@14.0.1
expo-web-browser@14.0.1
react-native-safe-area-context@4.12.0
react-native-screens@4.4.0
```

Avoid running `npm audit fix --force` on this Expo project. It can upgrade or downgrade packages outside Expo's supported SDK version set and create peer dependency conflicts. Use Expo-compatible package versions instead.

When Expo shows compatibility warnings, prefer the expected Expo SDK version range instead of installing random latest versions. For Expo SDK 52, keep packages such as `@expo/vector-icons` and `expo-web-browser` on the versions Expo expects.

`@expo/vector-icons` requires `expo-font`. Keep `expo-font` installed with the Expo SDK-compatible version so native and web bundling can resolve icon fonts correctly.

If `npm audit fix` reports peer dependency conflicts around Expo packages, do not accept random latest versions. Keep the packages aligned to Expo SDK 52 and run a normal install:

```powershell
npm.cmd install
npm.cmd run typecheck
```

Security audit notes are documented in:

```text
docs/SECURITY_AUDIT.md
```

In this npm workspace, Metro `0.81.5` is intentionally available at the workspace root so the Expo SDK 52 CLI can resolve its expected Metro internals. Do not upgrade Metro to `0.84.x` unless the Expo SDK is upgraded through the official Expo upgrade path.

If Metro or Expo still resolves the wrong package after dependency changes, do a clean reinstall from the project root:

```cmd
rmdir /s /q node_modules
del package-lock.json
npm.cmd install
npm.cmd run typecheck
npm.cmd run dev -w @tb81tube/mobile
```

## Run on Android

Start Metro:

```powershell
npm.cmd run dev:mobile
```

Then press `a` in the Expo terminal to open Android, or run:

```powershell
npm.cmd run android -w @tb81tube/mobile
```

Make sure an Android emulator is running or a device is connected with USB debugging enabled.

## Android EAS Test Build

Android EAS build setup is documented in:

```text
docs/ANDROID_BUILD.md
```

Mobile API environment setup is documented in:

```text
docs/MOBILE_ENV_SETUP.md
```

Install EAS CLI:

```powershell
npm install -g eas-cli
eas --version
```

If Windows says `'eas' is not recognized`, close and reopen PowerShell after installing, then run `eas --version` again.

Login to Expo:

```powershell
eas login
```

Preview APK build from the mobile folder:

```powershell
cd apps/mobile
eas build --platform android --profile preview
```

Alternative without global install:

```powershell
npx eas-cli build --platform android --profile preview
```

Equivalent npm script from the project root:

```powershell
npm.cmd run build:mobile:android:preview
```

Important: an installed APK on a physical phone cannot use `localhost` for the backend. Use your computer LAN IP for local Wi-Fi testing:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

For testing outside local Wi-Fi, deploy the backend and use the deployed API URL.

Do not upload a production APK/AAB using backend mock mode. `DEV_MOCK_YOUTUBE_AUTH=true` is only for development and internal MVP testing.

## Typecheck

From the project root:

```powershell
npm.cmd run typecheck -w @tb81tube/mobile
```

The root workspace command also works:

```powershell
npm.cmd run typecheck
```

## Current Navigation

- Logged out users see `AuthNavigator`.
- Register and Login call the backend auth APIs.
- Logged in users see `MainTabNavigator`.
- Profile includes Connected Accounts and Logout actions.

Bottom tabs:

- Home
- Search
- Library
- Playlists
- Profile

## Legal Playback Note

PlayerScreen uses an official YouTube embed/player-compatible approach for valid YouTube IDs. TB81TUBE must not download, extract, proxy, or rehost YouTube video or audio.

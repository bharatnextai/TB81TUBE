# TB81TUBE MVP Testing Checklist

Use this checklist before sharing the MVP build with testers. The current recommended path uses development mock YouTube mode so app flows can be tested without real Google OAuth credentials.

## A) Setup

- Start PostgreSQL:
  ```powershell
  docker compose up -d postgres
  ```
- Check database connectivity:
  ```powershell
  npm.cmd run db:check -w @tb81tube/backend
  ```
- Start backend:
  ```powershell
  npm.cmd run dev:backend
  ```
- Start mobile:
  ```powershell
  npm.cmd run dev:mobile
  ```
- Confirm backend status opens:
  ```text
  http://localhost:4000/api/v1/status
  ```

## B) Auth

- Register a new user.
- Logout.
- Login again with the same user.
- Reload the app and confirm the session restores.
- Confirm invalid email/password shows a friendly error.

## C) Connected Accounts

- Set `DEV_MOCK_YOUTUBE_AUTH=true` in `apps/backend/.env`.
- Restart backend after changing `.env`.
- Open `Profile` -> `Connected Accounts`.
- Connect mock YouTube.
- Confirm status shows connected.
- Tap Refresh status.
- Disconnect mock YouTube.
- Confirm status returns to not connected.
- Confirm developer details are hidden by default.

## D) Search

- Search `music`.
- Search `latest hindi songs`.
- Try empty search and confirm validation appears.
- Confirm result cards show title, creator, platform, and content type.
- Tap a result and confirm it opens PlayerScreen.
- If YouTube is not connected, confirm a friendly connection message appears.

## E) Player

- Confirm PlayerScreen opens from Search.
- Confirm the Back button works.
- Confirm valid YouTube IDs show the embedded player.
- Confirm invalid/mock IDs show the preview placeholder.
- Tap Add to Favorites and confirm success.
- Tap Add to Playlist and confirm the playlist picker opens.
- Tap Open on YouTube when `sourceUrl` exists and confirm the browser opens.
- Confirm watch history saves silently.

## F) Library

- Open Library after watching a video.
- Confirm History appears.
- Confirm Favorites appear after saving a favorite.
- Clear history and confirm it disappears.
- Confirm empty states work for history, favorites, and playlists.
- Tap Refresh and confirm it stops loading after success or failure.

## G) Playlists

- Create a playlist.
- Search for a video.
- Open PlayerScreen.
- Add the video to the playlist.
- Open playlist detail.
- Confirm the video appears.
- Remove the video.
- Confirm empty playlist detail says no videos yet.
- Delete the playlist.
- Confirm the playlist list updates.

## H) Home

- Confirm connected account status is shown.
- Confirm Continue Watching shows recent history.
- Confirm Favorites shows saved videos.
- Confirm Your Playlists shows local playlists.
- Tap a playlist card and confirm it opens playlist detail.
- Tap Quick Search chips and confirm they navigate to Search.
- Tap Refresh and confirm loading stops after success or failure.

## Pass Criteria

- No screen gets stuck in a loading state.
- User-facing errors are short and friendly.
- No access tokens, refresh tokens, Google client secrets, or passwords are shown in the app.
- No YouTube video or audio is downloaded, extracted, proxied, or rehosted.
- Playback uses the official YouTube embed/player approach only.

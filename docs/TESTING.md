# Manual Testing Checklist

Use this checklist before shipping a demo build or merging major MVP changes.

## Setup

- Backend is running with `npm run dev -w @tb81tube/backend`.
- Mobile app is running with `npm run start -w @tb81tube/mobile`.
- PostgreSQL is running and migrations are applied.
- `.env` contains valid Google OAuth and YouTube Data API values.
- Test user account is available or can be created from the app.

## YouTube Login

- Open the app and log in with a valid app account.
- Go to Profile or Connected Accounts.
- Tap Connect YouTube.
- Complete Google OAuth in the official Google consent flow.
- Confirm the app returns to the connected state.
- Confirm Connected Accounts shows YouTube as connected.
- Confirm the YouTube channel/account name appears when available.
- Disconnect YouTube and confirm the account returns to not connected.

## YouTube Search

- Go to Search.
- Search for a common query such as `lofi`.
- Confirm results load from the backend.
- Confirm each result shows thumbnail, title, creator, platform badge, and duration when available.
- Try filters: Video, YouTube, Recent, Long, and Short.
- Confirm empty or invalid searches show a friendly message.
- Confirm unsupported platforms are not enabled unless an official API or SDK is configured.

## Video Playback

- Open a YouTube search result.
- Confirm the Player screen opens.
- Confirm playback uses the official YouTube player/embed.
- Confirm the app does not download, extract, proxy, or rehost video/audio.
- Tap Open on YouTube and confirm it opens the original YouTube URL.
- Tap Share and confirm the shared link is the official source URL.

## Favorites

- Open a video in Player.
- Tap Add to Favorites.
- Go to Library.
- Confirm the video appears in Favorites.
- Open the favorite from Library and confirm it navigates back to Player.

## Playlists

- Go to Playlists.
- Create a new local playlist.
- Rename the playlist.
- Open the playlist detail screen.
- Add a video to the playlist from Player.
- Confirm the video appears in the playlist detail screen.
- Remove the video from the playlist.
- Delete the playlist and confirm it disappears.
- Confirm local playlist actions do not modify YouTube playlists.

## Watch History

- Open a video in Player.
- Return to Home or Library.
- Confirm the video appears in Recently Watched or Watch History.
- Clear watch history from Library.
- Confirm history is empty after refresh.

## Logout

- Go to Profile.
- Tap Logout.
- Confirm the app returns to the Login screen.
- Close and reopen the app.
- Confirm the previous session does not auto-login after logout.

# TB81TUBE Mobile Environment Setup

The mobile app reads its backend API URL from:

```env
EXPO_PUBLIC_API_BASE_URL
```

The fallback in code is:

```text
http://localhost:4000/api/v1
```

Configuration lives in:

```text
apps/mobile/.env
```

Use `apps/mobile/.env.example` as the template.

## Local Web

Expo web runs in your computer browser, so `localhost` points to your computer.

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

## Expo Go On Physical Phone

Expo Go runs on your phone. `localhost` points to the phone, not your computer.

Use your computer LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

Make sure:

- Phone and computer are on the same Wi-Fi.
- Backend is running on the computer.
- Firewall allows the phone to reach the backend port.
- Expo is restarted after changing `.env`.

## Android APK Local Testing

An installed APK also cannot use `localhost` for your computer backend.

For local Wi-Fi testing, use LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

Then rebuild the APK so the environment value is included.

## Preview APK With Render Backend

The hosted Render backend is:

```text
https://tb81tube.onrender.com
```

The EAS `preview` profile is configured to use:

```env
EXPO_PUBLIC_API_BASE_URL=https://tb81tube.onrender.com/api/v1
```

This means preview APK builds use the hosted Render backend instead of `localhost`.

## Production APK

For a final user app, the backend must be hosted online.

Use the hosted backend URL:

```env
EXPO_PUBLIC_API_BASE_URL=https://tb81tube.onrender.com/api/v1
```

Before building:

- Deploy backend.
- Confirm `/health` works.
- Confirm `/api/v1/status` works.
- Set mobile env to the hosted backend.
- Run typecheck.
- Build APK with EAS.

## Quick Check

If register/login shows a network error:

1. Open the API status URL from the same device/browser.
2. Confirm the backend is running or hosted.
3. Confirm `EXPO_PUBLIC_API_BASE_URL` includes `/api/v1`.
4. Restart Expo or rebuild the APK after env changes.

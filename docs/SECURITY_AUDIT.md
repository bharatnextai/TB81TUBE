# TB81TUBE Security Audit Notes

TB81TUBE currently uses Expo SDK 52 for the mobile app.

## Current Expo SDK Alignment

The mobile app is intentionally pinned to Expo SDK 52-compatible package versions:

```text
expo@52.0.49
react@18.3.1
react-native@0.76.9
expo-secure-store@14.0.1
expo-web-browser@14.0.1
expo-linking@7.0.5
@expo/metro-config@0.19.12
metro@0.81.5
react-native-safe-area-context@4.12.0
react-native-screens@4.4.0
```

Do not replace these with random latest versions. Expo packages must stay aligned with the installed Expo SDK.

## npm Audit Guidance

Do not run:

```powershell
npm.cmd audit fix --force
```

`npm audit fix --force` can install breaking versions such as newer Metro or Expo CLI packages that are not compatible with Expo SDK 52. That can break `expo start`, including errors around internal Metro files such as:

```text
metro/src/lib/TerminalReporter
```

Some audit warnings come from Expo, React Native, Metro, or development tooling. These packages are part of the Expo-managed stack and should be upgraded through an Expo SDK upgrade, not by force-installing unrelated latest versions.

## Safe Audit Process

Use this safer process during MVP development:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run dev -w @tb81tube/mobile
```

If `npm audit` reports vulnerabilities, review them manually before changing package versions. Prefer:

- Expo-compatible package versions.
- Official Expo upgrade guidance.
- Targeted updates that do not change Expo SDK compatibility.
- Deferring development-tool-only audit warnings until a planned release hardening pass.

## Production Review

Before production release, perform a dedicated security review:

- Review all `npm audit` findings.
- Separate runtime production dependencies from development tooling warnings.
- Upgrade Expo through an official SDK upgrade path if needed.
- Re-test Android builds, OAuth, API calls, and YouTube playback policy compliance.
- Confirm no third-party media is downloaded, extracted, proxied, or hosted by TB81TUBE.

## Node Version

Use Node.js LTS 20 or 22 for Expo SDK 52.

Node.js 24 may work for some commands, but Expo and Metro can be unstable on Node 24. If Metro errors appear, switch to Node LTS 20 or 22 with nvm-windows and reinstall dependencies.

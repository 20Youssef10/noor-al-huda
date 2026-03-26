# Noor Al Huda

Arabic-first Islamic companion app built with Expo on the frontend, Firebase for user data, and Cloudflare Workers for cached public content.

## Workspace

- `apps/mobile` — Expo Router mobile app with Quran, prayer times, azkar, radio, and Firebase sync scaffolding.
- `workers` — Cloudflare Worker API gateway and cache layer.
- `firestore.rules` / `firestore.indexes.json` — deployed Firestore security rules and indexes.

## Firebase

- Project ID: `noor-al-huda-260326`
- Firestore database: `(default)` in `me-central2`
- Web app ID: `1:1024474386791:web:afa7b5df1cde4bfd2adfc2`
- Android package: `com.nooralhuda.app`
- iOS bundle ID: `com.nooralhuda.app`
- Enabled providers: `email/password`, `google.com`, `anonymous`
- Android debug SHA-1: `8F:01:71:4D:D6:9E:90:A0:79:07:90:A0:CF:19:18:A1:DE:E9:73:FE`
- Android debug SHA-256: `EE:DB:B4:7F:D2:F2:C6:25:D0:78:85:F8:F9:B8:83:F7:EB:22:A5:4F:1C:57:86:7E:E5:27:9E:33:61:86:17:E2`
- Android release SHA-1: `A7:5B:D7:98:F9:05:DB:DE:4E:8E:E0:40:46:4F:44:EA:B2:2C:E2:93`
- Android release SHA-256: `03:4E:8C:9E:56:9F:F3:93:26:C6:28:3B:FF:D3:3B:BA:7D:A8:E7:C1:1F:4A:ED:BB:41:A7:62:82:60:06:6B:49`

Note: Firestore is fully provisioned and deployed, and the app is wired for email, Google, and guest login. The current `google-services.json` already includes both debug and release Android OAuth clients.

Local signing material prepared for Android release builds:

- Keystore: `apps/mobile/.credentials/noor-al-huda-upload.jks`
- Local secrets file: `apps/mobile/.credentials/release-keystore.env`
- Local EAS credentials file: `apps/mobile/credentials.json`

## Cloudflare

- Worker name: `noor-al-huda-api`
- Worker URL: `https://noor-al-huda-api.shinzero.workers.dev`
- Vectorize index: `quran-semantic-index` (`768` dims, `cosine`)
- KV namespaces:
  - `PRAYER_CACHE`
  - `QURAN_CACHE`
  - `HADITH_CACHE`
  - `RADIO_LIST`
  - `AZKAR_CACHE`

## Local commands

Mobile app:

```bash
cd apps/mobile
node node_modules/typescript/bin/tsc --noEmit
node node_modules/expo/bin/cli start
```

Mobile automated tests:

```bash
cd apps/mobile
node /data/data/com.termux/files/usr/bin/npm test
node /data/data/com.termux/files/usr/bin/npm run test:firebase
```

Brand assets regeneration:

```bash
cd apps/mobile
python ./scripts/generate_brand_assets.py
```

Production readiness checks:

```bash
cd apps/mobile
PATH="/data/data/com.termux/files/home/Noor-Al-Huda/bin:$PATH" node node_modules/expo-doctor/build/index.js
CI=1 PATH="/data/data/com.termux/files/home/Noor-Al-Huda/bin:$PATH" node node_modules/expo/bin/cli prebuild --platform android --no-install
CI=1 PATH="/data/data/com.termux/files/home/Noor-Al-Huda/bin:$PATH" node node_modules/expo/bin/cli prebuild --platform ios --no-install
```

EAS build command after logging in to Expo:

```bash
cd apps/mobile
PATH="/data/data/com.termux/files/home/Noor-Al-Huda/bin:$PATH" eas login
PATH="/data/data/com.termux/files/home/Noor-Al-Huda/bin:$PATH" eas build --platform android --profile production
```

Worker:

```bash
cd workers
node node_modules/typescript/bin/tsc --noEmit
node node_modules/esbuild/bin/esbuild src/index.ts --bundle --format=esm --platform=browser --target=es2022 --outfile=dist/worker.mjs
node /data/data/com.termux/files/usr/bin/npm test
```

Vectorize seeding and worker deploy:

```bash
cd workers
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... python ./scripts/seed_quran_vectors.py --batch-size 128
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... python ./scripts/deploy_worker.py
```

Firestore deploy:

```bash
node /data/data/com.termux/files/usr/bin/firebase deploy --only firestore --project noor-al-huda-260326
```

## Current app enhancements

- Google sign-in now has staged UX and localized error handling.
- Guest login is restored and works against live Firebase Auth.
- Passwordless email-link auth is added, with deep-link completion support through the Firebase hosted auth domain.
- Password reset and email verification flows are wired into the auth UI.
- Settings and bookmarks now sync through Firestore in real time via `users/{uid}` and `users/{uid}/bookmarks/{bookmarkId}`.
- Quran semantic search is now backed by a seeded Cloudflare Vectorize index.
- Prayer reminders can be scheduled locally for the next prayer.
- A new settings tab shows backend health, build metadata, and account status.
- A feature hub exposes Tajweed Coach, semantic search, dua generation, AR qibla, halal scanning, tracker, ruya journal, group khatm, kids mode, privacy controls, voice commands, and share cards.
- Radio/native audio playback has been migrated to `react-native-track-player` on native platforms.
- Android widget bridge/provider and iOS Widget/Live Activity bridge layers have been added to the native projects.
- Android and iOS native projects were generated with `prebuild` for build readiness checks.
- Custom brand artwork replaced the default Expo visuals in `apps/mobile/assets/` and `apps/mobile/assets/branding/`.

## Verification completed

- Mobile TypeScript passes.
- Mobile Jest suite passes.
- Mobile Firebase integration script passes.
- Worker TypeScript passes.
- Worker automated tests pass.
- Expo Doctor passes `17/17`.
- Web export succeeds.
- Firestore rules were deployed successfully.
- Live Cloudflare worker health endpoint returns `ok: true`.
- Live semantic Quran search endpoint responds from the seeded Vectorize index.
- A live Firebase integration check succeeded for:
  - email/password account creation,
  - email verification request,
  - password reset request,
  - Firestore settings write,
  - Firestore bookmark write.

## Remaining manual step

- Expo/EAS cloud builds still require an Expo account login. `eas build:configure` could not complete in this environment until `eas login` is run.
- The iOS widget files and Live Activity bridge are present, but a dedicated WidgetKit extension target still needs to be fully wired in Xcode for production iOS widget rendering.

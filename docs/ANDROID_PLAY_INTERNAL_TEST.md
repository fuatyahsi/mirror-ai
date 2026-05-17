# Android Play Internal Test Checklist

## Local Release Build

If `apps/mobile/android` is missing, generate the native Android project first:

```powershell
cd apps/mobile
npx expo prebuild --platform android
cd ../..
```

1. Generate an upload key once:

```powershell
.\scripts\generate-android-upload-keystore.ps1
```

This creates ignored local files:

```txt
apps/mobile/android/app/mirrorai-upload.jks
apps/mobile/android/keystore.properties
```

Back these up privately. Do not commit them.

2. Validate the production release configuration:

```powershell
npm run verify:release
```

This check intentionally fails if:

- `apps/mobile/.env` still uses a RevenueCat `test_...` key.
- RevenueCat product ids are missing or do not match `mirror_plus_monthly`, `mirror_plus_yearly`, `mirror_credits_10`.
- `EXPO_PUBLIC_ALLOW_MOCKS=true` is present.
- Server secrets such as `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `REVENUECAT_SECRET_KEY` are placed in the mobile `.env`.
- Android release signing is missing.

3. Build a Play-ready Android App Bundle:

```powershell
.\scripts\build-android-release.ps1 -Type aab
```

Output:

```txt
MirrorAI-release.aab
```

For direct device sideload testing:

```powershell
.\scripts\build-android-release.ps1 -Type apk
```

Output:

```txt
MirrorAI-release.apk
```

## Google Play Console

1. Create the Android app with package name `com.mirrorai.app`.
2. Enable Play App Signing.
3. Upload `MirrorAI-release.aab` to an Internal testing release.
4. Add tester emails and open the tester opt-in link on the test device.
5. Install Mirror AI from Play, not by sideload, when testing Google Play Billing.

## RevenueCat

1. Add a Google Play Android app/provider in RevenueCat.
2. Use the Android production/public SDK key in:

```txt
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
```

3. Keep these product identifiers aligned between Google Play, RevenueCat, and the app:

```txt
mirror_plus_monthly
mirror_plus_yearly
mirror_credits_10
```

Policy alignment:

- `mirror_plus_monthly` and `mirror_plus_yearly` unlock the `mirror_plus` entitlement.
- `mirror_credits_10` grants 10 credits.
- Paid feature costs in backend:
  - Message timing coach: 1 credit or Plus
  - Premium tarot clarifier: 2 credits or Plus
  - Coffee reading: 3 credits or Plus
  - Deep synastry / weekly relationship / deep numerology: 4 credits or Plus
  - Deep birth chart: 10 credits or Plus

4. Keep the default offering identifier:

```txt
default
```

5. Entitlement:

```txt
mirror_plus
```

Release APK/AAB builds intentionally disable RevenueCat if a `test_...` SDK key is used, because the native RevenueCat SDK closes release apps that use Test Store keys.

The build script now also runs `scripts/validate-release-config.ps1` before compiling. For quick non-payment debug builds only, you can bypass this with `-SkipReleaseValidation`, but do not use that for Play Console builds.

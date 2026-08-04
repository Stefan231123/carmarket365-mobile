# Store submission (EAS Submit)

Builds are produced with `eas build` (see `eas.json`). This doc covers **submitting** those builds to the stores. Both stores require a paid account.

## Android → Google Play

**Prerequisites**
1. **Google Play Console** account ($25 one-time) → https://play.google.com/console
2. Create the app in Play Console (package `com.carmarket.app`), and complete the required store listing + Data safety form.
3. Create a **service account** for automated uploads:
   - Play Console → *Setup → API access* → link a Google Cloud project → create a service account → grant it "Release" permissions.
   - Download its **JSON key** and save it to `credentials/google-play-service-account.json` (this folder is git-ignored — never commit it).

**Submit** (uploads the latest production `.aab` to the *internal testing* track as a draft):
```bash
npx eas-cli@latest submit --platform android --profile production
```
Change `track` in `eas.json` (`internal` → `production`) when ready for a full release.

## iOS → App Store

**Prerequisites**
1. **Apple Developer Program** membership ($99/yr) → https://developer.apple.com/programs
2. Create the app record in **App Store Connect** (bundle id `com.carmarket.app`).
3. Build iOS first: `npx eas-cli@latest build --platform ios --profile production` (EAS creates the signing credentials — needs the Apple account).

**Submit** (interactive — prompts for your Apple ID / App Store Connect):
```bash
npx eas-cli@latest submit --platform ios --profile production
```

## Notes
- App version/build numbers auto-increment (`autoIncrement` on the production profile).
- Keep the Android keystore (managed by EAS) — losing it means you can't update the app.
- First submissions to each store go through review (Apple: ~1–3 days; Google: hours–1 day).
